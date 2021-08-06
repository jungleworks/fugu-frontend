import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {RedirectTokenComponent} from '../../components/redirect-token/redirect-token.component';
import {SharedModule} from '../shared.module';

const routes: Routes = [
  {
    path: '',
    component: RedirectTokenComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    RedirectTokenComponent
  ],
  exports: [RouterModule],
  providers: [
  ]
})
export class RedirectTokenModule { }
