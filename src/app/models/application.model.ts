
export interface ApplicationsModel {
    sn?: number;
    id?: number;
    openingId?: number;
    jobSeekerGuid?: string;
    employerGuid?: string;
    companyName?: string;
    jobTitle?: string;
    expiresOn?: Date;
    jobCategory?: string;
    fullName?: string;
    isEligible?: boolean;
    appliedOn?: number;
    updatedOn?: number;
    status?: string;
}

export interface QuestionnaireAnswersModel {
    id?: number;
    employerGuid?: string;
    jobSeekerGuid?: string;
    jobTitle?: string;
    introText?: string;
    answerMetadata?: any;
    fullName?: string;
    designation?: string;
    experienceLevel?: string;
    isEligible?: string;
    avatarUrl?: string;
    email?: string;
    answeredApplicationCounts?: number;
}

export type StageModel = {
    id: number,
    value: string,
    category: string
}
export type StageBodyModel = {
    applicationId?: number,
    openingId?: number,
    jobSeekerGuid?: string,
    subject?: string,
    messageBody?: string,
    remarks?: string,
    smsText?: string,
    stageId?: number,
    isOngoing?: boolean,
    jobSeekerStage?: StageBodyModel[]
}

export type StageHistoryModel = {
    id?: number;
    jobSeekerGuid?: string;
    employerGuid?: string;
    openingId?: number;
    stage?: string;
    stageCategory?: string;
    totalStages?: number;
    jobTitle?: string;
    fullName?: string;
    email?: string;
    isOngoing?: boolean;
    hasMessage?: boolean;
    subject?: string;
    messageBody?: string;
    smsText?: string;
    isSentSuccess?: boolean;
    remarks?: string;
    applicantStatus?: string;
    createdOn?: string;

    // extra props
    isRemarksExpanded?: boolean;
}