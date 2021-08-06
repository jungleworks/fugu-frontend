import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';
import { CommonService } from '../../services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-redirect',
  template: ''
})
export class RedirectComponent implements OnInit {
  currentWorkspace;
  paramWorkspace;
  domains;
  validWorkspace = false;
  selectedDomain;
  constructor(private router: Router , private sessionService: SessionService ,
    private commonService: CommonService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      (params) => {
        if(params && params['space']) {
          this.currentWorkspace = params['space'];
        }
      });
    const url = window.location.pathname;
    if(url) {
      this.paramWorkspace = url.split('/')[1];
    }
    const loggedIn = this.commonService.getCookieSubdomain('token');
    if (loggedIn && loggedIn.access_token) {
      this.domains = this.sessionService.get('domains');
      if(this.domains && this.domains.length) {
        if(this.paramWorkspace) {
          this.domains.forEach((item) => {
            if(item.workspace == this.paramWorkspace) {
              this.selectedDomain = item;
              this.validWorkspace = true;
            }
          })
        } else {
          this.paramWorkspace = this.domains[0].workspace;
          this.selectedDomain = this.domains[0];
          this.validWorkspace = true;
        }

        if ( this.validWorkspace == true) {
          this.setInfoDetails(this.selectedDomain);
          this.router.navigate([this.paramWorkspace, 'messages', '0']);
        } else {
          this.router.navigate(['/login']);
        }


      } else {
        this.router.navigate(['/spaces']);
        return;
      }

    } else
    {
      /**
       * case when route in spacedev.officechat.io/funk3, to login directly into funk3 instead of following the normal login
       * where spaces page is opened first
       */
      if(this.paramWorkspace != 'redirectInvitation' || this.paramWorkspace != 'signup' || this.paramWorkspace != 'login' || this.paramWorkspace != 'spaces') {
        const obj = { 'space': this.paramWorkspace };
        this.router.navigate(['/login'], {
          queryParams: obj
        });
      }

     }

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
