// src/components/PasswordSavedModal.tsx

import React from 'react';
import './PasswordSavedModal.css';
import { ReactComponent as SuccessIcon } from '../../../../assets/right_tick.svg';
import { useNavigate } from 'react-router-dom'; // Using react-router for navigation

interface PasswordSavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectURL: string;
}

const PasswordSavedModal: React.FC<PasswordSavedModalProps> = ({
  isOpen,
  onClose,
  redirectURL,
}) => {
  const navigate = useNavigate(); // Initialize useNavigate

  if (!isOpen) return null;

  const handleBackToLogin = () => {
    onClose(); // Close the modal
    navigate(redirectURL); // Redirect to signup page with Registration tab active
  };

  return (
    <div className="password-saved-modal-overlay">
      <div className="password-saved-modal">
        <SuccessIcon className="success-icon" />
        {/* <h3>Password Updated Successfully!</h3> */}
        <p>
          Your password and DSC have been set up successfully. Please proceed to
          complete the registration.
        </p>

        {/* Divider */}
        <hr className="modal-divider" />

        <button className="modal-button" onClick={handleBackToLogin}>
          Back to login
        </button>
      </div>
    </div>
  );
};

export default PasswordSavedModal;
