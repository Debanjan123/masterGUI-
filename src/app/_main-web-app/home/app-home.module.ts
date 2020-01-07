import {
  NgModule
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  Routes,
  RouterModule
} from '@angular/router';

import {
  ConfirmDialogModule,
  ConfirmationService,
  PanelMenuModule,
  MenubarModule
} from 'primeng/primeng';

import {
  AlertMessageModule
} from '../../_components/_alert-message/alert-message.module';


import {
  AppNavigationComponent
} from './navigation/app-navigation.component';
import {
  AppHomeComponent
} from './app-home.component';
import {
  NotAuthComponent
} from '../not-auth/not-auth.component';

import {
  LandingPageComponent
} from '../landing-page/landing-page.component';

import {
  AuthGuard
} from '../../_services/auth/auth-gaurd.service';

const appHomeRoutes: Routes = [

  {
    path: '',
    component: AppHomeComponent,
    children: [
      {
        path: 'home',
        loadChildren: '../landing-page/landing-page.module#LandingModule'

      },
      {
        path: 'db-match',
        loadChildren: '../../_components/_itm-mstr-gui/db-match/db-match.module#DBMatchModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'vnd-chrg',
        loadChildren: '../../_components/_itm-mstr-gui/vnd-chrg/vnd-chrg.module#VendorChargeModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'cost-history',
        loadChildren: '../../_components/_itm-mstr-gui/cost-history/cost-history.module#CostHistoryModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'cost-sell',
        loadChildren: '../../_components/_itm-mstr-gui/cost-sell/cost-sell.module#CostSellModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'enquiry',
        loadChildren: '../../_components/_itm-mstr-gui/enquiry/enquiry.module#EnquiryModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'addItem',
        loadChildren: '../../_components/_itm-mstr-gui/addItem/addItem.module#AddItemModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'user-role',
        loadChildren: '../../_components/_itm-mstr-gui/user-role/user-role.module#UserRoleModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'hazard',
        loadChildren: '../../_components/_itm-mstr-gui/hazard/hazard.module#HazardModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'calendar',
        loadChildren: '../../_components/_itm-mstr-gui/hsCalendar/hsCalendar.module#HsCalendarModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'divson',
        loadChildren: '../../_components/_itm-mstr-gui/div-son/divson.module#DivSonModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'divpls',
        loadChildren: '../../_components/_itm-mstr-gui/divPls/divPls.module#DivPlsModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'buyer',
        loadChildren: '../../_components/_itm-mstr-gui/buyerAuth/buyerAuth.module#BuyerAuthModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'sstViewShipToVendor',
        loadChildren: '../../_components/_itm-mstr-gui/sstViewShipToVendor/sstViewShipToVendor.module#SSTViewShipToVendorModule',
        canActivate: [AuthGuard]
      },
      {
        path: 'not-auth',
        component: NotAuthComponent

      }
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,

    ConfirmDialogModule,
    PanelMenuModule,
    MenubarModule,

    AlertMessageModule,


    RouterModule.forChild(appHomeRoutes)
  ],

  declarations: [
    AppHomeComponent,
    AppNavigationComponent,
    NotAuthComponent
  ],

  providers: [
    ConfirmationService
  ]

})

export class AppHomeModule { }