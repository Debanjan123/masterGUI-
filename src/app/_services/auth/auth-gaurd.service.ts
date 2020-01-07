import {
  Injectable
} from '@angular/core';
import {
  CanActivate, 
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild 
} from '@angular/router';

import {
  AuthService,
} from './auth.service';


import {
    ItmMasterUserRolesService
} from '../../_services/common/index';



@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  private userRoles;
  private _userRolesService;
  constructor(private _authService: AuthService, 
              private _router: Router) {
          this._userRolesService = new ItmMasterUserRolesService();
    }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;   
     return this.checkLogin(url);
  }
  
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  
  checkLogin(url: string): boolean {
   
    if(!this._authService.isLoggedIn() && url== '/login'){
      return true; 
    }
     
    if(this._authService.isLoggedIn() && url== '/login'){
        this._router.navigate(['/web-app', 'home']);
        return false;
    }

    
    
    if (this._authService.isLoggedIn()) {

        this.userRoles = localStorage.getItem('userRoles');
        if(url== '/web-app'){
          this._router.navigate(['/web-app', 'home']);
        } 


        if(url == '/web-app/db-match'){
          let valid = this._userRolesService.isDBMatchMenuVisible(this.userRoles) || this._userRolesService.isSuperUser(this.userRoles); 
          if (!valid) {
              this._router.navigate(['web-app', 'not-auth']);
              return false;
           }else{
              return true;
          }
        }else if(url == '/web-app/vnd-chrg'){
           let valid = this._userRolesService.isVendChrgMenuVisible(this.userRoles) || this._userRolesService.isSuperUser(this.userRoles);  
           if (!valid) {
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/cost-history'){
           let valid = this._userRolesService.isCostHistoryMenuVisible(this.userRoles) ||this._userRolesService.isSuperUser(this.userRoles);  
           if (!valid) {
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/cost-sell'){
           let valid = this._userRolesService.isCostSellMenuVisible(this.userRoles) ||this._userRolesService.isSuperUser(this.userRoles);  
           if (!valid) {
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/enquiry'){
          let valid = this._userRolesService.isItemMasterMaintainanceMenuVisible(this.userRoles) || this._userRolesService.isSuperUser(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/addItem'){
          let valid = this._userRolesService.isItemMasterMaintainanceMenuVisible(this.userRoles) || this._userRolesService.isSuperUser(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/user-role'){
          let valid = this._userRolesService.isSuperUser(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/hazard'){
          let valid = this._userRolesService.isHazardMenuVisible(this.userRoles) || this._userRolesService.isSuperUser(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/calendar'){
          let valid = this._userRolesService.isCalendarMenuVisible(this.userRoles) || this._userRolesService.isSuperUser(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/divpls'){
          let valid = this._userRolesService.isSuperUser(this.userRoles) ||  this._userRolesService.isDivPlsMenuVisible(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/divson'){
          let valid = this._userRolesService.isSuperUser(this.userRoles) ||  this._userRolesService.isDivSonMenuVisible(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/buyer'){
          let valid = this._userRolesService.isSuperUser(this.userRoles) ||  this._userRolesService.isBuyerAuthMenuVisible(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else if(url == '/web-app/sstViewShipToVendor'){
          let valid = this._userRolesService.isSuperUser(this.userRoles) ||  this._userRolesService.isSSTViewShipToVendorMenuVisible(this.userRoles);
          if (!valid){
              this._router.navigate(['web-app', 'not-auth']);
              return false;
          }else{
              return true;
          }
        }else{
            return true; 
        }
          
    
    }
    
    // Navigate to the login page
    this._router.navigate(['/login']);
    
    return false;
  }
  

 

 
}