import React from 'react';
import './OtpSentModal.css';
import successIcon from '../../../../assets/right_tick.svg';

interface OtpSentModal {
  isOpen: boolean;
  onClose: () => void;
  onOkay: () => void;
  title: () => void;
}

const OtpSentModal: React.FC<OtpSentModal> = ({ isOpen, onClose, onOkay }) => {
  if (!isOpen) return null;

  const handleOkay = () => {
    console.log('Okay button clicked');
    onOkay();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <img src={successIcon} alt="Success" className="modal-icon" />

        <h2 className="modal-title">OTP Sent Successfully</h2>

        <p className="modal-message">
          OTP has been sent to your registered email and mobile number to reset
          your password.
        </p>

        <div className="submit-button-container">
          <button className="submit-button" onClick={handleOkay}>
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpSentModal;
