# 📚 Skill: Wiki Management (`wiki-management`)

## Purpose
Guide agents in creating, updating, and structuring documentation in the project's GitHub wiki following strict wiki standards: human-readable text with emojis, valid Mermaid diagrams, formatted codeblocks, relative GitHub wiki link syntax, and synchronized sidebar/footer pages.

---

## 🏛️ Wiki Workflow Architecture

```mermaid
flowchart TD
    NewTopic[New Topic / Feature] --> PageDraft[Draft Page via templates/wiki-page.md]
    PageDraft --> ValidateLinks[Format Wiki Links: [Title](Target)]
    ValidateLinks --> AddDiagrams[Embed Mermaid Diagram]
    AddDiagrams --> AddCodeblocks[Add Syntax-Highlighted Codeblocks]
    AddCodeblocks --> UpdateSidebar[Update wiki/_Sidebar.md]
    UpdateSidebar --> VerifyFooter[Verify wiki/_Footer.md Navigation]
```

---

## 🛠️ Operational Guidelines

1. **Relative Wiki Links**:
   - Always link to other wiki pages using `[Page Name](Page-Name)` or `[Section](Page-Name#section)`.
   - Never use file system paths (`file:///...`) or external URLs for internal pages.

2. **Mermaid Formatting**:
   - Fenced block: ```` ```mermaid ````.
   - Enclose node labels in double quotes when containing parentheses, slashes, or hyphens: `Node["Text (Details)"]`.

3. **Sidebar Updates**:
   - Whenever adding a new wiki page, append a link under the appropriate section in `wiki/_Sidebar.md`.
   - Ensure the emoji and title correspond exactly with the page header.

4. **Footer Consistency**:
   - Ensure every page includes navigation pointing to `Home.md` and related topics.
