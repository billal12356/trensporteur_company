import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

type TimeStats = { today: number; thisMonth: number; thisYear: number };

interface StatsState {
  data: {
    operateurs: TimeStats;
    chauffeurs: TimeStats;
    vehicules: TimeStats;
  };
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  data: {
    operateurs: { today: 0, thisMonth: 0, thisYear: 0 },
    chauffeurs: { today: 0, thisMonth: 0, thisYear: 0 },
    vehicules: { today: 0, thisMonth: 0, thisYear: 0 },
  },
  loading: false,
  error: null,
};

export const fetchAllStats = createAsyncThunk(
  "stats/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("https://trensporteur-company.onrender.com/api/v1/state/all");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch stats");
    }
  }
);

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStats.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default statsSlice.reducer;
