import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
  Box,
  Paper,
  Container,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputAdornment,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
// import { fetchApprovedRegions } from '../CreateModifyRegion/slice/approvedRegionsSlice';
import { fetchUsers } from './slice/usersSlice';
import { ApiUser } from './types/users';
import DeactivateUserModal from './DeactivateUser/DeactivateUserModal';
import SuspendUserModal from './SuspendUser/SuspendUserModal';
import RevokeUserModal from './RevokeUser/RevokeUserModal';
import {
  containerStyles,
  searchFilterContainerStyles,
  searchBoxStyles,
  searchFieldStyles,
  searchLabelStyles,
  searchInputContainerStyles,
  textFieldStyles,
  searchButtonStyles,
  statusFilterStyles,
  selectStyles,
  menuItemStyles,
  createButtonStyles,
  tableContainerStyles,
  tableHeadRowStyles,
  tableCellStyles,
  tableBodyStyles,
  tableRowStyles,
  bodyCellStyles,
  statusContainerStyles,
  statusIndicatorStyles,
  statusTextStyles,
  actionButtonStyles,
  paginationContainerStyles,
  paginationTextStyles,
  paginationButtonContainerStyles,
  paginationButtonStyles,
  pageButtonStyles,
  backButtonContainerStyles,
  backButtonStyles,
  backTextStyles,
  paperStyles,
  tableHeaderActionCellStyles,
  actionTableCellStyles,
  sortableHeaderStyles,
  sortIconStyles,
  mobileTableWrapperStyles,
} from './CreateModifyUser.styles';

const CreateModifyUser: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: approvedRegions,
    loading: regionsLoading,
    error: regionsError,
  } = useSelector((state: RootState) => state.approvedRegions);
  const {
    data: users,
    totalElements,
    totalPages,
  } = useSelector((state: RootState) => state.users);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'APPROVED' | 'REJECTED'>(
    'APPROVED'
  );
  const [regionFilter, setRegionFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [selectedUser] = useState<ApiUser | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  const handleSearch = () => {
    setPage(0);
    dispatch(
      fetchUsers({
        size: rowsPerPage,
        page: 0,
        status: statusFilter,
        search: searchTerm || undefined,
        region: regionFilter || undefined,
      })
    );
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as 'APPROVED' | 'REJECTED');
    setPage(0);
  };

  const handleRegionChange = (event: SelectChangeEvent) => {
    setRegionFilter(event.target.value);
    setPage(0);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Fetch approved regions on component mount
  // useEffect(() => {
  //   dispatch(fetchApprovedRegions());
  // }, [dispatch]);

  // Set default region when regions are loaded
  useEffect(() => {
    if (approvedRegions.length > 0 && !regionFilter) {
      setRegionFilter(approvedRegions[0].regionCode);
    }
  }, [approvedRegions, regionFilter]);

  // Fetch users when filters change
  useEffect(() => {
    const fetchUsersData = () => {
      dispatch(
        fetchUsers({
          size: rowsPerPage,
          page: page,
          status: statusFilter,
          search: searchTerm || undefined,
          region: regionFilter || undefined,
        })
      );
    };

    // Only fetch if we have a region selected or no region filter is needed
    if (regionFilter || approvedRegions.length === 0) {
      fetchUsersData();
    }
  }, [
    dispatch,
    page,
    rowsPerPage,
    statusFilter,
    searchTerm,
    regionFilter,
    approvedRegions.length,
  ]);

  const handleClickAction = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: ApiUser
  ) => {
    // Only navigate if user status is APPROVED
    if (user.status === 'APPROVED') {
      navigate(`/re/modify-user/${user.userId}`, {
        state: { userId: user.userId },
      });
    }
  };

  const handleCreateNew = () => {
    navigate('/re/create-new-user');
  };

  // Use API data instead of mock data
  const displayUsers = users || [];

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - displayUsers.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  return (
    <Container maxWidth={false} sx={containerStyles}>
      {/* Back Button */}
      <Box sx={backButtonContainerStyles}>
        <IconButton onClick={handleBack} sx={backButtonStyles}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={backTextStyles}>
          Back
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper elevation={0} sx={paperStyles}>
        <Box sx={searchFilterContainerStyles}>
          <Box sx={searchBoxStyles}>
            <Box sx={searchFieldStyles}>
              <Typography variant="subtitle2" sx={searchLabelStyles}>
                Search by
              </Typography>
              <Box sx={searchInputContainerStyles}>
                <TextField
                  placeholder="search by username / user ID / email address"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  fullWidth
                  sx={textFieldStyles()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: {
                      height: '40px',
                      '& .MuiInputBase-input': {
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={searchButtonStyles}
                >
                  Search
                </Button>
              </Box>
            </Box>

            <Box sx={statusFilterStyles}>
              <Typography variant="subtitle2" sx={searchLabelStyles}>
                Status
              </Typography>
              <FormControl variant="outlined" size="small" fullWidth>
                <Select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  label=""
                  sx={selectStyles}
                >
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={statusFilterStyles}>
              <Typography variant="subtitle2" sx={searchLabelStyles}>
                Region
              </Typography>
              <FormControl variant="outlined" size="small" fullWidth>
                <Select
                  value={regionFilter}
                  onChange={handleRegionChange}
                  label=""
                  sx={selectStyles}
                  disabled={regionsLoading}
                >
                  {regionsLoading ? (
                    <MenuItem sx={menuItemStyles} value="">
                      Loading...
                    </MenuItem>
                  ) : regionsError ? (
                    <MenuItem sx={menuItemStyles} value="">
                      Error loading regions
                    </MenuItem>
                  ) : (
                    approvedRegions.map((region) => (
                      <MenuItem
                        key={region.regionCode}
                        sx={menuItemStyles}
                        value={region.regionCode}
                      >
                        {region.regionName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={handleCreateNew}
            sx={createButtonStyles}
          >
            Create New
          </Button>
        </Box>
      </Paper>

      {/* Table Section */}
      <Paper elevation={0} sx={tableContainerStyles}>
        <TableContainer component={Paper} elevation={0}>
          <Box sx={mobileTableWrapperStyles}>
            <Table>
              <colgroup>
                <col style={{ width: '8%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <TableHead>
                <TableRow sx={tableHeadRowStyles}>
                  <TableCell sx={tableCellStyles}>Sr.No.</TableCell>
                  <TableCell sx={tableCellStyles}>
                    <Box sx={sortableHeaderStyles}>
                      User Name
                      <UnfoldMoreIcon sx={sortIconStyles} />
                    </Box>
                  </TableCell>
                  <TableCell sx={tableCellStyles}>
                    <Box sx={sortableHeaderStyles}>
                      User ID
                      <UnfoldMoreIcon sx={sortIconStyles} />
                    </Box>
                  </TableCell>
                  <TableCell sx={tableCellStyles}>
                    <Box sx={sortableHeaderStyles}>
                      Role
                      <UnfoldMoreIcon sx={sortIconStyles} />
                    </Box>
                  </TableCell>
                  <TableCell sx={tableCellStyles}>
                    <Box sx={sortableHeaderStyles}>
                      Region
                      <UnfoldMoreIcon sx={sortIconStyles} />
                    </Box>
                  </TableCell>
                  <TableCell sx={tableCellStyles}>Status</TableCell>
                  <TableCell sx={tableHeaderActionCellStyles}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={tableBodyStyles}>
                {displayUsers.map((user, index) => (
                  <TableRow key={user.srNo} sx={tableRowStyles}>
                    <TableCell sx={bodyCellStyles}>
                      {String(index + 1).padStart(2, '0')}
                    </TableCell>
                    <TableCell sx={bodyCellStyles}>{user.username}</TableCell>
                    <TableCell sx={bodyCellStyles}>{user.userId}</TableCell>
                    <TableCell sx={bodyCellStyles}>
                      {user.role || '-'}
                    </TableCell>
                    <TableCell sx={bodyCellStyles}>
                      {user.region || '-'}
                    </TableCell>
                    <TableCell sx={bodyCellStyles}>
                      <Box sx={statusContainerStyles}>
                        {user.status === 'APPROVED' && (
                          <Box sx={statusIndicatorStyles} />
                        )}
                        <Typography
                          variant="body2"
                          sx={statusTextStyles(
                            user.status === 'APPROVED' ? 'Approved' : 'Rejected'
                          )}
                        >
                          {/* {user.status === 'APPROVED' ? 'Approved' : 'Rejected'} */}
                          {user.status === 'APPROVED'
                            ? 'Approved'
                            : user.status === 'SUSPENDED'
                              ? 'Suspended'
                              : 'Rejected'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={actionTableCellStyles}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleClickAction(e, user)}
                        sx={actionButtonStyles}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box sx={paginationContainerStyles}>
        <Typography variant="body2" sx={paginationTextStyles}>
          Showing data {Math.min(page * rowsPerPage + 1, totalElements)} of{' '}
          {totalElements}
        </Typography>

        <Box sx={paginationButtonContainerStyles}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, page - 1)}
            disabled={page === 0}
            sx={paginationButtonStyles(page === 0)}
          >
            &lt; Previous
          </Button>

          {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
            const pageNumber = i;
            return (
              <Button
                key={pageNumber}
                variant={page === pageNumber ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleChangePage(null, pageNumber)}
                sx={pageButtonStyles(page === pageNumber)}
              >
                {pageNumber + 1}
              </Button>
            );
          })}

          <Button
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, page + 1)}
            disabled={page >= totalPages - 1}
            sx={paginationButtonStyles(page >= totalPages - 1)}
          >
            Next &gt;
          </Button>
        </Box>
      </Box>

      {/* Deactivate User Modal */}
      <DeactivateUserModal
        open={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        userId={selectedUser?.userId || ''}
      />

      {/* Suspend Branch Modal */}
      <SuspendUserModal
        open={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        userId={selectedUser?.userId || ''}
      />

      {/* Revoke Suspension Modal */}
      <RevokeUserModal
        open={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        userName={selectedUser?.username || ''}
        onConfirm={async () => {
          // console.log('Revoking user suspension with data:', data);
          // TODO: Implement actual API call
          return true; // Return true on success, false on error
        }}
      />
    </Container>
  );
};

export default CreateModifyUser;
