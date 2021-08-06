import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {InvitePasswordService} from '../../components/invite-password/invite-password.service';
import {SharedModule} from '../shared.module';
import {InvitePasswordComponent} from '../../components/invite-password/invite-password.component';
const routes: Routes = [
  {
    path: '',
    component: InvitePasswordComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    InvitePasswordComponent
  ],
  exports: [RouterModule],
  providers: [
    InvitePasswordService
  ]
})
export class SetPasswordModule { }
