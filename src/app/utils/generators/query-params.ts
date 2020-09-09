import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryModel } from '../../models/filter-sort-pager.model';

/**
 * Query parameter generator
 */
@Injectable({ providedIn: 'root' })
export class ParamGenService {

    private _hasFilter: boolean;

    /**
     * whether the url tree has query params to filter
     */
    private set filterExist(yes: boolean) {
        this._hasFilter = yes;
    }

    /**
     * whether the url tree has query params to filter
     */
    public get hasFilter() {
        return this._hasFilter;
    }

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {

        this.route.queryParams.subscribe(_ => {
            const q = this.route.snapshot.queryParams;

            this.filterExist = Object.keys(q).some(key => key.startsWith('ob') || key.startsWith('fi'));
        });

    }

    /**
     * Creates query parameters and adds to the url tree.
     * User might reload their page so we parse params to filter data
     * @param params An object of type ```QueryModel```
     */
    createParams(params: QueryModel): HttpParams {
        let obj: any = { ...params.sort, ...params.paginator };

        // we might have to use param history to filter if user reloads the page
        const queryFromUrl = this.route.snapshot.queryParams;

        // we might have list of filter data.
        // transform list to query params
        if (params && params.filters)
            params.filters.forEach((f, i) => {
                Object.keys(f).forEach((key) => {

                    if (!(f[key])) return;
                    // make query key shorter
                    const q = key === 'column' ? 'col'
                        : key === 'condition' ? 'exp'
                            : key === 'keyword' ? 'kw'
                                : key === 'firstValue' ? 'val1'
                                    : key === 'secondValue' ? 'val2'
                                        : key;

                    // add transformed property
                    obj[`fi[${i}].${q}`] = f[key];
                });
            });

        // we do not serve sort order on initial load or there is no sort direction applied by user. url tree is ignored
        if (!(params.sort && params.sort.length > 0)) {
            obj = { ...queryFromUrl, ...obj };
            delete obj.orderBy;
            delete obj.orderDirection;
            // cleanup order by object params.
            Object.keys(obj).filter(k => k.startsWith('ob')).forEach(key => delete obj[key]);
        }

        // create query params
        const p = new HttpParams({ fromObject: obj });

        // also set to url. User might have refreshed their page so the filters must remain same
        if (params.observeQueryParams)
            this.router.navigate([], { queryParams: obj, relativeTo: this.route });

        return p;
    }

    // clear query params from url
    clearParams() {

        this.filterExist = false;
        this.router.navigate([], { queryParams: null, relativeTo: this.route });

    }
}
