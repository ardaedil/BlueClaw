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

## Natural-language bridge for demo
For ClawCon demos you can also use:

- `POST /api/openclaw/command`

Payload:
```json
{ "userId": "demo-user", "command": "Watch eBay for a PS5 under $300" }
```

This route interprets the natural-language command into one of the supported actions and executes it.

## Alert delivery back to OpenClaw
Set `OPENCLAW_WEBHOOK_URL` and BlueClaw sends `blueclaw.match_alert` events containing watch + listing context.

### Local loopback demo option
To demo end-to-end without a separate OpenClaw server, set:

```bash
OPENCLAW_WEBHOOK_URL=http://localhost:3000/api/openclaw/webhook-demo
```

Then inspect delivered events:

- `GET /api/openclaw/webhook-demo/events`
