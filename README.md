# Rich Editor

可复用的 WYSIWYG 富文本编辑器 React 组件。支持加粗、下划线、字体颜色、高亮、文字对齐、图片等比缩放、localStorage 实时暂存。

## 安装

```bash
npm install github:wlyang123/rich-editor
```

也可以直接复制 `src/` 目录到项目中使用。

## 快速上手

```tsx
import { RichEditor, RichEditorHandle } from 'rich-editor';
import 'rich-editor/styles.css';
import { useRef } from 'react';

function MyEditor() {
  const editorRef = useRef<RichEditorHandle>(null);

  const handleSave = () => {
    const html = editorRef.current?.getContent();
    console.log(html);
  };

  return (
    <div>
      <RichEditor
        ref={editorRef}
        placeholder="写点什么..."
        minHeight="200px"
        onChange={html => console.log('changed')}
        onCmdEnter={handleSave}
        onImageUpload={async (file) => {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: fd });
          const { url } = await res.json();
          return url;
        }}
        draftKey="my-blog-draft"
      />
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
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

| 方法 | 说明 |
|------|------|
| `getContent()` | 获取当前 HTML 内容 |
| `clear()` | 清空编辑器 |

## 功能列表

- **文字格式**：加粗（⌘B）、下划线（⌘U）
- **字体颜色**：5 种预设颜色
- **高亮**：5 种高亮色 + 清除按钮
- **文字对齐**：左对齐、居中、右对齐
- **图片**：上传 → 等比缩放手柄 + 左中右对齐 + 点击选中 + Backspace 删除
- **实时暂存**：每隔 2 秒存 localStorage，重新打开自动恢复
- **粘贴**：自动去格式、粘贴纯文本。图片粘贴自动上传
- **拖拽**：拖图片到编辑器自动上传
- **主题**：CSS 自定义属性控制，支持深色模式

## License

MIT
