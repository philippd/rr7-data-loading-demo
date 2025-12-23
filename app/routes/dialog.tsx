import { Suspense } from "react";
import { Await, Link } from "react-router";
import { RouteError } from "~/components/RouteError";
import { Spinner } from "~/components/Spinner";
import { parseLoadingBehavior, simulateLoading } from "~/utils/loading";
import type { Route } from "./+types/dialog";

async function fetchDialog(searchParams: URLSearchParams) {
  await simulateLoading(parseLoadingBehavior(searchParams.get("dialog")));
  return "Dialog Title";
}

// SSR: await the data before rendering
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  return { dialogData: await fetchDialog(url.searchParams) };
}

// Client navigation: return unresolved promise (no await!) to show spinner
export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  return { dialogData: fetchDialog(url.searchParams) };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteError title="Dialog Error" error={error} />;
}

export default function Dialog({
  loaderData: { dialogData },
}: Route.ComponentProps) {
  return (
    <div className="py-4">
      {/* Suspense shows spinner while promise is pending, Await handles resolved/rejected */}
      <Suspense fallback={<Spinner />}>
        <Await
          resolve={dialogData}
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
