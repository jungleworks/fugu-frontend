import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';
import { CommonService } from '../../services/common.service';
import * as branch from 'branch-sdk';
import { ActivatedRoute } from '@angular/router';
import { InvitePasswordService } from './invite-password.service';
import { LoaderService } from '../../services/loader.service';
import {environment} from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { CommonApiService } from '../../services/common-api.service';
import { LocalStorageService } from '../../services/localStorage.service';

@Component({
  selector: 'app-invite-password',
  templateUrl: './invite-password.component.html',
  styleUrls: ['./invite-password.component.scss']
})
export class InvitePasswordComponent implements OnInit {
  passwordForm;
  email_token;
  workspace;
  email;
  showPrivacyTsb = false;
  showTermsTsb = false;
  emailOrContact = '';
  constructor( private formBuilder: FormBuilder,
               public commonService: CommonService,
               private route: ActivatedRoute,
               private service: InvitePasswordService,
               public commonApiService: CommonApiService,
               private loader: LoaderService,
               private localStorageService: LocalStorageService  ) { }

  ngOnInit() {
    if (environment.BRANCH_KEY) {
      branch.init(environment.BRANCH_KEY,
        (err, data) => {
          console.log(data);
      });
    }
    this.passwordForm = this.formBuilder.group({
      // 'password': ['', [ Validators.required, ValidationService.passwordValidator]],
      'full_name': ['', [ Validators.required]],
      'terms': ['', [Validators.required, Validators.pattern('true')]]
    });

    if (this.commonService.isOldFlow && this.passwordForm) {
      this.passwordForm.addControl('password', new FormControl('', [Validators.required, ValidationService.passwordValidator]));
    }
    const url_ws = window.location.href.split('&');
    const url_temp = url_ws[2].split('=')
    const url = url_temp[1];
    const domain = window.location.hostname.split('.').splice(1,2).join('.');
    // if (!['fugu.chat', 'officechat.io'].includes(domain)) {
      const d = {
        workspace: url,
        domain: domain
      };
      this.commonApiService.getWorkspaceDetails(d).subscribe(res => {
        const data  = res.data[0];
        if (data && data.properties) {
          if (data.properties.is_old_flow) {
            this.commonService.isOldFlow = data.properties.is_old_flow;
          }
            if (data.properties.signup_mode) {
              this.commonService.signupMode = data.properties.signup_mode;
            }
          this.commonService.isWhitelabelled = data.properties.is_white_labelled;
          if (this.commonService.isWhitelabelled) {

            this.commonApiService.updateWhitelabelConfigutaions({
              app_name: data.app_name,
              logo: data.logo,
              full_domain: data.full_domain,
              fav_icon: data.fav_icon,
              domain: data.domain,
              is_whitelabeled: data.properties.is_white_labelled,
              branch_key: data.properties.branch_id,
              properties: data.properties,
              colors: data.colors,
              android_app_link: data.android_app_link,
              meet_url: data.properties.conference_link,
              ios_app_link: data.ios_app_link
            });
          }
        }
      });
    // }
    const urlParams = window.location.href.split('&');
    this.email_token = urlParams[0].substr(urlParams[0].indexOf('=') + 1 , urlParams[0].length);
    this.emailOrContact = urlParams[1].split('=')[0];
    this.email = decodeURIComponent(urlParams[1].substr(urlParams[1].indexOf('=') + 1 , urlParams[1].length));
    this.workspace = urlParams[2].substr(urlParams[2].indexOf('=') + 1 , urlParams[2].length);
  }

  setPassword() {
    const obj = {
      email_token: this.email_token,
      full_name: this.passwordForm.value.full_name,
      // password: this.passwordForm.value.password,
      workspace: this.workspace
    };
    if (this.commonService.isWhitelabelled) {
      obj['password'] = this.passwordForm.value.password
    }
    this.service.setPassword(obj).subscribe(
      (response) => {
        const encrypted = CryptoJS.AES.encrypt(response.access_token, 'keytoencrypt');
        const linkData = {
            data: {
              workspace: this.workspace,
              token: response.access_token
            }
          };
          const cookie_obj = {
            access_token: response.access_token
          };
          this.localStorageService.set('showTutorials', true);
          this.commonApiService.setSubDomainCookie(cookie_obj);
          if (this.commonService.isWhitelabelled && !this.commonApiService.whitelabelConfigurations['branch_key']) {
            if (!this.commonApiService.whitelabelConfigurations['android_app_link'] || !this.commonApiService.whitelabelConfigurations['ios_app_link']) {
              window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${this.workspace}/messages?token=${encrypted}`, '_self');
            } else {
              if (this.commonService.isAndroid) {
                window.open(this.commonApiService.whitelabelConfigurations['android_app_link'], '_self');
              } else if (this.commonService.isIOS) {
                window.open(this.commonApiService.whitelabelConfigurations['ios_app_link'], '_self');
              } else {
               window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${this.workspace}/messages?token=${encrypted}`, '_self');
              }
            }
            // linkData.data['$desktop_url'] = `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${this.workspace}/messages?token=${encrypted}`;
            // linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
            // linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
            // linkData.data[this.emailOrContact] = this.email;
            // branch.link(linkData, (err, link) => {
            //   window.open(link, '_self');
            // });
          } else {
            if (this.commonService.isWhitelabelled) {
              linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
              linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
            } else {
              linkData.data['$android_url'] = 'https://play.google.com/store/apps/details?id=com.officechat&hl=en';
              linkData.data['$ios_url'] = 'https://itunes.apple.com/us/app/fuguchat/id1336986136?mt=8';
            }
            linkData.data['$desktop_url'] = 'https://'+ environment.REDIRECT_PATH + '/'+this.workspace +'/messages'+ '?token=' + encrypted;
            linkData.data[this.emailOrContact] = this.email;
            branch.link(linkData, (err, link) => {
              window.open(link, '_self');
            });
          }
      }
    );
  }
}
