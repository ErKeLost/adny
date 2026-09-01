# adny.me

个人网站，结合 `adrien.website/txt/` 的首屏滚动缩放机制与 `maxkatz.me` 的克制型开发者履历结构重新设计。技术栈为 TanStack Start、React 19、Tailwind CSS 4、shadcn/ui、GSAP 和 Cloudflare Workers。

## 本地开发

```bash
npm install
npm run dev
```

开发地址默认为 `http://localhost:3000`。

## 修改个人内容

主要内容集中在 `src/data/portfolio.ts`：

- 姓名、职位、邮箱和 GitHub 用户名
- 组织
- 技术方向
- 最近在做的产品
- GitHub 置顶产品

当前内容来自 `ErKeLost` 的 GitHub 主页、组织成员列表、置顶仓库与产品 README。GitHub 活跃图会根据 `githubUsername` 从公开贡献接口读取真实数据。首屏图片位于 `public/hero-pink.jpg`。

## 动效与主题

- GSAP ScrollTrigger 固定首屏，并用 `transform: scale()` 将图片缩放到与正文完全相同的宽度。
- 缩放过程中只动画 transform、opacity 和圆角，避免持续修改布局尺寸。
- 明暗主题由 Canvas 对同一张图片实时调色，并平滑插值亮度、饱和度、对比度和文字遮罩。
- `prefers-reduced-motion` 下取消滚动固定，直接显示静态缩小画面。

## 检查与构建

```bash
npm run check
npm run build
```

## 部署到 Cloudflare Workers

首次部署：

```bash
npx wrangler login
npm run deploy
```

部署成功后，Cloudflare 会提供一个 `workers.dev` 地址。正式域名需要在 Cloudflare Dashboard 中打开 Workers & Pages，进入 `adny-me` Worker，然后在 Settings > Domains & Routes 中添加 `adny.me` 和 `www.adny.me`。

## 域名与部署

`adny.me` 已于 2026-09-01 在阿里云万网注册，注册期为 1 年，当前到期时间为 2027-09-01。

- 注册商：Alibaba Cloud Computing (Beijing) Co., Ltd.
- 权威 DNS：`apollo.ns.cloudflare.com`、`bingo.ns.cloudflare.com`
- Cloudflare Worker：`adny-me`
- 自定义域名：`https://adny.me`、`https://www.adny.me`

域名 DNS 切换到 Cloudflare 后，Worker 会自动管理根域名和 `www` 的代理记录与 HTTPS 证书。

## 图片来源

首屏使用用户提供的 `pink.jpeg`，项目内保留一份为网页优化过的 2560×1440 版本。
