import { Chauffeur, Vihicles } from "@/components/types/OperateurTypes";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";
import { API_URL } from "../contants";

interface Operateur {
  _id: string;
  num_wilaya: number;
  num_docier_client: number;
  fullName_arabe: string;
  fullName_francais: string;
  date_expiration: string;
  date_prévue: string;
  num_dhoraire: number;
  num_cate_enregistement: number;
  activite: string;
  colonne1?: string;
  nature_activite: string;
  colonne2?: string;
  status_activite: string;
  colonne3?: string;
  type_client: string;
  colonne4?: string;
  institution_person_moral?: string;
  fullName_gerent_person_moral?: string;
  num_dacte_naissance: number;
  num_didentification_national_NIN: number;
  date_naissance: string;
  lieu_naissance_arabe: string;
  lieu_naissance_francais: string;
  nom_pere_arabe: string;
  nom_pere_francais: string;
  fullName_mere_arabe: string;
  fullName_mere_francais: string;
  communes_naissance_arabe: string;
  communes_naissance_francais: string;
  address_arabe: string;
  address_francais: string;
  address_municipalité_arabe: string;
  address_municipalité_francais: string;
  num_registre_commerce: number;
  num_registre_commerce_n5: number;
  hestoire_registre_commerce: string;
  modifier_hestoire_registre_commerce: string;
  date_debut_activite: string;
  num_adherent_caise_national_non_salaire?: number;
  depend_activite?: string;
  type_depend?: string;
  date_arret_activite_temporaire: string;
  date_arret_activite_permanent: string;
  num_telephone_client?: string;
  soccupe?: string;
  note_chef_departement?: string;
  createdAt: string;
}

// Define State Interface
interface OperateurState {
  operateurs: Operateur[];
  operateur: Operateur;
  vihicules: Vihicles[];
  chauffeurs: Chauffeur[];
  total: number;
  limit: number;
  page: number;
  loading: boolean;
  message: string;
  messageUpdate: string;
  error: string | null;
  fileURL: string | null;
  successMessage: null;
  stats: StatData[];
}

export interface StatData {
  date: string;
  count: number;
}

// Initial State
const initialState: OperateurState = {
  operateurs: [],
  operateur: {} as Operateur,
  vihicules: [],
  chauffeurs: [],
  total: 0,
  limit: 10,
  page: 0,
  loading: false,
  message: "",
  messageUpdate: "",
  error: null,
  fileURL: null as string | null,
  successMessage: null,
  stats: [],
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
        `${API_URL}/api/v1/operateur-dtw/export-stats?startDate=${startDate}&endDate=${endDate}`
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

export const generatePDF = createAsyncThunk(
  "pdf/generate",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/operateur-dtw/generate?id=${id}`,
        {
          responseType: "blob", // IMPORTANT
          headers: { Accept: "application/pdf" },
        }
      );

      const file = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(file);

      window.open(url); // open pdf in new tab

      return true;
    } catch (err: any) {
      console.log("PDF ERROR:", err);
      // If server returned a JSON body as a Blob (common when responseType='blob'),
      // read the blob and extract a message.
      const respData = err?.response?.data;
      if (respData) {
        try {
          if (typeof respData.text === 'function') {
            const txt = await respData.text();
            try {
              const j = JSON.parse(txt);
              return rejectWithValue(j.message || txt || 'PDF generation failed');
            } catch {
              return rejectWithValue(txt || 'PDF generation failed');
            }
          }
          // fallback for normal object
          return rejectWithValue(respData?.message || err.message || 'PDF generation failed');
        } catch (e) {
          return rejectWithValue(err.message || 'PDF generation failed');
        }
      }
      return rejectWithValue(err.message || 'PDF generation failed');
    }
  }
);


export const fetchOperateurs = createAsyncThunk(
  "operateur/fetchOperateurs",
  async (
    params: { search?: string; limit?: number; page?: number; sort?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/operateur-dtw/find-all`,
        {
          params,
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);

      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("حدث خطأ غير متوقع");
    }
  }
);

// ✅ thunk لقبول string فقط
export const exportOperateurs = createAsyncThunk<
  void,
  { search: any },
  { rejectValue: string }
>("operateurs/exportOperateurs", async ({ search }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (search) {
      params.append("search", search);
    }

    const response = await axios.get(
      `${API_URL}/api/v1/operateur-dtw/download?search=${search}`,
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
    link.setAttribute("download", "Operateurs.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    return rejectWithValue("فشل في تحميل الملف");
  }
});

export const deleteOperateur = createAsyncThunk(
  "operateur/deleteOperateur",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/operateur-dtw/${id}`,
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

export const FindOneOperateur = createAsyncThunk(
  "operateur/FindOneOperateur",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/operateur-dtw/find/${id}`,
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

export const updateOperateur = createAsyncThunk(
  "operateurs/update",
  async (
    { id, data }: { id: string; data: Partial<Operateur> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/operateur-dtw/${id}`,
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

export const createOperateur = createAsyncThunk<
  void, // لا نرجع JSON بل نحمل ملف
  Partial<Operateur>,
  { rejectValue: string }
>("operateurs/createOperateur", async (data, { rejectWithValue }) => {
  try {
    // نطلب الملف كـ Blob
    await axios.post(
      `${API_URL}/api/v1/operateur-dtw/create`,
      data,
      {
        withCredentials: true,
        // responseType: "blob", // 👈 مهم جداً لتحميل ملف PDF
      }
    );

    // // إنشاء رابط تحميل للـ PDF
    // const url = window.URL.createObjectURL(new Blob([response.data]));
    // const link = document.createElement("a");
    // link.href = url;
    // link.setAttribute("download", "Operateur-Static.pdf");
    // document.body.appendChild(link);
    // link.click();
    // link.remove();

    toast.success("تم تسجيل المتعامل بنجاح");
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message);
    }
    return rejectWithValue("حدث خطأ غير معروف");
  }
});

export const generatePDFs = createAsyncThunk(
  "pdfs/generate",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/operateur-dtw/generate-pdf?id=${id}`,
        { responseType: "blob" } // مهم جدًا للحصول على PDF
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url); // فتح الملف في نافذة جديدة

      return true;
    } catch (err: any) {
      const respData = err?.response?.data;
      if (respData) {
        try {
          if (typeof respData.text === 'function') {
            const txt = await respData.text();
            try {
              const j = JSON.parse(txt);
              return rejectWithValue(j.message || txt || 'PDF generation failed');
            } catch {
              return rejectWithValue(txt || 'PDF generation failed');
            }
          }
          return rejectWithValue(respData?.message || err.message || 'PDF generation failed');
        } catch {
          return rejectWithValue(err.message || 'PDF generation failed');
        }
      }
      return rejectWithValue(err.message || 'PDF generation failed');
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
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperateurs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOperateurs.fulfilled, (state, action) => {
        state.loading = false;
        state.operateurs = action.payload.data;
        state.total = action.payload.total;
        state.limit = action.payload.limit;
        state.page = action.payload.skip;
        state.message = "تم تحميل البيانات بنجاح";
      })
      .addCase(fetchOperateurs.rejected, (state, action) => {
        state.loading = false;
        const errMsg = (action.payload as string) || action.error?.message || 'حدث خطأ غير متوقع';
        state.error = errMsg;
        console.log(errMsg);
        toast.error(errMsg);
      });

    builder
      .addCase(exportOperateurs.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fileURL = null;
      })
      .addCase(exportOperateurs.fulfilled, (state) => {
        state.loading = false;
        //state.fileURL = action.payload;
      })
      .addCase(exportOperateurs.rejected, (state, action) => {
        state.loading = false;
        const errMsg = (action.payload as string) || action.error?.message || 'فشل في تحميل الملف';
        state.error = errMsg;
      });

    // remove operateur
    builder
      .addCase(deleteOperateur.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOperateur.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        toast.success(action.payload.message);
      })
      .addCase(deleteOperateur.rejected, (state, action) => {
        state.loading = false;
        const errMsg = (action.payload as string) || action.error?.message || 'فشل في حذف المتعامل';
        state.error = errMsg;
      });

    // find  one operateur
    builder
      .addCase(FindOneOperateur.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FindOneOperateur.fulfilled, (state, action) => {
        state.loading = false;
        state.operateur = action.payload.operateur;
        state.vihicules = action.payload.vihicules;
        state.chauffeurs = action.payload.chauffeurs;
      })
      .addCase(FindOneOperateur.rejected, (state, action) => {
        state.loading = false;
        const errMsg = (action.payload as string) || action.error?.message || 'حدث خطأ غير معروف';
        state.error = errMsg;
      });

    // update operateur
    builder
      .addCase(updateOperateur.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateOperateur.fulfilled, (state, action) => {
        state.loading = false;
        state.messageUpdate = action.payload.message;
        toast.success(action.payload.message);
      })

      .addCase(updateOperateur.rejected, (state, action) => {
        state.loading = false;
        const errMsg = (action.payload as string) || action.error?.message || 'حدث خطأ غير معروف';
        state.error = errMsg;
        toast.error(errMsg);
      });

    builder
      .addCase(createOperateur.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createOperateur.fulfilled, (state) => {
        state.loading = false;
        //state.successMessage = action.payload.message
        toast.success("تم تسجيل العميل بنجاح");
        //state.message = action.payload.message
      })
      .addCase(createOperateur.rejected, (state, action) => {
        state.loading = false;
        const errMsg = (action.payload as string) || action.error?.message || 'يرجى ملئ البيانات الناقصة';
        toast.error(errMsg);
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
        const errMsg = (action.payload as string) || action.error?.message || 'فشل في تحميل الملف';
        state.error = errMsg;
      });

    builder
      .addCase(generatePDF.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePDF.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generatePDF.rejected, (state, action) => {
        state.loading = false;
        const errMsg = (action.payload as string) || action.error?.message || 'فشل في إنشاء الPDF';
        state.error = errMsg;
      });

    builder
      .addCase(generatePDFs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePDFs.fulfilled, (state) => {
        state.loading = false;
        toast.success("تم تحميل ملف pdf بنجاح");
      })
      .addCase(generatePDFs.rejected, (state, action) => {
        state.loading = false;
        const errMsg = (action.payload as string) || action.error?.message || 'فشل في إنشاء الPDF';
        state.error = errMsg;
      });
  },
});

// Export Actions & Reducer
export const { setMessage, resetDownloadState, clearError } = operateurSlice.actions;
export default operateurSlice.reducer;
