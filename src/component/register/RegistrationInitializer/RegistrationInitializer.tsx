import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reinitializeApplication } from '../../../redux/slices/registerSlice/authSlice';
// import { sectionToRoute } from '../../../utils/sectionNavigation';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@redux/store';

const RegistrationInitializer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { reinitializeData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(reinitializeApplication());
  }, [dispatch]);

  useEffect(() => {
    if (reinitializeData?.pendingSections?.length) {
      // const firstSection = reinitializeData.pendingSections[0];
      // const route = sectionToRoute[firstSection];
      // if (route) {
      //   navigate(route);
      // } else {
      //   console.warn('No route mapped for section:', firstSection);
      // }
    }
  }, [reinitializeData, navigate]);

  //   if (reinitializeLoading) return <div>Loading application...</div>;
  //   if (reinitializeError) return <div>Error: {reinitializeError}</div>;

  return null;
};

export default RegistrationInitializer;
