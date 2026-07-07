export class OperateurQueryBuilder {
  private query: any = {};
  private limit = 10;
  private skip = 0;
  private sort: 'asc' | 'desc' = 'desc';

  setLimit(limit: number): this {
    if (!Number.isNaN(limit) && limit > 0) this.limit = limit;
    return this;
  }

  setSkip(page: number): this {
    this.skip = (page > 0 ? page - 1 : 0) * this.limit;
    return this;
  }

  setSort(sort: 'asc' | 'desc'): this {
    this.sort = sort;
    return this;
  }

  setSearch(search?: string): this {
    const trimmed = search?.toString().trim?.();

    if (!trimmed || trimmed.length === 0) {
      this.query = {};
      return this;
    }

    const orConditions: any[] = [];
    // escape user input for safe regex (case-insensitive)
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegex(trimmed), 'i');

    // String/text fields (partial, case-insensitive)
    const stringFields = [
      'fullName_arabe',
      'fullName_francais',
      'activite',
      'colonne1',
      'nature_activite',
      'colonne2',
      'status_activite',
      'colonne3',
      'type_client',
      'colonne4',
      'institution_person_moral',
      'fullName_gerent_person_moral',
      'lieu_naissance_arabe',
      'lieu_naissance_francais',
      'nom_pere_arabe',
      'nom_pere_francais',
      'fullName_mere_arabe',
      'fullName_mere_francais',
      'communes_naissance_arabe',
      'communes_naissance_francais',
      'address_arabe',
      'address_francais',
      'address_municipalité_arabe',
      'address_municipalité_francais',
      'num_registre_commerce',
      'num_registre_commerce_n5',
      'num_telephone_client',
      'soccuppe',
      'note_chef_departement',
      'depend_activite',
      'type_depend',
    ];

    stringFields.forEach((f) => orConditions.push({ [f]: regex }));

    // Numeric fields (exact match when input is numeric)
    const numericFields = [
      'num_wilaya',
      'num_docier_client',
      'num_dhoraire',
      'num_cate_enregistement',
      'num_dacte_naissance',
      'num_didentification_national_NIN',
      'num_adherent_caise_national_non_salaire',
    ];

    if (!isNaN(Number(trimmed))) {
      const num = Number(trimmed);
      numericFields.forEach((f) => orConditions.push({ [f]: num }));
    }

    // Date fields: match documents where the date falls within the parsed day
    const dateFields = [
      'date_expiration',
      'date_prévue',
      'hestoire_registre_commerce',
      'modifier_hestoire_registre_commerce',
      'date_debut_activite',
      'date_arret_activite_temporaire',
      'date_arret_activite_permanent',
      'date_naissance',
    ];

    // flexible date parsing: accept ISO or dd/mm/yyyy | dd-mm-yyyy | dd.mm.yyyy
    const parseFlexibleDate = (s: string): Date | null => {
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
      const m = s.match(/^\s*(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\s*$/);
      if (m) {
        let day = parseInt(m[1], 10);
        let month = parseInt(m[2], 10);
        let year = parseInt(m[3], 10);
        if (year < 100) year += year >= 50 ? 1900 : 2000;
        return new Date(year, month - 1, day);
      }
      return null;
    };

    const parsed = parseFlexibleDate(trimmed);
    if (parsed) {
      const start = new Date(parsed);
      start.setHours(0, 0, 0, 0);
      const end = new Date(parsed);
      end.setHours(23, 59, 59, 999);
      dateFields.forEach((f) => orConditions.push({ [f]: { $gte: start, $lt: end } }));
    }

    this.query.$or = orConditions;
    return this;
  }

  build() {
    return {
      query: this.query,
      limit: this.limit,
      skip: this.skip,
      sort: { createdAt: this.sort },
    };
  }
}
