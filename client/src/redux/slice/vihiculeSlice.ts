import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

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

    type_parked :string;

    hestoire_parked:string;

    hestoire_parked_end:string;

    comments:string;

    person_concerned:string;

    note_chef_departement?: string;

    path:string
}

   

// Define State Interface
interface VihiclesState {
    vihicules: Vihicles[];
    total: number;
    limit: number;
    page: number;
    loading: boolean;
    message: string;
    error: string | null;
    fileURL: string | null,
    successMessage: null,
}

// Initial State
const initialState: VihiclesState = {
    vihicules: [],
    total: 0,
    limit: 10,
    page: 0,
    loading: false,
    message: "",
    error: null,
    fileURL: null as string | null,
    successMessage: null,
};

export const fetchVihicules = createAsyncThunk(
    "operateur/fetchVihicules",
    async (params: { search: string, limit?: number; page?: number; sort?: string }, { rejectWithValue }) => {
        console.log(params.page);
        try {
            const response = await axios.get("http://localhost:3000/api/v1/vehicles/find-all", {
                params,
                withCredentials: true,
            });
            console.log("data:", response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message)
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
>('vihicules/exportVihicules', async ({ search }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }

    const response = await axios.get(
      `http://localhost:3000/api/v1/vehicles/export?search=${search}`,
      {
        responseType: 'blob',
        withCredentials: true,
      }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Operateurs.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    return rejectWithValue('فشل في تحميل الملف');
  }
});



export const deleteVihicules = createAsyncThunk(
    "operateur/deleteVihicules",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`http://localhost:3000/api/v1/operateur-dtw/${id}`, { withCredentials: true });
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
    async ({ id, data }: { id: string; data: Partial<Vihicles> }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/v1/operateur-dtw/${id}`, data, { withCredentials: true });
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
    Vihicles,
    Partial<Vihicles>,
    { rejectValue: string }
>(
    'vihicules/createVihicules',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post<Vihicles>('http://localhost:3000/api/v1/vehicles/create', data, { withCredentials: true });
            toast.success("تم تسجيل المركبة بنجاح")
            return response.data;
        } catch (error: unknown) {
            console.log(error);
          
            if (axios.isAxiosError(error)) {
              const message = error.response?.data?.message;
          
              // If message is an array, return the first element
              if (Array.isArray(message)) {
                return rejectWithValue(message[0] ?? "حدث خطأ غير معروف");
              }
          
              // If message is a string, return it directly
              if (typeof message === "string") {
                return rejectWithValue(message);
              }
          
              // If message exists but is not string or array
              return rejectWithValue("حدث خطأ في الاستجابة من الخادم");
            }
          
            // If it's not an AxiosError
            return rejectWithValue("حدث خطأ غير معروف");
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
                state.total = action.payload.total;
                state.limit = action.payload.limit;
                state.page = action.payload.skip;
                state.message = "تم تحميل البيانات بنجاح";
            })
            .addCase(fetchVihicules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.log(action.payload as string);

                toast.error(action.payload as string)
            });

        builder
            .addCase(exportVihicules.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.fileURL = null;
            })
            .addCase(exportVihicules.fulfilled, (state, action) => {
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
                state.message = action.payload.message
                toast.success(action.payload.message)
            })

            .addCase(updateVihicules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string)
            });

        builder
            .addCase(createVihicules.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createVihicules.fulfilled, (state) => {
                state.loading = false;
                //state.successMessage = action.payload
                //state.message = action.payload.message
            })
            .addCase(createVihicules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string)
            });
    },
});

// Export Actions & Reducer
export const { setMessage, resetDownloadState } = operateurSlice.actions;
export default operateurSlice.reducer;
