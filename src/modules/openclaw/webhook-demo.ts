type OpenClawEvent = {
  receivedAt: string;
  event: string;
  payload: unknown;
};

const events: OpenClawEvent[] = [];

export function recordOpenClawDemoEvent(event: string, payload: unknown) {
  events.unshift({
    receivedAt: new Date().toISOString(),
    event,
    payload
  });

  if (events.length > 100) {
    events.length = 100;
  }
}

export function listOpenClawDemoEvents() {
  return events;
}
