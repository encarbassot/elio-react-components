# Contributing

Thanks for contributing. Here's everything you need to get started.

---

## Setup

```bash
git clone https://github.com/encarbassot/elio-react-components.git
cd elio-react-components
npm install
npm run dev   # watch mode — rebuilds on save
```

---

## Before you start

Read [`rules.md`](./rules.md). It's short and covers the contract every component must follow.  
The most important points:

- TypeScript only
- `className` + `style` on every component root
- Class names prefixed `elio-`
- Colors/sizes via `--elio-*` CSS variables
- No hardcoded strings

---

## Adding a component

1. Create a folder under `components/YourComponent/`
2. Write `YourComponent.tsx` + `YourComponent.css`
3. Add `index.ts` re-export inside the folder
4. Add the export to `src/index.ts`
5. Add a JSDoc comment with a usage example
6. Update `CHANGELOG.md` under `[Unreleased] > Added`

---

## Adding a hook

1. Create `hooks/useYourHook.ts`
2. Export from `src/index.ts`
3. JSDoc the parameters and return value
4. Update `CHANGELOG.md`

---

## Migrating an existing `.jsx` file

1. Rename to `.tsx`
2. Add a `Props` interface
3. Replace any `any` with proper types
4. Rename CSS classes to use `elio-` prefix
5. Replace hardcoded colors/radii with `--elio-*` variables
6. Replace hardcoded strings with props (English defaults)
7. Update the export in `src/index.ts`

---

## Pull request checklist

- [ ] Follows all rules in `rules.md`
- [ ] No new peer dependencies without discussion
- [ ] `CHANGELOG.md` updated
- [ ] TypeScript — no `any`, no type errors
- [ ] Tested manually in a browser

---

## Commit style

```
type(scope): short description

feat(Button): add ghost variant
fix(InputText): correct focus ring color on dark themes
docs(Table): add sorting example to JSDoc
refactor(Modal): migrate to TypeScript
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- `patch` — bug fixes, no API change
- `minor` — new component or prop, backwards compatible
- `major` — breaking change to existing API

Maintainer cuts releases. Contributors update `CHANGELOG.md`.
