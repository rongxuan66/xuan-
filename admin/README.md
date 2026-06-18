# lnb Admin

基于 vue-next-admin 修改的精简版后台管理系统。

## 原版项目

- 原版仓库：https://gitee.com/lyt-top/vue-next-admin
- 原版文档：https://lyt-top.gitee.io/vue-next-admin-doc-preview
- 原版演示：http://vuenextadmin.ccfast.cc/

## 精简内容

本版本在原版基础上进行了以下精简：

- 菜单只保留：仪表盘工作台、系统管理（用户管理、角色管理、菜单管理、部门管理、字典管理）
- 移除登录页多余的登录方式（手机号登录、扫码登录）
- 简化顶部导航栏，移除多余功能入口
- 简化用户菜单，只保留基本功能
- 其他示例页面保留在 `src/views/` 文件夹供参考

## 技术栈

- Vue 3 + TypeScript + Vite
- Element Plus
- Pinia + Vue Router

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生产环境构建
pnpm build
```

## 默认账号

- 用户名：admin
- 密码：123456

## License

MIT
