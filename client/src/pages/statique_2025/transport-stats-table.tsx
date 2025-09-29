import { fetchAnneeStats } from "@/redux/slice/stateSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  startDate: string;
  endDate: string;
}

export function TransportStatsTable({ startDate, endDate }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { anneeStats, loading, error } = useSelector((state: RootState) => state.stats);



  useEffect(() => {
    if (startDate && endDate) {
      dispatch(fetchAnneeStats({ startDate, endDate }));
    }
  }, [dispatch, startDate, endDate]);

  if (loading) return <p>⏳ تحميل...</p>;
  if (error) return <p className="text-red-500">❌ {error}</p>;
  if (!anneeStats) return <p>لا توجد بيانات</p>;

  // 🔹 بناء Data من الـ API
  const transportData = [
    {
      category: "Transport public de voyageurs",
      categoryArabic: "النقل العمومي للمسافرين",
      q4_2025: {
        operators: anneeStats.Operateur.transport_public_voyageurs.total,
        vehicles: anneeStats.Vihicle.transport_public_voyageurs.total,
        capacity: anneeStats.CAPACITÉ.transport_public_voyageurs.total,
      },
    },
    {
      category: "",
      subcategory: "Public",
      subcategoryArabic: "عمومي",
      q4_2025: {
        operators: anneeStats.Operateur.transport_public_voyageurs.public,
        vehicles: anneeStats.Vihicle.transport_public_voyageurs.public,
        capacity: anneeStats.CAPACITÉ.transport_public_voyageurs.public,
      },
      isSubcategory: true,
    },
    {
      category: "",
      subcategory: "Privé",
      subcategoryArabic: "خاص",
      q4_2025: {
        operators: anneeStats.Operateur.transport_public_voyageurs.prive,
        vehicles: anneeStats.Vihicle.transport_public_voyageurs.prive,
        capacity: anneeStats.CAPACITÉ.transport_public_voyageurs.prive,
      },
      isSubcategory: true,
    },
    {
      category: "Transport propre compte",
      categoryArabic: "النقل لحساب خاص",
      q4_2025: {
        operators: anneeStats.Operateur.transport_propre_compte.total,
        vehicles: anneeStats.Vihicle.transport_propre_compte.total,
        capacity: anneeStats.CAPACITÉ.transport_propre_compte.total,
      },
    },
    {
      category: "",
      subcategory: "Public",
      subcategoryArabic: "عمومي",
      q4_2025: {
        operators: anneeStats.Operateur.transport_propre_compte.pubC,
        vehicles: anneeStats.Vihicle.transport_propre_compte.pubC,
        capacity: anneeStats.CAPACITÉ.transport_propre_compte.pubC,
      },
      isSubcategory: true,
    },
    {
      category: "",
      subcategory: "Privé",
      subcategoryArabic: "خاص",
      q4_2025: {
        operators: anneeStats.Operateur.transport_propre_compte.PrvC,
        vehicles: anneeStats.Vihicle.transport_propre_compte.PrvC,
        capacity: anneeStats.CAPACITÉ.transport_propre_compte.PrvC,
      },
      isSubcategory: true,
    },
    {
      category: "TOTAL",
      q4_2025: {
        operators: anneeStats.Operateur.total,
        vehicles: anneeStats.Vihicle.totalVichecle,
        capacity: anneeStats.CAPACITÉ.totalNP,
      },
      isTotal: true,
    },
  ];

  return (
    <div className="w-full overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-300">


      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="border border-gray-400 p-3 text-left font-semibold text-gray-800 min-w-[250px]"
              rowSpan={2}
            >
              Transport routier de voyageurs
              <div className="text-xs font-normal text-gray-600 mt-1" dir="rtl">
                النقل البري للمسافرين
              </div>
            </th>
            <th
              className="border border-gray-400 p-2 text-center font-semibold text-gray-800 bg-gray-200"
              colSpan={3}
            >
              4ème trimestre 2025
            </th>
          </tr>
          <tr className="bg-gray-50">
            <th className="border border-gray-400 p-2 text-center font-medium text-gray-700 min-w-[100px]">
              NOMBRE D'OPERATEURS
            </th>
            <th className="border border-gray-400 p-2 text-center font-medium text-gray-700 min-w-[100px]">
              NOMBRE DE VEHICULES
            </th>
            <th className="border border-gray-400 p-2 text-center font-medium text-gray-700 min-w-[100px]">
              CAPACITÉ OFFERTES
            </th>
          </tr>
        </thead>
        <tbody>
          {transportData.map((row, index) => (
            <tr
              key={index}
              className={`${row.isTotal
                ? "bg-gray-200 font-semibold"
                : "bg-white hover:bg-gray-50"
                } ${index % 2 === 0 && !row.isTotal ? "bg-gray-25" : ""}`}
            >
              <td
                className={`border border-gray-400 p-3 ${row.isSubcategory ? "pl-8" : ""
                  }`}
              >
                <div className="flex flex-col">
                  {row.category && (
                    <span
                      className={`${row.isTotal
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-800"
                        }`}
                    >
                      {row.category}
                    </span>
                  )}
                  {row.categoryArabic && (
                    <span className="text-xs text-gray-600 mt-1" dir="rtl">
                      {row.categoryArabic}
                    </span>
                  )}
                  {row.subcategory && (
                    <div className="flex flex-col mt-1">
                      <span className="font-medium text-gray-700">
                        {row.subcategory}
                      </span>
                      {row.subcategoryArabic && (
                        <span className="text-xs text-gray-600" dir="rtl">
                          {row.subcategoryArabic}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="border border-gray-400 p-2 text-center font-mono">
                {row.q4_2025.operators.toLocaleString()}
              </td>
              <td className="border border-gray-400 p-2 text-center font-mono">
                {row.q4_2025.vehicles.toLocaleString()}
              </td>
              <td className="border border-gray-400 p-2 text-center font-mono">
                {row.q4_2025.capacity.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
