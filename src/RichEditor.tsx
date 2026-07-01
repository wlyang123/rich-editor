import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { useLocalDraft } from './useLocalDraft';
import { RichEditorHandle, RichEditorProps } from './types';

export const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(function RichEditor(props, ref) {
  const {
    initialContent = '',
    placeholder = 'Write something...',
    minHeight = '120px',
    onChange,
    onCmdEnter,
    onImageUpload,
    maxImageSize = 4.5 * 1024 * 1024,
    showImage = true,
    draftKey,
  } = props;

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const [uploading, setUploading] = useState(false);

  // Use <p> for Enter key
  useEffect(() => { document.execCommand('defaultParagraphSeparator', false, 'p'); }, []);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !initialized.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
      initialized.current = true;
    }
  }, [initialContent]);

  const getContent = useCallback(() => editorRef.current?.innerHTML || '', []);

  // Local draft
  const { clearDraft } = useLocalDraft(draftKey, getContent, initialContent);

  useImperativeHandle(ref, () => ({ getContent, clear: () => { if (editorRef.current) editorRef.current.innerHTML = ''; } }), [getContent]);

  const execCmd = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const handleInput = () => {
    const html = getContent();
    onChange?.(html);
  };

  // Highlight
  const highlight = (color: string) => {
    const sel = window.getSelection();
    if (!sel?.isCollapsed) {
      const range = sel!.getRangeAt(0);
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      handleInput();
    }
  };

  const clearHighlight = () => {
    const sel = window.getSelection();
    if (!sel?.isCollapsed) {
      const range = sel!.getRangeAt(0);
      const fragment = range.extractContents();
      fragment.querySelectorAll('span').forEach(el => {
        const span = el as HTMLElement;
        if (span.style.backgroundColor) {
          span.style.backgroundColor = '';
          if (!(span.getAttribute('style') || '').trim()) span.replaceWith(...span.childNodes);
        }
      });
      range.insertNode(fragment);
      sel!.removeAllRanges();
      sel!.addRange(range);
      editorRef.current?.focus();
      handleInput();
    }
  };

  // Image upload
  const uploadImage = async (file: File) => {
    if (!onImageUpload) return;
    if (file.size > maxImageSize) { alert(`Image too large (max ${maxImageSize / 1024 / 1024}MB)`); return; }
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      insertImageWrapper(url);
    } catch { alert('Upload failed'); }
    setUploading(false);
  };

  // Insert image with resize wrapper (CSS resize: horizontal for proportional scaling)
  const insertImageWrapper = (url: string) => {
    editorRef.current?.focus();
    const wrap = document.createElement('span');
    wrap.setAttribute('contenteditable', 'false');
    wrap.className = 'img-resize-wrap';
    wrap.onclick = (e) => { e.stopPropagation(); selectImgWrap(wrap); };

    const img = document.createElement('img');
    img.src = url;
    img.setAttribute('draggable', 'false');
    img.onclick = (e) => { e.stopPropagation(); selectImgWrap(wrap); };
    wrap.appendChild(img);

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.insertNode(wrap);
      range.setStartAfter(wrap);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current?.appendChild(wrap);
    }
    selectImgWrap(wrap);
    handleInput();
  };

  const selectedImgWrap = useRef<HTMLElement | null>(null);
  const selectImgWrap = (wrap: HTMLElement) => {
    if (selectedImgWrap.current) selectedImgWrap.current.classList.remove('selected');
    selectedImgWrap.current = wrap;
    wrap.classList.add('selected');
  };

  const deselectImg = () => {
    if (selectedImgWrap.current) selectedImgWrap.current.classList.remove('selected');
    selectedImgWrap.current = null;
  };

  // Image alignment
  const alignImage = (align: 'left' | 'center' | 'right') => {
    const wrap = selectedImgWrap.current;
    if (!wrap || wrap.closest('.re-editor') !== editorRef.current) return;
    if (align === 'left') {
      wrap.style.display = 'inline-block';
      wrap.style.marginLeft = '0';
      wrap.style.marginRight = 'auto';
      wrap.style.width = 'auto';
    } else if (align === 'center') {
      wrap.style.display = 'block';
      wrap.style.marginLeft = 'auto';
      wrap.style.marginRight = 'auto';
      wrap.style.width = 'fit-content';
    } else if (align === 'right') {
      wrap.style.display = 'block';
      wrap.style.marginLeft = 'auto';
      wrap.style.marginRight = '0';
      wrap.style.width = 'fit-content';
    }
    handleInput();
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); execCmd('bold'); handleInput(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'u') { e.preventDefault(); execCmd('underline'); handleInput(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); onCmdEnter?.(); }
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectedImgWrap.current) {
      if (selectedImgWrap.current.closest('.re-editor') === editorRef.current) {
        e.preventDefault();
        selectedImgWrap.current.remove();
        selectedImgWrap.current = null;
        handleInput();
      }
    }
  };

  // Paste handler: strip formatting for text, handle images
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      // Check for images
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) uploadImage(file);
          return;
        }
      }
      // Paste as plain text
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
      handleInput();
    };
    editor.addEventListener('paste', onPaste);
    return () => editor.removeEventListener('paste', onPaste);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) uploadImage(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canShowImage = showImage && !!onImageUpload;

  return (
    <div className="re-container">
      <Toolbar
        onExec={execCmd}
        onHighlight={highlight}
        onClearHighlight={clearHighlight}
        onImageClick={() => fileInputRef.current?.click()}
        uploading={uploading}
        showImage={canShowImage}
      />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="re-editor"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('.img-resize-wrap')) deselectImg();
        }}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        data-placeholder={placeholder}
        style={{ minHeight }}
      />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
    </div>
  );
});
