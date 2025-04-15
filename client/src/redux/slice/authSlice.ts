import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";
interface User {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
}

interface AuthState {
    user: { data: User } | null; 
    token: string | null;
    loading: boolean;
    message: string;
    error: string | null;
}

const initialState: AuthState = {
    user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") as string) // ✅ فك تشفير البيانات
        : null,
    token: localStorage.getItem("token") || null,
    loading: false,
    message: "",
    error: null,
};


export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (userData: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post("https://trensporteur-company.onrender.com/api/v1/auth/login", userData, { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message ?? "حدث خطأ غير معروف");
            }
            return rejectWithValue("حدث خطأ غير معروف");
        }
    }
);


export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post("https://trensporteur-company.onrender.com/api/v1/auth/logout", {}, { withCredentials: true });
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || "Logout failed");
            }
            return rejectWithValue("An unexpected error occurred");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem("user", JSON.stringify(action.payload.user));
                toast.success(action.payload.user.message)
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string)

            });

        // Logout cases
        builder.addCase(logout.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(logout.fulfilled, (state, action) => {
            state.loading = false;
            state.user = null;
            localStorage.removeItem('user');
            toast.success(action.payload.message)
            state.message = action.payload.message as string
        });
        builder.addCase(logout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export default authSlice.reducer;
