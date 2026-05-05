import {
  type KeyBinding,
  EditorView,
} from '@codemirror/view'
import {
  indentMore,
  indentLess,
} from '@codemirror/commands'
import {
  type EditorState,
  type ChangeSpec,
  EditorSelection,
} from '@codemirror/state'

// ─── Helpers ──────────────────────────────────────────────────────────────

const WORD_BOUNDARY = /\W/

function wordAt(state: EditorState, pos: number): { from: number; to: number } {
  const line = state.doc.lineAt(pos)
  let from = pos
  let to = pos
  while (from > line.from && !WORD_BOUNDARY.test(state.doc.sliceString(from - 1, from))) from--
  while (to < line.to && !WORD_BOUNDARY.test(state.doc.sliceString(to, to + 1))) to++
  return { from, to }
}

function toggleWrap(view: EditorView, wrapper: string): boolean {
  const { state } = view
  const changes: ChangeSpec[] = []

  for (const range of state.selection.ranges) {
    let { from, to } = range
    if (from === to) {
      const word = wordAt(state, from)
      from = word.from
      to = word.to
    }
    const selected = state.doc.sliceString(from, to)
    const w = wrapper
    if (selected.startsWith(w) && selected.endsWith(w) && selected.length >= w.length * 2) {
      changes.push({ from, to, insert: selected.slice(w.length, selected.length - w.length) })
    } else {
      changes.push({ from, to, insert: `${w}${selected}${w}` })
    }
  }

  if (changes.length === 0) return false
  view.dispatch(state.update({ changes, scrollIntoView: true }))
  return true
}

/**
 * Toggle a line prefix (e.g. '# ', '- ', '> ') on the primary selection's lines.
 * If all selected lines already start with the prefix → removes it.
 * Otherwise → adds it.
 */
function toggleLinePrefix(view: EditorView, prefix: string): boolean {
  const { state } = view
  const main = state.selection.main

  // Collect all lines in the selection range
  const lines: { from: number; to: number; text: string }[] = []
  let pos = state.doc.lineAt(main.from).from
  const end = state.doc.lineAt(main.to).to
  while (pos <= end) {
    const line = state.doc.lineAt(pos)
    lines.push({ from: line.from, to: line.to, text: line.text })
    if (line.to >= end) break
    pos = line.to + 1
  }

  const allHave = lines.every(l => l.text.startsWith(prefix))
  const changes: ChangeSpec[] = lines.map(l =>
    allHave
      ? { from: l.from, to: l.from + prefix.length, insert: '' }
      : { from: l.from, to: l.from, insert: prefix }
  )

  view.dispatch(state.update({ changes, scrollIntoView: true }))
  return true
}

function currentLine(state: EditorState): string {
  return state.doc.lineAt(state.selection.main.head).text
}

const RE_UNORDERED = /^(\s*)([-*+])\s/
const RE_CHECKBOX  = /^(\s*)([-*+])\s+\[[ xX]\]\s*/
const RE_ORDERED   = /^(\s*)(\d+)\.\s/
const RE_HEADING   = /^#{1,6} /

function isInList(state: EditorState): boolean {
  const line = currentLine(state)
  return RE_UNORDERED.test(line) || RE_ORDERED.test(line)
}

function isInHeading(state: EditorState): boolean {
  return RE_HEADING.test(currentLine(state))
}

function newlineAtEnd(view: EditorView): boolean {
  const { state } = view
  const changes: ChangeSpec[] = []
  const newSelections: Array<{ anchor: number }> = []
  let offset = 0

  for (const range of state.selection.ranges) {
    const line = state.doc.lineAt(range.head)
    const insertPos = line.to + offset
    changes.push({ from: line.to, insert: '\n' })
    newSelections.push({ anchor: insertPos + 1 })
    offset += 1
  }

  view.dispatch(
    state.update({
      changes,
      selection: { anchor: newSelections[newSelections.length - 1].anchor },
      scrollIntoView: true,
    }),
  )
  return true
}

function insertLink(view: EditorView): boolean {
  const { state } = view
  const range = state.selection.main
  const selectedText = state.doc.sliceString(range.from, range.to)
  const insert = `[${selectedText}](url)`
  const cursorPos = range.from + 1

  view.dispatch(
    state.update({
      changes: { from: range.from, to: range.to, insert },
      selection: { anchor: cursorPos, head: cursorPos + selectedText.length },
      scrollIntoView: true,
    }),
  )
  return true
}

function enterInHeading(view: EditorView): boolean {
  if (!isInHeading(view.state)) return false
  view.dispatch(
    view.state.update({
      changes: { from: view.state.selection.main.head, insert: '\n' },
      selection: { anchor: view.state.selection.main.head + 1 },
      scrollIntoView: true,
    }),
  )
  return true
}

function enterInList(view: EditorView): boolean {
  if (!isInList(view.state)) return false

  const { state } = view
  const line = state.doc.lineAt(state.selection.main.head)
  const text = line.text

  const unorderedMatch = RE_UNORDERED.exec(text)
  const orderedMatch   = RE_ORDERED.exec(text)

  const marker = unorderedMatch ? unorderedMatch[0] : orderedMatch ? orderedMatch[0] : null
  if (marker && text === marker.trimEnd()) {
    view.dispatch(
      state.update({
        changes: { from: line.from, to: line.to, insert: '' },
        selection: { anchor: line.from },
        scrollIntoView: true,
      }),
    )
    return true
  }

  const checkboxMatch = RE_CHECKBOX.exec(text)
  if (checkboxMatch) {
    const indent = checkboxMatch[1]
    const bullet = checkboxMatch[2]
    if (text.trim() === `${bullet} [ ]` || text.trim() === `${bullet} [x]` || text.trim() === `${bullet} [X]`) {
      view.dispatch(
        state.update({
          changes: { from: line.from, to: line.to, insert: '' },
          selection: { anchor: line.from },
          scrollIntoView: true,
        }),
      )
      return true
    }
    const continuation = `\n${indent}${bullet} [ ] `
    view.dispatch(
      state.update({
        changes: { from: state.selection.main.head, insert: continuation },
        selection: { anchor: state.selection.main.head + continuation.length },
        scrollIntoView: true,
      }),
    )
    return true
  }

  if (unorderedMatch) {
    const indent = unorderedMatch[1]
    const bullet = unorderedMatch[2]
    const continuation = `\n${indent}${bullet} `
    view.dispatch(
      state.update({
        changes: { from: state.selection.main.head, insert: continuation },
        selection: { anchor: state.selection.main.head + continuation.length },
        scrollIntoView: true,
      }),
    )
    return true
  }

  if (orderedMatch) {
    const indent = orderedMatch[1]
    const num = parseInt(orderedMatch[2], 10)
    const continuation = `\n${indent}${num + 1}. `
    view.dispatch(
      state.update({
        changes: { from: state.selection.main.head, insert: continuation },
        selection: { anchor: state.selection.main.head + continuation.length },
        scrollIntoView: true,
      }),
    )
    return true
  }

  return false
}

function tabInList(view: EditorView): boolean {
  if (!isInList(view.state)) {
    view.dispatch(
      view.state.update({
        changes: { from: view.state.selection.main.head, insert: '  ' },
        selection: { anchor: view.state.selection.main.head + 2 },
      }),
    )
    return true
  }
  return indentMore(view)
}

function shiftTabInList(view: EditorView): boolean {
  if (!isInList(view.state)) return false
  return indentLess(view)
}

export const markdownKeymap: KeyBinding[] = [
  { key: 'Mod-Enter', run: newlineAtEnd },
  { key: 'Mod-b',     run: (view) => toggleWrap(view, '**') },
  { key: 'Mod-i',     run: (view) => toggleWrap(view, '*') },
  { key: 'Mod-k',     run: insertLink },
  { key: 'Mod-e',     run: (view) => toggleWrap(view, '`') },
  { key: 'Tab',       run: tabInList },
  { key: 'Shift-Tab', run: shiftTabInList },
  { key: 'Enter',     run: enterInHeading },
  { key: 'Enter',     run: enterInList },
]

/**
 * Toolbar action functions — call these from toolbar buttons with the current EditorView.
 * Each returns true if the action was applied.
 */
export const toolbarActions = {
  bold:       (v: EditorView) => toggleWrap(v, '**'),
  italic:     (v: EditorView) => toggleWrap(v, '*'),
  code:       (v: EditorView) => toggleWrap(v, '`'),
  link:       insertLink,
  h1:         (v: EditorView) => toggleLinePrefix(v, '# '),
  h2:         (v: EditorView) => toggleLinePrefix(v, '## '),
  h3:         (v: EditorView) => toggleLinePrefix(v, '### '),
  ul:         (v: EditorView) => toggleLinePrefix(v, '- '),
  ol:         (v: EditorView) => toggleLinePrefix(v, '1. '),
  blockquote: (v: EditorView) => toggleLinePrefix(v, '> '),
} satisfies Record<string, (v: EditorView) => boolean>

// Re-export for consumers who need the raw function
export { insertLink, toggleWrap, toggleLinePrefix }

// ─── selectNextOccurrence (local copy, avoids @codemirror/search dep in callers) ──
function selectNextOccurrenceImpl(view: EditorView): boolean {
  const { state } = view
  let { from, to } = state.selection.main
  if (from === to) {
    const w = wordAt(state, from)
    from = w.from
    to = w.to
  }
  const seed = state.doc.sliceString(from, to)
  if (!seed) return false
  const doc = state.doc.toString()
  const len = seed.length
  let searchFrom = 0
  for (const r of state.selection.ranges) if (r.to > searchFrom) searchFrom = r.to
  let idx = doc.indexOf(seed, searchFrom)
  if (idx === -1) idx = doc.indexOf(seed, 0)
  if (idx === -1) return false
  const already = (pos: number) => state.selection.ranges.some(r => r.from === pos && r.to === pos + len)
  let attempts = 0
  while (already(idx) && attempts < 2) {
    idx = doc.indexOf(seed, idx + 1)
    if (idx === -1) idx = doc.indexOf(seed, 0)
    if (idx === -1) return false
    attempts++
  }
  if (already(idx)) return false
  const newRanges = state.selection.ranges.map(r => ({ anchor: r.anchor, head: r.head }))
  newRanges.push({ anchor: idx, head: idx + len })
  const selRanges = newRanges.map(r => EditorSelection.range(r.anchor, r.head))
  const sel = EditorSelection.create(selRanges, selRanges.length - 1)
  view.dispatch(state.update({ selection: sel, scrollIntoView: true }))
  return true
}

export { selectNextOccurrenceImpl as selectNextOccurrence }
