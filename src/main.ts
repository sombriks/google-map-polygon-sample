import { bootstrapApplication } from '@angular/platform-browser';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { AppRootComponent } from './app/app-root.component';

bootstrapApplication(AppRootComponent, {
  providers: [provideBrowserGlobalErrorListeners()],
}).catch((err) => console.error(err));
