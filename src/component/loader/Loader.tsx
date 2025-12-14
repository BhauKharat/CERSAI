// component/Loader.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import './Loader.css';
import { RootState } from '../../redux/store';

const Loader = () => {
  const { loading, message } = useSelector((state: RootState) => state.loader);

  if (!loading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-circle" />
      <p>{message}</p>
    </div>
  );
};

export default Loader;
