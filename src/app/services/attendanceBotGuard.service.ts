import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import {SessionService} from './session.service';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonService } from './common.service';

@Injectable()
export class AttendanceBotGuardService implements CanActivate {
  loginToken = false;
  constructor(public commonService: CommonService, private sessionService: SessionService) { }

  canActivate() {
    return this.checkUrl();
  }

  checkUrl() {
    const user_details = this.sessionService.get('user_details_dict')
    const userData = user_details[window.location.pathname.split('/')[1]];
    if (userData == 'ADMIN') {
      return false;
    }
  }
}
