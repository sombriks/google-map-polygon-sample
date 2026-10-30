import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideBrowserGlobalErrorListeners } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [provideBrowserGlobalErrorListeners()],
}).catch((err) => console.error(err));
