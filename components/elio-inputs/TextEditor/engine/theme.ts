import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'

/**
 * Default CM6 theme for TextEditor.
 * Uses CSS custom properties so consuming apps can override via --elio-primary.
 */
export const defaultTheme: Extension = EditorView.theme(
  {
    '&': {
      height: '100%',
      background: 'transparent',
      color: 'var(--elio-text, #e2e8f0)',
    },

    '.cm-scroller': {
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: '14px',
      lineHeight: '1.75',
      overflow: 'auto',
    },

    '.cm-content': {
      padding: '12px 16px',
      caretColor: 'var(--elio-primary, #4ade80)',
    },

    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--elio-primary, #4ade80)',
      borderLeftWidth: '2px',
    },

    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--elio-primary, #4ade80)',
    },

    '.cm-selectionBackground': {
      background: 'rgba(74,222,128,0.12)',
    },

    '&.cm-focused .cm-selectionBackground, ::selection': {
      background: 'rgba(74,222,128,0.16)',
    },

    '.cm-activeLine': {
      background: 'rgba(255,255,255,0.025)',
      borderRadius: '2px',
    },

    '.cm-gutters': {
      display: 'none',
    },

    '.cm-placeholder': {
      color: 'var(--elio-muted, #475569)',
      fontStyle: 'italic',
    },

    '.cm-tooltip': {
      background: 'var(--elio-surface, #111111)',
      border: '1px solid var(--elio-border, #1e293b)',
      borderRadius: '6px',
      color: 'var(--elio-text, #e2e8f0)',
      fontSize: '13px',
    },

    '.cm-tooltip-autocomplete > ul > li': {
      padding: '4px 10px',
    },

    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      background: 'rgba(74,222,128,0.15)',
      color: 'var(--elio-text, #e2e8f0)',
    },
  },
  { dark: true },
)
