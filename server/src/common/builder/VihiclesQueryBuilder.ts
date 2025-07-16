export class VihiclesQueryBuilder {
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
        { num_bus_registration: new RegExp(search, 'i') },
        { circle: new RegExp(search, 'i') },
        { Municipality: new RegExp(search, 'i') },
        { Style: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { type: new RegExp(search, 'i') },
        { font_symbol: new RegExp(search, 'i') },
        { point_depart: new RegExp(search, 'i') },
        { point_arrive: new RegExp(search, 'i') },
      ];

      if (!isNaN(Number(search))) {
        orConditions.push({ num_wilaya: Number(search) });
        orConditions.push({ num_docier_client: Number(search) });
        orConditions.push({ First_year_of_use: Number(search) });
        orConditions.push({ num_driving_license: Number(search) });
        orConditions.push({ Number_of_seats: Number(search) });
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
