import { 
    Injectable 
} from '@angular/core';

import {
    Subject
} from 'rxjs/Rx';

@Injectable()
export class WaitSpinnerService {
   
   public waitSpinnerSubject = new Subject<boolean>();
   
   constructor(){}
   
   showWait(){
       setTimeout(()=>{
        this.waitSpinnerSubject.next(true);    
       }, 50);
   }
   
   hideWait(){
       setTimeout(()=>{
        this.waitSpinnerSubject.next(false);    
       }, 50);
   }
   
}