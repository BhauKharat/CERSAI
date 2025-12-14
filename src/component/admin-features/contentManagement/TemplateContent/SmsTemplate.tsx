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
  IconButton,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { styles } from '../cms.style';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import {
  StyledTab,
  StyledTabs,
} from '../../myTask/mytaskDash/css/MyTaskDashboard.style';
import TableComponentCms from '../TableComponentCms';
import CloseIcon from '@mui/icons-material/Close';
import SuccessModalCms from '../SuccessModalCms';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

interface TemplateData {
  id: number;
  srNo: number;
  templateName: string;
  bodyText: string;
  modifyDate: string;
}

const SmsTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const [editClick, setEditClick] = useState(false);
  const [editData, setEditData] = useState<TemplateData | null>(null);
  const [bodyText, setBodyText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [isSuccSubmit, setIsSuccSubmit] = useState(false);
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const onOkay = () => {
    setIsSuccSubmit(false);
  };
  const rows = [
    {
      id: 1,
      srNo: 1,
      templateName: 'Entity OTP On Registration/Resume Journey/Journey Break',
      bodyText: 'Use this OTP: {OTP_CODE) for CKYCRR, Thank you. Team CERSAI',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 2,
      srNo: 2,
      templateName: 'Entity User Login With OTP',
      bodyText:
        'Use this OTP: {OTP_CODE} for CKYCRR authentication. Thank you. Team CERSAI',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 3,
      srNo: 3,
      templateName: 'Entity Admin User Profile Update',
      bodyText:
        'Use this OTP: {OTP_CODE} for CKYCRR authentication. Thank you. Team CERSAI',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 4,
      srNo: 4,
      templateName: 'Welcome CKYCRR SMS',
      bodyText:
        'Welcome, {FULL_NAME}! Your CKYCRR registration is complete. Link: {SITE_URL}',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 5,
      srNo: 5,
      templateName: 'Reset Password Link',
      bodyText:
        'Dear {FULL_NAME}, reset your password here: {RESET_LINK}. Team CERSAI',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 6,
      srNo: 6,
      templateName: 'Entity Reject Resume Link',
      bodyText:
        'Dear {FULL_NAME}, your CKYCRR registration was unsuccessful. Address it at {REJECT_RESUME_LINK}.',
      modifyDate: '15/01/2025 05:27 PM',
    },
  ];

  const columns = [
    { field: 'srNo', header: 'Sr.No.' },
    { field: 'templateName', header: 'Template Name' },
    { field: 'bodyText', header: 'Body Text' },
    { field: 'modifyDate', header: 'Modify Date' },
  ];

  // When Edit button clicked
  const handleEdit = (row: TemplateData) => {
    setEditClick(true);
    setEditData(row);
    setBodyText(row.bodyText);
  };

  const handleCloseDialog = () => {
    setEditClick(false);
    setEditData(null);
    setBodyText('');
  };
  const paginatedRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handleBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBodyText(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Updated Template:', { ...editData, bodyText });
    setEditClick(false);
    setIsSuccSubmit(true);
  };

  const applicableTags = [
    '{SITE_URL}',
    '{ENTITY_TYPE}',
    '{OTP_CODE}',
    '{EMAIL_ID}',
    '{INITIATOR_NAME}',
  ];

  return (
    <>
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

        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <StyledTab label="SMS Template" />
          <StyledTab
            label="Email Template"
            onClick={() => navigate('/ckycrr-admin/cms/email-template')}
          />
          <StyledTab
            label="Invoice Template"
            onClick={() => navigate('/ckycrr-admin/cms/invoice-template')}
          />
        </StyledTabs>

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

        {/* Table Section */}
        <TableComponentCms
          columns={columns}
          data={paginatedRows}
          styles={styles}
          showEdit={true}
          showDelete={false}
          showView={false}
          onEditClick={handleEdit}
        />
      </Box>
      <Box display="flex" justifyContent="space-between" sx={{ my: 2, gap: 2 }}>
        <Typography>
          Showing data {paginatedRows.length} of {rows.length}
        </Typography>

        <Pagination
          count={Math.ceil(rows.length / 5)} // 5 items per page
          page={currentPage}
          onChange={handlePageChange}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              components={{
                previous: () => (
                  <Button
                    variant="outlined"
                    sx={styles.paginationNextPrevButton}
                  >
                    <KeyboardArrowLeftIcon /> Previous
                  </Button>
                ),
                next: () => (
                  <Button
                    variant="outlined"
                    sx={styles.paginationNextPrevButton}
                  >
                    Next <KeyboardArrowRightIcon />
                  </Button>
                ),
              }}
              sx={{
                mx: 0.5,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 44, 186, 1)',
                  color: 'white',
                  fontWeight: 'bold',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(0, 44, 186, 0.85)',
                },
              }}
            />
          )}
        />
      </Box>
      {/* ===== DIALOG BOX ===== */}
      <Dialog
        open={editClick}
        onClose={handleCloseDialog}
        maxWidth={false} // disable fixed width presets
        sx={{
          backdropFilter: 'blur(5px)',
          '& .MuiDialog-paper': {
            ...styles.dialogBox, // 👈 use external style here
            margin: 'auto', // center dialog
            backgroundColor: '#F8F9FD',
          },
        }}
      >
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
        <DialogTitle sx={styles.dialogTitle}>
          {editData?.templateName || 'Edit Template'}
        </DialogTitle>

        <DialogContent>
          <Typography variant="subtitle1">Body Text :</Typography>

          <TextField
            multiline
            rows={6}
            fullWidth
            value={bodyText}
            onChange={handleBodyChange}
            variant="outlined"
            placeholder="Enter body text here..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'right',
              mt: 0.5,
              color: 'gray',
            }}
          >
            {bodyText.length}/500
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ mt: 3, mb: 1, fontWeight: 500 }}
          >
            Applicable Tags :
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {applicableTags.map((tag, index) => (
              <Box
                key={index}
                sx={{
                  border: '1px solid #E3E8FF',
                  borderRadius: '4px',
                  px: 1.5,
                  backgroundColor: '#E3E8FF',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            sx={styles.btncnl}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={styles.btnsbmt}
            onClick={handleSubmit}
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
    </>
  );
};

export default SmsTemplate;
