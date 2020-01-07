import { 
  Component 
}  from '@angular/core';

@Component({
  template: '<H1>{{ homePageMessage }} </H1>'
})

export class LandingPageComponent {
 
 private homePageMessage = "Welcome to Item Master - GUI";
 
 constructor() {}
 
  ngOnInit(){
    
  }
  
}