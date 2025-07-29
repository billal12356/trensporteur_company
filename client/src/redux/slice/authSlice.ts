import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";
import { API_URL } from "../contants";

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
  isLoading: boolean;
  emailSent: boolean;
  codeVerified: boolean;
}

const initialState: AuthState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null,
  token: localStorage.getItem("token") || null,
  loading: false,
  message: "",
  error: null,
  isLoading: false,
  emailSent: false,
  codeVerified: false,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/login`,
        userData,
        { withCredentials: true }
      );
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
      const response = await axios.post(
        `${API_URL}/api/v1/auth/logout`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Logout failed");
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/reset-password`, { email });
      toast.success(response.data.message);
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
      return rejectWithValue(err.response.data);
    }
  }
);

export const verifyCode = createAsyncThunk(
  "auth/verifyCode",
  async (
    { email, code }: { email: string; code: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/verify-code`, { email, code });
      toast.success(response.data.message);
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid code");
      return rejectWithValue(err.response.data);
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    data: { email: string; password: string; ConfirmePassword: string },
    { rejectWithValue }
  ) => {
    try {
      console.log(data.password + ' ' + data.ConfirmePassword)
      const response = await axios.post(`${API_URL}/api/v1/auth/change-password`, data);
      toast.success(response.data.message);
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not change password");
      return rejectWithValue(err.response.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
        toast.success("تم تسجيل الدخول بنجاح");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        toast.success(action.payload.message);
        state.message = action.payload.message as string;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.emailSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify Code
      .addCase(verifyCode.fulfilled, (state) => {
        state.codeVerified = true;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
