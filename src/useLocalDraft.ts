import { useEffect, useRef } from 'react';

interface DraftData {
  title?: string;
  content: string;
}

/**
 * Auto-save editor content to localStorage every 2 seconds.
 * Restores on mount if draftKey matches saved data.
 */
export function useLocalDraft(
  draftKey: string | undefined,
  getContent: () => string,
  initialContent?: string
) {
  const restored = useRef(false);

  // Restore draft
  useEffect(() => {
    if (!draftKey || restored.current || initialContent) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft: DraftData = JSON.parse(saved);
        return draft.content;
      }
    } catch { /* ignore */ }
  }, [draftKey]);

  // Auto-save every 2s
  useEffect(() => {
    if (!draftKey) return;
    const timer = setInterval(() => {
      const content = getContent();
      if (!content) return;
      localStorage.setItem(draftKey, JSON.stringify({ content }));
    }, 2000);
    return () => clearInterval(timer);
  }, [draftKey]);

  /** Clear saved draft */
  const clearDraft = () => {
    if (draftKey) localStorage.removeItem(draftKey);
  };

  return { clearDraft };
}
