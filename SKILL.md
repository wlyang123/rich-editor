---
name: rich-editor
description: WYSIWYG rich text editor — bold, underline, highlight, colors, alignment, image resize, local draft
metadata:
  type: skill
---

# Rich Editor Skill

A reusable WYSIWYG rich text editor React component. Use this skill when the user needs a rich text input with formatting capabilities (bold, underline, highlight, colors, alignment, image support).

## Package

GitHub: https://github.com/wlyang123/rich-editor
Install: `npm install github:wlyang123/rich-editor`

## Quick Setup

```tsx
import { RichEditor, RichEditorHandle } from 'rich-editor';
import 'rich-editor/dist/styles.css';
import { useRef } from 'react';

const editorRef = useRef<RichEditorHandle>(null);

<RichEditor
  ref={editorRef}
  placeholder="Write something..."
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

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `initialContent` | `string` | `''` | HTML content to pre-fill |
| `placeholder` | `string` | `'Write something...'` | Empty-state placeholder |
| `minHeight` | `string` | `'120px'` | CSS height value |
| `onChange` | `(html: string) => void` | — | Fires on every edit |
| `onCmdEnter` | `() => void` | — | Cmd+Enter / Ctrl+Enter shortcut |
| `onImageUpload` | `(file: File) => Promise<string>` | — | Required for image support. Returns uploaded URL |
| `maxImageSize` | `number` | `4718592` | Max image bytes (4.5MB) |
| `showImage` | `boolean` | `true` | Show image upload button |
| `draftKey` | `string` | — | localStorage key for auto-save (omit to disable) |

## Ref API (RichEditorHandle)

```tsx
const editorRef = useRef<RichEditorHandle>(null);
editorRef.current?.getContent();  // => current HTML string
editorRef.current?.clear();       // => clears all content
```

## Key Features

1. **Text formatting**: Bold (⌘B), Underline (⌘U)
2. **Font colors**: 5 preset colors (black, red, blue, green, orange)
3. **Highlights**: 5 preset highlight colors (yellow, blue, red, purple, orange) + clear button
4. **Text alignment**: Left, Center, Right
5. **Images** (if onImageUpload provided):
   - Upload via toolbar button or paste/drag
   - Proportional resize via CSS `resize: horizontal` handle
   - Left/Center/Right alignment (select image, then click align button)
   - Click to select (amber outline), Backspace/Delete to remove
6. **Paste**: Auto-strips formatting, pastes plain text. Image pastes auto-upload
7. **Draft**: Auto-saves to localStorage every 2s. Restores on mount. Clears on manual save
8. **Theming**: All colors are CSS custom properties (`--re-bg`, `--re-text`, `--re-accent`, etc.). Dark mode via `prefers-color-scheme`

## Image Upload Integration

For Vercel Blob:

```typescript
onImageUpload={async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const { url } = await res.json();
  return url;
}}
```

For Supabase Storage:

```typescript
onImageUpload={async (file) => {
  const name = `${Date.now()}_${file.name}`;
  const { data } = await supabase.storage.from('images').upload(name, file);
  return supabase.storage.from('images').getPublicUrl(data.path).data.publicUrl;
}}
```

## Display Mode

When displaying saved content (not editing), use `.re-content` class for proper typography:

```tsx
<div className="re-content" dangerouslySetInnerHTML={{ __html: post.content }} />
```

## Notes

- No Tailwind dependency — pure CSS with custom properties
- No Next.js dependency — works with any React framework or vanilla React
- No database dependency — all state is local (editor) or callback-based
- The CSS file must be imported separately: `import 'rich-editor/dist/styles.css'`
