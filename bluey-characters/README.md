# 布鲁依人物图鉴网站

一个纯前端静态网站：展示 Bluey 人物图片和简介，数据来自预先抓取好的 `characters.json`（避免线上跨域限制）。

## 使用

直接打开 `index.html` 即可（建议用本地静态服务器运行）。

```bash
cd bluey-characters
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 说明

- 数据来源：`https://blueypedia.fandom.com`
- 人物列表来自分类页 `Category:Characters`
- 简介和图片来自页面摘要和缩略图
- 若来源站点临时限流或跨域策略变化，页面会显示加载失败提示
