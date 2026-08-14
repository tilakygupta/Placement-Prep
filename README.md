# PrepDesk – CS & Aptitude Practice Hub

## 🚀 Overview

**PrepDesk** is a comprehensive, interactive study platform designed for students preparing for campus placements, competitive exams, technical interviews, and aptitude assessments.

The platform contains **400 carefully curated questions across 11 core Computer Science and Aptitude subjects**, each accompanied by detailed theory, step-by-step explanations, and fully explained answers. Built entirely with **HTML, CSS, and JavaScript**, PrepDesk requires **no backend, database, build tools, or external dependencies**.

Simply open `index.html` in any modern browser and start learning.

---

## ✨ Key Features

### 📚 400+ Practice Questions

Covering technical and aptitude topics frequently asked in placement tests and interviews.

### 🎯 Quiz Mode

* Multiple-choice questions for every subject
* Instant answer validation
* Correct/incorrect feedback
* Detailed explanations after each attempt
* Running score tracking
* Final results summary
* Review all incorrectly answered questions

### 📖 Study Mode

* Flashcard-style learning experience
* Reveal theory and explanations at your own pace
* Ideal for concept revision and self-study

### 🔍 Smart Search

* Search across all questions and explanations
* Quickly find specific concepts, formulas, or topics

### 📈 Progress Tracking

* Browser-based progress storage using `localStorage`
* No login or account required
* Subject cards display completion percentage
* Continue learning where you left off

### 🌙 Light & Dark Theme

* Toggle between light and dark modes
* Preference automatically remembered

### 📱 Fully Responsive Design

* Optimized for desktops, tablets, and mobile devices
* Study anytime, anywhere

### ⚡ Zero Dependencies

* No backend server
* No frameworks
* No package managers
* No installation required

---

## 📘 Subjects Covered

| #  | Subject                            |
| -- | ---------------------------------- |
| 1  | Database Management Systems (DBMS) |
| 2  | Object-Oriented Programming (OOPS) |
| 3  | Operating Systems (OS)             |
| 4  | SQL                                |
| 5  | Computer Networks (CN)             |
| 6  | Data Structures & Algorithms (DSA) |
| 7  | Arithmetic Aptitude                |
| 8  | Probability                        |
| 9  | Logical Reasoning                  |
| 10 | Verbal Ability                     |
| 11 | Verbal Reasoning                   |

Total Questions: **400+**

---

## 🛠 Technology Stack

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Local Storage API

No external libraries or frameworks are used.

---

## 📂 Project Structure

```text
prepdesk/
│
├── index.html
│
├── assets/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── app.js
│
├── data/
│   ├── index.json
│   ├── DBMS.json
│   ├── OOPS.json
│   ├── OS.json
│   ├── SQL.json
│   ├── CN.json
│   ├── DSA.json
│   ├── Arithmetic.json
│   ├── Probability.json
│   ├── LogicalReasoning.json
│   ├── VerbalAbility.json
│   └── VerbalReasoning.json
│
└── README.md
```

---

## ▶️ Running Locally

### Option 1: Open Directly

Simply double-click:

```text
index.html
```

and open it in your browser.

### Option 2: Run a Local Server

Using Python:

```bash
cd prepdesk
python3 -m http.server 8000
```

Visit:

```text
http://localhost:8000
```

---

## 🌐 Deploy on GitHub Pages

### Step 1: Create a Repository

Create a new GitHub repository named:

```text
prepdesk
```

### Step 2: Push the Project

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<username>/prepdesk.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Open your repository.
2. Navigate to **Settings → Pages**.
3. Under **Source**, select:

   * **Deploy from a branch**
4. Choose:

   * Branch: `main`
   * Folder: `/ (root)`
5. Click **Save**.

### Step 4: Access Your Site

Your site will be available at:

```text
https://<username>.github.io/prepdesk/
```

---

## ➕ Adding New Questions

Each subject file inside the `/data` directory contains an array of question objects.

Example:

```json
{
  "id": "DBMS-1",
  "question": "What is normalization?",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "answer": "Option A",
  "sections": [
    {
      "label": "Theory",
      "content": "Concept explanation"
    },
    {
      "label": "Steps",
      "content": "Step-by-step solution"
    },
    {
      "label": "Answer",
      "content": "Final answer explanation"
    }
  ]
}
```

### Supported Formatting

Content fields support lightweight markdown:

```text
**Bold Text**
`Code`
- Bullet Points
1. Numbered Lists
```

After adding questions:

* Save the JSON file
* Update the subject count in `index.json`
* Refresh the browser

No code modifications are required.

---

## 💾 Data Storage

PrepDesk stores:

* Quiz progress
* Subject completion percentage
* Theme preference
* Learning history

using the browser's:

```javascript
localStorage
```

No personal data is collected or transmitted.

---

## 🎯 Ideal For

* Campus Placement Preparation
* MCA / BCA Students
* Engineering Students
* Technical Interview Preparation
* Aptitude Practice
* Competitive Exam Revision
* Self-Paced Learning

---

## 🔒 Privacy

PrepDesk is completely client-side.

* No user accounts
* No tracking
* No analytics
* No server communication
* No data collection

Everything remains stored locally on your device.

---

## 🚧 Future Enhancements

Potential future improvements:

* Subject-wise leaderboards
* Timed mock tests
* Difficulty levels
* Bookmark questions
* Export progress reports
* Question tagging and filtering
* Performance analytics dashboard
* PWA (Offline Support)

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

```bash
fork → clone → modify → commit → create pull request
```

Please ensure that:

* JSON format remains valid
* Questions include explanations
* Content quality is maintained

---

## 📄 License

This project is provided for educational and personal learning purposes.

You may use, modify, and distribute it with appropriate attribution.

---

## 👨‍💻 Author

**PrepDesk – TILAK GUPTA**

A lightweight, browser-based learning platform built to help students strengthen Computer Science fundamentals and aptitude skills through interactive practice, detailed explanations, and self-paced study.

**Study Smart. Practice Consistently. Crack Placements Confidently.**
