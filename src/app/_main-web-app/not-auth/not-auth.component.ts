import {
    Component
}  from '@angular/core';

@Component({
    template: '<span style="color:RED;"><H1>{{ notAuthMessage }} </H1></span>'
})

export class NotAuthComponent {

    private notAuthMessage = "Your credentials are not authorized.";

    constructor() { }

    ngOnInit() {
        let errorContent = localStorage.getItem('not-auth-content');
        if(errorContent){
            let errorResponseObj = JSON.parse(errorContent);
            if(errorResponseObj.messages && errorResponseObj.messages.length>0){
                this.notAuthMessage = errorResponseObj.messages[0];
            }
        }
        
    }

}