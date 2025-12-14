import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Avatar,
  Box,
  Tooltip,
  Paper,
  Button,
} from '@mui/material'; // Import Tooltip
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface KYCCombinationResultProps {
  result: {
    name: string;
    gender: string;
    mobile: string;
    email: string;
    lastUpdated: string;
    ref: string;
    photoUrl?: string;
    documents: { type: string; label: string; url?: string }[];
  };
  showPhoto: boolean;
}

const KYCCombinationResult: React.FC<KYCCombinationResultProps> = ({
  result,
  showPhoto,
}) => {
  // State to manage whether the email text is expanded or truncated
  const [isEmailExpanded, setIsEmailExpanded] = useState(false);
  // State to manage whether the CKYCU Ref No. tooltip is open
  const [isRefTooltipOpen, setIsRefTooltipOpen] = useState(false);

  // Function to toggle the email expansion state
  const toggleEmailExpansion = () => {
    setIsEmailExpanded((prev) => !prev);
  };

  // Function to toggle the CKYCU Ref No. tooltip state
  const handleRefClick = () => {
    setIsRefTooltipOpen((prev) => !prev);
  };

  // Function to close the tooltip (e.g., when clicking outside)
  const handleRefClose = () => {
    setIsRefTooltipOpen(false);
  };

  // Function to Download KYC
  const onDownloadKYC = () => {
    console.log('Download KYC');
  };

  return (
    <>
      {' '}
      {/* Added borderRadius */}
      <Box
        display="flex"
        alignItems="center"
        mb={2}
        sx={{ backgroundColor: '#e8f5e9', p: 1.5, borderRadius: '4px' }}
      >
        {' '}
        {/* Adjusted background and padding for the success message */}
        <CheckCircleIcon sx={{ color: '#2ecc40', mr: 1 }} />
        <Typography
          variant="h6"
          color="success.main"
          sx={{ fontWeight: 500, fontSize: '1rem' }}
        >
          {' '}
          {/* Adjusted font size and weight */}
          KYC Record Found
        </Typography>
      </Box>
      <Paper elevation={2} sx={{ p: 2, mt: 2, borderRadius: '8px' }}>
        <Grid container spacing={2} alignItems="center">
          {' '}
          {/* Added alignItems for vertical alignment */}
          {showPhoto ? (
            <Grid
              size={{ xs: 12, sm: 2 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: { xs: 2, sm: 0 },
              }}
            >
              {' '}
              {/* Centered avatar on small screens */}
              <Avatar
                src={
                  result.photoUrl ||
                  'https://placehold.co/56x56/cccccc/333333?text=Photo'
                }
                sx={{
                  width: '58%',
                  height: '40%',
                  border: '1.5px solid #d3d6db',
                  borderRadius: 'unset',
                  bgcolor: '#ededed',
                  color: '#757575',
                  fontWeight: 500,
                  fontSize: 15,
                  objectFit: 'cover',
                }}
              />{' '}
              {/* Added placeholder and border */}
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 10, md: 12, lg: 12 }}>
            {' '}
            {/* Adjusted sm:8 to sm:10 to match the screenshot layout */}
            <Grid container spacing={1}>
              {' '}
              {/* Nested Grid for details to control spacing */}
              {/* Changed xs:12 to xs:6 for a 2-column layout on extra-small screens */}
              <Grid size={{ xs: 10, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {result.name}
                </Typography>
              </Grid>
              <Grid size={{ xs: 10, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Mobile No.
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {result.mobile}
                </Typography>
              </Grid>
              <Grid size={{ xs: 10, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated On
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {result.lastUpdated}
                </Typography>
              </Grid>
              <Grid size={{ xs: 10, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {result.gender}
                </Typography>
              </Grid>
              <Grid size={{ xs: 10, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Email ID
                </Typography>
                <Tooltip
                  title={result.email} // Content of the tooltip
                  open={isEmailExpanded} // Control open state with our state variable (same as expansion)
                  onClose={toggleEmailExpansion} // Close handler (toggles expansion)
                  disableHoverListener // Disable opening on hover
                  placement="top" // Position the tooltip
                  arrow // Add an arrow to the tooltip
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    onClick={toggleEmailExpansion} // Add onClick handler
                    sx={{
                      cursor: 'pointer', // Indicate clickable
                      whiteSpace: 'nowrap', // Always nowrap for truncation
                      overflow: 'hidden', // Always hidden for truncation
                      textOverflow: 'ellipsis', // Always ellipsis for truncation
                      maxWidth: { xs: '150px', sm: 'none' }, // Apply maxWidth for truncation on xs screens
                    }}
                  >
                    {result.email}
                  </Typography>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 10, sm: 6, md: 4, lg: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  CKYC Reference Number.
                </Typography>
                <Tooltip
                  title={result.ref} // Content of the tooltip
                  open={isRefTooltipOpen} // Control open state with our state variable
                  onClose={handleRefClose} // Close handler
                  disableHoverListener // Disable opening on hover
                  placement="top" // Position the tooltip
                  arrow // Add an arrow to the tooltip
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    onClick={handleRefClick} // Add onClick handler for the tooltip
                    sx={{
                      cursor: 'pointer', // Indicate clickable
                      whiteSpace: 'nowrap', // Always nowrap for truncation
                      overflow: 'hidden', // Always hidden for truncation
                      textOverflow: 'ellipsis', // Always ellipsis for truncation
                      maxWidth: { xs: '150px', sm: 'none' }, // Apply maxWidth for truncation on xs screens
                    }}
                  >
                    {result.ref}
                  </Typography>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box pt={2} sx={{ mt: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  fontSize: '16px',
                  mb: { xs: 1.5, sm: 2 },
                  color: 'text.primary',
                }}
              >
                Submitted Documents
              </Typography>
              <Grid
                container
                spacing={{ xs: 1.5, sm: 2 }}
                sx={{
                  alignItems: 'stretch',
                }}
              >
                {result.documents.map((doc, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        width: '100%',
                        padding: '8px',
                        alignItems: 'flex-start',
                        gap: '12px',
                        background: '#e3f2fd',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'box-shadow 0.2s',
                        border: '1px solid #90caf9',
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          doc.url ||
                          `https://placehold.co/40x40/e3f2fd/1976d2?text=${doc.label
                            .charAt(0)
                            .toUpperCase()}`
                        }
                        alt={doc.label}
                        sx={{
                          objectFit: 'cover',
                          borderRadius: '4px',
                          flexShrink: 0,
                          width: 40,
                          height: 40,
                        }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            fontSize: '1rem',
                            color: '#1a237e',
                            lineHeight: 1.2,
                          }}
                        >
                          {doc.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.8rem',
                            color: '#424242',
                          }}
                        >
                          10mb
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 4, md: 4, lg: 4, xl: 4 }}
              sx={{
                display: 'flex',
                justifyContent: {
                  xs: 'flex-end',
                  sm: 'flex-end',
                  md: 'flex-end',
                }, // Align to the left on mobile, center on sm and up
                alignItems: 'center', // Vertically center the button
                mt: { xs: 2, sm: 20, lg: 7, xl: 7, md: 15 },
              }}
            >
              <Button
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  height: { md: '48px' },
                  borderRadius: '6px',
                  borderColor: '#3f51b5',
                  color: '#3f51b5',
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto on sm and up
                  '&:hover': {
                    borderColor: '#3f51b5',
                    backgroundColor: 'rgba(63, 81, 181, 0.04)',
                  },
                }}
                onClick={onDownloadKYC}
              >
                Download KYC Record
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default KYCCombinationResult;
