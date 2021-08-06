import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RedirectInvitationService} from '../../components/redirect-invitation/redirect-invitation.service';
import {RedirectInvitationComponent} from '../../components/redirect-invitation/redirect-invitation.component';
import {SharedModule} from '../shared.module';
import {RouterModule, Routes} from '@angular/router';
const routes: Routes = [
  {
    path: '',
    component: RedirectInvitationComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    RedirectInvitationComponent
  ],
  exports: [RouterModule],
  providers: [
    RedirectInvitationService
  ]
})
export class InviteRedirectModule { }
