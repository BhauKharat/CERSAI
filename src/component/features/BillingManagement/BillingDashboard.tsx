import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Box } from './BillingDashboard.styles';
import Grid from '@mui/material/Grid';

const BillingDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Billing Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total Invoices</Typography>
              <Typography variant="h6">5</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Outstanding Amount</Typography>
              <Typography variant="h6" color="error">
                $250.00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Paid Amount</Typography>
              <Typography variant="h6" color="success.main">
                $1,000.00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BillingDashboard;
