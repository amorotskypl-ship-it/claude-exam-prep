# Claude Architect Exam Prep

A single-page web application for preparing for the **CCA-F (Claude Certified Architect - Foundations)** exam. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

## Features

- **Dashboard** — Progress overview, study streak, exam countdown timer
- **Study Guide** — 30 task statements across 5 domains with expandable details and sub-navigation
- **Practice Quiz** — 230 questions with domain filtering, answer explanations, and score history
- **Flashcards** — 82 cards with flip animation, domain filtering, and confidence ratings
- **Quick Reference** — 25 searchable reference sections covering key exam topics
- **Exam Strategy** — Decision trees, scenario walkthroughs, and exam-day tips

### Bilingual (EN/RU)

Full English and Russian support with a sliding toggle in the sidebar. All 230 questions, 82 flashcards, 30 study tasks, 25 reference sections, and strategy content are translated. Language switching preserves your current state — open sections, quiz progress, flashcard position, and scroll location.

### Accessibility

- WCAG AAA compliant contrast ratios (7:1+ for body text)
- Dark and light themes with a sliding toggle
- No pure black or pure white backgrounds — warm-shifted to reduce eye fatigue
- Desaturated accent colors to prevent chromatic vibration on dark backgrounds

## Quick Start

```bash
# Clone the repo
git clone https://github.com/amorotskypl-ship-it/claude-exam-prep.git
cd claude-exam-prep

# Serve locally (Python 3)
python -m http.server 8080 --directory app

# Open in browser
# http://localhost:8080
```

Any static file server works — the app is pure client-side with no dependencies.

## Project Structure

```
app/
  index.html              # Single-page app shell
  css/
    style.css             # All styles, CSS variables for theming
  js/
    app.js                # Application logic, rendering, state management
    i18n.js               # Internationalization module (EN/RU)
    data-questions.js     # 230 quiz questions (EN)
    data-questions-ru.js  # 230 quiz questions (RU)
    data-study.js         # Study guide content (EN)
    data-study-ru.js      # Study guide content (RU)
    data-flashcards.js    # 82 flashcards (EN)
    data-flashcards-ru.js # 82 flashcards (RU)
    data-reference.js     # Reference sections (EN)
    data-reference-ru.js  # Reference sections (RU)
    data-strategy.js      # Exam strategy data (EN)
    data-strategy-ru.js   # Exam strategy data (RU)
```

## Data Persistence

Progress is saved to `localStorage` under the key `claudeExamPrep`:
- Studied tasks (checkmarks)
- Quiz history and scores
- Flashcard confidence ratings
- Study plan and exam date

Theme and language preferences are stored separately as `claudeExamTheme` and `claudeExamLang`.

## Color Palette

Steel Blue theme with warm-neutral backgrounds:

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| Accent | `#6ca4d9` | `#2b6cb0` |
| Background | `#181a20` | `#f7f6f3` |
| Card | `#242731` | `#fffffe` |
| Text | `#dcdfe6` | `#2d3142` |

## License

This project is for personal exam preparation use.
