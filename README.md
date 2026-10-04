# Last Prompt Band

A small [Claude Code](https://claude.com/claude-code) mod. It keeps the prompt you last typed on the row just above the prompt line, and leaves it there for as long as the turn runs.

![The band above the Claude Code prompt, showing the last prompt typed](docs/band.png)

## Why it helps

A turn can run for several minutes, and while it runs your question scrolls away. Three cases where that gets annoying:

- You have a handful of terminal tabs open, each with its own session. When you switch between them, the scrolling tool output looks much the same in all of them, so you have to read for a few seconds to work out which window you are in. With the band, the thing you asked for is sitting above the prompt in each one.
- A long run of tool calls pushes your prompt off the top of the screen, and you scroll back to re-read what you asked for.
- You leave a turn running, go and get a coffee, and come back to an answer on screen with no question attached to it.

The band takes one row and does nothing else.

## What it does

1. Shows the prompt you last typed, as a ` Last ` chip followed by the text.
2. Keeps to one line. If the prompt is longer than the row, you get a **More** / **Less** toggle that expands it over several rows.
3. Collapses runs of whitespace, so a pasted multi-line block still shows as a single line.
4. Only records what you typed yourself. Background task notifications, scheduled triggers, messages from other sessions and other plugins all submit through the same `prompt.submit` event, so the hook checks where the submission came from and ignores the rest.
5. Shows ` Last  waiting for your first prompt…` before you have typed anything, so you can tell the mod is loaded in a fresh session.
6. Gives the row back when Claude Code needs it for a survey.

The two colours come from Claude Code theme keys rather than fixed hex values, so the band follows your light or dark theme.

## Build it yourself instead

The mod is small, so you do not have to take my copy of it. [`PROMPT.md`](PROMPT.md) has a prompt you can paste straight into your own Claude Code session. It describes the behaviour rather than the code, so you get your own implementation back, with your own colours and wording if you ask for them. Cloning is quicker if you just want the band.

## Install

Clone it anywhere:

```
git clone git@github.com:gsluthra/claude-mod-last-prompt.git ~/Projects/claude-mod-last-prompt
```

**For one session:**

```
claude --plugin-dir ~/Projects/claude-mod-last-prompt
```

**For every session on the machine**, add the folder to the `env` block of `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "/Users/you/Projects/claude-mod-last-prompt"
  }
}
```

Separate several folders with `:` (`;` on Windows). This has to go in your user settings, because Claude Code ignores `CLAUDE_CODE_PLUGIN_DIRS` when it is set in a project's settings. Restart Claude Code afterwards.

The first thing you see in a new session is the dim placeholder. It is replaced by your prompt once you submit one.

## Changing the colours

Both colours sit in [`hooks/register.tsx`](hooks/register.tsx), on the two `Text` elements:

| Element | Prop | Default |
| --- | --- | --- |
| chip | `backgroundColor` | `claude` (terracotta) |
| chip | `color` | `inverseText` |
| prompt text | `color` | `suggestion` (periwinkle) |

Other theme keys worth a try: `permission`, `planMode` (teal), `autoAccept` and `skill` (purple), `success`, `warning`, `error`, and `subtle` or `inactive` for greys. A raw colour such as `#d77757` also works, though it will stay the same colour in every theme.

There is a test that pins the current choice, so change [`hooks/band.test.tsx`](hooks/band.test.tsx) when you change the colours.

## Developing

```
claude plugin validate .    # manifest, hooks and state contract
claude plugin test .        # 10 tests
```

There are three pieces to it:

1. [`hooks/register.tsx`](hooks/register.tsx) hooks `prompt.submit` to record what you typed, and `ui.render` on `AbovePrompt` to draw the row.
2. [`types/index.d.ts`](types/index.d.ts) declares the two session values the mod keeps. `claude plugin validate` checks the code against it.
3. [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) is the manifest.

Saving a file reloads the mod in any session that is watching the folder, so you can edit it while it runs.

## Requirements

Claude Code 2.1.287 or newer, which is the release that added mods.

## Licence

MIT.
