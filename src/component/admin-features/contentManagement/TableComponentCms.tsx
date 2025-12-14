/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Column {
  field: string;
  header: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

interface CommonTableProps {
  columns: Column[];
  data: any[];
  styles?: any;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  onEditClick?: (row: any, index: number) => void;
  onDeleteClick?: (row: any, index: number) => void;
  onViewClick?: (row: any, index: number) => void;
  customActions?: (row: any, index: number) => React.ReactNode;
}

const TableComponentCms: React.FC<CommonTableProps> = ({
  columns,
  data,
  styles = {},
  showEdit = true,
  showDelete = false,
  showView = false,
  onEditClick,
  onDeleteClick,
  onViewClick,
  customActions,
}) => {
  const hasActions = showEdit || showDelete || showView || customActions;

  return (
    <TableContainer component={Paper} sx={styles.tableContainer}>
      <Table sx={styles.table}>
        <TableHead>
          <TableRow sx={styles.tableHead}>
            {columns.map((column, index) => (
              <TableCell
                key={column.field}
                sx={
                  index === columns.length - 1 && !hasActions
                    ? styles.tableHeadCellLast
                    : styles.tableHeadCell
                }
              >
                {column.header}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell sx={styles.tableHeadCell}>Action</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex} sx={styles.tableRow}>
              {columns.map((column, colIndex) => (
                <TableCell
                  key={`${column.field}-${rowIndex}`}
                  sx={
                    colIndex === columns.length - 1 && !hasActions
                      ? {}
                      : styles.tableCell
                  }
                >
                  {column.render
                    ? column.render(row[column.field], row, rowIndex)
                    : row[column.field]}
                  {(colIndex < columns.length - 1 || hasActions) && (
                    <Box sx={styles.verticalSeparator} />
                  )}
                </TableCell>
              ))}

              {hasActions && (
                <TableCell>
                  <Box sx={styles.actionCell}>
                    {customActions ? (
                      customActions(row, rowIndex)
                    ) : (
                      <>
                        {showView && (
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => onViewClick?.(row, rowIndex)}
                            title="View"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        )}
                        {showEdit && (
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => onEditClick?.(row, rowIndex)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {showDelete && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => onDeleteClick?.(row, rowIndex)}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComponentCms;
