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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ActionButtons } from '../../../../common/buttons/ActionButtons';
import {
  containerStyles,
  headerStyles,
  retainedRowStyles,
  retainedLabelStyles,
  retainedTextFieldStyles,
  mergingHeaderStyles,
} from './RegionMergerRequest.styles';
import { DecisionModal } from '../../../../common/modals/DecisionModal';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import { StatusSubUserRegionType } from './types/SubUserSingleRegion';
import { StatusSubUserRegion } from './slice/SubUserStatusUpdateRegionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { SubUserModifyRegionRequest } from './types/SubUserCreateRegion';
import { fetchSubUserRegionByCode } from './slice/SubUserSingleRegionSlice';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import {
  fetchCountryCodes,
  Country as CountryCode,
} from '../../../../../utils/countryUtils';

const formActionsContainer = {
  mt: 5,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 2,
};

const RegionMergerRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // Get userId from Redux store instead of localStorage
  const userId = useSelector(
    (state: RootState) => state.auth.userDetails?.userId || ''
  );

  const [loading, setLoading] = useState(true);
  const [workFlowId, setWorkFlowId] = useState('');
  const [details, setDetails] = useState<SubUserModifyRegionRequest | null>();
  const [allCountries, setAllCountries] = useState<CountryCode[]>([]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'reject',
    title: '',
    message: '',
    listBefore: [] as string[],
    listAfter: [] as string[],
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Fetch country codes on mount
  useEffect(() => {
    fetchCountryCodes()
      .then((countries) => {
        setAllCountries(countries);
      })
      .catch((error) => {
        console.error('Failed to load country codes:', error);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    if (id) {
      setLoading(true);
      setWorkFlowId(id);
      dispatch(fetchSubUserRegionByCode(id))
        .then((action: any) => {
          const responseData = action?.payload?.data;
          console.log('Region Details by ID:---', responseData);

          // Extract target region and source regions from workflowDetails
          const targetRegion = responseData?.workflowDetails?.targetRegion;
          const sourceRegions =
            responseData?.workflowDetails?.sourceRegions || [];
          const entityDetails = responseData?.entityDetails;

          setDetails({
            regionName: targetRegion?.regionName || '',
            regionCode: targetRegion?.regionCode || '',
            sourceRegionCodes: sourceRegions,
            address: {
              line1: entityDetails?.address?.line1 || '',
              line2: entityDetails?.address?.line2 || '',
              line3: entityDetails?.address?.line3 || '',
              cityTown: entityDetails?.address?.city || '',
              state: entityDetails?.address?.state || '',
              countryCode: entityDetails?.address?.countryCode || '',
              pinCode: entityDetails?.address?.pinCode || '',
              district: entityDetails?.address?.district || '',
              alternatePinCode: entityDetails?.address?.alternatePinCode || '',
              digiPin: entityDetails?.address?.digiPin || '',
            },
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
  }, [dispatch, id, setWorkFlowId]);

  if (loading || !details) {
    return (
      <Container maxWidth={false} sx={{ py: 6 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  // Get country name from country code
  // Check if country is India
  const isIndiaSelected =
    details?.address?.countryCode === 'IN' || !details?.address?.countryCode;

  const getCountryName = (countryCode: string) => {
    const country = allCountries.find(
      (c: CountryCode) => c.code === countryCode
    );
    return country ? country.name : countryCode;
  };

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      // Create region request payload
      const regionRequest: StatusSubUserRegionType = {
        type: 'MERGE',
      };

      // Dispatch the createRegion action
      dispatch(
        StatusSubUserRegion({
          regionCode: workFlowId,
          regionData: regionRequest,
          statusType: 'approve',
          userId: userId,
        })
      ).then((action: any) => {
        // Show success modal
        console.log('Action:---', action);
        if (action?.payload?.success === true) {
          // Format source regions (merging regions)
          const sourceRegionsList =
            details.sourceRegionCodes
              ?.map(
                (region: any) =>
                  `${region.regionName || ''} - ${region.regionCode || ''}`
              )
              .join('\n') || '';

          // Target region (retained region)
          const targetRegionDisplay = `${details.regionName || 'Region Name'} - ${details.regionCode || 'Region Code'}`;

          // Build the message in the required format
          const message = `Region\n\n${sourceRegionsList}\n\nhas been merged successfully into\n\n${targetRegionDisplay}`;

          setModalState({
            isOpen: true,
            type: 'approve',
            title: '',
            message: message,
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

  const handleRejectConfirm = async (remark: any) => {
    try {
      // Create region request payload
      const regionRequest: StatusSubUserRegionType = {
        type: 'MERGE',
        reason: remark,
      };

      dispatch(
        StatusSubUserRegion({
          regionCode: workFlowId,
          regionData: regionRequest,
          statusType: 'reject',
          userId: userId,
        })
      ).then((action: any) => {
        if (action?.payload?.success === true) {
          setModalState({
            isOpen: true,
            type: 'reject',
            title: '',
            message: 'Region Merge Request Rejected',
            listBefore: [],
            listAfter: [],
          });
        } else {
          setModalState({
            isOpen: true,
            type: 'reject',
            title: '',
            message: 'Region Merge Request Rejected',
            listBefore: [],
            listAfter: [],
          });
        }
        // Show success modal after rejection
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
    // Redirect to region list/merge page after modal is closed (for both approve and reject)
    if (modalType === 'approve' || modalType === 'reject') {
      navigate('/re/sub-user-management/region/list/merge');
    }
  };

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Region', path: '/re/sub-user-management/region' },
    { label: 'Merge', path: '/re/sub-user-management/region/list/merge' },
    { label: 'Approval' },
  ];

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={containerStyles}>
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

        <Typography sx={headerStyles}>Region Merger Details</Typography>

        <Box sx={retainedRowStyles}>
          <Box sx={{ width: 350 }}>
            <Typography sx={retainedLabelStyles}>
              Retained – Region Name
            </Typography>
            <TextField
              value={details.regionName || '-'}
              placeholder="Enter Region Name"
              disabled={true}
              variant="outlined"
              sx={retainedTextFieldStyles}
            />
          </Box>
          <Box sx={{ width: 350 }}>
            <Typography sx={retainedLabelStyles}>
              Retained – Region Code
            </Typography>
            <TextField
              value={details.regionCode || '-'}
              placeholder="Enter Region Code"
              disabled={true}
              variant="outlined"
              sx={retainedTextFieldStyles}
            />
          </Box>
        </Box>

        {/* Address Details Section */}
        {details.address && (
          <>
            <Typography sx={{ ...mergingHeaderStyles, mt: 4 }}>
              Address Details
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>Address Line 1</Typography>
                <TextField
                  fullWidth
                  value={details.address.line1 || '-'}
                  placeholder="Enter Address Line 1"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>Address Line 2</Typography>
                <TextField
                  fullWidth
                  value={details.address.line2 || '-'}
                  placeholder="Enter Address Line 2"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>Address Line 3</Typography>
                <TextField
                  fullWidth
                  value={details.address.line3 || '-'}
                  placeholder="Enter Address Line 3"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>Country</Typography>
                <TextField
                  fullWidth
                  value={getCountryName(details.address.countryCode) || '-'}
                  placeholder="Enter Country"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>
                  State / UT{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  fullWidth
                  value={details.address.state || '-'}
                  placeholder="Enter State"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>
                  District{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  fullWidth
                  value={details.address.district || '-'}
                  placeholder="Enter District"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>
                  City/Town{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  fullWidth
                  value={details.address.cityTown || '-'}
                  placeholder="Enter City/Town"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>
                  Pin Code{' '}
                  {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  fullWidth
                  value={
                    details.address.pinCode === '000000'
                      ? 'Other'
                      : details.address.pinCode
                  }
                  placeholder="Enter Pin Code"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
              {(details.address.pinCode === '000000' ||
                details.address.pinCode === 'other') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={retainedLabelStyles}>
                    Pin Code (in case of others)
                  </Typography>
                  <TextField
                    fullWidth
                    value={details.address.alternatePinCode || '-'}
                    placeholder="Enter Pin Code"
                    disabled={true}
                    variant="outlined"
                    sx={retainedTextFieldStyles}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={retainedLabelStyles}>Digipin</Typography>
                <TextField
                  fullWidth
                  value={details.address.digiPin || '-'}
                  placeholder="Enter Digipin"
                  disabled={true}
                  variant="outlined"
                  sx={retainedTextFieldStyles}
                />
              </Grid>
            </Grid>
          </>
        )}

        <Typography sx={{ ...mergingHeaderStyles, mt: 5 }}>
          Merging Region Details
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
                  Sr. No.
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
                  Region Name
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
                  Region Code
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details?.sourceRegionCodes?.map((region: any, index: number) => (
                <TableRow
                  key={region.regionId || index}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
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
                    {index + 1}
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
                    {region.regionName}
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
                    {region.regionCode}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box sx={formActionsContainer}>
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
          title="Are you sure you want to reject region merger request ?"
          remarkLabel="Remark"
          remarkPlaceholder="Type your Remark here"
          cancelLabel="Cancel"
          submitLabel="Submit"
        />
      </Container>
    </Box>
  );
};

export default RegionMergerRequest;
