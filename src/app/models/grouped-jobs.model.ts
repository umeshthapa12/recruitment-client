export interface GroupedJobsModel {
    employerId?: number;
    companyName?: string;
    companyAddress?: string;
    companyLogoUrl?: string;
    companyWebsiteUrl?: string;
    totalOpenings?: number;
    openings?: OpeningTitles[];
}
export interface OpeningTitles {
    id?: number;
    jobTitle?: string;
    companyName?: string;
    companyLogoUrl?: string;
}

export enum JobTypeRouteEnums {
    AJ = 'all-jobs',
    FT = 'full-time',
    PT = 'part-time',
    CT = 'contract',
    INT = 'internship',
    RT = 'remote',
}
