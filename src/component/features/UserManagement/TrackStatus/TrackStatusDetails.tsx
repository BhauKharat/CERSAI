/* eslint-disable prettier/prettier */
import React from 'react';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../NavigationBreadCrumb/NavigationBreadCrumb';

const TrackStatusDetails = () => {
  const crumbsInitialData: ICrumbs[] = [
    {
      label: 'User Management',
    },
    {
      label: 'Region',
    },
    {
      label: 'Track Status',
    },
    {
      label: 'Region Details',
    },
  ];

  return (
    <React.Fragment>
      <NavigationBreadCrumb crumbsData={crumbsInitialData} />
    </React.Fragment>
  );
};

export default TrackStatusDetails;
