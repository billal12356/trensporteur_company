import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  AgeBreakdown,
  AgeField,
  AgeSection,
} from "../types/canevas-types";

// ============================
// Colonnes du tableau d'âge
// ============================
const AGE_COLUMNS: { key: AgeField; label: string; sublabel?: string }[] = [
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
  { key: "parcVehiculesReel", label: "Parc Véhicules", sublabel: "(réel)" },
  { key: "placesOffertes", label: "Places", sublabel: "offertes" },
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

ReadOnlyCell.displayName = "ReadOnlyAgeCell";

// ============================
// Composant Ligne Read-Only
// ============================
interface DataRowProps {
  label: string;
  data: AgeBreakdown;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isCombined?: boolean;
  indent?: boolean;
}

const AgeDataRow: React.FC<DataRowProps> = React.memo(
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
        {AGE_COLUMNS.map((col) => (
          <ReadOnlyCell
            key={col.key}
            value={data[col.key]}
            isBold={isSubtotal || isTotal}
            isDecimal={col.key === "ageMoyen" || col.key === "pourcentage"}
          />
        ))}
      </tr>
    );
  }
);

AgeDataRow.displayName = "AgeDataRow";

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
      colSpan={AGE_COLUMNS.length + 1}
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
      colSpan={AGE_COLUMNS.length + 1}
      className={`${bgColor} text-gray-900 font-semibold text-xs px-3 py-1.5 text-left border border-gray-300 italic sticky left-0 z-10`}
    >
      {title}
    </td>
  </tr>
);

// ============================
// Render Sections
// ============================
const renderAgeSection = (sectionData: AgeSection, isCombined = false) => {
  const tpv = sectionData.transportPublicVoyageurs;
  const tr = sectionData.transport;
  const subHeaderBg = isCombined ? "bg-indigo-200" : "bg-blue-200";

  return (
    <>
      <SubSectionHeader title="TRANSPORT PUBLIC DE VOYAGEURS" bgColor={subHeaderBg} />
      <AgeDataRow label="Inter-wilaya" data={tpv.interWilaya} isCombined={isCombined} indent />
      <AgeDataRow label="Inter-communale" data={tpv.interCommunale} isCombined={isCombined} indent />
      <AgeDataRow label="RURAL" data={tpv.rural} isCombined={isCombined} indent />
      <AgeDataRow label="URBAIN" data={tpv.urbain} isCombined={isCombined} indent />
      <AgeDataRow
        label={isCombined ? "S/TOTAL(1+2) (PUBLIC)+(PRIVÉ)" : "S/TOTAL"}
        data={tpv.sousTotal}
        isSubtotal
        isCombined={isCombined}
      />

      <SubSectionHeader title="TRANSPORT" bgColor={subHeaderBg} />
      <AgeDataRow label="universitaire" data={tr.universitaire} isCombined={isCombined} indent />
      <AgeDataRow label="scolaire" data={tr.scolaire} isCombined={isCombined} indent />
      <AgeDataRow label="personnel" data={tr.personnel} isCombined={isCombined} indent />
      <AgeDataRow
        label={isCombined ? "S/TOTAL (1+2) (PUBLIC)+(PRIVÉ)" : "S/TOTAL"}
        data={tr.sousTotal}
        isSubtotal
        isCombined={isCombined}
      />
    </>
  );
};

// ============================
// COMPOSANT PRINCIPAL: CanevasAgeTable
// ============================
const CanevasAgeTable: React.FC = () => {
  const { data: canevasData } = useSelector(
    (state: RootState) => state.canevas
  );

  if (!canevasData || !canevasData.ageStatutPublic) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-xl border border-gray-200 mt-8">
      {/* Titre du tableau */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3">
        <h2 className="text-white font-bold text-sm text-center">
          Répartition du « Parc véhicules de transport de voyageurs » par tranches d'âges :
        </h2>
      </div>

      <table className="w-full border-collapse text-sm min-w-[1400px]">
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
            <th className="border border-gray-300 bg-blue-500 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              <div>Parc Véhicules</div><div className="text-[10px] font-normal">(réel)</div>
            </th>
            <th className="border border-gray-300 bg-blue-500 text-white px-2 py-2 text-center text-xs font-bold" rowSpan={2}>
              <div>Places</div><div className="text-[10px] font-normal">offertes</div>
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
          {renderAgeSection(canevasData.ageStatutPublic)}
          <AgeDataRow label="TOTAL 01 (STATUT PUBLIC)" data={canevasData.ageStatutPublic.total} isTotal />

          {/* ───── SECTION 2: STATUT PRIVÉ ───── */}
          <SectionHeader title="2. STATUT PRIVÉ" bgColor="bg-blue-500" />
          {renderAgeSection(canevasData.ageStatutPrive)}
          <AgeDataRow label="TOTAL 02 (STATUT PRIVÉ)" data={canevasData.ageStatutPrive.total} isTotal />

          {/* ───── SECTION 3: COMBINÉ (PUBLIC + PRIVÉ) ───── */}
          <SectionHeader title="3. TRANSPORT ROUTIER DE VOYAGEURS (STATUT PUBLIC) + (STATUT PRIVÉ)" bgColor="bg-indigo-700" />
          {renderAgeSection(canevasData.ageCombined, true)}
          <AgeDataRow
            label="TOTAL GÉNÉRAL (1+2) (PUBLIC)+(PRIVÉ)"
            data={canevasData.ageCombined.total}
            isTotal
            isCombined
          />
        </tbody>
      </table>
    </div>
  );
};

export default CanevasAgeTable;
