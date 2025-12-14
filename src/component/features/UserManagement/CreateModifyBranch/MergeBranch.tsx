/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../../../redux/store';
import { mergeBranch, clearMergeError } from './slice/mergeBranchSlice';
import { clearError } from './slice/approvedBranchSlice';
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
  SelectChangeEvent,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../ErrorModal/ErrorModal';
import {
  containerStyles,
  // backButtonStyles,
  paperStyles,
  titleStyles,
  sectionTitleStyles,
  formSectionStyles,
  formRowStyles,
  formFieldStyles,
  selectStyles,
  menuItemTextStyles,
  addButtonStyles,
  submitButtonContainerStyles,
  submitButtonStyles,
  errorTextStyles,
  sectionHeaderStyles,
  requiredIndicatorStyles,
  dividerStyles,
} from './MergeBranch.styles';
import NavigationBreadCrumb from '../NavigationBreadCrumb/NavigationBreadCrumb';
import AddressDetails from '../MergeRegion/AddressDetails';
import { fetchBranches } from './slice/branchSlice';
import { getBranch, resetGetBranchState } from './slice/getBranchSlice';
import RegionUtilityTable from '../MergeRegion/RegionUtilityTable';

// Type for navigation state
// interface LocationState {
//   branchData?: {
//     branchCode: string;
//     branchName: string;
//     regionCode: string;
//     regionName: string;
//   };
// }

const MergeBranch: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(resetGetBranchState());
  }, [dispatch]);
  const navigate = useNavigate();
  // const location = useLocation();

  // Get auth state for userId
  const authState = useSelector((state: RootState) => state.auth);
  const userId = authState?.userDetails?.userId || '';

  const {
    mergeLoading,
    mergeSuccess,
    mergeError,
    message: mergeMessage,
  } = useSelector((state: RootState) => state.mergeBranch);
  const {
    branches: approvedBranches,
    loading: branchesLoading,
    error: branchesError,
  } = useSelector((state: RootState) => state.approvedBranches);

  const { data: branchDetails } = useSelector(
    (state: RootState) => state.getBranch
  );

  const headers = useMemo(
    () => ['Sr.No.', 'Branch Name', 'Branch Code', 'Delete'],
    []
  );

  const [branchTableRow, setBranchTableRow] = useState<Record<string, any>[]>(
    []
  );

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const { branches } = useSelector((state: RootState) => state.branch);

  const statusFilter = 'ACTIVE';

  // Form state
  // const [retainedBranchCode, setRetainedBranchCode] = useState('');
  // const [retainedBranchName, setRetainedBranchName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regionsToMerge, setRegionsToMerge] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [branchName, setBranchName] = useState<string[]>([]);
  const [branchCodes, setBranchCodes] = useState<string[]>([]);
  const [originalBranches, setOriginalBranches] = useState<any[]>([]); // Store original branches for retained dropdown

  const [selectedBranchName, setSelectedBranchName] = useState<string>('');

  const [selectedBranchCode, setSelectedBranchCode] = useState<string>('');

  // Fetch branches when search term changes (without regionCode filter initially)
  useEffect(() => {
    // Only fetch without regionCode if no branch is selected
    if (!selectedBranchCode) {
      dispatch(
        fetchBranches({
          page: 0,
          size: 10,
          search: searchTerm,
          status: statusFilter,
        })
      );
    }
  }, [dispatch, searchTerm, selectedBranchCode]);

  // Store original branches for retained branch dropdown (only when not filtered by regionCode)
  useEffect(() => {
    // Only update original branches if we don't have a selected branch code
    // This ensures the retained dropdown doesn't change after selecting a branch
    if (!selectedBranchCode && branches.length > 0) {
      setOriginalBranches(branches);
      const branchNameList = branches.map((branch) => branch.branchName);
      setBranchName(branchNameList);
    }
  }, [branches, selectedBranchCode]);

  // Initialize branchName from originalBranches if available
  useEffect(() => {
    if (originalBranches.length > 0 && branchName.length === 0) {
      const branchNameList = originalBranches.map(
        (branch) => branch.branchName
      );
      setBranchName(branchNameList);
    }
  }, [originalBranches, branchName.length]);

  // Fetch branches filtered by regionCode when branchDetails is loaded
  useEffect(() => {
    if (branchDetails?.regionCode && selectedBranchCode) {
      console.log(
        'Fetching branches for regionCode:',
        branchDetails.regionCode
      );
      dispatch(
        fetchBranches({
          page: 0,
          size: 10,
          search: '',
          status: statusFilter,
          regionCode: branchDetails.regionCode,
        })
      );
    }
  }, [branchDetails?.regionCode, selectedBranchCode, dispatch, statusFilter]);

  // // Fetch approved branches on component mount
  // useEffect(() => {
  //   console.log('MergeBranch component mounted'); // Debug log

  //   // Reset merge state on component mount to prevent stale success state
  //   dispatch({ type: 'mergeBranch/resetMergeState' });

  //   const state = location.state as LocationState;
  //   console.log('Navigation state:', state); // Debug log

  //   if (state?.branchData) {
  //     console.log(
  //       'Setting branch data from navigation state:',
  //       state.branchData
  //     ); // Debug log
  //     setRetainedRegion(state.branchData.regionCode || '');

  //     setRetainedBranchCode(state.branchData.branchCode || '');
  //     setRetainedBranchName(state.branchData.branchName || '');
  //     // Try to get region name from regionCode or regionName
  //     const regionIdentifier = state.branchData.regionName;
  //     if (regionIdentifier) {
  //       console.log('Fetching approved branches for region:', regionIdentifier); // Debug log
  //       dispatch(fetchApprovedBranches(regionIdentifier));
  //     } else {
  //       console.log(
  //         'No region identifier found in branch data:',
  //         state.branchData
  //       );
  //       // Don't fetch branches if no region is available
  //       console.log('Skipping branch fetch - no region data available');
  //     }
  //   } else {
  //     // If no navigation state, don't fetch branches
  //     console.log('No navigation state found - skipping branch fetch');
  //   }

  //   // Cleanup function to reset state on unmount
  //   return () => {
  //     console.log('MergeBranch component unmounting - clearing state');
  //     dispatch({ type: 'mergeBranch/resetMergeState' });
  //     setShowSuccessModal(false);
  //   };
  // }, [location.state, dispatch]);

  // Monitor Redux state changes
  useEffect(() => {
    console.log('Approved branches state changed:', {
      branches: approvedBranches,
      loading: branchesLoading,
      error: branchesError,
    });
  }, [approvedBranches, branchesLoading, branchesError]);

  // Handle merge success
  useEffect(() => {
    if (mergeSuccess) {
      // Reset form and show success message
      setRegionsToMerge([]);
      setSelectedRegion('');
      setError('');
      setShowSuccessModal(true);
    }
  }, [mergeSuccess]);

  // Handle merge error
  useEffect(() => {
    if (mergeError) {
      setShowErrorModal(true);
    }
  }, [mergeError]);

  // Handle approved branches error
  useEffect(() => {
    if (branchesError) {
      setError(`Failed to load branches: ${branchesError}`);
    }
  }, [branchesError]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearMergeError());
      dispatch(clearError());
      dispatch(resetGetBranchState());
    };
  }, [dispatch]);

  // Clear selected region in merge dropdown if it matches the retained branch code
  // Also remove retained branch from merge list if it was already added
  useEffect(() => {
    if (selectedRegion === selectedBranchCode) {
      setSelectedRegion('');
    }

    // Remove retained branch from merge list if it exists
    if (selectedBranchCode && regionsToMerge.includes(selectedBranchCode)) {
      const updatedRegions = regionsToMerge.filter(
        (code) => code !== selectedBranchCode
      );
      setRegionsToMerge(updatedRegions);

      // Update table rows
      const branchDetails = branches.filter((item) =>
        updatedRegions.includes(item.branchCode)
      );
      const mappedDetails = branchDetails.map((item) => ({
        'Branch Name': item.branchName,
        'Branch Code': item.branchCode,
      }));
      setBranchTableRow(mappedDetails);
    }
  }, [selectedBranchCode, selectedRegion, regionsToMerge, branches]);

  // Handle retained region selection

  // Handle region to merge selection
  const handleRegionToMergeChange = (event: SelectChangeEvent) => {
    setSelectedRegion(event.target.value);
  };

  // Add region to merge list
  const handleAddRegion = () => {
    console.log('Adding region:', selectedRegion); // Debug log
    // console.log('Current retainedRegion:', retainedRegion); // Debug log
    console.log('Current regionsToMerge:', regionsToMerge); // Debug log

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

    const branchDetails = branches.filter(
      (item) => item.branchCode === selectedRegion
    );

    const mappedDetails = branchDetails.map((item) => {
      return {
        'Branch Name': item.branchName,
        'Branch Code': item.branchCode,
      };
    });

    setBranchTableRow([...branchTableRow, ...mappedDetails]);

    const newRegionsToMerge = [...regionsToMerge, selectedRegion];
    setRegionsToMerge(newRegionsToMerge);
    setSelectedRegion('');
    setError('');

    console.log('Updated regionsToMerge:', newRegionsToMerge); // Debug log
  };

  // Remove region from merge list

  const handleRemoveBrach = (branchToRemove: number) => {
    const removedBranches = regionsToMerge.filter(
      (_, index) => index !== branchToRemove
    );

    setRegionsToMerge([...removedBranches]);

    const branchDetails = branches.filter((item) =>
      removedBranches.includes(item.branchCode)
    );
    const mappedDetails = branchDetails.map((item) => {
      return {
        'Branch Name': item.branchName,
        'Branch Code': item.branchCode,
      };
    });

    setBranchTableRow([...mappedDetails]);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (regionsToMerge.length === 0) {
      setError('Please select at least one region to merge');
      return;
    }
    setError('');

    const mergeData = {
      targetBranchCode: selectedBranchCode,
      sourceBranchCodes: regionsToMerge,
      userId: userId,
    };

    try {
      await dispatch(mergeBranch(mergeData)).unwrap();
      // Success will be handled by useEffect
    } catch (error) {
      console.error('Error merging regions:', error);
      // Error will be handled by Redux state
    }
  };

  // Get branch name by code
  // const getBranchName = (code: string) => {
  //   const branch = approvedBranches.find((b) => b.branchCode === code);
  //   return branch ? branch.branchName : 'Unknown Branch';
  // };

  // Get available branches for dropdown (exclude already selected ones and retained branch)
  const availableBranches = useMemo(() => {
    return branches.filter(
      (branch) =>
        !regionsToMerge.includes(branch.branchCode) &&
        branch.branchCode !== selectedBranchCode
    );
  }, [branches, regionsToMerge, selectedBranchCode]);

  const crumbsData = [
    {
      label: 'User Management',
      path: '/re/dashboard',
    },
    {
      label: 'Branch',
      path: '/re/modify-branch',
    },
    {
      label: 'Merger',
    },
    {
      label: 'Branch Details',
    },
  ];

  const handleBranchNameSelect = (value: string) => {
    setSelectedBranchName(value);

    // Reset merging branch search and table when retained branch name changes
    setSearchTerm('');
    setSelectedRegion('');
    setRegionsToMerge([]);
    setBranchTableRow([]);
    setError('');

    // Use originalBranches for filtering to maintain dropdown values
    const branchesToSearch =
      originalBranches.length > 0 ? originalBranches : branches;
    const filteredBranchCodes = branchesToSearch
      .filter((branch) => branch.branchName === value)
      .map((branch) => branch.branchCode);

    setBranchCodes(filteredBranchCodes);

    // Auto-populate branch code if there's only one match
    if (filteredBranchCodes.length === 1) {
      const singleBranchCode = filteredBranchCodes[0];
      setSelectedBranchCode(singleBranchCode);

      // Fetch branch details - regionCode will be fetched via useEffect
      dispatch(getBranch(singleBranchCode));
    } else if (filteredBranchCodes.length > 1) {
      // If multiple branch codes exist, select the first one
      const firstBranchCode = filteredBranchCodes[0];
      setSelectedBranchCode(firstBranchCode);

      // Fetch branch details - regionCode will be fetched via useEffect
      dispatch(getBranch(firstBranchCode));
    } else {
      // Clear branch code if no matches
      setSelectedBranchCode('');
    }
  };

  const handleBranchCodeSelect = (value: string) => {
    setSelectedBranchCode(value);

    // Reset merging branch search and table when retained branch code changes
    setSearchTerm('');
    setSelectedRegion('');
    setRegionsToMerge([]);
    setBranchTableRow([]);
    setError('');

    // Fetch branch details - regionCode will be fetched via useEffect
    dispatch(getBranch(value));
  };

  return (
    <Container maxWidth={false} sx={containerStyles}>
      {/* <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={backButtonStyles}
      >
        Back
      </Button> */}

      <NavigationBreadCrumb crumbsData={crumbsData} />

      <Paper elevation={0} sx={paperStyles}>
        <Typography variant="h6" sx={titleStyles}>
          Branch Details
        </Typography>

        <Box>
          {/* Retained Region Section */}
          <Box sx={formSectionStyles}>
            {/* Labels row */}
            <Box sx={formRowStyles}>
              <Box sx={formFieldStyles}>
                <Typography variant="subtitle1" sx={sectionTitleStyles}>
                  Retained - Branch Name
                </Typography>
              </Box>
              <Box sx={formFieldStyles}>
                <Typography variant="subtitle1" sx={sectionTitleStyles}>
                  Retained - Branch Code
                </Typography>
              </Box>
            </Box>

            {/* Inputs row */}
            <Box sx={formRowStyles}>
              <FormControl fullWidth size="small" sx={formFieldStyles}>
                <Select
                  labelId="retained-branch-name-label"
                  id="retained-branch-name"
                  value={selectedBranchName}
                  displayEmpty
                  sx={selectStyles}
                  onChange={(e) => handleBranchNameSelect(e.target.value)}
                >
                  <MenuItem value="">
                    <Typography sx={menuItemTextStyles} color="text.secondary">
                      Select a branch
                    </Typography>
                  </MenuItem>
                  {branchName.map((branch, idx) => (
                    <MenuItem key={idx} value={branch}>
                      {branch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={formFieldStyles}>
                <Select
                  labelId="retained-branch-code-label"
                  id="retained-branch-code"
                  value={selectedBranchCode}
                  onChange={(e) => handleBranchCodeSelect(e.target.value)}
                  displayEmpty
                  sx={selectStyles}
                  renderValue={(selected) => {
                    if (!selected) {
                      return selectedBranchName
                        ? branchCodes.length === 1
                          ? 'Auto-populated from branch name'
                          : 'Select a branch code'
                        : 'Select a branch code';
                    }
                    return selected;
                  }}
                >
                  <MenuItem value="">
                    <Typography sx={menuItemTextStyles} color="text.secondary">
                      Select a branch code
                    </Typography>
                  </MenuItem>
                  {selectedBranchName && branchCodes.length > 0
                    ? branchCodes.map((branch, idx) => (
                        <MenuItem key={idx} value={branch}>
                          {branch}
                        </MenuItem>
                      ))
                    : branches.map((branch, idx) => (
                        <MenuItem key={idx} value={branch.branchCode}>
                          {branch.branchCode}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <AddressDetails
            line1={branchDetails?.address?.line1 || ''}
            line2={branchDetails?.address?.line2 || ''}
            line3={branchDetails?.address?.line3 || ''}
            countryCode={branchDetails?.address?.countryCode || ''}
            state={branchDetails?.address?.state || ''}
            district={branchDetails?.address?.district || ''}
            cityTown={
              branchDetails?.address?.city ||
              branchDetails?.address?.cityTown ||
              ''
            }
            pincode={branchDetails?.address?.pinCode || ''}
            alternatePinCode={branchDetails?.address?.alternatePinCode || ''}
            digiPin={branchDetails?.address?.digiPin || ''}
          />

          {/* Merge Region Section */}
          <Box sx={formSectionStyles}>
            <Box sx={sectionHeaderStyles}>
              <Typography variant="subtitle1" sx={sectionTitleStyles}>
                Merging Branch Name/Code{' '}
                <span style={requiredIndicatorStyles}>*</span>
              </Typography>
            </Box>

            <Box sx={formRowStyles}>
              <Box sx={{ ...formFieldStyles, position: 'relative' }}>
                <FormControl fullWidth size="small">
                  <Select
                    id="merge-region"
                    value={selectedRegion}
                    displayEmpty
                    disabled={!selectedBranchName}
                    open={dropdownOpen}
                    onOpen={() => setDropdownOpen(true)}
                    onClose={() => setDropdownOpen(false)}
                    onChange={handleRegionToMergeChange}
                    renderValue={
                      selectedRegion !== ''
                        ? () => {
                            const region = availableBranches.find(
                              (r) => r.branchCode === selectedRegion
                            );
                            return region
                              ? `${region.branchName} [${region.branchCode}]`
                              : selectedRegion;
                          }
                        : () => (
                            <Typography sx={menuItemTextStyles}>
                              Search by Branch Name/Code
                            </Typography>
                          )
                    }
                    sx={selectStyles}
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
                        placeholder="Search by Branch Name/Code"
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
                      <Typography sx={menuItemTextStyles}>
                        Select a branch to merge
                      </Typography>
                    </MenuItem>
                    {availableBranches
                      .filter(
                        (branch) =>
                          searchTerm === '' ||
                          branch.branchName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          branch.branchCode
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((branch) => (
                        <MenuItem
                          key={branch.branchCode}
                          value={branch.branchCode}
                        >
                          {branch.branchName} [{branch.branchCode}]
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddRegion}
                disabled={!selectedRegion}
                sx={addButtonStyles}
              >
                Add
              </Button>
            </Box>

            {error && (
              <Typography
                color="error"
                variant="caption"
                display="block"
                sx={errorTextStyles}
              >
                {error}
              </Typography>
            )}
          </Box>

          {/* Merged Region List */}
          {regionsToMerge.length > 0 && (
            // <Box sx={mergedRegionListContainerStyles}>
            //   <Box sx={regionListContainerStyles}>
            //     {regionsToMerge.map((branchCode) => (
            //       <Box key={branchCode} sx={regionItemStyles}>
            //         <Typography variant="body2">
            //           {branchCode} - {getBranchName(branchCode)}
            //         </Typography>
            //         <IconButton
            //           size="small"
            //           onClick={() => removeRegion(branchCode)}
            //           sx={removeIconButtonStyles}
            //         >
            //           <CloseIcon fontSize="small" />
            //         </IconButton>
            //       </Box>
            //     ))}
            //   </Box>

            //   {error && (
            //     <Typography
            //       color="error"
            //       variant="body2"
            //       sx={errorMessageStyles}
            //     >
            //       {error}
            //     </Typography>
            //   )}
            // </Box>

            <RegionUtilityTable
              headers={headers}
              rows={branchTableRow}
              removeRegion={handleRemoveBrach}
            />
          )}

          <Divider sx={dividerStyles} />

          {/* Submit Button */}
          <Box sx={submitButtonContainerStyles}>
            <Button
              type="submit"
              variant="contained"
              disabled={regionsToMerge.length === 0 || mergeLoading}
              onClick={handleSubmit}
              sx={submitButtonStyles}
            >
              {mergeLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Success Modal */}
      <ConfirmationModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          dispatch({ type: 'mergeBranch/resetMergeState' }); // Clear Redux success state
          navigate('/re/track-branch-status');
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          dispatch({ type: 'mergeBranch/resetMergeState' }); // Clear Redux success state
          navigate('/re/track-branch-status');
        }}
        message={mergeMessage || 'Submitted for approval'}
      />

      {/* Error Modal */}
      <ErrorModal
        open={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          dispatch(clearMergeError());
          setError('');
        }}
        primaryMessage={
          mergeError ||
          'An error occurred while merging regions. Please try again.'
        }
      />
    </Container>
  );
};

export default MergeBranch;
