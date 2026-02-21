# 布鲁依人物图鉴网站

一个纯前端静态网站：自动从 Bluey Wiki 获取 `Category:Characters` 下的人物，展示图片和简介。

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
