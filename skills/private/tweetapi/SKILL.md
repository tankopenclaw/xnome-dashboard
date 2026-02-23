---
name: tweetapi
description: Build and run integrations against TweetAPI (X/Twitter REST API), including user lookup, tweets, posting, interactions, communities, lists, spaces, search, login, and DM/XChat endpoints. Use when a user asks to call TweetAPI, generate TweetAPI client code, map business needs to TweetAPI endpoints, debug TweetAPI request/response errors, or design workflows that combine multiple TweetAPI endpoints.
---

# TweetAPI

Use this skill to translate user goals into concrete TweetAPI calls and production-ready request code.

## Quick Start

1. Read `references/endpoints.md` to find the endpoint category, method, path, and parameters.
2. Confirm the base URL and auth header:
   - Base URL: `https://api.tweetapi.com`
   - Header: `X-API-Key: <YOUR_API_KEY>`
3. Build request code using the endpoint method/path exactly as documented.
4. Handle pagination (`cursor`) and rate limits (plan-dependent).
5. Add robust error handling for non-2xx responses.

## Core Workflow

### 1) Choose endpoint(s) from the reference

Map intent to category first:
- user/profile/follow graph → `user`
- tweet lookup/retweets/quotes/translate → `tweet`
- publish/reply/delete → `post`
- like/bookmark/retweet/follow/list membership/analytics/notifications → `interaction`
- list/community/space/explore → corresponding category
- auth + DMs/XChat → `auth`, `xchat`, and DM-related interaction endpoints

Then select the specific endpoint in `references/endpoints.md`.

### 2) Build the request

Use this request template:

```bash
curl -X <METHOD> "https://api.tweetapi.com<METHOD_PATH>?param=value" \
  -H "X-API-Key: $TWEETAPI_KEY" \
  -H "Content-Type: application/json"
```

Rules:
- Put required query/path/body parameters exactly as listed in the reference.
- For POST endpoints, include JSON body fields only when required by that endpoint.
- Keep API key in env var; never hardcode.

### 3) Implement response handling

- Success: parse JSON safely and return only fields the user needs.
- Pagination: if `cursor` exists, expose it for next-page calls.
- Errors: surface HTTP status + API `message` field.

Expected error shape:

```json
{
  "statusCode": 400,
  "message": "Invalid username parameter"
}
```

### 4) Production guardrails

- Retry transient 5xx/429 with exponential backoff and jitter.
- Enforce per-plan throughput:
  - Pro: 60 req/min
  - Ultra: 120 req/min
  - Mega: 180 req/min
- Log request id (if present), endpoint, status, and latency.
- Mask secrets/tokens in logs.

## Output Pattern

When user asks for implementation help, output in this order:
1. Endpoint choice and why
2. Required parameters checklist
3. Runnable example (cURL + one language requested by user)
4. Common failure modes and fixes

## References

- `references/endpoints.md`: Auto-extracted endpoint catalog from TweetAPI docs.
- `references/endpoints.json`: Same data in machine-readable format for scripting or codegen.

If an endpoint behavior seems unclear, open the corresponding `Doc:` URL from the reference and align to the latest docs wording.
