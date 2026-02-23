---
name: upnp-manager
description: Manage router UPnP port mappings with miniupnpc. Use when user asks to query/list current mappings, add a new mapping, or remove a mapping; always show both public access addresses using external IP and home.tankxu.com.
---

Use `scripts/upnp-manager.sh` for all operations.

## Commands

- List mappings:
  - `bash scripts/upnp-manager.sh list`
- Add mapping:
  - `bash scripts/upnp-manager.sh add <internal_ip> <internal_port> <external_port> <TCP|UDP> [description] [lease_seconds]`
- Remove mapping:
  - `bash scripts/upnp-manager.sh remove <external_port> <TCP|UDP>`

## Output Requirements

After list/add/remove, report:

- External IP address from router
- Public URL with IP: `http://<external-ip>:<port>`
- Public URL with domain: `http://home.tankxu.com:<port>`

If protocol is HTTPS service, switch scheme to `https://` in response text.

## Notes

- Prefer uncommon external ports when adding mappings unless user specifies one.
- Keep descriptions short and meaningful (example: `nuc-vite-5173`).
- If UPnP device is not found, tell user router UPnP may be disabled.