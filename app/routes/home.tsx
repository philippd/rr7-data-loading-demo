import { useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  type ShouldRevalidateFunction,
} from "react-router";
import type { Route } from "./+types/home";
import { LoadingBehaviorSelect } from "~/components/LoadingBehaviorSelect";
import { RouteError } from "~/components/RouteError";
import { Spinner } from "~/components/Spinner";
import {
  parseLoadingBehavior,
  simulateLoading,
  type PageLoadingBehavior,
} from "~/utils/loading";

const isExactMatch = (pathname: string) => pathname === "/home";

async function fetchHome(searchParams: URLSearchParams) {
  await simulateLoading(parseLoadingBehavior(searchParams.get("home")));
  return "Home Title";
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  // Only fetch on server for exact match (when we want SSR).
  // When the dialog is open the clientLoader will handle the loading.
  if (isExactMatch(url.pathname)) {
    return { title: await fetchHome(url.searchParams) };
  }
  return { title: null };
}

export async function clientLoader({
  request,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const url = new URL(request.url);

  // Use server data for exact match
  if (isExactMatch(url.pathname)) {
    return serverLoader();
  }

  return { title: await fetchHome(url.searchParams) };
}
// This makes sure the clientLoader runs on direct navigation to child routes.
clientLoader.hydrate = true as const;

export const shouldRevalidate: ShouldRevalidateFunction = () => false;

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteError title="Home Error" error={error} />;
}

export default function Home({ loaderData: { title } }: Route.ComponentProps) {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const [dialogBehavior, setDialogBehavior] = useState<PageLoadingBehavior>(
    () => (params.get("dialog") as PageLoadingBehavior) || "fast"
  );

  return (
    <div className="p-8">
      {title ? <h1>{title}</h1> : <Spinner />}
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
