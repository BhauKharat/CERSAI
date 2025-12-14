// entityForm.styles.ts
import {
  styled,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';

// Main container
export const EntityFormContainer = styled(Box)(() => ({
  padding: '5px 0px 30px 68px !important',

  margin: '16px -2px 0px 22px',

  '& .accordion-summary-title': {
    backgroundColor: '#61db49',
    padding: '8px',
    borderRadius: '4px',
    display: 'inline-block',
  },

  '& label': {
    fontWeight: '500 !important',
  },
}));

// Accordion components
export const StyledAccordionSummary = styled(AccordionSummary)(() => ({
  '&.css-17g9jzt-MuiButtonBase-root-MuiAccordionSummary-root': {
    marginBottom: '0px !important',
  },

  '&.css-17g9jzt-MuiButtonBase-root-MuiAccordionSummary-root.Mui-expanded': {
    minHeight: '50px !important',
  },

  '&.css-1956rkl-MuiButtonBase-root-MuiAccordionSummary-root': {
    backgroundColor: '#e6ebff !important',
  },

  '&.css-1956rkl-MuiButtonBase-root-MuiAccordionSummary-root.Mui-expanded': {
    minHeight: '50px !important',
  },

  '&.css-1f1pi2l-MuiButtonBase-root-MuiAccordionSummary-root': {
    backgroundColor: '#e6ebff !important',
  },

  '&.css-1f1pi2l-MuiButtonBase-root-MuiAccordionSummary-root.Mui-expanded': {
    minHeight: '50px !important',
  },
}));

export const StyledAccordionDetails = styled(AccordionDetails)(() => ({
  padding: '24px 21px 24px 21px !important',
}));

export const StyledAccordion = styled(Accordion)(() => ({
  '&.MuiAccordion-root.Mui-expanded': {
    marginTop: '0 !important',
  },
}));

// Content styles
export const StyledAccordionContent = styled(Box)(() => ({
  '&.css-yfrx4k-MuiAccordionSummary-content.Mui-expanded': {
    margin: '0px 0 !important',
  },
}));

// Checkbox container
export const CheckboxContainer = styled(Box)(() => ({
  marginBottom: '15px',
  marginLeft: '6px',
  marginTop: '15px',
}));

// Specific container styles
export const StyledContainer = styled(Box)(() => ({
  '&.css-1pq1nh1': {
    padding: '40px 0px 40px 50px !important',
    marginLeft: '-82px !important',
  },

  '&.css-1wcaknn': {
    overflow: 'hidden',
  },

  '&.css-xi606m': {
    textAlign: 'center',
    marginTop: '2%',
  },

  '&.margin-bottom-0px h3 button': {
    marginBottom: '0px !important',
  },
}));

// Input styles
export const StyledInput = styled('input')(() => ({
  width: '100%',
  maxWidth: '400px',
}));

export const InputQuie = styled('input')(() => ({
  width: '100%',
  maxWidth: '27px !important',
}));

// Container styles
export const AddressContainer = styled(Box)(() => ({
  width: '100%',
  maxWidth: '500px',
}));

export const FormControl = styled(Box)(() => ({
  width: '100%',
  maxWidth: '400px',
}));
export const ButtonActionsBox = styled(Box)(() => ({
  marginTop: '2rem',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.5rem',
}));

// Cancel Button
export const CancelButton = styled(Button)(() => ({
  //minWidth: '100px',
  borderColor: '#002cba',
  color: '#002cba',
  '&:hover': {
    borderColor: '#002CBA',
    backgroundColor: 'rgba(0, 44, 186, 0.04)',
  },
  '&.Mui-disabled': {
    backgroundColor: '#ffffff',
    // color: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid #D9D9D9',
    color: '#D9D9D9',
  },
}));

// Save Button
export const SaveButton = styled(Button)(() => ({
  // minWidth: '100px',
  backgroundColor: '#002cba !important',
  color: 'white',
  '&:hover': {
    backgroundColor: '#001f8e !important',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(0, 44, 186, 0.5) !important',
    color: 'rgba(255, 255, 255, 0.7)',
  },
}));
