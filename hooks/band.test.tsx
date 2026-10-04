import { test, expect } from 'claude-code/testing'
import type { RenderSurface } from 'claude-code'

const BAND = {
  plugin: 'last-prompt-band',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 9 },
    view: {},
  },
} as const

const SURFACES = ['terminal', 'desktop'] as const

// The test's hooks stand for the engine: nothing sits beneath them, so they
// have to answer ui.render and settle a submitted prompt.
const engine = (on: any) => {
  on('ui.render', ($: any, e: any) => {
    const { Box } = $.ui.resolve(e)

    return <Box />
  })
  on('prompt.submit', (_$: any, e: any) => ({ text: e.text }))
}

const typed = ($: any, text: string) =>
  $.prompt.submit({ text, origin: { kind: 'composer' } })

const bandText = async (ui: any) =>
  (await ui.find({ key: 'prompt' }))?.text

test('draws nothing until the person has typed a prompt', async ($, on) => {
  engine(on)

  for (const surface of SURFACES satisfies readonly RenderSurface[]) {
    const ui = await $.ui.mount({ ...BAND, surface })

    expect(await ui.find({ key: 'prompt' })).toBeUndefined()

    await ui.unmount()
  }
})

test('shows the prompt the person typed', async ($, on) => {
  engine(on)

  await typed($, 'start the app for me')

  for (const surface of SURFACES satisfies readonly RenderSurface[]) {
    const ui = await $.ui.mount({ ...BAND, surface })

    expect(await bandText(ui)).toContain('start the app for me')

    await ui.unmount()
  }
})

test('keeps the last one when a second prompt is typed', async ($, on) => {
  engine(on)

  await typed($, 'first thing')
  await typed($, 'second thing')

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const text = await bandText(ui)

  expect(text).toContain('second thing')
  expect(text).not.toContain('first thing')

  await ui.unmount()
})

test('folds a multi-line prompt onto one row', async ($, on) => {
  engine(on)

  await typed($, 'one\n\n  two   three\n')

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  expect(await bandText(ui)).toContain('one two three')

  await ui.unmount()
})

test('More opens a long prompt and Less closes it again', async ($, on) => {
  engine(on)

  const long = 'investigate '.repeat(30).trim()
  await typed($, long)

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  const shut = await bandText(ui)
  expect(shut).toContain('…')
  expect(shut!.length).toBeLessThan(long.length)

  await ui.press({ key: 'toggle' })
  const open = await bandText(ui)
  expect(open).toContain(long)

  await ui.press({ key: 'toggle' })
  expect(await bandText(ui)).toBe(shut)

  await ui.unmount()
})

test('yields the band to a survey', async ($, on) => {
  engine(on)

  await typed($, 'something typed')

  const ui = await $.ui.mount({
    ...BAND,
    surface: 'terminal',
    props: { ...BAND.props, hasSurvey: true },
  })

  expect(await ui.find({ key: 'prompt' })).toBeUndefined()

  await ui.unmount()
})

test('a prompt the person did not type leaves the band alone', async ($, on) => {
  engine(on)

  await typed($, 'what the person typed')

  // A background task's notification and a scheduled trigger both enter as
  // prompts. Neither is something the person needs reminding they typed.
  await $.prompt.submit({
    text: 'a background task finished',
    origin: { kind: 'task-notification' },
  } as never)
  await $.prompt.submit({
    text: 'a routine fired',
    origin: { kind: 'scheduled-trigger' },
  } as never)

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const text = await bandText(ui)

  expect(text).toContain('what the person typed')
  expect(text).not.toContain('background task')
  expect(text).not.toContain('routine fired')

  await ui.unmount()
})

test('draws a chip label and the prompt in theme colors', async ($, on) => {
  engine(on)

  await typed($, 'colour me')

  for (const surface of SURFACES satisfies readonly RenderSurface[]) {
    const ui = await $.ui.mount({ ...BAND, surface })

    // Theme keys, not raw hex, so the band follows the user's light or dark theme.
    const chip = await ui.find({ type: 'Text', text: /Last/ })
    expect(chip?.props.backgroundColor).toBe('claude')
    expect(chip?.props.color).toBe('inverseText')
    expect(chip?.props.bold).toBe(true)

    const body = await ui.find({ type: 'Text', text: /colour me/ })
    expect(body?.props.color).toBe('suggestion')
    expect(body?.props.dimColor).toBeUndefined()

    await ui.unmount()
  }
})
