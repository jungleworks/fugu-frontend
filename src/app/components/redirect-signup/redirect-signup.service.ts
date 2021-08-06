import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
import {CommonService} from '../../services/common.service';

@Injectable()
export class RedirectSignupService {

  constructor(
    private api: ApiService,public commonService:CommonService
  ) { }
  verifyNewOTP(data) {
    data.time_zone = this.commonService.getTimeZone();
    const obj = {
      'url': 'validate_login_otp',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
