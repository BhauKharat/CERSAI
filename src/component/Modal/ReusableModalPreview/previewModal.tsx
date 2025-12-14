import React, { useEffect, useRef } from 'react';

interface PreviewConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  altText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PreviewConfirmationModal: React.FC<PreviewConfirmationModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  altText,
  onConfirm,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the modal when it opens
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
        outline: 'none',
      }}
    >
      {/* Invisible click capture for closing modal on backdrop click */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'default',
        }}
        aria-hidden="true"
        tabIndex={-1}
      />
      <article
        className="modal-content"
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1002,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            lineHeight: 1,
            padding: '5px 10px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClose();
            }
          }}
        >
          ×
        </button>

        <h3
          id="modal-title"
          style={{
            marginBottom: '15px',
            color: '#333',
            fontSize: '18px',
            textAlign: 'center',
          }}
        >
          Confirm Document Upload
        </h3>

        <img
          src={imageUrl}
          alt={altText}
          style={{
            maxWidth: '100%',
            maxHeight: '60vh',
            objectFit: 'contain',
            marginBottom: '20px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />

        <p
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#666',
            fontSize: '14px',
          }}
        >
          Do you want to upload this document?
        </p>

        <div
          style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              border: '1px solid #ddd',
              fontWeight: '500',
              minWidth: '100px',
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              backgroundColor: 'white',
              color: '#002CBA',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              border: '1px solid #002CBA',
              fontWeight: '500',
              minWidth: '100px',
            }}
          >
            Confirm Upload
          </button>
        </div>
      </article>
    </div>
  );
};

export default PreviewConfirmationModal;
