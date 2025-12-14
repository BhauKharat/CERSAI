/* eslint-disable @typescript-eslint/no-explicit-any */
// slices/workflowSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../../../redux/store';

// Base selectorsw
export const selectWorkflowState = (state: RootState) => state.workflow;
export const selectAllApprovals = (state: RootState) =>
  state.workflow.approvals;
export const selectFilteredApprovals = (state: RootState) =>
  state.workflow.filteredApprovals;
export const selectSelectedApproval = (state: RootState) =>
  state.workflow.selectedApproval;
export const selectLoading = (state: RootState) => state.workflow.loading;
export const selectError = (state: RootState) => state.workflow.error;
export const selectFilters = (state: RootState) => state.workflow.filters;

// Computed selectors
export const selectTotalApprovals = createSelector(
  [selectFilteredApprovals],
  (filteredApprovals) => filteredApprovals.length
);

export const selectCurrentPageData = createSelector(
  [selectFilteredApprovals, selectFilters],
  (filteredApprovals, filters) => {
    const startIndex = (filters.currentPage - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    return filteredApprovals.slice(startIndex, endIndex);
  }
);

export const selectPaginationInfo = createSelector(
  [selectTotalApprovals, selectFilters],
  (totalApprovals, filters) => ({
    current: filters.currentPage,
    pageSize: filters.pageSize,
    total: totalApprovals,
    totalPages: Math.ceil(totalApprovals / filters.pageSize),
  })
);

export const selectHasNextPage = createSelector(
  [selectPaginationInfo],
  (paginationInfo) => paginationInfo.current < paginationInfo.totalPages
);

export const selectHasPrevPage = createSelector(
  [selectFilters],
  (filters) => filters.currentPage > 1
);

export const selectStatusOptions = () => [
  { value: 'All', label: 'All Status' },
  { value: 'PENDING', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
];

// Selector for getting approval statistics
export const selectApprovalStats = createSelector(
  [selectAllApprovals],
  (approvals) => {
    const stats = approvals.reduce(
      (acc: any, approval: any) => {
        acc[approval.approvalStatus] = (acc[approval.approvalStatus] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: approvals.length,
      pending: stats.PENDING || 0,
      approved: stats.APPROVED || 0,
      rejected: stats.REJECTED || 0,
      inProgress: stats.IN_PROGRESS || 0,
    };
  }
);

// Selector for activity type distribution
export const selectActivityStats = createSelector(
  [selectAllApprovals],
  (approvals) => {
    const stats = approvals.reduce(
      (acc: any, approval: any) => {
        acc[approval.userAccountAction] =
          (acc[approval.userAccountAction] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return stats;
  }
);
