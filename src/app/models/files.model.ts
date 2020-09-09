export interface FileUrlsModel {
    fileName: string;
    getUrl?: string;
    deleteUrl?: string;
    type?: PicTypes;
}

export enum PicTypes {
    none = 'None',
    avatar = 'Avatar',
    brand = 'Brand'
}
