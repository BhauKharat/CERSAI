import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../../../redux/store';
import {
  fetchRegions,
  clearFetchRegionsData,
} from '../CreateModifyUser/slice/fetchRegionsSlice';
import { RegionData } from '../CreateModifyUser/types/fetchRegionsTypes';
import { SelectChangeEvent } from '@mui/material';

// Types for location state
interface BranchData {
  branchCode?: string;
  regionCode: string;
  regionName: string;
}

interface LocationState {
  branchData?: BranchData;
}

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  containerStyles,
  backButtonStyles,
  paperStyles,
  titleStyles,
  formGridContainerStyles,
  formFieldLabelStyles,
  getExistingRegionCodeSelectStyles,
  getNewRegionCodeSelectStyles,
  newRegionNameTextFieldStyles,
  menuItemTypographyStyles,
  placeholderMenuItemStyles,
  newSubmitButtonContainerStyles,
  newSubmitButtonStyles,
  formFieldContainerStyles,
} from './TransferBranch.styles';
import {
  transferBranch,
  clearTransferError,
} from './slice/transferBranchSlice';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../ErrorModal/ErrorModal';
import { fetchRegionByCode } from '../CreateModifyRegion/slice/singleRegionSlice';
import NavigationBreadCrumb from '../NavigationBreadCrumb/NavigationBreadCrumb';
import AddressDetails from '../MergeRegion/AddressDetails';
// import AddressDetails from '../MergeRegion/AddressDetails';

const TransferBranch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const {
    transferLoading,
    transferSuccess,
    transferError,
    message: transferMessage,
  } = useSelector((state: RootState) => state.transferBranch);

  // Get auth state for userId
  const authState = useSelector((state: RootState) => state.auth);
  const userId = authState?.userDetails?.userId || '';

  // Get regions from fetchRegions slice (using userId)
  const { data: approvedRegions, loading: regionsLoading } = useSelector(
    (state: RootState) => state.fetchRegionsManagement
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Form state
  const [retainedRegion, setRetainedRegion] = useState<string>('');
  const [retainedRegionName, setRetainedRegionName] = useState<string>(''); // Changed from '' to 'Default Region Name'
  const [branchCode, setBranchCode] = useState<string>('');
  const [newRegionCode, setNewRegionCode] = useState<string>(''); // Changed from '' to 'Default Region Code'
  const [newRegionName, setNewRegionName] = useState<string>(''); // Changed from '' to 'Default Region Name'
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

  const { data: regionData } = useSelector(
    (state: RootState) => state.singleRegion
  );

  useEffect(() => {
    if (retainedRegion) {
      dispatch(fetchRegionByCode(retainedRegion));
    }
  }, [retainedRegion, dispatch]);

  // Fetch regions on component mount (using userId like CreateNewBranch)
  useEffect(() => {
    console.log('TransferBranch component mounted'); // Debug log

    // Reset transfer state on component mount to prevent stale success state
    dispatch({ type: 'transferBranch/resetTransferState' });

    // Fetch regions using userId (same as CreateNewBranch)
    if (userId) {
      dispatch(fetchRegions({ userId }));
    }

    const state = location.state as LocationState;
    console.log('Navigation state:', state); // Debug log

    if (state?.branchData) {
      console.log(
        'Setting branch data from navigation state:',
        state.branchData
      ); // Debug log
      setRetainedRegion(state.branchData.regionCode);
      setRetainedRegionName(state.branchData.regionName);
      if (state.branchData.branchCode) {
        setBranchCode(state.branchData.branchCode);
      }
    }

    // Cleanup function to reset state on unmount
    return () => {
      console.log('TransferBranch component unmounting - clearing state');
      dispatch({ type: 'transferBranch/resetTransferState' });
      dispatch(clearFetchRegionsData());
      setShowSuccessModal(false);
    };
  }, [location.state, dispatch, userId]);

  // Get active regions for dropdowns
  const activeRegions = useMemo(() => {
    return (approvedRegions || []).filter(
      (region: RegionData) => region.status === 'ACTIVE'
    );
  }, [approvedRegions]);

  // Get available regions for new region code dropdown (exclude existing region code)
  const availableNewRegions = useMemo(() => {
    return activeRegions.filter(
      (region: RegionData) => region.regionCode !== retainedRegion
    );
  }, [activeRegions, retainedRegion]);

  // Monitor approved regions state changes
  useEffect(() => {
    console.log('TransferBranch - Regions state changed:', {
      regions: approvedRegions,
      loading: regionsLoading,
      regionsCount: approvedRegions?.length || 0,
      firstRegion: approvedRegions?.[0],
    });

    // Force re-render check
    if (approvedRegions && approvedRegions.length > 0) {
      console.log(
        'We have regions but dropdown might not be updating. First region:',
        approvedRegions[0]
      );
    }
  }, [approvedRegions, regionsLoading]);

  // Auto-populate region code when region name is set (from navigation state or manual selection)
  useEffect(() => {
    if (retainedRegionName && !retainedRegion && activeRegions.length > 0) {
      const selectedRegion = activeRegions.find(
        (region: RegionData) => region.regionName === retainedRegionName
      );
      if (selectedRegion) {
        setRetainedRegion(selectedRegion.regionCode);
        console.log(
          'Auto-populated region code from region name:',
          selectedRegion.regionCode
        );
      }
    }
  }, [retainedRegionName, retainedRegion, activeRegions]);

  // Clear new region code if it matches the existing region code
  useEffect(() => {
    if (newRegionCode === retainedRegion) {
      setNewRegionCode('');
      setNewRegionName('');
    }
  }, [retainedRegion, newRegionCode]);

  // Handle existing region name selection
  const handleRetainedRegionNameChange = (event: SelectChangeEvent) => {
    const selectedName = event.target.value as string;
    setRetainedRegionName(selectedName);

    // Reset new region code and name when existing region name changes
    setNewRegionCode('');
    setNewRegionName('');

    // Auto-populate region code based on selected name
    const selectedRegion = activeRegions.find(
      (region: RegionData) => region.regionName === selectedName
    );
    if (selectedRegion) {
      setRetainedRegion(selectedRegion.regionCode);
      console.log(
        'Auto-populated existing region code:',
        selectedRegion.regionCode
      ); // Debug log
    } else {
      // If not found in active regions, try approved regions as fallback
      const fallbackRegion = (approvedRegions || []).find(
        (region: RegionData) => region.regionName === selectedName
      );
      if (fallbackRegion) {
        setRetainedRegion(fallbackRegion.regionCode);
        console.log(
          'Auto-populated existing region code (fallback):',
          fallbackRegion.regionCode
        );
      }
    }

    // Clear form errors
    setFormErrors((prev) => ({ ...prev, retainedRegion: false }));
  };

  // Handle existing region code selection (kept for backward compatibility if needed)
  const handleRetainedRegionCodeChange = (event: SelectChangeEvent) => {
    const selectedCode = event.target.value as string;
    setRetainedRegion(selectedCode);

    // Reset new region code and name when existing region code changes
    setNewRegionCode('');
    setNewRegionName('');

    // Auto-populate region name based on selected code
    const selectedRegion = (approvedRegions || []).find(
      (region: RegionData) => region.regionCode === selectedCode
    );
    if (selectedRegion) {
      setRetainedRegionName(selectedRegion.regionName);
      console.log(
        'Auto-populated existing region name:',
        selectedRegion.regionName
      ); // Debug log
    }

    // Clear form errors
    setFormErrors((prev) => ({ ...prev, retainedRegion: false }));
  };

  // Handle new region code selection
  const handleNewRegionCodeChange = (event: SelectChangeEvent) => {
    const selectedCode = event.target.value as string;
    setNewRegionCode(selectedCode);

    // Auto-populate region name based on selected code
    const selectedRegion = (approvedRegions || []).find(
      (region: RegionData) => region.regionCode === selectedCode
    );
    if (selectedRegion) {
      setNewRegionName(selectedRegion.regionName);
      console.log('Auto-populated region name:', selectedRegion.regionName); // Debug log
    }

    // Clear form errors
    setFormErrors((prev) => ({ ...prev, newRegionCode: false }));
  };

  // Handle transfer success
  useEffect(() => {
    console.log('Transfer success effect triggered:', transferSuccess);
    if (transferSuccess) {
      console.log('Setting success modal to true');
      setShowSuccessModal(true);
      // Reset form state
      setNewRegionCode('');
      setNewRegionName('');
      setBranchCode('');
      setFormErrors({});
    }
  }, [transferSuccess]);

  // Handle transfer error
  useEffect(() => {
    if (transferError) {
      setShowErrorModal(true);
    }
  }, [transferError]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearTransferError());
    };
  }, [dispatch]);

  // Validate form fields
  const validateForm = () => {
    const errors: { [key: string]: boolean } = {};
    let isValid = true;

    if (!branchCode) {
      errors.branchCode = true;
      isValid = false;
    }
    if (!newRegionCode) {
      errors.newRegionCode = true;
      isValid = false;
    }
    if (!newRegionName) {
      errors.newRegionName = true;
      isValid = false;
    }
    if (!retainedRegion) {
      errors.retainedRegion = true;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!validateForm()) {
      return;
    }

    const transferData = {
      branchCode: branchCode,
      newRegionCode: newRegionCode,
      userId: userId,
      reason: `Trasfered to ${newRegionCode}`,
    };

    try {
      await dispatch(transferBranch(transferData)).unwrap();
      // Success will be handled by useEffect
    } catch (error) {
      console.error('Error transferring branch:', error);
      // Error will be handled by Redux state
    }
  };

  const navigationList = useMemo(
    () => [
      {
        label: 'User Management',
        path: '/re/dashboard',
      },
      {
        label: 'Branch',
        path: '/re/modify-branch',
      },
      {
        label: 'Transfer',
        path: '/re/transfer-branch-list',
      },
      {
        label: 'Transfer Details',
      },
    ],
    []
  );

  // Render menu items for existing region code dropdown
  const renderExistingRegionCodeMenuItems = () => {
    if (regionsLoading) {
      return [
        <MenuItem key="loading" disabled>
          <Typography sx={placeholderMenuItemStyles}>
            Loading regions...
          </Typography>
        </MenuItem>,
      ];
    }
    if (activeRegions.length === 0) {
      return [
        <MenuItem key="no-regions" disabled>
          <Typography sx={placeholderMenuItemStyles}>
            No regions available
          </Typography>
        </MenuItem>,
      ];
    }
    return activeRegions.map((region) => (
      <MenuItem key={region.regionCode} value={region.regionCode}>
        <Typography sx={menuItemTypographyStyles}>
          {region.regionCode}
        </Typography>
      </MenuItem>
    ));
  };

  // Render menu items for existing region name dropdown
  const renderExistingRegionNameMenuItems = () => {
    if (regionsLoading) {
      return [
        <MenuItem key="loading" disabled>
          <Typography sx={placeholderMenuItemStyles}>
            Loading regions...
          </Typography>
        </MenuItem>,
      ];
    }
    if (activeRegions.length === 0) {
      return [
        <MenuItem key="no-regions" disabled>
          <Typography sx={placeholderMenuItemStyles}>
            No regions available
          </Typography>
        </MenuItem>,
      ];
    }
    return activeRegions.map((region) => (
      <MenuItem key={region.regionCode} value={region.regionName}>
        <Typography sx={menuItemTypographyStyles}>
          {region.regionName}
        </Typography>
      </MenuItem>
    ));
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={containerStyles}>
        {/* Header with Breadcrumb and Back Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <NavigationBreadCrumb crumbsData={navigationList} />
          <Button
            startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
            onClick={() => navigate(-1)}
            sx={{
              ...backButtonStyles,
              mb: 0,
              ml: 'auto',
            }}
          >
            Back
          </Button>
        </Box>

        <Paper elevation={0} sx={paperStyles}>
          <Typography variant="h6" sx={titleStyles}>
            Transfer Details
          </Typography>

          <Box>
            {/* Form Grid Layout */}
            <Box sx={formGridContainerStyles}>
              {/* Existing Region Code */}

              <Box sx={formFieldContainerStyles}>
                {/* Existing Region Name */}
                <Box sx={{ width: '100%', maxWidth: '350px' }}>
                  <Typography variant="body2" sx={formFieldLabelStyles}>
                    Existing Region Code{' '}
                    <span style={{ color: '#D32F2F' }}>*</span>
                  </Typography>
                  <FormControl fullWidth error={!!formErrors.retainedRegion}>
                    <Select
                      value={retainedRegion}
                      onChange={handleRetainedRegionCodeChange}
                      displayEmpty
                      disabled={true}
                      sx={getExistingRegionCodeSelectStyles(
                        !!formErrors.retainedRegion
                      )}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Typography sx={placeholderMenuItemStyles}>
                              {retainedRegionName
                                ? 'Auto-populated from region name'
                                : 'Select region name first'}
                            </Typography>
                          );
                        }
                        return selected;
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography sx={placeholderMenuItemStyles}>
                          Select a region code
                        </Typography>
                      </MenuItem>
                      {renderExistingRegionCodeMenuItems()}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: '100%', maxWidth: '350px' }}>
                  <Typography variant="body2" sx={formFieldLabelStyles}>
                    Existing Region Name{' '}
                    <span style={{ color: '#D32F2F' }}>*</span>
                  </Typography>
                  <FormControl fullWidth error={!!formErrors.retainedRegion}>
                    <Select
                      value={retainedRegionName}
                      onChange={handleRetainedRegionNameChange}
                      displayEmpty
                      disabled={true}
                      sx={getExistingRegionCodeSelectStyles(
                        !!formErrors.retainedRegion
                      )}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Typography sx={placeholderMenuItemStyles}>
                              Select region name
                            </Typography>
                          );
                        }
                        return selected;
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography sx={placeholderMenuItemStyles}>
                          Select region name
                        </Typography>
                      </MenuItem>
                      {renderExistingRegionNameMenuItems()}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {regionData && (
                <AddressDetails
                  line1={regionData?.address?.line1}
                  line2={regionData?.address?.line2}
                  line3={regionData?.address?.line3}
                  countryCode={regionData?.address?.countryCode}
                  state={regionData?.address?.state}
                  district={regionData?.address?.district}
                  cityTown={regionData?.address?.cityTown}
                  pincode={regionData?.address?.pinCode}
                  alternatePinCode={regionData?.address?.alternatePinCode}
                  digiPin={regionData?.address?.digiPin}
                />
              )}

              <Box sx={formFieldContainerStyles}>
                {/* New Region Code */}
                <Box sx={{ width: '100%', maxWidth: '350px' }}>
                  <Typography variant="body2" sx={formFieldLabelStyles}>
                    New Region Code <span style={{ color: '#D32F2F' }}>*</span>
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={newRegionCode}
                      onChange={handleNewRegionCodeChange}
                      displayEmpty
                      sx={getNewRegionCodeSelectStyles(
                        !!formErrors.newRegionCode
                      )}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Typography sx={placeholderMenuItemStyles}>
                              Select new region code
                            </Typography>
                          );
                        }
                        return selected;
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography sx={placeholderMenuItemStyles}>
                          Select new region code
                        </Typography>
                      </MenuItem>
                      {(() => {
                        console.log('Dropdown render check:', {
                          regionsLoading,
                          regionsLength: approvedRegions?.length || 0,
                          regions: approvedRegions,
                        });
                        return null;
                      })()}
                      {regionsLoading ? (
                        <MenuItem disabled>
                          <Typography sx={placeholderMenuItemStyles}>
                            Loading regions...
                          </Typography>
                        </MenuItem>
                      ) : !approvedRegions || approvedRegions.length === 0 ? (
                        <MenuItem disabled>
                          <Typography sx={placeholderMenuItemStyles}>
                            No regions available
                          </Typography>
                        </MenuItem>
                      ) : availableNewRegions.length === 0 ? (
                        <MenuItem disabled>
                          <Typography sx={placeholderMenuItemStyles}>
                            No other regions available
                          </Typography>
                        </MenuItem>
                      ) : (
                        availableNewRegions.map((region) => (
                          <MenuItem
                            key={region.regionCode}
                            value={region.regionCode}
                          >
                            <Typography sx={menuItemTypographyStyles}>
                              {region.regionCode}
                            </Typography>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>

                {/* New Region Name */}
                <Box sx={{ width: '100%', maxWidth: '350px' }}>
                  <Typography variant="body2" sx={formFieldLabelStyles}>
                    New Region Name <span style={{ color: '#D32F2F' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    value={newRegionName}
                    disabled
                    onChange={(e) => setNewRegionName(e.target.value)}
                    placeholder="Enter new region name"
                    error={!!formErrors.newRegionName}
                    sx={newRegionNameTextFieldStyles}
                  />
                </Box>
              </Box>
            </Box>

            {/* Submit Button */}
            <Box sx={newSubmitButtonContainerStyles}>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={
                  transferLoading ||
                  !branchCode ||
                  !retainedRegion ||
                  !newRegionCode ||
                  !newRegionName
                }
                sx={newSubmitButtonStyles}
                startIcon={
                  transferLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                {transferLoading ? 'Processing...' : 'Submit'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Success Modal */}
        <ConfirmationModal
          open={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            dispatch({ type: 'transferBranch/resetTransferState' }); // Clear Redux success state
            navigate('/re/track-branch-status');
          }}
          onConfirm={() => {
            setShowSuccessModal(false);
            dispatch({ type: 'transferBranch/resetTransferState' }); // Clear Redux success state
            navigate('/re/track-branch-status');
          }}
          message={transferMessage || 'Submitted for approval'}
        />

        {/* Error Modal */}
        <ErrorModal
          open={showErrorModal}
          onClose={() => {
            setShowErrorModal(false);
            dispatch(clearTransferError());
          }}
          primaryMessage={
            transferError ||
            'An error occurred while transferring branch. Please try again.'
          }
        />
      </Container>
    </Box>
  );
};

export default TransferBranch;
