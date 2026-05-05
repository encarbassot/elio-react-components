import {
  EditorState,
  EditorSelection,
  type Extension,
} from '@codemirror/state'
import {
  EditorView,
  keymap,
  drawSelection,
  dropCursor,
  placeholder as cmPlaceholder,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view'
import {
  history,
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import { selectNextOccurrence } from '@codemirror/search'
import { markdown } from '@codemirror/lang-markdown'
import { decoConfigCompartment, makeDecoExtension, type DecoConfig, DEFAULT_DECO_CONFIG } from './decorations'
import { markdownKeymap } from './keymaps'
import { defaultTheme } from './theme'

export interface EditorStateOptions {
  doc: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  decoConfig?: DecoConfig
  /** Extra CM6 extensions (e.g. a custom theme) */
  extraExtensions?: Extension[]
}

export function createEditorState(options: EditorStateOptions): EditorState {
  const {
    doc,
    onChange,
    placeholder: placeholderText,
    readOnly = false,
    decoConfig = DEFAULT_DECO_CONFIG,
    extraExtensions = [],
  } = options

  const extensions: Extension[] = [
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    rectangularSelection(),
    crosshairCursor(),
    markdown(),
    decoConfigCompartment.of(makeDecoExtension(decoConfig)),
    keymap.of([
      { key: 'Mod-d', run: selectNextOccurrence },
      ...markdownKeymap,
      indentWithTab,
      ...historyKeymap,
      ...defaultKeymap,
    ]),
    defaultTheme,
    ...extraExtensions,
    EditorState.readOnly.of(readOnly),
    ...(placeholderText ? [cmPlaceholder(placeholderText)] : []),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString())
      }
    }),
    EditorView.lineWrapping,
    EditorView.inputHandler.of((view, _from, _to, text) => {
      const PAIRS: Record<string, string> = { '(': ')', '{': '}', '[': ']', '<': '>' }
      const close = PAIRS[text]
      if (!close) return false
      const { state } = view
      if (state.selection.ranges.every(r => r.empty)) return false
      const newRanges = state.changeByRange(range => {
        if (range.empty) return { range }
        const selected = state.doc.sliceString(range.from, range.to)
        return {
          changes: { from: range.from, to: range.to, insert: `${text}${selected}${close}` },
          range: EditorSelection.range(range.from + 1, range.from + 1 + selected.length),
        }
      })
      view.dispatch(view.state.update(newRanges, { scrollIntoView: true, userEvent: 'input' }))
      return true
    }),
  ]

  return EditorState.create({ doc, extensions })
}
