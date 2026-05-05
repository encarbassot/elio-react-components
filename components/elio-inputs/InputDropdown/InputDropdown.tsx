import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

export interface DropdownOption<V = string> {
  value: V
  label: string
  disabled?: boolean
}

export interface InputDropdownProps<V = string> {
  // Core
  options?: DropdownOption<V>[]
  value?: V | null
  onChange?: (value: V | null) => void
  placeholder?: string
  disabled?: boolean

  // Label / validation
  label?: string
  error?: string
  hint?: string

  // Feature flags
  searchable?: boolean
  clearable?: boolean
  pinnable?: boolean

  // Controlled pins (optional — uncontrolled if omitted)
  pinnedValues?: V[]
  onPinChange?: (pinned: V[]) => void

  // Custom rendering
  renderOption?: (
    opt: DropdownOption<V>,
    meta: { pinned: boolean; selected: boolean; focused: boolean }
  ) => React.ReactNode

  // Panel position
  direction?: 'down' | 'up'

  // Root element
  className?: string
  style?: React.CSSProperties

  // TODO: multiple?: boolean
  // TODO: onSearch?: (query: string) => Promise<DropdownOption<V>[]>
}

// ── Component ────────────────────────────────────────────────────────────────

export function InputDropdown<V = string>({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  label,
  error,
  hint,
  searchable = false,
  clearable = false,
  pinnable = false,
  pinnedValues: controlledPinned,
  onPinChange,
  renderOption,
  direction = 'down',
  className,
  style,
}: InputDropdownProps<V>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [internalPinned, setInternalPinned] = useState<V[]>([])

  const rootRef    = useRef<HTMLDivElement>(null)
  const searchRef  = useRef<HTMLInputElement>(null)
  const listRef    = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const pinned = controlledPinned ?? internalPinned

  // Close on outside click — composedPath for shadow DOM compat
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!e.composedPath().some(el => el === rootRef.current)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Sync focusedIdx to selected item and move focus into the panel when dropdown opens
  useEffect(() => {
    if (open) {
      const idx = filtered.findIndex(o => o.value === value)
      setFocusedIdx(idx >= 0 ? idx : 0)
      requestAnimationFrame(() => {
        if (searchable) searchRef.current?.focus()
        else listRef.current?.focus()
      })
    } else {
      setQuery('')
    }
  }, [open])

  // Scroll focused option into view
  useEffect(() => {
    const el = listRef.current?.children[focusedIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedIdx])

  // ── Computed options ──────────────────────────────────────────────────────

  const filtered: DropdownOption<V>[] = (() => {
    const q = query.toLowerCase()
    const base = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options
    if (!pinnable || pinned.length === 0) return base
    return [
      ...base.filter(o => pinned.includes(o.value)),
      ...base.filter(o => !pinned.includes(o.value)),
    ]
  })()

  const selectedOption = options.find(o => o.value === value)

  // ── Actions ───────────────────────────────────────────────────────────────

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function select(opt: DropdownOption<V>) {
    if (opt.disabled) return
    onChange?.(opt.value)
    close()
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.(null)
  }

  function togglePin(e: React.MouseEvent, val: V) {
    e.stopPropagation()
    const next = pinned.includes(val)
      ? pinned.filter(p => p !== val)
      : [...pinned, val]
    if (onPinChange) onPinChange(next)
    else setInternalPinned(next)
  }

  // ── Keyboard handlers ─────────────────────────────────────────────────────

  function navDown()  { setFocusedIdx(i => Math.min(i + 1, filtered.length - 1)) }
  function navUp()    { setFocusedIdx(i => Math.max(0, i - 1)) }
  function navEnter() { if (filtered[focusedIdx]) select(filtered[focusedIdx]) }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); setOpen(true)
    }
    if (e.key === 'Escape') close()
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown')      { e.preventDefault(); navDown() }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); navUp() }
    else if (e.key === 'Enter')     { e.preventDefault(); navEnter() }
    else if (e.key === 'Escape')    { e.preventDefault(); close() }
    else if (e.key === 'Tab')       { close() }
    else                            { setFocusedIdx(0) }
  }

  function handleListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'ArrowDown')      { e.preventDefault(); navDown() }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); navUp() }
    else if (e.key === 'Enter')     { e.preventDefault(); navEnter() }
    else if (e.key === 'Escape')    { e.preventDefault(); close() }
    else if (e.key === 'Tab')       { close() }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const triggerBorder = error ? 'border-elio-danger' : open ? 'border-elio-primary/25' : 'border-elio-border hover:border-elio-primary/25'

  return (
    <div
      ref={rootRef}
      style={style}
      className={[
        'relative inline-flex flex-col gap-1 font-[inherit] text-[13px] text-elio-text min-w-[120px]',
        disabled && 'opacity-50 pointer-events-none',
        className,
      ].filter(Boolean).join(' ')}
    >

      {label && (
        <label className="text-[11px] text-elio-muted tracking-[0.04em]">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen(v => !v)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          'flex items-center gap-1.5 w-full',
          'bg-elio-surface border rounded-[3px]',
          'text-elio-text font-[inherit] text-[inherit]',
          'px-2.5 py-[7px] cursor-pointer text-left',
          'transition-colors outline-none',
          'focus-visible:border-elio-primary/25 focus-visible:shadow-[0_0_0_2px_theme(colors.elio-primary/8)]',
          triggerBorder,
        ].join(' ')}
      >
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {selectedOption
            ? selectedOption.label
            : <span className="text-elio-muted">{placeholder}</span>
          }
        </span>

        {clearable && value != null && (
          <span
            onClick={clear}
            role="button"
            aria-label="Clear selection"
            tabIndex={-1}
            className="text-elio-muted text-[11px] shrink-0 cursor-pointer px-0.5 transition-colors hover:text-elio-danger"
          >
            ✕
          </span>
        )}

        <span
          aria-hidden
          className={[
            'text-elio-muted text-[11px] shrink-0 transition-transform',
            open && 'rotate-180',
          ].filter(Boolean).join(' ')}
        >
          ▾
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="listbox"
          className={[
            'absolute left-0 right-0 z-[100] bg-elio-surface border border-elio-border rounded-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden',
            direction === 'up' ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]',
          ].join(' ')}
        >

          {searchable && (
            <div className="p-2 pb-1.5 border-b border-elio-border">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setFocusedIdx(0) }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search…"
                aria-label="Search options"
                className="w-full bg-elio-raised border border-elio-border rounded-[2px] text-elio-text font-[inherit] text-[12px] px-2 py-[5px] outline-none transition-colors focus:border-elio-primary/25 placeholder:text-elio-muted"
              />
            </div>
          )}

          <ul
            ref={listRef}
            tabIndex={searchable ? -1 : 0}
            onKeyDown={!searchable ? handleListKeyDown : undefined}
            aria-label={label}
            className="list-none m-0 p-0 max-h-[220px] overflow-y-auto outline-none [scrollbar-width:thin] [scrollbar-color:theme(colors.elio-border)_transparent]"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-[12px] text-elio-muted text-center">
                No options
              </li>
            )}

            {filtered.map((opt, i) => {
              const isSelected = opt.value === value
              const isPinned   = pinned.includes(opt.value)
              const isFocused  = i === focusedIdx

              return (
                <li
                  key={String(opt.value)}
                  onClick={() => select(opt)}
                  onMouseEnter={() => setFocusedIdx(i)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  className={[
                    'flex items-center gap-2 px-3 py-2 cursor-pointer select-none transition-colors',
                    'group',
                    isSelected ? 'text-elio-primary' : 'text-elio-muted',
                    (isFocused || (!isSelected && false)) && 'bg-elio-primary/8 text-elio-text',
                    isFocused && 'bg-elio-primary/8 text-elio-text',
                    isPinned && 'border-l-2 border-elio-primary/25 pl-2.5',
                    opt.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                  ].filter(Boolean).join(' ')}
                >
                  {renderOption
                    ? renderOption(opt, { pinned: isPinned, selected: isSelected, focused: isFocused })
                    : (
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {isSelected && <span className="text-[11px]">✓ </span>}
                        {opt.label}
                      </span>
                    )
                  }

                  {pinnable && (
                    <button
                      type="button"
                      onClick={e => togglePin(e, opt.value)}
                      aria-label={isPinned ? 'Unpin' : 'Pin to top'}
                      tabIndex={-1}
                      className={[
                        'bg-transparent border-none cursor-pointer text-[14px] px-0.5 leading-none shrink-0 transition-[opacity,color]',
                        isPinned ? 'opacity-100 text-[#f5c518]' : 'opacity-0 text-elio-muted group-hover:opacity-100',
                      ].join(' ')}
                    >
                      {isPinned ? '★' : '☆'}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {hint  && !error && <span className="text-[11px] text-elio-muted">{hint}</span>}
      {error && <span className="text-[11px] text-elio-danger">{error}</span>}

    </div>
  )
}
