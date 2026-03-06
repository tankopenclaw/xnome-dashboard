# ops-review-watcher

通用人工审核通知 watcher。默认每 10 分钟检查数据库中的待审核记录，有新增就发到 Lark Webhook。

## 当前支持

- `reward_claims`：奖励领取审核（已实现）

## 已预留（后端未实现前先占位）

- `task_reviews`：单个 task 的人工审核（可通过 `TASK_PENDING_SQL` 注入查询）

## 配置方式

- `.env`：只放敏感信息
  - `DATABASE_URL`
  - `LARK_WEBHOOK_URL`
- `src/config.js`：放业务配置
  - 轮询间隔
  - group ids
  - sources
  - task review 预留配置

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
