import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// import Box from "@mui/material/Box";
import { Box } from './TicketList.styles';

interface Ticket {
  id: number;
  subject: string;
  status: string;
}

const mockTickets: Ticket[] = [
  { id: 1, subject: 'Login Issue', status: 'Open' },
  { id: 2, subject: 'KYC Update', status: 'Closed' },
];

const TicketList: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Ticket List
      </Typography>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TicketList;
