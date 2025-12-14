/* eslint-disable prettier/prettier */
import { AuthState } from "@redux/types/register/authSliceTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Secured } from "../../../../utils/HelperFunctions/api";
import { API_ENDPOINTS } from "Constant";
import { INodalOfficerDetails } from "../slice/nodalOfficerPreviewSlice";

export const nodalOfficePreview = createAsyncThunk<
  INodalOfficerDetails,
  string,
  { state: { auth: AuthState }; rejectValue: string }
>('entities/details', async (applicationId, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as { auth: AuthState };
    const token = state.auth.authToken;

    if (!token)
      return thunkAPI.rejectWithValue('Authentication token not found.');

    const response = await Secured.get(
      API_ENDPOINTS.ENTITIES_DETAILS(applicationId)
    );

    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Submission failed' + err);
  }
});