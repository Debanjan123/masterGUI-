import {
  NgModule
} from '@angular/core';
import {
  Routes,
  RouterModule,
  PreloadAllModules,
} from '@angular/router';
import { 
  APP_BASE_HREF 
} from '@angular/common';
import {
  AuthGuard
} from '../../_services/auth/auth-gaurd.service';

const webAppRoutes: Routes = [
  {
    path: '',
    redirectTo: '/web-app',
    pathMatch: 'full'
  },
  
  {
    path: 'login',
    loadChildren: '../login/login.module#LoginModule',
    canActivate: [AuthGuard]
  },
    
  {
    path: 'logout',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  {
    path: 'web-app',
    loadChildren: '../home/app-home.module#AppHomeModule', 
    canActivate: [AuthGuard]
  },
  
  {
    path: '**',
    redirectTo: '/web-app/home',
    pathMatch: 'full',
    canActivate: [AuthGuard]
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(webAppRoutes, { useHash: true, preloadingStrategy:PreloadAllModules })],
  exports: [RouterModule]
})

export class WebAppRoutingModule { }