import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Typography } from '@mui/material';

export default function MuiAccordion({
  handleEdit,
  itemKey,
  title,
}: {
  title: string;
  itemKey: number;
  handleEdit: (key: number) => void;
}) {
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ bgcolor: 'rgb(230, 235, 255)' }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
              width: '100%',
            }}
          >
            <Typography variant="h5" fontWeight={'bold'}>
              {title}
            </Typography>
            {handleEdit && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(itemKey);
                }}
                variant="text"
                sx={{ textTransform: 'none', color: 'rgb(0, 44, 186)' }}
              >
                Edit
              </Button>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails></AccordionDetails>
      </Accordion>
    </div>
  );
}
