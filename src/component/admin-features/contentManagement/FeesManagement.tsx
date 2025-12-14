/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styles } from './cms.style';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import TableComponentCms from './TableComponentCms';
import SuccessModalCms from './SuccessModalCms';

// Define interface for the data
interface FeeData {
  id: number;
  srNo: number;
  parameter: string;
  chargePerRecord: string;
  modifyDate: string;
}

const FeesManagement: React.FC = () => {
  const navigate = useNavigate();

  const rows: FeeData[] = [
    {
      id: 1,
      srNo: 1,
      parameter: 'Creation of New KYC Record',
      chargePerRecord: '0.50 (Incentive)',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 2,
      srNo: 2,
      parameter: 'First Time download of KYC Record',
      chargePerRecord: '2.25',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 3,
      srNo: 3,
      parameter: 'Subsequent Download of KYC record by the same RE',
      chargePerRecord: '1.00',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 4,
      srNo: 4,
      parameter: 'Update of KYC Record',
      chargePerRecord: '0.25 (Incentive)',
      modifyDate: '15/01/2025 05:27 PM',
    },
  ];

  const columns = [
    { field: 'srNo', header: 'Sr.No.' },
    { field: 'parameter', header: 'Parameter' },
    { field: 'chargePerRecord', header: 'Charge Per Record (INR)' },
    { field: 'modifyDate', header: 'Modify Date' },
  ];

  const [editClick, setEditClick] = useState(false);
  const [editData, setEditData] = useState<FeeData | null>(null);
  const [isSuccSubmit, setIsSuccSubmit] = useState(false);

  const handleEdit = (row: any, index: number) => {
    console.log('Edit row:', row, index);
    setEditClick(true);
    setEditData(row);
  };

  const handleCloseDialog = () => {
    setEditClick(false);
    setEditData(null);
  };
  const onOkay = () => {
    setIsSuccSubmit(false);
  };
  const submit = () => {
    setEditClick(false);
    setIsSuccSubmit(true);
  };
  return (
    <Box sx={styles.container}>
      <Box sx={styles.backButtonContainer}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: 'black' }} />}
          onClick={() => navigate(-1)}
          sx={styles.backButton}
          style={{ textTransform: 'none' }}
        >
          Back
        </Button>
      </Box>

      {/* Search Section */}
      <Box sx={styles.searchContainer}>
        <Typography sx={styles.searchLabel}>Search</Typography>
        <Box>
          <TextField
            placeholder="Type to search"
            size="small"
            sx={styles.searchField}
          />
          <Button variant="contained" sx={styles.searchButton}>
            Search
          </Button>
        </Box>
      </Box>
      <br />
      <Divider sx={{ my: 1 }} />

      <TableComponentCms
        columns={columns}
        data={rows}
        styles={styles}
        showEdit={true}
        showDelete={false}
        showView={false}
        onEditClick={handleEdit}
      />

      <Dialog
        open={editClick}
        onClose={handleCloseDialog}
        maxWidth={false}
        sx={{
          backdropFilter: 'blur(5px)',
          '& .MuiDialog-paper': {
            borderRadius: '4px',
            padding: '16px',
            width: '700px',
          },
        }}
      >
        <DialogTitle sx={{ padding: '8px 15px' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}
          >
            <IconButton
              onClick={handleCloseDialog}
              sx={{
                color: '#666',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography sx={styles.dialogueTitleFee}>
            {editData?.parameter}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '10px 10px', textAlign: 'center' }}>
          <TableContainer component={Paper} sx={styles.tableContainer}>
            <Table sx={styles.table}>
              <TableHead>
                <TableRow sx={styles.tableHead}>
                  <TableCell sx={styles.tableHeadCell}>Sr.No.</TableCell>
                  <TableCell sx={styles.tableHeadCell}>Parameter</TableCell>

                  <TableCell sx={styles.tableHeadCell}>
                    Fees per record (INR)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow key={editData?.id} sx={styles.tableRow}>
                  <TableCell sx={styles.tableCell}>
                    1
                    <Box sx={styles.verticalSeparator} />
                  </TableCell>

                  <TableCell sx={styles.tableCell}>
                    {editData?.parameter}
                    <Box sx={styles.verticalSeparator} />
                  </TableCell>
                  <TableCell>
                    <TextField
                      placeholder="Enter Amount"
                      sx={styles.inputStyles}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            sx={{
              width: '100%',
              py: '8px',
              border: '1px solid #002CBA',
              color: '#002CBA',
            }}
            style={{ textTransform: 'none' }}
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            sx={{
              width: '100%',
              py: '8px',
              backgroundColor: '#002CBA',
              color: 'white',
            }}
            style={{ textTransform: 'none' }}
            onClick={submit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <SuccessModalCms
        isOpen={isSuccSubmit}
        onClose={() => setIsSuccSubmit(false)}
        title={'Submitted for approval'}
        onOkay={onOkay}
      />
    </Box>
  );
};

export default FeesManagement;
