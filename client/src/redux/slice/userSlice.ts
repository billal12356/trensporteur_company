import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  message: null,
};

// === Create User (Admin) ===
export const createUser = createAsyncThunk(
  "user/create",
  async (userData: Omit<User, "_id"> & { password: string; passwordConfirm: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post("http://localhost:3000/api/v1/users/create", userData);
      return res.data;
    } catch (err: any) {
        console.log(err);
        
      return rejectWithValue(err.response?.data?.message || "فشل إنشاء المستخدم");
    }
  }
);

// === Fetch User by ID ===
export const fetchUserById = createAsyncThunk(
  "user/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/users/${id}`);
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
      const res = await axios.patch(`http://localhost:3000/api/v1/users/${id}`, data);
      return res.data;
    } catch (err: any) {
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
        `http://localhost:3000/api/v1/users/${id}/change-password`,
        { currentPassword, newPassword, confirmPassword }
      );
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "فشل تغيير كلمة المرور");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ===== Create User =====
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
        toast.success("تم إنشاء المستخدم بنجاح");
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // ===== Fetch User =====
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
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // ===== Update User =====
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        toast.success("تم تحديث المستخدم بنجاح");
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // ===== Change Password =====
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
        toast.success(action.payload);
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;
