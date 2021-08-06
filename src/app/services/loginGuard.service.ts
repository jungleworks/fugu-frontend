import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRoute, Params} from '@angular/router';
import {SessionService} from './session.service';
import {CommonService} from './common.service';
import * as CryptoJS from 'crypto-js';
import { CommonApiService } from './common-api.service';
import { environment } from '../../environments/environment';

@Injectable()
export class LoginGuardService implements CanActivate {
  spaceData
  currentWorkspace;
  domains;
  selectedDomain;
  validWorkspace;
  constructor(private router: Router, private sessionService: SessionService,
              private activatedRoute: ActivatedRoute,
              private commonApiService: CommonApiService,
              private commonService: CommonService) { }

  canActivate() {
    this.activatedRoute.params.subscribe(
      (params) => {
        if (params && params['space']) {
          this.currentWorkspace = params['space'];
        }
      });
    return this.checkLogin();
  }

  checkLogin() {
    const url = window.location.pathname;
    if(url) {
      this.currentWorkspace = url.split('/')[1];
    }

    /** In case of routes like app.fugu.chat/login?space=jw */
    const currentWs = window.location.search.split('?space=');
    if (currentWs.length > 1) {
      this.currentWorkspace = currentWs[1];
    }
    const loggedIn = this.commonService.getCookieSubdomain('token');
     /**
     * If logged in with params in the url, lgout the previous windows and login to fugu
     */
    const urlEmail =  window.location.search.split('?email=');
    const urlPhone =  window.location.search.split('?number=');
    if (urlEmail.length > 1 || urlPhone.length > 1 ) {
      const isRedirect = true;
      this.commonApiService.logout(isRedirect);
      return true;
    }

    if (loggedIn && loggedIn.access_token) {
      const url = window.location.hostname;
      const domain = window.location.hostname.split('.').splice(1,2).join('.');



      this.domains = this.sessionService.get('domains');
      if(this.domains && this.domains.length) {
        if(this.currentWorkspace) {
          this.domains.forEach((item) => {
            if(item.workspace == this.currentWorkspace) {
              this.selectedDomain = item;
              this.validWorkspace = true;
            }
          });
          if(!this.validWorkspace || !this.selectedDomain) {
          this.currentWorkspace = this.domains[0].workspace;
          this.selectedDomain = this.domains[0];
          this.validWorkspace = true;
          }
        } else {
          this.currentWorkspace = this.domains[0].workspace;
          this.selectedDomain = this.domains[0];
          this.validWorkspace = true;
        }

        if ( this.validWorkspace = true) {
          this.setInfoDetails(this.selectedDomain);
          this.router.navigate([this.currentWorkspace, 'messages', '0']);
        } else {
          this.router.navigate(['/login']);
        }

      } else {
        const obj = {
          domain: domain,
          token: loggedIn.access_token
        };
        if (url == 'localhost') {
          obj['domain'] = environment.LOCAL_DOMAIN;
        }
        this.loginViaTokenApi(obj);
        // this.router.navigate(['/spaces']);
        // this.router.navigate(['/signup', 9]);
        return false;
      }
     } else {
      //not logged in
      if (window.location.toString().indexOf('token') > -1) {
        const pos = window.location.toString().indexOf('token');
        const endPos = window.location.toString().indexOf('&');
        const token = window.location.toString().substring(pos + 6, endPos != -1 ? endPos : window.location.toString().length);
        //Decrypt Message
        const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(token).replace(/ /g, '+'), 'keytoencrypt');
        const obj = {
          token: decrypted.toString(CryptoJS.enc.Utf8)
        };
        const url = window.location.hostname;
        const domain = window.location.hostname.split('.').splice(1, 2).join('.');
        if (url) {
          obj['domain'] = domain;
          obj['workspace'] = this.currentWorkspace || window.location.pathname.split('/')[1];
        }
        if (url == 'localhost') {
          obj['domain'] = environment.LOCAL_DOMAIN;
        }
        if (!obj['workspace'] || obj['workspace'] == 'signup' || obj['workspace'] == 'login') {
          delete obj['workspace'];
        }

        

        this.commonApiService.loginViaAccessToken(obj)
            .subscribe((response) => {
              const cookie_obj = {
                access_token: response.data.user_info.access_token
              };
              if (response.data.whitelabel_details && response.data.whitelabel_details.properties
                && response.data.whitelabel_details.properties.is_white_labelled) {
                const data = response.data.whitelabel_details;
                this.commonApiService.updateWhitelabelConfigutaions({
                  app_name: data.app_name,
                  logo: data.logo,
                  fav_icon: data.fav_icon,
                  full_domain: data.full_domain,
                  domain: data.domain,
                  is_whitelabeled: true,
                  branch_key: data.properties.branch_id,
                  properties: data.properties,
                  meet_url: data.properties.conference_link,
                  colors: data.colors,
                  android_app_link: data.android_app_link,
                  ios_app_link: data.ios_app_link
                });
              }
              this.commonApiService.setSubDomainCookie(cookie_obj);
              this.sessionService.set('loginData/v1', response.data);
              this.sessionService.set('domains', response.data.workspaces_info);
              this.commonService.createDomainDictionary(response.data.workspaces_info);
              // if (response.data.fugu_config.is_new_conference_enabled == 0) {
              //   environment.FUGU_CONFERENCE_URL = 'conferencing.fugu.chat';
              // }
              if(this.currentWorkspace) {
                for (let i = 0; i < response.data.workspaces_info.length; i++) {
                  if (response.data.workspaces_info[i].workspace == this.currentWorkspace) {
                    const currentSpace = response.data.workspaces_info[i];
                    this.commonService.currentOpenSpace = currentSpace;
                    break;
                  }
                }
              } else {
                if(response.data.workspaces_info && response.data.workspaces_info[0]) {
                  const currentSpace = response.data.workspaces_info[0];
                  this.currentWorkspace = response.data.workspaces_info[0].workspace;
                  this.commonService.currentOpenSpace = currentSpace;
                } else {
                  this.router.navigate(['/spaces']);
                  return false;
                }

              }

            });
      } else {
        return true;
      }
    }
  }

  loginViaTokenApi(obj) {
    this.commonApiService.loginViaAccessToken(obj)
    .subscribe((response) => {
      const cookie_obj = {
        access_token: response.data.user_info.access_token
      };
      if (response.data.whitelabel_details && response.data.whitelabel_details.properties
        && response.data.whitelabel_details.properties.is_white_labelled) {
        const data = response.data.whitelabel_details;
        this.commonApiService.updateWhitelabelConfigutaions({
          app_name: data.app_name,
          logo: data.logo,
          fav_icon: data.fav_icon,
          full_domain: data.full_domain,
          domain: data.domain,
          is_whitelabeled: true,
          properties: data.properties,
          branch_key: data.properties.branch_id,
          colors: data.colors,
          android_app_link: data.android_app_link,
          ios_app_link: data.ios_app_link
        });
      }
      this.commonApiService.setSubDomainCookie(cookie_obj);
      this.sessionService.set('loginData/v1', response.data);
      this.sessionService.set('domains', response.data.workspaces_info);
      this.commonService.createDomainDictionary(response.data.workspaces_info);

      if(this.currentWorkspace) {
        for (let i = 0; i < response.data.workspaces_info.length; i++) {
          if (response.data.workspaces_info[i].workspace == this.currentWorkspace) {
            const currentSpace = response.data.workspaces_info[i];
            this.commonService.currentOpenSpace = currentSpace;
            this.router.navigate([this.currentWorkspace, 'messages', '0']);
            break;
          }
        }
      } else {
        if(response.data.workspaces_info && response.data.workspaces_info[0]) {
          const currentSpace = response.data.workspaces_info[0];
          this.currentWorkspace = response.data.workspaces_info[0].workspace;
          this.commonService.currentOpenSpace = currentSpace;
          this.router.navigate([this.currentWorkspace, 'messages', '0']);
        } else {
          if (response.data.workspaces_info.length) {
            this.router.navigate(['/spaces']);
          } else {
            this.router.navigate(['/signup', 9]);
          }
          return false;
        }

      }

    });
  }

  setInfoDetails(domain) {
    const loginData = this.sessionService.get('loginData/v1')['user_info'];
    this.commonService.currentOpenSpace = domain;
    this.commonService.spaceDataEmit();
    const data = {
      full_name: domain.full_name,
      user_channel: loginData.user_channel,
      user_id: domain.user_id,
      user_unique_key: loginData.user_id,
      en_user_id: domain.en_user_id,
      app_secret_key: domain.fugu_secret_key,
      is_conferencing_enabled: domain.is_conferencing_enabled,
      role: domain.attendance_role,
      user_name: domain.attendance_user_name,
      workspace: domain.workspace
    };
    if (domain.user_attendance_config) {
      data['user_attendance_config'] = {
        punch_in_permission: domain.user_attendance_config.punch_in_permission,
        punch_out_permission: domain.user_attendance_config.punch_out_permission
      };
    }
    this.commonService.updateUserDetails(data);
  }
}
