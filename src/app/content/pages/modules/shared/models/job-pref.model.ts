import { DropdownModel } from '../../../../../models';
import { JobSearchStatus } from './job-serch.enum';

export class JobPrefModel {

    id?: number = null;
    jobCategories?: DropdownModel[] = null;
    experienceLevel?: DropdownModel[] = null;
    jobType?: DropdownModel[] = null;
    skills?: string[] = null;
    prefLocation?: string[] = null;
    specialization?: string[] = null;
    salaries?: SalariesModel = null;
    careerSummary?: string = null;
    title?: string = null;
    jobSearchStatus?: JobSearchStatus = null;

}

export class SalariesModel {

    /**
     * Current salary
     */
    current: SalaryModel = null;

    /**
     * Expected salary
     */
    expected: SalaryModel = null;

}

export class SalaryModel {

    /**
     * Symbol or code of the currencies
     */
    currencyCode: string = null;

    /**
     * floating/integer/numuric value
     */
    amount: number = null;

    /**
     * payment process
     */
    paymentBasis: string = null;

}

/**
 * Static class
 */
export class CurrencyCodes {
    static Codes: CurrencyCodeModel[] = [
        { currencyCode: 'NPR', text: 'Nepalese Rupees (रू)', symbol: 'रू' },
        { currencyCode: 'INR', text: 'Indian Rupees (₹)', symbol: '₹' },
        { currencyCode: 'USD', text: 'US Doller ($)', symbol: '$' },
        { currencyCode: 'EUR', text: 'Euros (€)', symbol: '€' },
        { currencyCode: 'GBP', text: 'British Pounds (£)', symbol: '£' },
        { currencyCode: 'CAD', text: 'Canadian Dollars (C$)', symbol: 'C$' },
        { currencyCode: 'AUD', text: 'Australian Dollars (A$)', symbol: 'A$' },

    ];
}


interface CurrencyCodeModel {
    /**
     * Currency currencyCode. E.G. USD, AUD, CAD, NPR
     */
    currencyCode: string;
    /**
     * Client display text. E.G. US Doller ($)
     */
    text: string;
    /**
     * Currency Symbol. E.G. $, €
     */
    symbol: string;
}

