import { Component, OnInit } from '@angular/core';
import {SessionService} from '../../../../src/app/services/session.service';
import {CommonService} from '../../services/common.service';
import {environment} from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import * as branch from 'branch-sdk';
import {LoaderService} from '../../services/loader.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-spaces',
  templateUrl: './spaces.component.html',
  styleUrls: ['./spaces.component.scss']
})
export class SpacesComponent implements OnInit {
  spaces_info;
  invitations;
  show_more = false;
  show_more_inv = false;
  constructor(private sessionService: SessionService,
    public commonApiService: CommonApiService,
    public commonService: CommonService, private loader: LoaderService) { }

  ngOnInit() {
    if (this.commonService.isMobile) {
      branch.init(environment.BRANCH_KEY,
        (err, data) => {
          console.log(data);
      });
    }
    this.loginViaAccessToken();
  }

  loginViaAccessToken() {
    const obj = {
      token : this.commonService.getCookieSubdomain('token').access_token
    };
    let url = window.location.hostname;
    if (url) {
      // obj['domain'] = url.split('.').splice(1, 2).join('.');
      obj['domain'] = url.replace(url.substr(0, url.indexOf(".") + 1), "")
      if (url == 'localhost') {
        url = environment.LOCAL_DOMAIN;
        obj['domain'] = url;
      }
    }
    this.commonApiService.loginViaAccessToken(obj)
      .subscribe((response) => {

        this.spaces_info = response.data;
        this.spaces_info.invitation_to_workspaces = this.spaces_info.invitation_to_workspaces.map((item) => {
          item.already_invited = true;
          return item;
        });
        this.spaces_info.open_workspaces_to_join = this.spaces_info.open_workspaces_to_join.map((item) => {
          item.already_invited = false;
          return item;
        });
        this.invitations = this.spaces_info.invitation_to_workspaces.concat(this.spaces_info.open_workspaces_to_join);
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
            domain: data.domain,
            full_domain: data.full_domain,
            is_whitelabeled: true,
            properties: data.properties,
            meet_url: data.properties.conference_link,
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
      });
  }

  launchSpace(space , origin?) {
    this.loader.show();
    const encryptedToken = CryptoJS.AES.encrypt(this.spaces_info.user_info.access_token, 'keytoencrypt');
    const linkData = {
      data: {
        workspace: space.workspace,
        token: this.spaces_info.user_info.access_token,
      }
    };
    if(!origin) {
      this.setInfoDetails(space);
    }
    if (this.commonService.isWhitelabelled && !this.commonApiService.whitelabelConfigurations['branch_key']) {
      // tslint:disable-next-line:max-line-length
      // linkData.data['$desktop_url'] = `https://${space.workspace}.${this.commonService.whitelabelConfigurations['domain']}?token=${encryptedToken}`;
      // linkData.data['$android_url'] = ;
      // linkData.data['$ios_url'] = ;
      window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${space.workspace}?token=${encryptedToken}`, '_self');
    } else {
      if (this.commonService.isWhitelabelled) {
        linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
        linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
      } else {
        linkData.data['$android_url'] = 'https://play.google.com/store/apps/details?id=com.officechat&hl=en';
        linkData.data['$ios_url'] = 'https://itunes.apple.com/us/app/fuguchat/id1336986136?mt=8';
      }
        linkData.data['$desktop_url'] = 'https://' + environment.REDIRECT_PATH + '/' + space.workspace + '/messages'+ '?token=' + encryptedToken;
      if (space.email) {
        linkData.data['email'] = space.email;
      } else {
        linkData.data['contact_number'] = space.contact_number;
      }
      if (this.commonService.isMobile) {
        branch.link(linkData, (err, link) => {
          if (!err) {
            window.open(link, '_self');
          } else {
            console.log('Branch IO ERROR: ', err);
          }
        });
      } else {
        const url = window.location.hostname;
        if (url == 'localhost') {
          this.loader.hide();
          window.open(`localhost:3900/${space.workspace}/messages?token=${encryptedToken}`);
          // window.open('localhost:4200' + '/' + space.workspace + '/messages' + '?token=' + encryptedToken, '_self');
        } else {
          window.open(linkData.data['$desktop_url'], '_self');
        }

      }
    }
  }

  setInfoDetails(domain) {
    // this.sessionService.set('currentSpace', domain);
    if (this.sessionService.get('loginData/v1') && this.sessionService.get('loginData/v1')['user_info']) {
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
      // since the workspace openend from +10 more category , we need to bring it in the highlight
      this.spaces_info.workspaces_info  = this.spaces_info.workspaces_info.filter((item) => {
        return item.workspace_id != domain.workspace_id;
      });
      this.spaces_info.workspaces_info.unshift(domain);
      this.sessionService.set('domains', this.spaces_info.workspaces_info);
      this.commonService.createDomainDictionary(this.spaces_info.workspaces_info);
    }


  }

  joinSpace(space) {
    this.loader.show();
    const obj = {
      email_token: space.invitation_token,
      workspace_id: space.already_invited ? undefined : space.workspace_id,
      invitation_type: space.already_invited ? 'ALREADY_INVITED' : 'OPEN_INVITATION'
    };
    this.commonApiService.joinWorkspace(obj)
      .subscribe((res) => {
        this.launchSpace(space , 'join');
      });
  }
  logout() {
    this.sessionService.removeAll();
    this.commonApiService.setSubDomainCookie([]);
    if (this.commonService.isWhitelabelled) {
      window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/login`, '_self');
    } else {
      window.open(environment.LOGOUT_REDIRECT, '_self');
    }
  }

}
