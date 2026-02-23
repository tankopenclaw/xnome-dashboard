#!/usr/bin/env bash
set -euo pipefail

DOMAIN="home.tankxu.com"

usage() {
  cat <<'EOF'
Usage:
  upnp-manager.sh list
  upnp-manager.sh add <internal_ip> <internal_port> <external_port> <TCP|UDP> [description] [lease_seconds]
  upnp-manager.sh remove <external_port> <TCP|UDP>
EOF
}

need_upnpc() {
  command -v upnpc >/dev/null 2>&1 || {
    echo "Error: upnpc not found. Install miniupnpc first." >&2
    exit 1
  }
}

external_ip() {
  upnpc -s 2>/dev/null | awk -F'= ' '/ExternalIPAddress/ {print $2; exit}'
}

show_access() {
  local ext_port="$1"
  local scheme="http"
  if [[ "$ext_port" == "443" ]]; then
    scheme="https"
  fi

  local ip
  ip="$(external_ip || true)"
  if [[ -n "$ip" ]]; then
    echo "External IP: $ip"
    echo "Public (IP): ${scheme}://${ip}:${ext_port}"
  else
    echo "External IP: (unavailable)"
    echo "Public (IP): ${scheme}://<external-ip>:${ext_port}"
  fi
  echo "Public (Domain): ${scheme}://${DOMAIN}:${ext_port}"
}

cmd_list() {
  upnpc -l
}

cmd_add() {
  local internal_ip="${1:-}"
  local internal_port="${2:-}"
  local external_port="${3:-}"
  local proto="${4:-}"
  local desc="${5:-upnp-${internal_port}}"
  local lease="${6:-86400}"

  [[ -n "$internal_ip" && -n "$internal_port" && -n "$external_port" && -n "$proto" ]] || {
    usage
    exit 2
  }

  proto="${proto^^}"
  upnpc -e "$desc" -a "$internal_ip" "$internal_port" "$external_port" "$proto" "$lease"
  echo
  echo "Added mapping: ${proto} ${external_port} -> ${internal_ip}:${internal_port} (${desc})"
  show_access "$external_port"
}

cmd_remove() {
  local external_port="${1:-}"
  local proto="${2:-}"

  [[ -n "$external_port" && -n "$proto" ]] || {
    usage
    exit 2
  }

  proto="${proto^^}"
  upnpc -d "$external_port" "$proto"
  echo
  echo "Removed mapping: ${proto} ${external_port}"
  show_access "$external_port"
}

main() {
  need_upnpc
  local action="${1:-}"
  shift || true

  case "$action" in
    list) cmd_list "$@" ;;
    add) cmd_add "$@" ;;
    remove|rm|del|delete) cmd_remove "$@" ;;
    *) usage; exit 2 ;;
  esac
}

main "$@"
