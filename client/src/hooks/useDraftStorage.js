import { useEffect } from "react";

const DRAFT_KEY = "medilink_emergency_draft";

export function useDraftStorage(formData, setFormData) {
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [setFormData]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);
  return { clearDraft };
}