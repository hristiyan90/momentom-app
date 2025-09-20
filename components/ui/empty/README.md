# Empty State Components

This directory contains reusable UI components for displaying various empty states when no data is available. These components provide helpful guidance and clear actions for users to take when encountering empty data scenarios.

## Components

1. [`EmptyWorkouts`](../empty-workouts.tsx) - No workouts scheduled
2. [`EmptySessions`](../empty-sessions.tsx) - No sessions in date range
3. [`EmptyProgress`](../empty-progress.tsx) - No progress data available
4. [`EmptyPlan`](../empty-plan.tsx) - No training plan data
5. [`EmptyLibrary`](../empty-library.tsx) - No workout library items

## Installation

These components are part of the `@/components/ui/empty` module. You can import them individually or use the barrel export:

```typescript
import { EmptyWorkouts, EmptySessions, EmptyProgress, EmptyPlan, EmptyLibrary } from "@/components/ui/empty";
```

## Usage Examples

### Empty Workouts

```typescript jsx
import { EmptyWorkouts } from "@/components/ui/empty";

function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);

  if (workouts.length === 0) {
    return (
      <EmptyWorkouts
        onCreateWorkout={() => setShowCreateModal(true)}
        onViewCalendar={() => navigateToCalendar()}
        variant="detailed"
      />
    );
  }

  return <div>Your workouts here</div>;
}
```

### Empty Sessions

```typescript jsx
import { EmptySessions } from "@/components/ui/empty";

function SessionsList() {
  const [sessions, setSessions] = useState([]);
  const [dateRange, setDateRange] = useState("this week");

  if (sessions.length === 0) {
    return (
      <EmptySessions
        dateRange={dateRange}
        onRefresh={() => fetchSessions()}
        onAdjustFilters={() => setShowFilters(true)}
        onViewCalendar={() => navigateToCalendar()}
        variant="default"
      />
    );
  }

  return <div>Your sessions here</div>;
}
```

### Empty Progress

```typescript jsx
import { EmptyProgress } from "@/components/ui/empty";

function ProgressPage() {
  const [progressData, setProgressData] = useState(null);

  if (!progressData) {
    return (
      <EmptyProgress
        dataType="progress"
        onCreateSession={() => navigateToSessions()}
        onViewPlan={() => navigateToPlan()}
        onImportData={() => setShowImportModal(true)}
        variant="detailed"
      />
    );
  }

  return <div>Your progress charts here</div>;
}
```

### Empty Plan

```typescript jsx
import { EmptyPlan } from "@/components/ui/empty";

function TrainingPlanPage() {
  const [plan, setPlan] = useState(null);

  if (!plan) {
    return (
      <EmptyPlan
        planType="training"
        onCreatePlan={() => setShowCreatePlanModal(true)}
        onBrowseTemplates={() => navigateToTemplates()}
        onConfigureGoals={() => navigateToGoals()}
        variant="detailed"
      />
    );
  }

  return <div>Your training plan here</div>;
}
```

### Empty Library

```typescript jsx
import { EmptyLibrary } from "@/components/ui/empty";

function WorkoutLibraryPage() {
  const [workouts, setWorkouts] = useState([]);

  if (workouts.length === 0) {
    return (
      <EmptyLibrary
        libraryType="workouts"
        onCreateWorkout={() => setShowCreateModal(true)}
        onUploadWorkout={() => setShowUploadModal(true)}
        onBrowseTemplates={() => navigateToTemplates()}
        onSearchWorkouts={() => setShowSearch(true)}
        variant="detailed"
      />
    );
  }

  return <div>Your workout library here</div>;
}
```

## Props Reference

### `EmptyWorkoutsProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `"No workouts scheduled"` | Empty state title |
| `message` | `string` | `"You don't have any workouts..."` | Empty state message |
| `showCreateButton` | `boolean` | `true` | Show create workout button |
| `onCreateWorkout` | `() => void` | `undefined` | Create workout callback |
| `onViewCalendar` | `() => void` | `undefined` | View calendar callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `"default" \| "compact" \| "detailed"` | `"default"` | Component variant |

### `EmptySessionsProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `"No sessions found"` | Empty state title |
| `message` | `string` | `undefined` | Empty state message |
| `showRefreshButton` | `boolean` | `true` | Show refresh button |
| `onRefresh` | `() => void` | `undefined` | Refresh callback |
| `onAdjustFilters` | `() => void` | `undefined` | Adjust filters callback |
| `onViewCalendar` | `() => void` | `undefined` | View calendar callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `"default" \| "compact" \| "detailed"` | `"default"` | Component variant |
| `dateRange` | `string` | `undefined` | Date range for context |

### `EmptyProgressProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `undefined` | Empty state title |
| `message` | `string` | `undefined` | Empty state message |
| `showCreateSession` | `boolean` | `true` | Show create session button |
| `onCreateSession` | `() => void` | `undefined` | Create session callback |
| `onViewPlan` | `() => void` | `undefined` | View plan callback |
| `onImportData` | `() => void` | `undefined` | Import data callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `"default" \| "compact" \| "detailed"` | `"default"` | Component variant |
| `dataType` | `"progress" \| "analytics" \| "performance"` | `"progress"` | Data type context |

### `EmptyPlanProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `undefined` | Empty state title |
| `message` | `string` | `undefined` | Empty state message |
| `showCreatePlan` | `boolean` | `true` | Show create plan button |
| `onCreatePlan` | `() => void` | `undefined` | Create plan callback |
| `onBrowseTemplates` | `() => void` | `undefined` | Browse templates callback |
| `onConfigureGoals` | `() => void` | `undefined` | Configure goals callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `"default" \| "compact" \| "detailed"` | `"default"` | Component variant |
| `planType` | `"training" \| "nutrition" \| "recovery"` | `"training"` | Plan type context |

### `EmptyLibraryProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `undefined` | Empty state title |
| `message` | `string` | `undefined` | Empty state message |
| `showCreateButton` | `boolean` | `true` | Show create button |
| `onCreateWorkout` | `() => void` | `undefined` | Create workout callback |
| `onUploadWorkout` | `() => void` | `undefined` | Upload workout callback |
| `onBrowseTemplates` | `() => void` | `undefined` | Browse templates callback |
| `onSearchWorkouts` | `() => void` | `undefined` | Search workouts callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `"default" \| "compact" \| "detailed"` | `"default"` | Component variant |
| `libraryType` | `"workouts" \| "templates" \| "exercises"` | `"workouts"` | Library type context |

## Variants

### Default
- Standard padding and layout
- Basic icon and messaging
- Primary action button

### Compact
- Reduced padding for smaller spaces
- Minimal layout
- Essential actions only

### Detailed
- Extended padding and layout
- Additional context and tips
- Multiple action options
- Helpful information cards

## Accessibility

- **Empty States**: Include proper heading hierarchy and descriptive text
- **Buttons**: Include proper `aria-label` attributes for icon-only buttons
- **Focus Management**: Ensure proper tab order for interactive elements
- **Screen Readers**: Provide meaningful descriptions for empty states
- **Color Contrast**: All text meets WCAG AA contrast requirements

## Design Guidelines

1. **Consistent Messaging**: Use clear, helpful language that guides users
2. **Action-Oriented**: Always provide clear next steps for users
3. **Context-Aware**: Adapt messaging based on the specific empty state
4. **Progressive Disclosure**: Show additional help in detailed variants
5. **Visual Hierarchy**: Use proper spacing and typography for readability
