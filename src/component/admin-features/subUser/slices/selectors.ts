/* eslint-disable @typescript-eslint/no-unused-vars */
// features/subUser/selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../../redux/store'; // Adjust import path as needed

// Basic selectors
export const selectSubUserState = (state: RootState) => state.subUser;
export const selectUsers = (state: RootState) => state.subUser.users;
export const selectFilteredUsers = (state: RootState) =>
  state.subUser.filteredUsers;
export const selectTotalUsers = (state: RootState) => state.subUser.totalUsers;
export const selectLoading = (state: RootState) => state.subUser.loading;
export const selectError = (state: RootState) => state.subUser.error;
export const selectFilters = (state: RootState) => state.subUser.filters;
export const selectSelectedUser = (state: RootState) =>
  state.subUser.selectedUser;

// Computed selectors
// export const selectCurrentPageData = createSelector(
//   [selectFilteredUsers, selectFilters],
//   (filteredUsers, filters) => {
//     const startIndex = (filters.currentPage - 1) * filters.pageSize;
//     const endIndex = startIndex + filters.pageSize;
//     return filteredUsers.slice(startIndex, endIndex);
//   }
// );

export const selectCurrentPageData = createSelector(
  [(state: RootState) => state.subUser.users],
  (users) => users
);

export const selectTotalPages = createSelector(
  [selectTotalUsers, selectFilters],
  (totalUsers, filters) => Math.ceil(totalUsers / filters.pageSize)
);

export const selectHasNextPage = createSelector(
  [selectFilters, selectTotalPages],
  (filters, totalPages) => filters.currentPage < totalPages
);

export const selectHasPrevPage = createSelector(
  [selectFilters],
  (filters) => filters.currentPage > 1
);

export const selectPaginationInfo = createSelector(
  [selectFilters, selectTotalUsers],
  (filters, totalUsers) => {
    const startIndex = (filters.currentPage - 1) * filters.pageSize + 1;
    const endIndex = Math.min(
      filters.currentPage * filters.pageSize,
      totalUsers
    );
    return {
      startIndex,
      endIndex,
      total: totalUsers,
      currentPage: filters.currentPage,
    };
  }
);

// Status options for dropdowns
export const selectStatusOptions = createSelector([selectUsers], (users) => {
  // Return predefined status options based on your UI requirements
  return [
    { value: 'Approved', label: 'Approved' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'ALL', label: 'All Statuses' },
  ];
});
