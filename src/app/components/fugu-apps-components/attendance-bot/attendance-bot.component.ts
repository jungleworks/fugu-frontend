import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { AttendaceBotService } from './attendace-bot.service';
import { CommonService } from '../../../services/common.service';


let userData;
@Component({
  selector: 'app-attendance-bot',
  templateUrl: './attendance-bot.component.html',
  styleUrls: ['./attendance-bot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceBotComponent implements OnInit {
  userRole;
  spaceData;
  settingsOptions = [
    {
      name: 'Basic Settings',
      icon: 'fa fa-cog',
      link: 'settings',
      id: 1,
      role: ['ADMIN', 'HR', 'OWNER']
    },
    {
      name: 'People',
      icon: 'fa fa-user',
      link: 'people',
      id: 2,
      role: ['ADMIN', 'HR', 'OWNER', 'MANAGER']
    },
    {
      name: 'Leave Types',
      icon: 'fa fa-suitcase',
      link: 'leave-types',
      id: 3,
      role: ['ADMIN', 'HR', 'OWNER']
    },
    {
      name: 'Leave Balances',
      icon: 'fa fa-users',
      link: 'leave-balance',
      id: 4,
      role: ['ADMIN', 'HR', 'OWNER', 'MANAGER']
    }
  ];
  constructor(private sessionService: SessionService, private service: AttendaceBotService, private cdRef: ChangeDetectorRef,
    private commonService: CommonService ) {}

  ngOnInit() {
    const user_details = this.sessionService.get('user_details_dict')
    userData = user_details[window.location.pathname.split('/')[1]];

    const attObj = {
      en_user_id: this.commonService.userDetails.en_user_id,
    }
    this.service.getAttendanceConfig(attObj).subscribe(res => {
      userData.role  =   res.data.attendance_role;
      localStorage.setItem('attendance_role', userData.role);
      localStorage.setItem('attendance_user_name', res.data.attendance_user_name);
      if (userData.role) {
        this.userRole = userData.role;
      } else {
        this.userRole = 'ADMIN';
      }
      this.setRoles();

    });
  }

  setRoles() {
    this.settingsOptions =  this.settingsOptions.filter((member) => {
      return member.role.includes(this.userRole);
    });
    this.cdRef.detectChanges();
  }

}
