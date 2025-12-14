/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import approveIcon from '../../../../../assets/approved_icon.svg';
import './SuccessModalUpdate.css';

interface SuccessModalUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  onOkay?: () => void;
  message?: string;
  title?: string;
}

const SuccessModalUpdate: React.FC<SuccessModalUpdateProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onOkay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-success">
      <div className="modal-content-success">
        <span className="close-success" onClick={onClose}>
          &times;
        </span>
        <div className="check-icon-success">
          <img
            src={approveIcon}
            alt="Success"
            style={{ width: '60px', height: '60px' }}
          />
        </div>
        {title && <h2>{title}</h2>}
        <h3>{message || 'Operation completed successfully'}</h3>
        <button onClick={onOkay || onClose} className="okay-btn-success">
          Okay
        </button>
      </div>
    </div>
  );
};

export default SuccessModalUpdate;
