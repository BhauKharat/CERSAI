/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, TableHead, TableBody, Typography, styled, Box } from '@mui/material';
import React from 'react';
import {
  StyledPaper,
  StyledTableContainer,
  StyledTableHead,
  StyledSerialHeaderCell,
  StyledTableBody,
  StyledTableCell,
} from '../CreateModifyRegion/CreateModifyRegion.style';

import DeleteIcon from '../../../../assets/delete_icon.svg'

interface Props {
  headers: string[];
  rows: Record<string, any>[];
  removeRegion:(id:number) => void
}

const CenterDiv = styled(Box)(() => ({
  display:'flex',
  justifyContent:'center',
  alignItems:'center',
  cursor:'pointer'
}))

const RegionUtilityTable: React.FC<Props> = ({ headers, rows, removeRegion }) => {
  return (
    <React.Fragment>
      <StyledPaper>
        <StyledTableContainer>
          <Table>
            <TableHead>
              <StyledTableHead>
                {headers.map((item, idx) => (
                  <StyledSerialHeaderCell key={idx}>
                    {item}
                  </StyledSerialHeaderCell>
                ))}
              </StyledTableHead>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <StyledTableBody>
                  <StyledTableCell colSpan={5} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No data found
                    </Typography>
                  </StyledTableCell>
                </StyledTableBody>
              ) : (
                rows.map((item, index: number) => (
                  <StyledTableBody key={index}>
                    {headers.map((head, idx) => (
                      
                      <StyledTableCell key={idx}>{head === 'Sr.No.' ? index +1 : head.toLowerCase() === 'delete' ? <CenterDiv onClick={() => removeRegion(index)}>
                        <img  src={DeleteIcon} alt='delete_icon'/>
                      </CenterDiv> : item[head]}</StyledTableCell>
                    ))}
                  </StyledTableBody>
                ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </StyledPaper>
    </React.Fragment>
  );
};

export default RegionUtilityTable;
