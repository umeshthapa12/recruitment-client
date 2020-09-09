import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ExtendedMatDialog } from '../../../../../../utils';
import { MainComponent } from '../../../shared/openings/main.component';
import { AddOrUpdateAction } from './store/opening.store';

@Component({
    selector: 'selection-grid',
    templateUrl: './job-selection.component.html',
    styles: [`
        .grid-bg_1{
            background: #f3f3f3;
            transition: box-shadow .3s cubic-bezier(0,.44,.55,1.11),
                        background .4s cubic-bezier(0,.44,.60,1.20)
        }
        .grid-bg{
            background: #f9f9f9;
        }
        .grid-bg:hover{
            box-shadow: 0 6px 6px -3px rgba(0,0,0,.2), 0 10px 14px 1px rgba(0,0,0,.14), 0 4px 18px 3px rgba(0,0,0,.12);
            background: #FFFFFF;
        }
        .card-btn span{
            transition: transform .2s cubic-bezier(.74,-0.03,.77,.73),
                        border-radius .5s cubic-bezier(.41,.7,.67,.84),
                        background .4s cubic-bezier(.25,.78,.85,.7);
            padding:1px 2px;
            display: inline-block;
        }
        .card-btn:hover span{
            transform: rotate(-15deg) scale(1.1) translate(4px,0);
            box-shadow:0 1px 5px -1px rgba(0,0,0,.2);
            background: #f4516c;
            border-radius: 50%;
        }
    `]
})
export class JobSelectionComponent {

    constructor(
        private dialogUtil: ExtendedMatDialog,
        private dialog: MatDialog,
        private store: Store
    ) { }

    onAction(postType: string) {

        // since we keep track on added/updated object, we have to cleanup from the history too.
        this.store.dispatch(new AddOrUpdateAction({}));

        const config: MatDialogConfig = {
            width: 'calc(100% - 20px)',
            maxHeight: '99%',
            autoFocus: false,
            data: { isBasic: postType === 'basic' }
        };

        const instance = this.dialog.open(MainComponent, config);
        this.dialogUtil.animateBackdropClick(instance);
    }
}
