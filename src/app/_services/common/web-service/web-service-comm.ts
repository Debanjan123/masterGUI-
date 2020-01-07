import {
    Injectable
} from '@angular/core';
import {
    Headers, 
    Http, 
    Response,
    RequestOptions,
    ResponseOptions
} from '@angular/http';


import {
    AuthHttp,
    JwtHelper,
    tokenNotExpired} from 'angular2-jwt';

import {
  AuthService
} from '../../../_services/auth/auth.service';

import {
  LoginResponse
} from '../../../shared/authServiceImpl/loginResponse';


import {
  Router
} from '@angular/router';

import {
    Observable
} from 'rxjs/Rx';

import 'rxjs/add/operator/map';

declare let process: any;

const _authorization = 'Authorization';

@Injectable()
export class WebServiceComm{

    private WEBSERVICE_ENDPOINT_PREFIX:string;
    private sessionExpErrorData="{\"ResponseCode\":\"99\",\"ResponseMessage\":\"SESSION EXPIRED\",\"messages\":[\"SESSION EXPIRED\"],\"messagesAsSet\":[\"SESSION EXPIRED\"]}";
    private tokenExpErrorData="{\"ResponseCode\":\"99\",\"ResponseMessage\":\"Token regenerate failure\",\"messages\":[\"Token expired\"],\"messagesAsSet\":[\"Token expired\"]}";
    
    constructor(private _http: Http,
                private _authService: AuthService, 
                private _router: Router) {
        this.WEBSERVICE_ENDPOINT_PREFIX = process.env.SERVICE_BASE_URL;
	}
    
    httpGet(url: string){

        //if(this.isSessionValid()){
            // console.log("url.."+this._resolveUrl(url));
            this._authService.setLastServCallTime(new Date().getTime());
             if(this.isTokenExpired()==false){
                return this.getResponseValue(this._http.get(this._resolveUrl(url), this._getHeaderOption()));
             } else{
               return this.regenerateToken().flatMap(
                    result => {
                        var loginResponse = new LoginResponse();
                        loginResponse = JSON.parse(JSON.stringify(result));
                        var token = loginResponse.token;
                        this._authService.setOriginalToken(token);
                        return this.getResponseValue(this._http.get(this._resolveUrl(url), this._getHeaderOption()));
                    }
                );
              }
           
              //return this.getResponseValue(this._http.get(this._resolveUrl(url), this._getHeaderOption()));
        //}else{
            //this.logUserOut("SESSION EXPIRED");
            //return Observable.throw(JSON.parse(this.sessionExpErrorData));
       //}
    }

    
    httpPost(url: string, requestObj: any){
        //if(this.isSessionValid()){
            this._authService.setLastServCallTime(new Date().getTime());
             if(this.isTokenExpired()==false){
                   return this.getResponseValue(this._http.post(this._resolveUrl(url),JSON.stringify(requestObj), this._getHeaderOption()));
             } else{
               return this.regenerateToken().flatMap(
                    result => {
                        var loginResponse = new LoginResponse();
                        loginResponse = JSON.parse(JSON.stringify(result));
                        var token = loginResponse.token;
                        this._authService.setOriginalToken(token);
                           return this.getResponseValue(this._http.post(this._resolveUrl(url),JSON.stringify(requestObj), this._getHeaderOption()));
                    }
                );
              }
        //}else{
            // this.logUserOut("SESSION EXPIRED");
            // return Observable.throw(JSON.parse(this.sessionExpErrorData));
       // }
         //console.log("url.."+this._resolveUrl(url));
        //  return this.getResponseValue(this._http.post(this._resolveUrl(url), 
        //             JSON.stringify(requestObj), this._getHeaderOption()));
    }
    
    httpPut(url: string, requestObj: any){
        //if(this.isSessionValid()){
            this._authService.setLastServCallTime(new Date().getTime());
                if(this.isTokenExpired()==false){
                    return this.getResponseValue(this._http.put(this._resolveUrl(url),JSON.stringify(requestObj), this._getHeaderOption()));
                } else{
                return this.regenerateToken().flatMap(
                    result => {
                        var loginResponse = new LoginResponse();
                        loginResponse = JSON.parse(JSON.stringify(result));
                        var token = loginResponse.token;
                        this._authService.setOriginalToken(token);
                        return this.getResponseValue(this._http.put(this._resolveUrl(url),JSON.stringify(requestObj), this._getHeaderOption()));
                    }
                );
                }
       // }else{
            //    this.logUserOut("SESSION EXPIRED");
            //    return Observable.throw(JSON.parse(this.sessionExpErrorData));
        //}
        // return this.getResponseValue(this._http.put(this._resolveUrl(url), 
        //                 JSON.stringify(requestObj), this._getHeaderOption()));
	}
    
    httpDelete(url: string){
        if(this.isSessionValid()){
            this._authService.setLastServCallTime(new Date().getTime());
                if(this.isTokenExpired()==false){
                    return this.getResponseValue(this._http.delete(this._resolveUrl(url), this._getHeaderOption()));
                } else{
                return this.regenerateToken().flatMap(
                    result => {
                        var loginResponse = new LoginResponse();
                        loginResponse = JSON.parse(JSON.stringify(result));
                        var token = loginResponse.token;
                        this._authService.setOriginalToken(token);
                        return this.getResponseValue(this._http.delete(this._resolveUrl(url), this._getHeaderOption()));
                    }
                );
                }
        }else{
                this.logUserOut("SESSION EXPIRED");
                return Observable.throw(JSON.parse(this.sessionExpErrorData));
        }
        //return this.getResponseValue(this._http.delete(this._resolveUrl(url), this._getHeaderOption()));
	}
    
    private getResponseValue(response: Observable<Response>):Observable<any>{
        
        let responseResult = response.map(res => {
            let authorization = res.headers.get(_authorization);
            localStorage.setItem(_authorization, authorization);
            return res.json();
        }).catch((err:any) =>{
            if(err.status == 401){
                if(err._body){
                    localStorage.setItem('not-auth-content', err._body);
                }
                this._router.navigate(['web-app', 'not-auth']);
            }
            return Observable.throw(err);;
        });
        
        return responseResult;
    }
    
     _resolveUrl(url: string){
        return this.WEBSERVICE_ENDPOINT_PREFIX + url;
    }

    

    private _getHeaderOption(): RequestOptions{
        let userId = localStorage.getItem('loggedinid');
        let _headers = new Headers({ "Content-Type": "application/json" }); 
        let reportHeaders = new Headers(_headers);
        let authorization = localStorage.getItem('authorization');
        let token = localStorage.getItem('token');
        reportHeaders.append('userId', userId);
        reportHeaders.append('Authorization', token);
        reportHeaders.append('accept', "application/json");
        reportHeaders.append('clientId', "ItemMasterGUI");
        return new RequestOptions({ headers: reportHeaders });
    }

      private isTokenExpired(){
        var jwtHelper = new JwtHelper();
        var tokenExpired = jwtHelper.isTokenExpired( this._authService.getOriginalToken())
        if(tokenExpired){
            return true;
        }
        return false;
      }

      isSessionValid(){
        var diffTimeMili = Math.abs(new Date().getTime() - this._authService.getLastServCallTime());
        var diffTimeSec = Math.ceil(diffTimeMili /1000); 
        if(diffTimeSec>=this._authService.getSessionLife()){
            return false;
        }
        return true;
      }

      regenerateToken(){
         var base64Client = this._authService.getBase64EncodedClient();
         var base64LDAP = this._authService.getBase64LDAP();
         return this._http.get(this._authService._resolveAuthEndpoint(), this._authService._getAuthHeader(base64LDAP,base64Client)).map(res => res.json()).catch((error : any) => {
                var reason="Token Regenerate Failure";
                this.logUserOut(reason);
                return Observable.throw(JSON.parse(this.tokenExpErrorData));   
           });
       }

        logUserOut(reason:string){
            this._authService.setUserValidToTrue();
            this._authService.setUserRolesToEmpty();
            this._authService.resetLoggedInDetails(reason);
            this._router.navigate(['']);
        }
    
  
}