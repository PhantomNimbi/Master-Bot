# 📋 Skill: Issue Orchestrator (`issue-orchestrator`)

## Purpose
Guide autonomous AI agents in crafting and maintaining high-quality GitHub issues, writing rich human-readable status comments with emojis, generating structural Mermaid diagrams, and orchestrating hierarchical sub-issues using the GitHub CLI.

---

## 🏛️ Sub-Issue Orchestration Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Autonomous Agent
    participant GH as GitHub CLI (gh)
    participant GitHub as GitHub API / Remote Repo

    Agent->>GH: gh issue create --title "✨ Feature: Parent" --body-file parent.md
    GH->>GitHub: POST /repos/:owner/:repo/issues
    GitHub-->>GH: Issue #100 Created
    GH-->>Agent: Returns #100

    loop For Each Discrete Sub-Task
        Agent->>GH: gh issue create --title "🧩 Sub-Issue(#100): Task" --body-file sub.md
        GH->>GitHub: POST /repos/:owner/:repo/issues
        GitHub-->>GH: Sub-Issue #101 Created
        GH-->>Agent: Returns #101
        Agent->>GH: gh issue edit 100 --add-sub-issue 101
        GH->>GitHub: Link #101 as child to #100
        GitHub-->>GH: Hierarchy Updated
    end

    Agent->>GH: gh issue comment 100 --body-file progress.md
    GH->>GitHub: Post status comment with Mermaid flowchart
```

---

## 🛠️ Step-by-Step Instructions for Agents

### Step 1: Draft Parent Issue
- Select an approved semantic emoji (`✨`, `🐛`, `🗺️`, `⚡️`, `♻️`).
- Follow the sections defined in `.agents/rules/issue-standards.md`.
- Generate at least one Mermaid diagram visualizing the system architecture, flow, or sequence.
- Write the draft to a local markdown file.

### Step 2: Create Parent Issue
```bash
gh issue create \
  -R <owner>/<repo> \
  --title "✨ Feature(scope): Title" \
  --body-file /path/to/parent.md
```

### Step 3: Create & Link Child Sub-Issues
Break the implementation down into atomic, testable sub-tasks:
```bash
# 1. Create sub-issue
gh issue create \
  -R <owner>/<repo> \
  --title "🧩 Sub-Issue(#<parent>): Discrete task description" \
  --body "Part of #<parent>. Implements <specific details>."

# 2. Link to parent
gh issue edit <parent> -R <owner>/<repo> --add-sub-issue <child>
```

### Step 4: Post Human-Readable Comments with Emojis
When providing milestones, debugging logs, or completion notices:
- Lead with an emoji (`📢`, `🔍`, `🚀`, `✅`).
- Include summary metrics, code references, and a Mermaid state/lifecycle diagram.
- Use `--body-file` for formatting fidelity.
