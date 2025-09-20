# Error Components

This directory contains reusable UI components for displaying various error states, including full-page errors, inline errors, network errors, server errors, and React error boundaries. These components are designed to provide a consistent user experience when errors occur and help users recover from error states.

## Components

1. [`ErrorState`](../error-state.tsx) - Full-page error display
2. [`ErrorCard`](../error-card.tsx) - Inline error display
3. [`NetworkError`](../network-error.tsx) - Network-specific errors
4. [`ServerError`](../server-error.tsx) - Server-specific errors
5. [`ErrorBoundary`](../error-boundary.tsx) - React error boundary

## Installation

These components are part of the `@/components/ui/error` module. You can import them individually or use the barrel export:

```typescript
import { ErrorState, ErrorCard, NetworkError, ServerError, ErrorBoundary } from "@/components/ui/error";
```

## Usage Examples

### Full-Page Error State

```typescript jsx
import { ErrorState } from "@/components/ui/error";

function MyPage() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRetry = () => {
    setHasError(false);
    setError(null);
    // Retry logic here
  };

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load data"
        message="We couldn't load your workout data. Please try again."
        error={error}
        onRetry={handleRetry}
        onRefresh={() => window.location.reload()}
        onGoBack={() => window.history.back()}
        onGoHome={() => window.location.href = "/"}
        variant="default"
      />
    );
  }

  return <div>Your content here</div>;
}
```

### Inline Error Card

```typescript jsx
import { ErrorCard } from "@/components/ui/error";
import { useState } from "react";

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleDismiss = () => {
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    // Retry logic here
  };

  return (
    <div>
      {error && (
        <ErrorCard
          title="Validation Error"
          message={error}
          onDismiss={handleDismiss}
          onRetry={handleRetry}
          showRetry={true}
          variant="warning"
          size="md"
        />
      )}
      {/* Your content here */}
    </div>
  );
}
```

### Network Error

```typescript jsx
import { NetworkError } from "@/components/ui/error";

function MyComponent() {
  const [isOffline, setIsOffline] = useState(false);
  const [networkError, setNetworkError] = useState<Error | null>(null);

  const handleRetry = () => {
    setNetworkError(null);
    // Retry network request
  };

  const handleCheckConnection = () => {
    // Check connection logic
    setIsOffline(!navigator.onLine);
  };

  if (networkError || isOffline) {
    return (
      <NetworkError
        error={networkError}
        isOffline={isOffline}
        onRetry={handleRetry}
        onCheckConnection={handleCheckConnection}
        showConnectionCheck={true}
      />
    );
  }

  return <div>Your content here</div>;
}
```

### Server Error

```typescript jsx
import { ServerError } from "@/components/ui/error";

function MyComponent() {
  const [serverError, setServerError] = useState<{ error: Error; statusCode?: number } | null>(null);

  const handleRetry = () => {
    setServerError(null);
    // Retry server request
  };

  const handleReportBug = () => {
    // Report bug logic
    console.log("Bug reported:", serverError);
  };

  if (serverError) {
    return (
      <ServerError
        error={serverError.error}
        statusCode={serverError.statusCode}
        onRetry={handleRetry}
        onReportBug={handleReportBug}
        showBugReport={true}
        retryAfter={serverError.statusCode === 429 ? 60 : undefined}
      />
    );
  }

  return <div>Your content here</div>;
}
```

### Error Boundary

```typescript jsx
import { ErrorBoundary, withErrorBoundary } from "@/components/ui/error";

// Using ErrorBoundary component
function MyApp() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Error caught by boundary:", error, errorInfo);
        // Send to error reporting service
      }}
      resetOnPropsChange={true}
      resetKeys={["userId"]} // Reset when userId changes
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

// Using HOC
const SafeComponent = withErrorBoundary(MyComponent, {
  onError: (error, errorInfo) => {
    console.error("Error caught by HOC:", error, errorInfo);
  }
});

// Using error handler hook
function MyComponent() {
  const throwError = useErrorHandler();

  const handleSomething = () => {
    try {
      // Some operation that might fail
    } catch (error) {
      throwError(error as Error);
    }
  };

  return <div>Your content here</div>;
}
```

## Props Reference

### `ErrorStateProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `"Something went wrong"` | Error title |
| `message` | `string` | `"An unexpected error occurred..."` | Error message |
| `error` | `Error \| string` | `undefined` | Error object or message |
| `showRetry` | `boolean` | `true` | Show retry button |
| `showRefresh` | `boolean` | `true` | Show refresh button |
| `showGoBack` | `boolean` | `true` | Show go back button |
| `showHome` | `boolean` | `true` | Show go home button |
| `onRetry` | `() => void` | `undefined` | Retry callback |
| `onRefresh` | `() => void` | `undefined` | Refresh callback |
| `onGoBack` | `() => void` | `undefined` | Go back callback |
| `onGoHome` | `() => void` | `undefined` | Go home callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `"default" \| "network" \| "server" \| "validation" \| "permission"` | `"default"` | Error variant |

### `ErrorCardProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `"Error"` | Error title |
| `message` | `string` | `undefined` | Error message |
| `error` | `Error \| string` | `undefined` | Error object or message |
| `showDismiss` | `boolean` | `true` | Show dismiss button |
| `showRetry` | `boolean` | `false` | Show retry button |
| `onDismiss` | `() => void` | `undefined` | Dismiss callback |
| `onRetry` | `() => void` | `undefined` | Retry callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `"default" \| "warning" \| "danger" \| "info"` | `"default"` | Error variant |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Card size |

### `NetworkErrorProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `undefined` | Error title |
| `message` | `string` | `undefined` | Error message |
| `error` | `Error \| string` | `undefined` | Error object or message |
| `onRetry` | `() => void` | `undefined` | Retry callback |
| `onCheckConnection` | `() => void` | `undefined` | Check connection callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `showConnectionCheck` | `boolean` | `true` | Show connection check button |
| `isOffline` | `boolean` | `false` | Whether user is offline |

### `ServerErrorProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `title` | `string` | `undefined` | Error title |
| `message` | `string` | `undefined` | Error message |
| `error` | `Error \| string` | `undefined` | Error object or message |
| `statusCode` | `number` | `undefined` | HTTP status code |
| `onRetry` | `() => void` | `undefined` | Retry callback |
| `onReportBug` | `() => void` | `undefined` | Report bug callback |
| `className` | `string` | `undefined` | Additional CSS classes |
| `showBugReport` | `boolean` | `true` | Show bug report button |
| `retryAfter` | `number` | `undefined` | Retry after seconds (for rate limiting) |

### `ErrorBoundaryProps`

| Prop | Type | Default | Description |
| :--- | :--- | :------ | :---------- |
| `children` | `ReactNode` | - | Child components |
| `fallback` | `ReactNode` | `undefined` | Custom fallback UI |
| `onError` | `(error: Error, errorInfo: ErrorInfo) => void` | `undefined` | Error callback |
| `resetOnPropsChange` | `boolean` | `false` | Reset on props change |
| `resetKeys` | `Array<string \| number>` | `undefined` | Keys to watch for reset |

## Accessibility

- **Error States**: Include `role="alert"` and `aria-live="polite"` for screen readers
- **Error Details**: Use `<details>` elements for collapsible error information
- **Buttons**: Include proper `aria-label` attributes for icon-only buttons
- **Focus Management**: Error boundaries maintain focus within error UI
- **Color Contrast**: All error variants meet WCAG AA contrast requirements

## Error Handling Best Practices

1. **Graceful Degradation**: Always provide fallback UI for error states
2. **User-Friendly Messages**: Avoid technical jargon in error messages
3. **Recovery Actions**: Provide clear actions users can take to recover
4. **Error Reporting**: Log errors for debugging while showing user-friendly messages
5. **Retry Logic**: Implement exponential backoff for retry mechanisms
6. **Error Boundaries**: Use error boundaries to catch and handle React errors
7. **Network Awareness**: Handle offline states and network errors appropriately
