# Frontend Code Guide

A practical guide to understanding the React frontend architecture and code organization.

## 🏗️ Architecture Overview

```
User Interaction → Component → Custom Hook → API Service → Backend
                      ↓
                State Management
              (TanStack Query + Zustand)
```

**Core Principles:**
- **SOLID principles** for maintainable code
- **Feature-based** file organization
- **Server state** managed by TanStack Query (caching, refetching)
- **UI state** managed by Zustand (notifications, active tab)
- **TypeScript** for type safety

## 📁 Folder Structure

```
src/
├── components/          # UI components grouped by feature
│   ├── candidates/     # Candidate list, filters, cards
│   ├── generate/       # Candidate generation UI
│   ├── ranking/        # Ranking form, cards, stats
│   └── shared/         # Reusable components (notifications, virtual list)
│
├── hooks/              # Custom React hooks
│   ├── generate/       # useGenerateFlow (generation logic)
│   ├── useCandidates.ts  # Candidate CRUD operations
│   ├── useRankings.ts    # Ranking operations
│   ├── useVirtualList.ts # Virtualization hook
│   └── queryKeys.ts      # TanStack Query keys
│
├── services/           # API communication
│   └── api.ts         # Axios client & endpoints
│
├── store/             # Global state management
│   └── useAppStore.ts # Zustand store (notifications, tabs)
│
├── utils/             # Helper functions
│   ├── candidates/    # Filter & sort utilities
│   ├── apiError.ts    # Error message mapping
│   └── cn.ts          # TailwindCSS class utility
│
└── types/             # TypeScript type definitions
    └── index.ts
```

## 🎯 Key Concepts

### 1. State Management Strategy

**TanStack Query** (Server State)
- Manages all data from the backend (candidates, rankings)
- Automatic caching, refetching, and invalidation
- Handles loading and error states

**Zustand** (UI State)
- Global notifications (success/error messages)
- Active tab state
- Simple, lightweight store

```typescript
// TanStack Query for server data
const { data: candidates, isLoading } = useCandidates();

// Zustand for UI state
const { setSuccess, setError } = useAppStore();
```

### 2. Custom Hooks (Business Logic)

All complex logic is extracted into custom hooks following **Single Responsibility Principle**:

| Hook | Purpose |
|------|---------|
| `useCandidates()` | Fetch candidates, delete operations |
| `useRankings()` | Fetch rankings, rank all operation |
| `useGenerateCandidates()` | Generate candidates mutation |
| `useGenerateFlow()` | Generation UI state & step messages |
| `useVirtualList()` | Virtual scrolling for large lists |

**Example:**
```typescript
// hooks/useCandidates.ts
export const useCandidates = () => {
  return useQuery({
    queryKey: candidateKeys.all,
    queryFn: () => candidateApi.getAll(),
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => candidateApi.delete(id),
    onSuccess: () => {
      // Invalidate both candidates and rankings cache
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
      queryClient.invalidateQueries({ queryKey: rankingKeys.all });
    },
  });
};
```

### 3. Component Organization

Components are split by **feature** and follow **SRP**:

**Example: CandidateList**
```
CandidateList.tsx           (Main container - 127 lines)
├── CandidateFilters.tsx    (Search & sort UI - 78 lines)
├── CandidateCard.tsx       (Single candidate card - 223 lines)
└── candidateUtils.ts       (Filter & sort logic)
```

**Why?**
- Each component has one clear responsibility
- Easy to test in isolation
- Reusable across the app

### 4. Data Flow

**Fetching Data:**
```
Component → useQuery Hook → API Service → Backend
                ↓
           TanStack Query Cache
```

**Mutating Data:**
```
User Action → useMutation Hook → API Service → Backend
                                      ↓
                              onSuccess: invalidate cache
                                      ↓
                              TanStack Query refetches
                                      ↓
                                  UI updates
```

**Example Flow - Deleting a Candidate:**
1. User clicks delete button
2. `handleDelete` calls `mutate(candidateId)`
3. `useDeleteCandidate` sends DELETE request
4. On success: invalidates candidates & rankings cache
5. TanStack Query automatically refetches data
6. UI updates with new data

## 🎨 Styling Approach

**TailwindCSS Only** - No CSS files, all utility classes:

```tsx
<div className="glass-card p-6 hover:glass-card-hover">
  <h2 className="text-xl font-bold text-white/90">Title</h2>
</div>
```

**Custom Utilities:**
- `cn()` function merges Tailwind classes intelligently
- Glass-morphic design system defined in `index.css`
- Responsive design with Tailwind breakpoints

## 🚀 Performance Optimizations

### 1. Virtual Lists

**Problem:** Rendering 10,000 candidates causes lag
**Solution:** `@tanstack/react-virtual`

```typescript
// Only renders visible items in viewport
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200, // Dynamic height
});
```

### 2. React Query Caching

**Benefits:**
- Data is cached in memory
- No unnecessary refetches
- Automatic background updates
- Stale-while-revalidate pattern

### 3. Optimized Re-renders

- `useMemo` for expensive calculations (filtering, sorting)
- `useCallback` for stable function references
- Component splitting to minimize re-render scope

## 🔧 Important Files Explained

### `App.tsx` (Main Component)

The root component that orchestrates everything:

```typescript
function App() {
  const { activeTab, setActiveTab } = useAppStore();
  
  // Tab-based navigation
  return (
    <div>
      <TabButtons />
      {activeTab === 'generate' && <GenerateCandidates />}
      {activeTab === 'candidates' && <CandidateList />}
      {activeTab === 'rankings' && <RankingDashboard />}
      <NotificationToasts />
    </div>
  );
}
```

### `services/api.ts` (API Client)

Centralized API communication using Axios:

```typescript
// Base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Organized by resource
export const candidateApi = {
  getAll: () => apiClient.get('/candidates'),
  delete: (id) => apiClient.delete(`/candidates/${id}`),
};

export const rankingApi = {
  rankAll: (criteria) => apiClient.post('/rankings/rank-all', { criteria }),
  getAll: () => apiClient.get('/rankings'),
};
```

### `store/useAppStore.ts` (Global State)

Simple Zustand store for UI state:

```typescript
interface AppState {
  activeTab: 'generate' | 'candidates' | 'rankings';
  error: string | null;
  success: string | null;
  
  setActiveTab: (tab: string, options?: { clearNotifications?: boolean }) => void;
  setError: (message: string | null) => void;
  setSuccess: (message: string | null) => void;
}

// Usage in components
const { error, success, setError, setSuccess } = useAppStore();
```

### `utils/candidates/candidateUtils.ts`

Pure functions for data manipulation:

```typescript
// Filter candidates by search query
export const filterCandidates = (candidates, query) => {
  if (!query.trim()) return candidates;
  
  const lowerQuery = query.toLowerCase();
  return candidates.filter(c => 
    c.firstName.toLowerCase().includes(lowerQuery) ||
    c.lastName.toLowerCase().includes(lowerQuery) ||
    c.email.toLowerCase().includes(lowerQuery) ||
    c.skills.some(s => s.skill.name.toLowerCase().includes(lowerQuery))
  );
};

// Sort candidates by different criteria
export const sortCandidates = (candidates, sortBy) => {
  const sorted = [...candidates]; // Don't mutate original
  
  switch (sortBy) {
    case 'score-desc':
      return sorted.sort((a, b) => {
        const sa = a.rankings[0]?.score ?? -1; // Unranked to bottom
        const sb = b.rankings[0]?.score ?? -1;
        return sb - sa;
      });
    case 'name-asc':
      return sorted.sort((a, b) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
    // ... more cases
  }
};
```

## 🎭 Component Examples

### Simple Component (CandidateFilters)

```typescript
interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  totalCandidates: number;
  filteredCount: number;
}

export const CandidateFilters = ({ ... }: Props) => {
  return (
    <div className="flex gap-4">
      {/* Search input */}
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by name, email, or skill..."
      />
      
      {/* Sort dropdown */}
      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="score-desc">Score: High to Low</option>
        <option value="name-asc">Name: A-Z</option>
      </select>
      
      {/* Filter count indicator */}
      {search && <span>{filteredCount} of {totalCandidates} candidates</span>}
    </div>
  );
};
```

### Complex Component (CandidateList)

```typescript
export const CandidateList = () => {
  // 1. Fetch data
  const { data: candidates, isLoading, refetch } = useCandidates();
  const { mutate: deleteCandidate } = useDeleteCandidate();
  
  // 2. Local UI state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score-desc');
  
  // 3. Global state
  const { setSuccess, setError } = useAppStore();
  
  // 4. Computed values (memoized)
  const filteredCandidates = useMemo(() => 
    filterCandidates(candidates || [], search),
    [candidates, search]
  );
  
  const sortedCandidates = useMemo(() =>
    sortCandidates(filteredCandidates, sortBy),
    [filteredCandidates, sortBy]
  );
  
  // 5. Event handlers
  const handleDelete = useCallback((id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    
    deleteCandidate(id, {
      onSuccess: () => setSuccess('Candidate deleted'),
      onError: () => setError('Failed to delete candidate'),
    });
  }, [deleteCandidate, setSuccess, setError]);
  
  // 6. Render
  return (
    <div>
      <CandidateFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCandidates={candidates?.length || 0}
        filteredCount={filteredCandidates.length}
      />
      
      <VirtualList
        items={sortedCandidates}
        renderItem={(candidate) => (
          <CandidateCard
            candidate={candidate}
            onDelete={() => handleDelete(candidate.id, candidate.firstName)}
          />
        )}
      />
    </div>
  );
};
```

## 🔍 Common Patterns

### 1. Loading States

```typescript
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!data) return <div>No data</div>;

return <div>{/* Render data */}</div>;
```

### 2. Mutations with Feedback

```typescript
const { mutate, isPending } = useMutation({
  mutationFn: api.delete,
  onSuccess: () => {
    setSuccess('✅ Deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
  onError: (error) => {
    setError(getApiErrorMessage(error, 'Failed to delete'));
  },
});
```

### 3. Conditional Styling

```typescript
<button
  className={cn(
    'btn-base',
    isActive && 'btn-active',
    isDisabled && 'btn-disabled',
    'hover:glass-card-hover'
  )}
/>
```

## 🐛 Debugging Tips

1. **React Query DevTools**: Open browser console to inspect cache
2. **Network Tab**: Check API requests/responses
3. **Console Logs**: Check for errors or warnings
4. **TanStack Query Inspector**: Add `import { ReactQueryDevtools } from '@tanstack/react-query-devtools'`

## 📚 Key Takeaways

1. **Separation of Concerns**: UI components separate from business logic
2. **Server State vs UI State**: TanStack Query for server data, Zustand for UI
3. **Type Safety**: TypeScript everywhere for reliability
4. **Performance**: Virtual lists, memoization, smart caching
5. **Maintainability**: SOLID principles, feature-based organization
6. **DX (Developer Experience)**: Clear patterns, reusable hooks, consistent structure

## 🎓 Learning Path

To understand the codebase:

1. Start with `App.tsx` - see the overall structure
2. Look at `hooks/useCandidates.ts` - understand data fetching
3. Check `components/candidates/CandidateList.tsx` - see how it all connects
4. Review `services/api.ts` - see how we talk to backend
5. Explore `utils/` - understand helper functions

**Pro tip:** Follow the data flow for one feature end-to-end (e.g., deleting a candidate) to see how all pieces work together.
