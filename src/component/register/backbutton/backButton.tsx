import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import '../backbutton/backButton.css';

interface BackButtonProps {
  label?: string;
  to?: string;
  style?: React.CSSProperties;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  to,
  style,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="back-button-container">
      <button
        onClick={handleBack}
        className={`back-button ${className || ''}`}
        style={style}
        aria-label={label}
      >
        <ArrowBackIcon className="back-icon" />
        <span className="back-label">{label}</span>
      </button>
    </div>
  );
};

export default BackButton;
