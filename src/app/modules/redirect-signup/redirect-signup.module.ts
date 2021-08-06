import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared.module';
import { RedirectSignupComponent } from '../../components/redirect-signup/redirect-signup.component';
import { RedirectSignupService } from '../../components/redirect-signup/redirect-signup.service';

const routes: Routes = [
  {
    path: '',
    component: RedirectSignupComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    RedirectSignupComponent
  ],
  exports: [RouterModule],
  providers: [
    RedirectSignupService
  ]
})
export class RedirectSignupModule { }
