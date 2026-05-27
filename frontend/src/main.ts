import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/presentation/app.component';
import { appConfig } from './app/presentation/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
