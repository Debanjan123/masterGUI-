import {
    Component, 
    Input
} from '@angular/core';

@Component({
    selector: 'alert-message',
    template: `
        <div style='position:absolute; width:99.5%;padding:0em 0.2em 0em 0.2em;z-index:1000;'>
            <p-messages [value]="msgs"></p-messages>
        </div>
    `
})

export class AlertMessageComponent { 
    @Input() msgs = [];
    
    constructor(){
        
    }
    
    
}