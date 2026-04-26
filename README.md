# 语音拍照记录表 - 部署说明

## 文件清单
```
index.html     ← 主程序（唯一修改的文件）
manifest.json  ← PWA 应用清单
sw.js          ← Service Worker（离线缓存）
icon-192.png   ← PWA 图标 192px
icon-512.png   ← PWA 图标 512px
```

---

## 🐛 已修复：图片溢出到下一行

**原因**：使用 `editAs: 'oneCell'` 时，ExcelJS 只锁定图片左上角到单元格，
图片高度仍可能溢出到下一行。

**修复方案**：改用 `tl + br` 双坐标 + `editAs: 'absolute'` 模式，
精确计算 br 点位置（基于行高/列宽的像素换算），图片严格限定在单元格内。

核心代码：
```js
ws.addImage(id, {
  tl: { col: j + 1 + 0.05, row: ri - 1 + 0.05 },
  br: { col: j + 1 + 0.05 + finalW / COL_WIDTH_PX(colWidths[j+1]),
        row: ri - 1 + 0.05 + finalH / ROW_HEIGHT_PX(ROW_HEIGHT_PT) },
  editAs: 'absolute'  // 绝对定位，不随行高变化
});
```

---

## 📱 PWA 安装方式

### 方式一：部署到 GitHub Pages（推荐，继续用现有域名）
1. 将所有5个文件上传到你的 GitHub 仓库根目录
2. 替换原来的 `index.html`，并添加其他4个新文件
3. 用户访问时会看到顶部安装横幅，点击即可安装

### 方式二：使用任意静态托管（免域名限制）
- **Netlify**：拖拽文件夹到 https://app.netlify.com/drop → 自动获得 xxx.netlify.app 域名
- **Vercel**：`npx vercel` 部署，获得 xxx.vercel.app 域名
- **Cloudflare Pages**：连接 GitHub 仓库自动部署

### 方式三：本地/局域网使用
```bash
# 在文件夹中运行
python3 -m http.server 8080
# 访问 http://localhost:8080
# 局域网内手机访问 http://[电脑IP]:8080
```

---

## 📲 用户安装 PWA 步骤

### Android（Chrome）
1. 访问网页
2. 点击顶部黄色横幅"立即安装"，或
3. 点击浏览器菜单 → "添加到主屏幕"

### iPhone（Safari）
1. 访问网页（必须用 Safari）
2. 点击底部分享按钮 →"添加到主屏幕"
3. 注意：iOS 不支持 beforeinstallprompt，横幅不会显示，需手动操作

### 安装后效果
- 桌面出现蓝色麦克风图标
- 全屏打开，无浏览器地址栏
- 首次联网加载后，**离线也能使用**
- 数据保存在本地 IndexedDB，不丢失

---

## ⚠️ 注意事项
- Service Worker 需要 **HTTPS** 或 **localhost** 才能注册
- GitHub Pages / Netlify / Vercel 都默认启用 HTTPS ✅
- 讯飞语音识别仍需联网
