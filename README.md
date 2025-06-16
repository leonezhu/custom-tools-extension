# Custom Tools Extension

个人定制网页工具合集 Chrome 浏览器插件

## 📋 功能特性

- 🎯 **网站特定功能**：针对不同网站提供定制化功能
- 🔧 **可配置界面**：通过弹出页面轻松管理各项功能
- 💾 **配置持久化**：设置自动保存，重启浏览器后依然有效
- 🚀 **轻量高效**：基于 Manifest V3，性能优异

## 🎮 当前支持的网站

### Bilibili
- **搜索框提示替换**：自定义搜索框的 placeholder 文案

## 🚀 安装方法

### 开发者模式安装

1. 打开 Chrome 浏览器，进入扩展程序管理页面：
   - 地址栏输入：`chrome://extensions/`
   - 或者：菜单 → 更多工具 → 扩展程序

2. 开启「开发者模式」（页面右上角的开关）

3. 点击「加载已解压的扩展程序」

4. 选择本项目的根目录文件夹

5. 安装完成！插件图标会出现在浏览器工具栏中

## 📖 使用说明

1. **访问支持的网站**（如 bilibili.com）

2. **点击插件图标**，打开配置面板

3. **启用功能**：勾选想要使用的功能

4. **自定义设置**：修改相关的文本内容

5. **保存生效**：配置会自动保存，刷新页面即可看到效果

## 🛠 开发说明

### 项目结构

```
custom-tools-extension/
├── manifest.json              # 插件配置文件
├── storage.js                 # 配置存储工具
├── content-scripts/
│   └── bilibili.js           # Bilibili 功能脚本
├── popup/
│   ├── popup.html            # 弹出页面
│   ├── popup.js              # 弹出页面逻辑
│   └── popup.css             # 弹出页面样式
├── icons/
│   └── icon.png              # 插件图标
└── README.md                 # 说明文档
```

### 添加新网站支持

1. **修改 `manifest.json`**：
   - 在 `host_permissions` 中添加新网站域名
   - 在 `content_scripts` 中添加新的脚本配置

2. **创建内容脚本**：
   - 在 `content-scripts/` 目录下创建对应的 JS 文件
   - 实现具体的 DOM 操作逻辑

3. **更新弹出页面**：
   - 在 `popup/popup.js` 的 `SITES` 对象中添加新网站配置
   - 定义功能选项和默认值

## 🔧 技术栈

- **Manifest V3**：Chrome 扩展最新标准
- **Vanilla JavaScript**：原生 JS，无框架依赖
- **Chrome Storage API**：配置持久化存储
- **Content Scripts**：页面内容修改

## 📝 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🎯 支持 Bilibili 搜索框提示替换
- 🔧 完整的配置界面
- 💾 配置持久化存储

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License

## ⚠️ 注意事项

- 本插件仅供个人学习和使用
- 请遵守各网站的使用条款
- 如有问题，请及时反馈