import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { QueryModel, ResponseModel } from '../../../../../../../models';

@Injectable()
export class InterviewSetupService {

    getInterviewQuestions(p: QueryModel) {
        return of(<ResponseModel>{
            contentBody: {
                items: [
                    { sn: 1, id: 1, title: 'Basic Introduction', noOfQuestions: 20, difficulty: 'Beginner', pass: 80, full: 100 },
                    { sn: 1, id: 1, title: 'Microsoft Office Basic', noOfQuestions: 5, difficulty: 'Easy', pass: 70, full: 100 },
                    { sn: 1, id: 1, title: 'Database MSSQL Advance', noOfQuestions: 5, difficulty: 'Normal', pass: 35, full: 100 },
                    { sn: 1, id: 1, title: 'Sales Executive (Junior-Senior)', noOfQuestions: 5, difficulty: 'Hard', pass: 50, full: 100 },
                    { sn: 1, id: 1, title: 'AI Deep Learning', noOfQuestions: 51, difficulty: 'Very Hard', pass: 45, full: 100 },
                ]
            }
        });
    }
}
