import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule, Injectable} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from './modules/shared.module';
import {CommonService} from './services/common.service';
import {SessionService} from './services/session.service';
import {ApiService} from './services/api.service';
import {ValidationService} from './services/validation.service';
import {LoaderService} from './services/loader.service';
import {LoginService} from './components/login/login.service';
import {MessageService} from './services/message.service';
import {GiphyService} from './services/giphy.service';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {JoinComponent} from './components/join/join.component';
import {JoinService} from './components/join/join.service';
import {JoinViaDomainComponent} from './components/join-via-domain/join-via-domain.component';
import {NotInvitedComponent} from './components/not-invited/not-invited.component';
import * as Raven from 'raven-js';
import {LocalStorageService} from './services/localStorage.service';
import {ExpiredBillingComponent} from './components/expired-billing/expired-billing.component';
import {PrivacyPolicyComponent} from './components/privacy-policy/privacy-policy.component';
import {SignupComponent} from './components/signup/signup.component';
import {SignupService} from './components/signup/signup.service';
import {SpacesComponent} from './components/spaces/spaces.component';
import {SpaceGuardService} from './services/spaceGuard.service';
import {RedirectComponent} from './components/redirect/redirect.component';
import {CommonApiService} from './services/common-api.service';
import {SignupGuardService} from './services/signupGuard.service';

if (environment.production) {
  Raven.config('https://1e4625de3ee34b31a15482821fc7ab6d@sentry.tookan.io/4').install();
}

@Injectable()
export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    console.error(err);
    Raven.captureException(err, {
      allowDuplicates: false
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    JoinComponent,
    JoinViaDomainComponent,
    NotInvitedComponent,
    ExpiredBillingComponent,
    PrivacyPolicyComponent,
    SignupComponent,
    SpacesComponent,
    RedirectComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    // ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    SharedModule
  ],
  providers: [
    CommonService,
    ApiService,
    MessageService,
    SessionService,
    LocalStorageService,
    LoaderService,
    ValidationService,
    LoginService,
    JoinService,
    GiphyService,
    SignupService,
    SpaceGuardService,
    SignupGuardService,
    CommonApiService,
    {provide: ErrorHandler, useClass: RavenErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
