import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  Box,
  TextField,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
  // Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../../redux/store';
import {
  fetchRegionBranches,
  resetState,
  deactivateRegion,
  resetDeactivateState,
  clearDeactivateError,
} from '../slice/deactivationStatsSlice';
import ErrorModal from '../../ErrorModal/ErrorModal';
import {
  dialogPaperStyles,
  closeButtonStyles,
  noteTextStyles,
  // sectionTitleStyles,
  // tableContainerStyles,
  // tableStyles,
  // tableHeaderStyles,
  warningIconContainerStyles,
  warningIconStyles,
  warningTextStyles,
  remarkLabelStyles,
  dialogActionsStyles,
  cancelButtonStyles,
  submitButtonStyles,
  requiredFieldStyles,
  dialogContentStyles,
  paddingBoxStyles,
  // sectionContentStyles,
  // tableRowStyles,
  captionTextStyles,
  warningSectionStyles,
} from './DeactivateRegionModal.styles';

interface DeactivateRegionModalProps {
  open: boolean;
  onClose: () => void;
  regionCode: string;
}

const DeactivateRegionModal: React.FC<DeactivateRegionModalProps> = ({
  open,
  onClose,
  regionCode,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    loading,
    data,
    // error,
    deactivateLoading,
    deactivateSuccess,
    deactivateError,
  } = useSelector((state: RootState) => state.deactivationStats);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [remark, setRemark] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Fetch region branches when modal opens
  useEffect(() => {
    if (open && regionCode) {
      dispatch(fetchRegionBranches(regionCode));
    }
  }, [open, regionCode, dispatch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      dispatch(resetState());
      dispatch(resetDeactivateState());
      setRemark('');
      setLocalError(null);
      setShowErrorModal(false);
    }
  }, [open, dispatch]);

  // Handle deactivate error - show error modal
  useEffect(() => {
    if (deactivateError) {
      setShowErrorModal(true);
    }
  }, [deactivateError]);

  // Handle deactivate success
  useEffect(() => {
    if (deactivateSuccess) {
      // Close modal and reset states after successful deactivation
      onClose();
    }
  }, [deactivateSuccess, onClose]);

  // const branches = data?.branchUserCounts || [];
  // Use the exact field names from API response: totalBranchesCount and totalUser
  const totalUsers = data?.totalUser ?? 0;
  const totalBranches = data?.totalBranchesCount ?? 0;

  const handleSubmit = async () => {
    if (!remark.trim()) {
      setLocalError('Reason is required');
      return;
    }

    // if (remark.length < 10) {
    //   setLocalError('Reason must be at least 10 characters');
    //   return;
    // }

    if (remark.length > 500) {
      setLocalError('Reason must be less than 500 characters');
      return;
    }

    // Dispatch the deactivate region action
    dispatch(
      deactivateRegion({
        regionCode,
        reason: remark,
        remark: remark,
        userId: userDetails?.userId || '',
      })
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (
            deactivateLoading ||
            reason === 'backdropClick' ||
            reason === 'escapeKeyDown'
          ) {
            return;
          }
          onClose();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: dialogPaperStyles,
        }}
      >
        <IconButton
          onClick={onClose}
          disabled={deactivateLoading}
          size="small"
          sx={closeButtonStyles}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <DialogContent sx={dialogContentStyles}>
          <Box sx={warningIconContainerStyles}>
            <Box sx={warningIconStyles}>!</Box>
            <Typography variant="body1" sx={warningTextStyles}>
              Region De-activation Details
            </Typography>
          </Box>

          <Box sx={paddingBoxStyles}>
            <Typography variant="body2" sx={noteTextStyles}>
              Note: De-activating this region will automatically lead to
              de-activation of associated {totalBranches} Branches &{' '}
              {totalUsers} Users.
            </Typography>
          </Box>

          {/* <Box sx={sectionContentStyles}>
            <Typography variant="subtitle2" sx={sectionTitleStyles}>
              List of Associated Branches and Number of Users
            </Typography>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerStyles}
            >
              <Table size="small" sx={tableStyles}>
                <TableHead>
                  <TableRow sx={tableHeaderStyles}>
                    <TableCell>Sr. No.</TableCell>
                    <TableCell align="center">Branch Name</TableCell>
                    <TableCell align="right">Number of Users</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{ color: 'error.main' }}
                      >
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : branches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No branches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    branches.map((branch, index) => (
                      <TableRow
                        key={`${branch.branchName}-${index}`}
                        sx={tableRowStyles}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell align="center">
                          {branch.branchName}
                        </TableCell>
                        <TableCell align="right">{branch.userCount}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box> */}

          <Box sx={warningSectionStyles}>
            <Typography variant="subtitle2" sx={remarkLabelStyles}>
              Remark <span style={requiredFieldStyles}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder="Type remark here"
              variant="outlined"
              error={!!localError}
              helperText={localError || ' '}
              disabled={deactivateLoading}
              inputProps={{ maxLength: 500 }}
            />
            <Typography
              variant="caption"
              display="block"
              textAlign="right"
              sx={captionTextStyles}
            >
              {remark.length}/500 characters
              {/* (minimum 10 characters) */}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={dialogActionsStyles}>
          <Button
            onClick={onClose}
            disabled={deactivateLoading}
            variant="outlined"
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!remark.trim() || deactivateLoading || loading}
            variant="contained"
            color="error"
            sx={submitButtonStyles}
          >
            {deactivateLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <ErrorModal
        open={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          dispatch(clearDeactivateError());
        }}
        primaryMessage={
          deactivateError || 'An error occurred while deactivating the region'
        }
        buttonText="Okay"
      />
    </>
  );
};

export default DeactivateRegionModal;
