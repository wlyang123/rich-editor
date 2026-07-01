export interface RichEditorProps {
  /** Initial HTML content */
  initialContent?: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Minimum editor height (CSS value, e.g. "120px") */
  minHeight?: string;
  /** Called on every content change */
  onChange?: (html: string) => void;
  /** Called on Cmd+Enter / Ctrl+Enter */
  onCmdEnter?: () => void;
  /** Image upload handler: receives File, returns URL promise. If not provided, image buttons are hidden. */
  onImageUpload?: (file: File) => Promise<string>;
  /** Maximum image file size in bytes (default 4.5MB) */
  maxImageSize?: number;
  /** Show image button in toolbar? Default true (hidden if onImageUpload not provided) */
  showImage?: boolean;
  /** LocalStorage key for draft auto-save (empty = disabled) */
  draftKey?: string;
}

export interface RichEditorHandle {
  /** Get current HTML content */
  getContent: () => string;
  /** Clear all content */
  clear: () => void;
}

/** Strip HTML tags and count characters */
export function countChars(html: string): number {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length;
}

/** Format as "1,234 字" */
export function fmtCount(html: string): string {
  return `${countChars(html).toLocaleString()} 字`;
}
