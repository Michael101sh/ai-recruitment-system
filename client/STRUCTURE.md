# Frontend Project Structure

## Overview

The frontend is organized by **feature/domain** rather than by type, following Domain-Driven Design principles. This makes the codebase more scalable and maintainable.

## Directory Structure

```
src/
├── components/                 # UI Components (organized by feature)
│   ├── candidates/            # Candidate-related components
│   │   ├── CandidateCard.tsx       # Individual candidate display with CV
│   │   ├── CandidateFilters.tsx    # Search and sort controls
│   │   ├── CandidateList.tsx       # Main candidate list view
│   │   └── index.ts                # Barrel export
│   │
│   ├── ranking/               # Ranking-related components
│   │   ├── RankingCard.tsx         # Individual ranking display
│   │   ├── RankingDashboard.tsx    # Main ranking view
│   │   ├── RankingForm.tsx         # Criteria input form
│   │   ├── RankingStats.tsx        # Ranking statistics
│   │   └── index.ts                # Barrel export
│   │
│   ├── generate/              # Generation-related components
│   │   ├── GenerateCandidates.tsx  # AI generation UI
│   │   └── index.ts                # Barrel export
│   │
│   └── shared/                # Shared/reusable components
│       ├── NotificationToasts.tsx  # Global toast notifications
│       ├── VirtualList.tsx         # Virtualized list component
│       └── index.ts                # Barrel export
│
├── hooks/                     # Custom React Hooks (organized by feature)
│   ├── candidates/
│   │   ├── useCandidates.ts        # Candidate CRUD operations
│   │   └── index.ts
│   │
│   ├── ranking/
│   │   ├── useRankings.ts          # Ranking operations
│   │   └── index.ts
│   │
│   ├── generate/
│   │   ├── useGenerateFlow.ts      # Generation flow state
│   │   └── index.ts
│   │
│   ├── queryKeys.ts           # Centralized TanStack Query keys
│   └── useVirtualList.ts      # Virtual list helper hook
│
├── utils/                     # Utility functions
│   ├── candidates/
│   │   ├── candidateUtils.ts       # Filter/sort functions
│   │   └── index.ts
│   │
│   ├── apiError.ts            # API error handling
│   └── cn.ts                  # Tailwind class merger
│
├── services/                  # External services
│   └── api.ts                 # Axios API client
│
├── store/                     # Global state management
│   └── useAppStore.ts         # Zustand store
│
├── types/                     # TypeScript types
│   └── index.ts               # Shared type definitions
│
├── App.tsx                    # Root component
└── main.tsx                   # Entry point

```

## Design Principles

### 1. **Feature-Based Organization**
- Components, hooks, and utils are grouped by feature (candidates, ranking, generate)
- Makes it easy to find all code related to a specific feature
- Easier to extract features into separate modules if needed

### 2. **Barrel Exports (index.ts)**
- Each feature folder has an `index.ts` that re-exports its modules
- Enables clean imports: `import { CandidateList } from './components/candidates'`
- Hides internal structure from consumers

### 3. **Shared vs Feature-Specific**
- **Shared**: Components used across multiple features (VirtualList, NotificationToasts)
- **Feature**: Components specific to one domain (CandidateCard, RankingForm)

### 4. **SOLID Principles**
- **Single Responsibility**: Each component/hook has one clear purpose
- **Dependency Inversion**: Components depend on abstractions (props, hooks)
- **Open/Closed**: Easy to extend without modifying existing code

## Import Examples

```typescript
// App.tsx
import { GenerateCandidates } from './components/generate';
import { CandidateList } from './components/candidates';
import { RankingDashboard } from './components/ranking';
import { NotificationToasts } from './components/shared';
import { useCandidates } from './hooks/candidates';

// CandidateList.tsx
import { VirtualList } from '../shared';
import { CandidateCard, CandidateFilters } from './';  // Same folder
import { useDeleteCandidate } from '../../hooks/candidates';
import { filterCandidates, sortCandidates } from '../../utils/candidates';
```

## Benefits

✅ **Scalability**: Easy to add new features without cluttering existing folders  
✅ **Maintainability**: All related code is co-located  
✅ **Discoverability**: Clear where to find feature-specific code  
✅ **Reusability**: Shared components clearly separated  
✅ **Testability**: Features can be tested in isolation  
✅ **Team Collaboration**: Reduces merge conflicts (features in separate folders)

## Migration from Old Structure

Old (type-based):
```
components/
  ├── CandidateCard.tsx
  ├── CandidateList.tsx
  ├── RankingCard.tsx
  └── ...
```

New (feature-based):
```
components/
  ├── candidates/
  │   └── ...
  ├── ranking/
  │   └── ...
  └── shared/
      └── ...
```
