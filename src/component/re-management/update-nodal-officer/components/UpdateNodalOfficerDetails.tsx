/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  styled,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import NodalOfficerDetailsForm, {
  ChildFormRef,
} from './NodalOfficerDetailsForm';
import InstitutionalAdminForm from './InstitutionalAdminForm';
import PreviousVersionModal from './PreviousVersionModal';
import FormAccordion, { FormAccordionRef } from './FormAccordion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import { IResponseMsg, resetState } from '../slice/updateOfficerSlice';
import { nodalOfficePreview } from '../thunk/nodalOfficerPreview';
import { updateNodalOfficerThunk } from '../thunk/updateNodalOfficerThunk';
import ConfirmationModal from '../../../../component/admin-features/subUser/ConfirmationModal/ConfirmationModal';

const MainWrapperBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  fontFamily: 'Gilroy',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  fontSize: '16px',
  marginBottom: theme.spacing(3),
  color: 'black',
  textTransform: 'none',
  [theme.breakpoints.down('sm')]: {
    fontSize: '14px',
  },
}));

const PreviousVersionBox = styled(Box)(({ theme }) => ({}));

const PreviousVersionTypo = styled(Typography)(({ theme }) => ({
  color: 'rgba(0, 44, 186, 1)',
  fontSize: '16px',
  fontFamily: 'Gilroy',
  fontWeight: 500,
  textDecoration: 'underline',
  cursor: 'pointer',
  [theme.breakpoints.down('sm')]: {
    fontSize: '14px',
  },
}));

const ActionWrapperBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '20px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
}));

const BaseActionButton = styled(Button)(({ theme }) => ({
  padding: '10px 8px',
  minWidth: '200px',
  textTransform: 'none',
  borderRadius: '4px',
  fontWeight: 500,
  fontSize: '16px',
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
    fontSize: '14px',
  },
}));

export const ActionButton = styled(BaseActionButton)(({ theme }) => ({
  border: '1px solid rgba(0, 44, 186, 1)',
  color: 'rgba(0, 44, 186, 1)',
}));

export const FilledActionButton = styled(BaseActionButton)(({ theme }) => ({
  background: 'rgba(0, 44, 186, 1)',
  color: '#fff',
}));

const HeadTypo = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontFamily: 'Gilroy',
  fontWeight: 500,
  marginBottom: '20px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '16px',
    marginBottom: '16px',
  },
}));

export interface IAccordionMenu {
  label: string;
  formComponent: React.ReactNode;
  ref?: React.RefObject<ChildFormRef | null>;
}

const UpdateNodalOfficerDetails = () => {
  const accordionRef = useRef<FormAccordionRef>(null);

  const params = useParams();

  const { nodal_id } = params;

  const dispatch = useDispatch<AppDispatch>();

  const { data } = useSelector((state: RootState) => state.nodalOfficerPreview);

  const [snackBarMessage, setSnackBarMessage] = useState<string>('');

  useEffect(() => {
    if (nodal_id) {
      dispatch(nodalOfficePreview(nodal_id));
    }
  }, [dispatch, nodal_id]);

  useEffect(() => {
    dispatch(resetState());
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  const nodalFormRef = useRef<ChildFormRef>(null);
  const institutionalFirstFormRef = useRef<ChildFormRef>(null);

  const institutionSecondFormRef = useRef<ChildFormRef>(null);

  const navigate = useNavigate();

  const [previousVersion, setPreviousVersion] = useState<boolean>(false);

  const handlePreviousVersion = () => {
    setPreviousVersion(true);
  };

  const {
    error,
    loading,
    data: updateResponse,
  } = useSelector((state: RootState) => state.updateOfficer);

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);

  useEffect(() => {
    if (error && !(error as IResponseMsg).success) {
      setSnackBarMessage((error as IResponseMsg).errorMessage);
      setSnackbarOpen(true);
    }
  }, [error]);

  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);

  const handleApprove = async () => {
    const submitResult = await accordionRef.current?.submitAll();
    if (!submitResult) {
      return;
    }

    if (submitResult && !submitResult.valid) {
      return;
    }

    if(!nodal_id) {
      setSnackBarMessage('Nodal ID is missing');
      setSnackbarOpen(true);
      return;
    }



    const formData = new FormData();

    const officialDataJson: {
      reportingEntityId: string;
      nodalOfficer: Record<string, any>;
      iaus: any[];
    } = {
      reportingEntityId: nodal_id,
      nodalOfficer: {},
      iaus: [],
    };

    if (
      typeof submitResult.data === 'object' &&
      Array.isArray(submitResult.data) &&
      submitResult.data.length === 3
    ) {
      const nodalOfficer = submitResult.data[0] ?? {};

      const iaus = (submitResult.data ?? [])
        .slice(1)
        .flatMap((item) => item ?? []);

      if (nodalOfficer) {
        const {
          board_resolution,
          certified_copy,
          photo_id_card,
          photo_id_card_file,
          board_resolution_file,
          certified_copy_file,
          ...rest
        } = nodalOfficer;

        officialDataJson['nodalOfficer'] = {
          ...rest,
        };

        if (board_resolution) {
          formData.append('no_board_resolution', board_resolution);
        }

        if (certified_copy) {
          formData.append('no_certified_poi', certified_copy);
        }

        if (photo_id_card) {
          formData.append('no_certified_photoIdentity', photo_id_card);
        }
      }

      if (iaus?.length) {
        iaus.forEach((item, index) => {
          const {
            authorisation_letter,
            proof_of_identity_card,
            proof_of_identity,
            ...rest
          } = item;

          officialDataJson['iaus'].push(rest);

          if (authorisation_letter) {
            formData.append(
              `iau_${index === 0 ? 'one' : 'two'}_authorization_letter`,
              authorisation_letter
            );
          }

          if (proof_of_identity) {
            formData.append(
              `iau_${index === 0 ? 'one' : 'two'}_certified_poi`,
              proof_of_identity
            );
          }

          if (proof_of_identity_card) {
            formData.append(
              `iau_${index === 0 ? 'one' : 'two'}_certified_photoIdentity`,
              proof_of_identity_card
            );
          }
        });
      }
    }

    formData.append('officerDataJson', JSON.stringify(officialDataJson));

    dispatch(updateNodalOfficerThunk({ formData }))
  };

  const accordionMenu: IAccordionMenu[] = [
    {
      label: 'Nodal Officer Details',
      formComponent: <NodalOfficerDetailsForm ref={nodalFormRef} />,
      ref: nodalFormRef,
    },
    {
      label: 'Institutional Admin User Details 01',
      formComponent: (
        <InstitutionalAdminForm
          ref={institutionalFirstFormRef}
          initialValues={data?.data.adminOneDetails}
          iau={'ONE'}
        />
      ),
      ref: institutionalFirstFormRef,
    },
    {
      label: 'Instituional Admin User Details 02',
      formComponent: (
        <InstitutionalAdminForm
          ref={institutionSecondFormRef}
          initialValues={data?.data.adminTwoDetails}
          iau={'TWO'}
        />
      ),
      ref: institutionSecondFormRef,
    },
  ];

  useEffect(() => {
    if (loading === 'succeeded' && (updateResponse?.success ?? true)) {
      setConfirmationOpen(true);
    }
  }, [loading, updateResponse]);

  return (
    <React.Fragment>
      {loading === 'pending' && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress size={60} />
        </Box>
      )}

      <MainWrapperBox>
        <BackButton
          startIcon={<ArrowBackIcon sx={{ color: 'black' }} />}
          onClick={() => navigate(-1)}
        >
          Back
        </BackButton>

        <FormAccordion ref={accordionRef} accordionMenu={accordionMenu} />

        <PreviousVersionBox>
          <PreviousVersionTypo onClick={handlePreviousVersion}>
            View Previous Version
          </PreviousVersionTypo>
        </PreviousVersionBox>

        <ActionWrapperBox>
          <FilledActionButton onClick={handleApprove} disabled={loading === 'pending'}>
            Submit
          </FilledActionButton>
        </ActionWrapperBox>

        <PreviousVersionModal
          open={previousVersion}
          onClose={() => setPreviousVersion(false)}
        >
          {' '}
          <FormAccordion accordionMenu={accordionMenu} />
        </PreviousVersionModal>
      </MainWrapperBox>

      <ConfirmationModal
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        message={
          updateResponse?.data?.status
            ? `Request ${updateResponse.data.status}!`
            : 'Nodal Officer updated successfully!'
        }
        onConfirm={() => setConfirmationOpen(false)}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={'error'}
          sx={{ width: '100%' }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default UpdateNodalOfficerDetails;