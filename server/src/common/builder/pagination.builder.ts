export class UserQueryBuilder {
    private query: any = {};
    private limit: number = 10;
    private skip: number = 0;
    private sort: 'asc' | 'desc' = 'asc';

    setLimit(limit: number): UserQueryBuilder {
        if (!Number.isNaN(Number(limit)) && limit > 0) {
            this.limit = limit;
        }
        return this;
    }

    setSkip(page: number): UserQueryBuilder {
        const pageNumber = Number(page);
        if (!Number.isNaN(pageNumber) && pageNumber > 0) {
            this.skip = (pageNumber - 1) * this.limit; // Correct formula for pagination
        } else {
            this.skip = 0;
        }
        return this;
    }


    setSort(sort: 'asc' | 'desc'): UserQueryBuilder {
        if (['asc', 'desc'].includes(sort)) {
            this.sort = sort;
        }
        return this;
    }

    setFullNameArabe(fullName_arabe?: string): UserQueryBuilder {
        if (fullName_arabe) {
            this.query.fullName_arabe = new RegExp(fullName_arabe, 'i');
        }
        return this;
    }

    setFullNameFrancais(fullName_francais?: string): UserQueryBuilder {
        if (fullName_francais) {
            this.query.fullName_francais = new RegExp(fullName_francais, 'i');
        }
        return this;
    }

    setSearch(search?: string): UserQueryBuilder {
        if (search) {
            this.query.$or = [
                { fullName_arabe: new RegExp(search, 'i') },
                { fullName_francais: new RegExp(search, 'i') },
                { activite: new RegExp(search, 'i') },
            ];
        }
        return this;
    }

    build() {
        return {
            query: this.query,
            limit: this.limit,
            skip: this.skip,
            sort: { createdAt: this.sort }, // Use a single field for stable sorting
        };
    }
    
}
