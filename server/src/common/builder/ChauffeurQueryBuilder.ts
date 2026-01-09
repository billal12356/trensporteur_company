export class ChauffeurQueryBuilder {
  private query: any = {};
  private limit = 10;
  private skip = 0;
  private sort: 'asc' | 'desc' = 'asc';

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
    // Trim and validate search input
    const trimmedSearch = search?.trim?.();
    
    // Only apply search if we have a non-empty string
    if (trimmedSearch && trimmedSearch.length > 0) {
      const orConditions: any[] = [
        // Text fields with regex for partial matching
        { nom_prenom_chauffeur: new RegExp(trimmedSearch, 'i') },
        { operateur: new RegExp(trimmedSearch, 'i') },
        { num_vehicule: new RegExp(trimmedSearch, 'i') },
        { nature_ligne: new RegExp(trimmedSearch, 'i') },
        { nature_utilisateur: new RegExp(trimmedSearch, 'i') },
        { municipalite_emettrice: new RegExp(trimmedSearch, 'i') },
        { wilaya: new RegExp(trimmedSearch, 'i') },
        { num_permis_conduire: new RegExp(trimmedSearch, 'i') },
        { lieu_naissance: new RegExp(trimmedSearch, 'i') },
        { address: new RegExp(trimmedSearch, 'i') },
      ];

      // Add numeric conditions only if search is numeric (for exact matching)
      if (!isNaN(Number(trimmedSearch))) {
        const numValue = Number(trimmedSearch);
        orConditions.push({ num_chauffeur: numValue });
        orConditions.push({ num_enregistrement_du_transporteur: numValue });
        orConditions.push({ num_didentification_national_NIN: numValue });
        orConditions.push({ Num_certificat_compétence_professionnelle: numValue });
        orConditions.push({ num_serie: numValue });
        orConditions.push({ num_membre_fonds_national: numValue });
      }

      this.query.$or = orConditions;
    } else {
      // If no search provided, query remains empty (returns all records)
      this.query = {};
    }
    
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
