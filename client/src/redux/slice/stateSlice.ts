import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../contants";

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

interface AnneeStats {
  Operateur: any;
  Vihicle: any;
  CAPACITÉ: any;
}

interface VehicleGlobalStats {
  totalVehicles: number;
  stoppedVehicles: number;
  changedLineVehicles: number;
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
  travailleur: TransportStats | null;
  anneeStats: AnneeStats | null;
  vehicleGlobalStats: VehicleGlobalStats | null;
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
  travailleur: null,
  anneeStats: null,
  vehicleGlobalStats: null,
  loading: false,
  error: null,
};

export const fetchAllStats = createAsyncThunk(
  "stats/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/state/all`);
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
    let url = `${API_URL}/api/v1/state/statsInterCommunal`;
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);

    return response.data[0];
  }
);

export const fetchInterWilayaStats = createAsyncThunk(
  'stats/fetchInterWilaya',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = `${API_URL}/api/v1/state/statsInterWilaya`;
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    console.log(response)
    return response.data[0];
  }
);

export const fetchRuralStats = createAsyncThunk(
  'stats/fetchRural',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = `${API_URL}/api/v1/state/statsInterRural`;
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

export const fetchUrbainStats = createAsyncThunk(
  'stats/fetchUrbain',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = `${API_URL}/api/v1/state/statsInterUrbain`;
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

export const fetchScolaireStats = createAsyncThunk(
  'stats/fetchScolaire',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = `${API_URL}/api/v1/state/statsInterScolaire`;
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

export const fetchtravailleursStats = createAsyncThunk(
  'stats/fetchtravailleurs',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = `${API_URL}/api/v1/state/transportTravailleurs`;
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url);
    return response.data[0];
  }
);

export const fetchAnneeStats = createAsyncThunk(
  'stats/fetchAnneeStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    let url = `${API_URL}/api/v1/state/statistique-annee`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axios.get(url);
    return response.data; // { Operateur, Vihicle, CAPACITÉ }
  }
);

export const fetchVehicleGlobalStats = createAsyncThunk<
  VehicleGlobalStats
>(
  "stats/fetchVehicleGlobalStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/state/stats-compt`
      );

      return response.data;

    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch vehicle stats"
      );
    }
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
      })


      // Travailleurs
      .addCase(fetchtravailleursStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchtravailleursStats.fulfilled, (state, action) => {
        state.loading = false;
        state.travailleur = action.payload;
      })
      .addCase(fetchtravailleursStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading Scolaire stats';
      })



      // annee 
      .addCase(fetchAnneeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnneeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.anneeStats = action.payload;
      })
      .addCase(fetchAnneeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading annual stats';
      })

      //
      // Vehicle Global Stats
      .addCase(fetchVehicleGlobalStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleGlobalStats.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleGlobalStats = action.payload;
      })
      .addCase(fetchVehicleGlobalStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export default statsSlice.reducer;
