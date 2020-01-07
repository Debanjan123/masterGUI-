import { NgModule }                         from '@angular/core';
import { Routes }           from '@angular/router';
import { RouterModule }     from '@angular/router';

import { LandingPageComponent } from './landing-page.component';

const itemMasterLandingRoutes: Routes = [
  
  {
    path: '',
    component: LandingPageComponent
  }
];

@NgModule({
  imports: [
        RouterModule.forChild(itemMasterLandingRoutes)
  ],
  
  declarations: [
      LandingPageComponent
  ],
  
  providers: [  ]
  
})

export class LandingModule { }