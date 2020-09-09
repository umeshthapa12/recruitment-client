export enum JobSearchStatus {

    None = 'none',
    /**
     * I am looking for a job
     * @summary We'll get you in front of employers and send you any new jobs that match your preferences.
     */
    MaximumMatches = 'MaximumMatches',

    /**
    * Open, but not looking
    *  @summary Employers can find you and we'll be selective with the job matches we send.
    */
    FewerMatches = 'FewerMatches',

    /**
    * Not looking for a job
    * @summary Employers won't find you and we won't send you any job that matches to your preferences.
    */
    NoMatches = 'NoMatches'
}
