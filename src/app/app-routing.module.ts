import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginGuardService} from './services/loginGuard.service';
import {MessageAuthGuardService} from './services/messageAuthGuard.service';
import {JoinComponent} from './components/join/join.component';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {JoinViaDomainComponent} from './components/join-via-domain/join-via-domain.component';
import {NotInvitedComponent} from './components/not-invited/not-invited.component';
import {BillingGuardService} from './services/billingGuard.service';
import {PrivacyPolicyComponent} from './components/privacy-policy/privacy-policy.component';
import {SignupComponent} from './components/signup/signup.component';
import {SpacesComponent} from './components/spaces/spaces.component';
import {SpaceGuardService} from './services/spaceGuard.service';
import {RedirectComponent} from './components/redirect/redirect.component';
import {LoginSpaceGuardService} from './services/loginspaceGuard.service';
import {SignupGuardService} from './services/signupGuard.service';
import {PaymentsComponent} from './components/payments/payments.component';

const routes: Routes = [
  {
    path: 'forgotPassword',
    component: ForgotPasswordComponent
  },
  {
    path: 'oauth_sucess',
    loadChildren: () => import('./modules/calendar-redirect/calendar-redirect.module').then(m => m.CalendarRedirectModule)
  },
  {
    path: ':space/calling',
    loadChildren: () => import('./modules/video-call/video-call.module').then(m => m.VideoCallModule)
    // canActivate: [MessageAuthGuardService]
  },
  {
    path: ':space/conference',
    loadChildren: () => import('./modules/video-call/calling.module').then(m => m.CallingModule)
  },
  {
    path: 'conference',
    loadChildren: () => import('./modules/video-call/calling.module').then(m => m.CallingModule)
  },
  {
    path: ':space/messages/:channelId',
    loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule),
    canActivate: [LoginSpaceGuardService]
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule),
    canActivate: [LoginGuardService]
  },
  {
    path: 'signup/:step',
    component: SignupComponent,
    canActivate: [SignupGuardService]
  },
  {
    path: 'signup',
    redirectTo: 'signup/1'
  },
  {
    path: 'spaces',
    component: SpacesComponent,
    canActivate: [SpaceGuardService]
  },

  {
    path: ':space/redirectInvitation',
    loadChildren: () => import('./modules/invite-redirect/invite-redirect.module').then(m => m.InviteRedirectModule)
  },

  {
    path: 'redirectToken',
    loadChildren: () => import('./modules/redirect-token/redirect-token.module').then(m => m.RedirectTokenModule)
  },
  {
    path: 'redirectSignup',
    loadChildren: () => import('./modules/redirect-signup/redirect-signup.module').then(m => m.RedirectSignupModule)
  },
  {
    path: ':space/apps',
    loadChildren: () => import('./modules/fugu-apps/fugu-apps.module').then(m => m.FuguAppsModule),
    canActivate: [MessageAuthGuardService]
  },
  {
    path: ':space/scrum-bot',
    loadChildren: () => import('./modules/scrum-bot/scrum-bot.module').then(m => m.ScrumBotModule)
  },
  {
    path: ':space/not-invited',
    component: NotInvitedComponent
  },
  {
    path: 'setPassword',
    loadChildren: () => import('./modules/set-password/set-password.module').then(m => m.SetPasswordModule)
  },
  {
    path: ':space/join',
    component: JoinComponent
  },
  {
    path: 'joinviadomain',
    component: JoinViaDomainComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'payment',
    component: PaymentsComponent
  },
  {
    path: ':space/meet',
    loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule),
    canActivate: [LoginSpaceGuardService]
  },
  {
    path: ':space/billing',
    loadChildren: () => import('./modules/billing/billing.module').then(m => m.BillingModule),
    canActivate: [BillingGuardService]
  },
  {
    path: ':space',
    redirectTo: ':space/messages'
  },
  {
    path: ':space/messages',
    redirectTo: ':space/messages/0'
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
    canActivate: [LoginGuardService]
  },
  {
    path: '**',
    component: RedirectComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
