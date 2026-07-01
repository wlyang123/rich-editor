# Rich Editor

Reusable WYSIWYG rich text editor for React. Supports bold, underline, font colors, highlights, text alignment, image resize (proportional), and localStorage draft auto-save.

## Install

```bash
npm install github:wlyang123/rich-editor
```

Or copy `src/` into your project.

## Usage

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
        placeholder="Write something..."
        minHeight="200px"
        onChange={html => console.log('changed')}
        onCmdEnter={handleSave}
        onImageUpload={async (file) => {
          // Upload file to your server/storage
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const { url } = await res.json();
          return url;
        }}
        draftKey="my-blog-draft"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string` | `''` | Initial HTML content |
| `placeholder` | `string` | `'Write something...'` | Placeholder when empty |
| `minHeight` | `string` | `'120px'` | Min editor height |
| `onChange` | `(html: string) => void` | — | Called on every content change |
| `onCmdEnter` | `() => void` | — | Called on Cmd+Enter/Ctrl+Enter |
| `onImageUpload` | `(file: File) => Promise<string>` | — | Image upload handler. If not provided, image button hidden |
| `maxImageSize` | `number` | `4718592` | Max image size in bytes (default 4.5MB) |
| `showImage` | `boolean` | `true` | Show image upload button |
| `draftKey` | `string` | — | LocalStorage key for auto-save (empty = disabled) |

## Ref Methods

| Method | Description |
|--------|-------------|
| `getContent()` | Returns current HTML content |
| `clear()` | Clears all content |

## Features

- **Text formatting**: Bold (⌘B), Underline (⌘U)
- **Font colors**: 5 preset colors
- **Highlights**: 5 preset highlight colors + clear
- **Alignment**: Left / Center / Right
- **Images**: Upload → insert with resize wrapper (proportional CSS resize) + left/center/right alignment + click to select + Backspace to delete
- **Draft auto-save**: localStorage every 2 seconds, auto-restore on mount
- **Paste**: Strips formatting, pastes plain text. Pastes images as uploads
- **Drag & drop**: Drag images into editor
- **Theming**: All colors via CSS custom properties, dark mode support via `prefers-color-scheme`

## License

MIT
