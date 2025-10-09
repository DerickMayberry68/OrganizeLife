import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { registerLicense } from '@syncfusion/ej2-base';

// Register Syncfusion license
registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWH9ed3ZWR2JZU0B/WUZWYEg=');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
