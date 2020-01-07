import {
    NgModule
} from '@angular/core';
import {
    CommonModule
} from '@angular/common';

import {
    BlockUIModule
} from 'primeng/primeng';

import {
    WaitSpinnerComponent
} from './wait-spinner.component';

@NgModule({
    imports: [
        CommonModule,
        
        BlockUIModule
    ],

    declarations: [
        WaitSpinnerComponent
    ],
    
    exports: [
        WaitSpinnerComponent
    ]
})

export class WaitSpinnerModule { }