import {
    AddItemComponent
} from './addItem.component';

import {
    Routes,
    RouterModule
} from '@angular/router';

import {
    CommonModule,
    DatePipe
} from '@angular/common';
import {
    FormsModule
} from '@angular/forms';


import {
    NgModule, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import {
    MessagesModule,
    PanelModule,
    DataTableModule,
    ButtonModule,
    TreeTableModule,
    TreeNode,
    SharedModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    TabViewModule,
    AutoCompleteModule,
    FileUploadModule,
    FieldsetModule,
    CalendarModule,
    SpinnerModule,
    TriStateCheckboxModule,
    GrowlModule,
    ConfirmDialogModule,
    InputSwitchModule,
    InputMaskModule
} from 'primeng/primeng';


const addItemRoutes: Routes = [
    {
        path: '',
        component: AddItemComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        MessagesModule,
        PanelModule,
        DataTableModule,
        ButtonModule,
        CalendarModule,
        TreeTableModule,
        SharedModule,
        DropdownModule,
        TriStateCheckboxModule,
        DialogModule,
        InputMaskModule,
        TabViewModule,
        SpinnerModule,
        AutoCompleteModule,
        FieldsetModule,
        FileUploadModule,
        GrowlModule,
        ConfirmDialogModule,
        InputSwitchModule,
        RouterModule.forChild(addItemRoutes)
    ],

    declarations: [
        AddItemComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AddItemModule { }