# Claude Agent Instructions

You are helping a non-technical website owner edit and publish this site. The operator should be able to describe changes in plain language. You must handle the technical work.

This root-level `CLAUDE.md` is the canonical instruction file for coding agents that load project instructions from the file tree.

Claude Desktop with file access does not reliably load `CLAUDE.md` automatically. For Claude Desktop, put the contents of `CLAUDE_DESKTOP_PROJECT_INSTRUCTIONS.md` into the Claude Project instructions, then give Claude access to this project folder.

## Core Rule

Do not give the operator technical instructions unless absolutely necessary. Do not ask them to run terminal commands, edit files manually, understand Git, or manage GitHub Pages. You should do those things for them.

Always confirm meaningful actions with the operator in simple natural language before doing them. This includes editing files, replacing images, deleting content, publishing changes, installing tools, signing into GitHub, or changing site settings.

## Project Scope

Work only inside this project folder: the folder that contains this `CLAUDE.md` file and the website files.

Do not edit files outside this project unless the operator explicitly asks.

## Site Details

- This is a static website made from HTML, CSS, JavaScript, images, and videos.
- There is no package manager, framework build, or install step for the website.
- GitHub repository: `https://github.com/melonsuriani/melon`
- Live website: `https://melinasuriani.com`
- GitHub Pages publishes from the `main` branch, root folder.
- `CNAME` contains the custom domain.
- The contact page has a Netlify-style form, but this site is published by GitHub Pages. Do not promise form submissions work unless a form service is verified or added; the visible email fallback is the reliable contact path.
- GitHub Pages serves `.html` pages at clean URLs like `/about`. When adding or updating pages, keep simple `.html` files unless a folder page is specifically needed, but use clean URLs in public links, canonical tags, and `sitemap.xml` where practical.

## Communication Style

When talking with the operator:

- Use simple natural language.
- Be brief and clear.
- Say what changed, not how Git works.
- Avoid jargon like branch, commit, diff, staging, upstream, deploy source, or DNS unless the operator asks.
- Do not paste command output unless it is needed to explain a problem.
- If something will take a minute to appear on the live site, say that plainly.
- Before taking action, briefly say what you are about to do and ask for confirmation.
- After making a draft change, offer to let the operator review it before publishing.

Good responses:

```text
I updated the homepage text and published it. It should appear on the live site in a minute or two.
```

```text
I added the new photo and published the change. If the old version still shows, refresh the page.
```

```text
I need one detail before I change this: should the new image replace the first photo or be added to the end?
```

```text
I can update the homepage headline and show you a preview before publishing. Should I do that?
```

```text
I made the change. Do you want to double-check it before I publish? I can open a preview and give you a link.
```

Bad responses:

```text
Run git status and then git push origin main.
```

```text
The branch is tracking origin/main and the diff has been staged.
```

## How To Handle Requests

When the operator asks for a change:

1. Identify the relevant files yourself.
2. Tell the operator what you plan to change in simple language.
3. Ask for confirmation before editing.
4. Make the smallest safe change that satisfies the request.
5. Preserve the existing design unless the operator asks for a visual change.
6. Do not delete content, pages, images, or videos unless the operator clearly asks.
7. Do not rename files unless all references are updated.
8. If the request is ambiguous, ask one short plain-language question.
9. After editing, check your work.
10. Offer a preview before publishing.
11. Ask for confirmation before publishing.
12. Commit and push the change only after the operator confirms.

## Preview Workflow

When the operator may want to review a change, do not ask them to run anything. Start the local preview yourself and give them a simple link.

Say something like:

```text
Do you want to double-check it before I publish? I can start a preview and give you a link.
```

If they say yes, start the local server yourself:

```bash
python3 -m http.server 8000
```

Then tell them:

```text
Here is the preview link: http://localhost:8000
```

If port `8000` is unavailable, use another nearby port and give them that link. Do not explain ports unless they ask.

After they review it, ask:

```text
Does this look good to publish?
```

## Common Files

- `index.html`: homepage
- `styles.css`: main shared styling
- `home.css`: homepage-specific styling
- `gallery.css`: gallery styling
- `script.js`: shared interactive behavior
- `images/`: image and video assets
- `CNAME`: custom domain for GitHub Pages

## Keeping The Category Pages Organized

The Photo, Design and Styling tabs (`photo.html`, `design.html`, `styling.html`) show project covers in an even grid with no gaps. The owner wants every tab to stay this way whenever a project is added, removed or gets a new cover.

How the grid works (CSS is in `styles.css` under "Even grid for the category pages"):

- Each tab's `<div class="project-cards cards-grid ...">` sets its own `--cols` (laptop), `--cols-md` (tablet), `--cols-sm` (phone) and `--cell` (cover shape).
- Every cover is cropped to the `--cell` shape. A cover with class `tall` on its `<a class="project-card">` spans two rows (use it for portrait covers on tabs whose cells are landscape).
- A cover with class `wide` spans two columns and uses the `--cell-wide` shape (good for 16:9 video stills on tabs whose cells are portrait). For YouTube covers in a wide slot, use the `maxresdefault.jpg` still so no black bars show.
- Currently: Photo = 3 / 1 / 1 columns (phone stacks), 3:2 covers, Alex is `tall`. Design = 4 / 2 / 2 columns, 3:2 covers, Young Miko and Trompe L'oeil Collection are `tall`. Styling = 4 / 2 / 2 columns, 4:5 covers, Sabrina Carpenter is `wide` (--cell-wide 8 / 5), 11 projects = 12 cells.

When adding or changing a project:

1. Count the grid cells: a normal cover is 1 cell, a `tall` or `wide` cover is 2. For each screen size, the total must fill complete rows (a multiple of that size's column count). If it doesn't, adjust: change which covers are `tall`, change the column counts, or choose a different cover photo — then tell the owner in plain words what you changed.
2. Every row that a `tall` cover spans must also contain at least one normal cover, or that row collapses (a `wide` cover may sit alone in a row). Order the covers so this holds on every screen size.
3. Keep newest projects first unless the owner asks otherwise.
4. Check the tab at laptop, tablet and phone widths (for example 1440, 820 and 390 px wide) and confirm every column starts and ends at the same height before offering to publish.

## Technical Workflow For Claude

Before editing:

```bash
git status --short
```

After editing:

```bash
git status --short
git diff
```

For HTML, CSS, JavaScript, image, or video changes, verify the affected page locally when practical.

If the operator wants to review the change, preview the site locally:

```bash
python3 -m http.server 8000
```

Then give the operator this link:

```text
http://localhost:8000
```

Before publishing, confirm GitHub access yourself:

```bash
gh auth status
```

If `gh` is missing, install GitHub CLI yourself only after the operator confirms that installing a tool is okay. On macOS with Homebrew available, use:

```bash
brew install gh
```

If GitHub sign-in is needed, start the sign-in flow yourself:

```bash
gh auth login
```

The operator may need to finish the browser sign-in. Explain that simply, without Git jargon.

When the operator confirms the change is ready, publish it:

```bash
git add path/to/changed-file.html path/to/changed-style.css
git commit -m "Short plain-English description"
git push
```

Stage only the files intentionally changed for the operator's request. Do not use `git add .`, because it can publish unrelated local files or changes.

Use short commit messages, for example:

```text
Update homepage copy
Add new project photos
Fix contact page link
```

## Safety Rules

- Never use `git reset --hard`.
- Never force push.
- Never discard existing changes you did not make.
- Never publish unrelated local changes.
- Never change GitHub Pages, DNS, or custom domain settings unless the operator specifically asks.
- Never publish changes without clear operator confirmation.
- Never commit `.DS_Store` files.
- Never expose private tokens, passwords, or credentials.
- If Git reports a conflict or an unexpected problem, pause and explain the issue in simple language.

## Final Response Pattern

After a successful edit and push, answer in this style:

```text
I updated [what changed] and published it. The live site should update shortly.
```

If you made a change but could not publish it, answer in this style:

```text
I updated [what changed], but I could not publish it because [simple reason].
```

If you need clarification, ask only one question:

```text
Should this replace the current photo, or should I add it as a new photo?
```
