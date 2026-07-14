# 个人介绍页面

游戏社交场景下的个人介绍静态网页，暗色赛博科技风格，纯前端实现，可直接部署至 GitHub Pages。

## 技术栈

- HTML5 + CSS3 + 原生 JavaScript
- 零外部依赖，无需构建工具
- 响应式设计，适配移动端

## 目录结构

```
├── index.html        # 主页面
├── css/
│   └── style.css     # 样式表（含动画和响应式）
├── js/
│   └── main.js       # 交互逻辑
├── images/           # 图片资源目录
└── README.md
```

## 快速开始

1. 用浏览器直接打开 `index.html` 即可预览
2. 按照下方指南替换占位内容

## 内容填充指南

### 替换文本内容

打开 `index.html`，搜索并替换以下占位文本：

| 占位标记               | 说明                    |
| ---------------------- | ----------------------- |
| `[你的游戏昵称]`       | 显示名称                |
| `[你的游戏ID]`         | 游戏ID/账号             |
| `[个人简介描述...]`    | 自我介绍，建议 2-3 句话 |
| `[FPS]` `[MOBA]` 等    | 游戏类型标签，可增删    |
| `[自定义签名或座右铭]` | 页脚个性签名            |

### 替换链接

在 `index.html` 中找到 `.social-btn` 链接，修改 `href` 属性：

```html
<!-- QQ：替换为你的QQ号链接 -->
<a href="tencent://message/?uin=你的QQ号" class="social-btn qq">...</a>

<!-- 邮箱：替换为你的邮箱地址 -->
<a href="mailto:你的邮箱@example.com" class="social-btn email">...</a>

<!-- Steam：替换为你的Steam个人资料链接 -->
<a href="https://steamcommunity.com/id/你的ID" class="social-btn steam">...</a>

<!-- Discord：替换为你的Discord用户名 -->
<a href="https://discord.com/users/你的ID" class="social-btn discord">...</a>
```

### 替换图片

详见 `images/README.md`。

## 自定义主题色

在 `css/style.css` 的 `:root` 中修改 CSS 变量：

```css
--accent: #00d4ff;           /* 主色调 */
--accent-secondary: #a855f7; /* 次要色调 */
--bg-primary: #0a0a1a;       /* 背景色 */
```

## 部署到 GitHub Pages

### 1. 初始化并提交代码

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "初始提交：个人介绍页面"

# 创建 main 分支
git branch -M main
```

### 2. 关联 GitHub 远程仓库

先在 GitHub 上创建一个新仓库（不要勾选添加 README），然后执行：

```bash
# 关联远程仓库（替换 用户名 和 仓库名）
git remote add origin https://github.com/用户名/仓库名.git

# 推送到 GitHub
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 打开 GitHub 仓库页面，进入 **Settings** → **Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选择 `main`，文件夹选 `/ (root)`
4. 点击 **Save**
5. 等待 1-2 分钟，页面顶部会显示访问地址：`https://用户名.github.io/仓库名/`

### 4. 后续更新

每次修改代码后，重新推送即可自动更新：

```bash
git add .
git commit -m "更新说明"
git push
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
