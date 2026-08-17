import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { translator } from "./shared/services/translationService";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
  try {
    translator.start();
  } catch (e) {
    console.error("Failed to start translator:", e);
  }
});

