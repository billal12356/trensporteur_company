export class OperateurQueryBuilder {
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
        { fullName_arabe: new RegExp(search, 'i') },
        { fullName_francais: new RegExp(search, 'i') },
        { activite: new RegExp(search, 'i') },
        { nature_activite: new RegExp(search, 'i') },
        { status_activite: new RegExp(search, 'i') },
        { type_client: new RegExp(search, 'i') },
        { address_arabe: new RegExp(search, 'i') },
        { address_francais: new RegExp(search, 'i') },
        { nom_pere_arabe: new RegExp(search, 'i') },
        { nom_pere_francais: new RegExp(search, 'i') },
        { fullName_mere_arabe: new RegExp(search, 'i') },
        { fullName_mere_francais: new RegExp(search, 'i') },
        { num_registre_commerce: new RegExp(search, 'i') },
      ];

      if (!isNaN(Number(search))) {
        orConditions.push({ num_docier_client: Number(search) });
        orConditions.push({ num_wilaya: Number(search) });
        orConditions.push({ num_dacte_naissance: Number(search) });
        orConditions.push({ num_didentification_national_NIN: Number(search) });
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
