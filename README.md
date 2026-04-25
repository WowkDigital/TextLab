# 🔬 TextLab — Advanced Text Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Status-Stable-success.svg)]()
[![JS: ES6](https://img.shields.io/badge/JS-ES6-orange.svg)]()

TextLab is a powerful, client-side web application designed for comprehensive text analysis and manipulation. It provides real-time statistics, smart text segmentation, unique word/line extraction, and a wide array of text transformations in a sleek, responsive dark-mode interface.

![TextLab Preview](https://via.placeholder.com/1200x600?text=TextLab+Editor+Preview)

[**🚀 Launch Online Version**](https://wowkdigital.github.io/TextLab/)

## ✨ Features

### 📊 Comprehensive Statistics
*   **Basic Counts:** Characters (with/without spaces), Words, Sentences, Paragraphs, and Lines.
*   **Analytical Stats:** Unique word count, average word length, and average sentence length.
*   **Readability:** Flesch Reading Ease score with difficulty indicators.
*   **Time Estimates:** Calculated Reading and Speaking time.
*   **Technical Info:** Byte size (UTF-8), uppercase letter count, and digit count.

### ✂️ Smart Segmentation
*   Split long texts into manageable parts of custom length.
*   **Sentence Awareness:** Option to "Keep sentences" ensuring segments aren't cut mid-sentence.
*   Quick-copy individual segments or the entire result.

### 🔍 Unique Content Extraction
*   **Unique Words:** Extract every unique word, with options for case-insensitivity and punctuation stripping.
*   **Unique Lines:** Remove duplicate lines from lists, supporting various separators (new line, semicolon, comma).
*   **Frequency Analysis:** Discover the most frequent words with an integrated stopword filter.

### 🛠️ Advanced Transformations
*   **Case Control:** UPPERCASE, lowercase, Title Case, Sentence case.
*   **Ordering:** Sort lines alphabetically (A-Z).
*   **Cleaning:** Remove extra spaces, duplicate lines, and empty lines.
*   **Extraction:** Intelligent extraction of **Emails**, **URLs**, and **Numbers**.
*   **Special:** Reverse text/words and generate URL-friendly **Slugs**.

### ⌨️ Editor Experience
*   **Built-in Gutter:** Professional line numbering that stays in sync.
*   **Real-time Highlighter:** Set a character limit and see exactly where you exceed it with visual markers.
*   **Theming:** Seamless toggle between Dark and Light modes.
*   **Responsive:** Optimized for both desktop and mobile workflows.

## 🚀 Tech Stack

*   **HTML5** & **Semantic Tags**
*   **CSS3** (Custom Properties, Flexbox/Grid, Tailwind for layout)
*   **Vanilla JavaScript** (ES6 Modules)
*   **Lucide Icons**
*   **Google Fonts** (JetBrains Mono for editor, Syne for branding)

## 📂 Project Structure

```text
TextLab/
├── css/
│   └── style.css       # Core design system and component styles
├── js/
│   ├── main.js         # App entry point and event orchestration
│   └── modules/
│       ├── stats.js    # Computational logic for text analysis
│       ├── transforms.js # Text manipulation algorithms
│       ├── ui.js       # Theme and interface state management
│       └── utils.js    # Shared helpers and data (e.g., stopwords)
├── index.html          # Main application structure
└── README.md           # Documentation
```

## 🛠️ Installation & Usage

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YourUsername/TextLab.git
    ```
2.  **Open locally:**
    Simply open `index.html` in any modern web browser. No backend or installation required!
3.  **(Optional) Deployment:**
    The project is ready to be hosted on **GitHub Pages**, Vercel, or Netlify.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Crafted by [Wowk Digital](https://github.com/WowkDigital)*
