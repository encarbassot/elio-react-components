çimport { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import './InputDropdown.css'

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
  searchable?: boolean     // filter options by typing
  clearable?: boolean      // show ✕ to reset value
  pinnable?: boolean       // star/pin options to top

  // Controlled pins (optional — uncontrolled if omitted)
  pinnedValues?: V[]
  onPinChange?: (pinned: V[]) => void

  // Custom rendering
  renderOption?: (
    opt: DropdownOption<V>,
    meta: { pinned: boolean; selected: boolean; focused: boolean }
  ) => React.ReactNode

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

  const rootClass = [
    'elio-dropdown',
    disabled && 'elio-dropdown--disabled',
    open      && 'elio-dropdown--open',
    error     && 'elio-dropdown--error',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div ref={rootRef} className={rootClass} style={style}>

      {label && (
        <label className="elio-dropdown__label">{label}</label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className="elio-dropdown__trigger"
        onClick={() => !disabled && setOpen(v => !v)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="elio-dropdown__value">
          {selectedOption
            ? selectedOption.label
            : <span className="elio-dropdown__placeholder">{placeholder}</span>
          }
        </span>

        {clearable && value != null && (
          <span
            className="elio-dropdown__clear"
            onClick={clear}
            role="button"
            aria-label="Clear selection"
            tabIndex={-1}
          >
            ✕
          </span>
        )}

        <span className="elio-dropdown__arrow" aria-hidden>▾</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="elio-dropdown__panel" role="listbox">

          {searchable && (
            <div className="elio-dropdown__search-wrap">
              <input
                ref={searchRef}
                type="text"
                className="elio-dropdown__search"
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
            className="elio-dropdown__list"
            tabIndex={searchable ? -1 : 0}
            onKeyDown={!searchable ? handleListKeyDown : undefined}
            aria-label={label}
          >
            {filtered.length === 0 && (
              <li className="elio-dropdown__empty">No options</li>
            )}

            {filtered.map((opt, i) => {
              const isSelected = opt.value === value
              const isPinned   = pinned.includes(opt.value)
              const isFocused  = i === focusedIdx

              const itemClass = [
                'elio-dropdown__option',
                isSelected   && 'elio-dropdown__option--selected',
                isFocused    && 'elio-dropdown__option--focused',
                isPinned     && 'elio-dropdown__option--pinned',
                opt.disabled && 'elio-dropdown__option--disabled',
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
                    : <span className="elio-dropdown__option-label">{opt.label}</span>
                  }

                  {pinnable && (
                    <button
                      type="button"
                      className={`elio-dropdown__pin${isPinned ? ' elio-dropdown__pin--active' : ''}`}
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

      {hint  && !error && <span className="elio-dropdown__hint">{hint}</span>}
      {error && <span className="elio-dropdown__error">{error}</span>}

    </div>
  )
}
