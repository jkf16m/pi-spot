# pi-spot

A [Pi](https://github.com/earendil-works/pi-coding-agent) extension for focused, surgical editing of individual files.

## What it does

`pi-spot` scans your project for files containing a configurable marker (default `<pi*>`, or `[[pi]]` as configured here). When you run `/spot`, it:

1. Finds all marked files in the project
2. Picks the first matching file (single-file focus mode)
3. Injects the file content into the agent session
4. Sends instructions telling the agent to make **minimal, targeted changes** — only following the marked instructions

## Motivation

When working with an AI coding agent, the default behavior is broad: the agent may refactor, reorganize, or touch multiple files beyond what was asked. This is often undesirable when you need a precise, surgical edit — fix one bug, add one feature, or answer one question about a specific file.

`pi-spot` solves this by creating a **focus mode**: you mark the exact file you want to work on, and the agent is constrained to only that file with explicit instructions to make minimal changes. This keeps edits predictable, reviewable, and safe — especially in larger codebases where you don't want the agent exploring and modifying unrelated code.

## Recommended workflow

1. Read the source code yourself — understand the parts you're confident about.
2. For the parts you don't understand or want changed, ask the agent to refactor or explain.
3. Leave `[[pi]]` markers in the files where you want the agent to act.
4. Commit the markers: `git add -A && git commit -m "spot markers"`.
5. Run `/spot` in Pi.
6. If the result is undesirable:
   - Write the findings to `HANDOFF.md`.
   - Commit only the handoff: `git add HANDOFF.md && git commit -m "handoff"`.
   - Reset the bad changes: `git reset --hard`.
   - Start again — the agent now has the handoff context about what didn't work. 
7. If the results are desirable, you can commit them, and start again.

## Configuration

Create a `.pi/pi-spot.json` in your project root (or `~/.pi/pi-spot.json` for global settings):

```json
{
  "marker": "[[pi]]"
}
```

Then place the marker in any file you want the agent to focus on:

```typescript
// [[pi]] Add error handling for the fetch call above
const data = await fetch(url);
```

Run `/spot` in Pi and the agent will pick up that file and execute the marked instruction.

## Development

```bash
npm install
```

The extension entry point is `src/index.ts`. It registers a `spot` command with Pi's extension API.
