import React from 'react';

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | undefined;
  altText: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputId: string;
  inputName: string;
  disabled?: boolean;
}

const ReusableModal: React.FC<ReusableModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  altText,
  onFileChange,
  inputId,
  inputName,
  disabled = false,
}) => {
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e);
    onClose(); // Close modal after file selection
  };

  return (
    <div
      className="modal-overlay"
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
        zIndex: 1000,
      }}
    >
      <div
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
        }}
      >
        <button
          onClick={onClose}
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
        <h3 id="modal-title" style={{ display: 'none' }}>
          Document Preview
        </h3>{' '}
        {/* Hidden title for accessibility */}
        <img
          src={imageUrl}
          alt={altText}
          style={{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            marginBottom: '20px',
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="file"
            id={inputId}
            name={inputName}
            onChange={handleFileChange}
            disabled={disabled}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx"
          />
          <label
            htmlFor={inputId}
            style={{
              backgroundColor: '#002CBA',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              border: 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15.5L12 9.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 11.5L12 8.5L9 11.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Change Document
          </label>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              border: 'none',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableModal;
