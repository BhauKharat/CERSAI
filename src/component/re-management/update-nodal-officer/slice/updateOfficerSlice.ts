import { createSlice } from '@reduxjs/toolkit';
import { updateNodalOfficerThunk } from '../thunk/updateNodalOfficerThunk';

/* eslint-disable prettier/prettier */
export interface IResponseMsg {
    success: boolean;
    errorMessage: string;
    type: string;
    timestamp: string;
    data: IData;
}


interface IData {
    workflowId?: string;
    status?: string;
    createdAt?: string;
    path?: string
}


interface IRes {
    data: IResponseMsg
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error:  string | IResponseMsg | null;
}

const initialState: IRes = {
    data: {
        success: false,
        errorMessage: "",
        type: "",
        timestamp: "",
        data: {
            workflowId: "",
            status: "",
            createdAt: "",
            path: ''
        }
    },
    loading: "idle",
    error: null
}


const updateOfficerSlice = createSlice({
    name: "update-officer",
    initialState,
    reducers: {
        resetState:() => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(updateNodalOfficerThunk.pending, (state) => {
            state.loading = 'pending';
            state.error = null;
        }).addCase(updateNodalOfficerThunk.fulfilled, (state, action) => {
            state.loading = 'succeeded';
            state.data = action.payload
        })
            .addCase(updateNodalOfficerThunk.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
    }
})

export const { resetState } = updateOfficerSlice.actions;
export default updateOfficerSlice.reducer