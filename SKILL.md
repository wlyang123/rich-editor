---
name: rich-editor
description: WYSIWYG rich text editor — bold, underline, highlight, colors, alignment, image resize, local draft
metadata:
  type: skill
---

# Rich Editor Skill

可复用的 WYSIWYG 富文本编辑器 React 组件。当用户需要带格式的文本输入（加粗、下划线、高亮、颜色、对齐、图片）时使用此 skill。

## 安装

```bash
npm install github:wlyang123/rich-editor
```

## 快速上手

```tsx
import { RichEditor, RichEditorHandle } from 'rich-editor';
import 'rich-editor/dist/styles.css';
import { useRef } from 'react';

const editorRef = useRef<RichEditorHandle>(null);

<RichEditor
  ref={editorRef}
  placeholder="写点什么..."
  minHeight="200px"
  onChange={(html) => console.log(html)}
  onCmdEnter={() => save()}
  onImageUpload={async (file) => {
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url } = await res.json();
    return url;
  }}
  draftKey="my-draft"
/>
```

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `initialContent` | `string` | `''` | 初始 HTML 内容 |
| `placeholder` | `string` | `'写点什么...'` | 空白时提示文字 |
| `minHeight` | `string` | `'120px'` | 编辑器最小高度 |
| `onChange` | `(html: string) => void` | — | 每次编辑时回调 |
| `onCmdEnter` | `() => void` | — | ⌘+Enter 快捷键回调 |
| `onImageUpload` | `(file: File) => Promise<string>` | — | 图片上传回调，返回图片 URL。不传则隐藏图片按钮 |
| `maxImageSize` | `number` | `4718592` | 图片最大字节数（默认 4.5MB） |
| `showImage` | `boolean` | `true` | 是否显示图片上传按钮 |
| `draftKey` | `string` | — | localStorage 暂存 key（不传则禁用） |

## Ref 方法

```tsx
const editorRef = useRef<RichEditorHandle>(null);
editorRef.current?.getContent();  // 获取当前 HTML 内容
editorRef.current?.clear();       // 清空编辑器
```

## 核心功能

1. **文字格式**：加粗（⌘B）、下划线（⌘U）
2. **字体颜色**：5 种预设颜色（黑、红、蓝、绿、橙）
3. **高亮**：5 种高亮色（黄、蓝、红、紫、橙）+ 清除按钮
4. **文字对齐**：左对齐、居中、右对齐
5. **图片**（需传 onImageUpload）：
   - 工具栏按钮上传 / 粘贴上传 / 拖拽上传
   - 等比缩放（CSS resize horizontal 手柄）
   - 左中右对齐（选中图片后点对齐按钮）
   - 点击选中（蓝色选中框），Backspace/Delete 删除
6. **粘贴**：自动去除格式，粘贴纯文本。图片粘贴自动上传
7. **暂存**：每隔 2 秒自动存到 localStorage，重新打开自动恢复。手动保存后清除
8. **主题**：所有颜色通过 CSS 自定义属性控制。支持深色模式（prefers-color-scheme）

## 图片上传对接

对接 Vercel Blob：

```typescript
onImageUpload={async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const { url } = await res.json();
  return url;
}}
```

对接 Supabase Storage：

```typescript
onImageUpload={async (file) => {
  const name = `${Date.now()}_${file.name}`;
  const { data } = await supabase.storage.from('images').upload(name, file);
  return supabase.storage.from('images').getPublicUrl(data.path).data.publicUrl;
}}
```

## 展示模式

保存后展示内容时用 `.re-content` 类名获得正确的排版：

```tsx
<div className="re-content" dangerouslySetInnerHTML={{ __html: post.content }} />
```

## 注意事项

- 不依赖 Tailwind，纯 CSS 自定义属性
- 不依赖 Next.js，任何 React 框架或原生 React 项目都能用
- 不依赖数据库，所有状态走回调或 localStorage
- CSS 文件需要单独引入：`import 'rich-editor/dist/styles.css'`
