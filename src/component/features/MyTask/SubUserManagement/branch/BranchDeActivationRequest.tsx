/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Grid,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ActionButtons from '../../../../common/buttons/ActionButtons';
import * as styles from './BranchDeactivationRequest.style';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import DecisionModal from '../../../../common/modals/DecisionModal';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubUserBranchByID } from './slice/SubUserSingleBranchSlice';
import { BranchDeactivationDetails } from './types/SubUserCreateBranch';
import { StatusSubUserBranchType } from './types/SubUserSingleBranch';
import { StatusSubUserBranch } from './slice/SubUserStatusUpdateBranchSlice';
import { fetchGeographyHierarchy } from '../../../../../redux/slices/registerSlice/masterSlice';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import {
  fetchCountryCodes,
  Country as CountryCode,
} from '../../../../../utils/countryUtils';

// Date formatting function (DD/MM/YYYY)
const formatDateOnly = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

// Geography hierarchy types
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

const BranchDeActivationRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<BranchDeactivationDetails | null>(
    null
  );
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);

  // Get geography hierarchy from Redux store
  const { geographyHierarchy } = useSelector(
    (state: RootState) => state.masters
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
  const [workFlowId, setWorkFlowId] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const [allCountries, setAllCountries] = useState<CountryCode[]>([]);

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchCountryCodes();
        setAllCountries(countries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Helper function to get country name from code
  const getCountryName = (countryCode: string | undefined): string => {
    if (!countryCode) return '-';
    const country = allCountries.find(
      (c) => c.code.toUpperCase() === countryCode.toUpperCase()
    );
    return country ? country.name : countryCode;
  };

  // Check if country is India
  const isIndiaSelected =
    details?.countryCode === 'IN' || !details?.countryCode;

  // useEffect(() => {
  //   setLoading(true);
  //   mockFetchDeactivationDetails().then((data) => {
  //     setDetails(data);
  //     setLoading(false);
  //   });
  // }, [id]);

  // Fetch geography hierarchy on component mount
  useEffect(() => {
    dispatch(fetchGeographyHierarchy());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setWorkFlowId(id);
      dispatch(fetchSubUserBranchByID(id))
        .then((action: any) => {
          // Access entityDetails from the response structure
          const branchData = action?.payload?.data?.entityDetails;
          const workflowDetails = action?.payload?.data?.workflowDetails;
          const deactivationDetails =
            action?.payload?.data?.deactivationDetails;
          const impactSummary = workflowDetails?.impactSummary;

          console.log('Branch Data from API:', branchData);
          console.log('Workflow Details:', workflowDetails);
          console.log('Deactivation Details:', deactivationDetails);

          const branchCode =
            branchData?.branchCode || workflowDetails?.branchCode || '';
          const address = branchData?.address || {};

          // Get country name from code
          const countriesList: Country[] = geographyHierarchy || [];
          const countryObj = countriesList.find(
            (c: Country) => c.code === address?.countryCode
          );
          const countryName = countryObj?.name || address?.countryCode || '';

          setDetails({
            branchName: branchData?.branchName || '',
            branchCode: branchCode,
            remark:
              deactivationDetails?.remarks || workflowDetails?.reason || '',
            deactivationInitiatedBy:
              deactivationDetails?.deactivationInitiatedBy ||
              workflowDetails?.userId ||
              '',
            deactivationInitiatedOn:
              deactivationDetails?.deactivationInitiatedOn || '',
            addressLine1: address?.line1 || '',
            addressLine2: address?.line2 || '',
            addressLine3: address?.line3 || '',
            country: countryName,
            countryCode: address?.countryCode || '',
            state: address?.state || '',
            district: address?.district || '',
            city: address?.city || '',
            pinCode: address?.pinCode || '',
            alternatePinCode: address?.alternatePinCode || '',
            digipin: address?.digiPin || '',
            associatedUsers: impactSummary?.totalUsers || 0,
          });
          console.log('Set Details with branchCode:', branchCode);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch regions:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [dispatch, id, setWorkFlowId, geographyHierarchy]);

  // Fetch total users count for the branch
  useEffect(() => {
    const fetchBranchUsersCount = async () => {
      if (details?.branchCode) {
        try {
          const response = await Secured.get(
            `/api/v1/branches/users?branchCode=${details.branchCode}&getUsers=false`
          );

          if (
            response.data?.success &&
            response.data?.data?.totalCount !== undefined
          ) {
            setTotalUsersCount(response.data.data.totalCount);
          } else {
            setTotalUsersCount(0);
          }
        } catch (error) {
          console.error('Error fetching branch users count:', error);
          setTotalUsersCount(0);
        }
      }
    };

    fetchBranchUsersCount();
  }, [details?.branchCode]);

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!details?.branchCode) {
      console.error('BranchCode is missing!', details);
      return;
    }

    try {
      // Create region request payload
      const regionRequest: StatusSubUserBranchType = {
        type: 'DEACTIVATE',
        branchCode: details.branchCode,
      };

      console.log('Approve Payload:', regionRequest);
      console.log('Details:', details);

      // Dispatch the createRegion action
      dispatch(
        StatusSubUserBranch({
          regionCode: workFlowId,
          regionData: regionRequest,
          statusType: 'approve',
        })
      ).then((action: any) => {
        console.log('Branch Approve Action:---', action);
        if (action?.payload?.success === true) {
          const branchDisplay = `${details?.branchName || 'Branch Name'} - ${details?.branchCode || 'Branch Code'}`;
          setModalState({
            isOpen: true,
            type: 'approve',
            title: 'Branch',
            message: `\n\n${branchDisplay}\n\nDe-activated successfully`,
            listBefore: [],
            listAfter: [],
          });
        } else {
          setModalState({
            isOpen: true,
            type: action?.error?.message,
            title: 'Request ' + action?.error?.message,
            message: action?.payload,
            listBefore: [],
            listAfter: [],
          });
        }
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

  const handleRejectConfirm = async (rejectionRemark: string) => {
    if (!details?.branchCode) {
      console.error('BranchCode is missing!', details);
      return;
    }

    try {
      // Create region request payload
      const regionRequest: StatusSubUserBranchType = {
        type: 'DEACTIVATE',
        remark: rejectionRemark,
        branchCode: details.branchCode,
      };

      console.log('Reject Payload:', regionRequest);
      console.log('Details:', details);

      dispatch(
        StatusSubUserBranch({
          regionCode: workFlowId,
          regionData: regionRequest,
          statusType: 'reject',
        })
      )
        .then((action: any) => {
          console.log('Branch Reject Action:---', action);
          // Always show rejection message regardless of API response format
          setModalState({
            isOpen: true,
            type: 'reject',
            title: '',
            message: 'Branch De-activation Request Rejected',
            listBefore: [],
            listAfter: [],
          });
        })
        .catch((error: any) => {
          console.error('Error in reject handler:', error);
          // Even on error, show rejection message
          setModalState({
            isOpen: true,
            type: 'reject',
            title: '',
            message: 'Branch De-activation Request Rejected',
            listBefore: [],
            listAfter: [],
          });
        });
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setRejectModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setModalState((prev) => {
      const modalType = prev.type;
      // Redirect to branch de-activation list page after approve or reject
      if (modalType === 'approve' || modalType === 'reject') {
        // Use setTimeout to ensure state update completes before navigation
        setTimeout(() => {
          navigate('/re/sub-user-management/branch/list/de-activate');
        }, 0);
      }
      return { ...prev, isOpen: false };
    });
  };

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Branch', path: '/re/sub-user-management/branch' },
    {
      label: 'De-activate',
      path: '/re/sub-user-management/branch/list/de-activate',
    },
    { label: 'Approval' },
  ];

  if (loading || !details) {
    return (
      <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        <Container maxWidth={false} sx={styles.containerStyles}>
          <Typography>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={styles.containerStyles}>
        {/* Breadcrumb and Back Button - Top */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {/* Breadcrumb */}
          <Box sx={{ flex: 1 }}>
            <NavigationBreadCrumb crumbsData={crumbsData} />
          </Box>
          {/* Back Button - Top Right */}
          <Box>
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
        </Box>

        <Typography sx={styles.headerStyles}>
          Branch De-activation Request
        </Typography>

        <Box component="form">
          {/* De-activation Details Section */}
          <Box
            sx={{
              backgroundColor: '#F6F6F6',
              borderRadius: '8px',
              padding: '20px',
              mt: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Typography
                  sx={{
                    ...styles.labelStyles,
                    color: '#666',
                    marginBottom: 1,
                  }}
                >
                  De-activation Initiated by
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#999',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  {details.deactivationInitiatedBy || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Typography
                  sx={{
                    ...styles.labelStyles,
                    color: '#666',
                    marginBottom: 1,
                  }}
                >
                  De-activation Initiated on
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#999',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  {formatDateOnly(details.deactivationInitiatedOn || '-')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Typography
                  sx={{
                    ...styles.labelStyles,
                    color: '#666',
                    marginBottom: 1,
                  }}
                >
                  De-activation Remark
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#999',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  {details.remark || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Branch Details Section */}
          <Typography
            sx={{
              ...styles.labelStyles,
              mt: 4,
              mb: 2,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Branch Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>Branch Name</Typography>
                <TextField
                  value={details.branchName || '-'}
                  sx={styles.readOnlyTextFieldStyles}
                  placeholder="Enter Branch Name"
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>Branch Code</Typography>
                <TextField
                  value={details.branchCode || '-'}
                  sx={styles.readOnlyTextFieldStyles}
                  placeholder="Enter Branch Code"
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Address Details Section */}
          <Typography
            sx={{
              ...styles.labelStyles,
              mt: 4,
              mb: 2,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Address Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>
                  Address Line 1 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  value={details.addressLine1 || '-'}
                  placeholder="Enter Address Line 1"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>Address Line 2</Typography>
                <TextField
                  value={details.addressLine2 || '-'}
                  placeholder="Enter Address Line 2"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>Address Line 3</Typography>
                <TextField
                  value={details.addressLine3 || '-'}
                  placeholder="Enter Address Line 3"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>
                  Country <span style={{ color: 'red' }}>*</span>
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={details.countryCode || '-'}
                    sx={styles.readOnlyTextFieldStyles}
                    disabled={true}
                  >
                    <MenuItem value={details.countryCode || '-'}>
                      {getCountryName(details.countryCode) || '-'}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>
                  State / UT{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  value={details.state || '-'}
                  placeholder="Enter State / UT"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>
                  District{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  value={details.district || '-'}
                  placeholder="Enter District"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>
                  City / Town{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  value={details.city || '-'}
                  placeholder="Enter City/Town"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>
                  Pin Code{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  value={
                    details.pinCode === '000000'
                      ? 'Other'
                      : details.pinCode || '-'
                  }
                  sx={styles.readOnlyTextFieldStyles}
                  placeholder="Enter Pin Code"
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            {(details.pinCode === '000000' || details.pinCode === 'other') && (
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography sx={styles.labelStyles}>
                    Pin Code (in case of others)
                  </Typography>
                  <TextField
                    value={details.alternatePinCode || '-'}
                    placeholder="Enter Pin Code (in case of others)"
                    sx={styles.readOnlyTextFieldStyles}
                    fullWidth
                    disabled={true}
                  />
                </Box>
              </Grid>
            )}
            {!(details.pinCode === '000000' || details.pinCode === 'other') && (
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography sx={styles.labelStyles}>Digipin</Typography>
                  <TextField
                    value={details.digipin || '-'}
                    placeholder="Enter Digipin"
                    sx={styles.readOnlyTextFieldStyles}
                    fullWidth
                    disabled={true}
                  />
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Digipin row - only shown when Pin Code (in case of others) is displayed */}
          {(details.pinCode === '000000' || details.pinCode === 'other') && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography sx={styles.labelStyles}>Digipin</Typography>
                  <TextField
                    value={details.digipin || '-'}
                    placeholder="Enter Digipin"
                    sx={styles.readOnlyTextFieldStyles}
                    fullWidth
                    disabled={true}
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>

        <Typography sx={styles.infoNoteStyles}>
          Note: De-activating this branch will automatically lead to
          de-activation of associated {totalUsersCount} Users.
        </Typography>

        <Box sx={styles.actionsContainerStyles}>
          <ActionButtons
            onApprove={handleApprove}
            onReject={handleRejectClick}
          />
        </Box>

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
          title="Are you sure you want to reject branch de-activation request?"
          remarkLabel="Remark"
          remarkPlaceholder="Type your Remark here"
          cancelLabel="Cancel"
          submitLabel="Submit"
        />
      </Container>
    </Box>
  );
};

export default BranchDeActivationRequest;
