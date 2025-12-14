/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// SuccessModal.tsx
import React from 'react';
import './successModal.css';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOkay?: () => void;
  message?: string;
  title?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onOkay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <div className="check-icon">
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 60 }} />
        </div>
        <h2>{title || 'Details Verified Successfully!'}</h2>
        <p>
          {message ||
            "The Head of Institution's details have been verified successfully"}
        </p>
        {/* <hr /> */}
        <button onClick={onOkay || onClose} className="okay-btn">
          Okay
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
