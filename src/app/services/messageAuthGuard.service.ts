import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';
import {SessionService} from './session.service';
import {CommonService} from './common.service';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonApiService } from './common-api.service';

@Injectable()
export class MessageAuthGuardService implements CanActivate {
  loginToken = false;
  currentWorkspace;
  constructor(private router: Router,
    private commonApiService: CommonApiService,
    private sessionService: SessionService, private commonService: CommonService, private route: ActivatedRoute) { }

  canActivate() {
    return this.checkLogin();
  }

  checkLogin(): Observable<any> {
    this.route.params.subscribe(
      (params) => {
        if (params && params['space']) {
          this.currentWorkspace = params['space'];
        }
      });

    const loggedIn = this.commonService.getCookieSubdomain('token');
    if (loggedIn.access_token) {
      if (!this.loginToken) {
        const obj = {
          token: loggedIn.access_token
        };
        const url = window.location.pathname;
        if (url) {
          this.currentWorkspace = url.split('/')[1];
        }
        let domain = window.location.hostname;
        domain = domain.split('.').splice(1, 2).join('.');
        if (url) {
          obj['domain'] = domain;
          obj['workspace'] = this.currentWorkspace;
        }

        if (window.location.hostname == 'localhost') {
          obj['domain'] = environment.LOCAL_DOMAIN;
          // obj['workspace'] = environment.LOCAL_SPACE;
        }
        if (!obj['workspace'] || obj['workspace'] == 'signup' || obj['workspace'] == 'login') {
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
                // this.router.navigate(['../not-invited'], { relativeTo: this.route });
                this.router.navigate([this.currentWorkspace + '/not-invited']);
                break;
            }
            const cookie_obj = {
              access_token: response.data.user_info.access_token
            };
            let allow = false;
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
                colors: data.colors,
                meet_url: data.properties.conference_link,
                android_app_link: data.android_app_link,
                ios_app_link: data.ios_app_link
              });
            }
            this.commonApiService.setSubDomainCookie(cookie_obj);
            this.sessionService.set('loginData/v1', response.data);
            this.sessionService.set('domains', response.data.workspaces_info);
            this.commonService.createDomainDictionary(response.data.workspaces_info);
            // let workspace_name = window.location.hostname.split('.')[0];
            // if (window.location.hostname == 'localhost') {
            //   this.currentWorkspace = environment.LOCAL_SPACE;
            // }
            if (this.currentWorkspace) {
              for (let i = 0; i < response.data.workspaces_info.length; i++) {
                if (response.data.workspaces_info[i].workspace == this.currentWorkspace) {
                  const currentSpace = response.data.workspaces_info[i];
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
                    workspace: currentSpace.workspace
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
              }
            } else {
              const currentSpace = response.data.workspaces_info[0];
              this.currentWorkspace = response.data.workspaces_info[0].workspace;
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
                workspace: currentSpace.workspace
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
              this.router.navigate(['../not-invited'], { relativeTo: this.route });
              return false;
            }
          }));
      } else {
        return of(true);
      }
    } else {
      this.router.navigate(['']);
      return of(false);
    }
  }
}
