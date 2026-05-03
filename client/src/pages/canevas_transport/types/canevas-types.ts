// ======================================================
// Canevas n°01: TRANSPORT ROUTIER DE VOYAGEURS
// Types & Interfaces
// ======================================================

/** Répartition des véhicules par catégorie (une ligne du tableau) */
export interface VehicleBreakdown {
  autocar: number;          // 35 places et plus
  minicar: number;          // 24 - 34 places
  autobus: number;          // 70 places et plus
  minibus: number;          // 40 - 69 places
  autresVehicules: number;  // 15 - 23 places
  camionAmenage: number;    // Camion Aménagé
  total: number;            // TOTAL véhicules
  placesOffertes: number;   // Places offertes
  nombreOperateurs: number; // Nombre d'opérateurs
  pourcentage: number;      // %
  nombreChauffeurs: number; // Nombre de Chauffeurs
  voyageursJour: number;    // Nombre de Voyageurs / Jour
  voyageursMois: number;    // Nombre de Voyageurs / Mois
  nombreOperateursReel: number; // Nombre d'opérateurs (réel)
}

/** Clé des champs numériques dans VehicleBreakdown */
export type VehicleField = keyof VehicleBreakdown;

/** Répartition par tranches d'âges (une ligne du tableau d'âge) */
export interface AgeBreakdown {
  moins5: number;           // < 5 ans
  de5a10: number;           // [5, 10[
  de10a15: number;          // [10, 15[
  de15a20: number;          // [15, 20[
  de20a25: number;          // [20, 25[
  de25a30: number;          // [25, 30[
  plus30: number;           // 30 ans et plus
  total: number;            // TOTAL
  ageMoyen: number;         // Âge moyen (ans)
  pourcentage: number;      // %
  parcVehiculesReel: number; // Parc Véhicules (réel)
  placesOffertes: number;   // Places offertes
}

/** Clé des champs numériques dans AgeBreakdown */
export type AgeField = keyof AgeBreakdown;

/** Section d'âge (même structure que TransportSection) */
export interface AgeSection {
  transportPublicVoyageurs: {
    interWilaya: AgeBreakdown;
    interCommunale: AgeBreakdown;
    rural: AgeBreakdown;
    urbain: AgeBreakdown;
    sousTotal: AgeBreakdown;
  };
  transport: {
    universitaire: AgeBreakdown;
    scolaire: AgeBreakdown;
    personnel: AgeBreakdown;
    sousTotal: AgeBreakdown;
  };
  total: AgeBreakdown;
}

/** Répartition par catégorie véhicule × tranches d'âges (LES MOYENS) */
export interface MoyensAgeBreakdown {
  moins5: number;           // < 5 ans
  de5a10: number;           // [5, 10[
  de10a15: number;          // [10, 15[
  de15a20: number;          // [15, 20[
  de20a25: number;          // [20, 25[
  de25a30: number;          // [25, 30[
  plus30: number;           // 30 ans et plus
  total: number;            // TOTAL
  ageMoyen: number;         // Âge moyen (ans)
  pourcentage: number;      // %
}

/** Clé des champs numériques dans MoyensAgeBreakdown */
export type MoyensAgeField = keyof MoyensAgeBreakdown;

/** Section LES MOYENS (par catégorie de véhicule) */
export interface MoyensSection {
  autocar: MoyensAgeBreakdown;
  minicar: MoyensAgeBreakdown;
  autobus: MoyensAgeBreakdown;
  minibus: MoyensAgeBreakdown;
  autresVehicules: MoyensAgeBreakdown;
  camionAmenage: MoyensAgeBreakdown;
  sousTotal: MoyensAgeBreakdown;
}

/** Structure d'une section (Public ou Privé) */
export interface TransportSection {
  transportPublicVoyageurs: {
    interWilaya: VehicleBreakdown;
    interCommunale: VehicleBreakdown;
    rural: VehicleBreakdown;
    urbain: VehicleBreakdown;
    sousTotal: VehicleBreakdown;
  };
  transport: {
    universitaire: VehicleBreakdown;
    scolaire: VehicleBreakdown;
    personnel: VehicleBreakdown;
    sousTotal: VehicleBreakdown;
  };
  total: VehicleBreakdown;
}

/** Données complètes du Canevas (retournées par le serveur) */
export interface CanevasData {
  wilaya: string;
  annee: string;
  trimestre: string;
  statutPublic: TransportSection;
  statutPrive: TransportSection;
  combined: TransportSection;
  ageStatutPublic: AgeSection;
  ageStatutPrive: AgeSection;
  ageCombined: AgeSection;
  moyensStatutPublic: MoyensSection;
  moyensStatutPrive: MoyensSection;
  moyensCombined: MoyensSection;
}

/** État Redux du Canevas */
export interface CanevasState {
  data: CanevasData | null;
  wilaya: string;
  annee: string;
  trimestre: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}
