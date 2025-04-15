import { ColumnDef } from "@tanstack/react-table";
import type { Operateur } from "./OperateurTypes";


const columns: ColumnDef<Operateur, any>[] = [
    {
        accessorFn: (row) => row.num_wilaya,
        id: "num_wilaya",
        header: "رقم الولاية",
        cell: ({ row }) => <div className="text-center"> {row.getValue("num_wilaya")} </div>
    },
    {
        accessorFn: (row) => row.num_docier_client,
        id: "num_docier_client",
        header: "رقم ملف الزبون",
        cell: ({ row }) => <div className="text-center"> {row.getValue("num_docier_client")} </div>
    },
    {
        accessorFn: (row) => row.fullName_arabe,
        id: "fullName_arabe",
        header: "الاسم الكامل (بالعربية)",
        cell: ({ row }) => <div className="text-center"> {row.getValue("fullName_arabe")} </div>
    },
    {
        accessorFn: (row) => row.fullName_francais,
        id: "fullName_francais",
        header: "الاسم الكامل (بالفرنسية)",
        cell: ({ row }) => <div className="text-center"> {row.getValue("fullName_francais")} </div>
    },
    {
        accessorFn: (row) => row.date_expiration,
        id: "date_expiration",
        header: "تاريخ الانتهاء",
        cell: ({ row }) => {
            const rawDate = row.getValue("date_expiration");
            if (!rawDate) return <div>/</div >;
            const date = new Date(row.getValue("date_expiration"));
            const formattedDate = new Intl.DateTimeFormat("en-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);
            return <div>{formattedDate} </div>;
        }
    },
    {
        accessorFn: (row) => row.date_prévue,
        id: "date_prévue",
        header: "تاريخ الانتهاء",
        cell: ({ row }) => {
            const rawDate = row.getValue("date_prévue");
            if (!rawDate) return <div>/</div >;
            const date = new Date(row.getValue("date_prévue"));
            const formattedDate = new Intl.DateTimeFormat("en-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);
            return <div>{formattedDate} </div>;
        }
    },
    {
        accessorFn: (row) => row.num_dhoraire,
        id: "num_dhoraire",
        header: "رقم ملف الزبون",
        cell: ({ row }) => <div className="text-center"> {row.getValue("num_dhoraire")} </div>
    },
    {
        accessorFn: (row) => row.num_cate_enregistement,
        id: "num_cate_enregistement",
        header: "رقم فئة التسجيل",
        cell: ({ row }) => <div className="text-center"> {row.getValue("num_cate_enregistement")} </div>
    },
    {
        accessorFn: (row) => row.activite,
        id: "activite",
        header: "النشاط",
    },
    {
        accessorFn: (row) => row.colonne1,
        id: "colonne1",
        header: "colonne 1",
        cell: ({ row }) => {
            const value = row.getValue("colonne1");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.nature_activite,
        id: "nature_activite",
        header: "طبيعة النشاط",
        cell: ({ row }) => {
            const value = row.getValue("nature_activite");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.colonne2,
        id: "colonne2",
        header: "colonne 2",
        cell: ({ row }) => {
            const value = row.getValue("colonne2");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.status_activite,
        id: "status_activite",
        header: "حالة النشاط",
        cell: ({ row }) => {
            const value = row.getValue("status_activite");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.colonne3,
        id: "colonne3",
        header: "colonne 3",
        cell: ({ row }) => {
            const value = row.getValue("colonne3");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.type_client,
        id: "type_client",
        header: "نوع الزبون",
        cell: ({ row }) => <div className="text-center"> {row.getValue("type_client")} </div>
    },
    {
        accessorFn: (row) => row.colonne4,
        id: "colonne4",
        header: "colonne 4",
        cell: ({ row }) => {
            const value = row.getValue("colonne4");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.institution_person_moral,
        id: "institution_person_moral",
        header: "شكل الشركة في حالة شخص معنوي",
        cell: ({ row }) => {
            const value = row.getValue("institution_person_moral");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.fullName_gerent_person_moral,
        id: "fullName_gerent_person_moral",
        header: " اسم و لقب المسير في السجل التجاري في حالة شخص معنوي",
        cell: ({ row }) => {
            const value = row.getValue("fullName_gerent_person_moral");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.num_dacte_naissance,
        id: "num_dacte_naissance",
        header: "رقم عقد الميلاد",
        cell: ({ row }) => {
            const value = row.getValue("num_dacte_naissance");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.num_didentification_national_NIN,
        id: "num_didentification_national_NIN",
        header: "رقم الهوية الوطنية",
        cell: ({ row }) => <div className="text-center"> {row.getValue("num_didentification_national_NIN")} </div>
    },
    {
        accessorFn: (row) => row.date_arret_activite_permanent,
        id: "date_arret_activite_permanent",
        header: "تاريخ التوقف الدائم للنشاط",
        cell: ({ row }) => {
            const date = new Date(row.getValue("date_arret_activite_permanent"));
            const formattedDate = new Intl.DateTimeFormat("en-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);
            return <div>{formattedDate} </div>;
        },
    },

    {
        accessorFn: (row) => row.lieu_naissance_arabe,
        id: "lieu_naissance_arabe",
        header: "مكان الميلاد (بالعربية)",
        cell: ({ row }) => {
            const value = row.getValue("lieu_naissance_arabe");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.lieu_naissance_francais,
        id: "lieu_naissance_francais",
        header: "مكان الميلاد (بالفرنسية)",
        cell: ({ row }) => {
            const value = row.getValue("lieu_naissance_francais");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.nom_pere_arabe,
        id: "nom_pere_arabe",
        header: "اسم الأب (بالعربية)",
        cell: ({ row }) => {
            const value = row.getValue("nom_pere_arabe");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.nom_pere_francais,
        id: "nom_pere_francais",
        header: "اسم الأب (بالفرنسية)",
        cell: ({ row }) => {
            const value = row.getValue("nom_pere_francais");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        }
    },
    {
        accessorFn: (row) => row.fullName_mere_arabe,
        id: "fullName_mere_arabe",
        header: "اسم الأم الكامل (بالعربية)",
        cell: ({ row }) => <div className="text-center"> {row.getValue("fullName_mere_arabe")} </div>,
    },
    {
        accessorFn: (row) => row.fullName_mere_francais,
        id: "fullName_mere_francais",
        header: "اسم الأم الكامل (بالفرنسية)",
    },
    {
        accessorFn: (row) => row.communes_naissance_arabe,
        id: "communes_naissance_arabe",
        header: "بلدية الميلاد (بالعربية)",
    },
    {
        accessorFn: (row) => row.communes_naissance_francais,
        id: "communes_naissance_francais",
        header: "بلدية الميلاد (بالفرنسية)",
    },
    {
        accessorFn: (row) => row.address_arabe,
        id: "address_arabe",
        header: "العنوان (بالعربية)",
    },
    {
        accessorFn: (row) => row.address_francais,
        id: "address_francais",
        header: "العنوان (بالفرنسية)",
    },
    {
        accessorFn: (row) => row.address_municipalité_arabe,
        id: "address_municipalité_arabe",
        header: "عنوان البلدية (بالعربية)",
    },
    {
        accessorFn: (row) => row.address_municipalité_francais,
        id: "address_municipalité_francais",
        header: "عنوان البلدية (بالفرنسية)",
    },
    {
        accessorFn: (row) => row.num_registre_commerce,
        id: "num_registre_commerce",
        header: "رقم السجل التجاري",
    },
    {
        accessorFn: (row) => row.num_registre_commerce_n5,
        id: "num_registre_commerce_n5",
        header: "رقم السجل التجاري (ن5)",
    },
    {
        accessorFn: (row) => row.hestoire_registre_commerce,
        id: "hestoire_registre_commerce",
        header: "تاريخ السجل التجاري",
        cell: ({ row }) => {
            const date = new Date(row.getValue("hestoire_registre_commerce"));
            const formattedDate = new Intl.DateTimeFormat("en-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);
            return <div>{formattedDate} </div>;
        },
    },
    {
        accessorFn: (row) => row.modifier_hestoire_registre_commerce,
        id: "modifier_hestoire_registre_commerce",
        header: "تعديل تاريخ السجل التجاري",
        cell: ({ row }) => {
            const date = new Date(row.getValue("modifier_hestoire_registre_commerce"));
            const formattedDate = new Intl.DateTimeFormat("en-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);
            return <div>{formattedDate} </div>;
        },
    },
    {
        accessorFn: (row) => row.date_debut_activite,
        id: "date_debut_activite",
        header: "تاريخ بدء النشاط",
        cell: ({ row }) => {
            const date = new Date(row.getValue("date_debut_activite"));
            const formattedDate = new Intl.DateTimeFormat("en-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);
            return <div>{formattedDate} </div>;
        },
    },
    {
        accessorFn: (row) => row.num_adherent_caise_national_non_salaire,
        id: "num_adherent_caise_national_non_salaire",
        header: "رقم الانتساب الى الصندوق الوطني للعمال غير الاجراء",
    },
    {
        accessorFn: (row) => row.depend_activite,
        id: "depend_activite",
        header: "الارتباط بالنشاط",
    },
    {
        accessorFn: (row) => row.type_depend,
        id: "type_depend",
        header: "نوع الارتباط",
    },
    {
        accessorFn: (row) => row.date_arret_activite_temporaire,
        id: "date_arret_activite_temporaire",
        header: "تاريخ التوقف المؤقت للنشاط",
        cell: ({ row }) => {
            const date = new Date(row.getValue("date_arret_activite_temporaire"));
            const formattedDate = new Intl.DateTimeFormat("en-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);
            return <div>{formattedDate} </div>;
        },
    },
    {
        accessorFn: (row) => row.date_arret_activite_permanent ?? "",
        id: "date_arret_activite_permanent",
        header: "تاريخ التوقف الدائم للنشاط",
        cell: ({ row }) => {
            const rawDate = row.getValue("date_arret_activite_permanent");
            if (!rawDate || typeof rawDate !== "string" || isNaN(Date.parse(rawDate))) return <div>/</div >;
            const date = new Date(rawDate);
            const formattedDate = new Intl.DateTimeFormat("ar-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(date);
            return <div>{formattedDate} </div>;
        },
    },

    {
        accessorFn: (row) => row.num_telephone_client,
        id: "num_telephone_client",
        header: "رقم هاتف الزبون",
        cell: ({ row }) => {
            const value = row.getValue("num_telephone_client");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        },
    },
    {
        accessorFn: (row) => row.soccupe,
        id: "soccupe",
        header: "المهنة",
        cell: ({ row }) => {
            const value = row.getValue("soccupe");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        },
    },
    {
        accessorFn: (row) => row.note_chef_departement,
        id: "note_chef_departement",
        header: "ملاحظة رئيس القسم",
        cell: ({ row }) => {
            const value = row.getValue("note_chef_departement");
            return <div className="text-center" > {value ? String(value) : "/"} </div>;
        },
    },
    
];

export default columns;