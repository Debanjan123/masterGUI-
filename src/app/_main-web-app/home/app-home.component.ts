import {
  Component
}  from '@angular/core';

import {
  AlertMessageService
} from '../../_services/common/index';

@Component({
  templateUrl: './app-home.component.html'
})

export class AppHomeComponent{
  
  private msgs=[];
  
  constructor(private _alertMessageService: AlertMessageService) { }


  ngOnInit() {
    this._alertMessageService.alertMessageSubject.subscribe(msgs =>{
      this.msgs = msgs;
    });
  }
}