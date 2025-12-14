import React from 'react';
import './SuccessModal.css';
import successIcon from '../../../assets/right_tick.svg';

interface SuccessModal {
  isOpen: boolean;
  onClose: () => void;
  onOkay: () => void;
  title: () => void;
}

const SuccessModal: React.FC<SuccessModal> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOkay = () => {
    console.log('Okay button clicked');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <img src={successIcon} alt="Success" className="modal-icon" />
          <h2 className="modal-title">OTP Verified Successfully!</h2>
        </div>
        <p className="modal-message">
          Please check your email to get your password and a DSC setup link.
        </p>

        <hr className="modal-divider" />

        <div className="submit-button-container">
          <button className="submit-button" onClick={handleOkay}>
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
