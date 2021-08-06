import {Component, Input, OnInit, ViewChild, NgZone} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {ValidationService} from '../../services/validation.service';
import {LoginService} from './login.service';
import {CommonService} from '../../services/common.service';
import {LoaderService} from '../../services/loader.service';
import {SessionService} from '../../services/session.service';
import {Router, ActivatedRoute} from '@angular/router';
import {MessageService} from '../../services/message.service';
import {CountryService} from '../../services/country.service';
import {environment} from '../../../environments/environment';
import {messageModalAnimation} from '../../animations/animations';
import {CommonApiService} from '../../services/common-api.service';
import {SignupService} from '../signup/signup.service';
import {SignupMode} from '../../enums/app.enums';

declare const gapi: any;
let TIMER = 30;
let timerIdEmail;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [messageModalAnimation]
})
export class LoginComponent implements OnInit {
  loginForm;
  token;
  link;
  workspace_name;
  loginData;
  domains;
  selected_country_code = {
    name: '',
    dialCode: '91',
    countryCode: 'in'
  };
  JWText = null;
  emailsData = [];
  workspace_call_name;
  isPublicInvite = false;
  isEmail = true;
  only_username_field = false;
  joinPublicSpacePopup = false;
  emailValue;
  domainName;
  show_google_button = false;
  auth2;
  isAlreadyRegistered = false;
  verificationLink = false;
  showResendEmail = false;
  timeLeftEmail = TIMER;
  countriesList = [];
  emailOrPhoneText: string;
  signupText = '';

  constructor(
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    private router: Router,
    private loginService: LoginService,
    private loader: LoaderService,
    public commonApiService: CommonApiService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private service: SignupService,
    private ngZone: NgZone,
    private countryService: CountryService
  ) {
  }

  ngOnInit() {
    this.countriesList = this.countryService.getCountries();
    this.loadGoogleScript();
    this.domainName = window.location.hostname;
    window['log'] = this;
    this.loginForm = this.formBuilder.group({
      // 'password': ['', [Validators.required, ValidationService.passwordValidator]]
    });

    this.commonService.whiteLabelEmitter.subscribe((data) => {
      this.signupText = this.commonService.findSignupText();
      if (data && this.commonService.google_client_id) {
        this.show_google_button = true;
      }
      if (this.commonService.isOldFlow) {
        this.loginForm.addControl(
          'password',
          new FormControl('', [
            Validators.required,
            ValidationService.passwordValidator
          ])
        );
      }
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params['space']) {
        this.workspace_name = params['space'];
        if (this.workspace_name == 'jw') {
          this.JWText = 'Jungleworks Open Community';
        }
      }
      if (params['email']) {
        this.emailValue = params['email'];
        this.emailOrPhoneText = 'email';
        this.isAlreadyRegistered = true;
      }
      if (params['number']) {
        this.emailValue = params['number'];
        this.emailOrPhoneText = 'phone number';
        this.isAlreadyRegistered = true;
      }
    });
    let url;
    if (this.workspace_name) {
      /**
       * Case when login page is opened through the workspace link (spacedev.officechat.io/funk3)
       */
      // this.only_username_field = this.workspace_name.toLowerCase() == 'lpu-demo';
        this.loginForm.addControl(
          'emailOrPhone',
          new FormControl(this.emailValue || '', [
            Validators.required,
            ValidationService.emailOrPhoneValidator
          ])
        );
      // }
      const obj = {
        workspace: this.workspace_name
      };
      // const url = '?workspace=' + encodeURIComponent(window.location.host.split('.')[0]);
      this.commonApiService.getPublicInviteDetails(obj).subscribe((res) => {
        this.isPublicInvite = res.data.public_invite_enabled;
        if (res.data.open_email_domains) {
          this.emailsData = res.data.open_email_domains;
          this.workspace_call_name = res.data.workspace_name;
        }
      });
      let domain = window.location.hostname;
      domain = domain.split('.').splice(1, 2).join('.');
      if (window.location.hostname == 'localhost') {
        domain = environment.LOCAL_DOMAIN;
      }
      const d = {
        workspace: this.workspace_name || 'spaces',
        domain: domain
      };
      this.commonApiService.getWorkspaceDetails(d).subscribe((res) => {
        this.commonService.showAppDetails = true;
        const data = res.data[0];
        if (data && data.google_client_id) {
          this.commonService.google_client_id = JSON.parse(
            data.google_client_id
          );
        }
        if (data && data.properties) {
          if (data.properties.signup_mode) {
            this.commonService.signupMode = data.properties.signup_mode;
          }
          if (data.properties.is_old_flow) {
            this.commonService.isOldFlow = data.properties.is_old_flow;
          }
          this.commonService.isWhitelabelled =
            data.properties.is_white_labelled;
          if (this.commonService.isWhitelabelled) {
            this.commonApiService.updateWhitelabelConfigutaions({
              app_name: data.app_name,
              logo: data.logo,
              fav_icon: data.fav_icon,
              full_domain: data.full_domain,
              domain: data.domain,
              meet_url: data.properties.conference_link,
              is_whitelabeled: data.properties.is_white_labelled,
              branch_key: data.properties.branch_id,
              properties: data.properties,
              colors: data.colors,
              android_app_link: data.android_app_link,
              ios_app_link: data.ios_app_link
            });
          }
          if (!this.commonService.getCookieSubdomain('device_id').toString()) {
            this.setSubDomainCookie(this.generateRandomString(), data.domain);
          }
        }
        this.commonService.whiteLabelEmitter.emit(true);
      });
    } else {
      /**
       * this is the case if login page is opened without the workspace link (spacedev.offichat.io/login)
       */
      let domain = window.location.hostname;
      // domain = domain.split(".").splice(1, 2).join(".");
      domain = domain.split('.').splice(1, 2).join('.');
      /**Update whitelabel details */
      // if (!["fugu.chat", "officechat.io"].includes(domain)) {
      if (window.location.hostname == 'localhost') {
        domain = environment.LOCAL_DOMAIN;
      }
      const d = {
        workspace: this.workspace_name || 'spaces',
        domain: this.commonService.getDomainName()
      };
      this.commonApiService.getWorkspaceDetails(d).subscribe((res) => {
        this.commonService.showAppDetails = true;
        const data = res.data[0];
        if (data && data.google_client_id) {
          this.commonService.google_client_id = JSON.parse(
            data.google_client_id
          );
        }
        if (data && data.properties) {
          if (data.properties.signup_mode) {
            this.commonService.signupMode = data.properties.signup_mode;
          }
          if (data.properties.is_old_flow) {
            this.commonService.isOldFlow = data.properties.is_old_flow;
          }
          this.commonService.isWhitelabelled =
            data.properties.is_white_labelled;
          if (this.commonService.isWhitelabelled) {
            this.commonApiService.updateWhitelabelConfigutaions({
              app_name: data.app_name,
              logo: data.logo,
              fav_icon: data.fav_icon,
              full_domain: data.full_domain,
              domain: data.domain,
              meet_url: data.properties.conference_link,
              is_whitelabeled: data.properties.is_white_labelled,
              branch_key: data.properties.branch_id,
              properties: data.properties,
              colors: data.colors,
              android_app_link: data.android_app_link,
              ios_app_link: data.ios_app_link
            });
          }
          if (!this.commonService.getCookieSubdomain('device_id').toString()) {
            this.setSubDomainCookie(this.generateRandomString(), data.domain);
          }
        }
        this.commonService.whiteLabelEmitter.emit(true);
      });
      // }

        this.loginForm.addControl(
          'emailOrPhone',
          new FormControl(this.emailValue || '', [
            Validators.required,
            ValidationService.emailOrPhoneValidator
          ])
        );
      // this.loginForm.addControl('emailOrPhone', new FormControl(this.emailValue || '', [Validators.required, ValidationService.emailOrPhoneValidator]));

      
        this.loginForm.valueChanges.subscribe((value) => {
          if (value.emailOrPhone.includes('@') || isNaN(value.emailOrPhone)) {
            this.isEmail = true;
          } else {
            this.isEmail = false;
          }
        });
    }

    this.service.getLocation().subscribe((response) => {
      const temp = JSON.parse(response);
      let country: any = this.countriesList.find(
        (num) =>
          num.countryCode.toLowerCase() == temp.data.country_code.toLowerCase()
      );
      this.selected_country_code = {
        name: country.country,
        dialCode: country.dialCode,
        countryCode: temp.data.country_code
      };
    });
  }

  async loadGoogleScript() {
    await this.commonService.insertGoogleScript();
    await this.commonService.insertSecondGoogleScript();
  }

  countdownEmail() {
    if (this.timeLeftEmail == -1) {
      clearTimeout(timerIdEmail);
      this.showResendEmail = true;
    } else {
      this.showResendEmail = false;
      // elem.innerHTML = timeLeftOtp + ' seconds remaining';
      this.timeLeftEmail--;
    }
  }

  showResendEmailOption() {
    // setTimeout( () => {
    //   this.showResendEmail = true;
    //   }, 30000);
    timerIdEmail = setInterval(this.countdownEmail.bind(this), 1000);
  }

  loginNew(isResend?) {
    this.loader.show();
    const obj = {
      resend_otp: isResend ? 1 : undefined
    };
    if (this.isEmail) {
      obj['email'] = this.loginForm.value.emailOrPhone;
      this.showResendEmail = false;
      this.timeLeftEmail = TIMER;
      this.showResendEmailOption();
    } else {
      obj['contact_number'] =
        '+' +
        this.selected_country_code.dialCode +
        '-' +
        this.loginForm.value.emailOrPhone;
      obj[
        'country_code'
        ] = this.selected_country_code.countryCode.toUpperCase();
    }

    obj['domain'] = window.location.hostname.split('.').splice(1, 2).join('.');
    if (window.location.hostname == 'localhost') {
      obj['domain'] = environment.LOCAL_DOMAIN;
    }

    this.loginService.userLoginNew(obj).subscribe((response) => {
      this.loader.hide();
      if (this.isEmail) {
        this.verificationLink = true;
      } else {
        this.router.navigate(['/signup', 2], {
          queryParams: {
            isEmail: false,
            contact_number: this.loginForm.value.emailOrPhone,
            code: this.selected_country_code.dialCode
          }
        });
      }
      // this.domains = response.data.workspaces_info;
      // if (this.workspace_name) {
      //   for (let i = 0; i < this.domains.length; i++) {
      //     if (this.domains[i].workspace == this.workspace_name) {
      //       this.switchWorkspace(response.data, this.domains[i]);
      //       return;
      //     }
      //   }
      // } else {
      //   const cookie_obj = {
      //     access_token: response.data.user_info.access_token
      //   };
      //   this.commonApiService.setSubDomainCookie(cookie_obj);
      //   this.sessionService.set('domains', this.domains);
      //   this.commonService.createDomainDictionary(this.domains);
      //   if (this.domains.length) {
      //     this.switchWorkspace(response.data, this.domains[0]);
      //   } else {
      //     this.router.navigate(['/spaces']);
      //   }
      // }
    });
  }

  login() {
    this.loader.show();
    let obj = {};
    obj = {
      password: this.loginForm.value.password
    };
    if (this.isEmail && this.commonService.signupMode == SignupMode.PHONE) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Enter a valid phone number',
        timeout: 2000
      });
      this.loader.hide();
      return;
    } else if (
      !this.isEmail &&
      this.commonService.signupMode == SignupMode.EMAIL
    ) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Enter a valid email',
        timeout: 2000
      });
      this.loader.hide();
      return;
    }
    
      if (this.isEmail) {
        obj['email'] = this.loginForm.value.emailOrPhone;
      } else {
        obj['contact_number'] =
          '+' +
          this.selected_country_code.dialCode +
          '-' +
          this.loginForm.value.emailOrPhone;
        obj[
          'country_code'
          ] = this.selected_country_code.countryCode.toUpperCase();
    }
    const domain = window.location.hostname.split('.').splice(1, 2).join('.');
    // if (!['fugu.chat', 'officechat.io'].includes(domain)) {
    obj['domain'] = this.commonApiService.whitelabelConfigurations['domain'];
    // }
    this.loginService.login(obj).subscribe((response) => {
      this.loader.hide();
      this.loginData = response.data;
      this.domains = response.data.workspaces_info;
      if (this.workspace_name) {
        for (let i = 0; i < this.domains.length; i++) {
          if (this.domains[i].workspace == this.workspace_name) {
            this.switchWorkspace(response.data, this.domains[i]);
            return;
          }
        }
      } else {
        const cookie_obj = {
          access_token: response.data.user_info.access_token
        };
        this.commonApiService.setSubDomainCookie(cookie_obj);
        this.sessionService.set('domains', this.domains);
        this.commonService.createDomainDictionary(this.domains);
        if (this.domains.length) {
          this.switchWorkspace(response.data, this.domains[0]);
        } else {
          this.router.navigate(['/spaces']);
        }
      }

      // this.messageService.sendAlert({
      //   type: 'danger',
      //   msg: 'You are not registered in this workspace.',
      //   timeout: 2000
      // });
      if (this.isPublicInvite) {
        this.joinPublicSpacePopup = true;
      }
    });
  }

  switchWorkspace(data, space) {
    this.loader.show();
    const obj = {
      workspace_id: space.workspace_id,
      access_token: data.user_info.access_token
    };
    this.commonApiService.switchWorkspace(obj).subscribe((res) => {
      // this.loader.hide();

      this.sessionService.set('loginData/v1', data);
      this.commonService.currentOpenSpace = space;
      this.commonService.spaceDataEmit();
      this.updateUserDetails(space);
      const cookie_obj = {
        access_token: data.user_info.access_token
      };
      /**
       * If device id is already set through the sign up page, do not
       */
      this.commonApiService.setSubDomainCookie(cookie_obj);
      this.sessionService.set('domains', this.domains);
      this.commonService.createDomainDictionary(this.domains);
      this.router.navigate([space.workspace, 'messages', '0']);
    });
  }

  redirectToGoogleLogin() {
    if (this.commonService.isWhitelabelled) {
      window.open(
        `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/login`,
        '_self'
      );
    } else {
      window.open(environment.LOGOUT_REDIRECT, '_self');
    }
  }

  onSignIn(googleUser) {
    const obj = {
      authorized_code: googleUser.code
    };
    this.loader.show();
    this.service.googleSignup(obj).subscribe((response) => {
      this.loader.hide();
      /**
       * if contact comes from google, take their phone number first.
       */
      if (response.data.statusCode == 206) {
        // this.messageService.sendAlert({
        //   type: 'danger',
        //   msg: response.data.message,
        //   timeout: 2000
        // });
        this.ngZone.run(() => {
          this.router.navigate(['/signup', 4]);
        });
      } else {
        const cookie_obj = {
          access_token: response.data.access_token
        };
        this.commonApiService.setSubDomainCookie(cookie_obj);
        this.loginViaAccessToken();
      }
    });
  }

  loginViaAccessToken() {
    const obj = {
      token: this.commonService.getCookieSubdomain('token').access_token
    };
    // let url = window.location.hostname;
    let url = this.commonService.getDomainName();
    if (url) {
      obj['domain'] = url.split('.').splice(1, 2).join('.');
      if (url == 'localhost') {
        url = environment.LOCAL_DOMAIN;
        obj['domain'] = url;
      }
    }
    this.commonApiService.loginViaAccessToken(obj).subscribe((response) => {
      this.ngZone.run(() => {
        if (
          response.data.user_info.onboard_source == 'GOOGLE' &&
          !response.data.workspaces_info.length
        ) {
          this.router.navigate(['/signup', 4], {
            queryParams: {g_user: true, g_popup: true}
          });
        } else {
          this.switchWorkspace(response.data, response.data.workspaces_info[0]);
        }
      });
    });
  }

  updateUserDetails(domain) {
    const data = {
      full_name: domain.full_name,
      user_id: domain.user_id,
      en_user_id: domain.en_user_id,
      app_secret_key: domain.fugu_secret_key,
      is_conferencing_enabled: domain.is_conferencing_enabled,
      role: domain.attendance_role,
      user_name: domain.attendance_user_name,
      workspace: domain.workspace,
      user_image: domain.user_image
    };
    if (domain.user_attendance_config) {
      data['user_attendance_config'] = {
        punch_in_permission: domain.user_attendance_config.punch_in_permission,
        punch_out_permission:
        domain.user_attendance_config.punch_out_permission
      };
    }
    this.commonService.updateUserDetails(data);
  }

  setSubDomainCookie(device_id, domain) {
    const d = new Date();
    d.setTime(d.getTime() + 100 * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    if (
      !(
        window.location.hostname.includes('fugu.chat') ||
        window.location.hostname.includes('officechat.io') ||
        window.location.hostname.includes('localhost')
      )
    ) {
      document.cookie = `device_id=${device_id};${expires};domain=${domain};path=/`;
    } else {
      if (environment.production) {
        document.cookie =
          'device_id=' + device_id + ';' + expires + ';domain=fugu.chat;path=/';
      } else {
        document.cookie =
          'device_id=' + device_id + ';' + expires + ';domain=localhost;path=/';
        document.cookie =
          'device_id=' +
          device_id +
          ';' +
          expires +
          ';domain=officechat.io;path=/';
      }
    }
  }

  generateRandomString() {
    const charsNumbers = '0123456789';
    const charsLower = 'abcdefghijklmnopqrstuvwxyz';
    const charsUpper = charsLower.toUpperCase();
    let chars;

    chars = charsNumbers + charsLower + charsUpper;

    const length = 10;

    let string = '';
    for (let i = 0; i < length; i++) {
      let randomNumber = Math.floor(Math.random() * 32) + 1;
      randomNumber = randomNumber || 1;
      string += chars.substring(randomNumber - 1, randomNumber);
    }
    return string + '.' + new Date().getTime();
  }
}
