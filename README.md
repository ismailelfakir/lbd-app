# Learning by Doing – Next.js Workshop (React + TypeScript)

This app delivers a constructivist learning experience in two parts:
- Part 1: concise course pages that introduce the learning theory and objectives
- Part 2: a hands‑on workshop guiding learners to build a small Next.js app step‑by‑step

Content is stored in `src/data/steps.json` and rendered as interactive steps with navigation, progress, code blocks, and a theme toggle.

## Features
- Loads steps from `src/data/steps.json` (course + workshop)
- Next/Previous navigation with progress indicator
- Side‑floating navigation buttons (responsive)
- Fade animation on step change
- Copyable code blocks
- Light/Dark mode (persisted)
- Current step persisted to `localStorage`
 - Metadata display (duration, difficulty, tags)
 - Reflection prompts and optional diagrams
 - Top progress bar and hero Start Workshop

## Tech Stack
- React 18 + TypeScript
- Vite 5
- CSS (utility classes not required; Tailwind optional)

## Run Locally
```bash
npm install
npm run dev
# open the shown URL (default: http://localhost:5173)
```

## Build/Preview
```bash
npm run build
npm run preview
```

## Project Structure
```
src/
  router.tsx              # Minimal client router for Activity1/Activity2
  main.tsx                # App bootstrap (renders router)
  styles.css              # Global styles, variables, buttons, layout
  activities/
    Activity1/            # Theory-only app (course)
      App.tsx
      styles.css          # imports ../../styles.css
      components/
        Step.tsx          # re-exports shared Step
        Navigation.tsx    # re-exports shared Navigation
        CodeBlock.tsx     # re-exports shared CodeBlock
      data/
        steps_course.json # ONLY section: "course"
    Activity2/            # Workshop-only app (practice)
      App.tsx
      styles.css          # imports ../../styles.css
      components/
        Step.tsx          # re-exports shared Step
        Navigation.tsx    # re-exports shared Navigation
        CodeBlock.tsx     # re-exports shared CodeBlock
      data/
        steps_workshop.json # ONLY section: "workshop"
  components/
    Step.tsx              # Renders one step (markdown‑friendly + CodeBlock)
    CodeBlock.tsx         # Copyable code block
    Navigation.tsx        # Next/Previous (side or bottom variants)
  data/
    steps.json            # Course + workshop steps
```

## Steps JSON Schema
Each entry can include the following fields:
```
{
  "section": "course" | "workshop",
  "title": "string",
  "content": "markdown-friendly text (supports #, ##, -, >, **, `)",
  "code": "optional code block string",
  "explain": "optional short hint under the code",
  "quiz": "optional reflection question",
  "diagram": "optional image url",
  "meta": {
    "duration": "e.g. 5 min",
    "difficulty": "Intro | Easy | ...",
    "tags": ["theory", "constructivism"]
  },
  "sandbox": {
    "template": "nextjs14-ts",
    "file": "components/TodoList.tsx"
  },
  "action": "start-workshop" // optional to jump to workshop
}
```

**Online Sandbox:** Each workshop step can be opened directly in StackBlitz with a ready-to-run Next.js 14 + TypeScript environment (App Router example by Vercel). If `sandbox.file` is provided, that file is pre-opened. Button text: "▶ Open in StackBlitz (Next.js)".

## Adding New Steps
- Activity 1 team:
  - Edit `src/activities/Activity1/data/steps_course.json`.
  - Keep ONLY `section: "course"` entries. Use headings/lists/quotes for formatting.
  - You can reuse shared components. If you need theory-only variations, copy the re-exported files and customize locally.
- Activity 2 team:
  - Edit `src/activities/Activity2/data/steps_workshop.json`.
  - Include `code`, `explain`, optional `quiz`, `sandbox.file` (e.g., `components/TodoList.tsx`).
  - Reflection checkpoints are encouraged after major steps.
- If you want to show a diagram, set `diagram` to a public image URL.

## How the Team Works (Who does what)
- Navigate locally:
  - Theory (Activity 1): open `/activity1`
  - Workshop (Activity 2): open `/activity2`
- Owners
  - Activity 1: content quality, meta (duration/difficulty), course flow and clarity
  - Activity 2: runnable code steps, StackBlitz links, reflection prompts
- Shared components live in `src/components/`. Both activities re-export these; you can override per activity if necessary.
- Progress/Theme are handled in shared UI; each activity manages its own step index.

## Run Locally
```bash
npm install
npm run dev
# open http://localhost:5173/activity1  or  http://localhost:5173/activity2
```

## For Educators (Contributing)
- Keep steps short (1–3 minutes each) to support micro‑learning.
- Emphasize experimentation: include checkpoints that invite learners to try, run, and reflect.
- Prefer incremental changes in code to demonstrate cause and effect.
- Validate JSON after edits (well‑formed arrays, strings escaped).

## Steps Content (Workshop targets Next.js)
The workshop guides learners to create a **Next.js 14 (App Router) + TS** app:
1. Project overview and objectives
2. Prerequisites check (`node -v`, `npm -v`)
3. Scaffold with `create-next-app` (TypeScript, App Router)
4. Project structure (`app/`, `components/`)
5. Implement a client `TodoList` and render it in `app/page.tsx`
6. Styling and UX (globals.css or Tailwind)
7. Run and production build

See `src/data/steps.json` for the exact text and copy‑paste code.