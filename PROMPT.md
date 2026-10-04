# Build it yourself

If you would rather not install someone else's code, you can have your own Claude Code build this mod for you. Copy the block below into a session and let it work. It describes the behaviour rather than the code, so what you get back will be your own implementation, with your own colours and wording if you ask for them.

Expect it to take a few minutes. It will write the plugin, run `claude plugin validate` and `claude plugin test`, and the mod reloads in the session you are sitting in, so you can see the band appear while it works.

## The prompt

````
Build me a Claude Code mod (a plugin of function hooks) that keeps the prompt I
last typed on a row above the prompt line, so that when a long turn buries my
question or I switch between terminal tabs, I can still see what I asked for.

Load the plugin-authoring skill first and follow it. Put the plugin in a new
folder, ~/Projects/claude-mod-last-prompt.

Behaviour I want:

1. A `prompt.submit` hook records the text I submitted into plugin session
   state, then passes the event on untouched.
2. Only record prompts I typed myself. Task notifications, scheduled triggers,
   peer messages and other plugins all arrive through the same event, so check
   the event's origin and ignore anything that is not me typing. Read the
   origin defensively, because a hook that throws is skipped as a whole.
3. Collapse runs of whitespace into single spaces before storing, so a pasted
   multi-line block still fits on one row.
4. A `ui.render` hook on the `AbovePrompt` component draws the row: a short
   bold chip reading "Last" on a coloured background, then the prompt text
   after it.
5. Keep it to one row by default, truncating with an ellipsis. If the text does
   not fit, add a More / Less button that toggles between the one-row version
   and a wrapped version. Work out the room from the render event's column and
   row counts rather than hardcoding a width, and leave space for the chip and
   the button on the same row.
6. Remember the open or closed state in session state too, so it survives
   re-renders.
7. Before I have typed anything in a session, show a dim "waiting for your
   first prompt…" next to the chip, so an empty band reads as the mod working
   rather than the mod missing.
8. If the render event says there is a survey, return the event unhandled and
   let Claude Code have the row.
9. Colour the chip by what the session is doing, using the render event's
   working flag: the Claude terracotta while a turn is running, the theme's
   success colour once it has finished, and grey before I have typed anything,
   since nothing has finished at that point.
10. Use theme colour keys for the chip and the text instead of hex values, so
   the band follows my light and dark themes, and so the colourblind-friendly
   themes get their own pair. Inverse text on the chip, and periwinkle for the
   prompt text.

Declare the session state you keep in a types file and wire it up in the
manifest, so `claude plugin validate` holds the code to it.

Write tests with the plugin testing helpers, mounting the component on both the
terminal and desktop surfaces. Cover: the placeholder before the first prompt,
the placeholder going away after one, a second prompt replacing the first, a
multi-line prompt folded onto one row, More expanding a long prompt and Less
collapsing it again, a survey taking the row both before and after a prompt is
typed, a prompt from a different origin leaving the band alone, the chip and
text using theme keys rather than hex, and the chip changing colour between a
running turn and a finished one.

Then run `claude plugin validate .` and `claude plugin test .`, fix anything
that fails, and tell me how to load the mod for one session and for every
session on this machine.
````

## If you want it to look different

Say so in the same message. A few things worth changing:

- The chip text. "Last" is short enough to leave the prompt room, but "You asked" or an icon works too.
- The colours. Ask for a different theme key, for example teal (`planMode`) or purple (`skill`), or for the chip to stay one colour whether or not a turn is running.
- Where the row sits. `AbovePrompt` is the row above the prompt line. Ask about the other components if you want it somewhere else.
