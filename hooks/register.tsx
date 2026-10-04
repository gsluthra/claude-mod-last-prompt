import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const lastPrompt = atom(
  { plugin: 'last-prompt-band', key: 'text' } as const,
  null,
)
const isOpen = atom(
  { plugin: 'last-prompt-band', key: 'isOpen' } as const,
  false,
)

// Only what the person typed themselves. A task notification, a scheduled
// prompt or another plugin's submission is not something they need reminding of.
const TYPED = ['composer', 'bridge']

const LABEL = ' Last '
const ELLIPSIS = '…'

// Shown until the first prompt of a session is typed, so that an empty band
// reads as the mod working rather than the mod missing.
const WAITING = ' waiting for your first prompt…'

const flatten = (text: string) => text.replace(/\s+/g, ' ').trim()

const clip = (text: string, room: number) =>
  text.length > room ? text.slice(0, Math.max(1, room - 1)) + ELLIPSIS : text

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    // A hook that throws is skipped whole, so read the origin defensively:
    // an unstamped submission is treated as not the person's own.
    if (TYPED.includes(e.origin?.kind)) {
      const text = flatten(e.text)

      if (text !== '') {
        await update($, lastPrompt, () => text)
      }
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const text = await read($, lastPrompt)

    if (e.props.hasSurvey) {
      return next(e)
    }

    const open = await read($, isOpen)
    const { Box, Button, Text } = $.ui.resolve(e)

    if (text === null) {
      return (
        <Box>
          <Text backgroundColor="claude" color="inverseText" bold>
            {LABEL}
          </Text>
          <Box key="prompt">
            <Text dimColor wrap="truncate-end">
              {WAITING}
            </Text>
          </Box>
        </Box>
      )
    }

    // Leave room for the chip and the toggle on the same row.
    const oneRow = Math.max(8, e.props.bodyColumns - LABEL.length - 10)
    const isLong = text.length > oneRow

    // Expanded, wrap over the rows the band is allowed, less the row the
    // toggle sits on.
    const manyRows = Math.max(oneRow, (e.props.maxRows - 1) * e.props.bodyColumns)
    const body = clip(text, open ? manyRows : oneRow)

    return (
      <Box>
        <Text backgroundColor="claude" color="inverseText" bold>
          {LABEL}
        </Text>
        <Box key="prompt">
          <Text color="suggestion" wrap={open ? 'wrap' : 'truncate-end'}>
            {' '}
            {body}
          </Text>
        </Box>
        {isLong ? (
          <Button
            key="toggle"
            label={open ? ' Less' : ' More'}
            dimColor
            plain
            onPress={() => update($, isOpen, was => !was)}
          />
        ) : null}
      </Box>
    )
  })
}
