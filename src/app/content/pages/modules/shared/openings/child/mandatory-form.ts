import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, Component, Inject, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { of, Subject } from 'rxjs';
import { delay, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ErrorCollection, MandatoryModel, ResponseModel, TreeDataModel } from '../../../../../../models';
import { fadeIn } from '../../../../../../utils';
import { ChangesConfirmComponent } from '../../../../components/shared/changes-confirm/changes-confirm.component';
import { SnackToastService } from '../../../../components/shared/snakbar-toast/toast.service';
import { JobService } from '../../../employer/jobs/jobs/job.service';
import { MainComponent } from '../main.component';

@Component({
    selector: 'mandatory-form',
    templateUrl: './mandatory-form.html',
    animations: [fadeIn],
    styles: [`
            mat-tree{
                min-height: 300px;
            }
            mat-tree-node{
                transition: background .2s ease-in, color .1s ease-in;
                height:30px !important;
                min-height:30px !important;
            }
            mat-tree-node:hover{
                background: #f7f7f7;
                color: #5867dd;
            }
            .toggle-btn{
                height: 25px; width:25px; line-height: unset
            }
    `]
})
export class MandatoryForm implements AfterViewInit, OnDestroy {
    isError: boolean;
    response: ResponseModel;
    errors: ErrorCollection[];
    isWorking: boolean;
    workingFor: string;
    notExist: boolean;
    isLoading: boolean;
    treeChanged: boolean;

    @Input() openingId: number;
    constructor(
        private readonly jService: JobService,
        private readonly notify: SnackToastService,
        private dialogRef: MatDialogRef<MainComponent>,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA)
        public readonly data: { id: number, guid?: string }) { }

    private readonly toDestroy$ = new Subject<void>();

    checklistSelection = new SelectionModel<TreeDataModel<MandatoryModel>>(true /* multiple */);

    treeControl = new FlatTreeControl<TreeDataModel<MandatoryModel>>(node => node.level, node => node.children && node.children.length > 0);
    private transformer = (node: TreeDataModel<MandatoryModel>, level: number) => {
        return {
            expandable: node.children && node.children.length > 0,
            name: node.name,
            level: level,
            ...node
        };
    }
    // tslint:disable-next-line: member-ordering
    private treeFlattener = new MatTreeFlattener(
        this.transformer,
        node => node.level,
        node => node.children && node.children.length > 0,
        node => node.children
    );

    // tslint:disable-next-line: member-ordering
    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    getLevel = (node: TreeDataModel<MandatoryModel>) => node.level;

    ngAfterViewInit() {
        this.initMandatoryData();
    }

    private initMandatoryData() {

        of(this.openingId).pipe(
            filter(id => id > 0), takeUntil(this.toDestroy$), delay(100),
            tap(_ => this.isLoading = true), switchMap(id => this.jService.getMandatory(id)),
            takeUntil(this.toDestroy$), delay(800),
            tap(_ => this.isLoading = false),
        ).subscribe({
            next: res => this.initTreeData(res && res.contentBody),
            error: _ => this.isLoading = false
        });
    }

    private initTreeData(tree: TreeDataModel<MandatoryModel>[]) {

        const scope = this;

        // assign the tree nodes first
        this.treeControl.dataNodes = tree;
        this.dataSource.data = tree;

        // items are always an array.
        function recursiveTreeNodeFn(items: TreeDataModel<MandatoryModel>[] = []) {

            items.forEach(node => {
                const hasSelected = node && (node.selected || node.children &&
                    node.children.findIndex(_ => _.selected) > -1);

                if (hasSelected) scope.treeControl.expand(node);

                // saved values as selected node
                if (node && node.selected)
                    scope.itemSelectionToggle(node);

                // call the fn recursively for its cildren.
                recursiveTreeNodeFn(node.children);
            });
        }

        // call the fn to iterate through tree control nodes
        recursiveTreeNodeFn(this.treeControl.dataNodes);

        // expand descendants by selected node
        this.checklistSelection.selected.forEach(node => this.treeControl.expandDescendants(node));

        this.notExist = this.checklistSelection.isEmpty();
    }

    ngOnDestroy() {
        this.toDestroy$.next();
        this.toDestroy$.complete();
    }

    /** whether the node has children */
    hasChild = (_: number, node: TreeDataModel<MandatoryModel>) => node.expandable;

    saveChanges(action: string) {

        this.clearStates();

        if (!(this.openingId > 0)) {

            this.isError = true;
            this.response = { messageBody: `You have to create an opening first and then you add mandatory fields to it. Please create an opening from 'Basic Control' section and then try again.` };
            return false;
        }

        if (action == 'remove') {
            if (!(this.notExist))
                this.removeData(action);
            return false;
        }

        if (!(this.treeControl.dataNodes.findIndex(_ => _.selected) > -1)) {

            this.isError = true;
            this.response = { messageBody: `No items were selected. Please selected an item and try again.` };
            return false;
        }

        this.addOrUpdateData(action);
    }

    private addOrUpdateData(action: string) {

        const selected = this.treeControl.dataNodes
            .filter(t => t.selected)
            .map(t => <MandatoryModel>{
                openingId: this.openingId,
                tableName: t.data.tableName,
                column: t.data.column,
                displayText: t.name
            });

        this.isWorking = true;
        this.workingFor = action;

        this.jService.addOrUpdateMandatory(selected).pipe(takeUntil(this.toDestroy$), delay(1000)).subscribe({
            next: res => [
                this.notify.when('success', res, () => this.clearStates()),
                this.treeChanged = false,
                this.notExist = this.checklistSelection.isEmpty()
            ],
            error: e => {
                this.response = {};
                this.isError = true;
                this.isWorking = false;
                const model: ResponseModel = e.error;
                const errors: ErrorCollection[] = model.contentBody.errors;
                // Check if server returning number of error list, if so make these as string
                if (errors && errors.length > 0) {
                    this.errors = errors;
                    this.response.messageBody = model.messageBody;
                }
            }
        });
    }

    private removeData(action: string) {

        this.isWorking = true;
        this.workingFor = action;

        this.jService.removeMandatory(this.openingId).pipe(
            takeUntil(this.toDestroy$), delay(400)
        ).subscribe({
            next: res => [
                this.checklistSelection.selected.forEach(node => this.itemSelectionToggle(node)),
                this.checklistSelection.clear(),
                this.treeControl.dataNodes.forEach(n => n.selected = false),
                this.notify.when('success', res, () => this.clearStates()),
                this.notExist = this.checklistSelection.isEmpty()
            ],
            error: _ => this.notify.when('danger', _, () => this.clearStates())
        });
    }

    /** Toggle a leaf item selection. Check all the parents to see if they changed */
    leafItemSelectionToggle(node: TreeDataModel<MandatoryModel>) {

        // toggle value
        node.selected = !node.selected;

        this.checklistSelection.toggle(node);
        this.checkAllParentsSelection(node);
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: TreeDataModel<MandatoryModel>): void {
        let parent: TreeDataModel<MandatoryModel> = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: TreeDataModel<MandatoryModel>): void {

        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }
    /* Get the parent node of a node */
    getParentNode(node: TreeDataModel<MandatoryModel>): TreeDataModel<MandatoryModel> | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: TreeDataModel<MandatoryModel>): boolean {

        const descendants = this.treeControl.getDescendants(node);

        if (descendants.length === 0)
            return this.checklistSelection.isSelected(node);

        return descendants.every(child => this.checklistSelection.isSelected(child));
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: TreeDataModel<MandatoryModel>): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));

        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the item selection. Select/deselect all the descendants node */
    itemSelectionToggle(node: TreeDataModel<MandatoryModel>): void {

        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        const isSelected = this.checklistSelection.isSelected(node);

        isSelected
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        descendants.every(child => this.checklistSelection.isSelected(child));
        this.checkAllParentsSelection(node);

        /** when checkbox toggle happens, toggle `selected` property to filter and prepare API payload */
        function selectedUpdator(items: TreeDataModel<MandatoryModel>[]) {

            items.forEach(n => {
                const noChildren = !(n.children && n.children.length > 0);
                n.selected = noChildren && isSelected;
                if (!noChildren)
                    selectedUpdator(n.children);
            });
        }

        selectedUpdator(descendants);

    }

    cancel() {
        if (this.treeChanged) {
            this.dialog.open(ChangesConfirmComponent).afterClosed()
                .pipe(filter(_ => _))
                .subscribe(_ => this.dialogRef.close());
        } else {
            this.dialogRef.close();
        }
    }

    clearStates() {
        this.workingFor = null;
        this.isWorking = false;
        this.isError = false;
        this.response = null;
        this.errors = null;
    }
}
