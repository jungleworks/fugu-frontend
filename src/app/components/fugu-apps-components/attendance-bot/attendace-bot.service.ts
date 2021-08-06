import { Injectable } from '@angular/core';

import {ApiService} from '../../../services/api.service';
import { Observable } from 'rxjs';

declare const moment: any;

@Injectable()
export class AttendaceBotService {
  constructor(private api: ApiService) {
  }

  createFormattedDate(date, no_of_days) {
    date.setDate(date.getDate() + no_of_days);
    return this.formatDate(date);
  }
  formatDate(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  }

  setStartTimeDateObject(string) {
    const time = string.split(':');
    const d = new Date();
    d.setHours(+time[0]);
    d.setMinutes(time[1]);
    d.setSeconds(time[2]);
    const timeOffsetInMS = d.getTimezoneOffset() * 60000;
    d.setTime(d.getTime() - timeOffsetInMS);
    // HH:mm format
    return moment(d).format('HH:mm');
  }
  returnStartTimeDateObject(string) {
    const time = string.split(':');
    const d = new Date();
    d.setHours(+time[0]);
    d.setMinutes(time[1]);
    d.setSeconds(0);
    // HH:mm:ss format
    return d.toISOString().split('T')[1].slice(0, 8);
  }

  getAllLeaveData(pageStart): Observable<any[]> {
    return ;
  }
  getUserDetails(data) {
    const  obj = {
      'url': 'attendance/getUserDetails',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  getBusinessLeaves(data) {
    const obj = {
      'url': 'attendance/getBusinessLeaves',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  editBusinessLeaves(data) {
    const obj = {
      'url': 'attendance/editBusinessLeave',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  editUserLeave(data) {
    const obj = {
      'url': 'attendance/editUserLeaves',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getAllMembers(data) {
    const obj = {
      'url': 'attendance/getMembers',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  getBusinessSettings(data) {
    const obj = {
      'url': 'attendance/getBusinessInfo',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  updateBusinessSettings(data) {
    const obj = {
      'url': 'attendance/editBusinessInfo',
      'type': 3,
      'body': data
    };
    return this.api.patchFugu(obj);
  }
  updatePunchTimings(data) {
    const obj = {
      'url': 'attendance/editUserPunchStatus',
      'type': 3,
      'body': data
    };
    return this.api.patchFugu(obj);
  }
  getTimeSheet(data) {
    const obj = {
      'url': 'attendance/getUsersTimesheet',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  editUserDetails(data) {
    const obj = {
      'url': 'attendance/editUserInfo',
      'type': 3,
      'body': data
    };
    return this.api.patchFugu(obj);
  }
  
  fetchAttendanceReport(data) {
    const obj = {
      'url': 'attendance/getBusinessReport',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }

  getAttendanceConfig(data) {
    const obj = {
      'url': 'conversation/getBotConfiguration',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
}
