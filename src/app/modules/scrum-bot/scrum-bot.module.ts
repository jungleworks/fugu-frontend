import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { RouterModule, Routes } from '@angular/router';
import { ScrumBotService } from '../../services/scrum-bot.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DashboardComponent } from '../../components/fugu-apps-components/scrum-bot/components/dashboard/dashboard.component';
import { ScrumBotComponent } from '../../components/fugu-apps-components/scrum-bot/components/scrum-bot/scrum-bot.component';
import { ScrumComponent } from '../../components/fugu-apps-components/scrum-bot/scrum.component';
import { HistoryComponent } from '../../components/fugu-apps-components/scrum-bot/components/history/history.component';
import { ScrumBotGuardService } from '../../services/scrumBotGuard.service';
import { UTCLocalPipe } from '../../pipes/pipe';


const routes: Routes = [
  {
    path: '',
    component: ScrumComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [ScrumBotGuardService]
      },
      {
        path: 'history',
        component: HistoryComponent
      },
      {
        path: 'report/:reportTab',
        component: ScrumBotComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    ScrumComponent,
    DashboardComponent,
    ScrumBotComponent,
    HistoryComponent,
    UTCLocalPipe
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatNativeDateModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: [ScrumBotService,
    ScrumBotGuardService,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }]
})
export class ScrumBotModule { }
