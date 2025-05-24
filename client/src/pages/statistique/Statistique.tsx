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
        tranche_plus_20: stats?.age_plus_20 ?? 0,
        en_activite: stats?.en_activite ?? 0,
        arret: stats?.arret ?? 0,
        avgAge: stats?.avgAge ?? "-",
        nbLignes: stats?.totalTrajets ?? 0,
    };
}

const Statistique = () => {
    const dispatch = useDispatch();
    const tableRef = useRef<HTMLDivElement>(null);

    const { interCommune, interWilaya, rural, urbain, scolaire, loading, error } = useSelector(
        (state: RootState) => state.stats
    );
    console.log(interWilaya);
    

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const fetchAllStats = () => {
        dispatch(fetchInterCommuneStats({ startDate, endDate }) as any);
        dispatch(fetchInterWilayaStats({ startDate, endDate }) as any);
        dispatch(fetchRuralStats({ startDate, endDate }) as any);
        dispatch(fetchUrbainStats({ startDate, endDate }) as any);
        dispatch(fetchScolaireStats({ startDate, endDate }) as any);
    };

    useEffect(() => {
        fetchAllStats();
    }, []); // تنفيذ مرة واحدة فقط عند التحميل

    const data = [
        formatData("Inter-wilaya", interWilaya),
        formatData("Inter-communal", interCommune),
        formatData("Rural", rural),
        formatData("Urbain", urbain),
        formatData("Scolaire", scolaire),
    ];

    const totalRow = data.reduce((acc, curr) => {
        const totalVehicles = acc.nbVehicules + curr.nbVehicules;

        const totalAgeSum =
            acc.tranche_0_5 * 2.5 +
            acc.tranche_6_10 * 8 +
            acc.tranche_11_15 * 13 +
            acc.tranche_15_20 * 17.5 +
            acc.tranche_plus_20 * 25 +
            curr.tranche_0_5 * 2.5 +
            curr.tranche_6_10 * 8 +
            curr.tranche_11_15 * 13 +
            curr.tranche_15_20 * 17.5 +
            curr.tranche_plus_20 * 25;

        const avgAge = totalVehicles > 0 ? (totalAgeSum / totalVehicles).toFixed(1) : "-";

        return {
            type: "Total",
            nbVehicules: acc.nbVehicules + curr.nbVehicules,
            nbOperators: acc.nbOperators + curr.nbOperators,
            nbPlaces: acc.nbPlaces + curr.nbPlaces,
            tranche_0_5: acc.tranche_0_5 + curr.tranche_0_5,
            tranche_6_10: acc.tranche_6_10 + curr.tranche_6_10,
            tranche_11_15: acc.tranche_11_15 + curr.tranche_11_15,
            tranche_15_20: acc.tranche_15_20 + curr.tranche_15_20,
            tranche_plus_20: acc.tranche_plus_20 + curr.tranche_plus_20,
            en_activite: acc.en_activite + curr.en_activite,
            arret: acc.arret + curr.arret,
            avgAge,
            nbLignes: acc.nbLignes + curr.nbLignes,
        };
    }, {
        type: "Total",
        nbVehicules: 0,
        nbOperators: 0,
        nbPlaces: 0,
        tranche_0_5: 0,
        tranche_6_10: 0,
        tranche_11_15: 0,
        tranche_15_20: 0,
        tranche_plus_20: 0,
        en_activite: 0,
        arret: 0,
        avgAge: "-",
        nbLignes: 0,
    });

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

                <div className="flex flex-col md:flex-row justify-center items-center md:items-end w-[100%] mg:justify-end gap-4 mb-4">
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
                    <p>Chargement...</p>
                ) : error ? (
                    <p className="text-red-500">Erreur: {error}</p>
                ) : (
                    <div ref={tableRef} className="overflow-auto mt-6 mb-6 rounded shadow-md">
                        <table className="w-full border border-gray-300 text-sm table-auto">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th rowSpan={2} className="p-3">Transport</th>
                                    <th rowSpan={2} className="p-3">Nb Véhicules</th>
                                    <th rowSpan={2} className="p-3">Nb Opérateurs</th>
                                    <th rowSpan={2} className="p-3">Nb Sièges</th>
                                    <th colSpan={5} className="p-3">Tranche d'âge des véhicules</th>
                                    <th rowSpan={2} className="p-3">En Activité</th>
                                    <th rowSpan={2} className="p-3">Arrêt</th>
                                    <th rowSpan={2} className="p-3">Âge Moyen</th>
                                    <th rowSpan={2} className="p-3">Nb Lignes</th>
                                    <th rowSpan={2} className="p-3">abs</th>
                                </tr>
                                <tr>
                                    <th className="p-3">0-5</th>
                                    <th className="p-3">6-10</th>
                                    <th className="p-3">11-15</th>
                                    <th className="p-3">15-20</th>
                                    <th className="p-3">+20</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((row, index) => {
                                    if (row.type === "Urbain") {
                                        return (
                                            <>
                                                <tr className="bg-blue-100 text-blue-800 font-bold">
                                                    <td className="p-3">{totalRow.type}</td>
                                                    <td className="p-3">{totalRow.nbVehicules}</td>
                                                    <td className="p-3">{totalRow.nbOperators}</td>
                                                    <td className="p-3">{totalRow.nbPlaces}</td>
                                                    <td className="p-3">{totalRow.tranche_0_5}</td>
                                                    <td className="p-3">{totalRow.tranche_6_10}</td>
                                                    <td className="p-3">{totalRow.tranche_11_15}</td>
                                                    <td className="p-3">{totalRow.tranche_15_20}</td>
                                                    <td className="p-3">{totalRow.tranche_plus_20}</td>
                                                    <td className="p-3">{totalRow.en_activite}</td>
                                                    <td className="p-3">{totalRow.arret}</td>
                                                    <td className="p-3">{totalRow.avgAge} ans</td>
                                                    <td className="p-3">{totalRow.nbLignes}</td>
                                                    <td className="p-3">/</td>
                                                </tr>
                                                <tr key={index}>
                                                    {Object.values(row).map((value, i) => (
                                                        <td key={i} className="p-3">{typeof value === 'number' ? value : `${value}`}</td>
                                                    ))}
                                                    <td className="p-3">/</td>
                                                </tr>
                                            </>
                                        );
                                    }

                                    return (
                                        <tr key={index}>
                                            {Object.values(row).map((value, i) => (
                                                <td key={i} className="p-3">{typeof value === 'number' ? value : `${value}`}</td>
                                            ))}
                                            <td className="p-3">/</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                )}
            </div>
        </MainContainer>
    );
};

export default Statistique;
