# ops-review-watcher

通用人工审核通知 watcher。默认每 10 分钟检查数据库中的待审核记录，有新增就发到 Lark Webhook。

## 当前支持

- `reward_claims`：奖励领取审核（已实现）

## 已预留（后端未实现前先占位）

- `task_reviews`：单个 task 的人工审核（可通过 `TASK_PENDING_SQL` 注入查询）

## 特性

- 支持多个任务组（`GROUP_IDS=1,2,3`）
- 也支持单个任务组（`GROUP_IDS=12`）
- 增量检查（按 `source + groupId` 维度记录 `lastSeenId`）
- 首次运行自动基线，不推历史

## 配置

```bash
cp .env.example .env
```

必填：
- `DATABASE_URL`
- `LARK_WEBHOOK_URL`

常用：
- `POLL_INTERVAL_MINUTES=10`
- `GROUP_IDS=1,2,3`
- `REVIEW_SOURCES=reward_claims,task_reviews`
- `TASK_REVIEW_ENABLED=true`（当后端/表准备好再开）
- `TASK_PENDING_SQL=...`（未来 task 审核自定义查询）

## 启动

```bash
pnpm install
pnpm start
```

## PM2 常驻

```bash
pm2 start src/index.js --name ops-review-watcher --cwd /ANOME/www/ops-review-watcher
pm2 save
```
