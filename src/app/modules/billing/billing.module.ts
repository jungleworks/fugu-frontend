import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared.module';
import { BillingComponent } from '../../components/billing/billing.component';
import { BillingService } from '../../components/billing/billing.service';
const routes: Routes = [
  {
    path: '',
    component: BillingComponent
  },
  {
    path: ':appId',
    component: BillingComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    BillingComponent
  ],
  exports: [RouterModule],
  providers: [BillingService]
})
export class BillingModule { }
