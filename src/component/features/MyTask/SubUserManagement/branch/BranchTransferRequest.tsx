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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ActionButtons from '../../../../common/buttons/ActionButtons';
import {
  containerStyles,
  headerStyles,
  actionsContainerStyles,
  sectionHeaderStyles,
  labelStylesUpdated,
  textFieldStyles,
} from './BranchTransferRequest.styles';
import DecisionModal from '../../../../common/modals/DecisionModal';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { fetchSubUserBranchByID } from './slice/SubUserSingleBranchSlice';
import { StatusSubUserBranch } from './slice/SubUserStatusUpdateBranchSlice';
import { StatusSubUserBranchType } from './types/SubUserSingleBranch';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import {
  fetchCountryCodes,
  Country as CountryCode,
} from '../../../../../utils/countryUtils';

const BranchTransferRequest: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    branchCode: '',
    branchName: '',
    existingRegionCode: '',
    existingRegionName: '',
    newRegionCode: '',
    newRegionName: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    district: '',
    countryCode: '',
    pinCode: '',
    alternatePinCode: '',
    digiPin: '',
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'reject',
    title: '',
    message: '',
    listBefore: [] as string[],
    listAfter: [] as string[],
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  // const [loading, setLoading] = useState(true);
  const [workFlowId, setWorkFlowId] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const [allCountries, setAllCountries] = useState<CountryCode[]>([]);

  // Get userId from Redux auth state
  const userId = useSelector(
    (state: RootState) => state.auth.userDetails?.userId
  );
  // const [details, setDetails] = useState<SubUserModifyBranchRequest | null>();

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
    formData.countryCode === 'IN' || !formData.countryCode;

  useEffect(() => {
    // setLoading(true);
    if (id) {
      // setLoading(true);
      setWorkFlowId(id);
      dispatch(fetchSubUserBranchByID(id))
        .then((action: any) => {
          const responseData = action?.payload?.data;
          const entityDetails = responseData?.entityDetails;
          const workflowDetails = responseData?.workflowDetails;

          setFormData({
            branchName: entityDetails?.branchName || '',
            branchCode: entityDetails?.branchCode || '',
            existingRegionCode: workflowDetails?.oldRegion?.regionCode || '',
            existingRegionName: workflowDetails?.oldRegion?.regionName || '',
            newRegionCode: workflowDetails?.newRegion?.regionCode || '',
            newRegionName: workflowDetails?.newRegion?.regionName || '',
            addressLine1: entityDetails?.address?.line1 || '',
            addressLine2: entityDetails?.address?.line2 || '',
            addressLine3: entityDetails?.address?.line3 || '',
            city: entityDetails?.address?.city || '',
            state: entityDetails?.address?.state || '',
            district: entityDetails?.address?.district || '',
            countryCode: entityDetails?.address?.countryCode || '',
            pinCode: entityDetails?.address?.pinCode || '',
            alternatePinCode: entityDetails?.address?.alternatePinCode || '',
            digiPin: entityDetails?.address?.digiPin || '',
          });
          // setIsFormDisabled(true);
        })
        .catch((error) => {
          console.error('Failed to fetch regions:', error);
        });
    }
    // setLoading(false);
  }, [dispatch, id, setWorkFlowId]);

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Create region request payload
    const regionRequest: StatusSubUserBranchType = {
      type: 'TRANSFER',
    };

    // Dispatch the createRegion action
    dispatch(
      StatusSubUserBranch({
        regionCode: workFlowId,
        regionData: regionRequest,
        statusType: 'approve',
        userId: userId || undefined,
      })
    ).then((action: any) => {
      // Show success modal
      if (action?.payload?.success === true) {
        const branchName = formData?.branchName || 'Branch Name';
        const branchCode = formData?.branchCode || 'Branch Code';
        const oldRegionName = formData?.existingRegionName || 'Region Name';
        const oldRegionCode = formData?.existingRegionCode || 'Region Code';
        const newRegionName = formData?.newRegionName || 'Region Name';
        const newRegionCode = formData?.newRegionCode || 'Region Code';

        const message = `Branch\n\n${branchName} - ${branchCode}\n\nhas been transferred from region\n\n${oldRegionName} - ${oldRegionCode}\n\nto region\n\n${newRegionName} - ${newRegionCode}`;

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
          type: 'reject',
          title: 'Request Failed',
          message:
            typeof action?.payload === 'string'
              ? action?.payload
              : action?.payload?.message ||
                action?.error?.message ||
                'An error occurred',
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
        remark: remark,
      };

      dispatch(
        StatusSubUserBranch({
          regionCode: workFlowId,
          regionData: regionRequest,
          statusType: 'reject',
          userId: userId || undefined,
        })
      )
        .then((action: any) => {
          console.log('Reject action response:', action);
          // Always show rejection message regardless of API response format
          setModalState({
            isOpen: true,
            type: 'reject',
            title: '',
            message: 'Branch Transfer Request Rejected',
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
            message: 'Branch Transfer Request Rejected',
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
      // Redirect to branch transfer list page after approve or reject
      if (modalType === 'approve' || modalType === 'reject') {
        // Use setTimeout to ensure state update completes before navigation
        setTimeout(() => {
          navigate('/re/sub-user-management/branch/list/transfer');
        }, 0);
      }
      return { ...prev, isOpen: false };
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Branch', path: '/re/sub-user-management/branch' },
    { label: 'Transfer', path: '/re/sub-user-management/branch/list/transfer' },
    { label: 'Approval' },
  ];

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={containerStyles}>
        {/* Back Button - Top Right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
            onClick={handleBack}
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
        <Typography sx={headerStyles}>Branch Transfer</Typography>

        {/* Branch Transfer Details Section */}
        {/* <Typography sx={sectionHeaderStyles}>
          Branch Transfer Details
        </Typography> */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>Branch Name</Typography>
            <TextField
              fullWidth
              value={formData.branchName || '-'}
              variant="outlined"
              placeholder="Enter Branch Name"
              sx={textFieldStyles}
              disabled={true}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>Branch Code</Typography>
            <TextField
              fullWidth
              value={formData.branchCode || '-'}
              variant="outlined"
              placeholder="Enter Branch Code"
              sx={textFieldStyles}
              disabled={true}
            />
          </Grid>
        </Grid>

        {/* Address Details Section */}
        <Typography sx={{ ...sectionHeaderStyles, mt: 4 }}>
          Address Details
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>
              Address Line 1 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={formData.addressLine1 || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter Address Line 1"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>Address Line 2</Typography>
            <TextField
              fullWidth
              value={formData.addressLine2 || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter Address Line 2"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>Address Line 3</Typography>
            <TextField
              fullWidth
              value={formData.addressLine3 || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter Address Line 3"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>
              Country <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={getCountryName(formData.countryCode)}
              disabled={true}
              variant="outlined"
              placeholder="Enter Country"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>
              State / UT{' '}
              {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <TextField
              fullWidth
              value={formData.state || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter State / UT"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>
              District{' '}
              {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <TextField
              fullWidth
              value={formData.district || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter District"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>
              City/Town{' '}
              {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <TextField
              fullWidth
              value={formData.city || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter City/Town"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>
              Pin Code{' '}
              {isIndiaSelected && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <TextField
              fullWidth
              value={
                formData.pinCode === '000000'
                  ? 'Other'
                  : formData.pinCode || '-'
              }
              disabled={true}
              variant="outlined"
              placeholder="Enter Pin Code"
              sx={textFieldStyles}
            />
          </Grid>
          {formData.pinCode === '000000' && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={labelStylesUpdated}>
                  Pin Code (in case of others)
                </Typography>
                <TextField
                  fullWidth
                  value={formData.alternatePinCode || '-'}
                  disabled={true}
                  variant="outlined"
                  placeholder="Enter Pin Code (in case of others)"
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={labelStylesUpdated}>Digipin</Typography>
                <TextField
                  fullWidth
                  value={formData.digiPin || '-'}
                  disabled={true}
                  variant="outlined"
                  placeholder="Enter Digipin"
                  sx={textFieldStyles}
                />
              </Grid>
            </>
          )}
          {formData.pinCode !== '000000' && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography sx={labelStylesUpdated}>Digipin</Typography>
              <TextField
                fullWidth
                value={formData.digiPin || '-'}
                disabled={true}
                variant="outlined"
                placeholder="Enter Digipin"
                sx={textFieldStyles}
              />
            </Grid>
          )}
        </Grid>

        {/* Region Details Section */}
        <Typography sx={{ ...sectionHeaderStyles, mt: 5 }}>
          Region Details
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>
              Existing Region Code
            </Typography>
            <TextField
              fullWidth
              value={formData.existingRegionCode || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter Existing Region Code"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>
              Existing Region Name
            </Typography>
            <TextField
              fullWidth
              value={formData.existingRegionName || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter Existing Region Name"
              sx={textFieldStyles}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>New Region Code*</Typography>
            <TextField
              fullWidth
              value={formData.newRegionCode || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter New Region Code"
              sx={textFieldStyles}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography sx={labelStylesUpdated}>New Region Name*</Typography>
            <TextField
              fullWidth
              value={formData.newRegionName || '-'}
              disabled={true}
              variant="outlined"
              placeholder="Enter New Region Name"
              sx={textFieldStyles}
            />
          </Grid>
        </Grid>

        <Box sx={actionsContainerStyles}>
          <ActionButtons
            onReject={handleRejectClick}
            onApprove={handleApprove}
            rejectText="Reject"
            approveText="Approve"
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
          title={'Are you sure you want to reject branch transfer request?'}
          remarkLabel="Remark"
          remarkPlaceholder="Type your Remark here"
          cancelLabel="Cancel"
          submitLabel="Submit"
        />
      </Container>
    </Box>
  );
};

export default BranchTransferRequest;
