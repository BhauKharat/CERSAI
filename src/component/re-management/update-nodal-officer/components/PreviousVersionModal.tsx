/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, styled, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';



type Props = {
  open: boolean,
  onClose?: () => void
  children: React.ReactNode,
}

const DialogMainWrapperBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}))


const HeadTypo = styled(Typography)(({ theme }) => ({

}))

export default function PreviousVersionModal({ open, onClose, children }: Props) {
  return (
    <React.Fragment>
      <Dialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={onClose}
      >
        <DialogTitle>

          <DialogMainWrapperBox>
            <HeadTypo>
              Previous Version
            </HeadTypo>

            <CloseRoundedIcon onClick={onClose} sx={{cursor:'pointer'}}/>
          </DialogMainWrapperBox>

        </DialogTitle>
        <DialogContent>
          {children}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
