#!/usr/bin/env python3
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import requests

BASE_URL = "https://api.tweetapi.com"
STATE_FILE = Path("/home/tank/.openclaw/workspace/.secrets/tweetapi-watcher-state.json")
ENV_FILE = Path("/home/tank/.openclaw/workspace/.secrets/tweetapi.env")
TANKXU_USER_ID = "228692195"
MENTION_QUERY = "from:tankxu @0xTClaw"
MAX_PROCESSED = 500


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_api_key() -> str:
    if not ENV_FILE.exists():
        raise FileNotFoundError(f"Missing env file: {ENV_FILE}")
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if line.startswith("TWEETAPI_KEY="):
            value = line.split("=", 1)[1].strip()
            if value:
                return value
    raise RuntimeError("TWEETAPI_KEY not found in env file")


def default_state() -> Dict[str, Any]:
    return {
        "tankxuUserId": TANKXU_USER_ID,
        "latestTankxuTweetId": None,
        "latestMentionId": None,
        "processedTweetIds": [],
        "processedMentionIds": [],
        "updatedAt": now_iso(),
    }


def load_state() -> Dict[str, Any]:
    if not STATE_FILE.exists():
        s = default_state()
        save_state(s)
        return s
    data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    s = default_state()
    s.update(data)
    s["processedTweetIds"] = list(s.get("processedTweetIds") or [])[-MAX_PROCESSED:]
    s["processedMentionIds"] = list(s.get("processedMentionIds") or [])[-MAX_PROCESSED:]
    return s


def save_state(state: Dict[str, Any]) -> None:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    state["updatedAt"] = now_iso()
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def get_json(path: str, headers: Dict[str, str], params: Dict[str, str]) -> Dict[str, Any]:
    r = requests.get(f"{BASE_URL}{path}", headers=headers, params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def safe_get_json(path: str, headers: Dict[str, str], params: Dict[str, str]) -> Dict[str, Any]:
    try:
        return get_json(path, headers, params)
    except Exception:
        return {}


def as_list(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if isinstance(payload, dict):
        d = payload.get("data")
        if isinstance(d, list):
            return [x for x in d if isinstance(x, dict)]
        if isinstance(d, dict):
            for k in ("tweets", "items", "entries", "data"):
                v = d.get(k)
                if isinstance(v, list):
                    return [x for x in v if isinstance(x, dict)]
    return []


def tweet_url(username: str, tweet_id: str) -> str:
    return f"https://x.com/{username}/status/{tweet_id}"


def run_once() -> List[str]:
    key = load_api_key()
    headers = {"X-API-Key": key}
    state = load_state()

    alerts: List[str] = []

    # 1) tankxu latest tweets
    tweets_payload = safe_get_json("/tw-v2/user/tweets", headers, {"userId": TANKXU_USER_ID})
    tweets = as_list(tweets_payload)

    if tweets:
        newest_tweet_id = str(tweets[0].get("id") or "")
        if newest_tweet_id:
            state["latestTankxuTweetId"] = newest_tweet_id

        processed = set(state.get("processedTweetIds") or [])
        last_seen = str(state.get("latestTankxuTweetId") or "")
        for t in tweets:
            tid = str(t.get("id") or "")
            if not tid:
                continue
            if last_seen and tid == last_seen:
                break
            if tid in processed:
                continue

            author = t.get("author") or {}
            username = author.get("username") or "tankxu"
            text = (t.get("text") or "").replace("\n", " ").strip()
            text_short = (text[:120] + "…") if len(text) > 120 else text

            alerts.append(
                "【新推文】@tankxu 发布了新内容，请 0xTClaw 去点赞并写回复\n"
                f"- tweetId: {tid}\n"
                f"- 链接: {tweet_url(username, tid)}\n"
                f"- 内容: {text_short}"
            )
            state["processedTweetIds"].append(tid)

    # 2) mentions from tankxu to 0xTClaw
    mention_payload = safe_get_json("/tw-v2/explore/search", headers, {"query": MENTION_QUERY, "type": "Latest"})
    mentions = as_list(mention_payload)

    if mentions:
        newest_mention_id = str(mentions[0].get("id") or "")
        if newest_mention_id:
            state["latestMentionId"] = newest_mention_id

        processed_m = set(state.get("processedMentionIds") or [])
        last_seen_m = str(state.get("latestMentionId") or "")
        for m in mentions:
            mid = str(m.get("id") or "")
            if not mid:
                continue
            if last_seen_m and mid == last_seen_m:
                break
            if mid in processed_m:
                continue

            author = m.get("author") or {}
            username = author.get("username") or "tankxu"
            text = (m.get("text") or "").replace("\n", " ").strip()
            text_short = (text[:120] + "…") if len(text) > 120 else text

            alerts.append(
                "【新@提及】检测到 @tankxu 提及了 @0xTClaw，请 OpenClaw 处理\n"
                f"- tweetId: {mid}\n"
                f"- 链接: {tweet_url(username, mid)}\n"
                f"- 内容: {text_short}"
            )
            state["processedMentionIds"].append(mid)

    # keep recent only
    state["processedTweetIds"] = (state.get("processedTweetIds") or [])[-MAX_PROCESSED:]
    state["processedMentionIds"] = (state.get("processedMentionIds") or [])[-MAX_PROCESSED:]

    save_state(state)
    return alerts


if __name__ == "__main__":
    out = run_once()
    if out:
        print("\n\n".join(out))
