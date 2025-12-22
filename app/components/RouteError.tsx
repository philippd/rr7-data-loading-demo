import { useAsyncError } from "react-router";

interface RouteErrorProps {
  title: string;
  error?: unknown;
}

export function RouteError({ title, error: errorProp }: RouteErrorProps) {
  // Use prop if provided (ErrorBoundary), otherwise use hook (Await errorElement)
  const asyncError = useAsyncError();
  const error = errorProp ?? asyncError;

  return (
    <div>
      <h2 className="text-red-600 text-xl font-bold">{title}</h2>
      <p className="text-red-500">
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    </div>
  );
}
