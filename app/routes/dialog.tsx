import { Suspense } from "react";
import { Await, Link } from "react-router";
import type { Route } from "./+types/dialog";
import { RouteError } from "~/components/RouteError";
import { Spinner } from "~/components/Spinner";
import { parseLoadingBehavior, simulateLoading } from "~/utils/loading";

async function fetchDialog(searchParams: URLSearchParams) {
  const behavior = parseLoadingBehavior(searchParams.get("dialog"));
  await simulateLoading(behavior);
  return "Dialog Title";
}

// SSR: await the data before rendering
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = await fetchDialog(url.searchParams);
  return { title };
}

// Client navigation: return unresolved promise to show spinner
export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  return { title: fetchDialog(url.searchParams) };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteError title="Dialog Error" error={error} />;
}

export default function Dialog({ loaderData }: Route.ComponentProps) {
  return (
    <div className="py-4">
      <Suspense fallback={<Spinner />}>
        <Await
          resolve={loaderData.title}
          errorElement={<RouteError title="Dialog Error" />}
        >
          {(title) => <h2>{title}</h2>}
        </Await>
      </Suspense>

      <Link to=".." className="text-blue-600 underline">
        Close Dialog
      </Link>
    </div>
  );
}
