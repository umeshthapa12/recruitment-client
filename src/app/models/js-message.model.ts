export interface JobSeekerMessageModel {
    sn?: number;
    id?: number;
    employerGuid?: string;
    jobSeekerGuid?: string;
    email?: string;
    fullName?: string;
    age?: number;
    subject?: string;
    messageBody?: string;
    sentDate?: Date;
    jobTitle?: string;
    totalMessage?: number;
    lastSent?: Date;
    sentStatus?: boolean;
}
export interface JobSeekerSmsModel {
    sn?: number;
    id?: number;
    employerGuid?: string;
    jobSeekerGuid?: string;
    mobileNumber?: string;
    fullName?: string;
    age?: number;
    messageBody?: string;
    sentDate?: Date;
    jobTitle?: string;
    totalMessage?: number;
    lastSent?: Date;
    sentStatus?: boolean;
}