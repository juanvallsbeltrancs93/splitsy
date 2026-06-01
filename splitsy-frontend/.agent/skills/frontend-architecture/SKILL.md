# Frontend Architecture — Clean Hexagonal with Compartmentalized UI

## Scope

This skill governs **folder structure, layer boundaries, and dependency rules** for the Splitsy frontend. Apply it when creating files, moving code, or refactoring structure.

---

## Layer Structure

```
src/
├── domain/          # Pure business logic — NO framework deps, NO imports from data/ or presentation/
│   ├── models/      # Interfaces, types, value objects
│   └── services/    # Pure business logic functions (no side effects)
│
├── data/            # Repository implementations — NO presentation imports
│   ├── repositories/
│   └── api/         # HTTP clients, fetch wrappers
│
└── presentation/    # React UI — MAY import from domain/, NEVER from data/ directly
    ├── components/
    │   ├── ui/      # Pure, reusable UI components (Button, Modal, Input…)
    │   └── shared/  # Shared composite components used across views
    ├── views/       # Page-level composition components (formerly "pages/")
    ├── context/     # React context providers
    ├── routes/      # Route definitions only
    ├── styles/      # Global CSS variables, resets, typography
    └── utils/
        └── hooks/   # ONLY truly shared, stateless utility hooks (e.g., useMediaQuery)
```

### Dependency Direction (STRICT)

```
presentation → domain ✅
data         → domain ✅
domain       → (nothing) ✅

presentation → data   ❌  (use dependency injection via context or hooks)
data         → presentation ❌
domain       → data   ❌
domain       → presentation ❌
```

---

## Layer Rules

### `domain/`
- MUST contain only plain TypeScript — no React, no fetch, no side effects
- Types and interfaces that represent business concepts go here
- Functions that transform domain data go here

### `data/`
- Repository pattern: one repository per domain entity
- Each repository implements a domain-defined interface
- API clients live here — NOT in `presentation/`
- React Query `queryFn` / `mutationFn` implementations live here

### `presentation/`

#### `views/` — Composition Only
- Views (pages) MUST only compose components
- Views MUST NOT manage component-internal state
- Views MUST NOT prop-drill logic into children
- Views MUST NOT contain `useState`, `useReducer`, event handlers, or API calls

```tsx
// ✅ CORRECT — GroupDetailView is pure composition
export function GroupDetailView() {
  return (
    <PageLayout>
      <GroupHeader />
      <ExpenseList />
      <AddExpenseDialog />
    </PageLayout>
  );
}

// ❌ WRONG — view managing child logic
export function GroupDetailView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  // ... 30 more lines of logic that belong in AddExpenseDialog
  return <AddExpenseDialog isOpen={isDialogOpen} onTitleChange={setTitle} title={title} ... />;
}
```

#### `context/`
See component-patterns skill for the full context folder pattern.

#### `presentation/utils/hooks/` — Restricted Use
This folder is ONLY for hooks that are:
1. Stateless utility hooks (e.g., `useMediaQuery`, `useDebounce`)
2. Used by 3+ unrelated components
3. Contain NO business logic

**FORBIDDEN** in this folder:
- Hooks that belong to a specific component
- Hooks that call APIs
- Hooks that contain business logic

> If a hook is only used by one component, it lives INSIDE that component's folder.

---

## Barrel Export Conventions

Every component folder MUST have an `index.ts`:
```ts
// presentation/components/ui/GroupCard/index.ts
export { GroupCard } from './GroupCard';
```

Category folders MUST have an `index.ts` re-exporting all children:
```ts
// presentation/components/ui/index.ts
export { GroupCard } from './GroupCard';
export { ExpenseItem } from './ExpenseItem';
export { AddExpenseDialog } from './AddExpenseDialog';
```

Import from the folder, NEVER from the file:
```ts
// ✅ CORRECT
import { GroupCard } from '../GroupCard';
import { GroupCard } from '@/presentation/components/ui';

// ❌ WRONG
import { GroupCard } from '../GroupCard/GroupCard';
import { GroupCard } from '../GroupCard/GroupCard.tsx';
```

---

## Known Splitsy Anti-Patterns to Fix

| Current (wrong) | Correct |
|---|---|
| `presentation/hooks/` global folder | Dissolve — co-locate each hook inside its component folder |
| Flat `.tsx` files (e.g. `GroupCard.tsx`) | Move into `GroupCard/` folder with full 4-file structure |
| `GroupDetailPage.tsx` managing dialog state | `AddExpenseDialog` owns its own state via `useAddExpenseDialog` |
| `GroupCard.css` as sibling file | `GroupCard/styles.css` inside the component folder |

---

## Checklist Before Committing

- [ ] No imports cross layer boundaries in the wrong direction
- [ ] `views/` contains zero `useState` / logic — only component composition
- [ ] `presentation/utils/hooks/` contains only stateless utility hooks
- [ ] All components are folder-based (see component-patterns skill)
- [ ] All folders have `index.ts` barrel exports
- [ ] No global `hooks/` folder exists
