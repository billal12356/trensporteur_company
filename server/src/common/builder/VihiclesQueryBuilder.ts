export class VihiclesQueryBuilder {
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
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegex(trimmed), 'i');

    // String fields (partial, case-insensitive)
    const stringFields = [
      'fullName_arabe',
      'fullName_francais',
      'activite',
      'colonne1',
      'nature_activite',
      'colonne2',
      'status_activite',
      'colonne3',
      'num_bus_registration',
      'circle',
      'Municipality',
      'Style',
      'category',
      'type',
      'font_type',
      'colonne4',
      'font_symbol',
      'point_depart',
      'point_arrive',
      'point_Traffic1',
      'point_Traffic2',
      'point_Traffic3',
      'point_Traffic4',
      'point_Traffic5',
      'line_start_time',
      'line_end_time',
      'Pace_per_minute',
      'time_depart1',
      'time_depart2',
      'time_depart3',
      'time_depart4',
      'vihicile_parked',
      'type_parked',
      'comments',
      'person_concerned',
      'note_chef_departement',
      'path',
    ];

    stringFields.forEach((f) => orConditions.push({ [f]: regex }));

    // Numeric fields (exact match when input is numeric)
    const numericFields = [
      'num_wilaya',
      'num_docier_client',
      'First_year_of_use',
      'total_load_trucks',
      'restricted_load',
      'Number_of_seats',
      'num_driving_license',
      'num_up',
    ];

    if (!isNaN(Number(trimmed))) {
      const num = Number(trimmed);
      numericFields.forEach((f) => orConditions.push({ [f]: num }));
    }

    // Date fields: match documents where the date falls within the parsed day
    const dateFields = [
      'driving_license_history',
      'line_activity_start_date',
      'Vehicle_activity_start_date',
      'hestoire_parked',
      'hestoire_parked_end',
    ];

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
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
