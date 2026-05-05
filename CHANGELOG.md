# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `package.json` — proper npm package setup with ESM + CJS dual output via tsup
- `tsconfig.json` — TypeScript configuration
- `tsup.config.ts` — build configuration
- `src/index.ts` — central barrel export for all components, hooks, and utils
- `rules.md` — contributor rules: TypeScript, theming contract, accessibility, naming conventions
- `CONTRIBUTING.md` — contributor guide

---

## [0.1.0] — initial

### Added
- `BouncingDots` — animated loading dots
- `BubbleWrapper` — portal-based hover popup
- `Calendar` — date / range picker
- `Editor` + `EditorOutput` — editor.js wrapper + renderer
- `ElioForm` — auto-generated form from model schema
- `Hint` — info icon with modal tooltip
- `InfinityScroll` — virtual/paginated scroll container
- `Navbar` + `NavbarButton` — responsive navigation bar
- `Table` — sortable, resizable, editable data table
- `TemplateSidePanel` — collapsible sidebar layout
- `InputText`, `InputPassword`, `InputPhone`, `InputSelect`, `InputToggle`, `InputTime`
- `Modal`, `TextModal`, `ButtonModal`, `ModalsContext`
- `useDebounce`, `useStateDebounced`, `useLocalStorage`
- `useForm` — form state + validation hook
- `useApiError` — API error handler
- `color.js`, `utils.js`, `levensthein.js` utilities
