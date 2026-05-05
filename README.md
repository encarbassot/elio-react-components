# elio-react-components

Open-source React component library — customizable, themeable, and composable.

[![npm](https://img.shields.io/npm/v/@encarbassot/elio-react-components)](https://www.npmjs.com/package/@encarbassot/elio-react-components)
[![license](https://img.shields.io/github/license/encarbassot/elio-react-components)](./LICENSE)

---

## Install

```bash
npm install @encarbassot/elio-react-components
```

React 17+ is required as a peer dependency.

---

## Usage

```tsx
import { InputText, useDebounce } from '@encarbassot/elio-react-components'
import '@encarbassot/elio-react-components/styles'
```

---

## Theming

All visual decisions are driven by CSS variables. Override them globally or per-component:

```css
/* global override */
:root {
  --elio-primary:  #6366f1;
  --elio-radius:   8px;
  --elio-font:     'Inter', sans-serif;
}

/* dark theme */
[data-theme="dark"] {
  --elio-bg:       #0d0d0d;
  --elio-surface:  #111111;
  --elio-text:     #e0e0e0;
  --elio-border:   #2a2a2a;
}
```

Full variable reference: [`rules.md § 3`](./rules.md#3-theming-via-css-variables)

---

## Components

| Component | Description |
|---|---|
| `BouncingDots` | Animated loading indicator |
| `BubbleWrapper` | Portal-based hover popup |
| `Calendar` | Date / range picker |
| `Editor` | editor.js rich text editor |
| `EditorOutput` | Renders editor.js JSON as HTML |
| `ElioForm` | Auto-generates form from a model schema |
| `Hint` | Info icon with tooltip modal |
| `InfinityScroll` | Paginated / virtual scroll container |
| `Navbar` | Responsive navigation bar |
| `Table` | Sortable, resizable, editable data table |
| `TemplateSidePanel` | Collapsible sidebar layout |
| `InputText` | Text / number input with icon and validation |
| `InputPassword` | Password input with visibility toggle |
| `InputPhone` | Dual-field phone input with formatting |
| `InputSelect` | Custom dropdown |
| `InputToggle` | Toggle switch |
| `InputTime` | HH:MM time picker |
| `Modal` | Base portal modal |
| `TextModal` | Modal with title, body, and action buttons |
| `ButtonModal` | Button that triggers a TextModal |

---

## Hooks

| Hook | Description |
|---|---|
| `useDebounce` | Debounce a callback with configurable delay |
| `useStateDebounced` | State with instant + debounced values |
| `useLocalStorage` | State synced to localStorage |
| `useForm` | Form state, validation, and error handling |
| `useApiError` | Parses API error responses; returns a modal |

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).  
All contributors must follow [`rules.md`](./rules.md).

---

## License

MIT © [Eloi Fàbrega](https://github.com/encarbassot)
