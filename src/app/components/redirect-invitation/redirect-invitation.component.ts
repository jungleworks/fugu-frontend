import { Component, OnInit } from '@angular/core';
import { RedirectInvitationService } from './redirect-invitation.service';
import * as branch from 'branch-sdk';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import {LoaderService} from '../../services/loader.service';
import * as CryptoJS from 'crypto-js';
import { CommonService } from '../../services/common.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-redirect-invitation',
  template: `<div style="color: white;text-align:center;font-size: 24px;margin-top: 5%;
width: 100%;position:absolute;z-index: 9999999999999">
    Redirecting to your space.</div>`,
})
export class RedirectInvitationComponent implements OnInit {
  constructor( private service: RedirectInvitationService, private loader: LoaderService,private commonApiService: CommonApiService,
  private router: Router, private commonService: CommonService) { }

  ngOnInit() {
    const url = window.location.pathname;
    let domain = window.location.hostname.split('.').splice(1, 2).join('.');
    // if (!['fugu.chat', 'officechat.io'].includes(domain)) {
      if (window.location.hostname == 'localhost') {
         domain = environment.LOCAL_DOMAIN;
      }
    const d = {
      workspace: url.split('/')[1],
      domain: this.commonService.getDomainName()
    };
    this.commonApiService.getWorkspaceDetails(d).subscribe(res => {
      const data  = res.data[0];
      if (data && data.properties) {
        this.commonService.isWhitelabelled = data.properties.is_white_labelled;
        if (data.properties.is_old_flow) {
          this.commonService.isOldFlow = data.properties.is_old_flow;
        }
          if (data.properties.signup_mode) {
            this.commonService.signupMode = data.properties.signup_mode;
          }
        if (this.commonService.isWhitelabelled) {
          this.commonApiService.updateWhitelabelConfigutaions({
            app_name: data.app_name,
            logo: data.logo,
            fav_icon: data.fav_icon,
            domain: this.commonService.getDomainName(),
            full_domain: data.full_domain,
            is_whitelabeled: data.properties.is_white_labelled,
            branch_key: data.properties.branch_id,
            properties: data.properties,
            colors: data.colors,
            android_app_link: data.android_app_link,
            ios_app_link: data.ios_app_link
          });
        }
      }
      this.verifyToken();
    });
    // } else {
    //   this.verifyToken();
    // }
  }
  verifyToken() {
    if (environment.BRANCH_KEY) {
      branch.init(environment.BRANCH_KEY,
        (err, data) => {
          console.log(data);
      });
    }
    this.loader.show();
    const urlParams = window.location.href.split('&');
    const email_token = urlParams[0].substr(urlParams[0].indexOf('=') + 1 , urlParams[0].length);
    const emailOrContact = urlParams[1].split('=')[0];
    const email = decodeURIComponent(urlParams[1].substr(urlParams[1].indexOf('=') + 1 , urlParams[1].length));
    const workspace = urlParams[2].substr(urlParams[2].indexOf('=') + 1 , urlParams[2].length);
    // verify email_token API HIT
    const obj = {
      email_token: encodeURIComponent(email_token)
    };
    // const url = '?email_token=' + encodeURIComponent(email_token);
    this.service.verifyToken(obj)
    .subscribe(
      (response) => {
        this.loader.hide();
          if (response.access_token) {
            const encrypted = CryptoJS.AES.encrypt(response.access_token, 'keytoencrypt');
            /**
             * If someone is accepting invite from mail set the new cookie so new account opens
             */
            const cookie_obj = {
              access_token: response.access_token
            };
            this.commonApiService.setSubDomainCookie(cookie_obj);
            // branch.io
            const linkData = {
              data: {
                workspace: workspace,
                token: response.access_token
              }
            };
            if (this.commonService.isWhitelabelled && !this.commonApiService.whitelabelConfigurations['branch_key']) {
              if (this.commonService.isAndroid) {
                window.open(this.commonApiService.whitelabelConfigurations['android_app_link'], '_self');
              } else if (this.commonService.isIOS) {
                window.open(this.commonApiService.whitelabelConfigurations['ios_app_link'], '_self');
              } else {
                 window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${workspace}?token=${encrypted}`, '_self');
              }
              // linkData.data['$desktop_url'] = `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${workspace}?token=${encrypted}`;
              // linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
              // linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
              // linkData.data[emailOrContact] = email;
              // branch.link(linkData, (err, link) => {
              //   window.open(link, '_self');
              // });
            } else {
              if (this.commonService.isWhitelabelled) {
                linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
                linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
              } else {
              // linkData.data['$desktop_url'] = 'https://' + workspace + environment.REDIRECT_PATH + '?token=' + encrypted;
              linkData.data['$android_url'] = 'https://play.google.com/store/apps/details?id=com.officechat&hl=en';
              linkData.data['$ios_url'] = 'https://itunes.apple.com/us/app/fuguchat/id1336986136?mt=8';
              }
              linkData.data['$desktop_url'] = 'https://' + environment.REDIRECT_PATH + '/' + workspace + '/messages' + '?token=' + encrypted;
              linkData.data[emailOrContact] = email;
              branch.link(linkData, (err, link) => {
                window.open(link, '_self');
              });
            }
          } else {
            const obj = {'email_token': email_token};
            obj[emailOrContact] = email;
            obj['workspace'] = workspace;
            // route to setPasword
            this.router.navigate(['/setPassword'], {
            queryParams : obj});
          }
      }
    );
  }
}
