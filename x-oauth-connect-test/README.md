# X OAuth Connect Test (Cloudflare Pages)

一个纯静态测试页，用来验证手机上点击不同类型的 X Connect 按钮时，是否会拉起 X App。

## 文件
- `index.html`：测试页面

## 部署到 Cloudflare Pages

### 方式 A：CLI 直接部署（推荐）
```bash
cd x-oauth-connect-test
npx wrangler pages deploy . --project-name x-oauth-connect-test
```

首次会提示登录 Cloudflare。

### 方式 B：Dashboard
1. Cloudflare Dashboard → Pages → Create project
2. 选择 **Direct Upload**
3. 上传 `x-oauth-connect-test` 文件夹内容

## 可选：先本地预览
```bash
cd x-oauth-connect-test
python3 -m http.server 8787
```
然后打开 `http://localhost:8787`

## 注意
- OAuth2 按钮中的 `client_id` / `redirect_uri` / `code_challenge` 是占位符。
- OAuth1 按钮中的 `oauth_token` 也需要由你服务端动态生成。
- 本页重点是“是否能拉起 X App”，不是完整授权闭环。
