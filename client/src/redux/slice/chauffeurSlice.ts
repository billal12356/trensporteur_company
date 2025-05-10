import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

export interface Chauffeur {
    _id: string,
    num_chauffeur: number;
    num_demende: number;
    hestoire_demende: string;
    num_enregistrement_du_transporteur: number;
    operateur: string;
    ligne_exploitée: string;
    num_vehicule: number;
    nature_ligne: string;
    nom_prenom_chauffeur: string;
    nature_utilisateur: string;
    num_didentification_national_NIN: number;
    num_permis_conduire: number;
    date_sortie: string;
    date_expiration_article: string;
    municipalite_emettrice: string;
    date_naissance: string;
    lieu_naissance: string;
    address: string;
    Num_certificat_compétence_professionnelle: number;
    date_obtention_certificat_aptitude_professionnelle: string;
    wilaya: string;
    num_serie: number;
    num_membre_fonds_national: number;
    vihicile_parked: string;
    type_parked: string;
    comments?: string;
    createdAt: string
}




// Define State Interface
interface ChauffeurState {
    chauffeurs: Chauffeur[];
    chauffeur: Chauffeur;
    total: number;
    limit: number;
    page: number;
    loading: boolean;
    message: string;
    error: string | null;
    fileURL: string | null,
    successMessage: null,
    messageUpdate: string
}

// Initial State
const initialState: ChauffeurState = {
    chauffeurs: [],
    chauffeur: {} as Chauffeur,
    total: 0,
    limit: 10,
    page: 0,
    loading: false,
    message: "",
    error: null,
    fileURL: null as string | null,
    successMessage: null,
    messageUpdate: ""

};

export const FindOneChauffeur = createAsyncThunk(
    "chauffer/FindOneChauffeur",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`https://trensporteur-company.onrender.comapi/v1/chauffeurs/find/${id}`, { withCredentials: true });
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

export const downloadRegistrationStats = createAsyncThunk<
    void,
    { startDate: string; endDate: string },
    { rejectValue: string }
>(
    'operateur/downloadRegistrationStats',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `https://trensporteur-company.onrender.comapi/v1/chauffeurs/export-stats?startDate=${startDate}&endDate=${endDate}`
            );

            if (!response.ok) {
                return rejectWithValue('فشل في تحميل الملف');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `registration_stats_${startDate}_to_${endDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            return rejectWithValue('حدث خطأ أثناء تحميل الملف');
        }
    }
);

export const fetchChauffeurs = createAsyncThunk(
    "chauffeur/fetchChauffeurs",
    async (params: { search: string, limit?: number; page?: number; sort?: string }, { rejectWithValue }) => {
        console.log(params.page);
        try {
            const response = await axios.get("https://trensporteur-company.onrender.comapi/v1/chauffeurs/find-all", {
                params,
                withCredentials: true,
            });

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
export const exportChauffeurs = createAsyncThunk<
    void,
    { search: any },
    { rejectValue: string }
>('chauffeurs/exportChauffeurs', async ({ search }, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (search) {
            params.append('search', search);
        }

        const response = await axios.get(
            `https://trensporteur-company.onrender.comapi/v1/chauffeurs/export?search=${search}`,
            {
                responseType: 'blob',
                withCredentials: true,
            }
        );

        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        console.log(blob);

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



export const deleteChauffeurs = createAsyncThunk(
    "operateur/deleteChauffeurs",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`https://trensporteur-company.onrender.comapi/v1/chauffeurs/${id}`, { withCredentials: true });
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

export const updateChauffeurs = createAsyncThunk(
    "chauffeurs/update",
    async ({ id, data }: { id: string; data: Partial<Chauffeur> }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`https://trensporteur-company.onrender.comapi/v1/chauffeurs/update/${id}`, data, { withCredentials: true });
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

export const createChauffeurs = createAsyncThunk<
    Chauffeur,
    Partial<Chauffeur>,
    { rejectValue: string }
>(
    'chauffeurs/createChauffeurs',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post<Chauffeur>('https://trensporteur-company.onrender.comapi/v1/chauffeurs/create', data, { withCredentials: true });
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
            .addCase(FindOneChauffeur.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(FindOneChauffeur.fulfilled, (state, action) => {
                state.loading = false;
                state.chauffeur = action.payload;
            })
            .addCase(FindOneChauffeur.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(fetchChauffeurs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChauffeurs.fulfilled, (state, action) => {
                state.loading = false;
                state.chauffeurs = action.payload.data;
                //console.log("data:", action.payload.data);
                state.total = action.payload.total;
                state.limit = action.payload.limit;
                state.page = action.payload.skip;
                state.message = "تم تحميل البيانات بنجاح";
            })
            .addCase(fetchChauffeurs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                //console.log(action.payload as string);
                toast.error(action.payload as string)
            });

        builder
            .addCase(exportChauffeurs.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.fileURL = null;
            })
            .addCase(exportChauffeurs.fulfilled, (state) => {
                state.loading = false;
                //state.fileURL = action.payload;
            })
            .addCase(exportChauffeurs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // remove operateur
        builder
            .addCase(deleteChauffeurs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteChauffeurs.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
                toast.success(action.payload.message);
            })
            .addCase(deleteChauffeurs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // update operateur
        builder
            .addCase(updateChauffeurs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateChauffeurs.fulfilled, (state, action) => {
                state.loading = false;
                state.messageUpdate = action.payload.message
                toast.success(action.payload.message)
            })

            .addCase(updateChauffeurs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string)
            });

        builder
            .addCase(createChauffeurs.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createChauffeurs.fulfilled, (state) => {
                state.loading = false;
                //state.successMessage = action.payload
                //state.message = action.payload.message
            })
            .addCase(createChauffeurs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(action.payload as string)
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
    },
});

// Export Actions & Reducer
export const { setMessage, resetDownloadState } = operateurSlice.actions;
export default operateurSlice.reducer;
