export class ChauffeurQueryBuilder {
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
    const trimmedSearch = search?.trim?.();

    if (!trimmedSearch || trimmedSearch.length === 0) {
      this.query = {};
      return this;
    }

    const orConditions: any[] = [];
    // escape user input for safe regex
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegex(trimmedSearch), 'i');

    // String fields (partial, case-insensitive match)
    const stringFields = [
      'nom_prenom_chauffeur',
      'operateur',
      'ligne_exploitée',
      'num_vehicule',
      'nature_ligne',
      'nature_utilisateur',
      'municipalite_emettrice',
      'wilaya',
      'num_permis_conduire',
      'lieu_naissance',
      'address',
      'vihicile_parked',
      'type_parked',
      'comments',
    ];

    stringFields.forEach((field) => {
      orConditions.push({ [field]: regex });
    });

    // Numeric fields (exact match when input is numeric)
    const numericFields = [
      'num_chauffeur',
      'num_demende',
      'num_enregistrement_du_transporteur',
      'num_didentification_national_NIN',
      'Num_certificat_compétence_professionnelle',
      'num_serie',
      'num_membre_fonds_national',
    ];

    if (!isNaN(Number(trimmedSearch))) {
      const numValue = Number(trimmedSearch);
      numericFields.forEach((field) => orConditions.push({ [field]: numValue }));
    }

    // Date fields: if the input parses as a valid date, match documents where
    // the date falls within that day (00:00:00.000 .. 23:59:59.999)
    const dateFields = [
      'hestoire_demende',
      'date_sortie',
      'date_expiration_article',
      'date_naissance',
      'date_obtention_certificat_aptitude_professionnelle',
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

    const parsedDate = parseFlexibleDate(trimmedSearch);
    if (parsedDate) {
      const start = new Date(parsedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(parsedDate);
      end.setHours(23, 59, 59, 999);
      dateFields.forEach((field) => orConditions.push({ [field]: { $gte: start, $lt: end } }));
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
