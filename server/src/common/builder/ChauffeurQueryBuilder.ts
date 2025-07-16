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
    if (search) {
      const orConditions: any[] = [
        { nom_prenom_chauffeur: new RegExp(search, 'i') },
        { operateur: new RegExp(search, 'i') },
        { num_vehicule: new RegExp(search, 'i') },
        { nature_ligne: new RegExp(search, 'i') },
        { nature_utilisateur: new RegExp(search, 'i') },
        { municipalite_emettrice: new RegExp(search, 'i') },
        { wilaya: new RegExp(search, 'i') },
        { num_permis_conduire: new RegExp(search, 'i') },
        { lieu_naissance: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
      ];

      if (!isNaN(Number(search))) {
        orConditions.push({ num_chauffeur: Number(search) });
        orConditions.push({ num_enregistrement_du_transporteur: Number(search) });
        orConditions.push({ num_didentification_national_NIN: Number(search) });
        orConditions.push({ Num_certificat_compétence_professionnelle: Number(search) });
        orConditions.push({ num_serie: Number(search) });
        orConditions.push({ num_membre_fonds_national: Number(search) });
      }

      this.query.$or = orConditions;
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
