# B3a Loading State Components

Reusable loading state components for the B3a state management infrastructure.

## Components

### LoadingSpinner
A customizable spinner component with multiple sizes and variants.

```tsx
import { LoadingSpinner } from "@/components/ui/loading"

<LoadingSpinner size="md" variant="primary" text="Loading..." />
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `variant`: "default" | "primary" | "secondary" | "success" | "warning" | "danger" (default: "default")
- `text`: Optional text to display below spinner
- `centered`: Whether to center the spinner and text (default: false)

### SkeletonCard
A skeleton loading card component for content placeholders.

```tsx
import { SkeletonCard } from "@/components/ui/loading"

<SkeletonCard 
  size="md" 
  lines={3} 
  showAvatar 
  showButtons 
  buttonCount={2} 
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `variant`: "default" | "surface" | "raised" (default: "default")
- `lines`: Number of skeleton lines (default: 3)
- `showAvatar`: Whether to show skeleton avatar (default: false)
- `showButtons`: Whether to show skeleton buttons (default: false)
- `buttonCount`: Number of skeleton buttons (default: 2)

### SkeletonTable
A skeleton loading table component for data placeholders.

```tsx
import { SkeletonTable } from "@/components/ui/loading"

<SkeletonTable 
  columns={4} 
  rows={5} 
  showHeader 
  striped 
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" (default: "md")
- `variant`: "default" | "minimal" (default: "default")
- `columns`: Number of columns (default: 4)
- `rows`: Number of rows (default: 5)
- `showHeader`: Whether to show table header (default: true)
- `striped`: Whether to show alternating row colors (default: false)

### LoadingOverlay
A full-screen loading overlay with optional progress indicator.

```tsx
import { LoadingOverlay } from "@/components/ui/loading"

<LoadingOverlay 
  isVisible={true}
  text="Loading data..."
  showProgress={true}
  progress={75}
  spinnerSize="lg"
  spinnerVariant="primary"
/>
```

**Props:**
- `isVisible`: Whether overlay is visible (default: true)
- `text`: Text to display below spinner
- `spinnerSize`: Size of spinner (default: "lg")
- `spinnerVariant`: Variant of spinner (default: "primary")
- `showProgress`: Whether to show progress bar (default: false)
- `progress`: Progress value 0-100 (default: 0)
- `children`: Custom content to display in overlay

## Usage Examples

### Basic Loading State
```tsx
const [isLoading, setIsLoading] = useState(true)

if (isLoading) {
  return <LoadingSpinner text="Loading workouts..." />
}
```

### Card Loading State
```tsx
const [workouts, setWorkouts] = useState(null)

return (
  <div className="grid grid-cols-3 gap-4">
    {workouts ? (
      workouts.map(workout => <WorkoutCard key={workout.id} {...workout} />)
    ) : (
      Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} showAvatar lines={4} />
      ))
    )}
  </div>
)
```

### Table Loading State
```tsx
const [sessions, setSessions] = useState(null)

return (
  <div>
    {sessions ? (
      <SessionsTable data={sessions} />
    ) : (
      <SkeletonTable columns={5} rows={8} striped />
    )}
  </div>
)
```

### Overlay Loading State
```tsx
const [isProcessing, setIsProcessing] = useState(false)
const [progress, setProgress] = useState(0)

return (
  <>
    <button onClick={() => setIsProcessing(true)}>
      Process Data
    </button>
    
    <LoadingOverlay
      isVisible={isProcessing}
      text="Processing your data..."
      showProgress={true}
      progress={progress}
    />
  </>
)
```

## Testing

Visit `/test-loading` to see all components in action with interactive examples.

## Design System Integration

All components use the existing design system:
- Colors: `text-1`, `text-2`, `text-3`, `brand`, `status-*`
- Backgrounds: `bg-app`, `bg-surface`, `bg-raised`
- Borders: `border-weak`, `border-1`
- Animations: `animate-spin`, `animate-pulse`

## Accessibility

- LoadingSpinner: Uses `aria-hidden` for decorative spinner
- LoadingOverlay: Focus management and screen reader announcements
- SkeletonCard/Table: Semantic HTML structure for screen readers
