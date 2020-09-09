import { ControlBase } from './dynamic-form/control-base';

export interface OpeningModel {
    sn?: number;
    id?: number;
    openingId?: number;
    regGuid?: string;
    employerId?: number;
    likeCounts?: number;
    visitCounts?: number;
    companyName?: string;
    companyAddress?: string;
    companyLogoUrl?: string;
    companyEmail?: string;
    aboutCompany?: string;
    jobTitle?: string;
    salary?: string;
    experienceLevel?: string[];
    skillKeywords?: string[];
    jobLocation?: string[];
    qualification?: { key?: string, value?: string }[];
    companyUrl?: string;
    jobCategory?: string;
    jobDescription?: string;
    jobSpecification?: string;
    preferred?: string;
    benefits?: string;
    noOfOpenings?: number;
    minAge?: number;
    maxAge?: number;
    maritalStatus?: string;
    applyProcedure?: string;
    defaultExperience?: string;
    status?: string;
    selectedId?: number[];
}

export interface OpeningModel {
    sn?: number;
    id?: number;
    regGuid?: string;
    jobCategoryId?: number;
    jobCategory?: string;
    jobTitle?: string;
    jobDescription?: string;
    jobSpecification?: string;
    preferred?: string;
    benefits?: string;
    salary?: string;
    gender?: string;
    noOfOpenings?: number;
    estimated?: number;
    minAge?: number;
    maxAge?: number;
    maritalStatus?: string;
    publishedOn?: any;
    scheduledPublishDate?: any;
    expiresOn?: any;
    jobTypes?: JobTypeModel[];
    jobLocations?: JobLocationModel[];
    qualifications?: QualificationModel[];
    mandatory?: MandatoryModel[];
    experienceLevel?: string[];
    status?: string;
    openingServiceType?: string;
    applyProcedure?: string;
    skillKeywords?: string[];

    // extra
    selectedId?: number[];

    htmlContent?: OpeningHtmlContent;
}
export interface JobSeekerApplication {
    id?: number;
    jobSeekerGuid?: string;
    openingId?: number;
    isEligible?: boolean;
    appliedOn?: Date;
    updatedOn?: Date;
    status?: string;
}

export enum ValidationTypes {
    verification = 'required_verification',
    criteria = 'evaluate_criteria',
    mandatory = 'mandatory_fields',
    dynamicForm = 'questionnaire_form'
}

export interface ApplicationValidationModel {
    validationType?: ValidationTypes;
    content?: any;
}


export interface JobTypeModel {
    id?: number;
    openingId?: number;
    jobTypeId?: number;
    jobType?: string;
}

export interface OpeningHtmlContent {
    id?: number;
    openingId?: number;
    jobDescription?: string;
    jobSpecification?: string;
    preferred?: string;
    benefits?: string;
    applyProcedure?: string;
}

export interface JobLocationModel {
    id?: number;
    openingId?: number;
    location?: string;
}

export interface QualificationModel {
    id?: number;
    openingId?: number;
    qualificationId?: number;
    qualification?: string;
    experience?: string;
}

export interface MandatoryModel {
    id?: number;
    openingId?: number;
    tableName?: string;
    column?: string;
    displayText?: string;
}

export interface CriteriaModel {
    id?: number;
    openingId?: number;
    columns?: { key: string, value: string }[];
}

export interface DynamicFormMetadata {
    id?: number;
    openingId?: number;
    templateTitle?: string;
    formMetadata?: ControlBase[];
}
