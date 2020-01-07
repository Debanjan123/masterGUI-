import {
    Injectable
} from '@angular/core';


import {
    Component,
    AfterViewInit,
    ViewChildren
} from '@angular/core';

import {
    AuthService
} from '../../_services/auth/auth.service';

import {
    EnvVarConfig
} from '../../shared/envVarConfig/environment-config';

import {
    LoginResponse
} from '../../shared/authServiceImpl/loginResponse';

import {
    Router
} from '@angular/router';


import {
    AuthUser
} from '../../_domains/common/index';

import {
    UserDetails
} from '../../shared/authServiceImpl/userDetails';


import {
    WaitSpinnerService,
    LocalStorageService
} from '../../_services/common/index';

declare let process: any;

@Component({
    templateUrl: './login.component.html'
})

export class LoginComponent implements AfterViewInit {
    @ViewChildren('cardinputelm') cardinputelm;
    @ViewChildren('userIdInput') userIdInput;
    @ViewChildren('passwordInput') passwordInput;

    private msgs = [];
    errorMsg: string;
    private isLoginButtonDisabled = true;
    private pageLoading = false;
    private userId = '';
    private password: string;
    private firstTimeLoading = true;
    private isAuthorizedUser = true;
    private count = 0;
    username;
    isCollapsed = true;
    firstName;
    displayName;
    showLoggedInUserDetails = false;
    applicationType = EnvVarConfig.getEnvironmentVariable('environmentType');

    userDetails = new UserDetails();


    constructor(private _router: Router, private _authService: AuthService,
        private _localStorageService: LocalStorageService,
        private _waitSpinnerService: WaitSpinnerService) {

        this._authService.name.subscribe(n => {
            //  if(n=="sessionTimeOut"){
            //      this.showLoggedInUserDetails=false;
            //  }else{
            //     this.username = n;
            //     var splitName = this._authService.getDisplayName().split(' ');
            //     this.firstName =  splitName!=undefined ? splitName[0] : '';
            //     this.displayName = this._authService.getDisplayName();
            //     this.userDetails = this._authService.getUserDetails();
            //     this.showLoggedInUserDetails = true;
            //     this.applicationType = EnvVarConfig.getEnvironmentVariable('environmentType');
            //  }

        });




    }

    ngOnInit() {
        this.pageLoading = false;
        this._authService.loggedInUser.subscribe(isLoggedIn => {
            this.msgs = [];
            if (!isLoggedIn && !this.firstTimeLoading) {
                this.passwordInput.first.nativeElement.focus();
                this.msgs.push({ severity: 'error', summary: '', detail: 'Bad Credentials. Login failed !!' });
            }
        });

    }

    ngAfterViewInit() {
        this._waitSpinnerService.hideWait();
        this.userIdInput.first.nativeElement.focus();
    }

    login() {
        this.msgs = [];
        //    this.firstTimeLoading = false;
        if (this.count === 0) {
            this.count++;
            localStorage.setItem('loggedinid', this.userId);
            this.pageLoading = true;
            var uid = this.userId;
            var pwd = this.password;
            var base64Ldap = "Basic " + btoa(uid + ":" + pwd);
            //var clientCode = LocalStorageService.ClientCode;
            //var clientSecret = LocalStorageService.ClientSecret;
            var clientCode = process.env.CLIENT_CODE;
            var clientSecret = process.env.CLIENT_SECRET;
            var base64Client = "Basic " + btoa(clientCode + ":" + btoa(clientSecret));
            //  console.log("clientCode...."+clientCode);
            //  console.log("clientSecret...."+clientSecret);
            //  console.log("base64Client...."+base64Client);
            localStorage.setItem('base64Client', base64Client);
            this._waitSpinnerService.showWait();
            this._authService.loginNew(base64Ldap, base64Client, this.userId).subscribe(
                success => {
                    this.count=0;
                    this._waitSpinnerService.hideWait();
                    if (this._authService.isUserValid() == false) {
                        this.msgs.push({ severity: 'error', summary: '', detail: 'OOPS! You are not authorized to access this application.!! Please contact application admin' });
                        this._authService.setUserValidToTrue();
                        this.pageLoading = false;
                        this.isAuthorizedUser = false;
                    } else {
                        //this.pageLoading = false;
                        this.isAuthorizedUser = true;
                        this._authService.name.next(this.userId);
                        //  this._authService.showNavBar.next(true);
                        let lastAttemptNavigation = this._authService.getLastRouteAttempt();
                        if (this.isAuthorizedUser) {
                            this._router.navigate(['web-app', 'home']);
                        } else {
                            this._router.navigate(['web-app', 'not-auth']);
                        }
                    }
                },
                error => {
                    this.count = 0;
                    if (error.status === 0) {
                        this.msgs.push({ severity: 'error', summary: '', detail: 'Server Down.!' });
                    } else {
                        var loginResponse = new LoginResponse();
                        loginResponse = JSON.parse(JSON.stringify(error.json()));
                        this.msgs.push({ severity: 'error', summary: '', detail: 'Bad Credentials. Login failed !!' });
                        //this.msgs.push(loginResponse.ResponseMessage+". ");
                        if (typeof (loginResponse.messages) != 'undefined' && loginResponse.messages.length > 0) {
                            for (var i = 0; i < loginResponse.messages.length; i++) {
                                this.errorMsg = this.errorMsg + loginResponse.messages[i] + ".";
                            }
                        }
                    }
                    this._waitSpinnerService.hideWait();
                    this.pageLoading = false;
                    this.isAuthorizedUser = false;
                    this._authService.setUserValidToTrue();
                    this._authService.setUserRolesToEmpty();
                    this._authService.resetLoggedInDetails("");

                },
                () => {
                    this.pageLoading = false;
                });
        }
    }


    // login(){
    //        this.msgs = [];
    //        this.firstTimeLoading = false;
    //        if(window.navigator.userAgent.indexOf('JavaFX') > 0){  
    //             localStorage.setItem('isdesktoprequest', 'true');
    //        }
    //        let authUser = new AuthUser(this.userId, this.password);
    //        this._authService.login(authUser);
    //        this.password = '';
    //     }

    private onKeyUp(event) {
        this.msgs = [];
        if (this.userId == '' || this.password == '') {
            this.isLoginButtonDisabled = true;
            return;
        }

        this.isLoginButtonDisabled = false;
        if (event.keyCode == 13) {
            this.login();
        }
    }
}