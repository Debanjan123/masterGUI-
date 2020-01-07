import { 
  NgModule
} from '@angular/core';
import { 
  BrowserModule
} from '@angular/platform-browser';
import {
  HttpModule
} from '@angular/http'


import { 
  ToolbarModule,
  SplitButtonModule,
  DialogModule,
  ListboxModule,
  DataListModule
} from 'primeng/primeng';


import {
  WebAppComponent
} from './web-app.component';
import {
  HeaderUserComponent
} from '../_header-user/header.user.component';

import {
  WaitSpinnerModule
} from '../../_components/_wait-spinner/wait-spinner.module';

import {
  WebAppRoutingModule
} from './web-app.routing';

import {
  AuthGuard
} from '../../_services/auth/auth-gaurd.service';
import {
  AuthService
} from '../../_services/auth/auth.service';


import {
  AlertMessageService,
  LocalStorageService,
  WaitSpinnerService,
  WebServiceComm,
  CommonValidation,
  ItmMasterUserRolesService
} from '../../_services/common/index';



@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    ToolbarModule,
    SplitButtonModule,
    DialogModule,
    DataListModule,
    WaitSpinnerModule,
    ListboxModule,
    WebAppRoutingModule
  ],
  
  declarations: [ 
    WebAppComponent,
    HeaderUserComponent
  ],
  
  providers: [ 
    AuthGuard,
    ItmMasterUserRolesService,
    AuthService,
    AlertMessageService,
    LocalStorageService,
    CommonValidation,
    WaitSpinnerService,
    WebServiceComm
    
  ],
  exports: [
      
  ],
  bootstrap: [ 
    WebAppComponent
  ]
})
export class WebAppModule { }