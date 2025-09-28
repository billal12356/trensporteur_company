import MainContainer from "@/components/MainContainer";
import React, { useRef, useState } from "react";
import { TransportStatsTable } from "./transport-stats-table";

const TransportTable: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");

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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-foreground">
          Statistiques de Transport de Voyageurs
        </h1>

        <div className="mb-4 flex justify-between">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded text-sm"
          >
            طباعة
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">📅 Start Date</label>
              <input
                type="date"
                className="border rounded p-2 text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">📅 End Date</label>
              <input
                type="date"
                className="border rounded p-2 text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ✅ Attach ref here so we capture the table for printing */}
        <div ref={tableRef} >
          <TransportStatsTable startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </MainContainer>
  );
};

export default TransportTable;
