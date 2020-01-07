import {
  platformBrowserDynamic
} from '@angular/platform-browser-dynamic';
import {
  enableProdMode
} from '@angular/core';

import {
  WebAppModule
} from '../_main-web-app/web-app/web-app.module';

declare let process: any;

if (process.env.ENV === 'production') {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(WebAppModule);
