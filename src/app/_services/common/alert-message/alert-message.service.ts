import { 
    Injectable 
} from '@angular/core';

import {
    Subject
} from 'rxjs/Rx';

import {
    WebServiceComm,
    LocalStorageService,
    WaitSpinnerService
} from '../../../_services/common/index';

import {
    ErrorMessage
} from '../../../_domains/common/index';

@Injectable()
export class AlertMessageService {
   
   public alertMessageSubject = new Subject<any>();
   public confirmMessageSubject = new Subject<any>();
   private isSubmitToDBDisable = false;
   
   constructor(private _localStorageService: LocalStorageService){}
   
   showErrorMessages(messages:string[]){
       let msgs = []; 
       messages.forEach(msg =>{
        msgs.push({severity:'error', summary: '', detail:msg});    
       });
       this.alertMessageSubject.next(msgs);
   }
   
   showErrorMessage(msg:string){
       let msgs = []; 
       msgs.push({severity:'error', summary: '', detail:msg});
       this.alertMessageSubject.next(msgs);
   }
   
   showInfoMessages(messages:string[]){
       let msgs = []; 
       messages.forEach(msg =>{
        msgs.push({severity:'info', summary: '', detail:msg});    
       });
       this.alertMessageSubject.next(msgs);
   }
   
   showInfoMessage(msg:string){
       let msgs = []; 
       msgs.push({severity:'info', summary: '', detail:msg});
       this.alertMessageSubject.next(msgs);
   }
   
   showWarnMessage(msg:string){
       let msgs = []; 
       msgs.push({severity:'warn', summary: '', detail:msg});
       this.alertMessageSubject.next(msgs);
   }
   
   removeMessages(){
       this.alertMessageSubject.next([]);
   }

   addErrorMessage(errorMessage : ErrorMessage, msgs) {
       this.createNewErrorMsgs(errorMessage.getCode(), errorMessage.getMessage(), msgs);
   }

   removeErrorMessage(errorMessage : ErrorMessage, msgs) {
       this.removeMsgs(errorMessage.getCode(), msgs);
   }

   removeErrorMessages(errorMessages: any[], msgs) {
       for (let i = 0; i < errorMessages.length ; i++) {
           this.removeMsgs(errorMessages[i].code, msgs);
       }
   }

   createNewErrorMsgs(msgsCD, msgsBDY,msgs) {
        let isMsgsCdAlreadyExists = false;
        if (msgs.length > 0) {
            for (var i = 0; i < msgs.length; i++) {
                if (msgs[i].summary && JSON.stringify(msgs[i].summary).replace(/\"/g, "") === msgsCD) {
                    isMsgsCdAlreadyExists = true;
                }
            }

            if (!isMsgsCdAlreadyExists) {
                msgs.push({ severity: 'error', summary: msgsCD, detail: msgsBDY });
            }


        } else {
            msgs.push({ severity: 'error', summary: msgsCD, detail: msgsBDY });
        }
        this.isSubmitToDBDisable = true;
        this._localStorageService.addItem("isSubmitToDBDisable",this.isSubmitToDBDisable);
    }

    removeMsgs(msgsCD:string,msgs) {
        for (var i = msgs.length - 1; i >= 0; i--) {
            if ( msgs[i].summary === msgsCD) {
                msgs.splice(i, 1);
            }
        }

        if (msgs.length === 0) {
            this.isSubmitToDBDisable = false;
            this._localStorageService.addItem("isSubmitToDBDisable",this.isSubmitToDBDisable);
        }
    }
   
}