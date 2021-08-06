import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import {ApiService} from '../../services/api.service';
import {CommonService} from '../../services/common.service';

@Injectable()
export class LoginService {
  constructor(private api: ApiService,public commonService:CommonService) {
  }

  login(data) {
    data.time_zone = this.commonService.getTimeZone();
    const obj = {
      'url': 'user/v1/userLogin',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
  userLoginNew(data) {
    const obj = {
      'url': 'get_login_otp',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
  forgotPassword(data) {
    
    const  obj = {
      'url': 'user/resetPasswordRequest',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
