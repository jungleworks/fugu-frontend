import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RedirectInvitationService} from '../../components/redirect-invitation/redirect-invitation.service';
import {RedirectInvitationComponent} from '../../components/redirect-invitation/redirect-invitation.component';
import {SharedModule} from '../shared.module';
import {RouterModule, Routes} from '@angular/router';
import { RedirectCalendarComponent } from '../../components/redirect-calendar/redirect-calendar.component';
import { RedirectCalendarService } from '../../components/redirect-calendar/redirect-calendar.service';
const routes: Routes = [
  {
    path: '',
    component: RedirectCalendarComponent
  }
];
@NgModule({
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [RedirectCalendarComponent],
  exports: [RouterModule],
  providers: [RedirectCalendarService],
})
export class CalendarRedirectModule {}
