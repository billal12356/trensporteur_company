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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Tableau des Transports</h2>
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                    >
                        Imprimer
                    </button>
                </div>

                <div className="flex items-end gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium">Date début</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border px-2 py-1 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Date fin</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border px-2 py-1 rounded"
                        />
                    </div>
                    <button
                        onClick={fetchAllStats}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        Filtrer
                    </button>
                </div>

                {loading ? (
                    <p>Chargement...</p>
                ) : error ? (
                    <p className="text-red-500">Erreur: {error}</p>
                ) : (
                    <div ref={tableRef} className="overflow-auto">
                        <table className="w-full border border-gray-300 text-sm">
                            <thead className="bg-gray-100 h-[20px]">
                                <tr>
                                    <th rowSpan={2}>Transport</th>
                                    <th rowSpan={2}>Nb Véhicules</th>
                                    <th rowSpan={2}>Nb Opérateurs</th>
                                    <th rowSpan={2}>Nb Sièges</th>
                                    <th colSpan={5}>Tranche d'âge des véhicules</th>
                                    <th rowSpan={2}>En Activité</th>
                                    <th rowSpan={2}>Arrêt</th>
                                    <th rowSpan={2}>Âge Moyen</th>
                                    <th rowSpan={2}>Nb Lignes</th>
                                    <th rowSpan={2}>Remarques</th>
                                </tr>
                                <tr>
                                    <th>0-5</th>
                                    <th>6-10</th>
                                    <th>11-15</th>
                                    <th>15-20</th>
                                    <th>+20</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 p-4">
                                {/* ✅ صف الـ TOTAL سيتم إضافته مباشرة قبل صف الـ Urbain */}
                                {data.map((row, index) => {
                                    if (row.type === "Urbain") {
                                        return (
                                            <>
                                                {/* صف الـ Total */}
                                                <tr className="bg-blue-100 text-blue-800 font-bold h-4 p-3">
                                                    <td>{totalRow.type}</td>
                                                    <td>{totalRow.nbVehicules}</td>
                                                    <td>{totalRow.nbOperators}</td>
                                                    <td>{totalRow.nbPlaces}</td>
                                                    <td>{totalRow.tranche_0_5}</td>
                                                    <td>{totalRow.tranche_6_10}</td>
                                                    <td>{totalRow.tranche_11_15}</td>
                                                    <td>{totalRow.tranche_15_20}</td>
                                                    <td>{totalRow.tranche_plus_20}</td>
                                                    <td>{totalRow.en_activite}</td>
                                                    <td>{totalRow.arret}</td>
                                                    <td>{totalRow.avgAge} ans</td>
                                                    <td>{totalRow.nbLignes}</td>
                                                    <td>/</td>
                                                </tr>

                                                {/* صف Urbain بعد صف الـ Total */}
                                                <tr key={index}>
                                                    <td>{row.type}</td>
                                                    <td>{row.nbVehicules}</td>
                                                    <td>{row.nbOperators}</td>
                                                    <td>{row.nbPlaces}</td>
                                                    <td>{row.tranche_0_5}</td>
                                                    <td>{row.tranche_6_10}</td>
                                                    <td>{row.tranche_11_15}</td>
                                                    <td>{row.tranche_15_20}</td>
                                                    <td>{row.tranche_plus_20}</td>
                                                    <td>{row.en_activite}</td>
                                                    <td>{row.arret}</td>
                                                    <td>{row.avgAge} ans</td>
                                                    <td>{row.nbLignes}</td>
                                                    <td>/</td>
                                                </tr>
                                            </>
                                        );
                                    }
                                    return (
                                        <tr key={index} className="p-3">
                                            <td>{row.type}</td>
                                            <td>{row.nbVehicules}</td>
                                            <td>{row.nbOperators}</td>
                                            <td>{row.nbPlaces}</td>
                                            <td>{row.tranche_0_5}</td>
                                            <td>{row.tranche_6_10}</td>
                                            <td>{row.tranche_11_15}</td>
                                            <td>{row.tranche_15_20}</td>
                                            <td>{row.tranche_plus_20}</td>
                                            <td>{row.en_activite}</td>
                                            <td>{row.arret}</td>
                                            <td>{row.avgAge} ans</td>
                                            <td>{row.nbLignes}</td>
                                            <td>/</td>
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
