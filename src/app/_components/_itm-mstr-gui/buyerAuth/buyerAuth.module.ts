import {
    BuyerAuthComponent
} from './buyerAuth.component';

import {
    NgModule
} from '@angular/core';

import {
    CommonModule,
    DatePipe
} from '@angular/common';

import {
    FormsModule
} from '@angular/forms';

import {
    Routes,
    RouterModule
} from '@angular/router';



import {
    MultiSelectModule,
    ListboxModule,
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
    GrowlModule,
    ConfirmDialogModule,
    InputSwitchModule
} from 'primeng/primeng';

const buyerAuthRoutes: Routes = [
    {
        path: '',
        component: BuyerAuthComponent
    }
];

@NgModule({
    imports: [
        MultiSelectModule,
        ListboxModule,
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
        DialogModule,
        TabViewModule,
        AutoCompleteModule,
        FieldsetModule,
        FileUploadModule,
        GrowlModule,
        ConfirmDialogModule,
        InputSwitchModule,
        RouterModule.forChild(buyerAuthRoutes)
    ],

    declarations: [
        BuyerAuthComponent
    ]

})


export class BuyerAuthModule { }