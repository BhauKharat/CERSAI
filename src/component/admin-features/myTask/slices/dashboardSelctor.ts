import { RootState } from '../../../../redux/store';

const selectDashboardSubUserState = (state: RootState) =>
  state.dahsboardSubUser;

export const selectCurrentPageData = (state: RootState) =>
  selectDashboardSubUserState(state).currentPageData;

export const selectLoading = (state: RootState) =>
  selectDashboardSubUserState(state).loading;

export const selectDetailLoading = (state: RootState) =>
  selectDashboardSubUserState(state).detailLoading;

export const selectError = (state: RootState) =>
  selectDashboardSubUserState(state).error;

export const selectFilters = (state: RootState) =>
  selectDashboardSubUserState(state).filters;

export const selectTotalUsers = (state: RootState) =>
  selectDashboardSubUserState(state).totalUsers;

export const selectTotalPages = (state: RootState) =>
  selectDashboardSubUserState(state).totalPages;

export const selectSelectedUser = (state: RootState) =>
  selectDashboardSubUserState(state).selectedUser;

export const selectDetailedUser = (state: RootState) =>
  selectDashboardSubUserState(state).detailedUser;

export const selectHasNextPage = (state: RootState) =>
  selectDashboardSubUserState(state).hasNextPage;

export const selectHasPrevPage = (state: RootState) =>
  selectDashboardSubUserState(state).hasPrevPage;
