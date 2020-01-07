import {
    SSTViewShipToVendorComponent
} from './sstViewShipToVendor.component';

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
    TabViewModule,
    AutoCompleteModule,
    FileUploadModule,
    FieldsetModule,
    CalendarModule,
    GrowlModule,
    ConfirmDialogModule
} from 'primeng/primeng';

const sstViewShipToVendorRoutes: Routes = [
  {
    path: '',
    component: SSTViewShipToVendorComponent
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
        RouterModule.forChild(sstViewShipToVendorRoutes)
    ],

    declarations: [
       SSTViewShipToVendorComponent
    ]
    
})

export class SSTViewShipToVendorModule { }