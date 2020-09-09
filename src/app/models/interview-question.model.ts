export interface InterViewQuestionModel {
    id?: number;
    regGuid?: string;
    estimated?: number;
    questionTitle: string;
    questions: QuestionSetModel[];
}

export interface QuestionSetModel {
    id?: number;
    question?: string;
}
