import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Edit } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectWorkflowData } from '../slice/trackStatusFormSlice';

interface FormAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  groupKey?: string;
  sx?: object;
  headerSx?: object;
  contentSx?: object;
  onEdit?: () => void;
  showEdit?: boolean;
  isModifiable?: boolean;
}

const FormAccordion: React.FC<FormAccordionProps> = ({
  title,
  children,
  defaultExpanded = true,
  groupKey,
  sx = {},
  headerSx = {},
  contentSx = {},
  onEdit,
  showEdit = false,
  isModifiable = false,
}) => {
  // Helper function to format group title
  const formatTitle = (title: string) => {
    return title.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const workflowEntireData = useSelector(selectWorkflowData);

  const SubmittedForm = workflowEntireData?.status;

  return (
    <Accordion
      key={groupKey}
      defaultExpanded={defaultExpanded}
      sx={{ mb: 2, ...sx }}
    >
      <Box sx={{ position: 'relative' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor:
              isModifiable && SubmittedForm !== 'SUBMITTED'
                ? '#FFD952'
                : '#E6EBFF',
            fontFamily: 'Gilroy',
            fontWeight: 500,
            fontSize: '16px',
            color: isModifiable ? '#000' : '#333',
            '& .MuiAccordionSummary-content': {
              margin: '12px 0',
            },
            '&:hover': {
              backgroundColor:
                isModifiable && SubmittedForm !== 'SUBMITTED'
                  ? '#FFD952'
                  : 'rgba(0, 0, 0, 0.04)',
            },
            ...headerSx,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Gilroy',
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            {formatTitle(title)}
          </Typography>
        </AccordionSummary>
        {showEdit && onEdit && (
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={onEdit}
            sx={{
              position: 'absolute',
              top: '50%',
              right: '48px', // Position to the left of expand icon
              transform: 'translateY(-50%)',
              fontFamily: 'Gilroy',
              fontSize: '14px',
              textTransform: 'none',
              color: '#002CBA',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 44, 186, 0.1)',
              },
            }}
          >
            Edit
          </Button>
        )}
      </Box>
      <AccordionDetails sx={{ mx: 3, my: 2, ...contentSx }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default FormAccordion;
