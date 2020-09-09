export interface ApplicantModel {
    messageId?: number,
    applicationId?: number,
    openingId?: number,
    jobSeekerGuid?: string,
    employerGuid?: string,
    fullName?: string,
    appointmentDate?: Date,
    timer?: any,
    isEligible?: boolean,
    isSentSuccess?: boolean,
    messageExist?: boolean,
    isAttended?: boolean,
    appliedOn?: Date,
    sentDate?: Date,
    stage?: string;
}

export interface AppointmentModel {
    id?: number, regGuid?: string,
    applicants?: number, estimated?: number,
    noOfOpenings?: number, scheduledAppointments?: number,
    appointmentAttendees?: number,
    jobTitle?: string,
}