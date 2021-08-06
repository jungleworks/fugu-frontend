import { Component, OnInit } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {environment} from '../../../environments/environment';
import * as branch from 'branch-sdk';
import {CommonService} from '../../services/common.service';
import {LoaderService} from '../../services/loader.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-redirect-token',
  template: `<div style="color: white;text-align:center;font-size: 24px;margin-top: 5%;
width: 100%;position:absolute;z-index: 9999999999999">
    Redirecting to your space.</div>`
})
export class RedirectTokenComponent implements OnInit {

  constructor(private commonService: CommonService, private loader: LoaderService, private commonApiService: CommonApiService) { }

  ngOnInit() {
    this.loader.show();
    branch.init(environment.BRANCH_KEY,
      (err, data) => {
        console.log(data);
      });
    const regex = /[?&]([^=#]+)=([^&#]*)/g,
      path = window.location.href,
      params = {};
    let match;
    while ((match = regex.exec(path))) {
      params[match[1]] = match[2];
    }
    const domain = window.location.hostname.split('.').splice(1,2).join('.');
    if (!params['token']) {
      window.open('https://'+ environment.REDIRECT_PATH + '/'+domain+'/messages');
    } else {
      const token = params['token'];
      //Decrypt Message
      const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(token).replace(/ /g, '+'), 'keytoencrypt');
      const obj = {
        token: decrypted.toString(CryptoJS.enc.Utf8)
      };
      // const url = window.location.hostname;
      // if (url && !['fugu.chat', 'officechat.io'].includes(domain)) {
      //   obj['domain'] = domain;
      //   obj['workspace'] = window.location.hostname.split('.').splice(0, 1)[0];
      // }

      this.commonApiService.loginViaAccessToken(obj)
        .subscribe((response) => {
          // branch.io
          const linkData = {
            data: {
              workspace: window.location.pathname.split('/')[1],
              token: decrypted.toString(CryptoJS.enc.Utf8)
            }
          };
          linkData.data['$desktop_url'] = 'https://' + domain + environment.REDIRECT_PATH + '?token=' + token;
          linkData.data['$android_url'] = 'https://play.google.com/store/apps/details?id=com.officechat&hl=en';
          linkData.data['$ios_url'] = 'https://itunes.apple.com/us/app/fuguchat/id1336986136?mt=8';
          if (response.data.user_info.email) {
            linkData.data['email'] = response.data.user_info.email;
          } else {
            linkData.data['contact_number'] = response.data.user_info.contact_number;
          }
          branch.link(linkData, (err, link) => {
            window.open(link, '_self');
          });
        });
    }
  }

}
