# 简易画板 (Simple Drawing Board)

一个基于 HTML5 Canvas 实现的轻量级在线画板应用，支持铅笔绘制、橡皮擦、颜色选择、撤销操作等功能。

## 🎨 功能特性

- **铅笔工具**：支持调整铅笔粗细（1-50px），可通过滑块或直接输入数值设置
- **橡皮擦工具**：支持调整橡皮擦粗细（1-50px）
- **颜色选择**：内置颜色选择器，支持前景色和背景色切换
- **画布操作**：支持清屏、撤销操作
- **图片下载**：可将绘制内容保存为图片
- **响应式设计**：适配不同屏幕尺寸
- **直观的用户界面**：简洁美观的工具栏和操作按钮

## 🔗 在线预览

[https://wallleap.github.io/draw/index.html](https://wallleap.github.io/draw/index.html)

## 🚀 快速开始

### 本地运行

1. **克隆项目**
   ```bash
   git clone https://github.com/walleap/draw.git
   cd draw
   ```

2. **启动本地服务器**
   - 使用 Python 3：
     ```bash
     python -m http.server 8000
     ```
   - 或使用 Node.js (需要安装 `http-server`)：
     ```bash
     npx http-server -p 8000
     ```

3. **访问应用**
   打开浏览器，访问 `http://localhost:8000`

## 🖱️ 使用说明

### 工具操作
- **铅笔**：点击铅笔图标后，在画布上绘制
- **橡皮擦**：点击橡皮擦图标后，在画布上擦除内容
- **清屏**：点击清屏按钮清空画布
- **撤销**：点击撤销按钮恢复上一步操作
- **下载**：点击下载按钮将画布内容保存为图片

### 颜色设置
- **前景色**：点击前景色预览框打开颜色选择器
- **背景色**：点击背景色预览框打开颜色选择器
- **切换颜色**：点击颜色切换按钮交换前景色和背景色

### 工具设置
- **铅笔粗细**：通过滑块调整或直接在输入框中输入数值（1-50）
- **橡皮擦粗细**：通过滑块调整（1-50）

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **核心技术**：HTML5 Canvas API
- **构建工具**：无（纯静态项目）
- **部署**：GitHub Pages

## 📁 项目结构

```
draw/
├── css/              # 样式文件
│   └── index.css     # 主样式文件
├── js/               # JavaScript 文件
│   └── draw.js       # 核心绘图逻辑
├── icons/            # 图标资源
│   ├── clear.svg     # 清屏图标
│   ├── download.svg  # 下载图标
│   ├── eraser.svg    # 橡皮擦图标
│   ├── menu.svg      # 菜单图标
│   ├── pencil.svg    # 铅笔图标
│   └── undo.svg      # 撤销图标
├── cur/              # 光标文件
│   ├── eraser.cur    # 橡皮擦光标
│   └── pencil.cur    # 铅笔光标
├── img/              # 图片资源
│   ├── eraser.png    # 橡皮擦图片
│   └── pencil.png    # 铅笔图片
├── index.html        # 主页面
├── test.html         # 测试页面
└── README.md         # 项目说明文件
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发步骤
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

- 项目地址：[https://github.com/walleap/draw](https://github.com/walleap/draw)
- 预览地址：[https://wallleap.github.io/draw/index.html](https://wallleap.github.io/draw/index.html)

---

**享受创作的乐趣！** ✨