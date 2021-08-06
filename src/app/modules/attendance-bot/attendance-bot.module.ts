import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared.module';
import {AttendanceBotComponent} from '../../components/fugu-apps-components/attendance-bot/attendance-bot.component';
import {TimePickerComponent} from '../../components/fugu-apps-components/shared/time-picker/time-picker.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import {SettingsComponent} from '../../components/fugu-apps-components/attendance-bot/components/settings/settings.component';
import {LeaveTypesComponent} from '../../components/fugu-apps-components/attendance-bot/components/leave-types/leave-types.component';
import {LeaveBalanceComponent} from '../../components/fugu-apps-components/attendance-bot/components/leave-balance/leave-balance.component';
import {PeopleComponent} from '../../components/fugu-apps-components/attendance-bot/components/people/people.component';
import {TimesheetComponent} from '../../components/fugu-apps-components/attendance-bot/components/timesheet/timesheet.component';
import {EmployeeDetailComponent}
from '../../components/fugu-apps-components/attendance-bot/components/employee-detail/employee-detail.component';
import {ConvertToHoursPipe} from '../../pipes/pipe';
const routes: Routes = [
  {
    path: '',
    component: AttendanceBotComponent,
    children: [
      {
        path: '',
        redirectTo: 'settings'
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'leave-types',
        component: LeaveTypesComponent
      },
      {
        path: 'leave-balance',
        component: LeaveBalanceComponent
      },
      {
        path: 'people',
        component: PeopleComponent
      },
      {
        path: 'timesheet',
        component: TimesheetComponent
      },
      {
        path: 'employee/:user_id',
        component: EmployeeDetailComponent
        // canActivate: [AttendanceBotGuardService]
      }
    ]
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  declarations: [
    AttendanceBotComponent,
    TimePickerComponent,
    SettingsComponent,
    LeaveTypesComponent,
    LeaveBalanceComponent,
    PeopleComponent,
    TimesheetComponent,
    EmployeeDetailComponent,
    ConvertToHoursPipe 
  ],
  exports: [RouterModule],
  providers: [
  ]
})
export class AttendanceBotModule { }
