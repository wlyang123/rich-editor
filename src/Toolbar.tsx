import React from 'react';

const FONT_COLORS = ['#000000','#ef4444','#3b82f6','#22c55e','#f59e0b'];
const HIGHLIGHT_COLORS = ['#fef08a','#bfdbfe','#fecaca','#e9d5ff','#fed7aa'];

interface ToolbarProps {
  onExec: (cmd: string, val?: string) => void;
  onHighlight: (color: string) => void;
  onClearHighlight: () => void;
  onImageClick?: () => void;
  uploading?: boolean;
  showImage?: boolean;
}

export function Toolbar({ onExec, onHighlight, onClearHighlight, onImageClick, uploading, showImage }: ToolbarProps) {
  return (
    <div className="re-toolbar">
      <button type="button" onClick={() => onExec('bold')} title="Bold (⌘B)" className="re-btn re-btn-bold">B</button>
      <button type="button" onClick={() => onExec('underline')} title="Underline (⌘U)" className="re-btn re-btn-underline">U</button>

      <span className="re-sep" />

      {FONT_COLORS.map(c => (
        <button key={'f'+c} type="button" onClick={() => onExec('foreColor', c)} title="Font color"
          className="re-color-btn" style={{ backgroundColor: c }}>A</button>
      ))}

      <span className="re-sep" />

      {HIGHLIGHT_COLORS.map(c => (
        <button key={c} type="button" onClick={() => onHighlight(c)} title="Highlight"
          className="re-hl-btn" style={{ backgroundColor: c }} />
      ))}
      <button type="button" onClick={onClearHighlight} title="Clear highlight"
        className="re-hl-btn re-hl-clear">&#10005;</button>

      <span className="re-sep" />

      <button type="button" onClick={() => onExec('justifyLeft')} title="Align left" className="re-btn">&#8801;&#8592;</button>
      <button type="button" onClick={() => onExec('justifyCenter')} title="Align center" className="re-btn">&#8801;&#8801;</button>
      <button type="button" onClick={() => onExec('justifyRight')} title="Align right" className="re-btn">&#8594;&#8801;</button>

      {showImage && onImageClick && (
        <>
          <span className="re-sep" />
          <button type="button" onClick={onImageClick} disabled={uploading} className="re-btn">
            {uploading ? '⏳' : '📷 Image'}
          </button>
        </>
      )}
    </div>
  );
}
