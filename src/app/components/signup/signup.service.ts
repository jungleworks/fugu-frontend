import { Injectable } from '@angular/core';
import {ApiService} from '../../services/api.service';
import {CommonService} from '../../services/common.service';

@Injectable()
export class SignupService {

  constructor(private api:  ApiService,public commonService:CommonService) { }

  signup(data) {
    const obj = {
      'url': 'workspace/v1/signup',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
  createWorkspace(data) {
    const obj = {
      'url': 'workspace/createWorkspace',
      'type': 7,
      'body': data
    };
    return this.api.postOc(obj);
  }
  verifyOTP(data) {
    const obj = {
      'url': 'workspace/v1/verifyOtp',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
  verifyNewOTP(data) {
    data.time_zone = this.commonService.getTimeZone();
    const obj = {
      'url': 'validate_login_otp',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
  verifyGoogleUser(data) {
    const obj = {
      'url': 'user/verifyAndRegisterGoogleUser',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
  registerPhoneNumber(data) {
    const obj = {
      'url': 'user/registerPhoneNumber',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }

  setPassword(data) {
    const obj = {
      'url': 'workspace/v1/setPassword',
      'type': 1,
      'body': data
    };
    return this.api.postOc(obj);
  }
  updateUserAndWorkspaceDetails(data) {
    const obj = {
      'url': 'user/updateUserAndWorkspaceDetails',
      'type': 7,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getContacts(data) {
    const obj = {
      'url': 'user/getUserInvites',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  inviteViaEmail(data) {
    const obj = {
      'url': 'user/inviteUser',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  allowedWorkspace(data) {
    const obj = {
      'url': 'workspace/addPublicEmailDomain',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getLocation() {
    return this.api.getNative('https://ip.tookanapp.com:8000/requestCountryCodeGeoIP2');
  }
  getUserContactsAndGroups(data) {
    const obj = {
      'url': 'user/getUserContacts',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  googleSignup(data) {
    const obj = {
      'url': 'workspace/googleSignup',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
  userLogin(data) {
    data.time_zone = this.commonService.getTimeZone();
    const obj = {
      'url': 'user/v2/userLogin',
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
}
