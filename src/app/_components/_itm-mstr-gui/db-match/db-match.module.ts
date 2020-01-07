import {
    DBMatchComponent
} from './db-match.component';

import {
  Routes,
  RouterModule
} from '@angular/router';

// import {
//     MomentModule
// } from 'angular2-moment';

// import {
//     MomentTimezoneModule
// } from 'angular-moment-timezone';

import {
    CommonModule,
    DatePipe
} from '@angular/common';
import { 
  FormsModule 
} from '@angular/forms';


import {
    NgModule
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
    GrowlModule,
    ConfirmDialogModule
} from 'primeng/primeng';

const dbMatchRoutes: Routes = [
  {
    path: '',
    component: DBMatchComponent
  }
];

@NgModule({
    imports: [
       // MomentModule,
        //MomentTimezoneModule,
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
        RouterModule.forChild(dbMatchRoutes)
    ],

    declarations: [
       DBMatchComponent
    ]
    
})

export class DBMatchModule { }