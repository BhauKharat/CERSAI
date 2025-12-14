/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Link,
  Grid,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ActionButtons from '../../../../common/buttons/ActionButtons';
import * as styles from './RegionDeactivationRequest.styles';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import DecisionModal from '../../../../common/modals/DecisionModal';
import { fetchSubUserRegionByCode } from './slice/SubUserSingleRegionSlice';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { StatusSubUserRegion } from './slice/SubUserStatusUpdateRegionSlice';
import { StatusSubUserRegionType } from './types/SubUserSingleRegion';
import { fetchGeographyHierarchy } from '../../../../../redux/slices/registerSlice/masterSlice';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

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
interface Country {
  code: string;
  name: string;
  states?: any[];
}

const RegionDeactivationRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Region', path: '/re/sub-user-management/region' },
    {
      label: 'De-activate',
      path: '/re/sub-user-management/region/list/de-activate',
    },
    { label: 'Approval' },
  ];

  // Get userId from Redux store instead of localStorage
  const userId = useSelector(
    (state: RootState) => state.auth.userDetails?.userId || ''
  );

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);

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
  const [worFlowId, setWorkFlowId] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [branchesModalOpen, setBranchesModalOpen] = useState(false);
  const [branchesList, setBranchesList] = useState<any[]>([]);
  const [selectedRegionName, setSelectedRegionName] = useState<string>('');
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchesSummary, setBranchesSummary] = useState<{
    totalUser: number;
    totalBranchUsers: number;
    totalBranchesCount: number;
    regionUserCount: number;
  }>({
    totalUser: 0,
    totalBranchUsers: 0,
    totalBranchesCount: 0,
    regionUserCount: 0,
  });

  useEffect(() => {
    dispatch(fetchGeographyHierarchy());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setWorkFlowId(id);
      dispatch(fetchSubUserRegionByCode(id))
        .then((action: any) => {
          const responseData = action?.payload?.data;
          const entityDetails = responseData?.entityDetails;
          const workflowDetails = responseData?.workflowDetails;
          const deactivationDetails = responseData?.deactivationDetails;
          const impactSummary = workflowDetails?.impactSummary;

          console.log('Region Details by ID:---', responseData);
          console.log('Workflow Details:', workflowDetails);
          console.log('Deactivation Details:', deactivationDetails);
          console.log('Impact Summary:', impactSummary);
          console.log('Total Branches:', impactSummary?.totalBranches);
          console.log('Total Users:', impactSummary?.totalUsers);

          // Extract impact summary values with proper fallbacks
          const totalBranches =
            impactSummary?.totalBranches ??
            workflowDetails?.impactSummary?.totalBranches ??
            0;
          const totalUsers =
            impactSummary?.totalUsers ??
            workflowDetails?.impactSummary?.totalUsers ??
            0;

          console.log('Extracted Total Branches:', totalBranches);
          console.log('Extracted Total Users:', totalUsers);

          // Store branch list if available
          if (
            impactSummary?.branchUserCounts &&
            Array.isArray(impactSummary.branchUserCounts)
          ) {
            setBranchesList(impactSummary.branchUserCounts);
          } else {
            setBranchesList([]);
          }

          const address = entityDetails?.address || {};
          const countriesList: Country[] = geographyHierarchy || [];
          const countryObj = countriesList.find(
            (c: Country) => c.code === address?.countryCode
          );
          const countryName = countryObj?.name || address?.countryCode || '';

          setDetails({
            regionName: entityDetails?.regionName || '',
            regionCode: entityDetails?.regionCode || '',
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
            associatedBranches: totalBranches,
            associatedUsers: totalUsers,
          });
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

  // Check if country is India
  const isIndiaSelected =
    details?.countryCode === 'IN' || !details?.countryCode;

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      // Create region request payload
      const regionRequest: StatusSubUserRegionType = {
        type: 'DEACTIVATE',
      };

      // Dispatch the createRegion action
      dispatch(
        StatusSubUserRegion({
          regionCode: worFlowId,
          regionData: regionRequest,
          statusType: 'approve',
          userId: userId,
        })
      ).then((action: any) => {
        // Show success modal
        console.log('Action Region:---', action);
        console.log('Action Region Response:---', action?.payload?.success);
        if (action?.payload?.success === true) {
          const regionDisplay = `${details?.regionName || 'Region Name'} - ${details?.regionCode || 'Region Code'}`;
          setModalState({
            isOpen: true,
            type: 'approve',
            title: '',
            message: `Region\n\n${regionDisplay}\n\nDe-activated Successfully`,
            listBefore: [],
            listAfter: [],
          });
        } else {
          setModalState({
            isOpen: true,
            type: action?.error?.message,
            title: 'Request ' + action?.error?.message,
            message:
              typeof action?.payload === 'string'
                ? action?.payload
                : action?.payload?.message ||
                  action?.payload?.message ||
                  JSON.stringify(action?.payload) ||
                  'Unknown error',
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

  const handleRejectConfirm = async (remark: string) => {
    try {
      // Simulate API call for rejection
      // Create region request payload
      const regionRequest: StatusSubUserRegionType = {
        type: 'DEACTIVATE',
        reason: remark,
      };

      dispatch(
        StatusSubUserRegion({
          regionCode: worFlowId,
          regionData: regionRequest,
          statusType: 'reject',
          userId: userId,
        })
      ).then((action: any) => {
        // Show success modal after rejection
        if (action?.payload?.success === true) {
          setModalState({
            isOpen: true,
            type: 'reject',
            title: '',
            message: 'Region Deactivation Request Rejected',
            listBefore: [],
            listAfter: [],
          });
        } else {
          setModalState({
            isOpen: true,
            type: 'reject',
            title: '',
            message: 'Region Deactivation Request Rejected',
            listBefore: [],
            listAfter: [],
          });
        }

        // navigate('/re/sub-user-management/region');
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setRejectModalOpen(false);
    }
  };

  const handleViewDetails = async (regionCode: string, regionName?: string) => {
    try {
      setLoadingBranches(true);
      dispatch(showLoader('Loading branches...'));
      setBranchesModalOpen(true);
      setSelectedRegionName(regionName || '');

      const response = await Secured.get(
        API_ENDPOINTS.get_region_branches(regionCode)
      );

      console.log('Branches API Response:', response.data);

      // Handle different possible response structures
      let branchesData: any[] = [];

      if (response.data?.success) {
        console.log('API Response Data:', response.data.data);
        const apiData = response.data.data;

        // Extract summary data from API response
        setBranchesSummary({
          totalUser: apiData?.totalUser || 0,
          totalBranchUsers: apiData?.totalBranchUsers || 0,
          totalBranchesCount: apiData?.totalBranchesCount || 0,
          regionUserCount: apiData?.regionUserCount || 0,
        });

        // Extract associatedBranches
        if (
          apiData?.associatedBranches &&
          Array.isArray(apiData.associatedBranches)
        ) {
          branchesData = apiData.associatedBranches;
        } else if (Array.isArray(apiData)) {
          branchesData = apiData;
        } else if (apiData?.content && Array.isArray(apiData.content)) {
          branchesData = apiData.content;
        } else if (Array.isArray(response.data)) {
          branchesData = response.data;
        }
      } else if (Array.isArray(response.data)) {
        branchesData = response.data;
      }

      setBranchesList(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranchesList([]);
    } finally {
      setLoadingBranches(false);
      dispatch(hideLoader());
    }
  };

  const handleModalClose = () => {
    const modalType = modalState.type;
    setModalState((prev) => ({ ...prev, isOpen: false }));
    // Redirect to region list/de-activate page after modal is closed (for both approve and reject)
    if (modalType === 'approve' || modalType === 'reject') {
      navigate('/re/sub-user-management/region/list/de-activate');
    }
  };

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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <NavigationBreadCrumb crumbsData={crumbsData} />
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={styles.backButtonStyles}
          >
            Back
          </Button>
        </Box>

        <Typography sx={styles.headerStyles}>
          Region De-activation Details
        </Typography>

        <Box component="form">
          {/* De-activation Details Section */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 2,
              mb: 3,
              backgroundColor: '#F6F6F6',
              borderRadius: '8px',
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5 }}
                  >
                    De-activation Initiated by
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {details?.deactivationInitiatedBy || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5 }}
                  >
                    De-activation Initiated on
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDateOnly(details?.deactivationInitiatedOn)}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 0.5 }}
                  >
                    De-activation Remark
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {details?.remark || '-'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Region Details Section */}
          <Typography
            sx={{
              ...styles.labelStyles,
              mt: 4,
              mb: 2,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Region Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>Region Name</Typography>
                <TextField
                  value={details?.regionName || '-'}
                  placeholder="Enter Region Name"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>Region Code</Typography>
                <TextField
                  value={details?.regionCode || '-'}
                  placeholder="Enter Region Code"
                  sx={styles.readOnlyTextFieldStyles}
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
                  value={details?.addressLine1 || '-'}
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
                  value={details?.addressLine2 || '-'}
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
                  value={details?.addressLine3 || '-'}
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
                <TextField
                  value={details?.country || '-'}
                  placeholder="Enter Country"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
              <Box>
                <Typography sx={styles.labelStyles}>
                  State / UT{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  value={details?.state || '-'}
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
                  value={details?.district || '-'}
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
                  value={details?.city || '-'}
                  placeholder="Enter City / Town"
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
                    details?.pinCode === '000000'
                      ? 'Other'
                      : details?.pinCode || '-'
                  }
                  placeholder="Enter Pin Code"
                  sx={styles.readOnlyTextFieldStyles}
                  fullWidth
                  disabled={true}
                />
              </Box>
            </Grid>
            {(details?.pinCode === '000000' ||
              details?.pinCode === 'other') && (
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography sx={styles.labelStyles}>
                    Pin Code (in case of others)
                  </Typography>
                  <TextField
                    value={details?.alternatePinCode || '-'}
                    placeholder="Enter Pin Code"
                    sx={styles.readOnlyTextFieldStyles}
                    fullWidth
                    disabled={true}
                  />
                </Box>
              </Grid>
            )}
            {!(
              details?.pinCode === '000000' || details?.pinCode === 'other'
            ) && (
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography sx={styles.labelStyles}>Digipin</Typography>
                  <TextField
                    value={details?.digipin || '-'}
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
          {(details?.pinCode === '000000' || details?.pinCode === 'other') && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box>
                  <Typography sx={styles.labelStyles}>Digipin</Typography>
                  <TextField
                    value={details?.digipin || '-'}
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
          Note: De-activating this region will automatically lead to
          de-activation of associated [{details?.associatedBranches || 0}]
          Branches & [{details?.associatedUsers || 0}] Users.
          <Link
            onClick={async (e) => {
              e.preventDefault();
              if (details?.regionCode) {
                await handleViewDetails(
                  details.regionCode,
                  details?.regionName
                );
              }
            }}
            sx={styles.viewDetailsLinkStyles}
          >
            View Details
          </Link>
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
          title="Are you sure you want to reject region deactivation request?"
          remarkLabel="Remark"
          remarkPlaceholder="Type your Remark here"
          cancelLabel="Cancel"
          submitLabel="Submit"
        />

        {/* Branches and Users Modal */}
        <Dialog
          open={branchesModalOpen}
          onClose={() => setBranchesModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '8px',
              padding: '24px',
              minWidth: '500px',
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              pb: 1,
              pt: 0,
              px: 0,
            }}
          >
            <IconButton
              onClick={() => setBranchesModalOpen(false)}
              size="small"
              sx={{
                color: '#666',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 0, py: 2 }}>
            {loadingBranches ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '13px', fontFamily: 'Gilroy, sans-serif' }}
                >
                  Loading data...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Region and Number of Users Table */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '16px',
                    fontFamily: 'Gilroy, sans-serif',
                    color: '#1A1A1A',
                    mb: 1.5,
                  }}
                >
                  Region and Number of Users
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    boxShadow: 'none',
                    background: 'transparent',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #E0E0E0',
                    mb: 3,
                    '& .MuiTable-root': {
                      minWidth: '100%',
                    },
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      borderCollapse: 'separate',
                      borderSpacing: 0,
                      '& .MuiTableCell-root': {
                        padding: '12px 16px',
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#1A1A1A',
                        borderBottom: '1px solid #E0E0E0',
                        borderRight: '1px solid #E0E0E0',
                        '&:last-child': {
                          borderRight: 'none',
                        },
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: '#E8EBFB',
                          '& th': {
                            padding: '12px 16px',
                            fontFamily: 'Gilroy, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#000000',
                            borderBottom: '1px solid #E0E0E0',
                            borderRight: '1px solid #E0E0E0',
                            height: '48px',
                            '&:first-of-type': {
                              borderTopLeftRadius: '4px',
                            },
                            '&:last-child': {
                              borderTopRightRadius: '4px',
                              borderRight: 'none',
                            },
                          },
                        }}
                      >
                        <TableCell>Sr.No.</TableCell>
                        <TableCell>Region Name</TableCell>
                        <TableCell align="center">Number of Users</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{
                          backgroundColor: '#FFFFFF',
                          '&:last-child td': {
                            borderBottom: 'none',
                          },
                        }}
                      >
                        <TableCell>01</TableCell>
                        <TableCell>{selectedRegionName || '-'}</TableCell>
                        <TableCell align="center">
                          {branchesSummary.regionUserCount || 0}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* List of Associated Branches and Number of Users Table */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '16px',
                    fontFamily: 'Gilroy, sans-serif',
                    color: '#1A1A1A',
                    mb: 1.5,
                  }}
                >
                  List of Associated Branches and Number of Users
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    boxShadow: 'none',
                    background: 'transparent',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #E0E0E0',
                    '& .MuiTable-root': {
                      minWidth: '100%',
                    },
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      borderCollapse: 'separate',
                      borderSpacing: 0,
                      '& .MuiTableRow-root:first-of-type th': {
                        borderTop: 'none',
                      },
                      '& .MuiTableRow-root:last-child td': {
                        borderBottom: 'none',
                      },
                      '& .MuiTableCell-root': {
                        padding: '12px 16px',
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#1A1A1A',
                        borderBottom: '1px solid #E0E0E0',
                        borderRight: '1px solid #E0E0E0',
                        position: 'relative',
                        '&:last-child': {
                          borderRight: 'none',
                          paddingRight: '16px',
                        },
                        '&:first-of-type': {
                          paddingLeft: '16px',
                        },
                      },
                      '& .MuiTableRow-root': {
                        '&:hover': {
                          backgroundColor: '#F5F7FF',
                          '&:last-child td': {
                            borderBottom: '1px solid #E0E0E0',
                          },
                        },
                        '&:last-child': {
                          '& td': {
                            borderBottom: 'none',
                            '&:first-of-type': {
                              borderBottomLeftRadius: '4px',
                            },
                            '&:last-child': {
                              borderBottomRightRadius: '4px',
                            },
                          },
                        },
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: '#E8EBFB',
                          '& th': {
                            padding: '12px 16px',
                            fontFamily: 'Gilroy, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#000000',
                            borderBottom: '1px solid #E0E0E0',
                            borderRight: '1px solid #E0E0E0',
                            height: '48px',
                            '&:first-of-type': {
                              borderTopLeftRadius: '4px',
                              paddingLeft: '16px',
                            },
                            '&:last-child': {
                              borderTopRightRadius: '4px',
                              borderRight: 'none',
                              paddingRight: '16px',
                            },
                          },
                        }}
                      >
                        <TableCell>Sr.No.</TableCell>
                        <TableCell>Branch Name</TableCell>
                        <TableCell align="center">Number of Users</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {branchesList.length > 0 ? (
                        branchesList.map((branch, index) => (
                          <TableRow
                            key={`${branch.branchName || branch.branchCode || index}-${index}`}
                            sx={{
                              backgroundColor:
                                index % 2 === 0 ? '#FFFFFF' : '#F9F9F9',
                              '&:last-child td': {
                                borderBottom: 'none',
                              },
                            }}
                          >
                            <TableCell>
                              {String(index + 1).padStart(2, '0')}
                            </TableCell>
                            <TableCell>
                              {branch.branchName || branch.name || '-'}
                            </TableCell>
                            <TableCell align="center">
                              {branch.userCount ||
                                branch.numberOfUsers ||
                                branch.users ||
                                0}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            align="center"
                            sx={{ py: 2, color: '#666' }}
                          >
                            No data
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'center',
              px: 0,
              pb: 0,
              pt: 2,
            }}
          >
            <Button
              onClick={() => setBranchesModalOpen(false)}
              variant="contained"
              sx={{
                backgroundColor: '#002CBA',
                color: '#FFFFFF',
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                textTransform: 'none',
                px: 4,
                py: 1,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#0020A0',
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

export default RegionDeactivationRequest;
