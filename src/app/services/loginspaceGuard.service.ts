import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';
import {SessionService} from './session.service';
import {CommonService} from './common.service';
import {Observable} from 'rxjs';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { CommonApiService } from './common-api.service';

@Injectable()
export class LoginSpaceGuardService implements CanActivate {
  loginToken = false;
  paramWorkspace;
  domains;
  selectedDomain;
  domainsData;

  constructor(private router: Router, private sessionService: SessionService, private commonApiService: CommonApiService,
    private commonService: CommonService, private route: ActivatedRoute) { }

  canActivate() {
    return this.checkLogin();
  }

  checkLogin(): Observable<any> {
    const url = window.location.pathname;
    if (url) {
      this.paramWorkspace = url.split('/')[1];
    }

     /** In case of routes like app.fugu.chat/login?space=jw */
    const currentWs = window.location.search.split('?space=');
    if (currentWs.length > 1) {
      this.paramWorkspace = currentWs[1];
    }
    const loggedIn = this.commonService.getCookieSubdomain('token');
    if (loggedIn && loggedIn.access_token) {
      if (!this.loginToken) {
        const obj = {
          token: loggedIn.access_token
        };

        let domain = window.location.hostname;
        domain = domain.split('.').splice(1,2).join('.');
        if (url) {
          obj['domain'] = domain;
          obj['workspace'] = this.paramWorkspace;
        }

        if (window.location.hostname == 'localhost') {
          obj['domain'] = environment.LOCAL_DOMAIN;
          // obj['workspace'] = 'spaces';
        }
        if (!obj['workspace'] || obj['workspace'] == 'signup' || obj['workspace'] == "login") {
          this.paramWorkspace = '';
          delete obj['workspace'];
        }

        
        return this.commonApiService.loginViaAccessToken(obj)
        .pipe(map((response) => {
          switch (response.statusCode) {
            case 422: //if a workspace does not exist
              if (this.commonService.isWhitelabelled) {
                this.commonService.urlToRedirect = `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/login`;
              } else {
                this.commonService.urlToRedirect = `https://${obj['domain']}/spaces`;
              }
              this.commonService.isInvalidWorkspace = true;
              break;
            case 401: //if a workspace exists but a user is not invited
              this.router.navigate([this.paramWorkspace + '/not-invited']);
              break;
          }
          const cookie_obj = {
            access_token: response.data.user_info.access_token
          };
          let allow = false;
          // if (response.data.fugu_config.is_new_conference_enabled == 0) {
          //   environment.FUGU_CONFERENCE_URL = 'conferencing.fugu.chat';
          // }
          if (response.data.whitelabel_details && response.data.whitelabel_details.properties
            && response.data.whitelabel_details.properties.is_white_labelled) {
            const data = response.data.whitelabel_details;
            this.commonApiService.updateWhitelabelConfigutaions({
              app_name: data.app_name,
              logo: data.logo,
              fav_icon: data.fav_icon,
              domain: data.domain,
              full_domain: data.full_domain,
              is_whitelabeled: true,
              branch_key: data.properties.branch_id,
              properties: data.properties,
              meet_url: data.properties.conference_link,
              colors: data.colors,
              android_app_link: data.android_app_link,
              ios_app_link: data.ios_app_link
            });
            
          }
          this.commonService.createAppSecretKeyDictionary(response.data.workspaces_info);
          if (response.data.invite_billing) {
            this.commonService.inviteBilling = response.data.invite_billing
          }
          this.domainsData = response.data.workspaces_info;
          /* get theme and update the given color */
          if (response.data.user_info.user_properties) {
            this.commonService.currentTheme.sidebar = response.data.user_info.user_properties.web_theme.theme_id;
            // this.commonService.currentTheme.bubble = response.data.user_info.user_properties.web_theme.bubble_id;
          } else {
            this.commonService.currentTheme.sidebar = 0;
            // this.commonService.currentTheme.bubble = 0;
          }
          this.commonService.snoozeArray = response.data.user_info.notification_snooze_time;
          this.commonService.getCurrentTheme();
          this.commonApiService.setSubDomainCookie(cookie_obj);
          this.sessionService.set('loginData/v1', response.data);
          this.sessionService.set('domains', response.data.workspaces_info);
          this.commonService.createDomainDictionary(response.data.workspaces_info);
          if (this.paramWorkspace) {
            for (let i = 0; i < response.data.workspaces_info.length; i++) {
              if (response.data.workspaces_info[i].workspace == this.paramWorkspace) {
                const currentSpace = response.data.workspaces_info[i];
                this.selectedDomain = response.data.workspaces_info[i];
                currentSpace.app_secret_key = currentSpace.fugu_secret_key;
                this.commonService.currentOpenSpace = currentSpace;
                const data = {
                  full_name: currentSpace.full_name,
                  user_channel: response.data.user_info.user_channel,
                  user_id: currentSpace.user_id,
                  user_unique_key: response.data.user_info.user_id,
                  en_user_id: currentSpace.en_user_id,
                  app_secret_key: currentSpace.app_secret_key,
                  is_conferencing_enabled: currentSpace.is_conferencing_enabled,
                  role: currentSpace.attendance_role,
                  user_name: currentSpace.attendance_user_name,
                  workspace: currentSpace.workspace,
                  user_image: currentSpace.user_image
                };
                if (currentSpace.user_attendance_config) {
                  data['user_attendance_config'] = {
                    punch_in_permission: currentSpace.user_attendance_config.punch_in_permission,
                    punch_out_permission: currentSpace.user_attendance_config.punch_out_permission
                  };
                }
                this.commonService.updateUserDetails(data);
                allow = true;
                  this.rearrangeDomainData(this.paramWorkspace);

              }
            }

          } else {
            const currentSpace = response.data.workspaces_info[0];
            this.selectedDomain = response.data.workspaces_info[0];
            this.paramWorkspace = response.data.workspaces_info[0].workspace;
            currentSpace.app_secret_key = currentSpace.fugu_secret_key;
            this.commonService.currentOpenSpace = currentSpace;
            this.router.navigate([currentSpace.workspace, 'messages', '0']);
            const data = {
              full_name: currentSpace.full_name,
              user_channel: response.data.user_info.user_channel,
              user_id: currentSpace.user_id,
              user_unique_key: response.data.user_info.user_id,
              en_user_id: currentSpace.en_user_id,
              app_secret_key: currentSpace.app_secret_key,
              is_conferencing_enabled: currentSpace.is_conferencing_enabled,
              role: currentSpace.attendance_role,
              user_name: currentSpace.attendance_user_name,
              workspace: currentSpace.workspace,
              user_image: currentSpace.user_image
            };
            if (currentSpace.user_attendance_config) {
              data['user_attendance_config'] = {
                punch_in_permission: currentSpace.user_attendance_config.punch_in_permission,
                punch_out_permission: currentSpace.user_attendance_config.punch_out_permission
              };
            }
            this.commonService.updateUserDetails(data);
            allow = true;
          }

          if (allow) {
            this.loginToken = true;
            return true;
          } else {
            return false;
          }
        }));
      } else {
        return of(true);
      }
    } else {
      /**
 * case when route in spacedev.officechat.io/funk3, to login directly into funk3 instead of following the normal login
 * where spaces page is opened first
 */
      const obj = { 'space': this.paramWorkspace };
      this.router.navigate(['/login'], {
        queryParams: obj
      });
        return of(false);
    }
  }

  rearrangeDomainData(space) {
  //when launching a space , bring it on top
  this.domainsData = this.domainsData.filter((item) => {
    return item.workspace != this.paramWorkspace;
  });
  if(this.selectedDomain) {
    this.domainsData.unshift(this.selectedDomain);
    this.sessionService.set('domains', this.domainsData);
    this.commonService.createDomainDictionary(this.domainsData);
  }
  }
}
