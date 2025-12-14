import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import cersai_logo from '../../../../assets/cersai_logo.svg';
interface InvoiceTemplateSampleProps {
  templateName?: string;
}
const InvoiceTemplateSample: React.FC<InvoiceTemplateSampleProps> = ({
  templateName,
}) => {
  // Sample data - replace with your actual data
  const invoiceData = {
    invoiceNumber: '@invoice_number',
    dateTime: '@date&time',
    RE_name: '@RE_name',
    PAN_number: '@PAN_number',
    cin_llp: '@cin_llip',
    gstin: '@gstin',
    address: '@address',
    cin: '@cin',
  };

  return (
    <Box
      sx={{
        border: '2px solid black',
        maxWidth: '1000px',
        // margin: '20px auto',
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          width: '100%',
        }}
      >
        <img src={cersai_logo} alt="cersai_logo" style={{ height: '50px' }} />
        <Typography
          variant="h4"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '20px',
            mt: 3,
            textTransform: 'uppercase',
            width: '100%',
          }}
        >
          CENTRAL KYC RECORD REGISTRY
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: 1, borderWidth: 1, borderColor: 'black' }} />
      <Typography
        variant="h6"
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          //marginBottom: 4,
          fontSize: '17px',
        }}
      >
        {templateName || 'INVOICE'}
      </Typography>
      {/* Invoice Header Table */}
      <TableContainer
        component={Paper}
        sx={{
          marginBottom: 3,
          borderTop: '1px solid black',
          borderBottom: '1px solid black',
          boxShadow: 'none',
          borderRadius: 'none',
        }}
      >
        <Table>
          <TableBody>
            <TableRow sx={{ borderBottom: '2px solid black' }}>
              <TableCell
                sx={{
                  border: '1px solid black',
                  borderLeft: 'none',

                  width: '50%',
                  fontSize: '12px',
                  padding: '18px 12px',
                }}
              >
                <strong>Invoice Number:</strong> {invoiceData.invoiceNumber}
              </TableCell>
              <TableCell
                sx={{
                  border: '1px solid black',

                  borderRight: 'none',
                  width: '50%',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>Date & Time:</strong> {invoiceData.dateTime}
              </TableCell>
            </TableRow>

            {/* Second Row - Section Headers */}
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  borderBottom: '1px solid #ebebeb',
                  backgroundColor: '#ebebeb',
                  width: '50%',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Reporting Entity Details
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: '1px solid #ebebeb',
                  fontWeight: 'bold',
                  backgroundColor: '#ebebeb',
                  width: '50%',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Recipient Details
              </TableCell>
            </TableRow>

            {/* Third Row - Entity Names */}
            <TableRow>
              <TableCell
                sx={{
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>{invoiceData.RE_name}</strong>
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>CERSAI</strong>
              </TableCell>
            </TableRow>

            {/* Fourth Row - PAN */}
            <TableRow>
              <TableCell
                sx={{
                  borderRight: '1px solid black',
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>PAN:</strong> {invoiceData.PAN_number}
              </TableCell>
              <TableCell
                sx={{
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>PAN:</strong> {invoiceData.PAN_number}
              </TableCell>
            </TableRow>

            {/* Fifth Row - CIN */}
            <TableRow>
              <TableCell
                sx={{
                  borderRight: '1px solid black',
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>CIN / LLPIN:</strong> {invoiceData.cin_llp}
              </TableCell>
              <TableCell
                sx={{
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>CIN:</strong> {invoiceData.cin}
              </TableCell>
            </TableRow>

            {/* Sixth Row - GSTIN */}
            <TableRow>
              <TableCell
                sx={{
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>GSTIN:</strong> {invoiceData.gstin}
              </TableCell>
              <TableCell
                sx={{
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>GSTIN:</strong> {invoiceData.gstin}
              </TableCell>
            </TableRow>

            {/* Seventh Row - Address */}
            <TableRow>
              <TableCell
                sx={{
                  border: '2px solid #ebebeb',
                  borderBottom: '1px solid black',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>Address:</strong> {invoiceData.address}
              </TableCell>
              <TableCell
                sx={{
                  border: '2px solid #ebebeb',
                  borderBottom: '1px solid black',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>Address:</strong> {invoiceData.address}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  borderBottom: '1px solid #ebebeb',
                  backgroundColor: '#ebebeb',
                  width: '50%',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Description
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: '1px solid #ebebeb',
                  fontWeight: 'bold',
                  backgroundColor: '#ebebeb',
                  width: '50%',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Amount
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderRight: '1px solid black',
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Fund Remitted to CKYCRR
              </TableCell>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                @fund_remitter_cersai
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Add :Appliacble Tax
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                IGST@18%@applicable_tax_igst
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                CGST@18%@applicable_tax_cgst
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                SGST@18%@applicable_tax_sgst
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                sx={{
                  borderRight: '1px solid black',
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Gross Receivable
              </TableCell>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                @gross_receivable
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderRight: '1px solid black',
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Less:TDS 2%
              </TableCell>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                @less_tds
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderRight: '1px solid black',
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>Net Amount Payable</strong>
              </TableCell>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                @net_amount_payable
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderRight: '1px solid black',
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                Amount to be credited in wallet
              </TableCell>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                @amt_tobe_credited
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{
                  borderRight: '1px solid black',
                  borderBottom: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                TDS on Hold
              </TableCell>
              <TableCell
                sx={{
                  textAlign: 'right',
                  border: '2px solid #ebebeb',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                @tds_onhold
              </TableCell>
            </TableRow>
            <TableRow sx={{ fontSize: '12px' }}>
              <TableCell
                colSpan={2}
                sx={{
                  border: 'none',
                  fontSize: '12px',
                  padding: '6px 12px',
                }}
              >
                <strong>Amount Received (in words):</strong> Rupees
                @amount_recieved_in_words
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InvoiceTemplateSample;
