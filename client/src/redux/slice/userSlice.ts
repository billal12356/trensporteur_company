import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

export interface User {
    _id: string;
    fullName: string;
    email: string;
}

interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
    message:string | null;
}


const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
    message: ""
};


export const fetchUserById = createAsyncThunk(
    "user/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await axios.get(`https://trensporteur-company.onrender.comapi/v1/users/${id}`);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "خطأ في تحميل بيانات المستخدم");
        }
    }
);

// === Update User ===
export const updateUser = createAsyncThunk(
    "user/update",
    async (
        { id, data }: { id: string; data: Partial<User> },
        { rejectWithValue }
    ) => {
        try {
            console.log(data);
            
            const res = await axios.patch(`https://trensporteur-company.onrender.comapi/v1/users/${id}`, data);
            console.log(res.data);
            
            return res.data;
        } catch (err: any) {
            console.log(err);
            
            return rejectWithValue(err.response?.data?.message || "فشل تحديث بيانات المستخدم");
        }
    }
);



// === Change Password ===
export const changePassword = createAsyncThunk(
    "user/changePassword",
    async (
        {
            id,
            currentPassword,
            newPassword,
            confirmPassword,
        }: {
            id: string;
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const res = await axios.patch(
                `https://trensporteur-company.onrender.comapi/v1/users/${id}/change-password`,
                { currentPassword, newPassword, confirmPassword }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "فشل تغيير كلمة المرور");
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            // ====== Fetch User ======
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "فشل تحميل بيانات المستخدم";
            })

            // ====== Update User ======
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "فشل تحديث المستخدم";
            })

            // ====== Change Password ======
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state,action) => {
                state.loading = false;
                state.message = action.payload
                toast.success(action.payload)
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "فشل تغيير كلمة المرور";
            });
    },
});


export default userSlice.reducer;
