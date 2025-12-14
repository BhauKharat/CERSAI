/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ActionButtons from '../../../../common/buttons/ActionButtons';
import DecisionModal from '../../../../common/modals/DecisionModal';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import {
  pageHeaderStyles,
  labelStyles,
  inputStyles,
  sectionTitleStyles,
} from './BranchCreationRequest.style';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubUserBranchByID } from './slice/SubUserSingleBranchSlice';
import { StatusSubUserBranchType } from './types/SubUserSingleBranch';
import { StatusSubUserBranch } from './slice/SubUserStatusUpdateBranchSlice';
// import { fetchApprovedRegions } from '../../../UserManagement/CreateModifyRegion/slice/approvedRegionsSlice';
import { fetchGeographyHierarchy } from '../../../../../redux/slices/registerSlice/masterSlice';
import { containerStyles } from './BranchDeactivationRequest.style';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../../Constant';
// import { State, Country, District } from './types/SubUserCreateBranch';

// TypeScript interfaces for geography hierarchy (matching CreateNewRegion)
interface Pincode {
  id: number;
  pincode: string;
  city: string;
}

interface District {
  id: number;
  name: string;
  pincodes?: Pincode[];
}

interface State {
  id: number;
  name: string;
  districts?: District[];
}

interface Country {
  code: string;
  name: string;
  states?: State[];
}

const BranchCreationRequest: React.FC = () => {
  // Get approved regions from Redux store
  // const { data: approvedRegions } = useSelector(
  //   (state: RootState) => state.approvedRegions
  // );
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>(); // Get the ID from the URL

  const [isModification, setIsModification] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [workFlowId, setWorkFlowId] = useState('');
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  // Get userId from Redux auth state
  const userId = useSelector(
    (state: RootState) => state.auth.userDetails?.userId
  );

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'reject',
    title: '',
    message: '',
    listBefore: [] as string[],
    listAfter: [] as string[],
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [previousVersionModalOpen, setPreviousVersionModalOpen] =
    useState(false);
  const [previousVersionLoading, setPreviousVersionLoading] = useState(false);
  const [previousVersionData, setPreviousVersionData] = useState<any>(null);

  const [formData, setFormData] = useState({
    regionCode: '',
    regionName: '',
    branchName: '',
    branchCode: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    country: '',
    state: '',
    district: '',
    city: '',
    pinCode: '',
    digipin: '',
    alternatePinCode: '',
  });

  const [modifiedFields, setModifiedFields] = useState<string[]>([]);

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Branch', path: '/re/sub-user-management/branch' },
    {
      label: isModification ? 'Modification' : 'Creation',
      path: isModification
        ? '/re/sub-user-management/branch/list/modify'
        : '/re/sub-user-management/branch/list/create',
    },
    { label: 'Approval' },
  ];

  // Get geography hierarchy from Redux store
  const { geographyHierarchy } = useSelector(
    (state: RootState) => state.masters
  );

  // Get countries, states, and districts from geography hierarchy
  const countries: Country[] = geographyHierarchy || [];

  // Get states based on selected country
  const getStatesForCountry = (code: string): State[] => {
    const country = countries.find((c: Country) => c.code === code);
    return country?.states || [];
  };

  // Get districts based on selected state
  const getDistrictsForState = (
    countryCode: string,
    stateId: string
  ): District[] => {
    const country = countries.find((c: Country) => c.code === countryCode);
    if (!country || !stateId) return [];

    const state = country?.states?.find(
      (s: State) => s.id.toString() === stateId || s.name === stateId
    );
    return state?.districts || [];
  };

  // Fetch approved regions and geography hierarchy on component mount
  useEffect(() => {
    // dispatch(fetchApprovedRegions());
    dispatch(fetchGeographyHierarchy());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setWorkFlowId(id);
      dispatch(fetchSubUserBranchByID(id))
        .then((action: any) => {
          // Check if action was rejected
          if (
            action.meta?.requestStatus === 'rejected' ||
            typeof action?.payload === 'string'
          ) {
            // Handle rejected action - display error message
            const errorMessage =
              typeof action?.payload === 'string'
                ? action?.payload
                : action?.payload?.message || 'Failed to fetch branch details.';
            setModalState({
              isOpen: true,
              type: 'reject',
              title: 'Error',
              message: errorMessage,
              listBefore: [],
              listAfter: [],
            });
            setLoading(false);
            return;
          }

          // Access entityDetails and workflowDetails from the response structure
          const entityDetails = action?.payload?.data?.entityDetails;
          const workflowDetails = action?.payload?.data?.workflowDetails;

          console.log('Fetched workflow details:', workflowDetails);
          console.log('Entity details (previous version):', entityDetails);

          // Determine if it's modification mode
          const isModificationMode = location.pathname.includes(
            'branch-modification-request'
          );

          setIsModification(isModificationMode);

          // Extract modified fields from workflowDetails
          const modifiedFieldsList = workflowDetails?.modifiedFields || [];
          setModifiedFields(modifiedFieldsList);

          // For modify mode: use workflowDetails directly (fields are at root level, not nested in branch)
          let branchData, addressData;

          if (isModificationMode) {
            // Modification mode: use workflowDetails
            branchData = {
              regionCode: workflowDetails?.regionCode || '',
              branchName: workflowDetails?.branchName || '',
              branchCode: workflowDetails?.branchCode || '',
            };
            addressData = workflowDetails?.address || {};
          } else {
            // Creation mode: use workflowDetails.branch (not entityDetails)
            branchData = workflowDetails?.branch || {};
            addressData = branchData?.address || {};
          }

          const stateValue = addressData?.state || '';
          const districtValue = addressData?.district || '';

          setFormData({
            regionCode: branchData?.regionCode || '',
            regionName: '', // Will be fetched from API
            branchName: branchData?.branchName || '',
            branchCode: branchData?.branchCode || '',
            addressLine1: addressData?.line1 || '',
            addressLine2: addressData?.line2 || '',
            addressLine3: addressData?.line3 || '',
            country: addressData?.countryCode || addressData?.country || '',
            state: stateValue,
            district: districtValue,
            city: addressData?.city || '',
            pinCode: addressData?.pinCode || '',
            alternatePinCode: addressData?.alternatePinCode || '',
            digipin: addressData?.digiPin || '',
          });

          // Fetch region name from API
          const regionCodeToFetch = branchData?.regionCode;
          if (regionCodeToFetch) {
            Secured.get(API_ENDPOINTS.get_region_by_code(regionCodeToFetch))
              .then((regionResponse) => {
                if (regionResponse.data?.success && regionResponse.data?.data) {
                  const regionName = regionResponse.data.data.regionName || '';
                  setFormData((prev) => ({
                    ...prev,
                    regionName: regionName,
                  }));
                }
              })
              .catch((error) => {
                console.error('Failed to fetch region name:', error);
                // Fallback to entityDetails if available
                const fallbackRegionName = entityDetails?.regionName || '';
                setFormData((prev) => ({
                  ...prev,
                  regionName: fallbackRegionName,
                }));
              });
          } else {
            // Fallback to entityDetails if regionCode is not available
            const fallbackRegionName = entityDetails?.regionName || '';
            setFormData((prev) => ({
              ...prev,
              regionName: fallbackRegionName,
            }));
          }

          setIsFormDisabled(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch regions:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [dispatch, id, location.pathname, setWorkFlowId]);

  // Convert state and district names to IDs when geography hierarchy is loaded for India
  useEffect(() => {
    if (
      formData.country === 'IN' &&
      geographyHierarchy.length > 0 &&
      formData.state
    ) {
      const country = geographyHierarchy.find(
        (c: Country) => c.code === formData.country
      );

      if (country && country.states) {
        // Find state by name or ID
        const selectedState = country.states.find(
          (s: State) =>
            s.id.toString() === formData.state ||
            s.name === formData.state ||
            s.name.toLowerCase() === formData.state.toLowerCase()
        );

        if (selectedState) {
          // Update state to ID if it was a name
          if (
            selectedState.name === formData.state ||
            selectedState.name.toLowerCase() === formData.state.toLowerCase()
          ) {
            setFormData((prev) => ({
              ...prev,
              state: selectedState.id.toString(),
            }));

            // If district exists, find and convert it
            if (formData.district) {
              const districtToFind = formData.district.replace(' District', '');

              if (selectedState.districts) {
                const selectedDistrict = selectedState.districts.find(
                  (d: District) =>
                    d.id.toString() === districtToFind ||
                    d.name === districtToFind ||
                    d.name.toLowerCase() === districtToFind.toLowerCase()
                );

                if (selectedDistrict) {
                  const districtId = selectedDistrict.id.toString();
                  if (formData.district !== districtId) {
                    setFormData((prev) => ({
                      ...prev,
                      district: districtId,
                    }));
                  }
                }
              }
            }
          }
        }
      }
    }
  }, [formData.country, formData.state, formData.district, geographyHierarchy]);

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const { name, value } = e.target as { name: string; value: string };

    // Reset dependent fields when country changes
    if (name === 'country') {
      setFormData((prev) => ({
        ...prev,
        country: value,
        state: '',
        district: '',
        pinCode: '',
      }));
    }
    // For India, handle cascading dropdowns
    else if (name === 'state' && formData.country === 'IN') {
      setFormData((prev) => ({
        ...prev,
        state: value,
        district: '',
        pinCode: '',
      }));
    } else if (name === 'district' && formData.country === 'IN') {
      setFormData((prev) => ({
        ...prev,
        district: value,
        pinCode: '',
      }));
    }
    // For non-India countries, directly update state and district as text
    else if (name === 'state' && formData.country !== 'IN') {
      setFormData((prev) => ({
        ...prev,
        state: value,
      }));
    } else if (name === 'district' && formData.country !== 'IN') {
      setFormData((prev) => ({
        ...prev,
        district: value,
      }));
    } else {
      // Handle digipin validation - allow alphanumeric, max 10 characters
      let processedValue = value;
      if (name === 'digipin') {
        // Allow alphanumeric characters only
        processedValue = processedValue.replace(/[^A-Za-z0-9]/g, '');
        // Limit to 10 characters
        if (processedValue.length > 10) {
          processedValue = processedValue.substring(0, 10);
        }
      }
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      // Create region request payload (empty object for approve)
      const regionRequest: StatusSubUserBranchType = {};

      // Dispatch the createRegion action
      dispatch(
        StatusSubUserBranch({
          regionCode: workFlowId,
          regionData: regionRequest,
          statusType: 'approve',
          userId: userId || undefined,
        })
      ).then((action: any) => {
        // Check if action was rejected
        if (
          action.meta?.requestStatus === 'rejected' ||
          typeof action?.payload === 'string'
        ) {
          // Handle rejected action - display error message
          const errorMessage =
            typeof action?.payload === 'string'
              ? action?.payload
              : action?.payload?.message ||
                'An error occurred while processing your request.';
          setModalState({
            isOpen: true,
            type: 'reject',
            title: 'Error',
            message: errorMessage,
            listBefore: [],
            listAfter: [],
          });
        } else if (action?.payload?.success === true) {
          const branchName = formData.branchName || 'Branch Name';
          const branchCode = formData.branchCode || 'Branch Code';
          const successMessage = isModification
            ? 'modified successfully'
            : 'created successfully';

          setModalState({
            isOpen: true,
            type: 'approve',
            title: '',
            message: `Branch\n\n${branchName} - ${branchCode}\n\n${successMessage}`,
            listBefore: [],
            listAfter: [],
          });
        } else {
          setModalState({
            isOpen: true,
            type: 'reject',
            title: 'Error',
            message:
              typeof action?.payload === 'string'
                ? action?.payload
                : action?.payload?.message ||
                  JSON.stringify(action?.payload) ||
                  'Unknown error',
            listBefore: [],
            listAfter: [],
          });
        }
      });
    } catch (error) {
      console.error('Error approving form:', error);
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: 'An error occurred while processing your request.',
        listBefore: [],
        listAfter: [],
      });
    }
  };

  const handleRejectClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (remark: any) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // Create region request payload
      const regionRequest: StatusSubUserBranchType = {
        remark: remark,
      };

      // Dispatch the createRegion action
      dispatch(
        StatusSubUserBranch({
          regionCode: workFlowId,
          regionData: regionRequest,
          statusType: 'reject',
          userId: userId || undefined,
        })
      ).then((action: any) => {
        console.log('action===', action);
        // Check if action was rejected
        if (
          action.meta?.requestStatus === 'rejected' ||
          typeof action?.payload === 'string'
        ) {
          // Handle rejected action - display error message
          const errorMessage =
            typeof action?.payload === 'string'
              ? action?.payload
              : action?.payload?.message ||
                'An error occurred while processing your request.';
          setModalState({
            isOpen: true,
            type: 'reject',
            title: 'Error',
            message: errorMessage,
            listBefore: [],
            listAfter: [],
          });
        } else if (
          action?.payload?.success === true ||
          action?.payload?.message
        ) {
          const rejectionMessage = isModification
            ? 'Branch Modification Request Rejected'
            : 'Branch Creation Request Rejected';

          setModalState({
            isOpen: true,
            type: 'reject',
            title: '',
            message: rejectionMessage,
            listBefore: [],
            listAfter: [],
          });
        } else {
          setModalState({
            isOpen: true,
            type: 'reject',
            title: 'Error',
            message:
              typeof action?.payload === 'string'
                ? action?.payload
                : action?.payload?.message ||
                  JSON.stringify(action?.payload) ||
                  'Unknown error',
            listBefore: [],
            listAfter: [],
          });
        }
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setRejectModalOpen(false);
    }
  };

  const handleModalClose = () => {
    const modalType = modalState.type;
    setModalState((prev) => ({ ...prev, isOpen: false }));
    // Redirect to branch list page
    if (modalType === 'approve' || modalType === 'reject') {
      if (modalType === 'reject') {
        // Always redirect to create list page for rejections
        navigate('/re/sub-user-management/branch/list/create');
      } else {
        // For approvals, redirect based on activity (create or modify)
        const isModification =
          window.location.pathname.includes('modification');
        const redirectPath = isModification
          ? '/re/sub-user-management/branch/list/modify'
          : '/re/sub-user-management/branch/list/create';
        navigate(redirectPath);
      }
    }
  };

  const handleFetchPreviousVersion = async () => {
    if (!formData.branchCode) {
      console.error('Branch code not available');
      return;
    }

    try {
      setPreviousVersionLoading(true);
      const response = await Secured.get(
        `${API_ENDPOINTS.get_branch}/${formData.branchCode}`
      );

      if (response.data?.success && response.data?.data) {
        setPreviousVersionData(response.data.data);
      } else {
        console.error('Failed to fetch previous version:', response.data);
        setPreviousVersionData(null);
      }
    } catch (error) {
      console.error('Error fetching previous version:', error);
      setPreviousVersionData(null);
    } finally {
      setPreviousVersionLoading(false);
    }
  };

  // Helper function to map API field names to form field names
  const mapApiFieldToFormField = (apiField: string): string => {
    const fieldMap: Record<string, string> = {
      'address.line1': 'addressLine1',
      'address.line2': 'addressLine2',
      'address.line3': 'addressLine3',
      'address.city': 'city',
      'address.pinCode': 'pinCode',
      'address.district': 'district',
      'address.state': 'state',
      'address.countryCode': 'country',
      'address.alternatePinCode': 'alternatePinCode',
      'address.digiPin': 'digipin',
    };
    return fieldMap[apiField] || apiField;
  };

  // Check if a field is modified
  const isFieldModified = (fieldName: string): boolean => {
    return (
      modifiedFields.some(
        (modifiedField) => mapApiFieldToFormField(modifiedField) === fieldName
      ) || modifiedFields.includes(fieldName)
    );
  };

  // Get highlight style for label/title of modified fields
  const getLabelHighlightStyle = (fieldName: string) => {
    if (isFieldModified(fieldName)) {
      return {
        backgroundColor: '#FFD952', // Yellow background
        padding: '4px 8px',
        borderRadius: '4px',
        display: 'block',
        width: '100%',
        marginBottom: 0,
      };
    }
    return {};
  };

  // Check if selected country is India
  const isIndiaSelected = formData.country === 'IN';

  const states = getStatesForCountry(formData.country);
  const districts = getDistrictsForState(formData.country, formData.state);

  // Get pincodes from selected district
  const selectedDistrict = districts.find(
    (d: District) =>
      d.id.toString() === formData.district || d.name === formData.district
  );
  const pincodes = selectedDistrict?.pincodes || [];

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={containerStyles}>
        {/* Back Button - Top Right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
            onClick={() => navigate(-1)}
            sx={{
              color: '#1A1A1A',
              fontFamily: 'Gilroy, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Back
          </Button>
        </Box>
        {/* Breadcrumb */}
        <Box sx={{ mb: 2 }}>
          <NavigationBreadCrumb crumbsData={crumbsData} />
        </Box>
        <Typography sx={pageHeaderStyles}>
          {isModification
            ? 'Branch Modification Request'
            : 'New Branch Creation Request'}
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box component="form">
            <Grid container>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      ...labelStyles,
                      ...getLabelHighlightStyle('regionName'),
                    }}
                  >
                    Region *
                  </Typography>
                  <TextField
                    fullWidth
                    name="regionName"
                    placeholder="Enter Region"
                    value={formData.regionName || '-'}
                    sx={inputStyles}
                    disabled={isFormDisabled}
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      ...labelStyles,
                      ...getLabelHighlightStyle('branchName'),
                    }}
                  >
                    Branch Name *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.branchName || '-'}
                    placeholder="Enter Branch Name"
                    sx={inputStyles}
                    disabled={isFormDisabled}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      ...labelStyles,
                      ...getLabelHighlightStyle('branchCode'),
                    }}
                  >
                    Branch Code *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.branchCode || '-'}
                    placeholder="Enter Branch Code"
                    sx={inputStyles}
                    disabled={isFormDisabled}
                  />
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, mb: 5 }}>
              <Typography>Address Details</Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('addressLine1'),
                      }}
                    >
                      Address Line 1 <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.addressLine1 || '-'}
                      placeholder="Enter Address Line 1"
                      sx={inputStyles}
                      disabled={isFormDisabled}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('addressLine2'),
                      }}
                    >
                      Address Line 2
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Address Line 2"
                      value={formData.addressLine2 || '-'}
                      sx={inputStyles}
                      disabled={isFormDisabled}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('addressLine3'),
                      }}
                    >
                      Address Line 3
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.addressLine3 || '-'}
                      placeholder="Enter Address Line 3"
                      sx={inputStyles}
                      disabled={isFormDisabled}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('country'),
                      }}
                    >
                      Country <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        name="country"
                        value={formData.country || '-'}
                        onChange={handleChange}
                        sx={inputStyles}
                        disabled={isFormDisabled}
                      >
                        <MenuItem value="">Select Country</MenuItem>
                        {geographyHierarchy.map((country: Country) => (
                          <MenuItem key={country.code} value={country.code}>
                            {country.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('state'),
                      }}
                    >
                      State / UT{' '}
                      {(!formData.country || isIndiaSelected) && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    {!formData.country || isIndiaSelected ? (
                      <FormControl fullWidth>
                        <Select
                          name="state"
                          value={formData.state || '-'}
                          onChange={handleChange}
                          sx={inputStyles}
                          disabled={
                            isFormDisabled ||
                            !formData.country ||
                            states.length === 0
                          }
                        >
                          <MenuItem value="">Select State</MenuItem>
                          {states.map((state: State) => (
                            <MenuItem
                              key={state.id}
                              value={state.id.toString()}
                            >
                              {state.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        name="state"
                        value={formData.state || '-'}
                        onChange={handleChange}
                        placeholder="Enter state/UT"
                        sx={inputStyles}
                        disabled={isFormDisabled}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('district'),
                      }}
                    >
                      District{' '}
                      {(!formData.country || isIndiaSelected) && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    {!formData.country || isIndiaSelected ? (
                      <FormControl fullWidth>
                        <Select
                          name="district"
                          value={
                            formData.district.replace(' District', '') || '-'
                          }
                          onChange={handleChange}
                          sx={inputStyles}
                          disabled={
                            isFormDisabled ||
                            !formData.state ||
                            districts.length === 0
                          }
                        >
                          <MenuItem value="">Select District</MenuItem>
                          {districts.map((district: District) => (
                            <MenuItem
                              key={district.id}
                              value={district.id.toString()}
                            >
                              {district.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        name="district"
                        value={
                          formData.district.replace(' District', '') || '-'
                        }
                        onChange={handleChange}
                        placeholder="Enter district"
                        sx={inputStyles}
                        disabled={isFormDisabled}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Row 3: City, Pin Code, Digipin (default) or Pin Code (in case of others) when Other is selected */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid
                  size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}
                  sx={{ flex: '0 0 33.333333%', maxWidth: '33.333333%' }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('city'),
                      }}
                    >
                      City / Town{' '}
                      {(!formData.country || isIndiaSelected) && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.city || '-'}
                      sx={inputStyles}
                      disabled={isFormDisabled}
                      placeholder="Enter City / Town"
                    />
                  </Box>
                </Grid>
                <Grid
                  size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}
                  sx={{ flex: '0 0 33.333333%', maxWidth: '33.333333%' }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('pinCode'),
                      }}
                    >
                      Pin Code{' '}
                      {(!formData.country || isIndiaSelected) && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    {!formData.country || isIndiaSelected ? (
                      <FormControl fullWidth>
                        <Select
                          name="pinCode"
                          value={formData.pinCode}
                          onChange={handleChange}
                          sx={inputStyles}
                          disabled={
                            isFormDisabled ||
                            (!formData.district &&
                              formData.pinCode !== '000000') ||
                            (pincodes.length === 0 &&
                              formData.pinCode !== '000000')
                          }
                        >
                          <MenuItem value="">Select Pin Code</MenuItem>
                          {pincodes.map((pincode: Pincode) => (
                            <MenuItem key={pincode.id} value={pincode.pincode}>
                              {pincode.pincode}
                            </MenuItem>
                          ))}
                          {(pincodes.length > 0 ||
                            formData.pinCode === '000000') && (
                            <MenuItem value="000000">
                              <Typography
                                fontFamily="Gilroy, sans-serif"
                                fontSize="14px"
                                fontWeight={500}
                              >
                                Other
                              </Typography>
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        name="pinCode"
                        value={formData.pinCode || '-'}
                        onChange={handleChange}
                        placeholder="Enter pin code"
                        sx={inputStyles}
                        disabled={isFormDisabled}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid
                  size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}
                  sx={{ flex: '0 0 33.333333%', maxWidth: '33.333333%' }}
                >
                  {formData.pinCode === '000000' ? (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          ...labelStyles,
                          ...getLabelHighlightStyle('alternatePinCode'),
                        }}
                      >
                        Pin Code (in case of others){' '}
                        <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter Pin Code"
                        sx={inputStyles}
                        value={formData.alternatePinCode || '-'}
                        disabled={isFormDisabled}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ mb: '10px' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          ...labelStyles,
                          ...getLabelHighlightStyle('digipin'),
                        }}
                      >
                        Digipin
                      </Typography>
                      <TextField
                        fullWidth
                        value={formData.digipin || '-'}
                        placeholder="Enter Digipin"
                        sx={inputStyles}
                        disabled={isFormDisabled}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>

              {/* Row 4: Digipin (only shown when Other is selected) */}
              {formData.pinCode === '000000' && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    <Box sx={{ maxWidth: '350px', mb: '10px' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          ...labelStyles,
                          ...getLabelHighlightStyle('digipin'),
                        }}
                      >
                        Digipin
                      </Typography>
                      <TextField
                        fullWidth
                        value={formData.digipin || '-'}
                        placeholder="Enter Digipin"
                        sx={inputStyles}
                        disabled={isFormDisabled}
                      />
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* View Previous Version Link - Only in modification mode */}
              {isModification && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography
                    component="span"
                    onClick={async () => {
                      setPreviousVersionModalOpen(true);
                      await handleFetchPreviousVersion();
                    }}
                    sx={{
                      color: '#002CBA',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#1565c0',
                      },
                    }}
                  >
                    View Previous Version
                  </Typography>
                </Box>
              )}

              <Box>
                <ActionButtons
                  onReject={handleRejectClick}
                  onApprove={handleApprove}
                  rejectText="Reject"
                  approveText="Approve"
                />
              </Box>
            </Box>
          </Box>
        )}
        <DecisionModal
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          listBefore={modalState.listBefore}
          listAfter={modalState.listAfter}
          isOpen={modalState.isOpen}
          onClose={handleModalClose}
        />
        <RejectConfirmationModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onSubmit={handleRejectConfirm}
          title={
            isModification
              ? 'Are you sure you want to reject branch modification request?'
              : 'Are you sure you want to reject new branch creation request?'
          }
          remarkLabel="Remark"
          remarkPlaceholder="Type your Remark here"
          cancelLabel="Cancel"
          submitLabel="Submit"
        />

        {/* Previous Version Modal */}
        <Dialog
          open={previousVersionModalOpen}
          onClose={() => setPreviousVersionModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '8px',
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'Gilroy, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              pb: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                color: '#1A1A1A',
              }}
            >
              Previous Branch Details
            </Typography>
            <IconButton
              onClick={() => setPreviousVersionModalOpen(false)}
              sx={{
                padding: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <CloseIcon sx={{ color: '#1A1A1A' }} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {previousVersionLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                    color: '#1A1A1A',
                  }}
                >
                  Loading previous version data...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {/* Region */}
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={labelStyles}>
                        Region <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter Region"
                        value={previousVersionData?.regionName || '-'}
                        size="small"
                        sx={inputStyles}
                        disabled={true}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Branch Details */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={labelStyles}>
                        Branch Name <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter Branch Name"
                        value={previousVersionData?.branchName || '-'}
                        size="small"
                        sx={inputStyles}
                        disabled={true}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={labelStyles}>
                        Branch Code <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter Branch Code"
                        value={previousVersionData?.branchCode || '-'}
                        size="small"
                        sx={inputStyles}
                        disabled={true}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Address Details Section */}
                <Box sx={{ mt: 3, width: '100%' }}>
                  <Typography
                    variant="h6"
                    className="medium-text"
                    sx={sectionTitleStyles}
                  >
                    Address Details
                  </Typography>

                  {/* Address Lines */}
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          Address Line 1 <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Address Line 1"
                          value={previousVersionData?.address?.line1 || '-'}
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          Address Line 2
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Address Line 2"
                          value={previousVersionData?.address?.line2 || '-'}
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          Address Line 3
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Address Line 3"
                          value={previousVersionData?.address?.line3 || '-'}
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Country, State, District */}
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          Country <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.address?.countryCode
                              ? countries.find(
                                  (c: Country) =>
                                    c.code ===
                                    previousVersionData.address.countryCode
                                )?.name ||
                                previousVersionData.address.countryCode
                              : ''
                          }
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          State / UT
                          {(!previousVersionData?.address?.countryCode ||
                            previousVersionData?.address?.countryCode ===
                              'IN') && <span style={{ color: 'red' }}> *</span>}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter State / UT"
                          value={previousVersionData?.address?.state || '-'}
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          District
                          {(!previousVersionData?.address?.countryCode ||
                            previousVersionData?.address?.countryCode ===
                              'IN') && <span style={{ color: 'red' }}> *</span>}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter District"
                          value={previousVersionData?.address?.district || '-'}
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* City, Pin Code, Digipin */}
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          City/Town
                          {(!previousVersionData?.address?.countryCode ||
                            previousVersionData?.address?.countryCode ===
                              'IN') && <span style={{ color: 'red' }}> *</span>}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter City / Town"
                          value={previousVersionData?.address?.city || '-'}
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          Pin Code
                          {(!previousVersionData?.address?.countryCode ||
                            previousVersionData?.address?.countryCode ===
                              'IN') && <span style={{ color: 'red' }}> *</span>}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Pin Code"
                          value={
                            previousVersionData?.address?.pinCode === '000000'
                              ? 'Others'
                              : previousVersionData?.address?.pinCode || '-'
                          }
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                      {previousVersionData?.address?.pinCode === '000000' ? (
                        <Box>
                          <Typography variant="subtitle2" sx={labelStyles}>
                            Pin Code (in case of others)
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Enter Pin Code (in case of others)"
                            value={
                              previousVersionData?.address?.alternatePinCode ||
                              '-'
                            }
                            size="small"
                            sx={inputStyles}
                            disabled={true}
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="subtitle2" sx={labelStyles}>
                            Digipin
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Enter Digipin"
                            value={previousVersionData?.address?.digiPin || '-'}
                            size="small"
                            sx={inputStyles}
                            disabled={true}
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  {/* Row 4: Digipin (only shown when Other is selected) */}
                  {previousVersionData?.address?.pinCode === '000000' && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={labelStyles}>
                            Digipin
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Enter Digipin"
                            value={previousVersionData?.address?.digiPin || '-'}
                            size="small"
                            sx={inputStyles}
                            disabled={true}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'flex-end',
              px: 3,
              pb: 3,
            }}
          >
            <Button
              onClick={() => setPreviousVersionModalOpen(false)}
              sx={{
                backgroundColor: '#002CBA',
                color: 'white',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: 'Gilroy, sans-serif',
                minWidth: '100px',
                '&:hover': {
                  backgroundColor: '#0022A3',
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BranchCreationRequest;
