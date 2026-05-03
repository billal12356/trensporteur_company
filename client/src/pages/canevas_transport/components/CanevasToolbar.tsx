import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchCanevasData,
  exportCanevasExcel,
  resetCanevas,
} from "@/redux/slice/canevasSlice";
import { toast } from "sonner";

interface CanevasToolbarProps {
  tableRef: React.RefObject<HTMLDivElement | null>;
}

const CanevasToolbar: React.FC<CanevasToolbarProps> = ({ tableRef }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, saving, wilaya, annee, trimestre } = useSelector(
    (state: RootState) => state.canevas
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /** Charger les données depuis le serveur */
  const handleLoad = async () => {
    try {
      await dispatch(
        fetchCanevasData({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          wilaya,
          annee,
          trimestre,
        })
      ).unwrap();
      toast.success("Données chargées avec succès");
    } catch (err) {
      toast.error("Échec du chargement des données");
    }
  };

  /** Imprimer le tableau */
  const handlePrint = () => {
    const printContents = tableRef.current?.innerHTML;
    const printWindow = window.open("", "", "width=1400,height=900");

    if (printWindow && printContents) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Canevas n°01 - Transport Routier de Voyageurs</title>
            <style>
              @page { size: landscape; margin: 8mm; }
              body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 10px; font-size: 11px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #333; padding: 3px 4px; text-align: center; }
              thead th { background-color: #3b82f6; color: white; font-weight: 600; }
              h2 { text-align: center; margin-bottom: 5px; color: #1e40af; }
              .header-info { text-align: center; margin-bottom: 15px; color: #555; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <h2>Canevas n°01: TRANSPORT ROUTIER DE VOYAGEURS</h2>
            <div class="header-info">
              Wilaya: ${wilaya || "___"} | Année: ${annee || "___"} | Trimestre: ${trimestre || "___"}
            </div>
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  /** Exporter Excel depuis le serveur */
  const handleExport = async () => {
    try {
      await dispatch(
        exportCanevasExcel({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          wilaya,
          annee,
          trimestre,
        })
      ).unwrap();
      toast.success("Export Excel réussi");
    } catch (err) {
      toast.error("Échec de l'export Excel");
    }
  };

  /** Réinitialiser */
  const handleReset = () => {
    dispatch(resetCanevas());
    setStartDate("");
    setEndDate("");
    toast.info("Formulaire réinitialisé");
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Filtres de date */}
      <div className="flex flex-wrap items-end gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 mb-1">📅 Date début</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 mb-1">📅 Date fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        {/* Charger */}
        <button
          id="canevas-load-btn"
          onClick={handleLoad}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Chargement..." : "Charger les données"}
        </button>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Imprimer */}
        <button
          id="canevas-print-btn"
          onClick={handlePrint}
          disabled={!data}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimer
        </button>

        {/* Exporter Excel */}
        <button
          id="canevas-export-btn"
          onClick={handleExport}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {saving ? "Exportation..." : "Exporter Excel"}
        </button>

        {/* Réinitialiser */}
        <button
          id="canevas-reset-btn"
          onClick={handleReset}
          className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default CanevasToolbar;
