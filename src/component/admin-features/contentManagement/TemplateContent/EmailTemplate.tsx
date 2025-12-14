/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import JoditEditor from 'jodit-react';
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
  Select,
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
import { KeyboardArrowDown } from '@mui/icons-material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
interface TemplateData {
  id: number;
  srNo: number;
  templateName: string;
  bodyText: string;
  modifyDate: string;
}

const EmailTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(1);
  const [editClick, setEditClick] = useState(false);
  const [editData, setEditData] = useState<TemplateData | null>(null);
  const [isSuccSubmit, setIsSuccSubmit] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
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
      bodyText: 'OTP Verification | CKYCRR',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 2,
      srNo: 2,
      templateName: 'Registration Success- Reporting Entity',
      bodyText: 'OTP Verification | CKYCRR',
      modifyDate: '15/01/2025 05:27 PM',
    },
    {
      id: 3,
      srNo: 3,
      templateName: 'Entitiy Journey Break Notification',
      bodyText: 'Gentle Reminder: Complete Your Registration',
      modifyDate: '15/01/2025 05:27 PM',
    },
  ];

  const columns = [
    { field: 'srNo', header: 'Sr.No.' },
    { field: 'templateName', header: 'Template Name' },
    { field: 'bodyText', header: 'Body Text' },
    { field: 'modifyDate', header: 'Modify Date' },
  ];

  const handleEdit = (row: TemplateData) => {
    setEditClick(true);
    setEditData(row);
    setEditorContent(row.bodyText);
  };

  const handleCloseDialog = () => {
    setEditClick(false);
    setEditData(null);
    setEditorContent('');
  };

  const handleSubmit = () => {
    console.log('Updated Template:', {
      ...editData,
      bodyText: editorContent,
    });
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

  const config = {
    readonly: false,
    placeholder: 'email template..',
    height: 280,
    minHeight: 250,
    toolbar: true,
    toolbarAdaptive: false,
    showCharsCounter: false,
    showWordsCounter: false,
    statusbar: false,
    uploader: {
      insertImageAsBase64URI: true,
    },
    image: {
      dialogWidth: 800,
      openOnDblClick: true,
      editSrc: true,
      useImageEditor: false,
      editTitle: true,
      editAlt: true,
      editLink: true,
      editSize: true,
      showPreview: true,
      selectImageAfterClose: true,
    },
    link: {
      noFollowCheckbox: true,
      openInNewTabCheckbox: true,
    },
    buttons: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'font',
      'fontsize',
      '|',
      'brush',
      '|',
      'ul',
      'ol',
      '|',
      'outdent',
      'indent',
      '|',
      'left',
      'center',
      'right',
      'justify',
      '|',
      'link',
      'image',
      '|',
      'table',
      '|',
      'hr',
      '|',
      'undo',
      'redo',
      '|',
      {
        name: 'print',
        icon: 'print',
        tooltip: 'Print',
        exec: function (editor: any) {
          const content = editor.value;
          const printWindow = window.open('', '_blank');

          // Check if window was opened successfully
          if (!printWindow) {
            alert(
              'Popup window was blocked. Please allow popups for this site to use the print feature.'
            );
            return;
          }

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Print</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 40px;
                  line-height: 1.6;
                  color: #333;
                }
                img { max-width: 100%; height: auto; }
                table { border-collapse: collapse; width: 100%; margin: 15px 0; }
                table, th, td { border: 1px solid #ddd; }
                th, td { padding: 10px; text-align: left; }
                th { background-color: #f5f5f5; }
                ul, ol { margin: 15px 0; padding-left: 30px; }
                h1, h2, h3, h4, h5, h6 { margin: 20px 0 10px 0; }
                p { margin: 10px 0; }
                @media print {
                  body { margin: 0.5in; }
                }
              </style>
            </head>
            <body>
              ${content}
            </body>
            </html>
          `);
          printWindow.document.close();

          // Safe usage with null check
          printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
          };
        },
      },
      '|',
      'source',
    ],
    iframe: true,
    spellcheck: true,
  } as any;
  const paginatedRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
  };

  const insertTag = (tag: string) => {
    const newContent = editorContent + ' ' + tag;
    setEditorContent(newContent);
  };

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
          <StyledTab
            label="SMS Template"
            onClick={() => navigate('/ckycrr-admin/cms/template')}
          />
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
          data={rows}
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
      <Dialog
        open={editClick}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus={true} // This fixes the focus issue
        disableAutoFocus={true}
        sx={{
          backdropFilter: 'blur(5px)',
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            padding: '15px',
            width: '700px',
            backgroundColor: '#F8F9FD',
          },
        }}
      >
        <DialogTitle sx={{ position: 'relative', padding: '15px 24px' }}>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 600,
              mt: 2,
            }}
          >
            {editData?.templateName || 'Edit Template'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Subject :
            </Typography>
            <Select
              id="subject"
              native
              fullWidth
              name="subject"
              sx={styles.selectStyles}
              IconComponent={KeyboardArrowDown}
            >
              <option value="">Select</option>
              <option value="otp">OTP Verification</option>
              <option value="registration">Registration Successfull</option>
            </Select>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                //border: '1px solid #e0e0e0',
                // borderRadius: '2px',
                padding: '20px',
                backgroundColor: 'white',
                '& .jodit-container': {
                  // borderRadius: '2px',
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden',
                },
                '& .jodit-toolbar__box': {
                  borderTopLeftRadius: '2px',
                  borderTopRightRadius: '2px',
                  backgroundColor: '#f5f5f5',
                  borderBottom: '1px solid #e0e0e0',
                },
                '& .jodit-wysiwyg': {
                  minHeight: '200px',
                  padding: '16px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: '1.6',
                  borderRadius: '2px',
                },
                '& .jodit-status-bar': {
                  borderBottomLeftRadius: '2px',
                  borderBottomRightRadius: '2px',
                  borderTop: '1px solid #e0e0e0',
                },
                '& .jodit-dialog': {
                  zIndex: 9999,
                },
              }}
            >
              <JoditEditor
                value={editorContent}
                config={config}
                onBlur={handleEditorChange}
              />
            </Box>
          </Box>

          {/* <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'right',
              mt: 0.5,
              color: characterCount > 500 ? 'error.main' : 'gray',
            }}
          >
            {characterCount}/500
          </Typography> */}

          <Typography
            variant="subtitle1"
            sx={{ mt: 3, mb: 1, fontWeight: 500 }}
          >
            Applicable Tags :
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {applicableTags.map((tag, index) => (
              <Box
                key={index}
                onClick={() => insertTag(tag)}
                sx={{
                  borderRadius: '4px',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '14px',
                  backgroundColor: '#E3E8FF',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#D0D7FF',
                  },
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: '16px 24px',
            gap: 2,
            justifyContent: 'center',
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

export default EmailTemplate;
