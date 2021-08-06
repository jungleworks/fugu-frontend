import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRoute, Params} from '@angular/router';
import {CommonService} from './common.service';
import {SessionService} from '../../../src/app/services/session.service';
import * as CryptoJS from 'crypto-js';
import { CommonApiService } from './common-api.service';

@Injectable()
export class SpaceGuardService implements CanActivate {

  constructor(private router: Router, private sessionService: SessionService, private activatedRoute: ActivatedRoute,
              private commonService: CommonService, private commonApiService: CommonApiService) { }

  canActivate() {
    return this.checkLogin();
  }

 getFuguToken(authTokenUrl) {
  return new Promise((resolve, reject) => {
       const header = {
        auth_token: authTokenUrl
      }
    this.commonApiService.getFuguToken({}, header).subscribe((response) => {
      resolve(response);
    })
  })
  }

   async checkLogin() {
    const loggedIn = this.commonService.getCookieSubdomain('token');
    /**
     * If logged in externally (through jungleworks page), open the new account instead of the old one, so updating the access_token
     */
    const tokenUrl =  window.location.search.split('?token=');
    const authTokenUrl =  window.location.search.split('?at=');
    if (authTokenUrl.length > 1) {
      const obj = {
        auth_token: authTokenUrl[1]
      }
     const response :any = await this.getFuguToken(authTokenUrl[1]);
      const cookie_obj = {
        access_token: response.data.access_token
      };
      this.commonApiService.setSubDomainCookie(cookie_obj);
    }
    if (tokenUrl.length > 1) {
      const newAccessToken = CryptoJS.AES.decrypt(decodeURIComponent(tokenUrl[1]).replace(/ /g, '+'), 'keytoencrypt');
      const cookie_obj = {
        access_token: newAccessToken.toString(CryptoJS.enc.Utf8)
      };
      if (cookie_obj.access_token != loggedIn.access_token) {
        this.commonApiService.setSubDomainCookie(cookie_obj);
      }
    }
    if (!loggedIn.access_token) {
      const regex = /[?&]([^=#]+)=([^&#]*)/g,
        path = window.location.href,
        params = {};
      let match;
      while ((match = regex.exec(path))) {
        params[match[1]] = match[2];
      }
      if (params['token']) {
        const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(params['token'])
          .replace(/ /g, '+'), 'keytoencrypt');
        const cookie_obj = {
          access_token: decrypted.toString(CryptoJS.enc.Utf8)
        };
        this.commonApiService.setSubDomainCookie(cookie_obj);
        this.router.navigate(['/spaces']);
        return false;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      return true;
    }
  }
}
