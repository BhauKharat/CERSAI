import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  fetchRegionByCode,
  resetSingleRegionState,
} from './slice/singleRegionSlice';
import {
  fetchTrackStatusDetails,
  resetTrackStatusDetailsState,
} from './slice/trackStatusDetailsSlice';
import CreateNewRegion from './CreateNewRegion';
import { Region as ApiRegion } from './types/region';
import { SingleRegionData } from './types/singleRegion';

interface LocationState {
  regionId?: number;
  regionData?: ApiRegion;
  track?: boolean;
  workflowId?: string;
  status?: string;
}

const CreateNewRegionWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Get regular region data from Redux
  const {
    loading,
    data: regionData,
    error,
  } = useSelector((state: RootState) => state.singleRegion);

  // Get track status data from Redux
  const {
    loading: trackStatusLoading,
    data: trackStatusData,
    error: trackStatusError,
  } = useSelector((state: RootState) => state.trackStatusDetails);

  // Get region data from location state (passed from table)
  const locationState = location.state as LocationState;
  const locationStateData = locationState?.regionData;
  const isTrackStatus = locationState?.track || false;
  const workflowId = locationState?.workflowId;

  // Determine if we're in modify mode based on the route
  const isModifyMode = location.pathname.includes('/modify-region/');

  useEffect(() => {
    if (isModifyMode && id) {
      if (isTrackStatus && workflowId) {
        // Fetch track status details by workflow ID
        console.log(
          'Fetching track status details for workflowId:',
          workflowId
        );
        dispatch(fetchTrackStatusDetails(workflowId));
      } else {
        // Fetch regular region data by region code from API
        console.log('Fetching region data for regionCode:', id);
        dispatch(fetchRegionByCode(id));
      }
    }

    return () => {
      // Cleanup on unmount
      if (isTrackStatus) {
        dispatch(resetTrackStatusDetailsState());
      } else {
        dispatch(resetSingleRegionState());
      }
    };
  }, [isModifyMode, id, isTrackStatus, workflowId, dispatch]);

  // Transform ApiRegion from table to SingleRegionData format for the form
  const transformedLocationData: SingleRegionData | null =
    locationStateData && locationStateData.address
      ? {
          regionCode: locationStateData.regionCode,
          regionName: locationStateData.regionName,
          address: {
            id: null,
            line1: locationStateData.address.line1 || '',
            line2: locationStateData.address.line2 || '',
            line3: locationStateData.address.line3 || null,
            countryCode: locationStateData.address.countryCode || '',
            state: locationStateData.address.state || '',
            district: '', // Not available in ApiRegion
            cityTown: locationStateData.address.city || '',
            pinCode: locationStateData.address.pinCode || '',
            alternatePinCode:
              locationStateData.address.alternatePinCode || null,
            digiPin: locationStateData.address.digiPin || null,
          },
        }
      : null;

  // Use entityDetails for the actual region data
  const transformedTrackStatusData: SingleRegionData | null =
    trackStatusData?.entityDetails
      ? {
          regionCode: trackStatusData.entityDetails.regionCode,
          regionName: trackStatusData.entityDetails.regionName,
          address: {
            id: null,
            line1: trackStatusData.entityDetails.address.line1,
            line2: trackStatusData.entityDetails.address.line2,
            line3: trackStatusData.entityDetails.address.line3 || null,
            countryCode: trackStatusData.entityDetails.address.countryCode,
            state: trackStatusData.entityDetails.address.state,
            district: trackStatusData.entityDetails.address.district || '',
            cityTown: trackStatusData.entityDetails.address.city,
            pinCode: trackStatusData.entityDetails.address.pinCode,
            alternatePinCode:
              trackStatusData.entityDetails.address.alternatePinCode || null,
            digiPin: trackStatusData.entityDetails.address.digiPin || null,
          },
        }
      : null;

  // Use appropriate data based on mode
  const dataToUse: SingleRegionData | null = isTrackStatus
    ? transformedTrackStatusData || transformedLocationData
    : regionData || transformedLocationData;

  // Determine loading and error states based on mode
  const isLoading = isTrackStatus ? trackStatusLoading : loading;
  const errorMessage = isTrackStatus ? trackStatusError : error;

  console.log('🚀 CreateNewRegionWrapper - Error state:', {
    isTrackStatus,
    trackStatusError,
    error,
    errorMessage,
    loading,
    isLoading,
  });

  // Log to help debug data source
  if (isTrackStatus && trackStatusError && transformedLocationData) {
    console.log(
      'Track status API failed, using transformed static data from table:',
      transformedLocationData
    );
  } else if (error && transformedLocationData) {
    console.log(
      'API failed, using transformed static data from table:',
      transformedLocationData
    );
  }

  return (
    <CreateNewRegion
      isModifyMode={isModifyMode}
      regionCode={id}
      regionData={dataToUse}
      loading={isLoading}
      error={errorMessage}
    />
  );
};

export default CreateNewRegionWrapper;
