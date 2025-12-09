import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";
import { API_URL } from "../contants";

interface Vihicles {
  _id: string;

  num_wilaya: number;

  num_docier_client: number;

  fullName_arabe: string;

  fullName_francais: string;

  activite: string;

  colonne1?: string;

  nature_activite: string;

  colonne2?: string;

  status_activite: string;

  colonne3?: string;

  num_bus_registration: number;

  circle?: string;

  Municipality?: string;

  Style?: string;

  category: string;

  type: string;

  First_year_of_use: string;

  Number_of_seats: number;

  Energy: string;

  num_driving_license: number;

  driving_license_history: string;

  driving_license_dure: string;

  line_activity_start_date: string;

  Vehicle_activity_start_date: string;

  font_type: string;

  colonne4: string;

  font_symbol: string;

  point_depart: string;

  point_arrive: string;

  point_Traffic1: string;

  point_Traffic2: string;

  point_Traffic3: string;

  point_Traffic4: string;

  point_Traffic5: string;

  line_start_time?: string;

  line_end_time?: string;

  Pace_per_minute?: string;

  time_depart1: string;

  time_depart2: string;

  time_depart3?: string;

  time_depart4?: string;

  vihicile_parked?: string;

  type_parked: string;

  hestoire_parked: string;

  hestoire_parked_end: string;

  comments: string;

  person_concerned: string;

  note_chef_departement?: string;

  path: string;

  createdAt: string;
}
interface ApiError {
  data?: any; // optional payload like { fullName_arabe, matricule, font_type }
  message: string;
  errors?: any;
  statusCode?: number;
}

// Define State Interface
interface VihiclesState {
  vihicules: Vihicles[];
  vihicule: Vihicles;
  totalVc: number;
  limit: number;
  page: number;
  loading: boolean;
  message: string;
  messageUpdate: string;
  messageCreated: string;
  error: string | null;
  errorDetails: ApiError | null;
  fileURL: string | null;
  successMessage: null;
  statistiqueAnnee: any;
}

// Initial State
const initialState: VihiclesState = {
  vihicules: [],
  vihicule: {} as Vihicles,
  totalVc: 0,
  limit: 10,
  page: 0,
  loading: false,
  message: "",
  messageUpdate: "",
  messageCreated: "",
  error: null,
  errorDetails: null,
  fileURL: null as string | null,
  successMessage: null,
  statistiqueAnnee: {},
};

export const downloadRegistrationStats = createAsyncThunk<
  void,
  { startDate: string; endDate: string },
  { rejectValue: string }
>(
  "operateur/downloadRegistrationStats",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/vehicles/export-stats?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        return rejectWithValue("فشل في تحميل الملف");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `registration_stats_${startDate}_to_${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      return rejectWithValue("حدث خطأ أثناء تحميل الملف");
    }
  }
);

export const fetchVihicules = createAsyncThunk(
  "operateur/fetchVihicules",
  async (
    params: { search: string; limit?: number; page?: number; sort?: string },
    { rejectWithValue }
  ) => {
    console.log(params.page);
    try {
      const response = await axios.get(`${API_URL}/api/v1/vehicles/find-all`, {
        params,
        withCredentials: true,
      });
      console.log("data:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("حدث خطأ غير متوقع");
    }
  }
);

// ✅ thunk لقبول string فقط
export const exportVihicules = createAsyncThunk<
  void,
  { search: any },
  { rejectValue: string }
>("vihicules/exportVihicules", async ({ search }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (search) {
      params.append("search", search);
    }

    const response = await axios.get(
      `${API_URL}/api/v1/vehicles/export?search=${search}`,
      {
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
    link.setAttribute("download", "Vehicles.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed.message || text || "فشل في تحميل الملف");
        } catch (e) {
          const text = await data.text();
          return rejectWithValue(text || "فشل في تحميل الملف");
        }
      }
      if (typeof error.response.data === "object" && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
    }
    return rejectWithValue("فشل في تحميل الملف");
  }
});

export const deleteVihicules = createAsyncThunk(
  "vihicules/deleteVihicules",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/api/v1/vehicles/${id}`, {
        withCredentials: true,
      });
      console.log(response.data);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message);
      }
      return rejectWithValue("حدث خطأ غير معروف");
    }
  }
);

export const updateVihicules = createAsyncThunk(
  "vihicules/update",
  async (
    { id, data }: { id: string; data: Partial<Vihicles> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/vehicles/${id}`,
        data,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message);
      }
      return rejectWithValue("حدث خطأ غير معروف");
    }
  }
);

export const createVihicules = createAsyncThunk<
  Vihicles, // success type
  Partial<Vihicles>, // input type
  { rejectValue: ApiError } // reject type
>("vihicules/createVihicules", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post<Vihicles>(
      `${API_URL}/api/v1/vehicles/create`,
      data,
      { withCredentials: true }
    );
    toast.success("تم تسجيل المركبة بنجاح");
    return response.data;
  } catch (error: any) {
    console.log("error ", error);
    if (axios.isAxiosError(error) && error.response?.data) {
      // ✅ Return full backend error object
      return rejectWithValue(error.response.data as ApiError);
    }

    // fallback error
    return rejectWithValue({
      message: "حدث خطأ غير معروف",
      statusCode: 500,
    });
  }
});

export const FindOneVihicule = createAsyncThunk(
  "vihicule/FindOneVihicule",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/vehicles/find/${id}`,
        { withCredentials: true }
      );
      console.log(response.data);

      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message);
      }
      return rejectWithValue("حدث خطأ غير معروف");
    }
  }
);

export const DownloadOperateurPDF = createAsyncThunk<
  void,
  { id: string; vehicleIds?: string[] }, // 👈 allow sending selected vehicles
  { rejectValue: string }
>("operateur/downloadPDF", async ({ id, vehicleIds }, { rejectWithValue }) => {
  try {
    const query = vehicleIds?.length
      ? `?vehicleIds=${vehicleIds.join(",")}`
      : "";
    const response = await axios.get(
      `${API_URL}/api/v1/operateur-dtw/${id}/pdf${query}`,
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // 👇 dynamic file name (use operator ID or timestamp)
    a.download = vehicleIds?.length
      ? `operateur_${id}_selected.pdf`
      : `operateur_${id}.pdf`;

    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download PDF Error:", error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed.message || text || "فشل تحميل الملف");
        } catch (e) {
          const text = await data.text();
          return rejectWithValue(text || "فشل تحميل الملف");
        }
      }
      if (typeof error.response.data === "object" && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
    }
    return rejectWithValue("فشل تحميل الملف");
  }
});

export const ExportLines = createAsyncThunk<
  void,
  { search: any },
  { rejectValue: string }
>("vihicules/exportLineVihicules", async ({ search }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (search) {
      params.append("search", search);
    }

    const response = await axios.post(
      `${API_URL}/api/v1/vehicles/export-line?search=${search}`,
      {}, // جسم الطلب فاضي لأنه POST بدون بيانات
      {
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
    link.setAttribute("download", "line-report.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed.message || text || "فشل في تحميل الملف");
        } catch (e) {
          const text = await data.text();
          return rejectWithValue(text || "فشل في تحميل الملف");
        }
      }
      if (typeof error.response.data === "object" && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
    }
    return rejectWithValue("فشل في تحميل الملف");
  }
});

// ================== Download Balady ==================
export const downloadBaladyExcel = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("vehicles/downloadBaladyExcel", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/v1/vehicles/exportBalady`,
      { responseType: "blob", withCredentials: true }
    );

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "balady.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed.message || text || "فشل في تحميل ملف البلدي");
        } catch (e) {
          const text = await data.text();
          return rejectWithValue(text || "فشل في تحميل ملف البلدي");
        }
      }
      if (typeof error.response.data === "object" && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
    }
    return rejectWithValue("فشل في تحميل ملف البلدي");
  }
});

// ================== Download Rifi ==================
export const downloadRifiExcel = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("vehicles/downloadRifiExcel", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/vehicles/exportRifi`, {
      responseType: "blob",
      withCredentials: true,
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transporter_Rifi.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed.message || text || "فشل في تحميل ملف الريفي");
        } catch (e) {
          const text = await data.text();
          return rejectWithValue(text || "فشل في تحميل ملف الريفي");
        }
      }
      if (typeof error.response.data === "object" && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
    }
    return rejectWithValue("فشل في تحميل ملف الريفي");
  }
});

// ================== Download Wilay ==================
export const downloadWilayExcel = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("vehicles/downloadWilayExcel", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/vehicles/exportWilay`, {
      responseType: "blob",
      withCredentials: true,
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transporter_Wilay.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed.message || text || "فشل في تحميل ملف الولائي");
        } catch (e) {
          const text = await data.text();
          return rejectWithValue(text || "فشل في تحميل ملف الولائي");
        }
      }
      if (typeof error.response.data === "object" && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
    }
    return rejectWithValue("فشل في تحميل ملف الولائي");
  }
});
// ================== Download hadari ==================
export const downloadHadariExcel = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("vehicles/downloadHadariExcel", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/v1/vehicles/exportHadari`,
      { responseType: "blob", withCredentials: true }
    );

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transporter_Hadari.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed.message || text || "فشل في تحميل ملف الولائي");
        } catch (e) {
          const text = await data.text();
          return rejectWithValue(text || "فشل في تحميل ملف الولائي");
        }
      }
      if (typeof error.response.data === "object" && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
    }
    return rejectWithValue("فشل في تحميل ملف الولائي");
  }
});

export const fetchStatistiqueAnnee = createAsyncThunk(
  "stats/fetchStatistiqueAnnee",
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      let url = `${API_URL}/api/v1/state/statistique-annee`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await axios.get(url);
      return res.data; // راح يرجع { Operateur, Vihicle }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch statistique annee"
      );
    }
  }
);

// Create Slice
const operateurSlice = createSlice({
  name: "operateur",
  initialState,
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    resetDownloadState: (state) => {
      state.fileURL = null;
      state.loading = false;
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVihicules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVihicules.fulfilled, (state, action) => {
        state.loading = false;
        state.vihicules = action.payload.data;
        state.totalVc = action.payload.total;
        state.limit = action.payload.limit;
        state.page = action.payload.skip;
        state.message = "تم تحميل البيانات بنجاح";
      })
      .addCase(fetchVihicules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log(action.payload as string);

        toast.error(action.payload as string);
      });

    builder
      .addCase(exportVihicules.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fileURL = null;
      })
      .addCase(exportVihicules.fulfilled, (state) => {
        state.loading = false;
        //state.fileURL = action.payload;
      })
      .addCase(exportVihicules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // remove operateur
    builder
      .addCase(deleteVihicules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVihicules.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        toast.success(action.payload.message);
      })
      .addCase(deleteVihicules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // update operateur
    builder
      .addCase(updateVihicules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateVihicules.fulfilled, (state, action) => {
        state.loading = false;
        state.messageUpdate = action.payload.message;
        toast.success(action.payload.message);
      })

      .addCase(updateVihicules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    builder
      .addCase(createVihicules.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorDetails = null;
      })
      .addCase(createVihicules.fulfilled, (state) => {
        state.loading = false;
        toast.success("تم تسجيل المركبة بنجاح");
        state.messageCreated = "تم تسجيل المركبة بنجاح";
      })
      .addCase(createVihicules.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          // ✅ الخطأ القادم من rejectWithValue()
          const errorData = action.payload as ApiError;

          state.error = errorData.message || "حدث خطأ أثناء العملية";
          state.errorDetails = {
            statusCode: errorData.statusCode,
            message: errorData.message,
            errors: errorData.errors ?? null,
            data: errorData.data ?? null,
          };

          // ✅ عرض رسالة الخطأ الصحيحة بالعربية
          toast.error(errorData.message || "حدث خطأ أثناء العملية");
        } else {
          // ✅ fallback في حالة الخطأ غير المتوقع
          state.error = action.error.message || "حدث خطأ غير معروف";
          state.errorDetails = {
            statusCode: 500,
            message: state.error,
            errors: null,
            data: null,
          };
          toast.error(state.error);
        }
      });

    builder
      .addCase(FindOneVihicule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FindOneVihicule.fulfilled, (state, action) => {
        state.loading = false;
        state.vihicule = action.payload;
      })
      .addCase(FindOneVihicule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(downloadRegistrationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadRegistrationStats.fulfilled, (state) => {
        state.loading = false;
        // لا نغيّر stats هنا لأننا لا نرجع بيانات فعلية
      })
      .addCase(downloadRegistrationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(DownloadOperateurPDF.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DownloadOperateurPDF.fulfilled, (state) => {
        state.loading = false;
        toast.success("تم تحميل الملف بنجاح");
      })
      .addCase(DownloadOperateurPDF.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    builder
      .addCase(ExportLines.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fileURL = null;
      })
      .addCase(ExportLines.fulfilled, (state) => {
        state.loading = false;
        //state.fileURL = action.payload;
      })
      .addCase(ExportLines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(downloadBaladyExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadBaladyExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("تم تحميل ملف البلدي بنجاح");
      })
      .addCase(downloadBaladyExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    builder
      .addCase(downloadRifiExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadRifiExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("تم تحميل ملف الريفي بنجاح");
      })
      .addCase(downloadRifiExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    builder
      .addCase(downloadWilayExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadWilayExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("تم تحميل ملف الولائي بنجاح");
      })
      .addCase(downloadWilayExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
    builder
      .addCase(downloadHadariExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadHadariExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("تم تحميل ملف الحضري بنجاح");
      })
      .addCase(downloadHadariExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    builder
      .addCase(fetchStatistiqueAnnee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistiqueAnnee.fulfilled, (state, action) => {
        state.loading = false;
        // هنا نحفظ البيانات الراجعة من NestJS
        // مثلا:
        state.statistiqueAnnee = action.payload;
      })
      .addCase(fetchStatistiqueAnnee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export Actions & Reducer
export const { setMessage, resetDownloadState } = operateurSlice.actions;
export default operateurSlice.reducer;
