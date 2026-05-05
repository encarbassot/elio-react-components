import { useEffect, useRef } from 'react'
import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { createEditorState } from './engine/createEditorState'
import { decoConfigCompartment, makeDecoExtension } from './engine/decorations'
import { toolbarActions } from './engine/keymaps'
import './engine/editor.css'

// ── Types ────────────────────────────────────────────────────────────────────

export type ToolbarMode = 'none' | 'compact' | 'full'

export interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  autoFocus?: boolean
  /** Show syntax markers (rich mode). Default: false (pretty mode) */
  richFormatting?: boolean
  /** Toolbar to display. Default: 'none' */
  toolbar?: ToolbarMode
  minHeight?: string | number
  maxHeight?: string | number
  className?: string
  style?: React.CSSProperties
  /** Access the underlying EditorView for advanced use */
  editorRef?: React.MutableRefObject<EditorView | null>
  /** Additional CM6 extensions (e.g. a custom theme) */
  cmExtensions?: Extension[]
}

// ── Toolbar icons ─────────────────────────────────────────────────────────────

function Btn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className="mde-tb-btn"
    >
      {children}
    </button>
  )
}

function Sep() { return <span className="mde-tb-sep" /> }

function Toolbar({ mode, view }: { mode: ToolbarMode; view: EditorView | null }) {
  if (mode === 'none' || !view) return null
  const act = (fn: (v: EditorView) => boolean) => () => { fn(view); view.focus() }

  return (
    <div className="mde-toolbar">
      <Btn title="Bold (⌘B)" onClick={act(toolbarActions.bold)}><b>B</b></Btn>
      <Btn title="Italic (⌘I)" onClick={act(toolbarActions.italic)}><i>I</i></Btn>
      <Btn title="Code (⌘E)" onClick={act(toolbarActions.code)}><code>`</code></Btn>
      <Btn title="Link (⌘K)" onClick={act(toolbarActions.link)}>🔗</Btn>

      {mode === 'full' && (
        <>
          <Sep />
          <Btn title="Heading 1" onClick={act(toolbarActions.h1)}>H1</Btn>
          <Btn title="Heading 2" onClick={act(toolbarActions.h2)}>H2</Btn>
          <Btn title="Heading 3" onClick={act(toolbarActions.h3)}>H3</Btn>
          <Sep />
          <Btn title="Bullet list" onClick={act(toolbarActions.ul)}>• List</Btn>
          <Btn title="Numbered list" onClick={act(toolbarActions.ol)}>1. List</Btn>
          <Btn title="Blockquote" onClick={act(toolbarActions.blockquote)}>&gt; Quote</Btn>
        </>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TextEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  autoFocus = false,
  richFormatting = false,
  toolbar = 'none',
  minHeight,
  maxHeight,
  className,
  style,
  editorRef,
  cmExtensions,
}: TextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef      = useRef<EditorView | null>(null)
  const onChangeRef  = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange })

  // ── Mount / unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    const view = new EditorView({
      state: createEditorState({
        doc: value,
        onChange: (val) => onChangeRef.current(val),
        placeholder,
        readOnly,
        decoConfig: { richFormatting },
        extraExtensions: cmExtensions,
      }),
      parent: containerRef.current,
    })
    viewRef.current = view
    if (editorRef) editorRef.current = view
    containerRef.current.setAttribute('data-rich', richFormatting ? 'true' : 'false')
    if (autoFocus) requestAnimationFrame(() => view.focus())
    return () => {
      view.destroy()
      viewRef.current = null
      if (editorRef) editorRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sync value from outside ────────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } })
    }
  }, [value])

  // ── readOnly change ────────────────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.setState(createEditorState({
      doc: view.state.doc.toString(),
      onChange: (val) => onChangeRef.current(val),
      placeholder,
      readOnly,
      decoConfig: { richFormatting },
      extraExtensions: cmExtensions,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly])

  // ── richFormatting toggle (hot-swap, no remount) ───────────────────────────
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({ effects: decoConfigCompartment.reconfigure(makeDecoExtension({ richFormatting })) })
    if (containerRef.current) containerRef.current.setAttribute('data-rich', richFormatting ? 'true' : 'false')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richFormatting])

  const shellStyle: React.CSSProperties = {
    minHeight,
    maxHeight,
    ...style,
  }

  return (
    <div
      className={['mde-shell', className].filter(Boolean).join(' ')}
      style={shellStyle}
    >
      <Toolbar mode={toolbar} view={viewRef.current} />
      <div ref={containerRef} className="mde-container" />
    </div>
  )
}
