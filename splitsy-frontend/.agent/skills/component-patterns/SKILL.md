# Component Patterns — Compartmentalized, Self-Contained Components

## Scope

This skill governs **how individual components are structured** in Splitsy. Apply it when creating, refactoring, or reviewing any React component.

---

## The 4-File Folder Pattern (MANDATORY for all non-trivial components)

Every component that has any logic MUST be a PascalCase folder:

```
GroupCard/
├── GroupCard.tsx       # Pure UI — JSX only, no logic
├── useGroupCard.ts     # ALL logic — state, handlers, API calls
├── types.ts            # Component-specific types/interfaces
├── styles.css          # Co-located styles
└── index.ts            # Barrel export
```

Even simple components with minimal logic follow this structure. The only exception is a truly stateless, prop-only display component with no handlers and no types beyond what's inlined in the props signature.

---

## Rule 1: Zero-Logic `.tsx` Files

The `.tsx` file MUST:
- Call `const { ... } = useComponentName()` at the top (if any logic exists)
- Return JSX only
- Import styles: `import './styles.css'`

The `.tsx` file MUST NEVER contain:
- `useState`, `useReducer`, `useContext` (unless it IS the context consumer)
- Event handler definitions (`const handleClick = ...`)
- API calls or React Query hooks
- Business logic (`if/else`, data transformations, sorting, filtering)
- Inline type definitions

```tsx
// ✅ CORRECT — GroupCard.tsx
import './styles.css';
import { useGroupCard } from './useGroupCard';

export function GroupCard() {
  const { group, totalExpenses, handlePress } = useGroupCard();

  return (
    <div className="group-card" onClick={handlePress}>
      <h3 className="group-card__title">{group.name}</h3>
      <span className="group-card__total">{totalExpenses}</span>
    </div>
  );
}
```

```tsx
// ❌ WRONG — logic leaked into .tsx
export function GroupCard({ groupId }: { groupId: string }) {
  const [expanded, setExpanded] = useState(false);
  const { data: group } = useQuery(['group', groupId], () => fetchGroup(groupId));
  const total = group?.expenses.reduce((acc, e) => acc + e.amount, 0) ?? 0;

  const handlePress = () => setExpanded(!expanded);

  return <div onClick={handlePress}>{/* ... */}</div>;
}
```

---

## Rule 2: Co-located Hooks (NEVER a global `hooks/` folder)

Hooks live INSIDE their component folder. Named `use` + `ComponentName`.

```
// ✅ CORRECT
GroupCard/
└── useGroupCard.ts        ← lives here, not in presentation/hooks/

// ❌ WRONG
presentation/
└── hooks/
    └── useGroupCard.ts    ← global hooks/ folder is FORBIDDEN
```

The hook receives nothing from the parent via props unless it's a truly external dependency (e.g., a `groupId` from the route). If the parent is passing handler functions or state down, that's a sign the child should own that state itself.

---

## Rule 3: Logic at the Lowest Level Possible

Children own their own logic. Parents do NOT manage child state.

```tsx
// ✅ CORRECT — AddExpenseDialog owns everything
export function GroupDetailView() {
  return (
    <PageLayout>
      <ExpenseList />
      <AddExpenseDialog />   {/* no props needed */}
    </PageLayout>
  );
}

// ❌ WRONG — parent prop-drilling child logic
export function GroupDetailView() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  // ... 20 more lines
  return (
    <AddExpenseDialog
      open={open}
      onClose={() => setOpen(false)}
      title={title}
      onTitleChange={setTitle}
      amount={amount}
      onAmountChange={setAmount}
      {/* ...15 more props */}
    />
  );
}
```

### Rule 3.5: The Component Owns Its Destiny — API Calls Stay Inside

This is the MOST IMPORTANT rule. A component that triggers an action MUST own that action's logic internally.

**The parent should NOT know HOW an action works. It should only know WHEN to show/hide the child.**

```tsx
// ❌ WRONG — parent owns the delete API call
function useGroupDetailPage() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();

  const handleConfirmDelete = async () => {
    await compositionRoot.useCases.groups.delete.execute({ groupId });
    navigate('/');  // parent knows too much
    setIsDeleteOpen(false);
  };

  return { isDeleteOpen, handleConfirmDelete, handleCancelDelete: () => setIsDeleteOpen(false) };
}

// ✅ CORRECT — dialog owns its own API call
function useGroupDetailPage() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  return { isDeleteOpen, handleDeleteGroup: () => setIsDeleteOpen(true), handleCancelDelete: () => setIsDeleteOpen(false) };
}

function useDeleteGroupDialog({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const navigate = useNavigate();

  const handleConfirm = async () => {
    await compositionRoot.useCases.groups.delete.execute({ groupId });
    navigate('/');
    onClose();
  };

  return { handleConfirm };
}
```

**Why this matters:**
- The parent (`GroupDetailPage`) only knows "show the delete dialog" — not what deletion means
- The `DeleteGroupDialog` can be reused anywhere without the parent knowing API details
- Testing is simpler: test the dialog's hook in isolation
- If the delete behavior changes (e.g., add a confirmation step, change the endpoint), only the dialog changes

---

## Rule 4: Avoid `useEffect`

`useEffect` creates hard-to-trace side effects. Use alternatives first:

| Instead of `useEffect` for... | Use this instead |
|---|---|
| Deriving state from props | Inline computation / `useMemo` |
| Reacting to a form field change | `onChange` handler in the hook |
| Running code after a mutation | React Query `onSuccess`/`onSettled` |
| Syncing two pieces of state | Restructure to single source of truth |
| Formatting/transforming data | Compute in the hook body, no effect needed |
| Subscribing to a library event | Library's own callback API if it exists |
| DOM manipulation | `useEffect` is acceptable here |
| Third-party lib with no callbacks | `useEffect` is acceptable here |

```ts
// ✅ CORRECT — derived state, no effect
export function useGroupCard() {
  const { data: group } = useGroupQuery();
  const totalExpenses = group?.expenses.reduce((acc, e) => acc + e.amount, 0) ?? 0; // derived inline
  return { group, totalExpenses };
}

// ❌ WRONG — useEffect to sync derived state
export function useGroupCard() {
  const { data: group } = useGroupQuery();
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(group?.expenses.reduce((acc, e) => acc + e.amount, 0) ?? 0);
  }, [group]);
  return { group, total };
}
```

Only use `useEffect` when there is NO alternative.

---

## Rule 5: Styles

- ALWAYS named `styles.css` — never `ComponentName.css`
- Lives INSIDE the component folder
- Use BEM-like class naming: `.component-name__element--modifier`

```css
/* ✅ CORRECT — GroupCard/styles.css */
.group-card { }
.group-card__title { }
.group-card__total--negative { }

/* ❌ WRONG — GroupCard.css as a sibling to GroupCard.tsx */
/* ❌ WRONG — .groupCardTitle (camelCase) */
/* ❌ WRONG — .title (too generic, no component namespace) */
```

Global design tokens (colors, spacing, typography) go in `presentation/styles/` as CSS custom properties.

---

## Rule 6: Types

- Component-specific types/interfaces go in `types.ts` inside the component folder
- Hook return types go in `types.ts` too
- NEVER define types inline inside `.tsx` files

```ts
// ✅ CORRECT — GroupCard/types.ts
export interface GroupCardProps {
  groupId: string;
}

export interface UseGroupCardReturn {
  group: Group | undefined;
  totalExpenses: number;
  handlePress: () => void;
}
```

```tsx
// ❌ WRONG — inline type in .tsx
export function GroupCard({ groupId }: { groupId: string }) { ... }
```

---

## Rule 7: Barrel Exports

Every component folder MUST have an `index.ts`:

```ts
// GroupCard/index.ts
export { GroupCard } from './GroupCard';
```

Import from the folder, not the file:
```ts
// ✅ import { GroupCard } from '../GroupCard';
// ❌ import { GroupCard } from '../GroupCard/GroupCard';
```

---

## Rule 8: Context Folder Pattern

Contexts follow the same folder structure:

```
context/
└── GroupContext/
    ├── GroupContextProvider.tsx   # Provider component — JSX only
    ├── useGroupContextProvider.ts # All provider logic (state, handlers)
    └── index.ts                  # export { GroupContextProvider }
```

The consumer hook (`useGroupContext`) lives as a simple re-export or in the same folder:
```ts
// GroupContext/index.ts
export { GroupContextProvider } from './GroupContextProvider';
export { useGroupContext } from './useGroupContextProvider'; // if defined there
```

---

## Anti-Patterns Checklist

Before committing, verify NONE of these exist:

- ❌ Flat component file (`GroupCard.tsx` next to `GroupList.tsx`) — MUST be in own folder
- ❌ Global `presentation/hooks/` folder — dissolve it, co-locate each hook
- ❌ View/page component with `useState` or event handlers — logic belongs in child hooks
- ❌ Child component receiving 5+ props that are really internal state — child should own it
- ❌ Parent component making API calls on behalf of a child dialog — the dialog's hook should own the API call
- ❌ Parent passing `onConfirm` handler that contains business logic (delete, update, submit) — logic stays in child's hook
- ❌ `useEffect` for derived state or post-mutation reactions — use alternatives
- ❌ Business logic in `.tsx` file (sorting, filtering, formatting) — move to hook
- ❌ Inline type definitions in `.tsx` — move to `types.ts`
- ❌ `GroupCard.css` as sibling to component — must be `styles.css` inside folder
- ❌ Missing `index.ts` in component folder
- ❌ Import path pointing to the file: `'../GroupCard/GroupCard'`

---

## Known Splitsy Violations to Fix

| File | Violation | Fix |
|---|---|---|
| `presentation/hooks/` | Global hooks folder forbidden | Co-locate each hook inside its component folder |
| `GroupDetailPage.tsx` | Passes 20+ props to `<AddExpenseDialog>` | `AddExpenseDialog` owns its state via `useAddExpenseDialog` |
| `GroupCard.tsx` (flat file) | Not in a folder | Create `GroupCard/` with 4-file structure |
| `AddExpenseDialog.tsx` (flat file) | Not in a folder | Create `AddExpenseDialog/` with 4-file structure |
| `GroupCard.css` | Sibling CSS file | Move to `GroupCard/styles.css` |
