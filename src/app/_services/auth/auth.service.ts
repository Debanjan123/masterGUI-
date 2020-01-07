import { Injectable } from '@angular/core';

import {
    Router
} from '@angular/router';

import {
    Observable
} from 'rxjs/Observable';
import {
    Subject
} from 'rxjs/Rx';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

import {
    Headers,
    Http,
    RequestOptions
} from '@angular/http';


import {
    AuthServResponse
} from '../../shared/authServiceImpl/authServiceResponse';

import {
    RolesConstant
} from '../../shared/envVarConfig/roles-Constant';

import {
    Component
} from '../../shared/authServiceImpl/components';

import {
    UserDetails
} from '../../shared/authServiceImpl/userDetails';

import {
    LoginResponse
} from '../../shared/authServiceImpl/loginResponse';


import {
    AuthHttp,
    JwtHelper,
    tokenNotExpired} from 'angular2-jwt';

import {
    AuthUser
} from '../../_domains/common/index';

import {
    LocalStorageService,
    WaitSpinnerService,
    ItmMasterUserRolesService,
    WebServiceComm
} from '../../_services/common/index';

declare let process: any;
@Injectable()
export class AuthService {
    public loggedInUser = new Subject();

    private loggedIn: boolean = false;
    private isAuthorizedUser = true;
    private _userName = '';
    private userRoles = [];
    private sessionLife = 0;
    private lastServiceCallTime = 0;
    private decodedToken = '';
    private _loggedIn = false;
    private userDetails: UserDetails;
    private _displayName = '';
    private base64EncodedClient = '';
    private base64EncodedLDAP = '';
    private origToken = '';
    public name = new Subject();
    private _lastRouteAttempt = '';
    //private authURL =  EnvVarConfig.getEnvironmentVariable('endPointAuth');
    private authURL = '/v1/auth/token?attributes=cn%2Cgivenname%2Cmail%2Csn%2Ctitle%2Cshcdisplayname';
    private _headers = new Headers({ 'Content-Type': 'application/json' });
    private _options = new RequestOptions({ headers: this._headers });
    private userMaintainancyRole;
    private _userRolesService;

    AUTH_ENDPOINT_PREFIX: string;
    // LOGIN_ENDPOINT_PREFIX: string;

    constructor(private _http: Http,
        private _router: Router,
        private _localStorageService: LocalStorageService,        
        private _waitSpinnerService: WaitSpinnerService
    ) {
        this.AUTH_ENDPOINT_PREFIX = process.env.SERVICE_BASE_URL;
        // this.LOGIN_ENDPOINT_PREFIX = process.env.LOGIN_ENDPOINT_PREFIX;
        this._userRolesService = new ItmMasterUserRolesService();
    }


    logout(isExit?: boolean): void {

        this.loggedIn = false;
        localStorage.clear();
        this.loggedInUser.next(this.isLoggedIn());
        if (isExit) {
            this._router.navigate(['/logout']);
            setTimeout(() => {
                alert('logoutnexit');
            }, 50);
        } else {
            window.location.reload();
        }
    }

    isLoggedIn() {
        return this.loggedIn;
    }

    populateUserRoles(authServResponse: AuthServResponse) {
        var components = authServResponse.auth.components;
        var planAreaComponent = new Component();
        var doesCompExists = false;
        var isValidUser = false;
        for (var i = 0; i < components.length; i++) {
            if (components[i].name == LocalStorageService.ITEM_MASTER_GUI) {
                //localStorage.setItem('loggedinrole', components[i].name);
                doesCompExists = true;
                planAreaComponent = components[i];
                break;
            }
        }
        if (doesCompExists) {
            this.sessionLife = planAreaComponent.sessionLife;
            var user = planAreaComponent.users[0];
            if (typeof (user) == 'undefined' || user == null || user.userName != this._userName) {
                this.isAuthorizedUser = false;
            } else {
                if(user.roles.length === 0 ){
                    this.isAuthorizedUser = false;
                }else{
                    this.isAuthorizedUser = this._userRolesService.isAuthorizeUser(JSON.stringify(user.roles));
                }
                if(this.isAuthorizedUser){
                    localStorage.setItem('userRoles',JSON.stringify(user.roles));   
                }
                this.lastServiceCallTime = new Date().getTime();
            }
        } else {
            this.isAuthorizedUser = false;
        }
        this.loggedIn = this.isAuthorizedUser;
        if (this.loggedIn) {
            localStorage.setItem('loggeduser', JSON.stringify(this.userDetails));
            localStorage.setItem('loggedintime', new Date().getTime().toString());
        }
    }

    _getAuthHeader(base64Ldap: string, base64Client: string): RequestOptions {
        let _headers = new Headers({ "Content-Type": "application/json" });
        let authHeaders = new Headers(_headers);
        authHeaders.append('upauth', base64Ldap);
        authHeaders.append('Authorization', base64Client);
        authHeaders.append('Accept', "application/json");
        localStorage.setItem('authorization', base64Client);
        localStorage.setItem('accept', "application/json");
        return new RequestOptions({ headers: authHeaders });
    }

    _resolveAuthUrl(url: string) {
        return this.AUTH_ENDPOINT_PREFIX + url;
        // return this.LOGIN_ENDPOINT_PREFIX + url;
    }

    _resolveAuthEndpoint() {
        return this.AUTH_ENDPOINT_PREFIX + this.authURL;
    }

    loginNew(base64Ldap: string, base64Client: string, userID: string) {
        var loginResponse = new LoginResponse();
        return this._http.get(this._resolveAuthUrl(this.authURL), this._getAuthHeader(base64Ldap, base64Client))
            .map(res => {
                loginResponse = JSON.parse(JSON.stringify(res.json()));
                this.userDetails = loginResponse.userDetails;
                this._displayName = loginResponse.userDetails.displayName;
                this._userName = userID;
                this.base64EncodedClient = base64Client;
                this.base64EncodedLDAP = base64Ldap;
                this._loggedIn = true;
                this.origToken = "Bearer " + loginResponse.token;
                //console.log("this.origToken...."+this.origToken);
                localStorage.setItem('token', this.origToken);
                var jwtHelper = new JwtHelper();
                this.decodedToken = jwtHelper.decodeToken(loginResponse.token);
                //console.log("TOKEN:: " + JSON.stringify(this.decodedToken));
                var authServResponse = new AuthServResponse();
                authServResponse = JSON.parse(JSON.stringify(this.decodedToken));
                this.populateUserRoles(authServResponse);
                this.loggedInUser.next(this.isLoggedIn());
              }).catch((error: any) => Observable.throw(error));
    }

    getLastServCallTime() {
        return this.lastServiceCallTime;
    }

    setLastServCallTime(servTime: number) {
        this.lastServiceCallTime = servTime;
    }

    getSessionLife() {
        return this.sessionLife;
    }
    setSessionLife(session: number) {
        this.sessionLife = session;
    }

    isUserValid() {
        return this.isAuthorizedUser;
    }

    setUserValidToTrue() {
        this.isAuthorizedUser = true;
    }

    getUserName() {
        return this._userName;
    }

    setUserName(uName: string) {
        this._userName = uName;
    }

    getDisplayName() {
        return this._displayName;
    }

    setDisplayName(dName: string) {
        this._displayName = dName;
    }

    setLastRouteAttempt(lastRouteAttempt: string) {
        this._lastRouteAttempt = lastRouteAttempt;
    }

    getLastRouteAttempt(): string {
        return this._lastRouteAttempt;
    }

    getUserRoles() {
        return this.userRoles;
    }
    setUserRolesToEmpty() {
        this.userRoles = [];
    }

    getOriginalToken() {
        return this.origToken;
    }

    setOriginalToken(token: string) {
        this.origToken = token;
        localStorage.setItem('token', "Bearer " + this.origToken);
    }

    getBase64EncodedClient() {
        return this.base64EncodedClient;
    }

    getBase64LDAP() {
        return this.base64EncodedLDAP;
    }

    getUserDetails() {
        return this.userDetails;
    }

    getErrorMessage() {
        // return this.errorMessage;
    }

    setErrorMessage(errorMsg: string) {
        //   this.errorMessage = errorMsg;
    }

    resetLoggedInDetails(reason: string) {
        this._loggedIn = false;
        this.userDetails = new UserDetails();
        this._displayName = '';
        this._userName = '';
        this._lastRouteAttempt = '';
        this.origToken = '';
        this.decodedToken = '';
        this.base64EncodedClient = '';
        this.base64EncodedLDAP = '';
        this.sessionLife = 0;
        this.lastServiceCallTime = 0;
        this.setErrorMessage(reason);
        //  this.name.next("sessionTimeOut");
        //  this.showNavBar.next(false);
    }



}