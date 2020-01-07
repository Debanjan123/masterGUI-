import {
    CostSellComponent
} from './cost-sell.component';

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
    FileUploadModule,
    FieldsetModule,
    CalendarModule,
    GrowlModule,
    ConfirmDialogModule
 }  from 'primeng/primeng';

// import {DropdownModule} from 'primeng/dropdown';

 const costSellRoutes: Routes = [
  {
    path: '',
    component: CostSellComponent
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
        DialogModule,
        FieldsetModule,
        FileUploadModule,
        GrowlModule,
        ConfirmDialogModule,
        RouterModule.forChild(costSellRoutes)
    ],

    declarations: [
       CostSellComponent
    ]
    
})

export class CostSellModule { }