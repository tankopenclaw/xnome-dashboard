# reward-pending-watcher

每 10 分钟检查奖励申请表是否有新的 `PENDING` 记录，有则推送到 Lark Webhook。

## 功能

- 支持多个任务组（`GROUP_IDS=1,2,3`）
- 增量检查（按每个 group 的 `claim_id` 去重）
- 首次运行自动初始化基线，避免把历史数据全部推送
- 推送字段：任务组名、用户昵称、邮箱、claimId、提交时间

## 环境变量

复制配置：

```bash
cp .env.example .env
```

必填：

- `DATABASE_URL`
- `LARK_WEBHOOK_URL`

可选：

- `POLL_INTERVAL_MINUTES`（默认 10）
- `GROUP_IDS`（逗号分隔；为空表示全量任务组）
- `STATE_FILE`（默认 `./state.json`）

## 启动

```bash
pnpm install
pnpm start
```

## PM2 常驻

```bash
pm2 start src/index.js --name reward-pending-watcher --cwd /ANOME/www/reward-pending-watcher
pm2 save
```

## 工作原理

1. 查询目标 group 的最新 `PENDING` claim
2. 与本地 `state.json` 中每个 group 的 `lastSeenClaimId` 对比
3. 仅把新增记录发送到 Lark
4. 更新状态文件

## 依赖表

- `task_group_reward_claim`（状态、提交时间、claimId）
- `task_group`（任务组名）
- `users`（昵称、邮箱）
