import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { LoadingBehaviorSelect } from "~/components/LoadingBehaviorSelect";
import type { PageLoadingBehavior } from "~/utils/loading";

export default function Layout() {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);

  const [home, setHome] = useState<PageLoadingBehavior>(
    () => (params.get("home") as PageLoadingBehavior) || "fast"
  );
  const [dialog, setDialog] = useState<PageLoadingBehavior>(
    () => (params.get("dialog") as PageLoadingBehavior) || "fast"
  );
  const [showDialog, setShowDialog] = useState(() =>
    pathname.includes("/dialog")
  );

  const reload = () => {
    const newParams = new URLSearchParams();
    newParams.set("home", home);
    if (showDialog) {
      newParams.set("dialog", dialog);
      window.location.href = `/dialog?${newParams.toString()}`;
    } else {
      window.location.href = `/?${newParams.toString()}`;
    }
  };

  return (
    <div>
      <nav className="p-4 bg-gray-100 dark:bg-gray-800 flex gap-4 items-center flex-wrap">
        <span className="font-semibold">SSR:</span>

        <LoadingBehaviorSelect label="Home" value={home} onChange={setHome} />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDialog}
            onChange={(e) => setShowDialog(e.target.checked)}
            className="w-4 h-4"
          />
          Show Dialog
        </label>

        {showDialog && (
          <LoadingBehaviorSelect
            label="Dialog"
            value={dialog}
            onChange={setDialog}
          />
        )}

        <button
          onClick={reload}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload
        </button>
      </nav>

      <Outlet />
    </div>
  );
}
