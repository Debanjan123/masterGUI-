import {
    NgModule
} from '@angular/core';
import {
    CommonModule
} from '@angular/common';

import {
    MessagesModule
} from 'primeng/primeng';

import {
    AlertMessageComponent
} from './alert-message.component';

@NgModule({
    imports: [
        CommonModule,
        
        MessagesModule
    ],

    declarations: [
        AlertMessageComponent
    ],
    
    exports: [
        AlertMessageComponent
    ]
})

export class AlertMessageModule { }