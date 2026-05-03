import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  MoyensAgeBreakdown,
  MoyensAgeField,
  MoyensSection,
} from "../types/canevas-types";

// ============================
// Colonnes du tableau LES MOYENS
// ============================
const MOYENS_COLUMNS: { key: MoyensAgeField; label: string; sublabel?: string }[] = [
  { key: "moins5", label: "Moins de", sublabel: "05 ans" },
  { key: "de5a10", label: "De 05 ans à", sublabel: "moins de 10 ans [5,10[" },
  { key: "de10a15", label: "De 10 ans à", sublabel: "moins de 15 ans [10,15[" },
  { key: "de15a20", label: "De 15 ans à", sublabel: "moins de 20 ans [15,20[" },
  { key: "de20a25", label: "De 20 ans à", sublabel: "moins de 25 ans [20,25[" },
  { key: "de25a30", label: "De 25 ans à", sublabel: "moins de 30 ans [25,30[" },
  { key: "plus30", label: "De 30 ans", sublabel: "et plus [30,+[" },
  { key: "total", label: "TOTAL" },
  { key: "ageMoyen", label: "Âge moyen", sublabel: "(ans)" },
  { key: "pourcentage", label: "%" },
];

// ============================
// Vehicle category rows
// ============================
const VEHICLE_ROWS: { key: keyof Omit<MoyensSection, "sousTotal">; label: string; sublabel?: string }[] = [
  { key: "autocar", label: "Autocar", sublabel: "(35 places et plus)" },
  { key: "minicar", label: "Minicar", sublabel: "(24 - 34 places)" },
  { key: "autobus", label: "Autobus", sublabel: "(70 places et plus)" },
  { key: "minibus", label: "Minibus", sublabel: "(40 - 69 places)" },
  { key: "autresVehicules", label: "Autres Véhicules", sublabel: "(10 - 23 places)" },
  { key: "camionAmenage", label: "Camion Aménagé" },
];

// ============================
// Composant Cellule Read-Only
// ============================
interface CellProps {
  value: number;
  isBold?: boolean;
  isDecimal?: boolean;
}

const ReadOnlyCell: React.FC<CellProps> = React.memo(({ value, isBold = false, isDecimal = false }) => (
  <td
    className={`border border-gray-300 px-1 py-1 text-center font-mono text-xs whitespace-nowrap
      ${isBold ? "font-bold" : ""}`}
  >
    {isDecimal
      ? (value === 0 ? "0" : value.toFixed(2))
      : (value === 0 ? "0" : value.toLocaleString("fr-FR"))}
  </td>
));

ReadOnlyCell.displayName = "ReadOnlyMoyensCell";

// ============================
// Composant Ligne
// ============================
interface DataRowProps {
  label: string;
  sublabel?: string;
  data: MoyensAgeBreakdown;
  isSubtotal?: boolean;
  isCombined?: boolean;
  indent?: boolean;
}

const MoyensDataRow: React.FC<DataRowProps> = React.memo(
  ({ label, sublabel, data, isSubtotal = false, isCombined = false, indent = false }) => {
    const rowClass = isSubtotal
      ? isCombined
        ? "bg-indigo-100 font-semibold"
        : "bg-blue-100 font-semibold"
      : isCombined
        ? "bg-indigo-50/40 hover:bg-indigo-50"
        : "bg-white hover:bg-gray-50";

    const stickyCellClass = isSubtotal
      ? isCombined ? "bg-indigo-100" : "bg-blue-100"
      : isCombined ? "bg-indigo-50/40" : "bg-white";

    return (
      <tr className={`${rowClass} transition-colors duration-100`}>
        <td
          className={`border border-gray-300 px-2 py-1.5 text-left text-xs font-medium whitespace-nowrap sticky left-0 z-10
            ${stickyCellClass} ${indent ? "pl-6" : ""}`}
        >
          {label}
          {sublabel && <span className="text-[10px] font-normal text-gray-500 ml-1">{sublabel}</span>}
        </td>
        {MOYENS_COLUMNS.map((col) => (
          <ReadOnlyCell
            key={col.key}
            value={data[col.key]}
            isBold={isSubtotal}
            isDecimal={col.key === "ageMoyen" || col.key === "pourcentage"}
          />
        ))}
      </tr>
    );
  }
);

MoyensDataRow.displayName = "MoyensDataRow";

// ============================
// Section Header
// ============================
const SectionHeader: React.FC<{ title: string; bgColor?: string }> = ({ title, bgColor = "bg-blue-500" }) => (
  <tr>
    <td
      colSpan={MOYENS_COLUMNS.length + 1}
      className={`${bgColor} text-white font-bold text-xs px-3 py-2 text-left border border-gray-300 sticky left-0 z-10`}
    >
      {title}
    </td>
  </tr>
);

// ============================
// Render Section
// ============================
const renderMoyensSection = (sectionData: MoyensSection, isCombined = false) => (
  <>
    {VEHICLE_ROWS.map((vr) => (
      <MoyensDataRow
        key={vr.key}
        label={vr.label}
        sublabel={vr.sublabel}
        data={sectionData[vr.key]}
        isCombined={isCombined}
        indent
      />
    ))}
    <MoyensDataRow
      label="S/TOTAL"
      data={sectionData.sousTotal}
      isSubtotal
      isCombined={isCombined}
    />
  </>
);

// ============================
// COMPOSANT PRINCIPAL: CanevasMoyensTable
// ============================
const CanevasMoyensTable: React.FC = () => {
  const { data: canevasData } = useSelector(
    (state: RootState) => state.canevas
  );

  if (!canevasData || !canevasData.moyensStatutPublic) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-xl border border-gray-200 mt-8">
      {/* Titre du tableau */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3">
        <h2 className="text-white font-bold text-sm text-center">
          LES MOYENS
        </h2>
      </div>

      <table className="w-full border-collapse text-sm min-w-[1200px]">
        {/* ===== THEAD ===== */}
        <thead className="sticky top-0 z-20">
          <tr>
            <th
              className="border border-gray-300 bg-blue-800 text-white px-3 py-3 text-left text-xs font-bold min-w-[200px] sticky left-0 z-30"
              rowSpan={2}
            >
              Tranches d'âges (ans)
            </th>
            <th className="border border-gray-300 bg-blue-700 text-white px-2 py-2 text-center text-xs font-bold" colSpan={7}>
              RÉPARTITION PAR TRANCHES D'ÂGES
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              TOTAL
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              <div>Âge moyen</div><div className="text-[10px] font-normal">(ans)</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              %
            </th>
          </tr>

          <tr>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>Moins de</div><div className="font-normal">05 ans</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>De 05 ans à</div><div className="font-normal">moins de 10 ans [5,10[</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>De 10 ans à</div><div className="font-normal">moins de 15 ans [10,15[</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>De 15 ans à</div><div className="font-normal">moins de 20 ans [15,20[</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>De 20 ans à</div><div className="font-normal">moins de 25 ans [20,25[</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>De 25 ans à</div><div className="font-normal">moins de 30 ans [25,30[</div>
            </th>
            <th className="border border-gray-300 bg-blue-600 text-white px-1 py-1.5 text-center text-[10px] font-semibold min-w-[80px]">
              <div>De 30 ans</div><div className="font-normal">et plus [30,+[</div>
            </th>
          </tr>
        </thead>

        {/* ===== TBODY ===== */}
        <tbody>
          {/* ───── SECTION 1: STATUT PUBLIC ───── */}
          <SectionHeader title="1. STATUT PUBLIC (ETUS, EPE,...)" bgColor="bg-blue-500" />
          {renderMoyensSection(canevasData.moyensStatutPublic)}

          {/* ───── SECTION 2: STATUT PRIVÉ ───── */}
          <SectionHeader title="2. STATUT PRIVÉ" bgColor="bg-blue-500" />
          {renderMoyensSection(canevasData.moyensStatutPrive)}

          {/* ───── SECTION 3: COMBINÉ (PUBLIC + PRIVÉ) ───── */}
          <SectionHeader title="3. TRANSPORT ROUTIER DE VOYAGEURS (STATUT PUBLIC) + (STATUT PRIVÉ)" bgColor="bg-indigo-700" />
          {renderMoyensSection(canevasData.moyensCombined, true)}

          {/* TOTAL GÉNÉRAL */}
          <tr className="bg-indigo-900 text-white font-bold transition-colors duration-100">
            <td className="border border-gray-300 px-2 py-1.5 text-left text-xs font-bold whitespace-nowrap sticky left-0 z-10 bg-indigo-900 text-white">
              TOTAL(1+2)(PUBLIC)+(PRIVÉ)
            </td>
            {MOYENS_COLUMNS.map((col) => (
              <td
                key={col.key}
                className="border border-gray-300 px-1 py-1 text-center font-mono text-xs whitespace-nowrap font-bold"
              >
                {col.key === "ageMoyen" || col.key === "pourcentage"
                  ? (canevasData.moyensCombined.sousTotal[col.key] === 0 ? "0" : canevasData.moyensCombined.sousTotal[col.key].toFixed(2))
                  : (canevasData.moyensCombined.sousTotal[col.key] === 0 ? "0" : canevasData.moyensCombined.sousTotal[col.key].toLocaleString("fr-FR"))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CanevasMoyensTable;
