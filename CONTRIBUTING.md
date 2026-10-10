# Contributing to BECE Vault

Thank you for helping Pokhara University BE Computer Engineering students study better! 🙏

- 🌐 **Website:** [notes.arpanadhikari7.com.np](https://notes.arpanadhikari7.com.np/)
- 📦 **Repository:** [github.com/adhikari-arpan/BECE_Notes](https://github.com/adhikari-arpan/BECE_Notes)
- 📬 **Questions:** [adhikariarpan2063@gmail.com](mailto:adhikariarpan2063@gmail.com)

---

## 1. Before you start

- **No need to clone.** The repository is several GB.
  - Fork it on GitHub.
  - Open the right folder in your fork.
  - Use **Add file → Upload files**.
  - Open a pull request from your fork.
- **Upload limit: 25 MB per file** (GitHub's browser limit).
  - Compress larger PDFs, or split them by unit.
  - Still too big? Email us.
- **Everything is reviewed** before it is merged. Nothing goes live until it's checked.

## 2. What we accept

**Welcome:**

- 📝 Your own notes, typed or handwritten, for any subject in the PU BE Computer curriculum
- ❓ Past exam questions, assessment questions and question collections
- 💡 Solutions to important questions
- 🧪 Lab reports, lab sheets and assignments
- 📄 Syllabus files for subjects that don't have one yet
- 🤝 Notes from teachers or seniors, **shared with their permission** (name them in your pull request)

**Not accepted:**

- 🔁 **Duplicate or near-duplicate content.** If the same or very similar notes, questions or files already exist in that subject, new similar content won't be accepted.
  - Check the subject on the website or GitHub before uploading.
- 📷 **Poor scans:** blurry, dark, tilted, cut-off or unreadable pages
- 📚 **Published books and paid material:** textbooks, guide books, solution books
- 🚫 **Unrelated files** outside the BE Computer curriculum
- 🔒 **Personal information:** phone numbers, roll numbers, ID cards

### Scanning checklist

- Use a **scanner app** (CamScanner, Adobe Scan, Microsoft Lens or Google Drive scan), not plain photos.
- Pages are **upright, cropped to the page, evenly lit and readable**.
  - Use the app's *document* or *black & white* filter.
- Pages are **in order**.
- **One PDF per unit or topic**, not one file per page.
- **Compress** the file, ideally under 25 MB.

## 3. Folder structure

Every semester and subject follows the same layout, so students always know where to look. Past exam papers
are kept separately, in the top-level `Past Question Collection/` folder ([see below](#past-question-papers)).

```text
Semester_N/
├── _Syllabus/                     ← syllabus files of all subjects in this semester
├── Subject Name/
│   ├── _Syllabus/                 ← syllabus of this subject only
│   ├── Unit 1_Unit Name/          ← one folder per unit (lesson)
│   ├── Unit 2_Unit Name/
│   ├── ...
│   ├── Extra Notes/               ← detailed explanations, solutions to important questions
│   ├── Question Collection/       ← question banks and practice questions for this subject
│   ├── NCIT Lab Works/            ← college-specific material, named after the college
│   ├── NCIT Assignments/
│   ├── (other relevant folders)
│   └── Full_Note.pdf              ← compiled notes covering all units
└── Another Subject/
```

**Naming rules:**

- 📁 **Semesters:** `Semester_1` … `Semester_8`
  - Electives go in `Electives/<Elective Name>/`, with the same inside layout.
- 📘 **Subjects:** the full subject name.
  - Examples: `Database Management System`, `Programming in C`
- 🔢 **Units:** `Unit <number>_<Unit Name>`
  - Example: `Unit 3_Normalization`
- 🏫 **College-specific folders** start with the college name.
  - Examples: `NCIT Lab Works`, `NAST Assignments`
- 📕 **`Full_Note.pdf`** is one compiled note for the whole subject.
  - Don't add a second one unless it's clearly better; explain why in the pull request.
- ⬆️ **Folders starting with `_`** (like `_Syllabus`) are shown first on the website.
- 📂 **Empty folders contain a `.gitkeep` file.** It's an empty placeholder that keeps the folder visible on GitHub.
  - When you add your files to an empty folder, you can **delete its `.gitkeep`** in the same pull request.
  - Don't delete `.gitkeep` from a folder that stays empty, or the folder disappears.
  - The website never shows `.gitkeep` files.

> 💡 Some older subjects don't follow this layout yet; they're being reorganised. **Always use the layout above for new contributions.**

### File names

- Use **clear, descriptive names**:
  - `Unit 2_Process Scheduling.pdf`
  - `2024_Spring_AG.pdf` (past papers, see below)
  - `Lab 3_Linked List.pdf`
- Use **spaces or underscores**, not special characters like `#`, `%`, `?` or `&`.
- **Don't put your name in every file name.** Credit goes in the pull request and on the Contributors page.

### Past question papers

We're building a collection of **Pokhara University past exam papers** for every subject, and it's still small, so
these are especially welcome. They live in their own top-level folder, `Past Question Collection/`, with one folder
per semester and one folder per subject inside it:

```text
Past Question Collection/Semester_N/
├── README.md                  ← each subject's folder, short form and an example file name
├── Algebra and Geometry/
│   ├── 2025_Spring_AG.pdf      ← exam papers, directly in the subject's folder
│   └── 2024_Spring_AG.pdf
└── College Assessments/
    └── 2024_College_Assessments/  ← one folder per year: internal / all-college assessment papers
```

- 📝 **File name: `Year_Spring/Fall_ShortForm`**
  - Example: `2024_Spring_AG.pdf` (Algebra and Geometry, Spring 2024)
  - **Year** is when the exam was held, in AD.
  - **Spring** or **Fall** is the exam term.
  - **ShortForm** is the subject's short form, listed in the folder's `README.md` and on the website (e.g. `C`, `DSA`, `DBMS`, `TOC`).
- 📂 **Put the paper in its subject's folder** in the semester where that subject is taught. Folders follow the
  before-2025 semester order; papers from the 2025 curriculum go in the same subject's folder.
- 🎓 **Electives:** use the elective's short form, e.g. `2025_Spring_BDT.pdf` (Big Data Technologies) in `Elective II/`.
- 🚫 **Semester VIII has no past question collection** (internship, project and an elective only).
- 📄 **PDF or image** (`.pdf`, `.jpg`, `.png`), and keep it small: a PDF under **5 MB**, an image under **1 MB**.
  - Compress large scans before adding them, and scan clearly (see the scanning checklist above).
  - **One paper per file.** A paper photographed as several images: combine them into one PDF if you can,
    otherwise number them, e.g. `2024_Spring_AG_1.jpg`, `2024_Spring_AG_2.jpg`.
- 🏫 **College assessments** (internal exams, all-college assessments) go in `College Assessments/<Year>_College_Assessments/`.
  - Example: `College Assessments/2024_College_Assessments/DSA-internal-exam-all-clz.pdf`
  - Name each file after its subject. The website shows them in a College Assessments section, grouped by year.
- 🔁 **Check first** that the same paper (year + term) isn't already there.

> 💡 On the website, **Past Questions** (in the top bar) lists every semester; each semester's page shows its
> papers by subject and which ones are still needed.

## 4. Commit messages

- Start **every commit message** with one of these prefixes.
- Keep it **short and specific**: what you added, plus the semester and subject.

| Prefix | Use it for | Example |
|---|---|---|
| `Notes:` | Adding or improving notes | `Notes: Semester 3 DBMS Unit 3 and 4 handwritten notes` |
| `Questions:` | Past, assessment or important questions | `Questions: Semester 2 OOP past questions 2079–2081` |
| `UI:` | Changing how the website looks | `UI: Bigger file list on mobile` |
| `feat:` | Adding a new website feature | `feat: Search inside PDF notes` |

## 5. Pull requests

### Title

- Use the **same prefix** as your commits.
- Then say **what** you added and **where** (semester and subject).

```text
Notes: Semester 3 – Database Management System – Unit 3 & 4
Questions: Semester 2 – Applied Physics – past questions 2079–2081
UI: Improve subject cards on the semester page
feat: Add a dark-mode toggle to the PDF viewer
```

### Description

- A **template fills in automatically** when you open a pull request.
- **Complete every part:**
  - **Summary:** one or two lines on what you added
  - **Files added:** the list of files or folders
  - **Source:** your own notes, or who made them (with permission)
  - **Checklist:** tick every item

```markdown
## Summary
One or two lines on what this pull request adds.

## Files added
- Semester_3/Database Management System/Unit 3_Normalization/Unit 3_Normalization.pdf
- Semester_3/Database Management System/Unit 4_Transactions/Unit 4_Transactions.pdf

## Source
- [ ] My own notes
- [ ] Made by someone else, shared with permission: <name, college>

## Checklist
- [ ] Files are in the correct semester / subject / unit folder
- [ ] Notes are properly scanned (upright, cropped, readable, one PDF per unit)
- [ ] This content doesn't already exist in the subject (no duplicates)
- [ ] No published books, paid material or personal information
- [ ] Commit messages start with Notes:, Questions:, UI: or feat:
```

### Good practice

- 🎯 **One topic per pull request**, e.g. one subject or one set of questions.
- ⚡ **Small pull requests are reviewed much faster.**

### Review and merge time

- 🔍 **Every pull request is reviewed** before merging.
  - You may be asked to move files, rename them or rescan pages.
- 🟢 **Small pull requests** (a few files or commits) are usually reviewed **within a few days**.
- 🟡 **Large pull requests** (many files or commits, or website changes) take **up to one or two weeks**.
- 🌐 After merging, the **website updates automatically** within a few minutes.

## 6. Getting credited

- 👥 **Every merged pull request** shows you among the repository's contributors on GitHub.
- ⭐ **To appear on the website's [Contributors page](https://notes.arpanadhikari7.com.np/contributors):**
  - You need at least **10 valid, accepted files** (notes and past question papers together), counted across all your pull requests.
  - Duplicates and rejected files don't count.
  - The page has **two lists, notes and past questions**, each ordered by how many files you've added (counted automatically).

### How to add yourself (once you have 10 valid files)

Open a pull request titled `feat: Add <your name> to contributors`:

1. 🖼️ **Your photo** (optional; your initials are shown without one)
   - Upload it to [`Website/public/images/contributors/`](https://github.com/adhikari-arpan/BECE_Notes/tree/main/Website/public/images/contributors)
   - Name it `firstname-lastname.jpg`, lowercase with hyphens, e.g. `sita-sharma.jpg`
   - Square, at least 400 × 400 px, under 300 KB
2. 📝 **Your details**
   - Open [`Website/src/content/contributors.ts`](https://github.com/adhikari-arpan/BECE_Notes/blob/main/Website/src/content/contributors.ts)
   - Find the section marked **`CONTRIBUTORS: ADD YOURSELF HERE`**, copy its template, remove the `//` and fill it in.
   - Add your **GitHub username** as `github`. Files uploaded on GitHub are recorded under your GitHub account, not
     the name you type, so this is how the files you've added are **counted automatically**. You never update numbers yourself.
   - Your entry goes at the **end** of the list:

   ```ts
   {
     name: 'Sita Sharma',
     github: 'sita-sharma',
     photo: 'images/contributors/sita-sharma.jpg', // optional
   },
   ```

## 7. Contributing to the website

- The website lives in [`Website/`](https://github.com/adhikari-arpan/BECE_Notes/tree/main/Website) (React + TypeScript + Vite).
- **Run it locally:**

```bash
cd Website
npm install
npm run dev        # local site at http://localhost:5173
```

- **Before opening a `UI:` or `feat:` pull request**, all of these must pass:

```bash
npm run typecheck
npm run lint
npm run build
```

- 🎯 Keep changes focused: **one feature or fix per pull request**.
- 🖼️ Add **before/after screenshots** for visual changes.
- 🌗 Check **light and dark mode**, and **phone width**.

## 8. License of your contributions

- By opening a pull request, you confirm that:
  - the material is **yours**, or you have the **owner's permission** to share it;
  - your original content is shared under **[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)**, like the rest of the notes;
  - **BECE Vault may host, display and distribute it** on this repository and its website, including advertising-supported pages that help cover hosting costs.
- Website code contributions are licensed under the **[MIT License](https://github.com/adhikari-arpan/BECE_Notes/blob/main/Website/LICENSE)**.
- Material made by someone else stays theirs. Name them in your pull request so they get credit.
- Full details: [LICENSE](https://github.com/adhikari-arpan/BECE_Notes/blob/main/LICENSE).

## 9. Code of conduct

- Be **respectful and helpful**.
- **Credit the people** whose work you share.
- **Own something in this collection?** Email [adhikariarpan2063@gmail.com](mailto:adhikariarpan2063@gmail.com) with proof of ownership to have it credited differently or removed.

**Thank you for contributing!** 🙏
