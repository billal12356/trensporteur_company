import React, { useRef } from "react";
import MainContainer from "@/components/MainContainer";
import CanevasHeader from "./components/CanevasHeader";
import CanevasToolbar from "./components/CanevasToolbar";
import CanevasTable from "./components/CanevasTable";

const CanevasTransport: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null);

  return (
    <MainContainer>
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        {/* En-tête du Canevas */}
        <CanevasHeader />

        {/* Barre d'outils */}
        <CanevasToolbar tableRef={tableRef} />

        {/* Tableau principal */}
        <div ref={tableRef}>
          <CanevasTable />
        </div>

        {/* Pied de page */}
        <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
          <p>Canevas n°01 — Direction des Transports</p>
          <p>© {new Date().getFullYear()} — Transport Routier de Voyageurs</p>
        </div>
      </div>
    </MainContainer>
  );
};

export default CanevasTransport;
