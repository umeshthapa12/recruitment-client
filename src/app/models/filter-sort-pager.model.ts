/**
 * Filter conditions.
 * @link refer to this link to see  http://localhost:4000/Shared/api/v2.0/Dropdowns/GetFilterConditions
 */
export enum FilterCondition {
    /**
     * Value is null or empty
     */
    empty = 'empty',
    /**
     * Vvalue is not null or empty
     */
    NotEmpty = 'notEmpty',
    /**
     * Value contains the char
     */
    Contains = 'contains',
    /**
     * Value does not contains the char
     */
    NotContains = 'notContains',
    /**
     * Value is equal to char
     */
    Equal = 'eq',
    /**
     * Value is not equal to char
     */
    NotEqual = 'notEq',
    /**
     * Value is start with serach term
     */
    StartWith = 'startWith',
    /**
     * Value is ends with search term char
     */
    EndsWith = 'endsWith',
    /**
     * Value is greater than search term char
     */
    GreaterThan = 'gt',
    /**
    * Value is greater than or equal to search term char
    */
    GreaterThanEqual = 'gtEq',
    /**
    * Value is less than search term char
    */
    LessThan = 'lt',
    /**
    * Value is less than or equal to search term char
    */
    LessThanEqual = 'ltEq',
    /**
    * Value is in between to search term char
    */
    Between = 'bt',
    /**
    * Value is as same as value that are selected
    */
    SelectedOnly = 'in'
}
export interface MultiOrder {
    column: string;
    direction: string;
}
export interface AdvFilterModel {
	categories?: any[];
	education?: any[];
	experienceLevel?: any[];
	industries?: any[];
	jobType?: any[];
	location?: any[];
}
/**
 * Filters
 */
export interface Filter {
    /**
     * Name of the field
     */
    column?: string;

    /**
     * Condition to compare
     */
    condition?: string;

    /**
     * Primary comparar value
     */
    firstValue?: string;

    /**
     * Secondary comparar value
     */
    secondValue?: string;

    /**
     * Keyword of sql. e.g. `and`, `or` etc.,
     */
    keyword?: string;
}

/**
 * Paginator
 */
export interface Paginator {

    /**
     * Current page index
     */
    pageIndex?: number;

    /**
     * Item per page
     */
    pageSize?: number;
}

/**
 * Sort order
 */
export interface SortOrder {
    /**
     * Name of the field to get sorted
     */
    orderBy?: string;

    /**
     * Ordering direction ASC | DESC
     */
    orderDirection?: string;
}

/**
 * Request query
 */
export interface QueryModel {

    /**
     * Filter collection
     */
    filters?: Filter[];

    /**
     * Paging
     */
    paginator?: Paginator;

    /**
     * Sorting
     */
    sort?: MultiOrder[];

    /**
     * Extra custom query params. ```a=one&b=two```
     */
    extraParams?: string;

    /**
     * Whether to observe query params to the angular route.
     */
    observeQueryParams?: boolean;
}

