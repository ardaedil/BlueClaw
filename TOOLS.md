# BlueClaw OpenClaw Workspace: TOOLS

BlueClaw exposes a narrow HTTP bridge for OpenClaw.

## Core Action Endpoint
`POST /api/openclaw/action`

### Actions
- `create_watch`: Create a new watch job from structured constraints.
- `list_watches`: List all watches (optionally `activeOnly`).
- `update_watch`: Update watch filters/thresholds.
- `pause_watch`: Disable a watch without deleting it.
- `resume_watch`: Re-enable a paused watch.
- `delete_watch`: Remove a watch.
- `recent_matches`: Fetch top recent listings for a watch.

## Natural-Language Endpoint
`POST /api/openclaw/command`

Use when OpenClaw receives conversational input such as:
- "Watch eBay for a PS5 under $300"
- "Show me my active watches"
- "Pause watch <id>"

The command endpoint interprets text, maps to one core action, and returns both interpretation and result.

## Polling + Notifications
- Trigger immediate scans with `/api/poll/run-all` or `/api/poll/:watchJobId/run`.
- Strong matches create notifications in DB.
- If `OPENCLAW_WEBHOOK_URL` is set, BlueClaw emits `blueclaw.match_alert` events.

## Demo Reliability Notes
- Prefer `EBAY_MOCK_MODE=true` for live demos.
- Use webhook demo endpoints for local verification when OpenClaw inbound endpoint is unavailable.
