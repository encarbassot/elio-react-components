import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import './EliSelect.css'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption<V = string> {
  value: V
  label: string
  disabled?: boolean
}

export interface EliSelectProps<V = string> {
  // Core
  options?: SelectOption<V>[]
  value?: V | null
  onChange?: (value: V | null) => void
  placeholder?: string
  disabled?: boolean

  // Label / validation
  label?: string
  error?: string
  hint?: string

  // Feature flags
  searchable?: boolean     // filter options by typing
  clearable?: boolean      // show ✕ to reset value
  pinnable?: boolean       // star/pin options to top

  // Controlled pins (optional — uncontrolled if omitted)
  pinnedValues?: V[]
  onPinChange?: (pinned: V[]) => void

  // Custom rendering
  renderOption?: (
    opt: SelectOption<V>,
    meta: { pinned: boolean; selected: boolean; focused: boolean }
  ) => React.ReactNode

  // Root element
  className?: string
  style?: React.CSSProperties

  // TODO: multiple?: boolean
  // TODO: onSearch?: (query: string) => Promise<SelectOption<V>[]>
}

// ── Component ────────────────────────────────────────────────────────────────

export function EliSelect<V = string>({
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
  className,
  style,
}: EliSelectProps<V>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [internalPinned, setInternalPinned] = useState<V[]>([])

  const rootRef   = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef   = useRef<HTMLUListElement>(null)
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchable) requestAnimationFrame(() => searchRef.current?.focus())
    if (!open) { setQuery(''); setFocusedIdx(0) }
  }, [open, searchable])

  // Scroll focused option into view
  useEffect(() => {
    const el = listRef.current?.children[focusedIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedIdx])

  // ── Computed options ──────────────────────────────────────────────────────

  const filtered: SelectOption<V>[] = (() => {
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

  function select(opt: SelectOption<V>) {
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
    if (e.key === 'ArrowDown')  { e.preventDefault(); navDown() }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); navUp() }
    else if (e.key === 'Enter')     { e.preventDefault(); navEnter() }
    else if (e.key === 'Escape')    { e.preventDefault(); close() }
    else if (e.key === 'Tab')       { close() }
    else                            { setFocusedIdx(0) }
  }

  function handleListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'ArrowDown')  { e.preventDefault(); navDown() }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); navUp() }
    else if (e.key === 'Enter')     { e.preventDefault(); navEnter() }
    else if (e.key === 'Escape')    { e.preventDefault(); close() }
    else if (e.key === 'Tab')       { close() }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const rootClass = [
    'elio-select',
    disabled && 'elio-select--disabled',
    open      && 'elio-select--open',
    error     && 'elio-select--error',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div ref={rootRef} className={rootClass} style={style}>

      {label && (
        <label className="elio-select__label">{label}</label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className="elio-select__trigger"
        onClick={() => !disabled && setOpen(v => !v)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="elio-select__value">
          {selectedOption
            ? selectedOption.label
            : <span className="elio-select__placeholder">{placeholder}</span>
          }
        </span>

        {clearable && value != null && (
          <span
            className="elio-select__clear"
            onClick={clear}
            role="button"
            aria-label="Clear selection"
            tabIndex={-1}
          >
            ✕
          </span>
        )}

        <span className="elio-select__arrow" aria-hidden>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="elio-select__dropdown" role="listbox">

          {searchable && (
            <div className="elio-select__search-wrap">
              <input
                ref={searchRef}
                type="text"
                className="elio-select__search"
                value={query}
                onChange={e => { setQuery(e.target.value); setFocusedIdx(0) }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search…"
                aria-label="Search options"
              />
            </div>
          )}

          <ul
            ref={listRef}
            className="elio-select__list"
            tabIndex={searchable ? -1 : 0}
            onKeyDown={!searchable ? handleListKeyDown : undefined}
            aria-label={label}
          >
            {filtered.length === 0 && (
              <li className="elio-select__empty">No options</li>
            )}

            {filtered.map((opt, i) => {
              const isSelected = opt.value === value
              const isPinned   = pinned.includes(opt.value)
              const isFocused  = i === focusedIdx

              const itemClass = [
                'elio-select__option',
                isSelected   && 'elio-select__option--selected',
                isFocused    && 'elio-select__option--focused',
                isPinned     && 'elio-select__option--pinned',
                opt.disabled && 'elio-select__option--disabled',
              ].filter(Boolean).join(' ')

              return (
                <li
                  key={String(opt.value)}
                  className={itemClass}
                  onClick={() => select(opt)}
                  onMouseEnter={() => setFocusedIdx(i)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                >
                  {renderOption
                    ? renderOption(opt, { pinned: isPinned, selected: isSelected, focused: isFocused })
                    : <span className="elio-select__option-label">{opt.label}</span>
                  }

                  {pinnable && opt.value !== ('' as unknown as V) && (
                    <button
                      type="button"
                      className={`elio-select__pin${isPinned ? ' elio-select__pin--active' : ''}`}
                      onClick={e => togglePin(e, opt.value)}
                      aria-label={isPinned ? 'Unpin' : 'Pin to top'}
                      tabIndex={-1}
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

      {hint  && !error && <span className="elio-select__hint">{hint}</span>}
      {error && <span className="elio-select__error">{error}</span>}

    </div>
  )
}
