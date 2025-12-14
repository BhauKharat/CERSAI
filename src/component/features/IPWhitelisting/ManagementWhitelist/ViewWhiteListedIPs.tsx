/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
// import dayjs from 'dayjs';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  InputAdornment,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { fetchIPWhitelisting, SortBy } from '../slices/ipWhitelistingSlice';
import {
  MainContainer,
  TableWrapper,
  StyledTableHeadCell,
  StyledTableCell,
  FooterContainer,
  PaginationContainer,
  PageButton,
} from '../style/ViewWhitelistedIPs.styles';
import DateUtils from '../../../../utils/dateUtils';
import NavigationBreadCrumb from '../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';

const ViewWhitelistedIPs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(
    (state) => state.ipWhitelisting
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortBy | undefined>();
  const pageSize = 10;

  // Fetch data on mount and when page/sort changes
  useEffect(() => {
    const sortField = sortBy?.key || 'createdAt';
    const sortDirection = sortBy?.type || 'desc';

    dispatch(
      fetchIPWhitelisting({
        page: currentPage - 1,
        size: pageSize,
        sortField,
        sortDirection,
      })
    );
  }, [dispatch, currentPage, sortBy]);

  // Filter data based on search query (client-side)
  const filteredTableData = useMemo(() => {
    if (!data?.content) return [];
    if (!searchQuery.trim()) return data.content;

    const lowerQuery = searchQuery.toLowerCase();
    return data.content.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(lowerQuery)
      )
    );
  }, [data, searchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sort
  const handleSort = (field: string) => {
    setSortBy((prev) => {
      if (!prev || prev.key !== field) {
        return { key: field, type: 'asc' };
      }
      return {
        key: field,
        type: prev.type === 'asc' ? 'desc' : 'asc',
      };
    });
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    if (!data) return null;

    const totalPages = data.totalPages;
    const pages: number[] = [];

    // Show up to 4 page numbers
    for (let i = 1; i <= Math.min(totalPages, 4); i++) {
      pages.push(i);
    }

    return pages.map((page) => (
      <PageButton
        key={page}
        variant={currentPage === page ? 'contained' : 'outlined'}
        isActive={currentPage === page}
        onClick={() => handlePageChange(page)}
        disabled={loading}
      >
        {page}
      </PageButton>
    ));
  };

  return (
    <MainContainer>
      {/* Breadcrumb */}
      <NavigationBreadCrumb
        crumbsData={[
          { label: 'IP Whitelisting' },
          { label: 'View Whitelisted IPs' },
        ]}
      />

      {/* Title and Search Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          mt: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, fontFamily: 'Gilroy, sans-serif' }}
        >
          View Whitelisted IPs
        </Typography>

        <TextField
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Content Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999999' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '300px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              fontFamily: 'Gilroy, sans-serif',
            },
          }}
        />
      </Box>

      {/* Loading State */}
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" style={{ margin: '20px 0' }}>
          <Typography>Failed to load data: {error}</Typography>
          <Button
            onClick={() =>
              dispatch(
                fetchIPWhitelisting({
                  page: currentPage - 1,
                  size: pageSize,
                })
              )
            }
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <TableWrapper>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>Sr.No.</StyledTableHeadCell>
                  <StyledTableHeadCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      IP Address
                      <IconButton
                        size="small"
                        onClick={() => handleSort('ipAddress')}
                        sx={{ color: 'inherit' }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </StyledTableHeadCell>
                  <StyledTableHeadCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      IP Whitelisted for
                      <IconButton
                        size="small"
                        onClick={() => handleSort('ipWhitelistedFor')}
                        sx={{ color: 'inherit' }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </StyledTableHeadCell>
                  <StyledTableHeadCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      Valid From
                      <IconButton
                        size="small"
                        onClick={() => handleSort('validFrom')}
                        sx={{ color: 'inherit' }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </StyledTableHeadCell>
                  <StyledTableHeadCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      Valid Till
                      <IconButton
                        size="small"
                        onClick={() => handleSort('validTill')}
                        sx={{ color: 'inherit' }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </StyledTableHeadCell>
                  <StyledTableHeadCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      Added On
                      <IconButton
                        size="small"
                        onClick={() => handleSort('lastUpdatedOn')}
                        sx={{ color: 'inherit' }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </StyledTableHeadCell>
                  <StyledTableHeadCell>Added By</StyledTableHeadCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTableData.length === 0 ? (
                  <TableRow>
                    <StyledTableCell colSpan={7} sx={{ textAlign: 'center' }}>
                      <Typography variant="body1">
                        {searchQuery.trim()
                          ? 'No results found'
                          : 'No IP addresses found'}
                      </Typography>
                    </StyledTableCell>
                  </TableRow>
                ) : (
                  filteredTableData.map((row, index) => {
                    const isBlocked = row.status === 'BLOCKED';
                    return (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#E4F6FF',
                          },
                        }}
                      >
                        <StyledTableCell
                          isBlocked={isBlocked}
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {String(
                            (currentPage - 1) * pageSize + index + 1
                          ).padStart(2, '0')}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>

                        <StyledTableCell
                          isBlocked={isBlocked}
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {row.ipAddress}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>

                        <StyledTableCell
                          isBlocked={isBlocked}
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {row.ipWhitelistedFor}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>

                        <StyledTableCell
                          isBlocked={isBlocked}
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {DateUtils.formatOnlyDate(row.validFrom)}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>

                        <StyledTableCell
                          isBlocked={isBlocked}
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {DateUtils.formatOnlyDate(row.validTill)}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>

                        <StyledTableCell
                          isBlocked={isBlocked}
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {DateUtils.formatDate(row.lastUpdatedOn)}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>

                        <StyledTableCell isBlocked={isBlocked}>
                          {row.createdBy || '-'}
                        </StyledTableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableWrapper>

          {/* Note about blocked IPs */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 600,
                color: '#FF0000',
              }}
            >
              <span style={{ fontWeight: 700 }}>Note:</span> Blocked IPs are
              highlighted in RED font
            </Typography>
          </Box>

          {/* Footer with Pagination */}
          <FooterContainer>
            <Typography
              variant="body2"
              sx={{ fontFamily: 'Gilroy, sans-serif', fontWeight: 500 }}
            >
              Showing data {filteredTableData.length} of{' '}
              {searchQuery.trim()
                ? filteredTableData.length
                : data?.totalElements || 0}
            </Typography>

            <PaginationContainer>
              {/* Previous Button */}
              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                sx={{
                  textTransform: 'none',
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 600,
                  borderColor: '#002CBA',
                  color: '#002CBA',
                  '&:hover': {
                    borderColor: '#001a8c',
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-disabled': {
                    borderColor: '#ccc',
                    color: '#ccc',
                  },
                }}
                startIcon={<KeyboardArrowLeftIcon />}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              {renderPaginationButtons()}

              {/* Next Button */}
              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data?.totalPages || loading}
                sx={{
                  textTransform: 'none',
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 600,
                  borderColor: '#002CBA',
                  color: '#002CBA',
                  '&:hover': {
                    borderColor: '#001a8c',
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-disabled': {
                    borderColor: '#ccc',
                    color: '#ccc',
                  },
                }}
                endIcon={<KeyboardArrowRightIcon />}
              >
                Next
              </Button>
            </PaginationContainer>
          </FooterContainer>
        </>
      )}
    </MainContainer>
  );
};

export default ViewWhitelistedIPs;
