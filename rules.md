# Component Rules

These rules apply to every component, hook, and utility in this library.
They exist so that any contributor — or any project consuming this library — gets a consistent, predictable experience.

---

## 1. TypeScript first

All new code is TypeScript (`.ts` / `.tsx`). Existing `.jsx` / `.js` files should be migrated when touched.

- Export a named `Props` interface for every component (e.g. `ButtonProps`, `InputTextProps`)
- Prefer `interface` over `type` for component props
- Never use `any`. Use `unknown` and narrow it

```tsx
// ✅
export interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'ghost' | 'danger'
}

// ❌
export function Button(props: any) { ... }
```

---

## 2. Every component is fully customizable

Components must never hardcode layout, spacing, or color decisions that block consumers.
**Minimum contract** — every component accepts:

```tsx
className?: string   // merged onto root element
style?: React.CSSProperties  // merged onto root element
```

Internal class names must never conflict with consumer names. Prefix all internal class names with `elio-`:

```css
/* ✅ */
.elio-button { ... }
.elio-button--primary { ... }

/* ❌ */
.button { ... }
.primary { ... }
```

---

## 3. Theming via CSS variables

All visual decisions (color, radius, font, spacing) use CSS variables with the `--elio-` prefix.
Consumers override them at the `:root` or component level — no JS theme object required.

### Required variable contract

```css
:root {
  /* Colors */
  --elio-primary:       #7fff7f;
  --elio-primary-dim:   rgba(127, 255, 127, 0.12);
  --elio-danger:        #ff6b6b;
  --elio-danger-dim:    rgba(255, 107, 107, 0.12);
  --elio-success:       #7fff7f;

  /* Surfaces */
  --elio-bg:            #ffffff;
  --elio-surface:       #f5f5f5;
  --elio-surface-raised:#ebebeb;
  --elio-border:        #e0e0e0;

  /* Text */
  --elio-text:          #111111;
  --elio-text-muted:    #888888;

  /* Shape */
  --elio-radius:        4px;
  --elio-radius-sm:     2px;
  --elio-radius-lg:     8px;

  /* Typography */
  --elio-font:          ui-sans-serif, system-ui, sans-serif;
  --elio-font-mono:     ui-monospace, 'Cascadia Code', monospace;

  /* Motion */
  --elio-transition:    0.15s ease;
}
```

Components use these variables internally. Never hardcode a hex color or pixel radius in component CSS.

```css
/* ✅ */
.elio-button {
  background: var(--elio-primary);
  border-radius: var(--elio-radius);
}

/* ❌ */
.elio-button {
  background: #7fff7f;
  border-radius: 4px;
}
```

---

## 4. No hardcoded strings

User-visible text must always come from props. Provide sensible English defaults.

```tsx
// ✅
interface ConfirmModalProps {
  confirmLabel?: string   // default: "Confirm"
  cancelLabel?: string    // default: "Cancel"
}

// ❌
<button>Aceptar</button>
```

---

## 5. No mandatory peer dependencies beyond React

React and ReactDOM are the only required peer dependencies.
Heavy optional dependencies (moment, editor.js, etc.) must be:

- Listed as `peerDependencies` with `optional: true`, OR
- Documented clearly as "this component requires X installed separately"

Prefer lightweight alternatives: `date-fns` over `moment`, native browser APIs over lodash.

---

## 6. Accessible by default

- All interactive elements are keyboard-reachable (`Tab`, `Enter`, `Escape`, `Arrow` keys where appropriate)
- Use semantic HTML: `<button>`, `<label>`, `<input>`, not `<div onClick>`
- Provide `aria-label` props where the visual label isn't sufficient
- Inputs must be associated with their labels via `htmlFor` / `id` or `aria-labelledby`

---

## 7. Composable over monolithic

Prefer exporting small primitives that compose, rather than one massive component with 40 props.

```tsx
// ✅ — consumer composes
<Modal>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button>OK</Button>
  </Modal.Footer>
</Modal>

// ❌ — one blob
<Modal title="Title" body="Content" confirmLabel="OK" onConfirm={...} cancelLabel="Cancel" onCancel={...} />
```

---

## 8. File structure

Every component lives in its own folder:

```
components/
  Button/
    Button.tsx          ← component
    Button.css          ← scoped styles (no global selectors)
    Button.types.ts     ← exported types/interfaces (if large)
    index.ts            ← re-exports for clean imports
```

Hooks live in `hooks/` with one file per hook:
```
hooks/
  useDebounce.ts
  useLocalStorage.ts
  useForm/
    useForm.ts
    validators/
```

---

## 9. Each component is self-documented

Every exported component must have a JSDoc comment covering:
- What it does in one sentence
- All non-obvious props
- At least one usage example

```tsx
/**
 * Animated three-dot loading indicator.
 *
 * @example
 * <BouncingDots size={8} color="var(--elio-primary)" />
 */
export function BouncingDots({ size = 6, color = 'currentColor', className }: BouncingDotsProps) {
```

---

## 10. Changelog discipline

Every PR that ships a component change updates `CHANGELOG.md` under the `[Unreleased]` section.
Format: `Added`, `Changed`, `Fixed`, `Removed` (Keep a Changelog convention).

---

## Summary checklist for every new component

- [ ] TypeScript (`.tsx`)
- [ ] `Props` interface exported
- [ ] `className` and `style` forwarded to root element
- [ ] All class names prefixed `elio-`
- [ ] Colors/radius/font via `--elio-*` variables only
- [ ] No hardcoded user-visible strings
- [ ] Keyboard accessible
- [ ] JSDoc + usage example
- [ ] `index.ts` re-export
- [ ] Added to `src/index.ts`
- [ ] `CHANGELOG.md` updated
