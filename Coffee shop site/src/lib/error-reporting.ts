type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type ErrorEventsBridge = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: ErrorReportOptions,
  ) => void;
};

declare global {
  interface Window {
    __editorEvents?: ErrorEventsBridge;
  }
}

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (window.__editorEvents?.captureException) {
    window.__editorEvents.captureException(
      error,
      {
        source: "react_error_boundary",
        route: window.location.pathname,
        ...context,
      },
      {
        mechanism: "react_error_boundary",
        handled: false,
        severity: "error",
      },
    );
    return;
  }
  console.error(error, context);
}
