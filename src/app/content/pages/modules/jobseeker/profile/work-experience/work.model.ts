export interface WorkExperienceModel {
    id?: number;
    jobCategory?: string;
    jobTitle?: string;
    organization?: string;
    address?: string;
    experienceLevel?: string;
    noticePeriod?: string;
    from?: Date;
    to?: Date;
    isWorking?: boolean;
    summary?: string;
    refPersonName?: string;
    refPersonPhone?: string;
}
