# tea-mall-app

面向消费者的茶叶商城用户端，支持 H5、微信小程序及 UniApp 构建目标。

## 项目简介

本项目是茶叶商城用户端，提供注册登录、商品浏览和搜索、购物车、订单与售后、优惠券、消费积分与兑换、茶友邀请、直属佣金、合伙人申请、内容科普、社区互动和客服工单等页面。所有业务数据通过 `tea-mall-backend` API 获取，并与 `tea-mall-admin` 管理后台实时同步。

## 技术栈

- Vue 3、UniApp、JavaScript
- Vite、`@dcloudio/uni-app`、微信小程序构建器
- H5、微信小程序（mp-weixin）双构建目标
- Uni UI 组件、Vue I18n、二维码生成

## 关联仓库

| 项目 | 说明 | GitHub |
|---|---|---|
| tea-mall-backend | 后端服务 | [tea-mall-backend](https://github.com/sickelgroupe-create/tea-mall-backend) |
| tea-mall-admin | 管理后台 | [tea-mall-admin](https://github.com/sickelgroupe-create/tea-mall-admin) |
| tea-mall-app | 用户端（当前仓库） | [tea-mall-app](https://github.com/sickelgroupe-create/tea-mall-app) |

## 快速启动

```sh
npm install
npm run dev:h5
```

生产构建：

```sh
npm run build:h5
npm run build:mp-weixin
```

微信开发者工具请打开 `dist/upload/mp-weixin-ready`。API 地址和微信配置通过 `.env.example` 或本地构建配置提供；不要将 AppSecret、Token 或私钥写入项目。

## 项目结构

- `pages/`：用户端业务页面
- `components/`：通用 UI 组件
- `shared/`：API、会话和页面业务逻辑
- `static/`：公开图片和字体资源
- `styles/`：主题和商城样式
- `scripts/`：构建、打包和验证脚本
- `tests/`：集成和页面验收测试

## 简历描述示例

参与茶叶商城用户端开发，基于 UniApp 和 Vue 3 同时支持 H5 与微信小程序，完成商品、订单、积分兑换、邀请奖励、合伙人、社区和售后等用户业务流程。
