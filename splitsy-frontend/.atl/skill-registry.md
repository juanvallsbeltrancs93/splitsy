# Skill Registry — splitsy-frontend

> Generated: 2026-05-25
> Project: splitsy-frontend
> Mode: engram

---

## Project-Level Skills

These skills govern the Splitsy frontend conventions. They take **priority** over user-level skills with the same name.

| Skill | Trigger | Path |
|-------|---------|------|
| `frontend-architecture` | When creating files, moving code, or refactoring structure — folder layout, layer boundaries, dependency rules | `.agent/skills/frontend-architecture/SKILL.md` |
| `component-patterns` | When creating, refactoring, or reviewing any React component — 4-file folder, zero-logic .tsx, co-located hooks | `.agent/skills/component-patterns/SKILL.md` |

---

## User-Level Skills (SDD Workflow)

These skills are loaded by the SDD orchestrator during the corresponding phase.

| Skill | Trigger | Path |
|-------|---------|------|
| `sdd-init` | Initialize SDD, `sdd init`, `iniciar sdd` | `~/.config/opencode/skills/sdd-init/SKILL.md` |
| `sdd-explore` | Explore / investigate a feature before committing | `~/.config/opencode/skills/sdd-explore/SKILL.md` |
| `sdd-propose` | Create a change proposal | `~/.config/opencode/skills/sdd-propose/SKILL.md` |
| `sdd-spec` | Write specifications for a change | `~/.config/opencode/skills/sdd-spec/SKILL.md` |
| `sdd-design` | Write technical design for a change | `~/.config/opencode/skills/sdd-design/SKILL.md` |
| `sdd-tasks` | Break down a change into tasks | `~/.config/opencode/skills/sdd-tasks/SKILL.md` |
| `sdd-apply` | Implement tasks from a change | `~/.config/opencode/skills/sdd-apply/SKILL.md` |
| `sdd-verify` | Verify implementation against specs | `~/.config/opencode/skills/sdd-verify/SKILL.md` |
| `sdd-archive` | Archive a completed change | `~/.config/opencode/skills/sdd-archive/SKILL.md` |
| `sdd-onboard` | Guided end-to-end SDD walkthrough | `~/.config/opencode/skills/sdd-onboard/SKILL.md` |

## User-Level Skills (General)

| Skill | Trigger | Path |
|-------|---------|------|
| `branch-pr` | Create a pull request, open a PR, prepare changes for review | `~/.config/opencode/skills/branch-pr/SKILL.md` |
| `chained-pr` | Split large changes into chained/stacked PRs (>400 lines) | `~/.config/opencode/skills/chained-pr/SKILL.md` |
| `cognitive-doc-design` | Write guides, READMEs, RFCs, architecture docs | `~/.config/opencode/skills/cognitive-doc-design/SKILL.md` |
| `comment-writer` | Draft PR/issue/review comments, Slack messages | `~/.config/opencode/skills/comment-writer/SKILL.md` |
| `go-testing` | Write Go tests, teatest, coverage (not applicable to this project) | `~/.config/opencode/skills/go-testing/SKILL.md` |
| `issue-creation` | Create a GitHub issue, report a bug, request a feature | `~/.config/opencode/skills/issue-creation/SKILL.md` |
| `judgment-day` | Adversarial dual review (`judgment day`, `dual review`) | `~/.config/opencode/skills/judgment-day/SKILL.md` |
| `skill-creator` | Create new AI agent skills | `~/.config/opencode/skills/skill-creator/SKILL.md` |
| `skill-registry` | Update this skill registry | `~/.config/opencode/skills/skill-registry/SKILL.md` |
| `work-unit-commits` | Structure commits as deliverable work units | `~/.config/opencode/skills/work-unit-commits/SKILL.md` |

---

## Convention Files

| File | Purpose |
|------|---------|
| `AGENTS.md` (global `~/.config/opencode/AGENTS.md`) | Orchestrator rules, engram protocol, persona, delegation rules |

---

## Notes

- **Always load `frontend-architecture` + `component-patterns` before writing any React code.**
- `sdd-*` skills are orchestrated — the orchestrator resolves paths from this registry and passes them to sub-agents.
- Project-level skills override user-level skills with the same name.
- This project uses **engram** mode for SDD artifact persistence.
