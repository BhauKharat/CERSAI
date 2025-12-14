import { useState, useCallback } from 'react';

interface DocumentPreviewState {
  isOpen: boolean;
  documentUrl?: string;
  documentName?: string;
  id?: string;
}

interface UseDocumentPreviewReturn {
  previewState: DocumentPreviewState;
  openPreview: (url: string, name?: string) => void;
  closePreview: () => void;
  handleDelete: () => void;
  handleChange: () => void;
}

interface UseDocumentPreviewProps {
  onDelete?: () => void;
  onChange?: () => void;
}

export const useDocumentPreview = ({
  onDelete,
  onChange,
}: UseDocumentPreviewProps = {}): UseDocumentPreviewReturn => {
  const [previewState, setPreviewState] = useState<DocumentPreviewState>({
    isOpen: false,
    documentUrl: undefined,
    documentName: undefined,
  });

  const openPreview = useCallback((url: string, name?: string) => {
    setPreviewState({
      isOpen: true,
      documentUrl: url,
      documentName: name || 'Document Preview',
    });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewState({
      isOpen: false,
      documentUrl: undefined,
      documentName: undefined,
    });
  }, []);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
    }
    closePreview();
  }, [onDelete, closePreview]);

  const handleChange = useCallback(() => {
    if (onChange) {
      onChange();
    }
    closePreview();
  }, [onChange, closePreview]);

  return {
    previewState,
    openPreview,
    closePreview,
    handleDelete,
    handleChange,
  };
};

export default useDocumentPreview;
