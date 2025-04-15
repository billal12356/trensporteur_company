export interface Operateur  {
  _id: string,
  num_wilaya: number,
  num_docier_client: number,
  fullName_arabe: string,
  fullName_francais: string,
  date_expiration: string,
  date_prévue: string,
  num_dhoraire: number,
  num_cate_enregistement: number,
  activite: string,
  colonne1?: string,
  nature_activite: string,
  colonne2?: string,
  status_activite: string,
  colonne3?: string,
  type_client: string,
  colonne4?: string,
  institution_person_moral?: string,
  fullName_gerent_person_moral?: string,
  num_dacte_naissance: number,
  num_didentification_national_NIN: number,
  date_naissance: string,
  lieu_naissance_arabe: string,
  lieu_naissance_francais: string,
  nom_pere_arabe: string,
  nom_pere_francais: string,
  fullName_mere_arabe: string,
  fullName_mere_francais: string,
  communes_naissance_arabe: string,
  communes_naissance_francais: string,
  address_arabe: string,
  address_francais: string,
  address_municipalité_arabe: string,
  address_municipalité_francais: string,
  num_registre_commerce: number,
  num_registre_commerce_n5: number,
  hestoire_registre_commerce: string,
  modifier_hestoire_registre_commerce: string,
  date_debut_activite: string,
  num_adherent_caise_national_non_salaire?: number,
  depend_activite?: string,
  type_depend?: string,
  date_arret_activite_temporaire: string,
  date_arret_activite_permanent: string,
  num_telephone_client?: string,
  soccupe?: string,
  note_chef_departement?: string,
}

export interface Vihicles {
  _id: string;

  num_wilaya: number;

  num_docier_client: number;

  fullName_arabe: string;

  fullName_francais: string;

  activite: string;

  colonne1?: string;

  nature_activite: string;

  colonne2?: string;

  status_activite: string;

  colonne3?: string;

  num_bus_registration: number;

  circle?: string;

  Municipality?: string;

  Style?: string;

  category: string;

  type: string;

  First_year_of_use: string;

  Number_of_seats: number;

  Energy: string;

  num_driving_license: number;

  driving_license_history: string;

  driving_license_dure: string;

  line_activity_start_date: string;

  Vehicle_activity_start_date: string;

  font_type: string;

  colonne4: string;

  font_symbol: string;

  point_depart: string;

  point_arrive: string;

  point_Traffic1: string;

  point_Traffic2: string;

  point_Traffic3: string;

  point_Traffic4: string;

  point_Traffic5: string;

  line_start_time?: string;

  line_end_time?: string;

  Pace_per_minute?: string;

  time_depart1: string;

  time_depart2: string;

  time_depart3?: string;
  
  time_depart4?: string;

  vihicile_parked?: string;

  type_parked :string;

  hestoire_parked:string;

  hestoire_parked_end:string;

  comments:string;

  person_concerned:string;

  note_chef_departement?: string;

  path:string
}