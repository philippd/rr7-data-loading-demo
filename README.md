# React Router Data Loading

Prototype exploring SSR and client-side data loading in React Router 7, achieving a Netflix-like pattern where dialog content is SSR'd while parent content loads in background.

## Goal

When navigating to `/dialog`:

- **Dialog**: SSR immediately (priority content)
- **Home**: Load in background, display when ready

## The Pattern

Both routes use the same approach:

```typescript
// Server: await for SSR
export async function loader({ request }) {
  return { data: await fetchData(...) };
}

// Client: return unresolved promise (no await!) to show spinner instantly
export function clientLoader({ request }) {
  return { data: fetchData(...) };
}
```

```tsx
// Component: Suspense handles pending, Await handles resolved/rejected
<Suspense fallback={<Spinner />}>
  <Await resolve={data} errorElement={<ErrorComponent />}>
    {(t) => <h1>{t}</h1>}
  </Await>
</Suspense>
```

## Home: Deferred Loading for Child Routes

Home has one addition - when dialog is open, return unresolved promise to load in background:

```typescript
export async function loader({ request }) {
  if (isExactMatch(url.pathname)) {
    return { data: await fetchHome(...) };  // SSR
  }
  return { data: fetchHome(...) };  // Deferred (dialog is open)
}
```

## Unhandled Promise Rejections

Returning an unresolved promise from a server loader that rejects will crash Node.js:

```typescript
return { data: fetchData(...) };  // If this rejects → Node crashes
```

**Why?** The loader returns `{ data: Promise }`. When that nested promise rejects later, it's outside React Router's try-catch, causing an unhandled rejection.

**Solution:** Add handler in `entry.server.tsx`:

```typescript
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
```

This prevents crashes. Errors still flow to `<Await errorElement>`.

Note: Client-side rejections are always safe - React handles them.

---

## Development

```bash
pnpm install
pnpm dev
```

App available at `http://localhost:5173`
