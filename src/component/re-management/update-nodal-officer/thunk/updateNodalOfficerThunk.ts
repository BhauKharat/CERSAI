/* eslint-disable prettier/prettier */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Secured } from "../../../../utils/HelperFunctions/api";
import { API_ENDPOINTS } from "Constant";
import { AxiosError } from "axios";

interface IUploadData {
    formData: FormData
}

export const updateNodalOfficerThunk = createAsyncThunk(
    're/update-officers',
    async (data: IUploadData, thunkAPI) => {
        try {

            const response = await Secured.post(API_ENDPOINTS.UPDATE_OFFICERS, data.formData,
                {
                    headers: {
                      'Content-Type': 'multipart/form-data'
                    }
                  }
            )

            return response.data

        } catch (err: unknown) {
            const error = err as AxiosError;

            if (error.response) {
                return thunkAPI.rejectWithValue(error.response.data);
            }

            return thunkAPI.rejectWithValue(error.message);


        }
    })