import * as Sentry from "@sentry/browser"
import { BrowserTracing } from "@sentry/tracing"

export const initSentry = () => {
  Sentry.init({
    dsn: "https://c258a67001c34940a442268890d87924@o4504083925827584.ingest.sentry.io/4504083928383488",
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })
}
