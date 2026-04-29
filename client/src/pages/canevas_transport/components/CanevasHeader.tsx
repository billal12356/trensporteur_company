import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setWilaya, setAnnee, setTrimestre } from "@/redux/slice/canevasSlice";

/** Liste des 58 wilayas d'Algérie */
const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
  "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
  "M'sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi",
  "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla",
  "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun",
  "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah",
  "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
];

const CanevasHeader: React.FC = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.canevas.data);

  const wilaya = data?.wilaya || "";
  const annee = data?.annee || new Date().getFullYear().toString();
  const trimestre = data?.trimestre || "1";

  return (
    <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 rounded-xl p-6 shadow-lg mb-6">
      {/* Titre principal */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Canevas n°01: TRANSPORT ROUTIER DE VOYAGEURS
        </h1>
        <p className="text-blue-200 text-sm mt-1">
          Direction des Transports — Parc Circulant
        </p>
      </div>

      {/* Champs du formulaire */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WILAYA */}
        <div className="flex flex-col">
          <label className="text-blue-100 text-sm font-semibold mb-1.5 uppercase tracking-wider">
            Wilaya de
          </label>
          <select
            id="canevas-wilaya-select"
            value={wilaya}
            onChange={(e) => dispatch(setWilaya(e.target.value))}
            className="bg-white/10 backdrop-blur text-white border border-blue-400/40 rounded-lg px-3 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
              appearance-none cursor-pointer"
          >
            <option value="" className="text-gray-800">
              — Sélectionner —
            </option>
            {WILAYAS.map((w, idx) => (
              <option key={idx} value={w} className="text-gray-800">
                {String(idx + 1).padStart(2, "0")} - {w}
              </option>
            ))}
          </select>
        </div>

        {/* ANNÉE */}
        <div className="flex flex-col">
          <label className="text-blue-100 text-sm font-semibold mb-1.5 uppercase tracking-wider">
            Année
          </label>
          <select
            id="canevas-annee-select"
            value={annee}
            onChange={(e) => dispatch(setAnnee(e.target.value))}
            className="bg-white/10 backdrop-blur text-white border border-blue-400/40 rounded-lg px-3 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
              appearance-none cursor-pointer"
          >
            {Array.from({ length: 6 }, (_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return (
                <option key={y} value={String(y)} className="text-gray-800">
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        {/* TRIMESTRE */}
        <div className="flex flex-col">
          <label className="text-blue-100 text-sm font-semibold mb-1.5 uppercase tracking-wider">
            Trimestre
          </label>
          <select
            id="canevas-trimestre-select"
            value={trimestre}
            onChange={(e) => dispatch(setTrimestre(e.target.value))}
            className="bg-white/10 backdrop-blur text-white border border-blue-400/40 rounded-lg px-3 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
              appearance-none cursor-pointer"
          >
            <option value="1" className="text-gray-800">1er Trimestre</option>
            <option value="2" className="text-gray-800">2ème Trimestre</option>
            <option value="3" className="text-gray-800">3ème Trimestre</option>
            <option value="4" className="text-gray-800">4ème Trimestre</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CanevasHeader;
