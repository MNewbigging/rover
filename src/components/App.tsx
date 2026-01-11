import "./app.scss";

import { appState } from "../app-state/app-state";
import { LoadingScreen } from "./loading-screen/loading-screen";
import { useEventUpdater } from "./hooks/use-event-updater";
import { Reticle } from "./reticle/reticle";

export function App() {
  useEventUpdater("game-started");

  const started = appState.started;

  return (
    <div className="ui-root">
      {!started && <LoadingScreen />}
      {started && <Reticle />}
    </div>
  );
}
