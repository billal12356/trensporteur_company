import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

type TimeStats = { today: number; thisMonth: number; thisYear: number };

interface TransportStats {
  type: string;
  nbVehicules: number;
  nbPlaces: number;
  nbOperators: number;
  avgAge: number;
  en_activite: number;
  arret: number;
  totalTrajets: number;
}

interface StatsState {
  data: {
    operateurs: TimeStats;
    chauffeurs: TimeStats;
    vehicules: TimeStats;
  };
  interCommune: TransportStats | null;
  interWilaya: TransportStats | null;
  rural: TransportStats | null;
  urbain: TransportStats | null;
  scolaire: TransportStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  data: {
    operateurs: { today: 0, thisMonth: 0, thisYear: 0 },
    chauffeurs: { today: 0, thisMonth: 0, thisYear: 0 },
    vehicules: { today: 0, thisMonth: 0, thisYear: 0 },
  },
  interCommune: null,
  interWilaya: null,
  rural: null,
  urbain: null,
  scolaire: null,
  loading: false,
  error: null,
};

export const fetchAllStats = createAsyncThunk(
  "stats/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/state/all");
      console.log(res);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch stats");
    }
  }
);

export const fetchInterCommuneStats = createAsyncThunk(
  'stats/fetchInterCommune',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = 'http://localhost:3000/api/v1/state/statsInterCommunal';
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

export const fetchInterWilayaStats = createAsyncThunk(
  'stats/fetchInterWilaya',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = 'http://localhost:3000/api/v1/state/statsInterWilaya';
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

export const fetchRuralStats = createAsyncThunk(
  'stats/fetchRural',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = 'http://localhost:3000/api/v1/state/statsInterRural';
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

export const fetchUrbainStats = createAsyncThunk(
  'stats/fetchUrbain',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = 'http://localhost:3000/api/v1/state/statsInterUrbain';
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

export const fetchScolaireStats = createAsyncThunk(
  'stats/fetchScolaire',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = 'http://localhost:3000/api/v1/state/statsInterScolaire';
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All stats
      .addCase(fetchAllStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStats.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Inter-commune
      .addCase(fetchInterCommuneStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterCommuneStats.fulfilled, (state, action) => {
        state.loading = false;
        state.interCommune = action.payload;
      })
      .addCase(fetchInterCommuneStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading Inter-Commune stats';
      })

      // Inter-wilaya
      .addCase(fetchInterWilayaStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterWilayaStats.fulfilled, (state, action) => {
        state.loading = false;
        state.interWilaya = action.payload;
      })
      .addCase(fetchInterWilayaStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading Inter-Wilaya stats';
      })

      // Rural
      .addCase(fetchRuralStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRuralStats.fulfilled, (state, action) => {
        state.loading = false;
        state.rural = action.payload;
      })
      .addCase(fetchRuralStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading Rural stats';
      })

      // Urbain
      .addCase(fetchUrbainStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUrbainStats.fulfilled, (state, action) => {
        state.loading = false;
        state.urbain = action.payload;
      })
      .addCase(fetchUrbainStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading Urbain stats';
      })

      // Scolaire
      .addCase(fetchScolaireStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScolaireStats.fulfilled, (state, action) => {
        state.loading = false;
        state.scolaire = action.payload;
      })
      .addCase(fetchScolaireStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading Scolaire stats';
      });
  },
});

export default statsSlice.reducer;
