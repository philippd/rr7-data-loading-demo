import { Suspense, useState } from "react";
import {
  Await,
  Link,
  Outlet,
  useLocation,
  type ShouldRevalidateFunction,
} from "react-router";
import { LoadingBehaviorSelect } from "~/components/LoadingBehaviorSelect";
import { RouteError } from "~/components/RouteError";
import { Spinner } from "~/components/Spinner";
import {
  parseLoadingBehavior,
  simulateLoading,
  type PageLoadingBehavior,
} from "~/utils/loading";
import type { Route } from "./+types/home";

const isExactMatch = (pathname: string) => pathname === "/";

async function fetchHome(searchParams: URLSearchParams) {
  await simulateLoading(parseLoadingBehavior(searchParams.get("home")));
  return "Home Title";
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  if (isExactMatch(url.pathname)) {
    // SSR: await when we're on the home page (no dialog open)
    return { homeData: await fetchHome(url.searchParams) };
  }
  // Dialog is open: Return unresolved promise (loads in background)
  return { homeData: fetchHome(url.searchParams) };
}

// Optional: shows spinner instantly on client nav instead of waiting for server
export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  return { homeData: fetchHome(url.searchParams) };
}

// Prevent refetching when navigating back from dialog
export const shouldRevalidate: ShouldRevalidateFunction = () => false;

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteError title="Home Error" error={error} />;
}

export default function Home({
  loaderData: { homeData },
}: Route.ComponentProps) {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const [dialogBehavior, setDialogBehavior] = useState<PageLoadingBehavior>(
    () => (params.get("dialog") as PageLoadingBehavior) || "fast"
  );

  return (
    <div className="p-8">
      {/* Suspense shows spinner while promise is pending, Await handles resolved/rejected */}
      <Suspense fallback={<Spinner />}>
        <Await
          resolve={homeData}
          errorElement={<RouteError title="Home Error" />}
        >
          {(title) => <h1>{title}</h1>}
        </Await>
      </Suspense>
      {isExactMatch(pathname) && (
        <div className="flex items-center gap-4 mt-4">
          <span className="font-semibold">Client Navigation:</span>
          <LoadingBehaviorSelect
            label="Dialog"
            value={dialogBehavior}
            onChange={setDialogBehavior}
          />
          <Link
            to={`./dialog?${new URLSearchParams([
              ...params,
              ["dialog", dialogBehavior],
            ])}`}
            className="text-blue-600 underline"
          >
            Open Dialog
          </Link>
        </div>
      )}
      <Outlet />
    </div>
  );
}
