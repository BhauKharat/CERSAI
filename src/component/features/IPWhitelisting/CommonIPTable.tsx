/* eslint-disable prettier/prettier */

import React from 'react';

import {

  Table,

  TableBody,

  TableCell,

  TableContainer,

  TableHead,

  TableRow,

  Typography,

  Paper,

  IconButton,

  Pagination,

  PaginationItem,

  Box,

  Button,

  CircularProgress,

  SxProps,

  Theme,

} from '@mui/material';

import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';



// Generic column interface

interface Column<T> {

  label: string;

  field: keyof T;

  sortable?: boolean;

  render?: (row: T, index: number) => React.ReactNode;

}



// Define specific style keys for better type safety

interface TableStyles {

  tableHeadRow?: SxProps<Theme>;

  tableCell?: SxProps<Theme>;

  tableCellBlue?: SxProps<Theme>;

  paginationNextPrevButton?: SxProps<Theme>;

  tableBodyRow?: SxProps<Theme>;

  isBlueText?: boolean;

  isTextAlignCenter?: boolean;

}



// Generic table props interface

interface CommonTableProps<T> {

  columns: Column<T>[];

  data: T[];

  loading?: boolean;

  error?: boolean;

  currentPage?: number;

  pageSize?: number;

  totalCount?: number;

  onPageChange?: (event: React.ChangeEvent<unknown>, page: number) => void;

  onSort?: (field: keyof T) => void;

  onRowClick?: (row: T) => void;

  emptyText?: string;

  styles?: TableStyles;

  note?: string;

}



// Generic component with proper type parameter

const CommonTable = <T,>({

  columns,

  data,

  loading = false,

  error = false,

  currentPage = 1,

  pageSize = 5,

  totalCount = 0,

  onPageChange,

  onSort,

  onRowClick,

  note,

  emptyText = 'No data available',

  styles = {},

}: CommonTableProps<T>) => {

  // console.log(pageSize, 'pageSize');

  // console.log(data?.length, 'data');

  if (loading)

    return (

      <Box display="flex" justifyContent="center" py={3}>

        <CircularProgress />

      </Box>

    );



  if (error)

    return (

      <Typography color="error" align="center" py={2}>

        Failed to load data

      </Typography>

    );



  return (

    <>

      <TableContainer component={Paper}>

        <Table>

          <TableHead>

            <TableRow sx={styles.tableHeadRow}>

              {columns.map((col, idx) => (

                <TableCell key={idx} sx={styles.tableCell}>

                  {col.label}

                  {col.sortable && onSort && (

                    <IconButton

                      onClick={() => onSort(col.field)}

                      sx={{ color: '#000000', ml: 1 }}

                      size="small"

                    >

                      <UnfoldMoreIcon fontSize="small" />

                    </IconButton>

                  )}

                </TableCell>

              ))}

            </TableRow>

          </TableHead>



          <TableBody>

            {data.length === 0 ? (

              <TableRow>

                <TableCell

                  colSpan={columns.length}

                  align="center"

                  sx={{ py: 3 }}

                >

                  <Typography variant="body1" color="text.secondary">

                    {emptyText}

                  </Typography>

                </TableCell>

              </TableRow>

            ) : (

              data.map((row, index) => (

                <TableRow

                  key={index}

                  hover={!!onRowClick}

                  onClick={() => onRowClick?.(row)}

                  sx={{

                    cursor: onRowClick ? 'pointer' : 'default',

                    '&:hover': {

                      backgroundColor: '#E4F6FF !important',

                    },

                    minHeight: '60px !important',

                  }}

                >

                  {columns.map((col, colIdx) => (

                    <TableCell

                      key={colIdx}

                      sx={{

                        textAlign: styles.isTextAlignCenter

                          ? 'center !important'

                          : 'center',

                        color: styles.isBlueText ? '#002CBA' : '#000000',

                        fontWeight: '500',

                        fontSize: '16px',

                        padding: '10px 0px !important',

                      }}

                    >

                      {col.render ? (

                        col.render(row, index)

                      ) : (

                        <Typography

                          sx={{

                            textAlign: styles.isTextAlignCenter

                              ? 'center !important'

                              : 'center',

                            color: styles.isBlueText ? '#002CBA' : '#000000',

                            fontWeight: 500,

                            fontSize: '16px',

                            padding: '10px 0px',

                            borderRight:

                              colIdx !== columns.length - 1

                                ? '1px solid #E0E5EE'

                                : 'none',

                          }}

                        >

                          {String(row[col.field] ?? '')}

                        </Typography>

                      )}

                    </TableCell>

                  ))}

                </TableRow>

              ))

            )}

          </TableBody>

        </Table>

      </TableContainer>

      <Typography

        sx={{

          fontFamily: 'Gilroy, sans-serif',

          fontWeight: '500',

          fontSize: '14px',

          mt: 2,

        }}

      >

        {note}

      </Typography>

      {/* Pagination */}

      {totalCount > 0 && (

        <>

          {onPageChange && totalCount > pageSize && (

            <Box

              display="flex"

              justifyContent="space-between"

              alignItems="center"

              sx={{ mt: 4, px: 1 }}

            >

              <>

                <Typography variant="body2" color="#000000">

                  Showing data {data.length} of {totalCount}

                </Typography>



                <Box display="flex" justifyContent="center">

                  <Pagination

                    count={Math.ceil(totalCount / pageSize)}

                    page={currentPage}

                    onChange={onPageChange}

                    sx={{

                      '& .MuiPagination-ul': {

                        display: 'flex',

                        alignItems: 'center',

                        justifyContent: 'center',

                        gap: '10px',

                      },

                    }}

                    renderItem={(item) => {

                      if (item.type === 'page') {

                        return (

                          <PaginationItem

                            {...item}

                            sx={{

                              color: item.selected ? '#fff' : 'text.primary',

                              backgroundColor: item.selected

                                ? '#002CBA'

                                : 'transparent',

                              borderRadius: '6px',

                              minWidth: '32px',

                              height: '32px',

                              fontSize: '14px',

                              fontWeight: item.selected ? 600 : 400,

                              '&.Mui-selected': {

                                backgroundColor: '#002CBA',

                                color: '#fff',

                                '&:hover': {

                                  backgroundColor: '#001E80',

                                },

                              },

                              '&:hover': {

                                backgroundColor: '#E3F2FD',

                              },

                            }}

                          />

                        );

                      }



                      return (

                        <PaginationItem

                          components={{

                            previous: (props) => (

                              <Button

                                variant="outlined"

                                {...props}

                                sx={{

                                  ...styles.paginationNextPrevButton,

                                  mr: '30px',

                                }}

                                startIcon={

                                  <KeyboardArrowLeftIcon sx={{ height: 20 }} />

                                }

                              >

                                Previous

                              </Button>

                            ),

                            next: (props) => (

                              <Button

                                variant="outlined"

                                {...props}

                                sx={{

                                  ...styles.paginationNextPrevButton,

                                  ml: '30px',

                                }}

                                endIcon={

                                  <KeyboardArrowRightIcon sx={{ height: 20 }} />

                                }

                              >

                                Next

                              </Button>

                            ),

                          }}

                          {...item}

                        />

                      );

                    }}

                  />

                </Box>

              </>

            </Box>

          )}

        </>

      )}

    </>

  );

};



export default CommonTable;

 