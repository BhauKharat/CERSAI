import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface UpdateFormAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  groupKey?: string;
  sx?: object;
  headerSx?: object;
  contentSx?: object;
  onAddNew?: () => void;
  showAddButton?: boolean;
  addButtonLabel?: string;
  isAddMode?: boolean;
}

const UpdateFormAccordion: React.FC<UpdateFormAccordionProps> = ({
  title,
  children,
  defaultExpanded = true,
  groupKey,
  sx = {},
  headerSx = {},
  contentSx = {},
  onAddNew,
  showAddButton = false,
  addButtonLabel = 'Add New',
  isAddMode = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Helper function to format group title
  const formatTitle = (title: string) => {
    return title.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Accordion
      key={groupKey}
      defaultExpanded={defaultExpanded}
      sx={{
        mb: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        borderRadius: '8px !important',
        '&:before': {
          display: 'none',
        },
        ...sx,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon sx={{ fontSize: isMobile ? '20px' : '24px' }} />
          }
          sx={{
            backgroundColor: isAddMode ? '#E6EBFF' : '#E6EBFF',
            fontFamily: 'Gilroy',
            fontWeight: 600,
            fontSize: isMobile ? '14px' : isTablet ? '15px' : '16px',
            color: '#333',
            minHeight: isMobile ? '56px' : '64px',
            borderRadius: '8px 8px 0 0',
            px: isMobile ? 2 : 3,
            '& .MuiAccordionSummary-content': {
              margin: isMobile ? '8px 0' : '12px 0',
              pr: onAddNew ? (isMobile ? '80px' : '120px') : 0,
            },
            '& .MuiAccordionSummary-expandIconWrapper': {
              marginRight: isMobile ? '-8px' : 0,
            },
            ...headerSx,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Gilroy',
              fontWeight: 700,
              fontSize: isMobile ? '14px' : isTablet ? '15px' : '16px',
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
          >
            {formatTitle(title)}
          </Typography>
        </AccordionSummary>
        {onAddNew && showAddButton && (
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddNew();
            }}
            sx={{
              position: 'absolute',
              top: '50%',
              right: isMobile ? '40px' : '48px',
              transform: 'translateY(-50%)',
              fontFamily: 'Gilroy',
              fontSize: isMobile ? '12px' : '14px',
              textTransform: 'none',
              color: showAddButton ? '#002CBA' : 'grey',
              zIndex: 1,
              minWidth: isMobile ? 'auto' : '64px',
              padding: isMobile ? '4px 8px' : '6px 16px',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: 'rgba(0, 44, 186, 0.1)',
              },
            }}
          >
            {isMobile ? 'Add' : addButtonLabel}
          </Button>
        )}
      </Box>
      <AccordionDetails
        sx={{
          marginLeft: '21px',
          marginRight: '21px',
          my: isMobile ? 1.5 : 2,
          ...contentSx,
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default UpdateFormAccordion;
