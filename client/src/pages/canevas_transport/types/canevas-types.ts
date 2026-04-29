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
  combined: TransportSection; // (Statut Public) + (Statut Privé) — calculé côté serveur
}

/** État Redux du Canevas */
export interface CanevasState {
  data: CanevasData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}
