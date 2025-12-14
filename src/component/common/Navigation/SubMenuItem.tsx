import React from 'react';

interface SubMenuItemProps {
  label: string;
  onClick?: () => void;
}

const SubMenuItem: React.FC<SubMenuItemProps> = ({ label, onClick }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{ paddingLeft: 24, cursor: 'pointer' }}
    >
      {label}
    </div>
  );
};

export default SubMenuItem;
