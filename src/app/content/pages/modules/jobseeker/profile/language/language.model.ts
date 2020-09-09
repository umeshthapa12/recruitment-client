export interface LanguageModel {
    // primary key
    id?: number;
    // language name
    languageName?: string;
    // local stars
    read?: StarModel[];
    write?: StarModel[];
    listen?: StarModel[];
    speak?: StarModel[];
    unselectedStars?: StarModel[];
    // user selected
    selectedStars?: SelectedStarModel[];
}
export interface SelectedStarModel { sectionKey: SectionKey; value: number; }
export interface StarModel {
    // selected position key as number
    key: number;
    // display text
    text: string;
    // whether the star is selected
    isSelected?: boolean;
    // whether the star being focused
    isFocused?: boolean;
    // affiliated language name
    langId?: number;

    // star for
    sectionKey?: SectionKey;
}


export enum SectionKey {
    Read = 'R',
    Write = 'W',
    Listen = 'L',
    Speak = 'S'
}
