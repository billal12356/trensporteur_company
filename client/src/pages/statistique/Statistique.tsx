import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInterCommuneStats,
  fetchInterWilayaStats,
  fetchRuralStats,
  fetchScolaireStats,
  fetchtravailleursStats,
  fetchUrbainStats,
} from "@/redux/slice/stateSlice";
import { RootState, AppDispatch } from "@/redux/store";
import MainContainer from "@/components/MainContainer";
import { Helmet } from "react-helmet-async";

interface StatData {
  type: string;
  nbVehicules: number;
  nbOperators: number;
  nbPlaces: number;
  tranche_0_5: number;
  tranche_6_10: number;
  tranche_11_15: number;
  tranche_15_20: number;
  tranche_20_25: number;
  tranche_25_30: number;
  tranche_plus_30: number;
  en_activite: number;
  arret: number;
  avgAge: string | number;
  nbLignes: number;
}

function formatData(type: string, stats: any): StatData {
  return {
    type,
    nbVehicules: stats?.nbVehicules ?? 0,
    nbOperators: stats?.nbOperators ?? 0,
    nbPlaces: stats?.nbPlaces ?? 0,
    tranche_0_5: stats?.age_0_5 ?? 0,
    tranche_6_10: stats?.age_6_10 ?? 0,
    tranche_11_15: stats?.age_11_15 ?? 0,
    tranche_15_20: stats?.age_15_20 ?? 0,
    tranche_20_25: stats?.age_20_25 ?? 0,
    tranche_25_30: stats?.age_25_30 ?? 0,
    tranche_plus_30: stats?.age_plus_30 ?? 0,
    en_activite: stats?.en_activite ?? 0,
    arret: stats?.arret ?? 0,
    avgAge: stats?.avgAge ?? "-",
    nbLignes: stats?.totalTrajets ?? 0,
  };
}

const Statistique = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    interCommune,
    interWilaya,
    rural,
    urbain,
    scolaire,
    travailleur,
    loading,
    error,
  } = useSelector((state: RootState) => state.stats);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Fetch all stats
  const fetchAllStats = () => {
    dispatch(fetchInterCommuneStats({ startDate, endDate }));
    dispatch(fetchInterWilayaStats({ startDate, endDate }));
    dispatch(fetchRuralStats({ startDate, endDate }));
    dispatch(fetchUrbainStats({ startDate, endDate }));
    dispatch(fetchScolaireStats({ startDate, endDate }));
    dispatch(fetchtravailleursStats({ startDate, endDate }));
  };

  // ✅ Only run once at mount
  useEffect(() => {
    fetchAllStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data: StatData[] = [
    formatData("Inter-wilaya", interWilaya),
    formatData("Inter-communal", interCommune),
    formatData("Rural", rural),
    formatData("Urbain", urbain),
    formatData("Scolaire", scolaire),
    formatData("Travailleurs", travailleur),
  ];

  // ✅ Fix total calculation (avoid wrong avgAge computation)
  const totalRow: StatData = data.reduce(
    (acc, curr) => {
      const totalVehicules = acc.nbVehicules + curr.nbVehicules;

      const totalAgeSum =
        acc.tranche_0_5 * 2.5 +
        acc.tranche_6_10 * 8 +
        acc.tranche_11_15 * 13 +
        acc.tranche_15_20 * 17.5 +
        acc.tranche_20_25 * 22.5 +
        acc.tranche_25_30 * 27.5 +
        acc.tranche_plus_30 * 35 +
        curr.tranche_0_5 * 2.5 +
        curr.tranche_6_10 * 8 +
        curr.tranche_11_15 * 13 +
        curr.tranche_15_20 * 17.5 +
        curr.tranche_20_25 * 22.5 +
        curr.tranche_25_30 * 27.5 +
        curr.tranche_plus_30 * 35;

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
        tranche_20_25: acc.tranche_20_25 + curr.tranche_20_25,
        tranche_25_30: acc.tranche_25_30 + curr.tranche_25_30,
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
      tranche_20_25: 0,
      tranche_25_30: 0,
      tranche_plus_30: 0,
      en_activite: 0,
      arret: 0,
      avgAge: "-",
      nbLignes: 0,
    }
  );

  // ✅ Print table
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

        {/* ✅ Filter controls */}
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

        {/* ✅ Table */}
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
                  <th rowSpan={2}>Transport</th>
                  <th rowSpan={2}>Nb Véhicules</th>
                  <th rowSpan={2}>Nb Opérateurs</th>
                  <th rowSpan={2}>Nb Sièges</th>
                  <th colSpan={7}>Tranche d'âge des véhicules</th>
                  <th rowSpan={2}>En Activité</th>
                  <th rowSpan={2}>Arrêt</th>
                  <th rowSpan={2}>Âge Moyen</th>
                  <th rowSpan={2}>Nb Lignes</th>
                  <th rowSpan={2}>Abs</th>
                </tr>
                <tr>
                  {["0-5", "6-10", "11-15", "15-20", "20-25", "25-30", "+30"].map(
                    (label, i) => (
                      <th key={i}>{label}</th>
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
                      <td key={j}>{value}</td>
                    ))}
                    <td>/</td>
                  </tr>
                ))}

                <tr className="bg-blue-50 text-blue-900 font-bold">
                  {Object.values(totalRow).map((value, j) => (
                    <td key={j}>{value}</td>
                  ))}
                  <td>/</td>
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
