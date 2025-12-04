# Checkpoints System Guide

How and when to use development checkpoints.

---

## What Are Checkpoints?

Checkpoints are session logs that capture:
- What you worked on
- Decisions made and why
- Problems encountered and solutions
- Next steps

They create a searchable history of the project's evolution.

---

## When to Create a Checkpoint

**Always create a checkpoint when:**
- Ending a work session (natural stopping point)
- Completing a significant feature or milestone
- Making important architectural decisions
- Pivoting direction or changing approach
- Before taking a break longer than a day

**Optional but helpful:**
- After fixing a tricky bug (document the solution)
- When onboarding someone new (capture context)
- Before major refactors (snapshot current state)

---

## How to Create a Checkpoint

### Using the `/checkpoint` Command

Simply type `/checkpoint` and Claude will:
1. Summarize the current session
2. Create a new dated file in `checkpoints/`
3. Update the index and tags
4. Optionally commit and push

### Manual Creation

1. **Create the file:**
   ```
   checkpoints/YYYY-MM-DD-X-short-name.md
   ```
   - `YYYY-MM-DD` = date
   - `X` = letter suffix (a, b, c) if multiple sessions same day
   - `short-name` = 1-3 word description

2. **Use this template:**
   ```markdown
   # Session: [Date] - [Title]

   **Tags:** `#tag1` `#tag2` `#tag3`

   [← Back to Index](./README.md) | [Previous: Name](./prev-file.md)

   ---

   ## Session Goals
   - Goal 1
   - Goal 2

   ## Work Completed
   [What you did]

   ## Key Decisions
   1. **Decision** - Reason

   ## Challenges & Solutions
   | Challenge | Solution |
   |-----------|----------|
   | Problem | Fix |

   ## Current State
   [Where things stand now]

   ## Next Steps
   1. Step 1
   2. Step 2

   ---

   [← Back to Index](./README.md) | [Previous: Name](./prev-file.md)
   ```

3. **Update the index:**
   - Add row to `checkpoints/README.md` table
   - Add tags to `checkpoints/tags.md`
   - Update prev/next links in adjacent files

---

## File Naming Convention

**Format:** `YYYY-MM-DD-X-short-name.md`

| Part | Example | Purpose |
|------|---------|---------|
| Date | `2024-12-04` | Chronological sorting |
| Suffix | `-a-`, `-b-` | Multiple sessions same day |
| Name | `mvp`, `docs`, `bugfix` | Quick identification |

**Examples:**
- `2024-12-01-a-mvp.md` (first session Dec 1)
- `2024-12-01-b-endless.md` (second session Dec 1)
- `2024-12-04-a-docs.md` (first session Dec 4)

---

## Tag Guidelines

Add tags that help find sessions later.

**Standard tags:**
| Tag | Use for |
|-----|---------|
| `#setup` | Project initialization, config |
| `#mvp` | Minimum viable product work |
| `#gameplay` | Core game mechanics |
| `#ui` | User interface work |
| `#physics` | Matter.js, collision, movement |
| `#docs` | Documentation |
| `#pivot` | Direction changes |
| `#assets` | Art, audio, sprites |
| `#bug` | Bug fixes |
| `#refactor` | Code cleanup |
| `#perf` | Performance optimization |

**Custom tags:** Create project-specific tags as needed (e.g., `#pinball`, `#roguelike`, `#flipper`)

---

## Searching Checkpoints

**By tag (grep):**
```bash
grep -r "#ui" checkpoints/
```

**By tag (tags.md):**
Open `checkpoints/tags.md` and find the tag section.

**By date:**
Files sort chronologically in file explorer.

**By content:**
```bash
grep -r "Matter.js" checkpoints/
```

---

## Best Practices

1. **Be specific** - "Fixed collision bug in flipper" > "Fixed bug"
2. **Capture the why** - Decisions without context are useless later
3. **Link related sessions** - Reference previous sessions when building on them
4. **Keep it scannable** - Use headers, tables, bullet points
5. **Don't over-document** - Focus on what you'd want to know in 6 months

---

## Folder Structure

```
checkpoints/
├── README.md           # Main index, current state, next steps
├── GUIDE.md            # This file
├── tags.md             # Reverse index by tag
├── 2024-12-01-a-mvp.md
├── 2024-12-01-b-endless.md
└── 2024-12-04-a-docs.md
```

---

## Quick Reference

| Task | Action |
|------|--------|
| End session | `/checkpoint` |
| Find UI sessions | Check `#ui` in tags.md |
| See project state | Read `checkpoints/README.md` |
| Add new session | Create file, update README + tags |
