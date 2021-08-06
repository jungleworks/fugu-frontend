import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginComponent} from '../../components/login/login.component';
import {LoginGuardService} from '../../services/loginGuard.service';
import {SharedModule} from '../shared.module';
import {RouterModule, Routes} from '@angular/router';
import {ForgotPasswordComponent} from '../../components/forgot-password/forgot-password.component';
const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    LoginComponent
  ],
  exports: [RouterModule],
  providers: [
    LoginGuardService
  ]
})
export class LoginModule { }
