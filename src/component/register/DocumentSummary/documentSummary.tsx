import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

// Custom hook for responsive design
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width: width,
      });
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return screenSize;
};

type DocumentData = {
  id: number;
  name: string;
  uploadedBy: string;
  uploadedOn: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  srno: string;
};

const getStatusColor = (status: DocumentData['status']) => {
  switch (status) {
    case 'Approved':
      return '#4caf50'; // Green
    case 'Pending':
      return '#fbc02d'; // Yellow
    case 'Rejected':
      return '#f44336'; // Red
    default:
      return '#9e9e9e'; // Grey
  }
};

const documents: DocumentData[] = [
  {
    id: 1,
    name: 'Company Registration',
    uploadedBy: 'Admin',
    uploadedOn: '2025-05-14',
    status: 'Pending',
    srno: '1',
  },
];

// Desktop Table View Component (Your existing table with MUI)
const DesktopDocumentTable: React.FC = () => {
  const { submittedAt, status, entityDetails } = useSelector(
    (state: RootState) => state.applicationPreview
  );

  const panNo = entityDetails?.panNo || 'N/A';
  const nameOfInstitution = entityDetails?.nameOfInstitution || 'N/A';
  const formattedDate = submittedAt
    ? dayjs(submittedAt).format('DD-MM-YYYY')
    : 'N/A';

  return (
    <TableContainer component={Paper}>
      <Table style={{ fontFamily: 'Gilroy' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontFamily: 'inherit' }}>Sr. No</TableCell>
            <TableCell sx={{ fontFamily: 'inherit' }}>
              Submission Date
            </TableCell>
            <TableCell sx={{ fontFamily: 'inherit' }}>RE PAN</TableCell>
            <TableCell sx={{ fontFamily: 'inherit' }}>RE name</TableCell>
            <TableCell sx={{ fontFamily: 'inherit' }}>Status</TableCell>
            <TableCell sx={{ fontFamily: 'inherit' }}>Remark</TableCell>
            <TableCell sx={{ fontFamily: 'inherit' }}>Action</TableCell>
            {/* <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.srno}</TableCell>
              <TableCell>{formattedDate}</TableCell>
              <TableCell>{panNo}</TableCell>
              <TableCell>{nameOfInstitution}</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(doc.status),
                      mr: 1,
                    }}
                  />
                  <Typography
                    fontWeight={500}
                    color={getStatusColor(doc.status)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {status?.toLowerCase() || ''}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>NA</TableCell>
              <TableCell
                sx={{
                  color: 'text.disabled',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                }}
              >
                Edit
              </TableCell>
              {/* <TableCell align="center">
                    <IconButton>
                    <VisibilityOutlinedIcon  sx={{color:'#002CBA'}}/>
                    </IconButton>
                  </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Mobile Card View Component
const MobileDocumentCards: React.FC = () => {
  const { submittedAt, status, entityDetails } = useSelector(
    (state: RootState) => state.applicationPreview
  );

  const panNo = entityDetails?.panNo || 'N/A';
  const nameOfInstitution = entityDetails?.nameOfInstitution || 'N/A';
  const formattedDate = submittedAt
    ? dayjs(submittedAt).format('DD/MM/YY')
    : 'N/A';

  return (
    <div style={{ fontFamily: 'Gilroy', padding: '16px' }}>
      {documents.map((doc) => (
        <div
          key={doc.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0',
            padding: '20px',
            marginBottom: '16px',
          }}
        >
          {/* Status at the top */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(doc.status),
                marginRight: '8px',
              }}
            />
            <span
              style={{
                fontSize: '16px',
                fontWeight: '500',
                textTransform: 'capitalize',
                color: getStatusColor(doc.status),
              }}
            >
              {status?.toLowerCase() || 'Pending'}
            </span>
          </div>

          {/* Content Grid - 2x2 layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Sr.No. */}
            <div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#999',
                  fontWeight: '400',
                  marginBottom: '4px',
                }}
              >
                Sr.No.
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#333',
                }}
              >
                {doc.srno.padStart(2, '0')}
              </div>
            </div>

            {/* Submission Date */}
            <div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#999',
                  fontWeight: '400px',
                  marginBottom: '4px',
                }}
              >
                Submission Date
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#333',
                }}
              >
                {formattedDate}
              </div>
            </div>

            {/* RE PAN */}
            <div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#999',
                  fontWeight: '400',
                  marginBottom: '4px',
                }}
              >
                RE PAN
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#333',
                }}
              >
                {panNo}
              </div>
            </div>

            {/* RE Name */}
            <div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#999',
                  fontWeight: '400',
                  marginBottom: '4px',
                }}
              >
                RE Name
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#333',

                  lineHeight: '1.2',
                }}
              >
                {nameOfInstitution}
              </div>
            </div>
          </div>

          {/* View Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              style={{
                backgroundColor: 'white',
                color: '#2563eb',
                padding: '12px 48px',
                borderRadius: '8px',
                border: '2px solid #2563eb',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Gilroy',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#2563eb';
              }}
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Tablet View Component (Optional - hybrid approach)
// const TabletDocumentView: React.FC = () => {
//   const { submittedAt, status, entityDetails } = useSelector(
//     (state: RootState) => state.applicationPreview
//   );

//   const panNo = entityDetails?.panNo || 'N/A';
//   const nameOfInstitution = entityDetails?.nameOfInstitution || 'N/A';
//   const formattedDate = submittedAt
//     ? dayjs(submittedAt).format('DD-MM-YYYY')
//     : 'N/A';

//   return (
//     <Paper style={{ fontFamily: 'Gilroy', padding: '16px' }}>
//       {documents.map((doc) => (
//         <div
//           key={doc.id}
//           style={{
//             borderBottom: '1px solid #e0e0e0',
//             paddingBottom: '16px',
//             paddingTop: '16px',
//           }}
//         >
//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: '1fr 1fr',
//               gap: '16px',
//             }}
//           >
//             <div
//               style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
//             >
//               <div>
//                 <span
//                   style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}
//                 >
//                   Sr. No:
//                 </span>
//                 <span
//                   style={{
//                     marginLeft: '8px',
//                     fontSize: '14px',
//                     color: '#333',
//                     fontWeight: '600',
//                   }}
//                 >
//                   #{doc.srno}
//                 </span>
//               </div>
//               <div>
//                 <span
//                   style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}
//                 >
//                   Submission Date:
//                 </span>
//                 <span
//                   style={{ marginLeft: '8px', fontSize: '14px', color: '#333' }}
//                 >
//                   {formattedDate}
//                 </span>
//               </div>
//               <div>
//                 <span
//                   style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}
//                 >
//                   RE PAN:
//                 </span>
//                 <span
//                   style={{
//                     marginLeft: '8px',
//                     fontSize: '14px',
//                     color: '#333',
//                     fontWeight: '600',
//                   }}
//                 >
//                   {panNo}
//                 </span>
//               </div>
//             </div>

//             <div
//               style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
//             >
//               <div>
//                 <span
//                   style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}
//                 >
//                   RE Name:
//                 </span>
//                 <p
//                   style={{
//                     fontSize: '14px',
//                     color: '#333',
//                     fontWeight: '600',
//                     margin: '4px 0',
//                   }}
//                 >
//                   {nameOfInstitution}
//                 </p>
//               </div>
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   marginTop: '8px',
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: '12px',
//                     color: '#666',
//                     fontWeight: '500',
//                     marginRight: '8px',
//                   }}
//                 >
//                   Status:
//                 </span>
//                 <div style={{ display: 'flex', alignItems: 'center' }}>
//                   <div
//                     style={{
//                       width: '8px',
//                       height: '8px',
//                       borderRadius: '50%',
//                       backgroundColor: getStatusColor(doc.status),
//                       marginRight: '4px',
//                     }}
//                   />
//                   <span
//                     style={{
//                       fontSize: '14px',
//                       fontWeight: '500',
//                       textTransform: 'capitalize',
//                       color: getStatusColor(doc.status),
//                     }}
//                   >
//                     {status?.toLowerCase() || ''}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </Paper>
//   );
// };

// Main Responsive Component
const DocumentSummary: React.FC = () => {
  const { isMobile, isDesktop } = useResponsive();

  // Render based on screen size
  if (isMobile) {
    return <MobileDocumentCards />;
  }

  // if (isTablet) {
  //   return <TabletDocumentView />;
  // }

  if (isDesktop) {
    return <DesktopDocumentTable />;
  }

  // Fallback to desktop view
  return <DesktopDocumentTable />;
};

export default DocumentSummary;
