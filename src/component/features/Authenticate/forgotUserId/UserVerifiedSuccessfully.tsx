import React from 'react';
import '../../../authentication/SuccessModal/SuccessModal.css';
import successIcon from '../../../../assets/right_tick.svg';
import { useNavigate } from 'react-router-dom';

interface UserVerifiedSuccessfully {
  isOpen: boolean;
  onClose: () => void;
  onOkay: () => void;
  title: () => void;
}

const UserVerifiedSuccessfully: React.FC<UserVerifiedSuccessfully> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleOkay = () => {
    console.log('Okay button clicked');
    console.log('Okay button clicked');
    onClose();
    navigate('/login');
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <img src={successIcon} alt="Success" className="modal-icon" />
          <h2 className="modal-title">
            User ID has been forwarded to your registered Email
          </h2>
        </div>
        {/* <p className="modal-message">
          We have sent User ID to your registered email address and mobile
          number
        </p> */}
        {/* <hr className="modal-divider" /> */}
        <div className="submit-button-container">
          <button className="submit-button" onClick={handleOkay}>
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserVerifiedSuccessfully;
