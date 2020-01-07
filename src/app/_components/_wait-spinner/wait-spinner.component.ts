import {
    Component, 
    Input
} from '@angular/core';

@Component({
    selector: 'wait-spinner',
    template: `
        <p-blockUI [blocked]="visible"></p-blockUI>
    	<div *ngIf="visible" class="wait-loader fa fa-spinner fa-pulse fa-5x fa-fw"></div>
    `
})

export class WaitSpinnerComponent { 
    @Input() visible:boolean;
    
    constructor(){
        
    }
    
    
}