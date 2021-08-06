import { Component, OnInit } from '@angular/core';
import {  RedirectSignupService } from './redirect-signup.service';
import * as branch from 'branch-sdk';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import {LoaderService} from '../../services/loader.service';
import * as CryptoJS from 'crypto-js';
import { CommonService } from '../../services/common.service';
import { CommonApiService } from '../../services/common-api.service';
import { LocalStorageService } from '../../services/localStorage.service';

@Component({
  selector: 'app-redirect-signup',
  template: `<div style="color: white;text-align:center;font-size: 24px;margin-top: 5%;
width: 100%;position:absolute;z-index: 9999999999999">
    Redirecting to your space.</div>`,
})
export class RedirectSignupComponent implements OnInit {
  constructor( private service: RedirectSignupService, private loader: LoaderService,private commonApiService: CommonApiService,
  private router: Router, private commonService: CommonService, private localStorageService: LocalStorageService) { }

  ngOnInit() {
    const url = window.location.pathname;
    let domain = window.location.hostname.split('.').splice(1, 2).join('.');
    // if (!['fugu.chat', 'officechat.io'].includes(domain)) {
      if (window.location.hostname == 'localhost') {
         domain = environment.LOCAL_DOMAIN;
      }
    const d = {
      workspace: url.split('/')[1],
      domain: domain
    };



    // } else {
    //   this.verifyToken();
    // }
    this.commonService.whiteLabelEmitter.subscribe((data) => {
      branch.init(environment.BRANCH_KEY,
        (err, data) => {
          console.log(data);
      });
      this.verifyToken();
    })
  }
  verifyToken() {
    this.loader.show();
    const urlParams = window.location.href.split('&');
    const email_token = urlParams[0].substr(urlParams[0].indexOf('=') + 1 , urlParams[0].length);
    const emailOrContact = urlParams[1].split('=')[0];
    const email = decodeURIComponent(urlParams[1].substr(urlParams[1].indexOf('=') + 1 , urlParams[1].length)).replace(/ /g, '+');
    // const workspace = urlParams[2].substr(urlParams[2].indexOf('=') + 1 , urlParams[2].length);
    // verify email_token API HIT
    const obj = {
      verification_token: email_token,
      email: email
    };

    if (email == 'true') {
            this.loader.hide();
      return;
    }


    // const url = '?email_token=' + encodeURIComponent(email_token);
    this.service.verifyNewOTP(obj)
    .subscribe(
      (response) => {
        this.loader.hide();
        if (response.data.user_info.access_token) {
        const cookie_obj = {
          access_token: response.data.user_info.access_token
        };
        this.commonApiService.setSubDomainCookie(cookie_obj);
      }
        if (response.data.workspaces_info.length) {
          //login case
          const workspace = response.data.workspaces_info[0].workspace;
            if (response.data.user_info.access_token) {
              // const encrypted = CryptoJS.AES.encrypt(response.access_token, 'keytoencrypt');
              /**
               * If someone is accepting invite from mail set the new cookie so new account opens
               */

              // branch.io
              const linkData = {
                data: {
                  workspace: response.data.workspaces_info[0].workspace,
                  token: response.data.user_info.access_token
                }
              };
              if (this.commonService.isWhitelabelled && !this.commonApiService.whitelabelConfigurations['branch_key']) {
                if (this.commonService.isAndroid) {
                  window.open(this.commonApiService.whitelabelConfigurations['android_app_link'], '_self');
                } else if (this.commonService.isIOS) {
                  window.open(this.commonApiService.whitelabelConfigurations['ios_app_link'], '_self');
                } else {
                   window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${workspace}?token=${response.access_token}`, '_self');
                }
                // linkData.data['$desktop_url'] = `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${workspace}?token=${encrypted}`;
                // linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
                // linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
                // linkData.data[emailOrContact] = email;
                // branch.link(linkData, (err, link) => {
                //   console.log(link);
                //   window.open(link, '_self');
                // });
              } else {
                if (this.commonService.isMobile) {
                  // linkData.data['$desktop_url'] = 'https://' + workspace + environment.REDIRECT_PATH + '?token=' + encrypted;
                  if (this.commonService.isWhitelabelled) {
                    linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
                    linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
                  } else {
                    linkData.data['$android_url'] = 'https://play.google.com/store/apps/details?id=com.officechat&hl=en';
                    linkData.data['$ios_url'] = 'https://itunes.apple.com/us/app/fuguchat/id1336986136?mt=8';
                  }
                  linkData.data['$desktop_url'] = 'https://' + environment.REDIRECT_PATH + '/' + workspace + '/messages' + '?token=' + response.access_token;
                  linkData.data[emailOrContact] = email;
                  linkData.data['signup_type'] = response.data.signup_type;
                  linkData.data[' verification_token'] = email_token;
                  branch.link(linkData, (err, link) => {
                    window.open(link, '_self');
                  });
                } else {
                  if (window.location.hostname == "localhost") {
                    window.open('localhost:3900' + '/' + response.data.workspaces_info[0].workspace  + '/messages');
                  } else {
                    window.open('https://' + environment.REDIRECT_PATH + '/' + response.data.workspaces_info[0].workspace + '/messages', '_self');
                  }
                }
              }
            } else {
              const obj = {'email_token': email_token};
              obj[emailOrContact] = email;
              obj['workspace'] = workspace;
              // route to setPasword
              this.router.navigate(['/setPassword'], {
              queryParams : obj});
            }
        } else {
          //signup case
          if (this.commonService.isMobile) {
            const linkData = {
              data: {
                token: response.data.user_info.access_token
              }
            };
            // linkData.data['$desktop_url'] = 'https://' + environment.REDIRECT_PATH + '/signup/9?isEmail=true&isPhoneNumber=true';
            if (this.commonService.isWhitelabelled) {
              linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
              linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
            } else {
              linkData.data['$android_url'] = 'https://play.google.com/store/apps/details?id=com.officechat&hl=en';
              linkData.data['$ios_url'] = 'https://itunes.apple.com/us/app/fuguchat/id1336986136?mt=8';
            }
            linkData.data[emailOrContact] = email;
            linkData.data['signup_type'] = response.data.signup_type;
            linkData.data[' verification_token'] = email_token;
            branch.link(linkData, (err, link) => {
              
              window.open(link, '_self');
            });
          } else {
            this.localStorageService.set('userDetailsSignup', response.data);
            // this.router.navigate(['/signup/9']);
            this.router.navigate(["/signup", 9], {
              queryParams: {
                isEmail: true,
                isPhoneNumber: true
              },
            });
          }
        }
      }
    );
  }
}
