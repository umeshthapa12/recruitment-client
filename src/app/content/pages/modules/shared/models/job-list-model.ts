export interface JobListModel {
    id: number;
    jobTitle: string;
    company: {
        key: number,
        value: string,
        location: string,
        companyLogoUrl: string,
        companyWebsite: string,
        about: string;
        benefits: string;
        applyProcedure: string;
    };
    jobTypesDto: string[];
    jobLikedTimes: string;
    visitCounts: number;
    salary: string;
    workExperience: string;
    skill: string[];
    noOfOpenings: number;
    jobLocation: string;
    experienceLevel: string;
    category: string;
    jobDescription: string;
    jobSpecificationRequirements: string;
    preferred: string;
    createdOn?: Date;
    postedOn?: Date;
    validUntil: Date;
    expiresOn?: Date;
    applicantsCount?: number;

}
