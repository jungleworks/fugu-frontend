import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SignupService } from '../signup/signup.service';
import { CommonService } from '../../services/common.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { MessageService } from '../../services/message.service';
import { CommonApiService } from '../../services/common-api.service';
import { environment } from '../../../environments/environment';
declare const gapi: any;

@Component({
  selector: 'app-google-login',
  templateUrl: './google-login.component.html',
  styleUrls: ['./google-login.component.scss']
})
export class GoogleLoginComponent implements OnInit {
  auth2;
  constructor(
    public commonService: CommonService,
    public commonApiService: CommonApiService) { }
    
    @Output()
    googleUserCodeEmitter: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
      this.signIn();
  }

  async signIn() {
    await this.commonService.insertGoogleScript();
    await this.commonService.insertSecondGoogleScript();
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: this.commonService.google_client_id,
        cookie_policy: 'single_host_origin',
        scope: 'profile email openid https://www.googleapis.com/auth/contacts.readonly'
      });
    });
  }

  loginViaGmail() {
    this.auth2.grantOfflineAccess({
      prompt : 'select_account'
    }).then(this.onSignIn.bind(this));
  }

  onSignIn(googleUser) {
    this.googleUserCodeEmitter.emit(googleUser);
  }
}
