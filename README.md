# MedTrain AI — Doctors Training Chatbot

**PRT581: Software Engineering Project — Assessment 02**  
Charles Darwin University · Sydney Campus  
Group: Mohammad Maruf Iqbal (S398392) · Md. Nafis Rabbi (S398606) · Pujan Dey (S395076) · Raihan Rifat (S374528)

---

## 📋 Project Overview

MedTrain AI is an interactive, AI-powered medical education platform that simulates a **skin cancer patient** for diagnostic training. Medical students practice clinical history-taking, symptom questioning, and diagnosis in a safe, repeatable environment.

The chatbot acts as **Robert H., a 58-year-old male** presenting with a concerning skin lesion. Students ask questions, gather a clinical history, and submit a diagnosis — then receive detailed educational feedback.

---

## 🚀 Live Demo

👉 **[https://YOUR-USERNAME.github.io/YOUR-REPO-NAME](https://YOUR-USERNAME.github.io/YOUR-REPO-NAME)**
👉 **[Demo Website](https://nafisrabbi.github.io/prt581-chatbot)

> Replace the URL above with your actual GitHub Pages URL after deployment.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| AI / NLP | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Hosting | GitHub Pages |
| Fonts | Google Fonts (DM Sans, DM Serif Display) |

---

## 📁 File Structure

```
/
├── index.html          # Main application page
├── css/
│   └── style.css       # All styles
├── js/
│   ├── config.js       # AI prompts & API configuration
│   ├── chat.js         # API calls & conversation logic
│   ├── ui.js           # DOM rendering & UI state
│   └── app.js          # Initialisation & entry point
└── README.md
```

---

## ⚙️ How to Deploy on GitHub Pages

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**
3. Name it (e.g. `prt581-medtrain-chatbot`)
4. Set it to **Public**
5. Click **Create repository**

### Step 2 — Upload the files

**Option A — GitHub web interface (easiest):**
1. In your new repository, click **Add file → Upload files**
2. Drag and drop ALL files, keeping the folder structure:
   - `index.html` (root)
   - `css/style.css`
   - `js/config.js`
   - `js/chat.js`
   - `js/ui.js`
   - `js/app.js`
3. Click **Commit changes**

**Option B — Git command line:**
```bash
git init
git add .
git commit -m "Initial commit — PRT581 Doctors Training Chatbot"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repository → **Settings** tab
2. Scroll to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Select branch: **main**, folder: **/ (root)**
5. Click **Save**
6. Wait 1–2 minutes, then visit:  
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME`

### Step 4 — Update the report

Copy the live URL and paste it into **Section 5.2** of the Word report.

---

## 🔑 Using with a Live API Key

The app works in **demo mode** out of the box (no setup needed) with preset patient responses.

For **live AI-powered responses**:
1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Open the live app in your browser
3. Paste your API key in the yellow banner at the top and click **Activate**

> ⚠️ **Note:** The API key is only stored in your browser's session memory and is never transmitted to any server other than Anthropic's API directly.

---

## 🎓 How to Use the App

1. **Read the patient sidebar** — note Robert's profile, age, occupation, and clinical hints
2. **Ask questions** — type freely or click the quick-start chips
3. **Gather a full history** — ask about the lesion, timeline, family history, sun exposure
4. **Submit your diagnosis** — click the **Submit Diagnosis** button when ready
5. **Review feedback** — the system evaluates your diagnosis using ABCDE criteria
6. **Reset and retry** — click **Reset** to start a new session

---

## 📸 Screenshots

*(Add screenshots of the running application here for your report Appendix B)*

---

## 📚 References

- Anthropic. (2025). *Claude API Documentation*. https://docs.anthropic.com
- Cancer Council Australia. (2024). *Skin Cancer*. https://www.cancer.org.au
- World Health Organization. (2023). *Skin Cancers*. https://www.who.int

---

*PRT581 Assessment 02 — Submission Deadline: 23 May 2026*
