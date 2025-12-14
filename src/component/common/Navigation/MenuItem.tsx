import React from 'react';

interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick }) => {
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
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        gap: 8,
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </div>
  );
};

export default MenuItem;
