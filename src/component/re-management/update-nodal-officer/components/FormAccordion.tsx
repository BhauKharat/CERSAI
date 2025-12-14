/* eslint-disable prettier/prettier */
import React, { forwardRef, useImperativeHandle } from 'react';
import { IAccordionMenu } from './UpdateNodalOfficerDetails';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  styled,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
type Props = {
  accordionMenu: IAccordionMenu[];
};

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: 'none',
  border: '1px solid #E6EBFF',
  borderRadius: '8px',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: 0,
    marginBottom: theme.spacing(3),
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)({
  backgroundColor: '#E6EBFF',
  borderRadius: '8px',
  padding: '0 16px',
  minHeight: '48px !important',
  '& .MuiAccordionSummary-content': {
    margin: '12px 0 !important',
    fontWeight: 600,
  },
});

const AccordionTitleBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
}));

const AccordionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: '400',
  fontFamily: 'Gilroy',
  [theme.breakpoints.down('sm')]: {
    fontSize: '14px',
  },
}));

const NewUserBox = styled(Box)(() => ({}));

const CreateNewButton = styled(Button)(() => ({
  fontFamily: 'Gilroy',
  background: 'rgba(0, 44, 186, 1)',
  color: '#fff',
  padding: '6px 20px',
}));

export interface FormAccordionRef {
  submitAll: () => Promise<{ valid: boolean; data: unknown }>;
  resetAll: () => void;
}

const FormAccordion = forwardRef<FormAccordionRef, Props>(
  ({ accordionMenu }, ref) => {
    useImperativeHandle(ref, () => ({
      submitAll: async () => {
        const results = await Promise.all(
          accordionMenu.map(async (item) => {
            if (item.ref?.current?.submitForm) {
              try {
                const ok = await item.ref.current.submitForm();
                return { valid: ok.valid, data: ok.data };
              } catch {
                return { valid: false, data: null };
              }
            }
            return { valid: true, data: null };
          })
        );
        const valid = results.every((r) => r.valid);
        const data = results.map((r) => r.data);
        return { valid, data };
      },
      resetAll: () => {
        accordionMenu.forEach((item) => {
          if (item.ref?.current?.resetForm) {
            item.ref.current.resetForm();
          }
        });
      },
    }));

    const handleFormReset = (menuItem: IAccordionMenu) => {
      if (menuItem.ref?.current?.resetForm) {
        menuItem.ref.current.resetForm();
      }
    };
    return (
      <React.Fragment>
        {accordionMenu.map((item, index) => (
          <React.Fragment key={index}>
            <StyledAccordion defaultExpanded>
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#000' }} />}
              >
                <AccordionTitleBox>
                  <AccordionTitle>{item.label}</AccordionTitle>

                  <NewUserBox>
                    <CreateNewButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFormReset(item);
                      }}
                    >
                      Create New
                    </CreateNewButton>
                  </NewUserBox>
                </AccordionTitleBox>
              </StyledAccordionSummary>

              <AccordionDetails>{item.formComponent}</AccordionDetails>
            </StyledAccordion>
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  }
);

FormAccordion.displayName = 'FormAccordion';
export default FormAccordion;
