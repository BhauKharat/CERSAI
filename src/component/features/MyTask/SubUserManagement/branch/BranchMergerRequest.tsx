/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ActionButtons from '../../../../common/buttons/ActionButtons';
import DecisionModal from '../../../../common/modals/DecisionModal';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import * as styles from './BranchMergerRequest.styles';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../redux/store';
import { fetchSubUserBranchByID } from './slice/SubUserSingleBranchSlice';
import { SubUserModifyBranchRequest } from './types/SubUserCreateBranch';
import { StatusSubUserBranch } from './slice/SubUserStatusUpdateBranchSlice';
import { StatusSubUserBranchType } from './types/SubUserSingleBranch';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import {
  fetchCountryCodes,
  Country as CountryCode,
} from '../../../../../utils/countryUtils';

// const mergingBranchesData = [
//   'BALEWADI [MHPB5555]',
//   'BALEWADI [MHPB6666]',
//   'BALEWADI [MHPB7777]',
// ];

const BranchMergerRequest: React.FC = () => {
  const navigate = useNavigate();
  // const [formData] = useState({
  //   region: 'Pune',
  //   branchName: 'Balewadi',
  //   branchCode: 'MHPB5555',
  // });
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [workFlowId, setWorkFlowId] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const [details, setDetails] = useState<SubUserModifyBranchRequest | null>();
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
    details?.address?.countryCode === 'IN' || !details?.address?.countryCode;

  useEffect(() => {
    setLoading(true);
    if (id) {
      setWorkFlowId(id);
      dispatch(fetchSubUserBranchByID(id))
        .then((action: any) => {
          const responseData = action?.payload?.data;
          console.log('Branch Merger Response Data:', responseData);

          // Extract target branch and source branches from workflowDetails
          const targetBranch = responseData?.workflowDetails?.targetBranch;
          const sourceBranches =
            responseData?.workflowDetails?.sourceBranches ||
            responseData?.workflowDetails?.sourceBranchCodes ||
            [];
          const entityDetails = responseData?.entityDetails;
          const address = entityDetails?.address || targetBranch?.address || {};

          setDetails({
            branchName:
              targetBranch?.branchName || entityDetails?.branchName || '',
            branchCode:
              targetBranch?.branchCode || entityDetails?.branchCode || '',
            region:
              targetBranch?.regionName ||
              targetBranch?.regionCode ||
              entityDetails?.regionName ||
              entityDetails?.regionCode ||
              '',
            sourceBranchCodes: sourceBranches,
            address: {
              line1: address?.line1 || '',
              line2: address?.line2 || '',
              line3: address?.line3 || '',
              cityTown: address?.city || address?.cityTown || '',
              state: address?.state || '',
              countryCode: address?.countryCode || '',
              pinCode: address?.pinCode || '',
              district: address?.district || '',
              alternatePinCode: address?.alternatePinCode || '',
              digiPin: address?.digiPin || address?.digipin || '',
            },
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch branch merger details:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [dispatch, id]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'reject',
    title: '',
    message: '',
    listBefore: [] as string[],
    listAfter: [] as string[],
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Create region request payload
    const regionRequest: StatusSubUserBranchType = {
      type: 'MERGE',
    };

    // Dispatch the createRegion action
    dispatch(
      StatusSubUserBranch({
        regionCode: workFlowId,
        regionData: regionRequest,
        statusType: 'approve',
      })
    ).then((action: any) => {
      // Show success modal
      if (action?.payload?.success === true) {
        // Create list of source branches being merged
        const sourceBranchesList =
          details?.sourceBranchCodes?.map((branch: any) => {
            const branchName =
              typeof branch === 'object'
                ? branch.branchName || branch.name || ''
                : '';
            const branchCode =
              typeof branch === 'object'
                ? branch.branchCode || branch.code || branch
                : branch;
            return `${branchName || 'Branch Name'} - ${branchCode}`;
          }) || [];

        setModalState({
          isOpen: true,
          type: 'approve',
          title: 'Branch',
          message: 'has been merged successfully into',
          listBefore: sourceBranchesList,
          listAfter: [
            `${details?.branchName || 'Branch Name'} - ${details?.branchCode || 'Branch Code'}`,
          ],
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
  };

  const handleRejectClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (remark: string) => {
    try {
      // Create region request payload
      const regionRequest: StatusSubUserBranchType = {
        type: 'MERGE',
        reason: remark,
        remark: remark,
      };

      dispatch(
        StatusSubUserBranch({
          regionCode: workFlowId,
          regionData: regionRequest,
          statusType: 'reject',
        })
      )
        .then((action: any) => {
          if (action.type.endsWith('/rejected')) {
            let errorMessage = 'Failed to reject request';

            // Parse the JSON string payload first
            let errorData;
            try {
              errorData =
                typeof action.payload === 'string'
                  ? JSON.parse(action.payload)
                  : action.payload;
            } catch {
              errorData = action.payload;
            }

            // Now check for nested error structure
            errorData = errorData?.error || errorData;

            console.log('Error data:', JSON.stringify(errorData, null, 2));

            if (errorData?.errors && Array.isArray(errorData.errors)) {
              const errorMessages = errorData.errors.map(
                (err: any) => err.message
              );
              errorMessage = errorMessages.join(', ');
              console.log('Extracted error messages:', errorMessage);
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (action.error?.message) {
              errorMessage = action.error.message;
            } else if (action.payload?.message) {
              errorMessage = action.payload.message;
            }

            console.log('Final error message to display:', errorMessage);

            setModalState({
              isOpen: true,
              type: 'reject',
              title: 'Error',
              message: errorMessage,
              listBefore: [],
              listAfter: [],
            });
          } else {
            // Success case
            setModalState({
              isOpen: true,
              type: 'reject',
              title: '',
              message: 'Branch Merge Request Rejected',
              listBefore: [],
              listAfter: [],
            });
          }
        })
        .catch((error: any) => {
          console.error('Error in reject handler:', error);
          console.log('Error payload:', error?.payload);

          // Extract error message from the backend error structure
          let errorMessage = 'An error occurred while rejecting the request';

          // Parse the JSON string if needed
          let errorData;
          try {
            const payload = error?.payload;
            errorData =
              typeof payload === 'string' ? JSON.parse(payload) : payload;
          } catch {
            errorData = error?.payload || error?.response?.data;
          }

          // Check for nested error structure
          errorData = errorData?.error || errorData;

          if (errorData?.errors && Array.isArray(errorData.errors)) {
            // Get all field error messages
            const errorMessages = errorData.errors.map(
              (err: any) => err.message
            );
            errorMessage = errorMessages.join(', ');
            console.log('Extracted error messages from catch:', errorMessage);
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }

          setModalState({
            isOpen: true,
            type: 'reject',
            title: 'Error',
            message: errorMessage,
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
      // Redirect to branch merge list page after approve or reject
      if (modalType === 'approve' || modalType === 'reject') {
        // Use setTimeout to ensure state update completes before navigation
        setTimeout(() => {
          navigate('/re/sub-user-management/branch/list/merge');
        }, 0);
      }
      return { ...prev, isOpen: false };
    });
  };

  if (loading || !details) {
    return (
      <Container maxWidth={false} sx={{ py: 6 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Branch', path: '/re/sub-user-management/branch' },
    { label: 'Merge', path: '/re/sub-user-management/branch/list/merge' },
    { label: 'Approval' },
  ];

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={styles.containerStyles}>
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
        <Typography sx={styles.headerStyles}>Branch Merger Request</Typography>

        <Box component="form">
          {/* Region Name */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ width: 350 }}>
              <Typography sx={styles.labelStyles}>Region Name</Typography>
              <TextField
                fullWidth
                value={details.region || '-'}
                variant="outlined"
                placeholder="Enter Region Name"
                sx={styles.inputStyles}
                disabled={true}
              />
            </Box>
          </Box>

          {/* Retained Branch Fields */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Box sx={{ width: 350 }}>
              <Typography sx={styles.labelStyles}>
                Retained – Branch Name
              </Typography>
              <TextField
                fullWidth
                value={details.branchName || '-'}
                variant="outlined"
                placeholder="Enter Branch Name"
                sx={styles.inputStyles}
                disabled={true}
              />
            </Box>
            <Box sx={{ width: 350 }}>
              <Typography sx={styles.labelStyles}>
                Retained – Branch Code
              </Typography>
              <TextField
                fullWidth
                value={details.branchCode || '-'}
                variant="outlined"
                placeholder="Enter Branch Code"
                sx={styles.inputStyles}
                disabled={true}
              />
            </Box>
          </Box>

          {/* Address Details Section */}
          {details.address && (
            <>
              <Typography sx={{ ...styles.sectionTitleStyles, mt: 4 }}>
                Address Details
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>
                    Address Line 1 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    value={details.address.line1 || '-'}
                    variant="outlined"
                    placeholder="Enter Address Line 1"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>
                    Address Line 2
                  </Typography>
                  <TextField
                    fullWidth
                    value={details.address.line2 || '-'}
                    variant="outlined"
                    placeholder="Enter Address Line 2"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>
                    Address Line 3
                  </Typography>
                  <TextField
                    fullWidth
                    value={details.address.line3 || '-'}
                    variant="outlined"
                    placeholder="Enter Address Line 3"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>
                    Country <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    value={getCountryName(details.address.countryCode)}
                    variant="outlined"
                    placeholder="Enter Country"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>
                    State / UT{' '}
                    {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                  <TextField
                    fullWidth
                    value={details.address.state || '-'}
                    variant="outlined"
                    placeholder="Enter State / UT"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>
                    District{' '}
                    {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                  <TextField
                    fullWidth
                    value={details.address.district || '-'}
                    variant="outlined"
                    placeholder="Enter District"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>
                    City/Town{' '}
                    {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                  <TextField
                    fullWidth
                    value={details.address.cityTown || '-'}
                    variant="outlined"
                    placeholder="Enter City/Town"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>
                    Pin Code{' '}
                    {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                  <TextField
                    fullWidth
                    value={
                      details.address.pinCode === '000000'
                        ? 'Other'
                        : details.address.pinCode === 'Others'
                          ? 'Other'
                          : details.address.pinCode || '-'
                    }
                    variant="outlined"
                    placeholder="Enter Pin Code"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
                {(details.address.pinCode === '000000' ||
                  details.address.pinCode === 'other' ||
                  details.address.pinCode === 'Others') && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Typography sx={styles.labelStyles}>
                      Pin Code (in case of others)
                    </Typography>
                    <TextField
                      fullWidth
                      value={details.address.alternatePinCode || '-'}
                      variant="outlined"
                      placeholder="Enter Pin Code (in case of others)"
                      sx={styles.inputStyles}
                      disabled={true}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={styles.labelStyles}>Digipin</Typography>
                  <TextField
                    fullWidth
                    value={details.address.digiPin || '-'}
                    variant="outlined"
                    placeholder="Enter Digipin"
                    sx={styles.inputStyles}
                    disabled={true}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Merging Branch Details Table */}
          <Box sx={{ mt: 5 }}>
            <Typography sx={styles.sectionTitleStyles}>
              Merging Branch Details
            </Typography>
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: '#E6EBFF',
                      '&:hover': { backgroundColor: '#E6EBFF' },
                    }}
                  >
                    <TableCell
                      sx={{
                        p: '14px 16px',
                        color: '#333',
                        textAlign: 'center',
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        borderBottom: 'none',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '8px',
                          bottom: '8px',
                          right: 0,
                          width: '1px',
                          backgroundColor: 'rgba(224, 224, 224, 1)',
                        },
                      }}
                    >
                      Sr.No.
                    </TableCell>
                    <TableCell
                      sx={{
                        p: '14px 16px',
                        color: '#333',
                        textAlign: 'center',
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        borderBottom: 'none',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '8px',
                          bottom: '8px',
                          right: 0,
                          width: '1px',
                          backgroundColor: 'rgba(224, 224, 224, 1)',
                        },
                      }}
                    >
                      Branch Name
                    </TableCell>
                    <TableCell
                      sx={{
                        p: '14px 16px',
                        color: '#333',
                        textAlign: 'center',
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        borderBottom: 'none',
                      }}
                    >
                      Branch Code
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details?.sourceBranchCodes?.map(
                    (branch: any, index: number) => {
                      // Handle both string and object formats
                      const branchName =
                        typeof branch === 'object'
                          ? branch.branchName || branch.name || ''
                          : '';
                      const branchCode =
                        typeof branch === 'object'
                          ? branch.branchCode || branch.code || branch
                          : branch;

                      return (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              p: '16px',
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              fontFamily: 'Gilroy, sans-serif',
                              fontWeight: 600,
                              fontSize: '16px',
                              color: 'rgba(0, 44, 186, 1)',
                              textAlign: 'center',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '8px',
                                bottom: '8px',
                                right: 0,
                                width: '1px',
                                backgroundColor: 'rgba(224, 224, 224, 1)',
                              },
                            }}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </TableCell>
                          <TableCell
                            sx={{
                              p: '16px',
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              fontFamily: 'Gilroy, sans-serif',
                              fontWeight: 600,
                              fontSize: '16px',
                              color: 'rgba(0, 44, 186, 1)',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '8px',
                                bottom: '8px',
                                right: 0,
                                width: '1px',
                                backgroundColor: 'rgba(224, 224, 224, 1)',
                              },
                            }}
                          >
                            {branchName || '-'}
                          </TableCell>
                          <TableCell
                            sx={{
                              p: '16px',
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              fontFamily: 'Gilroy, sans-serif',
                              fontWeight: 600,
                              fontSize: '16px',
                              color: 'rgba(0, 44, 186, 1)',
                              textAlign: 'center',
                            }}
                          >
                            {branchCode}
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Box>

          <Box sx={styles.actionsContainerStyles}>
            <ActionButtons
              onReject={handleRejectClick}
              onApprove={handleApprove}
              rejectText="Reject"
              approveText="Approve"
            />
          </Box>
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
          title={'Are you sure you want to reject branch merger request?'}
          remarkLabel="Remark"
          remarkPlaceholder="Type your Remark here"
          cancelLabel="Cancel"
          submitLabel="Submit"
        />
      </Container>
    </Box>
  );
};

export default BranchMergerRequest;
