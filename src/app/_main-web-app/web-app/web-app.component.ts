import {
  Component,
  HostListener
} from '@angular/core';

import {
  AlertMessageService,
  WaitSpinnerService,
  WebServiceComm
} from '../../_services/common/index';

import {
  AuthService
} from '../../_services/auth/auth.service';

@Component({
  selector: 'web-app',
  templateUrl: './web-app.component.html'
})

export class WebAppComponent {
  private spinnerVisible: boolean = false;
  private appTitle = "Item Master - GUI";
  private footerText = "Copyright © Sears Holdings Corporation. All rights reserved.";

  private appLaunchTime: Date = new Date();
  private lastAction: Date = null;
  private isSessionDialogVisible = false;
  private countDown = 60;
  private isCountDownMgsVisible = false;
  private isSessionExpiredMsgVisible = false;
  private maxSessionIdleMinLimit: number = 89;
  private maxAppIdleMinLimit: number = 120;
  private isSessionExpired = false;
  private showBuildDetails = false;
  private buildversion = 'local';
  private environment = "Local";

  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent) {
    this._storeLastActionTime();
    this._alertMessageService.removeMessages();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(ev: MouseEvent) {
    this._storeLastActionTime();
    this._alertMessageService.removeMessages();
  }

  @HostListener('document:onmousemove', ['$event'])
  onMouseMove(ev: MouseEvent) {
    this._storeLastActionTime();
  }

  @HostListener('document:onmousewheel', ['$event'])
  onMouseWheel(ev: MouseEvent) {
    this._storeLastActionTime();
  }

  constructor(private _authService: AuthService,
    private _webServiceComm: WebServiceComm,
    private _alertMessageService: AlertMessageService,
    private _waitSpinnerService: WaitSpinnerService) {

    this._waitSpinnerService.waitSpinnerSubject.subscribe(visible => {
      this.spinnerVisible = visible;
    });
  }

  ngOnInit() {
    this._waitSpinnerService.showWait();
    //this._getBuildVersion();
    localStorage.clear();
    this._monitorIdleTime();
  }

  private _monitorIdleTime() {
    setTimeout(() => {
      this._checkForIdleTime();
    }, 1000);
  }

  private _checkForIdleTime() {
      let loggedInTime = localStorage.getItem('loggedintime');
      if (loggedInTime && this.lastAction && !this.isSessionExpired) {
        let timeDiff = (new Date().getTime() - this.lastAction.getTime()) / 1000;
        timeDiff = Math.floor(timeDiff / 60);
        let minutes = Math.round(timeDiff % 60);
        if (minutes >= this.maxSessionIdleMinLimit) {
          if (!this.isSessionDialogVisible) {
            this.countDown = 60;
            this.isSessionDialogVisible = true
            this.isSessionExpiredMsgVisible = false;
            this.isCountDownMgsVisible = true;
          }
          this.countDown -= 1;
        }
        if (this.countDown <= 0) {
          this.countDown = 60;
          this.isCountDownMgsVisible = false;
          this.isSessionExpiredMsgVisible = true;
          this.isSessionExpired = true
        }
      }
    
    this._monitorIdleTime();
  }

  private _storeLastActionTime() {
    this.isSessionDialogVisible = false;
    this.lastAction = new Date();
    this.appLaunchTime = this.lastAction;
    if (this.isSessionExpired) {
      this.isSessionExpired = false;
      this._authService.logout();
    }
    
  }

  private _appExitRequired(): boolean {
    let timeDiff = (new Date().getTime() - this.appLaunchTime.getTime()) / 1000;
    timeDiff = Math.floor(timeDiff / 60);
    let minutes = Math.round(timeDiff % 60);
    if (minutes >= this.maxAppIdleMinLimit) {
      return true;
    }

    return false;
  }


   private _getBuildVersion() {
    this._webServiceComm.httpGet('system/site/version').subscribe(resp => {
      try {
          if (resp && resp.version) {
          let siteDetails = resp.version.split('-site');
          this.environment = siteDetails[0];
          this.buildversion = siteDetails[1];
          this.showBuildDetails = true;
        }
      } catch (e) { }
    });
  }

}