/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  // IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
// import CloseIcon from '@mui/icons-material/Close';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../ErrorModal/ErrorModal';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  fetchRegions,
  clearFetchRegionsData,
} from '../CreateModifyUser/slice/fetchRegionsSlice';
import { mergeRegions, resetMergeState } from './slice/mergeRegionSlice';
import {
  containerStyles,
  backButtonStyles,
  paperStyles,
  titleStyles,
  formStyles,
  retainedSectionStyles,
  fieldLabelStyles,
  selectStyles,
  formControlStyles,
  regionSectionStyles,
  regionLabelStyles,
  addButtonStyles,
  // regionListStyles,
  // regionItemStyles,
  // regionItemTextStyles,
  // removeButtonStyles,
  dividerStyles,
  submitButtonContainerStyles,
  submitButtonStyles,
  errorTextStyles,
  menuItemStyles,
} from './MergeRegion.styles';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../NavigationBreadCrumb/NavigationBreadCrumb';
import { RegionData } from '../CreateModifyUser/types/fetchRegionsTypes';
import {
  fetchRegionByCode,
  resetSingleRegionState,
} from './slice/singleRegionSlice';
import AddressDetails from '../MergeRegion/AddressDetails';
import RegionUtilityTable from '../MergeRegion/RegionUtilityTable';

const MergeRegion: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Get auth state for userId
  const authState = useSelector((state: RootState) => state.auth);
  const userId = authState?.userDetails?.userId || '';

  // Get regions from fetchRegions slice
  const {
    loading,
    data: approvedRegions,
    error: apiError,
  } = useSelector((state: RootState) => state.fetchRegionsManagement);

  const {
    loading: mergeLoading,
    data: mergeData,
    message: mergeMessage,
    error: mergeError,
  } = useSelector((state: RootState) => state.mergeRegion);

  const { data: regionData } = useSelector(
    (state: RootState) => state.singleRegion
  );

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [regionName, setRegionName] = useState<string[]>([]);
  const [regionCode, setRegionCode] = useState<string[]>([]);

  const [selectedRegionName, setSelectedRegionName] = useState<string>('');
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initialNavigationItems = React.useMemo<ICrumbs[]>(
    () => [
      {
        label: 'User Management',
        path: '/re/dashboard',
      },
      {
        label: 'Region',
        path: '/re/modify-region',
      },
      {
        label: 'Merge',
      },
      {
        label: 'Region Details',
      },
    ],
    []
  );

  // Form state
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regionsToMerge, setRegionsToMerge] = useState<string[]>([]);

  const [regionsTableRow, setRegionTableRow] = useState<Record<string, any>[]>(
    []
  );
  const [error, setError] = useState('');

  // Available regions for merging (exclude retained region and already added regions)
  const [filteredRegions, setFilteredRegions] = useState<RegionData[]>([]);

  // Fetch regions on component mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchRegions({ userId }));
    }
    return () => {
      dispatch(clearFetchRegionsData());
      dispatch(resetMergeState());
    };
  }, [dispatch, userId]);

  // Handle API errors
  useEffect(() => {
    if (apiError || mergeError) {
      setShowErrorModal(true);
    }
  }, [apiError, mergeError]);

  // Handle merge success
  useEffect(() => {
    console.log(
      'useEffect triggered - mergeData:',
      mergeData,
      'mergeLoading:',
      mergeLoading
    );
    if (mergeData && !mergeLoading) {
      console.log('Merge success data:', mergeData);
      setShowSuccessModal(true);
    }
  }, [mergeData, mergeLoading]);

  // Update filtered regions when approved regions data changes (exclude selected retained region and already added regions)
  useEffect(() => {
    setFilteredRegions(
      (approvedRegions || []).filter(
        (region: RegionData) =>
          region.status === 'ACTIVE' &&
          region.regionCode !== selectedRegionCode &&
          !regionsToMerge.includes(region.regionCode)
      )
    );
  }, [approvedRegions, selectedRegionCode, regionsToMerge]);

  // Get all active region names for Retained Region Name dropdown (not filtered)
  useEffect(() => {
    if (approvedRegions && approvedRegions.length > 0) {
      const allActiveRegions = approvedRegions.filter(
        (region: RegionData) => region.status === 'ACTIVE'
      );
      const regionNames = allActiveRegions.map(
        (item: RegionData) => item.regionName
      );
      // Remove duplicates and filter out null/undefined
      const uniqueRegionNames = Array.from(
        new Set(regionNames.filter((name) => name))
      );
      setRegionName(uniqueRegionNames);
      console.log('Region names populated:', uniqueRegionNames);
    } else {
      setRegionName([]);
    }
  }, [approvedRegions]);

  const headers = useMemo(
    () => ['Sr.No.', 'Region Name', 'Region Code', 'Delete'],
    []
  );

  // Handle region selection from dropdown
  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode);
  };

  // Add region to merge list
  const handleAddRegion = () => {
    if (!selectedRegion) return;

    // Validate not adding duplicate
    if (regionsToMerge.includes(selectedRegion)) {
      setError('This region is already in the merge list');
      return;
    }

    // Validate not adding the retained region
    // if (selectedRegion === retainedRegion) {
    //   setError('Cannot merge a region with itself');
    //   return;
    // }

    setRegionsToMerge([...regionsToMerge, selectedRegion]);

    const regionDetails = (approvedRegions || []).filter(
      (item: RegionData) => item.regionCode === selectedRegion
    );

    const mappedData = regionDetails.map((item: RegionData) => {
      return {
        'Region Name': item.regionName,
        'Region Code': item.regionCode,
      };
    });

    setRegionTableRow([...regionsTableRow, ...mappedData]);

    setSelectedRegion('');
    setError('');
  };

  // Remove region from merge list
  const handleRemoveRegion = (regionToRemove: number) => {
    const removedRegion = regionsToMerge.filter(
      (_, index) => index !== regionToRemove
    );

    setRegionsToMerge([...removedRegion]);

    const regionDetails = (approvedRegions || []).filter((item: RegionData) =>
      removedRegion.includes(item.regionCode)
    );

    const mappedData = regionDetails.map((item: RegionData) => {
      return {
        'Region Name': item.regionName,
        'Region Code': item.regionCode,
      };
    });

    setRegionTableRow([...mappedData]);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!selectedRegionName) {
      setError('Please select a retained region');
      return;
    }

    if (regionsToMerge.length === 0) {
      setError('Please add at least one region to merge');
      return;
    }

    // Clear any previous errors
    setError('');

    // Dispatch merge regions action
    dispatch(
      mergeRegions({
        targetRegionCode: selectedRegionCode,
        sourceRegionCodes: regionsToMerge,
        userId: userId,
      })
    );
  };

  // Get region name by ID
  // const getRegionName = (regionCode: string) => {
  //   const region = approvedRegions.find((r) => r.regionCode === regionCode);
  //   return region ? region.regionName : 'Unknown Region';
  // };

  const handleRegionNameChange = (regionName: string) => {
    // Use approvedRegions (all active regions) to find region codes, not filteredRegions
    const filteredRegionCodes = (approvedRegions || []).filter(
      (item: RegionData) =>
        item.regionName === regionName && item.status === 'ACTIVE'
    );

    const regionCodes = filteredRegionCodes.map(
      (item: RegionData) => item.regionCode
    );

    setRegionCode(regionCodes);
    setSelectedRegionName(regionName);

    // Reset merging region selection and table when retained region name changes
    setSelectedRegion('');
    setRegionsToMerge([]);
    setRegionTableRow([]);
    setError('');
    setSearchTerm('');

    // Auto-populate region code if there's only one match
    if (regionCodes.length === 1) {
      const singleRegionCode = regionCodes[0];
      setSelectedRegionCode(singleRegionCode);
      dispatch(fetchRegionByCode(singleRegionCode));
    } else if (regionCodes.length > 1) {
      // If multiple region codes exist, select the first one
      const firstRegionCode = regionCodes[0];
      setSelectedRegionCode(firstRegionCode);
      dispatch(fetchRegionByCode(firstRegionCode));
    } else {
      // Clear region code if no matches
      setSelectedRegionCode('');
    }
  };

  useEffect(() => {
    return () => {
      dispatch(resetSingleRegionState());
    };
  }, [dispatch]);

  const handleRegionCodeChange = (regionCode: string) => {
    setSelectedRegionCode(regionCode);
    setSearchTerm('');
    setSelectedRegion('');
    setRegionsToMerge([]);
    setRegionTableRow([]);
    setError('');
    dispatch(fetchRegionByCode(regionCode));
  };

  return (
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
        <NavigationBreadCrumb crumbsData={initialNavigationItems} />
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
          Merge Region
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={formStyles}>
          {/* Retained Region Section */}
          <Box sx={retainedSectionStyles}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <FormControl size="small" sx={formControlStyles}>
                  <Typography sx={fieldLabelStyles}>
                    Retained - Region Name
                  </Typography>
                  <Select
                    value={selectedRegionName}
                    displayEmpty
                    disabled={loading}
                    sx={selectStyles}
                    onChange={(e) => handleRegionNameChange(e.target.value)}
                    renderValue={(selected) => {
                      if (!selected) {
                        return loading
                          ? 'Loading regions...'
                          : regionName.length === 0
                            ? 'No regions available'
                            : 'Select region name';
                      }
                      return selected;
                    }}
                  >
                    {loading ? (
                      <MenuItem disabled>
                        <Typography sx={menuItemStyles}>
                          Loading regions...
                        </Typography>
                      </MenuItem>
                    ) : regionName.length === 0 ? (
                      <MenuItem disabled>
                        <Typography sx={menuItemStyles}>
                          No regions available
                        </Typography>
                      </MenuItem>
                    ) : (
                      regionName.map((item, idx) => (
                        <MenuItem key={idx} value={item} sx={menuItemStyles}>
                          {item}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <FormControl size="small" sx={formControlStyles}>
                  <Typography sx={fieldLabelStyles}>
                    Retained - Region Code
                  </Typography>
                  <Select
                    value={selectedRegionCode}
                    displayEmpty
                    // disabled={
                    //   !selectedRegionName ||
                    //   regionCode.length === 0 ||
                    //   regionCode.length === 1
                    // }
                    sx={selectStyles}
                    onChange={(e) => handleRegionCodeChange(e.target.value)}
                    renderValue={(selected) => {
                      if (!selected) {
                        return selectedRegionName
                          ? regionCode.length === 1
                            ? 'Auto-populated from region name'
                            : 'Select a region code'
                          : 'Select region name first';
                      }
                      return selected;
                    }}
                  >
                    {regionCode.map((item, idx) => (
                      <MenuItem key={idx} value={item} sx={menuItemStyles}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {regionData?.address && (
            <AddressDetails
              line1={regionData?.address.line1}
              line2={regionData?.address.line2}
              line3={regionData?.address.line3}
              countryCode={regionData?.address.countryCode}
              state={regionData?.address.state}
              district={regionData?.address.district}
              cityTown={regionData?.address.cityTown}
              pincode={regionData?.address.pinCode}
              alternatePinCode={regionData?.address.alternatePinCode}
              digiPin={regionData?.address.digiPin}
            />
          )}

          {/* Merge Region Section */}
          <Box sx={regionSectionStyles}>
            <Typography variant="subtitle2" sx={regionLabelStyles}>
              Merging Region Name/Code
              <span style={{ color: '#FF0000' }}>*</span>
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <FormControl size="small" sx={formControlStyles} fullWidth>
                  <Select
                    value={selectedRegion}
                    displayEmpty
                    disabled={loading || !selectedRegionName}
                    open={dropdownOpen}
                    onOpen={() => setDropdownOpen(true)}
                    onClose={() => setDropdownOpen(false)}
                    sx={selectStyles}
                    onChange={(e) => handleRegionSelect(e.target.value)}
                    renderValue={(selected) => {
                      if (!selected) {
                        return 'Search by Region Name/Code';
                      }
                      const selectedRegionData = filteredRegions.find(
                        (r: RegionData) => r.regionCode === selected
                      );
                      return selectedRegionData
                        ? `${selectedRegionData.regionName} [${selectedRegionData.regionCode}]`
                        : selected;
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          '& .MuiMenuItem-root': {
                            fontSize: '14px',
                            fontFamily: 'Gilroy, sans-serif',
                          },
                        },
                      },
                    }}
                  >
                    <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
                      <TextField
                        size="small"
                        placeholder="Search by Region Name/Code"
                        value={searchTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSearchTerm(e.target.value);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon
                                sx={{ fontSize: 18, color: '#666' }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            fontSize: '14px',
                            fontFamily: 'Gilroy, sans-serif',
                          },
                        }}
                      />
                    </Box>
                    <MenuItem value="" sx={{ display: 'none' }}>
                      Select a region to merge
                    </MenuItem>
                    {filteredRegions
                      .filter(
                        (region: RegionData) =>
                          searchTerm === '' ||
                          region.regionName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          region.regionCode
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((region: RegionData) => (
                        <MenuItem
                          key={region.regionCode}
                          value={region.regionCode}
                          sx={menuItemStyles}
                        >
                          {region.regionName} [{region.regionCode}]
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size="auto">
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddRegion}
                  disabled={!selectedRegion || loading || !selectedRegionName}
                  sx={addButtonStyles}
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            {error && <Typography sx={errorTextStyles}>{error}</Typography>}
          </Box>

          {/* Merged Region List */}
          {regionsToMerge.length > 0 && (
            // <Box sx={regionListStyles}>
            //   {regionsToMerge.map((regionCode) => (
            //     <Box key={regionCode} sx={regionItemStyles}>
            //       <Typography sx={regionItemTextStyles}>
            //         {getRegionName(regionCode)} [{regionCode}]
            //       </Typography>
            //       <IconButton
            //         size="small"
            //         onClick={() => handleRemoveRegion(regionCode)}
            //         sx={removeButtonStyles}
            //       >
            //         <CloseIcon fontSize="small" />
            //       </IconButton>
            //     </Box>
            //   ))}
            // </Box>

            <RegionUtilityTable
              headers={headers}
              rows={regionsTableRow}
              removeRegion={handleRemoveRegion}
            />
          )}

          <Divider sx={dividerStyles} />

          {/* Submit Button */}
          <Box sx={submitButtonContainerStyles}>
            <Button
              type="submit"
              variant="contained"
              disabled={
                // !retainedRegion ||
                regionsToMerge.length === 0 || loading || mergeLoading
              }
              sx={submitButtonStyles}
            >
              {loading || mergeLoading ? 'Loading...' : 'Submit'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Success Modal */}
      <ConfirmationModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/re/track-region-status');
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          navigate('/re/track-region-status');
        }}
        message={mergeMessage || 'Submitted for approval'}
        confirmButtonText="Okay"
        showCloseButton={true}
      />

      {/* Error Modal */}
      <ErrorModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        primaryMessage={
          mergeError
            ? `Failed to merge regions: ${mergeError}`
            : apiError
              ? `API Error: ${apiError}`
              : 'An error occurred while merging regions. Please try again.'
        }
        buttonText="Okay"
      />
    </Container>
  );
};

export default MergeRegion;
