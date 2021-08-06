import { CommonService } from './common.service';
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import {SessionService} from './session.service';
import { CommonApiService } from './common-api.service';
import { environment } from '../../environments/environment';

@Injectable()
export class BillingGuardService implements CanActivate {
  constructor(private router: Router, private sessionService: SessionService, private commonApiService: CommonApiService,
    private commonService: CommonService
    ) { }

  canActivate() {
    return this.checkUrl();
  }

  async checkUrl() {
    const regex = /[?&]([^=#]+)=([^&#]*)/g,
      url = window.location.href,
      params = {};
    let match;
    while ((match = regex.exec(url))) {
      params[match[1]] = match[2];
    }
    const loggedIn = this.commonService.getCookieSubdomain('token');
    const obj = {
      token: loggedIn.access_token
    };
    const spaceDataAll = <any>this.sessionService.get('spaceDictionary');
    const workspace = window.location.pathname.split('/')[1];
    const spaceData = spaceDataAll[workspace];
    this.commonService.currentOpenSpace = spaceData;
    if (spaceData && spaceData.role == 'OWNER') {
      return true;
    } else if (params['access_token']) {
      const obj = {
        token: decodeURIComponent(params['access_token'])
      };
      const bool = await this.loginViaToken(obj);
      return bool;
    } else {
      this.router.navigate(['/' + spaceData.workspace_name, '/messages']);
      return false;
    }
  }
  loginViaToken(obj): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const domain = window.location.hostname.split('.').splice(1,2).join('.');
      obj['domain'] = domain;
      obj['workspace'] = window.location.pathname.split('/')[1];

      if (window.location.hostname == 'localhost') {
        obj['domain'] = environment.LOCAL_DOMAIN;
      }

      if(!obj['workspace'] || obj['workspace'] == 'signup' || obj['workspace'] == "login") {
        delete obj['workspace'];
      }
 
      this.commonApiService.loginViaAccessToken(obj)
        .subscribe((response) => {
          const cookie_obj = {
            access_token: response.data.user_info.access_token
          };
          this.commonApiService.setSubDomainCookie(cookie_obj);
          // const workspace_name = window.location.hostname.split('.')[0];
          const workspace_name = window.location.pathname.split('/')[1];
          for (let i = 0; i < response.data.workspaces_info.length; i++) {
            if (response.data.workspaces_info[i].workspace == workspace_name) {
              const currentSpace = response.data.workspaces_info[i];
              // this.sessionService.set('currentSpace', currentSpace);
              this.commonService.currentOpenSpace = currentSpace;
              resolve(true);
              break;
            }
          }
          resolve(false);
        });
    });
  }
}
