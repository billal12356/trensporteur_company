interface TransportData {
  category: string;
  categoryArabic?: string;
  subcategory?: string;
  subcategoryArabic?: string;
  q4_2025: {
    operators: number;
    vehicles: number;
    capacity: number;
  };
  isTotal?: boolean;
  isSubcategory?: boolean;
}

const transportData: TransportData[] = [
  {
    category: "Transport public de voyageurs",
    categoryArabic: "النقل العمومي للمسافرين",
    q4_2025: { operators: 1, vehicles: 30, capacity: 3000 },
    isSubcategory: true,
  },
  {
    category: "",
    subcategory: "Public",
    subcategoryArabic: "عمومي",
    q4_2025: { operators: 42, vehicles: 210, capacity: 7177 },
    isSubcategory: true,
  },
  {
    category: "",
    subcategory: "Privé",
    subcategoryArabic: "خاص",
    q4_2025: { operators: 744, vehicles: 1030, capacity: 25662 },
    isSubcategory: true,
  },
  {
    category: "Transport propre compte",
    categoryArabic: "النقل لحساب خاص",
    q4_2025: { operators: 64, vehicles: 251, capacity: 7580 },
  },
  {
    category: "",
    subcategory: "Public",
    subcategoryArabic: "عمومي",
    q4_2025: { operators: 42, vehicles: 210, capacity: 7177 },
    isSubcategory: true,
  },
  {
    category: "",
    subcategory: "Privé",
    subcategoryArabic: "خاص",
    q4_2025: { operators: 22, vehicles: 41, capacity: 403 },
    isSubcategory: true,
  },
  {
    category: "TOTAL",
    q4_2025: { operators: 1809, vehicles: 1311, capacity: 36242 },
    isTotal: true,
  },
];

export function TransportStatsTable() {
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
              4 er trimestre 2025
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
              className={`
                ${
                  row.isTotal
                    ? "bg-gray-200 font-semibold"
                    : "bg-white hover:bg-gray-50"
                }
                ${index % 2 === 0 && !row.isTotal ? "bg-gray-25" : ""}
              `}
            >
              <td
                className={`border border-gray-400 p-3 ${
                  row.isSubcategory ? "pl-8" : ""
                }`}
              >
                <div className="flex flex-col">
                  {row.category && (
                    <span
                      className={`${
                        row.isTotal
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
