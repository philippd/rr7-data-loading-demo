# React Router Data Loading

Prototype exploring SSR and client-side data loading in React Router 7, achieving a Netflix-like pattern where content loads in background while a dialog is displayed.

## Goal

When navigating to `/dialog`:

- **Dialog**: SSR immediately (priority content)
- **Home**: Load in background on client, display when ready

## Pattern: dialog.tsx (simple)

```typescript
// Server: await for SSR
export async function loader({ request }) {
  return { title: await fetchDialog(...) };
}

// Client: return unresolved promise for deferred loading
export function clientLoader({ request }) {
  return { title: fetchDialog(...) };  // no await!
}
```

Component uses `<Suspense>` + `<Await>`:

```tsx
<Suspense fallback={<Spinner />}>
  <Await resolve={title} errorElement={<ErrorComponent />}>
    {(t) => <h2>{t}</h2>}
  </Await>
</Suspense>
```

Server returns resolved data (SSR). On client navigation, `clientLoader` returns an unresolved promise, `<Await>` suspends until resolved.

## Pattern: home.tsx (parent route with child)

Home needs different behavior depending on whether it's the active route or parent of a child:

```typescript
// Server: only fetch for exact match
export async function loader({ request }) {
  if (isExactMatch(url.pathname)) {
    return { title: await fetchHome(...) };
  }
  return { title: null };  // child route active, skip server fetch
}

// Client: use server data for exact match, fetch for child routes
export async function clientLoader({ request, serverLoader }) {
  if (isExactMatch(url.pathname)) {
    return serverLoader();
  }
  return { title: await fetchHome(...) };
}
clientLoader.hydrate = true;  // required!
```

Component uses **conditional rendering** (not `<Await>`):

```tsx
{
  title ? <h1>{title}</h1> : <Spinner />;
}
```

### Why not `<Await>` for home?

`<Await resolve={null}>` doesn't suspend - it resolves immediately with `null`. Since server returns `null` for child routes, conditional rendering is needed to show spinner.

### Why `clientLoader.hydrate = true`?

Without it, `clientLoader` only runs on client navigation. For direct navigation to `/home/dialog`, clientLoader must run on hydration to fetch home data.

## Unresolved Promises: Server vs Client

**Server loaders**: Never return unresolved promises. If the promise rejects, Node.js crashes with an unhandled rejection before React can catch it.

```typescript
// CRASHES NODE if fetchHome rejects:
return { title: fetchHome(...) };  // no await = unresolved promise
```

**Client loaders**: Unresolved promises are fine. Rejections are caught by:

- `<Await errorElement>` for deferred data
- `ErrorBoundary` for awaited data

This is why we use `clientLoader` for background/deferred loading instead of returning unresolved promises from server loaders.

---

## Development

```bash
pnpm install
pnpm dev
```

App available at `http://localhost:5173`
