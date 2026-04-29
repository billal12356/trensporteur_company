import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../contants";
import {
  CanevasState,
  CanevasData,
} from "@/pages/canevas_transport/types/canevas-types";

// ============================
// Initial State
// ============================

const initialState: CanevasState = {
  data: null as unknown as CanevasData,
  loading: false,
  saving: false,
  error: null,
};

// ============================
// Async Thunks
// ============================

/** Récupérer les données calculées du canevas depuis le serveur */
export const fetchCanevasData = createAsyncThunk(
  "canevas/fetchData",
  async (
    params: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/state/canevas-transport`,
        {
          params,
          withCredentials: true,
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Échec du chargement des données du canevas"
      );
    }
  }
);

/** Exporter vers Excel (téléchargement direct depuis le serveur) */
export const exportCanevasExcel = createAsyncThunk<
  void,
  { startDate?: string; endDate?: string },
  { rejectValue: string }
>("canevas/exportExcel", async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/v1/state/canevas-transport/export`,
      {
        params,
        responseType: "blob",
        withCredentials: true,
      }
    );

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Canevas_01_Transport_${params.startDate || "all"}_${params.endDate || "all"}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return rejectWithValue(
            parsed.message || "Échec de l'exportation Excel"
          );
        } catch {
          return rejectWithValue("Échec de l'exportation Excel");
        }
      }
    }
    return rejectWithValue("Échec de l'exportation Excel");
  }
});

// ============================
// Slice
// ============================

const canevasSlice = createSlice({
  name: "canevas",
  initialState,
  reducers: {
    /** Mettre à jour la wilaya (côté affichage seulement) */
    setWilaya: (state, action: PayloadAction<string>) => {
      if (state.data) state.data.wilaya = action.payload;
    },
    /** Mettre à jour l'année (côté affichage seulement) */
    setAnnee: (state, action: PayloadAction<string>) => {
      if (state.data) state.data.annee = action.payload;
    },
    /** Mettre à jour le trimestre (côté affichage seulement) */
    setTrimestre: (state, action: PayloadAction<string>) => {
      if (state.data) state.data.trimestre = action.payload;
    },
    /** Réinitialiser */
    resetCanevas: (state) => {
      state.data = null as unknown as CanevasData;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCanevasData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCanevasData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCanevasData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Export Excel
      .addCase(exportCanevasExcel.pending, (state) => {
        state.saving = true;
      })
      .addCase(exportCanevasExcel.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(exportCanevasExcel.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { setWilaya, setAnnee, setTrimestre, resetCanevas } =
  canevasSlice.actions;

export default canevasSlice.reducer;
