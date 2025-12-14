/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionButtons } from '../../../../common/buttons/ActionButtons';
import { DecisionModal } from '../../../../common/modals/DecisionModal';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import { AppDispatch } from '../../../../../redux/store';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  containerStyles,
  paperStyles,
  titleStyles,
  labelStyles,
  inputStyles,
  sectionTitleStyles,
  requiredField,
  selectStyles,
  addressSectionContainer,
  addressSectionTitle,
  formActionsContainer,
} from './RegionCreationRequest.style';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubUserRegionByCode } from './slice/SubUserSingleRegionSlice';
import { StatusSubUserRegion } from './slice/SubUserStatusUpdateRegionSlice';
import { StatusSubUserRegionType } from './types/SubUserSingleRegion';
import { RootState } from '../../../../../redux/store';
import { fetchGeographyHierarchy } from '../../../../../redux/slices/registerSlice/masterSlice';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../../Constant';

const RegionCreationRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get the ID from the URL
  const dispatch = useDispatch<AppDispatch>();

  // Get userId from Redux store instead of localStorage
  const userId = useSelector(
    (state: RootState) => state.auth.userDetails?.userId || ''
  );

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'reject',
    title: '',
    message: '',
    listBefore: [] as string[],
    listAfter: [] as string[],
  });
  const [worFlowId, setWorkFlowId] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [previousVersionModalOpen, setPreviousVersionModalOpen] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [previousVersionLoading, setPreviousVersionLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [modifiedFields, setModifiedFields] = useState<string[]>([]);
  const [stateNameToConvert, setStateNameToConvert] = useState<string>('');
  const [districtNameToConvert, setDistrictNameToConvert] =
    useState<string>('');
  const [previousVersionData, setPreviousVersionData] = useState<any>(null);
  const [formData, setFormData] = useState({
    regionName: '',
    regionCode: '',
    status: 'Active',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    countryCode: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    otherPincode: '',
    digipin: '',
  });
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
      (s: State) => s.id.toString() === stateId
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
      dispatch(fetchSubUserRegionByCode(id))
        .then((action: any) => {
          console.log('Region Details by ID:---', action);
          // Check if action was rejected
          if (
            action.meta?.requestStatus === 'rejected' ||
            typeof action?.payload === 'string'
          ) {
            // Handle rejected action - display error message
            const errorMessage =
              typeof action?.payload === 'string'
                ? action?.payload
                : action?.payload?.message || 'Failed to fetch region details.';
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

          const responseData = action?.payload?.data;
          const entityDetails = responseData?.entityDetails;
          const workflowDetails = responseData?.workflowDetails;
          const regionData = workflowDetails?.region;

          // Extract modified fields from workflowDetails
          const modifiedFieldsList = workflowDetails?.modifiedFields || [];
          setModifiedFields(modifiedFieldsList);

          // Use workflowDetails.region for form data (current/modified values)
          const stateValue = regionData?.address?.state || '';
          const districtValue = regionData?.address?.district || '';

          // Store state and district names if they're not numeric (likely names)
          if (stateValue && isNaN(Number(stateValue))) {
            setStateNameToConvert(stateValue);
          }
          if (districtValue && isNaN(Number(districtValue))) {
            setDistrictNameToConvert(districtValue);
          }

          setFormData({
            regionName: regionData?.regionName || '',
            regionCode: regionData?.regionCode || '',
            status: 'Active',
            addressLine1: regionData?.address?.line1 || '',
            addressLine2: regionData?.address?.line2 || '',
            addressLine3: regionData?.address?.line3 || '',
            countryCode:
              regionData?.address?.countryCode ||
              regionData?.address?.country ||
              '',
            state: stateValue,
            district: districtValue || '',
            city: regionData?.address?.city || '',
            pincode: regionData?.address?.pinCode || '',
            otherPincode: regionData?.address?.alternatePinCode || '',
            digipin: regionData?.address?.digiPin || '',
          });

          // Store previous version data from entityDetails (original values)
          if (entityDetails) {
            setPreviousVersionData(entityDetails);
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
  }, [dispatch, id, setWorkFlowId]);

  // Convert state and district names to IDs when geography hierarchy is loaded for India
  useEffect(() => {
    if (
      formData.countryCode === 'IN' &&
      geographyHierarchy.length > 0 &&
      (stateNameToConvert || formData.state)
    ) {
      const country = geographyHierarchy.find(
        (c: Country) => c.code === formData.countryCode
      );

      if (country && country.states) {
        // Use stateNameToConvert if available, otherwise use formData.state
        const stateToFind = stateNameToConvert || formData.state;

        // Find state by name or ID
        const selectedState = country.states.find(
          (s: State) =>
            s.id.toString() === stateToFind ||
            s.name === stateToFind ||
            s.name.toLowerCase() === stateToFind.toLowerCase()
        );

        if (selectedState) {
          // Update state to ID
          const stateId = selectedState.id.toString();
          if (formData.state !== stateId) {
            setFormData((prev) => ({
              ...prev,
              state: stateId,
            }));
            setStateNameToConvert(''); // Clear after conversion
          }

          // If district exists, find and convert it
          if (districtNameToConvert || formData.district) {
            const districtToFind = districtNameToConvert || formData.district;

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
                  setDistrictNameToConvert(''); // Clear after conversion
                }
              }
            }
          }
        }
      }
    }
  }, [
    formData.countryCode,
    formData.state,
    formData.district,
    geographyHierarchy,
    stateNameToConvert,
    districtNameToConvert,
  ]);

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const { name, value } = e.target as { name: string; value: string };

    // Reset dependent fields when country changes
    if (name === 'countryCode') {
      setFormData((prev) => ({
        ...prev,
        countryCode: value,
        state: '',
        district: '',
        pincode: '',
      }));
    }
    // For India, handle cascading dropdowns
    else if (name === 'state' && formData.countryCode === 'IN') {
      setFormData((prev) => ({
        ...prev,
        state: value,
        district: '',
        pincode: '',
      }));
    } else if (name === 'district' && formData.countryCode === 'IN') {
      setFormData((prev) => ({
        ...prev,
        district: value,
        pincode: '',
      }));
    }
    // For non-India countries, directly update state and district as text
    else if (name === 'state' && formData.countryCode !== 'IN') {
      setFormData((prev) => ({
        ...prev,
        state: value,
      }));
    } else if (name === 'district' && formData.countryCode !== 'IN') {
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation can be done here
  };

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    console.log('handleApprove - userId from localStorage:', userId);

    try {
      // Create region request payload
      const regionRequest: StatusSubUserRegionType = {
        type: 'CREATE',
        reason: 'Approved after verification of all details',
      };

      console.log('Dispatching StatusSubUserRegion with:', {
        regionCode: worFlowId,
        statusType: 'approve',
        userId: userId,
      });

      // Dispatch the createRegion action
      dispatch(
        StatusSubUserRegion({
          regionCode: worFlowId,
          regionData: regionRequest,
          statusType: 'approve',
          userId: userId,
        })
      )
        .then((action: any) => {
          console.log('action:--', action);
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
            const regionDisplay = `${formData.regionName || 'Region Name'} - ${formData.regionCode || 'Region Code'}`;
            setModalState({
              isOpen: true,
              type: 'approve',
              title: '',
              message: window.location.pathname.includes('modification')
                ? `Region\n${regionDisplay}\nmodified successfully`
                : `Region\n${regionDisplay}\ncreated successfully`,
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
        })
        .catch((error) => {
          console.error('Failed to fetch regions:', error);
        });
    } catch (error) {
      console.error('Error approving form:', error);
      // Show error modal
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

  const handleRejectConfirm = async (remark: string) => {
    try {
      // Simulate API call for rejection
      // Create region request payload
      const regionRequest: StatusSubUserRegionType = {
        type: 'CREATE',
        reason: remark,
      };

      dispatch(
        StatusSubUserRegion({
          regionCode: worFlowId,
          regionData: regionRequest,
          statusType: 'reject',
          userId: userId,
        })
      )
        .then((action: any) => {
          console.log('action:----Reject', action);
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
            setModalState({
              isOpen: true,
              type: 'reject',
              title: '',
              message: window.location.pathname.includes('modification')
                ? 'Region Modification Request Rejected'
                : 'Region Creation Request Rejected',
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

          // navigate('/re/sub-user-management/region');
        })
        .catch((error) => {
          console.error('Failed to fetch regions:', error);
        });

      // Show success modal after rejection
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setRejectModalOpen(false);
    }
  };

  const handleModalClose = () => {
    const modalType = modalState.type;
    setModalState((prev) => ({ ...prev, isOpen: false }));
    // Redirect to region list page based on activity (create or modify)
    if (modalType === 'approve' || modalType === 'reject') {
      const isModification = window.location.pathname.includes('modification');
      const redirectPath = isModification
        ? '/re/sub-user-management/region/list/modify'
        : '/re/sub-user-management/region/list/create';
      navigate(redirectPath);
    }
  };

  const handleFetchPreviousVersion = async () => {
    if (!formData.regionCode) {
      console.error('Region code not available');
      return;
    }

    try {
      setPreviousVersionLoading(true);
      const response = await Secured.get(
        API_ENDPOINTS.get_region_by_code(formData.regionCode)
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
      'address.pinCode': 'pincode',
      'address.district': 'district',
      'address.state': 'state',
      'address.countryCode': 'countryCode',
      'address.alternatePinCode': 'otherPincode',
      'address.digiPin': 'digipin',
    };
    return fieldMap[apiField] || apiField;
  };

  // Check if a field is modified
  const isFieldModified = (fieldName: string): boolean => {
    return modifiedFields.some(
      (modifiedField) => mapApiFieldToFormField(modifiedField) === fieldName
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
  const isIndiaSelected = formData.countryCode === 'IN';

  const states = getStatesForCountry(formData.countryCode);
  const districts = getDistrictsForState(formData.countryCode, formData.state);

  // Get pincodes from selected district
  const selectedDistrict = districts.find(
    (d: District) => d.id.toString() === formData.district
  );
  const pincodes = selectedDistrict?.pincodes || [];

  // Breadcrumb data
  const isModification = window.location.pathname.includes('modification');
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Region', path: '/re/sub-user-management/region' },
    {
      label: isModification ? 'Modification' : 'Creation',
      path: isModification
        ? '/re/sub-user-management/region/list/modify'
        : '/re/sub-user-management/region/list/create',
    },
    { label: 'Approval' },
  ];

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={containerStyles}>
        {/* Back Button - Top Right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
            onClick={() => navigate('/re/sub-user-management/region')}
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

        <Paper elevation={0} sx={paperStyles}>
          <Typography variant="h6" className="medium-text" sx={titleStyles}>
            {window.location.pathname.includes('modification')
              ? 'Region Modification Request'
              : 'Region Creation Details'}
          </Typography>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box component="form" onSubmit={handleFormSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        ...labelStyles,
                        ...getLabelHighlightStyle('regionName'),
                      }}
                    >
                      Region Name <span style={requiredField}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="regionName"
                      value={formData.regionName || '-'}
                      onChange={handleChange}
                      placeholder="Enter region name here"
                      required
                      size="small"
                      sx={inputStyles}
                      disabled={isFormDisabled}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={labelStyles}>
                      Region Code <span style={requiredField}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="regionCode"
                      value={formData.regionCode || '-'}
                      onChange={handleChange}
                      placeholder="Enter region code here"
                      required
                      size="small"
                      sx={inputStyles}
                      disabled={isFormDisabled}
                    />
                  </Box>
                </Grid>
                <Box sx={addressSectionContainer}>
                  {/* Address Details Section */}
                  <Box sx={addressSectionTitle}>
                    <Typography
                      variant="h6"
                      className="medium-text"
                      sx={sectionTitleStyles}
                    >
                      Address Details
                    </Typography>

                    {/* Row 1: Address Lines */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              ...labelStyles,
                              ...getLabelHighlightStyle('addressLine1'),
                            }}
                          >
                            Address Line 1 <span style={requiredField}>*</span>
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            name="addressLine1"
                            value={formData.addressLine1 || '-'}
                            onChange={handleChange}
                            placeholder="Enter address line 1"
                            required
                            size="small"
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
                            variant="outlined"
                            name="addressLine2"
                            value={formData.addressLine2 || '-'}
                            onChange={handleChange}
                            placeholder="Enter address line 2"
                            size="small"
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
                            variant="outlined"
                            name="addressLine3"
                            value={formData.addressLine3 || '-'}
                            onChange={handleChange}
                            placeholder="Enter address line 3"
                            size="small"
                            sx={inputStyles}
                            disabled={isFormDisabled}
                          />
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Row 2: Country, State, District */}
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              ...labelStyles,
                              ...getLabelHighlightStyle('countryCode'),
                            }}
                          >
                            Country Code <span style={requiredField}>*</span>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Select
                              name="countryCode"
                              value={formData.countryCode || '-'}
                              onChange={handleChange}
                              required
                              sx={selectStyles}
                              disabled={isFormDisabled}
                            >
                              <MenuItem value="">Select Country</MenuItem>
                              {countries.map((country) => (
                                <MenuItem
                                  key={country.code}
                                  value={country.code}
                                >
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
                            {(!formData.countryCode || isIndiaSelected) && (
                              <span style={requiredField}>*</span>
                            )}
                          </Typography>
                          {!formData.countryCode || isIndiaSelected ? (
                            <FormControl fullWidth size="small">
                              <Select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                sx={selectStyles}
                                disabled={
                                  isFormDisabled ||
                                  !formData.countryCode ||
                                  states.length === 0
                                }
                              >
                                <MenuItem value="">Select State</MenuItem>
                                {states.map((state) => (
                                  <MenuItem
                                    key={state?.id}
                                    value={state?.id.toString() || '-'}
                                  >
                                    {state.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              variant="outlined"
                              name="state"
                              value={formData.state || '-'}
                              onChange={handleChange}
                              placeholder="Enter state/UT"
                              required
                              size="small"
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
                            {(!formData.countryCode || isIndiaSelected) && (
                              <span style={requiredField}>*</span>
                            )}
                          </Typography>
                          {!formData.countryCode || isIndiaSelected ? (
                            <FormControl fullWidth size="small">
                              <Select
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                required
                                sx={selectStyles}
                                disabled={
                                  isFormDisabled ||
                                  !formData.state ||
                                  districts.length === 0
                                }
                              >
                                <MenuItem value="">Select District</MenuItem>
                                {districts.map((district) => (
                                  <MenuItem
                                    key={district.name}
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
                              variant="outlined"
                              name="district"
                              value={formData.district || '-'}
                              onChange={handleChange}
                              placeholder="Enter district"
                              required
                              size="small"
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
                            City/Town{' '}
                            {(!formData.countryCode || isIndiaSelected) && (
                              <span style={requiredField}>*</span>
                            )}
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            name="city"
                            value={formData.city || '-'}
                            onChange={handleChange}
                            placeholder="Enter city/town"
                            required
                            size="small"
                            sx={inputStyles}
                            disabled={isFormDisabled}
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
                              ...getLabelHighlightStyle('pincode'),
                            }}
                          >
                            Pin Code{' '}
                            {(!formData.countryCode || isIndiaSelected) && (
                              <span style={{ color: 'red' }}>*</span>
                            )}
                          </Typography>
                          {!formData.countryCode || isIndiaSelected ? (
                            <FormControl fullWidth size="small">
                              <Select
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                                sx={selectStyles}
                                disabled={
                                  isFormDisabled ||
                                  (!formData.district &&
                                    formData.pincode !== '000000') ||
                                  (pincodes.length === 0 &&
                                    formData.pincode !== '000000')
                                }
                              >
                                <MenuItem value="">Select Pin Code</MenuItem>
                                {pincodes.map((pincode: Pincode) => (
                                  <MenuItem
                                    key={pincode.id}
                                    value={pincode.pincode || '-'}
                                  >
                                    {pincode.pincode || '-'}
                                  </MenuItem>
                                ))}
                                {(pincodes.length > 0 ||
                                  formData.pincode === '000000') && (
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
                              variant="outlined"
                              name="pincode"
                              value={formData.pincode || '-'}
                              onChange={handleChange}
                              placeholder="Enter pin code"
                              required
                              size="small"
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
                        {formData.pincode === '000000' ? (
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                ...labelStyles,
                                ...getLabelHighlightStyle('otherPincode'),
                              }}
                            >
                              Pin Code (in case of others){' '}
                              <span style={requiredField}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              variant="outlined"
                              name="otherPincode"
                              value={formData.otherPincode || '-'}
                              onChange={handleChange}
                              placeholder="Enter Pin Code"
                              required
                              size="small"
                              sx={inputStyles}
                              disabled={isFormDisabled}
                            />
                          </Box>
                        ) : (
                          <Box>
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
                              variant="outlined"
                              name="digipin"
                              value={formData.digipin || '-'}
                              onChange={handleChange}
                              placeholder="Enter Digipin"
                              size="small"
                              sx={inputStyles}
                              disabled={isFormDisabled}
                            />
                          </Box>
                        )}
                      </Grid>
                    </Grid>

                    {/* Row 4: Digipin (only shown when Other is selected) */}
                    {formData.pincode === '000000' && (
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                          <Box>
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
                              variant="outlined"
                              name="digipin"
                              value={formData.digipin || '-'}
                              onChange={handleChange}
                              placeholder="Enter Digipin"
                              size="small"
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
                  </Box>

                  <Box sx={formActionsContainer}>
                    <ActionButtons
                      onApprove={handleApprove}
                      onReject={handleRejectClick}
                    />
                  </Box>
                </Box>
              </Grid>
            </Box>
          )}
        </Paper>

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
            window.location.pathname.includes('modification')
              ? 'Are you sure you want to reject region modification request?'
              : 'Are you sure you want to reject new region creation request?'
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
              Previous Region Details
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
                  {/* Region Name */}
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={labelStyles}>
                        Region Name <span style={requiredField}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter Region Name"
                        value={previousVersionData?.regionName || '-'}
                        size="small"
                        sx={inputStyles}
                        disabled={true}
                      />
                    </Box>
                  </Grid>
                  {/* Region Code */}
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={labelStyles}>
                        Region Code <span style={requiredField}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter Region Code"
                        value={previousVersionData?.regionCode || '-'}
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
                          Address Line 1 <span style={requiredField}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Address Line 1"
                          value={
                            previousVersionData?.address?.line1 ||
                            formData.addressLine1 ||
                            '-'
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
                          Address Line 2
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Address Line 2"
                          value={
                            previousVersionData?.address?.line2 ||
                            formData.addressLine2 ||
                            '-'
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
                          Address Line 3
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Address Line 3"
                          value={
                            previousVersionData?.address?.line3 ||
                            formData.addressLine3 ||
                            '-'
                          }
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
                          Country <span style={requiredField}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Country"
                          value={
                            previousVersionData?.address?.countryCode
                              ? countries.find(
                                  (c: Country) =>
                                    c.code ===
                                    previousVersionData.address.countryCode
                                )?.name ||
                                previousVersionData.address.countryCode
                              : formData.countryCode
                                ? countries.find(
                                    (c: Country) =>
                                      c.code === formData.countryCode
                                  )?.name || formData.countryCode
                                : '-'
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
                          State / UT{' '}
                          {(!formData.countryCode || isIndiaSelected) && (
                            <span style={requiredField}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter State / UT"
                          value={
                            previousVersionData?.address?.state ||
                            formData.state ||
                            '-'
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
                          District{' '}
                          {(!formData.countryCode || isIndiaSelected) && (
                            <span style={requiredField}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter District"
                          value={
                            previousVersionData?.address?.district ||
                            formData.district ||
                            '-'
                          }
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
                          City/Town{' '}
                          {(!formData.countryCode || isIndiaSelected) && (
                            <span style={requiredField}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter City/Town"
                          value={
                            previousVersionData?.address?.city ||
                            formData.city ||
                            '-'
                          }
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={labelStyles}>
                          Pin Code{' '}
                          {(!formData.countryCode || isIndiaSelected) && (
                            <span style={requiredField}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Enter Pin Code"
                          value={
                            previousVersionData?.address?.pinCode ===
                              '000000' || formData.pincode === '000000'
                              ? 'Others'
                              : previousVersionData?.address?.pinCode ||
                                formData.pincode ||
                                '-'
                          }
                          size="small"
                          sx={inputStyles}
                          disabled={true}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                      {previousVersionData?.address?.pinCode === '000000' ||
                      formData.pincode === '000000' ? (
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
                              formData.otherPincode ||
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
                            value={
                              previousVersionData?.address?.digiPin !==
                              undefined
                                ? previousVersionData.address.digiPin || '-'
                                : '-'
                            }
                            size="small"
                            sx={inputStyles}
                            disabled={true}
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  {/* Row 4: Digipin (only shown when Other is selected) */}
                  {(previousVersionData?.address?.pinCode === '000000' ||
                    formData.pincode === '000000') && (
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
                            value={
                              previousVersionData?.address?.digiPin !==
                              undefined
                                ? previousVersionData.address.digiPin || '-'
                                : 'Not Available'
                            }
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

export default RegionCreationRequest;
