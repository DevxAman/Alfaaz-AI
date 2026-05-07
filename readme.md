# 🔥 ALFAAZ — Punjabi Hate Speech & Sarcasm Detection System

<div align="center">

![ALFAAZ Banner](https://img.shields.io/badge/AI%20Powered-Punjabi%20NLP-black?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Model](https://img.shields.io/badge/Model-MuRIL-blueviolet?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%7C%20HuggingFace-orange?style=for-the-badge)

### AI-Powered Punjabi Toxicity & Sarcasm Detection Platform

Real-time Punjabi NLP system built using a fine-tuned MuRIL transformer model for detecting:

✅ Non-Toxic Content
✅ Toxic / Hate Speech
✅ Sarcastic Content

🌐 **Live Demo:** [https://alfaaz-ai.vercel.app/#analyzer](https://alfaaz-ai.vercel.app/)

</div>

---

# 📌 Overview

ALFAAZ is an advanced Punjabi Natural Language Processing (NLP) platform designed to identify toxic, hateful, and sarcastic content in Punjabi text.

The system was developed to address the lack of intelligent moderation systems for Punjabi regional language content, especially across social media platforms where code-mixed and context-heavy text is commonly used.

The project combines:

* Transformer-based Deep Learning
* Real-Time API Communication
* Punjabi NLP Processing
* Distributed Web Deployment
* Modern Frontend Interaction

The system uses a fine-tuned **MuRIL transformer model** capable of understanding multilingual and contextual Punjabi text patterns.

---

# 🖼️ System Preview

> Replace the image path below with your actual screenshot.

<div align="center">

![ALFAAZ Preview](./assets/alfaaz-preview.png)

</div>

---

# ⚡ Key Features

## 🧠 AI-Powered Classification

* Transformer-based Punjabi NLP classification
* Fine-tuned MuRIL architecture
* Context-aware prediction system

## 🎯 Three-Way Classification

The system classifies Punjabi text into:

| Class     | Description                              |
| --------- | ---------------------------------------- |
| Non-Toxic | Safe and neutral content                 |
| Toxic     | Hate speech / abusive content            |
| Sarcastic | Contextual sarcasm and indirect toxicity |

## 🚀 Real-Time Inference

* Instant API-based prediction
* Confidence score generation
* Per-class probability distribution
* Response time monitoring

## 🌐 Punjabi Language Support

* Punjabi Gurmukhi support
* Limited Punjabi-English code-mixed text support
* Unicode-based language validation

## 🛡️ Input Validation

* Rejects unsupported scripts
* Handles noisy social media text
* Prevents invalid inference requests

## 🎨 Modern UI

* Dark-themed responsive interface
* Real-time prediction display
* Interactive probability bars
* Smooth frontend experience

---

# 🏗️ System Architecture

```text
User Input
    ↓
Frontend (HTML/CSS/JavaScript)
    ↓
Node.js Proxy Server
    ↓
Flask API (HuggingFace Spaces)
    ↓
Language Validation
    ↓
Preprocessing Pipeline
    ↓
MuRIL Tokenizer
    ↓
Fine-Tuned MuRIL Model
    ↓
Softmax Classification
    ↓
JSON Response
    ↓
Frontend Result Display
```

---

# 🧪 Model Details

| Parameter           | Value                             |
| ------------------- | --------------------------------- |
| Base Model          | google/muril-base-cased           |
| Architecture        | Transformer (12 Layers, 12 Heads) |
| Classes             | Non-Toxic, Toxic, Sarcastic       |
| Dataset Size        | 2,820 Punjabi Entries             |
| Epochs              | 4–5                               |
| Batch Size          | 16                                |
| Learning Rate       | 2e-5                              |
| Optimizer           | AdamW                             |
| Max Sequence Length | 128                               |
| Accuracy            | 88.4%                             |
| Weighted F1 Score   | 0.883                             |

---

# 🧹 NLP Processing Pipeline

The preprocessing pipeline performs multiple NLP operations before inference:

* Unicode normalization
* URL and mention removal
* Noise reduction
* Tokenization
* Stopword filtering
* Attention mask generation

The cleaned text is then processed through the MuRIL tokenizer and transformer encoder layers for contextual prediction.

---

# 💻 Tech Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Vercel Deployment

## Backend

* Node.js
* Express.js

## Machine Learning

* PyTorch
* HuggingFace Transformers
* Flask API
* MuRIL Transformer

## NLP Libraries

* IndicNLP
* NLTK
* Pandas
* NumPy

## Deployment

* Vercel
* HuggingFace Spaces

---

# 📊 Dataset Overview

| Class     | Approximate Samples |
| --------- | ------------------- |
| Non-Toxic | ~1400               |
| Toxic     | ~1100               |
| Sarcastic | ~320                |

The dataset was manually curated and cleaned from Punjabi social media sources including comments, discussions, and public user-generated content.

---

# ⚠️ Challenges Faced

## Punjabi NLP Limitations

* Lack of public Punjabi hate speech datasets
* Limited Punjabi NLP resources
* Sparse benchmark models for regional moderation

## Code-Mixed Text

* Punjabi-English mixed text handling
* Informal spelling variations
* Social media noise and slang

## Sarcasm Detection

* Implicit toxicity detection
* Contextual ambiguity
* Positive wording with negative intent

## Deployment Challenges

* HuggingFace cold-start latency
* API timeout handling
* Real-time response optimization

---

# 🔍 Example Predictions

| Input                                | Prediction |
| ------------------------------------ | ---------- |
| "ਤੂੰ ਬਹੁਤ ਵਧੀਆ ਕੰਮ ਕੀਤਾ"             | Non-Toxic  |
| "ਤੂੰ ਬਿਲਕੁਲ ਬੇਕਾਰ ਹੈਂ"               | Toxic      |
| "ਵਾਹ ਜੀ, ਕੀ ਕਮਾਲ ਦੀ ਅਕਲ ਹੈ ਤੇਰੇ ਕੋਲ" | Sarcastic  |

---

# 🚀 Running Locally

## Clone Repository

```bash
git clone https://github.com/your-username/alfaaz.git
cd alfaaz
```

## Install Dependencies

### Frontend / Backend

```bash
npm install
```

### Python Environment

```bash
pip install -r requirements.txt
```

## Start Backend

```bash
node app.js
```

## Start Flask API

```bash
python app.py
```

---

# 🌐 Deployment

| Component            | Platform           |
| -------------------- | ------------------ |
| Frontend             | Vercel             |
| Machine Learning API | HuggingFace Spaces |
| Model Hosting        | HuggingFace Hub    |

---

# 📈 Future Improvements

* Larger Punjabi dataset expansion
* Advanced sarcasm contextual modeling
* Mobile application support
* Multi-language toxicity detection
* Real-time moderation dashboard
* Admin analytics panel

---

# 👨‍💻 Author

## Amandeep Singh

AI/ML Developer • NLP Enthusiast • Full Stack Developer

---

# ⭐ Support

If you found this project useful:

* ⭐ Star this repository
* 🍴 Fork the project
* 🧠 Contribute improvements
* 🚀 Share the project

---

<div align="center">

### Built with AI, NLP, and Punjabi Language Intelligence.

</div>
