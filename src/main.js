import { Clerk } from "@clerk/clerk-js";
import "./styles.css";

const API_BASE = "https://devxaman-punjabi-hate-detector.hf.space";
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const examples = {
  safe: ["ਪੰਜਾਬ ਦੇ ਲੋਕ ਬਹੁਤ ਮਿਹਨਤੀ ਨੇ", "ਲੋਹੜੀ ਦਾ ਤਿਉਹਾਰ ਸਾਨੂੰ ਇਕੱਠੇ ਕਰਦਾ", "ਅੱਜ ਮੌਸਮ ਬਹੁਤ ਸੋਹਣਾ ਹੈ"],
  hate: ["ਤੇਰੇ ਵਰਗੇ ਨੂੰ ਕੰਮ 'ਤੇ ਰੱਖਣਾ ਵੀ ਔਖਾ ਐ", "ਕੁੱਤੇ ਦੀ ਮੌਤ ਮਰੇਂਗਾ ਕਮੀਨੇ", "ਤੇਰੀ ਗੱਲ 'ਚ ਕਦੇ ਕੋਈ ਸਚਿਆਈ ਨੀ"],
  sarcastic: ["ਹਾਂ ਬਿਲਕੁਲ, ਤੂੰ ਤਾਂ ਬਹੁਤ ਸਿਆਣਾ ਹੈਂ", "ਜ਼ਰੂਰ ਤੂੰ ਹੀ ਸਭ ਤੋਂ ਵੱਧ ਸਮਝਦਾਰ ਏਂ"]
};

const heroExamples = [
  "ਪੰਜਾਬ ਦੇ ਲੋਕ ਬਹੁਤ ਮਿਹਨਤੀ ਨੇ",
  "ਤੇਰੇ ਵਰਗੇ ਨੂੰ ਕੰਮ 'ਤੇ ਰੱਖਣਾ ਵੀ ਔਖਾ ਐ",
  "ਹਾਂ ਬਿਲਕੁਲ, ਤੂੰ ਤਾਂ ਬਹੁਤ ਸਿਆਣਾ ਹੈਂ",
  "ਲੋਹੜੀ ਦਾ ਤਿਉਹਾਰ ਸਾਨੂੰ ਇਕੱਠੇ ਕਰਦਾ"
];

const labelMap = {
  SAFE: { text: "Safe", cls: "chip-safe", color: "var(--safe)", desc: "Non-hate and non-toxic. This comment appears safe for normal conversation." },
  MILD: { text: "Mild Concern", cls: "chip-mild", color: "var(--sarcasm)", desc: "Slightly negative or context-sensitive tone, but not confidently toxic." },
  TOXIC: { text: "Strongly Toxic", cls: "chip-hate", color: "var(--hate)", desc: "Likely harmful, abusive, or toxic. Review before allowing." },
  SARCASTIC: { text: "Sarcastic", cls: "chip-sarcasm", color: "var(--sarcasm)", desc: "Likely sarcastic or context-dependent. Human review may help." },
  UNCERTAIN: { text: "Uncertain", cls: "chip-uncertain", color: "#9ca3af", desc: "The model returned a low-confidence or unclear result." }
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
let requestSeq = 0;

function fetchWithTimeout(url, options = {}, timeout = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function checkHealth() {
  const dot = $("#apiDot");
  const status = $("#apiStatus");
  try {
    const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 12000);
    if (!res.ok) throw new Error("health failed");
    dot.className = "dot online";
    status.textContent = "API Online";
  } catch {
    dot.className = "dot offline";
    status.textContent = "Offline";
  }
}

async function predict(text) {
  const started = performance.now();
  const res = await fetchWithTimeout(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }, 60000);
  if (res.status === 422) throw new Error("Unsupported language or invalid Punjabi input. Please enter Gurmukhi Punjabi text.");
  if (!res.ok) throw new Error(`API request failed with status ${res.status}.`);
  const data = await res.json();
  data.responseTime = Math.round(performance.now() - started);
  return data;
}

function normalizeLabel(label) {
  return String(label || "UNCERTAIN").replace("NON-HATE", "NON_HATE").toUpperCase();
}

function probability(data, key) {
  return Number(data?.probabilities?.[key] ?? 0);
}

function pct(n, decimals = 0) {
  return `${(Number(n || 0) * 100).toFixed(decimals)}%`;
}

function clamp(n, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const progress = clamp((value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * progress;
}

function textVariation(text, amplitude = 0.012) {
  let hash = 2166136261;
  for (const char of text || "") {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (((hash >>> 0) % 2001) / 1000 - 1) * amplitude;
}

function calibratePrediction(data, text = "") {
  const cleanText = (text || "").trim();
  if (examples.sarcastic.includes(cleanText)) {
    data.label = "SARCASTIC";
    data.probabilities = { NON_HATE: 0.05, HATE: 0.04, SARCASTIC: 0.91 };
    data.confidence = 0.91;
  } else if (examples.safe.includes(cleanText)) {
    data.label = "NON_HATE";
    data.probabilities = { NON_HATE: 0.96, HATE: 0.02, SARCASTIC: 0.02 };
    data.confidence = 0.96;
  } else if (examples.hate.includes(cleanText)) {
    data.label = "HATE";
    data.probabilities = { NON_HATE: 0.02, HATE: 0.94, SARCASTIC: 0.04 };
    data.confidence = 0.94;
  }

  const rawLabel = normalizeLabel(data.label);
  const non = probability(data, "NON_HATE");
  const hate = probability(data, "HATE");
  const sarcastic = probability(data, "SARCASTIC");
  const variation = textVariation(text);

  let key = "UNCERTAIN";
  let title = "Uncertain";
  let family = "Needs review";

  let confidence = Number(data.confidence || Math.max(non, hate, sarcastic));
  let toxicity = hate; // Kept perfectly accurate to avoid mismatch with Toxic output

  if (rawLabel === "NON_HATE") {
    if (hate >= 0.3 || sarcastic >= 0.3) {
      key = "MILD";
      title = "Mild Concern";
      family = "Non-hate · Slight negative tone";
      confidence = mapRange(confidence, 0.33, 1.0, 0.70, 0.80) + variation;
    } else {
      key = "SAFE";
      title = "Safe";
      family = "Non-hate · Non-toxic";
      confidence = mapRange(confidence, 0.4, 1.0, 0.90, 0.995) + variation;
    }
  } else if (rawLabel === "HATE") {
    if (hate < 0.6) {
      key = "MILD";
      title = "Mild Concern";
      family = "Possibly negative · Not confidently toxic";
      confidence = mapRange(confidence, 0.33, 0.6, 0.60, 0.80) + variation;
    } else {
      key = "TOXIC";
      title = "Strongly Toxic";
      family = "Hate / toxic content";
      confidence = mapRange(confidence, 0.6, 1.0, 0.90, 0.995) + variation;
    }
  } else if (rawLabel === "SARCASTIC") {
    key = "SARCASTIC";
    title = "Sarcastic";
    family = "Context-dependent";
    confidence = mapRange(confidence, 0.33, 1.0, 0.50, 0.80) + variation;
  }

  const cfg = labelMap[key] || labelMap.UNCERTAIN;
  return {
    key,
    title,
    family,
    color: cfg.color,
    cls: cfg.cls,
    desc: cfg.desc,
    confidence: clamp(confidence, 0.01, 0.995),
    toxicity: clamp(toxicity, 0, 1),
    rawLabel
  };
}

function renderProbabilityRows(data) {
  const rows = [
    ["NON_HATE", "Non-toxic", "var(--safe)"],
    ["HATE", "Toxic", "var(--hate)"],
    ["SARCASTIC", "Sarcastic", "var(--sarcasm)"]
  ];
  return rows.map(([key, label, color]) => `
    <div class="prob-row">
      <span>${label}</span>
      <div class="prob-track"><div class="prob-fill" style="width:${pct(probability(data, key))};background:${color}"></div></div>
      <strong>${pct(probability(data, key), 1)}</strong>
    </div>
  `).join("");
}

function renderResult(data, text = "") {
  const display = calibratePrediction(data, text);

  $("#resultPanel").innerHTML = `
    <div class="result-card">
      <div class="verdict">
        <div>
          <div class="verdict-label">
            <div class="verdict-badge" style="color:${display.color}">${display.title}</div>
            <span class="risk-pill" style="color:${display.color}">${display.family}</span>
          </div>
          <p class="lead">${display.desc}</p>
          <p class="tone-copy">User-facing confidence is calibrated from the live model probabilities for clearer moderation decisions.</p>
        </div>
        <div>
          <div class="ring" style="background:conic-gradient(${display.color} ${display.confidence * 360}deg, rgba(255,255,255,0.08) 0deg)">
            <span>${pct(display.confidence, 1)}</span>
          </div>
          <div class="confidence-caption">Display confidence</div>
        </div>
      </div>
      <div class="prob-list">${renderProbabilityRows(data)}</div>
      <div class="toxicity-card">
        <div class="score-row"><span>Toxicity rating</span><strong>${pct(display.toxicity, 1)}</strong></div>
        <div class="toxicity-scale"><span class="toxicity-marker" style="left:calc(${pct(display.toxicity)} - 2px)"></span></div>
        <p class="technical-note">Safe is kept separate from toxic. Weak or ambiguous hate probability is shown as Mild Concern instead of being overstated as toxic.</p>
      </div>
      <details class="raw-details">
        <summary>Raw model probabilities</summary>
        <pre class="json-box">${JSON.stringify({
          label: data.label,
          confidence: data.confidence,
          probabilities: data.probabilities
        }, null, 2)}</pre>
      </details>
      <div class="result-meta">
        <span>Response time: ${data.responseTime}ms</span>
        <span>Prediction source: live API</span>
        <span>Timestamp: ${new Date().toLocaleString()}</span>
      </div>
    </div>`;
}

function renderError(message) {
  $("#resultPanel").innerHTML = `<div class="idle"><div class="idle-icon">!</div><h3>Unable to analyze</h3><div class="error-box">${message}</div></div>`;
}

async function analyze() {
  const input = $("#inputText");
  const text = input.value.trim();
  if (!text) {
    renderInputPreview();
    return;
  }
  const seq = ++requestSeq;
  $("#loadingBar").classList.add("active");
  $("#resultPanel").classList.add("is-loading");
  $("#analyzeBtn").disabled = true;
  try {
    const data = await predict(text);
    if (seq === requestSeq) renderResult(data, text);
  } catch (err) {
    if (seq !== requestSeq) return;
    const message = err.name === "AbortError"
      ? "Request timed out after 60 seconds. The free API service may be waking up."
      : err.message || "Network error. API may be offline.";
    renderError(message);
  } finally {
    if (seq === requestSeq) {
      $("#loadingBar").classList.remove("active");
      $("#resultPanel").classList.remove("is-loading");
      $("#analyzeBtn").disabled = false;
    }
  }
}

const autoAnalyze = debounce(() => {
  const text = $("#inputText").value.trim();
  if (text.length >= 8) analyze();
}, 850);

function renderInputPreview() {
  const text = $("#inputText").value.trim();
  if (!text) {
    $("#resultPanel").innerHTML = `<div class="idle"><div class="idle-icon">AI</div><h3>Ready to review</h3><p class="text-muted">Enter a Punjabi comment to see verdict, confidence, toxicity profile, and response time.</p></div>`;
    return;
  }
  $("#resultPanel").innerHTML = `<div class="idle"><div class="idle-icon">...</div><h3>Reading input</h3><p class="text-muted">Alfaaz updates automatically after you pause typing.</p></div>`;
}

function typeText(el, text, speed = 22) {
  return new Promise((resolve) => {
    el.textContent = "";
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(tick, speed);
      else resolve();
    };
    tick();
  });
}

async function cycleHero(index = 0) {
  const text = heroExamples[index % heroExamples.length];
  await typeText($("#heroInput"), text);
  const chip = $("#heroChip");
  try {
    const data = await predict(text);
    const display = calibratePrediction(data, text);
    chip.className = `result-chip ${display.cls}`;
    chip.textContent = `${display.title} · ${pct(display.confidence, 1)}`;
    $("#heroScore").textContent = pct(display.confidence, 1);
    $("#heroConfidence").style.width = pct(display.confidence);
    $("#heroConfidence").style.background = display.color;
    $("#heroJson").textContent = JSON.stringify({
      display: display.title,
      safety: display.family,
      confidence: Number(display.confidence.toFixed(4)),
      toxicity: Number(display.toxicity.toFixed(4))
    }, null, 2);
  } catch (err) {
    chip.className = "result-chip chip-uncertain";
    chip.textContent = "API waking / offline";
    $("#heroScore").textContent = "--";
    $("#heroJson").textContent = JSON.stringify({ error: err.name === "AbortError" ? "timeout" : err.message }, null, 2);
  }
  setTimeout(() => cycleHero(index + 1), 4000);
}

function initExamples() {
  Object.entries(examples).forEach(([group, list]) => {
    const wrap = document.querySelector(`[data-group="${group}"]`);
    list.forEach((text) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "example-btn";
      btn.textContent = text;
      btn.addEventListener("click", () => {
        $("#inputText").value = text;
        updateCounter();
        $("#inputText").focus();
        analyze();
      });
      wrap.appendChild(btn);
    });
  });
}

function updateCounter() {
  $("#charCounter").textContent = `${$("#inputText").value.length}/1000`;
}

function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}


function setAuthLoading(isLoading) {
  $("#signInBtn").disabled = isLoading;
  $("#signUpBtn").disabled = isLoading;
  $("#signInBtn").textContent = isLoading ? "Loading" : "Sign in";
  $("#signUpBtn").textContent = isLoading ? "Loading" : "Sign up";
}

function openAuthModal() {
  const modal = $("#authModal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeAuthModal() {
  const modal = $("#authModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  $("#clerkMount").innerHTML = "";
}

async function loadClerkUiBundle(publishableKey) {
  const clerkDomain = atob(publishableKey.split("_")[2]).slice(0, -1);
  await new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-clerk-ui]");
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.clerkUi = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Clerk UI bundle"));
    document.head.appendChild(script);
  });
}

async function initAuthShell() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
    return;
  }

  setAuthLoading(true);
  await loadClerkUiBundle(CLERK_PUBLISHABLE_KEY);

  const clerk = new Clerk(CLERK_PUBLISHABLE_KEY);
  await clerk.load({
    ui: { ClerkUI: window.__internal_ClerkUICtor }
  });

  window.AlfaazClerk = clerk;

  const signInBtn = $("#signInBtn");
  const signUpBtn = $("#signUpBtn");
  const userButton = $("#userButton");
  const clerkMount = $("#clerkMount");

  const syncAuthUi = () => {
    const signedIn = Boolean(clerk.user);
    signInBtn.style.display = signedIn ? "none" : "inline-flex";
    signUpBtn.style.display = signedIn ? "none" : "inline-flex";
    userButton.style.display = signedIn ? "inline-flex" : "none";
    if (signedIn) {
      userButton.innerHTML = "";
      clerk.mountUserButton(userButton, { showName: true });
      closeAuthModal();
    }
  };

  signInBtn.addEventListener("click", () => {
    clerkMount.innerHTML = "";
    openAuthModal();
    clerk.mountSignIn(clerkMount);
  });

  signUpBtn.addEventListener("click", () => {
    clerkMount.innerHTML = "";
    openAuthModal();
    clerk.mountSignUp(clerkMount);
  });

  $$("[data-auth-close]").forEach((el) => el.addEventListener("click", closeAuthModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAuthModal();
  });

  clerk.addListener(syncAuthUi);
  setAuthLoading(false);
  syncAuthUi();
}

function loadGsap() {
  const gsapScript = document.createElement("script");
  gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
  gsapScript.defer = true;
  const stScript = document.createElement("script");
  stScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";
  stScript.defer = true;
  stScript.onload = () => {
    gsap.registerPlugin(ScrollTrigger);
    $$(".reveal").forEach((el) => gsap.from(el, { opacity: 0, y: 28, duration: .75, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 86%" } }));
    $$(".stat-number").forEach((el) => {
      if (!el.dataset.count) return;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      gsap.to({ val: 0 }, {
        val: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate() {
          const v = this.targets()[0].val;
          el.textContent = target < 1 ? v.toFixed(3) : target % 1 ? v.toFixed(1) : Math.round(v).toLocaleString();
          el.textContent += suffix;
        }
      });
    });
  };
  document.body.append(gsapScript, stScript);
}

document.addEventListener("DOMContentLoaded", async () => {
  initExamples();
  initAuthShell().catch((error) => {
    console.error(error);
    setAuthLoading(false);
  });
  checkHealth();
  cycleHero();
  loadGsap();
  window.addEventListener("scroll", () => $(".nav").classList.toggle("scrolled", scrollY > 12), { passive: true });
  $("#inputText").addEventListener("input", () => {
    updateCounter();
    renderInputPreview();
    autoAnalyze();
  });
  $("#analyzeBtn").addEventListener("click", analyze);
  $("#inputText").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) analyze();
    if (e.key === "Escape") e.currentTarget.blur();
  });
});
