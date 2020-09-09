export interface DocumentModel {
    id?: number;
    title?: string;
    description?: string;
    textContent?: string;
    fileTitle?: string;
    fileDescription?: string;
    urls?: {
        getUrl?: string;
        deleteUrl?: string;
    }
}

export interface DocModel {
    textFile?: DocumentModel[];
    docFile?: [{
        fileTitle?: string;
        fileDescription?: string;
        urls?: {
            getUrl?: string;
            deleteUrl?: string;
        }
    }];

}
