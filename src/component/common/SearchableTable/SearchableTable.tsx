import React, { ReactNode, useEffect } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import * as styles from './SearchableTable.styles';

interface TableColumn<T> {
  id: keyof T | string;
  label: string;
  style?: React.CSSProperties;
  sortable?: boolean;
}

type Order = 'asc' | 'desc';

// Extend the interface to handle multiple dropdowns
interface SearchableTableProps<T extends { id?: number }> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  tableData: T[];
  columns: TableColumn<T>[];
  renderRow: (row: T, index: number) => React.ReactNode;
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  searchPlaceholder: string;
  order: Order;
  orderBy: keyof T | '';
  handleRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof T
  ) => void;

  // Props for the status dropdown
  showStatusDropdown?: boolean;
  statusValue?: string;
  handleStatusChange?: (
    event: SelectChangeEvent<string>,
    child: ReactNode
  ) => void;
  statusOptions?: string[];

  // Props for the new "Region" dropdown
  showRegionDropdown?: boolean;
  regionValue?: string;
  handleRegionChange?: (
    event: SelectChangeEvent<string>,
    child: ReactNode
  ) => void;
  regionOptions?: string[];

  // Props for the new "Creation" dropdown
  showBranchDropdown?: boolean;
  branchValue?: string;
  handleBranchChange?: (
    event: SelectChangeEvent<string>,
    child: ReactNode
  ) => void;
  branchOptions?: string[];

  // Props for role dropdown
  showRoleDropdown?: boolean;
  roleValue?: string;
  handleRoleChange?: (
    event: SelectChangeEvent<string>,
    child: ReactNode
  ) => void;
  roleOptions?: string[];
  roleLabel?: string; // Custom label for role dropdown

  totalElement?: number | 0;
  hideSearchButton?: boolean;
  onClear?: () => void; // Clear button handler
}

const SearchableTable = <T extends { id?: number }>({
  searchTerm,
  setSearchTerm,
  handleSearch,
  tableData,
  columns,
  renderRow,
  page,
  rowsPerPage,
  handleChangePage,
  searchPlaceholder,
  order, // eslint-disable-line @typescript-eslint/no-unused-vars
  orderBy, // eslint-disable-line @typescript-eslint/no-unused-vars
  handleRequestSort,
  showStatusDropdown = false,
  statusValue,
  handleStatusChange,
  statusOptions = [],
  showRegionDropdown = false,
  regionValue,
  handleRegionChange,
  regionOptions = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showBranchDropdown = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  branchValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleBranchChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  branchOptions = [],
  showRoleDropdown = false,
  roleValue,
  handleRoleChange,
  roleOptions = [],
  roleLabel = 'Role',
  totalElement,
  hideSearchButton = false,
  onClear,
}: SearchableTableProps<T>) => {
  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      handleRequestSort(event, property);
    };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - 30) : 0;

  useEffect(() => {
    console.log('empty Row;--', emptyRows);
  }, [emptyRows]);

  return (
    <>
      {/* Search and Filter Section */}
      <Grid
        container
        spacing={2}
        sx={{
          mb: 2,
          ml: 2,
        }}
      >
        {/* First Row: Filters and Buttons */}
        <Grid
          container
          size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
          spacing={2}
          sx={{ alignItems: 'flex-end' }}
        >
          {/* Role Dropdown */}
          {showRoleDropdown && (
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: '#333' }}
                >
                  {roleLabel}
                </Typography>
                <Select
                  name="roleFilter"
                  value={roleValue || ''}
                  onChange={handleRoleChange}
                  size="small"
                  fullWidth
                  displayEmpty
                  className="textFieldStyles"
                  sx={{
                    height: '40px',
                    '& .MuiSelect-select': {
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {roleOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Grid>
          )}

          {/* Region Dropdown */}
          <Grid
            size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }}
            sx={{
              visibility: showRegionDropdown ? 'visible' : 'hidden',
              opacity: showRegionDropdown ? 1 : 0,
              pointerEvents: showRegionDropdown ? 'auto' : 'none',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, color: '#333' }}
              >
                Region
              </Typography>
              <Select
                name="regionFilter"
                value={regionValue || ''}
                onChange={handleRegionChange}
                size="small"
                fullWidth
                displayEmpty
                className="textFieldStyles"
                sx={{
                  height: '40px',
                  '& .MuiSelect-select': {
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="">All Regions</MenuItem>
                {regionOptions.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Grid>

          {/* Branch Dropdown */}
          <Grid
            size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }}
            sx={{
              visibility: showBranchDropdown ? 'visible' : 'hidden',
              opacity: showBranchDropdown ? 1 : 0,
              pointerEvents: showBranchDropdown ? 'auto' : 'none',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, color: '#333' }}
              >
                Branch
              </Typography>
              <Select
                name="branchFilter"
                value={branchValue || ''}
                onChange={handleBranchChange}
                size="small"
                fullWidth
                displayEmpty
                className="textFieldStyles"
                sx={{
                  height: '40px',
                  '& .MuiSelect-select': {
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="">All Branches</MenuItem>
                {branchOptions.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Grid>

          {/* Status Dropdown */}
          {showStatusDropdown && (
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: '#333' }}
                >
                  Activity
                </Typography>
                <Select
                  name="statusFilter"
                  value={statusValue || ''}
                  onChange={handleStatusChange}
                  size="small"
                  fullWidth
                  displayEmpty
                  className="textFieldStyles"
                >
                  <MenuItem value="">All Activity</MenuItem>
                  {statusOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Grid>
          )}

          {/* Search and Clear Buttons */}
          {!hideSearchButton && (
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: 'transparent' }}
                >
                  &nbsp;
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    sx={{
                      textTransform: 'none',
                      minWidth: '100px',
                      height: '40px',
                      padding: '0 24px',
                      borderRadius: '4px',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      backgroundColor: '#002CBA',
                      boxSizing: 'border-box',
                      '&:hover': {
                        backgroundColor: '#001f8e',
                      },
                      '@media (max-width: 768px)': {
                        height: '44px',
                        padding: '0 16px',
                      },
                    }}
                  >
                    Search
                  </Button>
                  {onClear && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={onClear}
                      sx={{
                        textTransform: 'none',
                        minWidth: '100px',
                        height: '40px',
                        padding: '0 24px',
                        borderRadius: '4px',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        backgroundColor: 'white',
                        borderColor: '#002CBA',
                        color: '#002CBA',
                        boxSizing: 'border-box',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          borderColor: '#001f8e',
                        },
                        '@media (max-width: 768px)': {
                          height: '44px',
                          padding: '0 16px',
                        },
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Second Row: Content Search */}
        <Grid
          container
          size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
          sx={{ justifyContent: 'flex-end', mt: -1 }}
        >
          <Grid size={{ xs: 12, sm: 12, md: 2.8, lg: 3.0, xl: 2.4 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 0, fontWeight: 500, color: 'transparent' }}
              >
                &nbsp;
              </Typography>
              <TextField
                placeholder={searchPlaceholder}
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  e.key === 'Enter' && handleSearch()
                }
                fullWidth
                sx={styles.textFieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ marginRight: '0px' }}
                    >
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    height: '40px',
                    '& .MuiInputBase-input': {
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '4px',
                    },
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
      {/* <Paper elevation={0} sx={styles.paperStyles}>
        <Box sx={styles.searchContainerStyles}>
          <Box sx={styles.searchFilterRowStyles}>
            <Box sx={styles.searchInputContainerStyles}>
              <Typography variant="subtitle2" sx={styles.searchLabelStyles}>
                Search by
              </Typography>
              <Box sx={styles.searchInputWrapperStyles}>
                <TextField
                  placeholder={searchPlaceholder}
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  fullWidth
                  sx={styles.textFieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: {
                      height: '50px',
                      '& .MuiInputBase-input': {
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                      },
                    },
                  }}
                />

                {showStatusDropdown && (
                  <Select
                    name="statusFilter"
                    value={statusValue || ''}
                    onChange={handleStatusChange}
                    size="small"
                    fullWidth
                    displayEmpty
                    className="textFieldStyles"
                    sx={{ marginLeft: '16px' }}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    {statusOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}

                {showRegionDropdown && (
                  <Select
                    name="regionFilter"
                    value={regionValue || ''}
                    onChange={handleRegionChange}
                    size="small"
                    fullWidth
                    displayEmpty
                    className="textFieldStyles"
                    sx={{ marginLeft: '16px' }}
                  >
                    <MenuItem value="">Select Regions</MenuItem>
                    {regionOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                {showBranchDropdown && (
                  <Select
                    name="branchFilter"
                    value={branchValue || ''}
                    onChange={handleBranchChange}
                    size="small"
                    fullWidth
                    displayEmpty
                    className="textFieldStyles"
                    sx={{ marginLeft: '16px' }}
                  >
                    <MenuItem value="">Select Branch</MenuItem>
                    {branchOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}

                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={styles.buttonStyles('contained')}
                >
                  Search
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper> */}

      {/* Table Section (no change) */}
      <Paper elevation={0} sx={styles.containerStyles}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={styles.tableContainerStyles}
        >
          <Table>
            <colgroup>
              {columns.map((col, key) => (
                <col key={String(key)} style={col.style} />
              ))}
            </colgroup>
            <TableHead>
              <TableRow sx={styles.tableHeadRowStyles}>
                {columns.map((col, key) => (
                  <TableCell
                    key={key}
                    sx={
                      col.sortable
                        ? styles.sortableHeaderCellStyles
                        : styles.tableCellStyles
                    }
                    onClick={
                      col.sortable
                        ? createSortHandler(col.id as keyof T)
                        : undefined
                    }
                  >
                    {col.sortable ? (
                      <Box sx={styles.sortContainerStyles}>
                        {col.label}
                        <Box sx={styles.sortIconContainerStyles}>
                          <UnfoldMoreIcon fontSize="small" />
                        </Box>
                      </Box>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={styles.tableBodyStyles}>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{
                      py: 4,
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '16px',
                      color: '#666',
                    }}
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row, index) => renderRow(row, index))
              )}
            </TableBody>
            {emptyRows > 0 && tableData.length > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={columns.length} />
              </TableRow>
            )}
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination (no change) */}
      <Box sx={styles.paginationContainerStyles}>
        <Typography variant="body2" sx={styles.paginationTextStyles}>
          Showing data {Math.min((page + 1) * rowsPerPage, totalElement || 0)}{' '}
          of {totalElement || 0}
        </Typography>

        <Box sx={styles.paginationButtonContainerStyles}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, page - 1)}
            disabled={page === 0}
            sx={styles.paginationButtonStyles(page === 0)}
          >
            &lt; Previous
          </Button>
          {Array.from({ length: 3 }, (_, i) => {
            const pageNumber = page + i - 1;
            console.log('rowsPerPage ->', rowsPerPage);
            if (
              pageNumber < 0 ||
              pageNumber >=
                Math.ceil((totalElement ? totalElement : 0) / rowsPerPage)
            )
              return null;
            return (
              <Button
                key={pageNumber}
                variant={page === pageNumber ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleChangePage(null, pageNumber)}
                sx={styles.pageButtonStyles(page === pageNumber)}
              >
                {pageNumber + 1}
              </Button>
            );
          })}
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, page + 1)}
            disabled={page >= Math.ceil((totalElement || 0) / rowsPerPage) - 1}
            sx={styles.paginationButtonStyles(
              page >= Math.ceil((totalElement || 0) / rowsPerPage) - 1
            )}
          >
            Next &gt;
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default SearchableTable;
