import {
  NgModule
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import { 
  FormsModule 
} from '@angular/forms';
import {
  Routes,
  RouterModule
} from '@angular/router';

import {
  MessagesModule,
  PanelModule,
  ButtonModule,
  InputTextModule
} from 'primeng/primeng';

import {
  LoginComponent
} from './login.component';

const loginModuleRoutes: Routes = [
  {
    path: '',
    component: LoginComponent
  }
];

@NgModule({
  imports: [
    CommonModule, 
    FormsModule,
    
    MessagesModule,
    PanelModule,
    ButtonModule,
    InputTextModule,
       
    RouterModule.forChild(loginModuleRoutes)
  ],
  
  declarations: [
      LoginComponent 
  ],
  
  providers: [ 
    
   ]
  
})

export class LoginModule { }