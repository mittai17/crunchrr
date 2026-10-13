import * as Sentry from "@sentry/nextjs";
if (process.env.NEXT_PUBLIC_SENTRY_DSN)
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0.05,
    beforeSend(event) {
      delete event.user;
      return event;
    },
  });
// Analytics is explicitly opt-in; never record health, finance, document text or session replay.
if (
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_ANALYTICS_OPT_IN === "true"
)
  void import("posthog-js").then(({ default: posthog }) =>
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      persistence: "memory",
    }),
  );
