# OpenClaw Integration Bridge

BlueClaw exposes a narrow HTTP bridge endpoint for OpenClaw:

- `POST /api/openclaw/action`

Payload:
```json
{ "action": "create_watch", "payload": { "userId":"demo-user", "title":"PS5 under 300", "query":"PS5", "maxPrice":300 } }
```

Supported actions:
- `create_watch`
- `list_watches`
- `update_watch`
- `pause_watch`
- `resume_watch`
- `delete_watch`
- `recent_matches`

This keeps permissions narrow: OpenClaw only needs network access to this endpoint.

For delivery of strong alerts back into OpenClaw, set `OPENCLAW_WEBHOOK_URL` and BlueClaw sends `blueclaw.match_alert` events.
