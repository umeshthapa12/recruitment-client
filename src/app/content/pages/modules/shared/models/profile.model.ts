export interface ProfileModel {
    id?: number;
    aboutMe?: string;
    fullName?: string;
    photo?: string;
    presentAddress?: string;
    permanentAddress?: string;
    phoneNumbers?: PhoneNumberModel[];
    gender?: string;
    dateOfBirth?: Date;
    maritalStatus?: string;
    religion?: string;
    nationalityId?: number;
    nationality?: string;
}
export interface ProfileModel {
    id?: number;
    about?: string;
    name?: string;
    category?: string;
    otherCategory?: string;
    categoryId?: number;
    address?: string;
    email?: string;
    domain?: string;
    favicon?: string;
    url?: PhoneNumberModel[];
    companyType?: string;
    companyTypeId?: number;
    employeeSize?: Date;
    phoneNumbers?: PhoneNumberModel[];
    contactPersonName?: string;
    contactPersonDesignation?: string;
    contactPersonPhone?: string;
    contactPersonEmail?: string;
    contactPersonAddress?: string;
    contactPersonDescription?: string;

    faq?: string;
    privacy?: string;
    terms?: string;
    disclaimer?: string;
}

export interface PhoneNumberModel {
    phoneType: string;
    number: string;
}

