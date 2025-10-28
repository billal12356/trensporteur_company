import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInterCommuneStats,
  fetchInterWilayaStats,
  fetchRuralStats,
  fetchScolaireStats,
  fetchUrbainStats,
} from "@/redux/slice/stateSlice";
import { RootState } from "@/redux/store";
import MainContainer from "@/components/MainContainer";
import { Helmet } from "react-helmet-async";

function formatData(type: string, stats: any) {
  return {
    type,
    nbVehicules: stats?.nbVehicules ?? 0,
    nbOperators: stats?.nbOperators ?? 0,
    nbPlaces: stats?.nbPlaces ?? 0,
    tranche_0_5: stats?.age_0_5 ?? 0,
    tranche_6_10: stats?.age_6_10 ?? 0,
    tranche_11_15: stats?.age_11_15 ?? 0,
    tranche_15_20: stats?.age_15_20 ?? 0,
    tranche_20_30: stats?.age_20_30 ?? 0,
    tranche_plus_30: stats?.age_plus_30 ?? 0,
    en_activite: stats?.en_activite ?? 0,
    arret: stats?.arret ?? 0,
    avgAge: stats?.avgAge ?? "-",
    nbLignes: stats?.totalTrajets ?? 0,
  };
}

const Statistique = () => {
  const dispatch = useDispatch();
  const tableRef = useRef<HTMLDivElement>(null);

  const { interCommune, interWilaya, rural, urbain, scolaire, loading, error } =
    useSelector((state: RootState) => state.stats);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // ✅ fetch all stats function
  const fetchAllStats = () => {
    dispatch(fetchInterCommuneStats({ startDate, endDate }) as any);
    dispatch(fetchInterWilayaStats({ startDate, endDate }) as any);
    dispatch(fetchRuralStats({ startDate, endDate }) as any);
    dispatch(fetchUrbainStats({ startDate, endDate }) as any);
    dispatch(fetchScolaireStats({ startDate, endDate }) as any);
  };

  // ✅ only run once when component mounts
  useEffect(() => {
    fetchAllStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = [
    formatData("Inter-wilaya", interWilaya),
    formatData("Inter-communal", interCommune),
    formatData("Rural", rural),
    formatData("Urbain", urbain),
    formatData("Scolaire", scolaire),
  ];

  // ✅ fix: corrected wrong accumulation logic (tranche_20_30)
  const totalRow = data.reduce(
    (acc, curr) => {
      const totalVehicules = acc.nbVehicules + curr.nbVehicules;

      // Weighted average for vehicle ages
      const totalAgeSum =
        acc.tranche_0_5 * 2.5 +
        acc.tranche_6_10 * 8 +
        acc.tranche_11_15 * 13 +
        acc.tranche_15_20 * 17.5 +
        acc.tranche_20_30 * 25 +
        acc.tranche_plus_30 * 30 +
        curr.tranche_0_5 * 2.5 +
        curr.tranche_6_10 * 8 +
        curr.tranche_11_15 * 13 +
        curr.tranche_15_20 * 17.5 +
        curr.tranche_20_30 * 25 +
        curr.tranche_plus_30 * 30;

      const avgAge =
        totalVehicules > 0 ? (totalAgeSum / totalVehicules).toFixed(1) : "-";

      return {
        type: "Total",
        nbVehicules: acc.nbVehicules + curr.nbVehicules,
        nbOperators: acc.nbOperators + curr.nbOperators,
        nbPlaces: acc.nbPlaces + curr.nbPlaces,
        tranche_0_5: acc.tranche_0_5 + curr.tranche_0_5,
        tranche_6_10: acc.tranche_6_10 + curr.tranche_6_10,
        tranche_11_15: acc.tranche_11_15 + curr.tranche_11_15,
        tranche_15_20: acc.tranche_15_20 + curr.tranche_15_20,
        tranche_20_30: acc.tranche_20_30 + curr.tranche_20_30, // ✅ fixed bug
        tranche_plus_30: acc.tranche_plus_30 + curr.tranche_plus_30,
        en_activite: acc.en_activite + curr.en_activite,
        arret: acc.arret + curr.arret,
        avgAge,
        nbLignes: acc.nbLignes + curr.nbLignes,
      };
    },
    {
      type: "Total",
      nbVehicules: 0,
      nbOperators: 0,
      nbPlaces: 0,
      tranche_0_5: 0,
      tranche_6_10: 0,
      tranche_11_15: 0,
      tranche_15_20: 0,
      tranche_20_30: 0,
      tranche_plus_30: 0,
      en_activite: 0,
      arret: 0,
      avgAge: "-",
      nbLignes: 0,
    }
  );

  const handlePrint = () => {
    const printContents = tableRef.current?.innerHTML;
    const printWindow = window.open("", "", "width=1000,height=700");

    if (printWindow && printContents) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression du Tableau</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; font-size: 13px; }
              th, td { border: 1px solid #000; padding: 6px; text-align: center; }
              thead { background-color: #eee; }
              h2 { text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <h2>Tableau Statistique des Transports</h2>
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <MainContainer>
      <Helmet>
        <title>احصائيات</title>
        <meta name="description" content="مرحبا بك في Finissio" />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>

      <div className="p-4">
        <div className="flex md:w-[50%] justify-between items-center mb-4">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded text-sm"
          >
            طباعة
          </button>
          <h2 className="text-xl text-center font-bold">الاحصائيات العامة</h2>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-end w-full md:justify-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">تاريخ البداية</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">تاريخ النهاية</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <button
            onClick={fetchAllStats}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            تصفية
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center flex-col mt-72">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg mt-2">جاري التحميل...</span>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">Erreur: {error}</p>
        ) : (
          <div
            ref={tableRef}
            className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white mt-6 mb-6"
          >
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-gray-800">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-left font-semibold border border-gray-300"
                  >
                    Transport
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 font-semibold border border-gray-300"
                  >
                    Nb Véhicules
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 font-semibold border border-gray-300"
                  >
                    Nb Opérateurs
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 font-semibold border border-gray-300"
                  >
                    Nb Sièges
                  </th>
                  <th
                    colSpan={6}
                    className="px-4 py-3 font-semibold border border-gray-300 text-center"
                  >
                    Tranche d'âge des véhicules
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 font-semibold border border-gray-300"
                  >
                    En Activité
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 font-semibold border border-gray-300"
                  >
                    Arrêt
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 font-semibold border border-gray-300"
                  >
                    Âge Moyen
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 font-semibold border border-gray-300"
                  >
                    Nb Lignes
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 font-semibold border border-gray-300"
                  >
                    Abs
                  </th>
                </tr>
                <tr>
                  {["0-5", "6-10", "11-15", "15-20", "20-30", "+30"].map(
                    (label, i) => (
                      <th
                        key={i}
                        className="px-4 py-2 font-semibold border border-gray-300"
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-gray-700">
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    {Object.values(row).map((value, j) => (
                      <td
                        key={j}
                        className="px-4 py-2 border border-gray-200 text-center"
                      >
                        {typeof value === "number" ? value : `${value}`}
                      </td>
                    ))}
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      /
                    </td>
                  </tr>
                ))}

                <tr className="bg-blue-50 text-blue-900 font-bold">
                  {Object.values(totalRow).map((value, j) => (
                    <td
                      key={j}
                      className="px-4 py-2 border border-gray-300 text-center"
                    >
                      {typeof value === "number" ? value : `${value}`}
                    </td>
                  ))}
                  <td className="px-4 py-2 border border-gray-300 text-center">
                    /
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainContainer>
  );
};

export default Statistique;
