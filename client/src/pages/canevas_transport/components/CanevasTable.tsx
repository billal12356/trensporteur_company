import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  TransportSection,
  VehicleBreakdown,
  VehicleField,
} from "../types/canevas-types";

// ============================
// Colonnes du PARC CIRCULANT
// ============================
const COLUMNS: { key: VehicleField; label: string; sublabel?: string }[] = [
  { key: "autocar", label: "Autocar", sublabel: "(35 places et plus)" },
  { key: "minicar", label: "Minicar", sublabel: "(24 - 34 places)" },
  { key: "autobus", label: "Autobus", sublabel: "(70 places et plus)" },
  { key: "minibus", label: "Minibus", sublabel: "(40 - 69 places)" },
  { key: "autresVehicules", label: "Autres Véhicules", sublabel: "(15 - 23 places)" },
  { key: "camionAmenage", label: "Camion Aménagé" },
  { key: "total", label: "TOTAL" },
  { key: "placesOffertes", label: "Places offertes" },
  { key: "nombreOperateurs", label: "Nombre d'opérateurs" },
  { key: "pourcentage", label: "%" },
  { key: "nombreChauffeurs", label: "Nombre de Chauffeurs" },
  { key: "voyageursJour", label: "Nombre de Voyageurs", sublabel: "Jour" },
  { key: "voyageursMois", label: "Nombre de Voyageurs", sublabel: "Mois" },
  { key: "nombreOperateursReel", label: "Nombre d'opérateurs", sublabel: "(réel)" },
];

// ============================
// Composant Cellule Read-Only
// ============================
interface CellProps {
  value: number;
  isBold?: boolean;
}

const ReadOnlyCell: React.FC<CellProps> = React.memo(({ value, isBold = false }) => (
  <td
    className={`border border-gray-300 px-1 py-1 text-center font-mono text-xs whitespace-nowrap
      ${isBold ? "font-bold" : ""}`}
  >
    {value === 0 ? "0" : value.toLocaleString("fr-FR")}
  </td>
));

ReadOnlyCell.displayName = "ReadOnlyCell";

// ============================
// Composant Ligne Read-Only
// ============================
interface DataRowProps {
  label: string;
  data: VehicleBreakdown;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isCombined?: boolean;
  indent?: boolean;
}

const DataRow: React.FC<DataRowProps> = React.memo(
  ({ label, data, isSubtotal = false, isTotal = false, isCombined = false, indent = false }) => {
    const rowClass = isTotal
      ? isCombined
        ? "bg-indigo-900 text-white font-bold"
        : "bg-blue-700 text-white font-bold"
      : isSubtotal
        ? isCombined
          ? "bg-indigo-100 font-semibold"
          : "bg-blue-100 font-semibold"
        : isCombined
          ? "bg-indigo-50/40 hover:bg-indigo-50"
          : "bg-white hover:bg-gray-50";

    const stickyCellClass = isTotal
      ? isCombined ? "bg-indigo-900 text-white" : "bg-blue-700 text-white"
      : isSubtotal
        ? isCombined ? "bg-indigo-100" : "bg-blue-100"
        : isCombined ? "bg-indigo-50/40" : "bg-white";

    return (
      <tr className={`${rowClass} transition-colors duration-100`}>
        <td
          className={`border border-gray-300 px-2 py-1.5 text-left text-xs font-medium whitespace-nowrap sticky left-0 z-10
            ${stickyCellClass} ${indent ? "pl-6" : ""}`}
        >
          {label}
        </td>
        {COLUMNS.map((col) => (
          <ReadOnlyCell
            key={col.key}
            value={data[col.key]}
            isBold={isSubtotal || isTotal}
          />
        ))}
      </tr>
    );
  }
);

DataRow.displayName = "DataRow";

// ============================
// Section Header
// ============================
interface SectionHeaderProps {
  title: string;
  bgColor?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, bgColor = "bg-blue-500" }) => (
  <tr>
    <td
      colSpan={COLUMNS.length + 1}
      className={`${bgColor} text-white font-bold text-xs px-3 py-2 text-left border border-gray-300 sticky left-0 z-10`}
    >
      {title}
    </td>
  </tr>
);

// ============================
// Sub-Section Header
// ============================
interface SubSectionHeaderProps {
  title: string;
  bgColor?: string;
}

const SubSectionHeader: React.FC<SubSectionHeaderProps> = ({ title, bgColor = "bg-blue-300" }) => (
  <tr>
    <td
      colSpan={COLUMNS.length + 1}
      className={`${bgColor} text-gray-900 font-semibold text-xs px-3 py-1.5 text-left border border-gray-300 italic sticky left-0 z-10`}
    >
      {title}
    </td>
  </tr>
);

// ============================
// Render Sections
// ============================
const renderSection = (sectionData: TransportSection, isCombined = false) => {
  const tpv = sectionData.transportPublicVoyageurs;
  const tr = sectionData.transport;
  const subHeaderBg = isCombined ? "bg-indigo-200" : "bg-blue-200";

  return (
    <>
      <SubSectionHeader title="TRANSPORT PUBLIC DE VOYAGEURS" bgColor={subHeaderBg} />
      <DataRow label="Inter-wilaya" data={tpv.interWilaya} isCombined={isCombined} indent />
      <DataRow label="Inter-communale" data={tpv.interCommunale} isCombined={isCombined} indent />
      <DataRow label="RURAL" data={tpv.rural} isCombined={isCombined} indent />
      <DataRow label="URBAIN" data={tpv.urbain} isCombined={isCombined} indent />
      <DataRow
        label={isCombined ? "S/TOTAL(1+2) (PUBLIC)+(PRIVÉ)" : "S/TOTAL"}
        data={tpv.sousTotal}
        isSubtotal
        isCombined={isCombined}
      />

      <SubSectionHeader title="TRANSPORT" bgColor={subHeaderBg} />
      <DataRow label="universitaire" data={tr.universitaire} isCombined={isCombined} indent />
      <DataRow label="scolaire" data={tr.scolaire} isCombined={isCombined} indent />
      <DataRow label="personnel" data={tr.personnel} isCombined={isCombined} indent />
      <DataRow
        label={isCombined ? "S/TOTAL (1+2) (PUBLIC)+(PRIVÉ)" : "S/TOTAL"}
        data={tr.sousTotal}
        isSubtotal
        isCombined={isCombined}
      />
    </>
  );
};

// ============================
// COMPOSANT PRINCIPAL: CanevasTable
// ============================
const CanevasTable: React.FC = () => {
  const { data: canevasData, loading, error } = useSelector(
    (state: RootState) => state.canevas
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">❌ {error}</p>
      </div>
    );
  }

  if (!canevasData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">
          Sélectionnez les paramètres et cliquez sur "Charger" pour afficher les données.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-xl border border-gray-200">
      <table className="w-full border-collapse text-sm min-w-[1600px]">
        {/* ===== THEAD ===== */}
        <thead className="sticky top-0 z-20">
          <tr>
            <th
              className="border border-gray-300 bg-blue-800 text-white px-3 py-3 text-left text-xs font-bold min-w-[200px] sticky left-0 z-30"
              rowSpan={2}
            >
              STATUT
            </th>
            <th className="border border-gray-300 bg-blue-700 text-white px-2 py-2 text-center text-xs font-bold" colSpan={6}>
              PARC CIRCULANT
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              TOTAL
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              <div>Places</div><div className="text-[10px] font-normal">offertes</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              <div>Nombre</div><div className="text-[10px] font-normal">d'opérateurs</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              %
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              <div>Nombre de</div><div className="text-[10px] font-normal">Chauffeurs</div>
            </th>
            <th className="border border-gray-300 bg-blue-500 text-white px-2 py-2 text-center text-xs font-bold" colSpan={2}>
              <div>Nombre de Voyageurs</div>
            </th>
            <th className="border border-gray-300 bg-blue-500 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              <div>Nombre</div><div className="text-[10px] font-normal">d'opérateurs (réel)</div>
            </th>
          </tr>

          <tr>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>Autocar</div><div className="font-normal">(35 places et plus)</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>Minicar</div><div className="font-normal">(24 - 34 places)</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>Autobus</div><div className="font-normal">(70 places et plus)</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>Minibus</div><div className="font-normal">(40 - 69 places)</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>Autres Véhicules</div><div className="font-normal">(15 - 23 places)</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              Camion Aménagé
            </th>
            <th className="border border-gray-300 bg-blue-500 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[70px]">
              Jour
            </th>
            <th className="border border-gray-300 bg-blue-500 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[70px]">
              Mois
            </th>
          </tr>
        </thead>

        {/* ===== TBODY ===== */}
        <tbody>
          {/* ───── SECTION 1: STATUT PUBLIC ───── */}
          <SectionHeader title="1. STATUT PUBLIC (ETUS, EPE,...)" bgColor="bg-blue-500" />
          {renderSection(canevasData.statutPublic)}
          <DataRow label="TOTAL 01 (STATUT PUBLIC)" data={canevasData.statutPublic.total} isTotal />

          {/* ───── SECTION 2: STATUT PRIVÉ ───── */}
          <SectionHeader title="2. STATUT PRIVÉ" bgColor="bg-blue-500" />
          {renderSection(canevasData.statutPrive)}
          <DataRow label="TOTAL 02 (STATUT PRIVÉ)" data={canevasData.statutPrive.total} isTotal />

          {/* ───── SECTION 3: COMBINÉ (PUBLIC + PRIVÉ) ───── */}
          <SectionHeader title="3. TRANSPORT ROUTIER DE VOYAGEURS (STATUT PUBLIC) + (STATUT PRIVÉ)" bgColor="bg-indigo-700" />
          {renderSection(canevasData.combined, true)}
          <DataRow
            label="TOTAL GÉNÉRAL (1+2) (PUBLIC)+(PRIVÉ)"
            data={canevasData.combined.total}
            isTotal
            isCombined
          />
        </tbody>
      </table>
    </div>
  );
};

export default CanevasTable;
