import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, NgZone} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {ValidationService} from '../../services/validation.service';
import {CommonService} from '../../services/common.service';
import {LoaderService} from '../../services/loader.service';
import {SignupService} from './signup.service';
import {environment} from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import {SessionService} from '../../../../src/app/services/session.service';
import {CountryService} from '../../../../src/app/services/country.service';
import {debounceTime} from 'rxjs/operators';
import {MessageService} from '../../services/message.service';
import {CommonApiService} from '../../services/common-api.service';
import {SignupType, SignupMode} from '../../enums/app.enums';
import {LocalStorageService} from '../../services/localStorage.service';

declare const gapi: any;
let domains = [];
let userDetails: any = {};
let timerIdOtp;
let timerIdEmail;
let TIMER = 30;

export interface MarketingParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_refferal_id?: string;
  utm_l_source?: string;
  utm_tarsan?: string;
  utm_previous_page?: string;
  utm_referrer?: string;
  utm_vertical?: string;
  utm_ad_campaign_name?: string;
  utm_web_referrer?: string;
  utm_old_source?: string;
  utm_old_medium?: string;
  utm_vertical_page?: string;
  utm_term?: string;
  utm_gclid?: string;
  utm_continent_code?: string;
  utm_offering?: string;
  utm_session_ip?: any;
  utm_url?: string;
  utm_productname?: string;
  utm_ctaType?: string;
  utm_old_campaign?: string;
  utm_incomplete?: string;
}

export interface IGoogleVerificationObj {
  email: string;
  contact_number: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  continentCode;
  countryCode;
  emailForm;
  spaceForm;
  otpForm;
  namePasswordForm;
  stepNumber;
  workspace_id;
  workspace_name;
  inviteForm;
  multipleInviteForm;
  auth2;
  hasEmail = false;
  showPhoneNumber = false;
  isVerificationLink = false;
  inviteSearchCtrl;
  selectedEmails = {};
  filteredEmailsData = [];
  importEmailData = [];
  loginData;
  timeLeftOtp = TIMER;
  timeLeftEmail = TIMER;
  selected_country_code = {
    'name': '',
    'dialCode': '91',
    'countryCode': 'in'
  };
  contact_type_enum = {
    ALL: 'ALL',
    CONTACTS: 'CONTACTS',
    GROUPS: 'GROUPS'
  };
  isEmail = true;
  phonesCountryCodeArray = [];
  contacts = {
    user_groups: [],
    workspace_contacts: [],
    invite_emails: []
  };
  space_wise_groups = [];
  restricted_domains = [];
  selected_groups = new Set();
  private marketingParams = {};
  is_google_user = false;
  google_popup = false;
  show_google_button = false;
  takeGooglePhoneNumber = false;
  googleVerificationObj = <IGoogleVerificationObj>{};
  createdWorkspaceInfo;
  showWorkspaceName = true;
  showResendOtp = true;
  showResendEmail = false;
  spaces_info;
  countriesList = [];
  signupText = '';
  @ViewChild('domainCheckBox') domainCheck: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private service: SignupService,
    public commonService: CommonService,
    private router: Router,
    private loader: LoaderService,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private changeDet: ChangeDetectorRef,
    private countryService: CountryService,
    private messageService: MessageService,
    private ngZone: NgZone,
    public commonApiService: CommonApiService,
    private localStorageService: LocalStorageService
  ) {
  }

  ngOnInit() {
    this.countriesList = this.countryService.getCountries();
    if (environment.production) {
      this.loadScript();
    }
    this.getWorkspaceDetails();
    this.commonService.whiteLabelEmitter.subscribe((data) => {
      this.signupText = this.commonService.findSignupText();
      if (data && this.commonService.google_client_id) {
        this.show_google_button = true;
      }
    });
    this.inviteSearchCtrl = new FormControl();

    this.emailForm = this.formBuilder.group({
      'emailOrPhone': ['', [Validators.required, ValidationService.emailOrPhoneValidator]]
    });

    this.spaceForm = this.formBuilder.group({
      'space_name': ['', [Validators.required]]
      // 'space_url': ['', [Validators.required]]
    });

    this.namePasswordForm = this.formBuilder.group({
      'terms': ['', [Validators.required, Validators.pattern('true')]]
    });

    this.otpForm = this.formBuilder.group({
      'otp_1': ['', [Validators.required]],
      'otp_2': ['', [Validators.required]],
      'otp_3': ['', [Validators.required]],
      'otp_4': ['', [Validators.required]],
      'otp_5': ['', [Validators.required]],
      'otp_6': ['', [Validators.required]]
    });
    this.inviteForm = this.formBuilder.group({
      properties: this.formBuilder.array([])
    });
    this.multipleInviteForm = this.formBuilder.group({
      'multiple_invite_email': ['']
    });
    this.inviteForm.get('properties').push(new FormControl());
    this.inviteForm.get('properties').push(new FormControl());
    let isLogin = false;
    this.route.queryParams.subscribe((data) => {
      this.workspace_id = data.w_id;
      this.workspace_name = data.workspace;
      this.google_popup = data.g_popup ? JSON.parse(data.g_popup) : false;
      this.is_google_user = data.g_user ? JSON.parse(data.g_user) : false;
      this.isEmail = data.isEmail == 'true' ? true : false;
      this.showPhoneNumber = data.isPhoneNumber == 'true' ? true : false;
      if (this.isEmail) {
        this.showPhoneNumber = true;
      }
      if (data.contact_number) {
        this.emailForm.setValue({
          emailOrPhone: data.contact_number
        });
        this.selected_country_code.dialCode = data.code;
        this.showResendOtpOption();
        isLogin = true;
      } else {
        this.emailForm.setValue({
          emailOrPhone: ''
        });
      }
      this.setupMarketingParameters(data);
    });
    this.route.params.subscribe(
      (params: Params) => {
        if (params && params['space']) {
          this.workspace_name = params['space'];
        }
        this.stepNumber = params['step'];
        if (this.stepNumber == 5) {
          /**In case of connect google contacts option */
          setTimeout(() => {
            this.signIn();
          }, 1000);
          this.getContactsAndGroups();
        } else if (this.stepNumber == 3) {
          if (!this.takeGooglePhoneNumber) {
            this.namePasswordForm.addControl('full_name', new FormControl('', [Validators.required]));
            this.namePasswordForm.addControl('password', new FormControl('', [Validators.required, ValidationService.passwordValidator]));
          } else {
            this.namePasswordForm.addControl('phone', new FormControl('', [Validators.required]));
          }
          if (this.hasEmail) {
            this.namePasswordForm.addControl('phone', new FormControl('', [Validators.required]));
          }
        } else if (this.stepNumber == 9) {
          if (this.localStorageService.get('userDetailsSignup') && this.localStorageService.get('userDetailsSignup')['open_workspaces_to_join'].length) {
            this.showWorkspaceName = false;
          } else {
            this.namePasswordForm.addControl('workspace_name', new FormControl('', [Validators.required]));
          }
          // if (!this.showPhoneNumber) {
          this.namePasswordForm.addControl('full_name', new FormControl('', [Validators.required]));
          // this.namePasswordForm.addControl('phone', new FormControl('', [Validators.required]));
          //   this.namePasswordForm.addControl('phone', new FormControl('', []));
          // } else {
          //   this.namePasswordForm.addControl('phone', new FormControl('', [Validators.required]));
          // }
          if (this.isEmail || this.showPhoneNumber) {
            this.namePasswordForm.addControl('phone', new FormControl('', []));
          }
        }
      });
    this.inviteSearchCtrl.valueChanges.pipe(debounceTime(300)).subscribe(data => {
      if (data || data == '') {
        this.filteredEmailsData = this.importEmailData.filter(email =>
          email.toLowerCase().includes(data.toLowerCase()));
        this.filteredEmailsData = this.filteredEmailsData.slice();
        this.changeDet.detectChanges();
      }
    });
    if (!isLogin) {
      this.service.getLocation().subscribe((response) => {
        const temp = JSON.parse(response);
        this.countryCode = temp.data.country_code;
        this.continentCode = temp.data.continent_code;
        let country: any = this.countriesList.find(
          (num) =>
            num.countryCode.toLowerCase() ==
            temp.data.country_code.toLowerCase()
        );
        this.selected_country_code = {
          name: country.country,
          dialCode: country.dialCode,
          countryCode: temp.data.country_code
        };
        this.phonesCountryCodeArray = [
          {
            is_email: true,
            selected_country_code: {
              name: country.country,
              dialCode: country.dialCode,
              countryCode: temp.data.country_code
            }
          },
          {
            is_email: true,
            selected_country_code: {
              name: country.country,
              dialCode: country.dialCode,
              countryCode: temp.data.country_code
            }
          }
        ];
      });
    }
    this.emailForm.valueChanges.subscribe(value => {
      if (value.emailOrPhone.includes('@') || isNaN(value.emailOrPhone)) {
        this.isEmail = true;
      } else {
        this.isEmail = false;
      }
    });
    this.checkValueChanges();

  }

  loadScript() {
    window['__insp'] = window['__insp'] || [];
    window['__insp'].push(['wid', 828177718]);
    var ldinsp = function () {
      if (typeof window['__inspld'] != 'undefined') return;
      window['__inspld'] = 1;
      var insp = document.createElement('script');
      insp.type = 'text/javascript';
      insp.async = true;
      insp.id = 'inspsync';
      insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js?wid=828177718&r=' + Math.floor(new Date().getTime() / 3600000);
      var x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(insp, x);
    };
    setTimeout(ldinsp, 0);
  }

  getWorkspaceDetails() {
    let domain = window.location.hostname;
    // domain = domain.split('.').splice(1, 2).join('.');
    domain = this.commonService.getDomainName();
    // if (!['fugu.chat', 'spacedev.officechat.io'].includes(domain)) {
    if (window.location.hostname == 'localhost') {
      domain = environment.LOCAL_DOMAIN;
    }
    const d = {
      workspace: this.workspace_name || 'spaces',
      domain: domain
    };
    this.commonApiService.getWorkspaceDetails(d).subscribe(res => {
      const data = res.data[0];
      if (data && data.google_client_id) {
        this.commonService.google_client_id = JSON.parse(data.google_client_id);
      }
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
            domain: data.domain,
            full_domain: data.full_domain,
            is_whitelabeled: data.properties.is_white_labelled,
            branch_key: data.properties.branch_id,
            properties: data.properties,
            colors: data.colors,
            android_app_link: data.android_app_link,
            ios_app_link: data.ios_app_link
          });
        }
        this.setSubDomainCookie(this.generateRandomString(), data.domain);
      }
      this.commonService.whiteLabelEmitter.emit(true);
    });
    // }
  }

  // change function on selected emails
  onEmailClick(email, index?) {
    if (this.selectedEmails[email]) {
      delete this.selectedEmails[email];
    } else {
      this.selectedEmails[email] = true;
    }
    this.selectedEmails = {...this.selectedEmails};
    this.changeDet.detectChanges();
  }

  // change function to select all emails
  // selectAllEmails() {
  //   const flag = this.importEmailData.length == this.selectedEmails.length ? false : true;
  //   this.filteredEmailsData.map((item) => {
  //     item.selected = flag;
  //   });
  //   if (this.importEmailData.length == this.selectedEmails.length) {
  //     this.selectedEmails = [];
  //   } else {
  //     this.selectedEmails = JSON.parse(JSON.stringify(this.importEmailData));
  //   }
  // }
  setImportedContactsData() {
    this.loader.hide();
    this.filteredEmailsData = JSON.parse(JSON.stringify(this.importEmailData));
    this.ngZone.run(() => {
      this.router.navigate(['signup', 8], {queryParams: {w_id: this.workspace_id, workspace: this.workspace_name}});
    });
    this.changeDet.detectChanges();
  }

  sendMultipleInvites() {
    const obj = {
      workspace_id: this.workspace_id
    };
    if (this.stepNumber == 5) {
      const emailsArray = [], phoneArray = [];
      this.selected_groups.forEach((item: any) => {
        item.emails.map((el, index) => {
          if (el.includes('@fuguchat.com') || el.includes('@junglework.auth')) {
            const phone_splitted = item.contact_numbers[index].split('-');
            phoneArray.push({
              contact_number: item.contact_numbers[index],
              country_code: this.countryService.dialCodeMap[phone_splitted[0].substring(1)]
            });
          } else {
            if (
              this.commonService.signupMode == SignupMode.PHONE
            ) {
              this.messageService.sendAlert({
                type: 'danger',
                msg: 'Enter a valid phone number',
                timeout: 2000
              });
              return;
            }
            emailsArray.push(el);
          }
        });
      });
      // check if first field is empty.
      if (!this.inviteForm.value.properties[0] && !this.selected_groups.size) {
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'First field cannot be empty.',
          timeout: 3000
        });
        return false;
      }
      for (let i = 0; i < this.inviteForm.value.properties.length; i++) {
        const item = this.inviteForm.value.properties[i];
        if (item) {
          // if entry is email, push it to email array
          if (this.phonesCountryCodeArray[i].is_email) {
            emailsArray.push(item);
            // if entry is phone, push it to phone array
          } else {
            phoneArray.push({
              contact_number: '+' + this.phonesCountryCodeArray[i].selected_country_code.dialCode + '-' + item,
              country_code: this.phonesCountryCodeArray[i].selected_country_code.countryCode.toUpperCase()
            });
          }
        }
      }
      // put emails array into object key emails
      if (emailsArray.length) {
        obj['emails'] = emailsArray;
        if (this.stepNumber == 5) {
          if (this.phonesCountryCodeArray[0].is_email) {
            for (let i = 0; i < emailsArray.length; i++) {
              if (!this.commonService.emailValidator(emailsArray[i])) {
                this.messageService.sendAlert({
                  type: 'danger',
                  msg: 'Please enter valid email addresses.',
                  timeout: 3000
                });
                return;
              }
            }
          }
        }
      }
      // put phone array into object key numbers
      if (phoneArray.length) {
        obj['contact_numbers'] = phoneArray;
      }
    } else {
      const emails = this.multipleInviteForm.controls.multiple_invite_email.value.split(',');
      for (let i = 0; i < emails.length; i++) {
        if (!this.commonService.emailValidator(emails[i])) {
          this.messageService.sendAlert({
            type: 'danger',
            msg: 'Please enter valid email addresses.',
            timeout: 3000
          });
          return;
        }
      }
      obj['emails'] = emails;
    }
    try {
      if (this.domainCheck.nativeElement.checked) {
        const d_obj = {
          workspace_id: this.workspace_id,
          email_domain: this.emailForm.value.emailOrPhone.split('@')[1]
        };
        this.service.allowedWorkspace(d_obj).subscribe((res) => {
          this.hasEmail = true;
        });
      }
    } catch (e) {
    }
    if ((obj['emails'] && obj['emails'].length) || (obj['contact_numbers'] && obj['contact_numbers'].length)) {
      this.service.inviteViaEmail(obj).subscribe(response => {
        if (response.statusCode === 200) {
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.skipToWorkspace();
        }
      });
    }
  }

  showResendOtpOption() {
    // setTimeout( () => {
    //     this.showResendOtp = true;
    //     }, 3000);
    // timeLeftOtp = 30;
    // this.countdown();
    timerIdOtp = setInterval(this.countdown.bind(this), 1000);

  }

  countdown() {
    if (this.timeLeftOtp == -1) {
      clearTimeout(timerIdOtp);
      this.showResendOtp = true;
    } else {
      this.showResendOtp = false;
      // elem.innerHTML = timeLeftOtp + ' seconds remaining';
      this.timeLeftOtp--;
    }
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

  submitNew(isResend?) {
    const obj = {
      resend_otp: isResend ? 1 : undefined
    };
    if (this.isEmail) {
      obj['email'] = this.emailForm.value.emailOrPhone;
      this.timeLeftEmail = TIMER;
      this.showResendEmail = false;
      this.showResendEmailOption();
    } else {
      obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.emailForm.value.emailOrPhone;
      this.timeLeftOtp = TIMER;
      this.showResendOtp = false;
      this.showResendOtpOption();
      // obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
    }

    obj['domain'] = window.location.hostname.split('.').splice(1, 2).join('.');
    if (window.location.hostname == 'localhost') {
      obj['domain'] = environment.LOCAL_DOMAIN;
    }

    this.service.userLoginNew(obj).subscribe(
      (response) => {
        if (this.isEmail) {
          this.isVerificationLink = true;
        } else {
          this.navigateAfterLogin(response.statusCode, obj);
        }

        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 4000
        });
      },
      error => {
        this.loader.hide();
        // if (error.status === 410) {
        //   this.loader.hide();
        //   if (this.isEmail) {
        //     this.hasEmail = true;
        //   }
        //   this.router.navigate(['/signup', 2], { skipLocationChange: true });
        // }
      });
  }

  emailSubmit() {
    if (this.isEmail && this.commonService.signupMode == SignupMode.PHONE) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Enter a valid phone number',
        timeout: 2000
      });
      this.loader.hide();
      return;
    } else if (
      !this.isEmail && this.commonService.signupMode == SignupMode.EMAIL
    ) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Enter a valid email',
        timeout: 2000
      });
      this.loader.hide();
      return;
    }
    const obj = {};
    if (this.isEmail) {
      obj['email'] = this.emailForm.value.emailOrPhone;
    } else {
      obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.emailForm.value.emailOrPhone;
      obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
    }
    if (this.commonService.isWhitelabelled) {
      obj['domain'] = this.commonApiService.whitelabelConfigurations[
        'domain'
        ];
    }

    this.service.userLogin(obj).subscribe(
      (response) => {
          this.navigateAfterLogin(response.statusCode, obj);

        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 4000
        });
      },
      error => {
        this.loader.hide();
        // if (error.status === 410) {
        //   this.loader.hide();
        //   if (this.isEmail) {
        //     this.hasEmail = true;
        //   }
        //   this.router.navigate(['/signup', 2], { skipLocationChange: true });
        // }
      });
  }

  navigateAfterLogin(statusCode, obj) {
    switch (statusCode) {
      case 200:
        this.router.navigate(['/signup', 2]);
        if (this.isEmail) {
          this.hasEmail = true;
        }
        break;
      case 201:
        this.router.navigate(['/signup', 7]);
        break;
      case 202:
        let number;
        if (obj['contact_number']) {
          number = this.emailForm.value.emailOrPhone;
        }
        this.router.navigate(['/login'], {queryParams: obj['contact_number'] ? {number: number} : {email: obj['email']}});
        break;
    }
  }

  createWorkspace() {
    this.loader.show();
    const obj = {
      workspace_name: this.spaceForm.value.space_name,
      is_signup: this.google_popup ? 'true' : undefined
      // workspace: this.spaceForm.value.space_url.replace(/ /g, '-').
      // replace(/\./g, '').toLowerCase()
    };
    if (this.commonService.isWhitelabelled) {
      obj['domain'] = this.commonApiService.whitelabelConfigurations['domain'];
    }
    obj['country_code'] = this.countryCode;
    obj['utm_continent_code'] = this.continentCode;
    const keys = Object.keys(this.marketingParams);
    keys.forEach(key => {
      obj[key] = this.marketingParams[key];
    });
    this.service.createWorkspace(obj).subscribe(
      response => {
        if (response.statusCode === 200) {
          if (response.data) {
            this.createdWorkspaceInfo = response.data;
          }
          this.workspace_id = response.data.workspace_id;
          this.sessionService.set('public_data', response.data);
          this.restricted_domains = response.data.restricted_email_domains;
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.workspace_name = response.data.workspace;
          if (this.google_popup) {
            this.getUserContacts(this.workspace_id);
          } else {
            this.loader.hide();
            this.router.navigate(['/signup', 5], {
              queryParams: {
                w_id: this.workspace_id,
                workspace: response.data.workspace, g_user: this.is_google_user
              }
            });
          }
        }
      });
  }

  verifyLoginOTP() {
    this.showResendOtp = false;
    this.timeLeftOtp = TIMER;
    this.showResendOtpOption();
    this.loader.show();
    const obj = {
      otp: this.otpForm.value.otp_1 + this.otpForm.value.otp_2 + this.otpForm.value.otp_3
        + this.otpForm.value.otp_4 + this.otpForm.value.otp_5 + this.otpForm.value.otp_6,
      domain: environment.LOCAL_DOMAIN
    };
    // if (!this.takeGooglePhoneNumber) {
    if (this.isEmail) {
      obj['email'] = this.emailForm.value.emailOrPhone;
    } else {
      obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.emailForm.value.emailOrPhone;
      obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
      this.showPhoneNumber = true;
    }
    // } else {
    //   obj['email'] = this.googleVerificationObj.email;
    //   obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.namePasswordForm.value.phone;
    //   obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
    // }
    // if (!this.takeGooglePhoneNumber) {
    obj['domain'] = window.location.hostname.split('.').splice(1, 2).join('.');
    if (window.location.hostname == 'localhost') {
      obj['domain'] = environment.LOCAL_DOMAIN;
    }
    this.service.verifyNewOTP(obj).subscribe(
      response => {
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        const cookie_obj = {
          access_token: response.data.user_info.access_token
        };
        this.commonApiService.setSubDomainCookie(cookie_obj);
        if (response.data.open_workspaces_to_join.length) {
          this.showWorkspaceName = false;
        }
        userDetails = response.data;
        if (response.data.show_phone) {
          this.showPhoneNumber = true;
        } else {
          this.showPhoneNumber = false;
        }
        this.localStorageService.set('userDetailsSignup', userDetails);
        if (!userDetails) {
          userDetails = this.localStorageService.get('userDetailsSignup');
        }

        this.loader.hide();
        if (response.data.signup_type == SignupType.SIGNUP) {
          this.sessionService.set('loginData', response.data);
          if (!response.data.workspaces_info.length) {
            this.router.navigate(['/signup/9']);
          } else {
            this.router.navigate(['/spaces']);
          }
        } else if (response.data.signup_type == SignupType.LOGIN) {
          if (response.data.workspaces_info.length) {
            this.switchWorkspace(response.data, response.data.workspaces_info[0]);
          } else {
            this.router.navigate(['/signup', 9]);
          }
        }

      },
      error => {
        this.loader.hide();
        if (error.status === 403) {
          this.loader.hide();
          this.router.navigate(['/signup', 3]);
        }
      });
    // } else {
    //   this.service.verifyGoogleUser(obj)
    //   .subscribe((response) => {
    //     this.loader.hide();
    //     const cookie_obj = {
    //       access_token: response.data.access_token
    //     };
    //     this.commonApiService.setSubDomainCookie(cookie_obj);
    //     this.loginViaAccessToken();
    //   });
    // }
  }

  verifyOTP() {
    this.loader.show();
    const obj = {
      otp: this.otpForm.value.otp_1 + this.otpForm.value.otp_2 + this.otpForm.value.otp_3
        + this.otpForm.value.otp_4 + this.otpForm.value.otp_5 + this.otpForm.value.otp_6
    };
    if (!this.takeGooglePhoneNumber) {
      if (this.isEmail) {
        obj['email'] = this.emailForm.value.emailOrPhone;
      } else {
        obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.emailForm.value.emailOrPhone;
        obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
      }
    } else {
      obj['email'] = this.googleVerificationObj.email;
      obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.namePasswordForm.value.phone;
      obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
    }
    if (!this.takeGooglePhoneNumber) {
      this.service.verifyOTP(obj).subscribe(
        response => {
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });

          userDetails = response.data;
          this.localStorageService.set('userDetailsSignup', response.data);
          if (!userDetails) {
            if (this.localStorageService.get('userDetailsSignup')) {
              userDetails = this.localStorageService.get('userDetailsSignup');
            }
          }

          const cookie_obj = {
            access_token: response.data.user_info.access_token
          };
          this.commonApiService.setSubDomainCookie(cookie_obj);

          this.loader.hide();
          if (response.statusCode === 200) {
            this.sessionService.set('loginData', response.data);
            const cookie_obj = {
              access_token: response.data.user_info.access_token
            };
            this.commonApiService.setSubDomainCookie(cookie_obj);
            if (!this.commonService.isOldFlow) {
              if (!response.data.workspaces_info.length) {
                this.router.navigate(['/signup/9']);
              } else {
                this.router.navigate(['/spaces']);
              }
            } else {
              this.router.navigate(['/spaces']);
            }
          }
        },
        error => {
          this.loader.hide();
          if (error.status === 403) {
            this.loader.hide();
            this.router.navigate(['/signup', 3]);
          }
        });
    } else {
      this.service.verifyGoogleUser(obj).subscribe((response) => {
        this.loader.hide();
        const cookie_obj = {
          access_token: response.data.access_token
        };
        this.commonApiService.setSubDomainCookie(cookie_obj);
        this.loginViaAccessToken();
      });
    }
  }

  setPassword() {
    this.loader.show();
    let obj = {};
    if (!this.takeGooglePhoneNumber) {
      obj = {
        password: this.namePasswordForm.value.password,
        full_name: this.namePasswordForm.value.full_name,
        otp: this.otpForm.value.otp_1 + this.otpForm.value.otp_2 + this.otpForm.value.otp_3
          + this.otpForm.value.otp_4 + this.otpForm.value.otp_5 + this.otpForm.value.otp_6
      };
      if (this.hasEmail) {
        obj['email'] = this.emailForm.value.emailOrPhone;
        obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.namePasswordForm.value.phone;
        obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
      } else {
        obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.emailForm.value.emailOrPhone;
        obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
      }
    } else {
      obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.namePasswordForm.value.phone;
      obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
    }

    let url = window.location.hostname;
    if (url) {
      obj['domain'] = url.split('.').splice(1, 2).join('.');
      if (url == 'localhost') {
        obj['domain'] = environment.LOCAL_DOMAIN;
      }
    }
    if (!this.takeGooglePhoneNumber) {
      this.service.setPassword(obj).subscribe(
        response => {
          this.loader.hide();
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.loginData = response.data;
          this.sessionService.set('loginData', response.data);
          const cookie_obj = {
            access_token: response.data.user_info.access_token
          };
          this.commonApiService.setSubDomainCookie(cookie_obj);
          this.sessionService.set('loginData', response.data);
          if (response.data.workspaces_info.length || response.data.invitation_to_workspaces.length
            || response.data.open_workspaces_to_join.length) {
            this.spaces_info = response.data.workspaces_info;
            this.router.navigate(['/spaces']);
          } else {
            this.router.navigate(['/signup', 4]);
          }
          // if (is_google_enabled) {
          //   this.router.navigate(['/signup', 6]);
          // } else {
          //   this.dismissGmail();
          // }
        }
      );
    } else {
      this.service.registerPhoneNumber(obj).subscribe((res) => {
        this.loader.hide();
        this.router.navigate(['/signup', 2]);
      });
    }
  }

  setUserDetail() {
    this.loader.show();
    let obj = {};
    // obj['country_code'] = this.countryCode;
    // obj['utm_continent_code'] = this.continentCode;
    if (!Object.keys(userDetails).length) {
      userDetails = this.localStorageService.get('userDetailsSignup');
    }

    // if (!this.takeGooglePhoneNumber) {
    obj = {
      full_name: this.namePasswordForm.value.full_name,
      workspace_name: this.namePasswordForm.value.workspace_name,
      user_id: userDetails.user_info.user_id
      // contact_number: '+' + this.selected_country_code.dialCode + '-' + this.namePasswordForm.value.phone,
      // country_code: this.selected_country_code.countryCode.toUpperCase()
    };

    if (this.commonService.isWhitelabelled) {
      obj['domain'] = window.location.hostname.split('.').splice(1, 2).join('.');
      if (window.location.hostname == 'localhost') {
        obj['domain'] = environment.LOCAL_DOMAIN;
      }
    }

    if (this.isEmail) {
      let email = this.emailForm.value.emailOrPhone;
      if (!email) {
        email = userDetails.user_info.email;
      }
      obj['email'] = email;
      if (this.namePasswordForm.value.phone) {
        obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.namePasswordForm.value.phone;
        obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
      }
    } else {
      obj['otp'] = this.otpForm.value.otp_1 + this.otpForm.value.otp_2 + this.otpForm.value.otp_3
        + this.otpForm.value.otp_4 + this.otpForm.value.otp_5 + this.otpForm.value.otp_6;
    }
    // } else {
    //   obj['contact_number'] = '+' + this.selected_country_code.dialCode + '-' + this.namePasswordForm.value.phone;
    //   obj['country_code'] = this.selected_country_code.countryCode.toUpperCase();
    // }
    const keys = Object.keys(this.marketingParams);
    keys.forEach(key => {
      obj[key] = this.marketingParams[key];
    });
    if (!this.takeGooglePhoneNumber) {
      this.service.updateUserAndWorkspaceDetails(obj).subscribe(
        response => {
          this.loader.hide();
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.loginData = response.data;
          // const cookie_obj = {
          //   access_token: response.data.user_info.access_token
          // };
          // this.commonApiService.setSubDomainCookie(cookie_obj);
          this.sessionService.set('loginData', response.data);
          this.workspace_id = response.data.workspace_id;
          // if (response.data.workspaces_info.length || response.data.invitation_to_workspaces.length
          //   || response.data.open_workspaces_to_join.length) {
          //     this.spaces_info = response.data.workspaces_info;
          //   this.router.navigate(['/spaces']);
          // } else {
          if (this.google_popup) {
            this.getUserContacts(this.workspace_id);
          } else {
            this.loader.hide();
            this.workspace_name = response.data.workspace;
            if (!this.commonService.isOldFlow) {
              if (!this.showWorkspaceName) {
                this.router.navigate(['/spaces']);
                return;
              }
              this.skipToWorkspace(true);
            } else {
              this.router.navigate(['/signup', 5], {
                queryParams: {
                  w_id: this.workspace_id,
                  workspace: response.data.workspace, g_user: this.is_google_user
                }
              });
            }
          }
          // }
        }
      );
    }
  }

  addFormField(index) {
    if (this.inviteForm.value.properties[0] && this.inviteForm.value.properties[index]) {
      this.inviteForm.get('properties').push(new FormControl());
      this.phonesCountryCodeArray.push({
        is_email: true,
        selected_country_code: {
          'name': '',
          'dialCode': '91',
          'countryCode': 'in'
        }
      });
    }
    this.checkValueChanges();
  }

  checkValueChanges() {
    this.inviteForm.get('properties').controls.map((item, i) => {
      item.valueChanges.subscribe(value => {
        value.includes('@') || isNaN(value) ? this.phonesCountryCodeArray[i].is_email = true
          : this.phonesCountryCodeArray[i].is_email = false;
      });
    });
  }

  nextFocus(event, nextEl, prevEl) {
    const key = event.keyCode;
    if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105) || key === 39) {
      // for moving forward
      nextEl.focus();
    } else if (key === 8 || key === 46 || key === 37) {
      // for moving backwards
      prevEl.focus();
    }
  }

  goToWorkspace(domain, token, is_new?) {
    const encryptedToken = CryptoJS.AES.encrypt(token, 'keytoencrypt');
    this.loader.showRedirect();
    this.setInfoDetails();
    if (this.commonService.isWhitelabelled) {
      if (this.commonService.isOldFlow) {
        window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${domain}?token=${encryptedToken}`, '_self');
      } else {
        window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${domain}/messages?token=${encryptedToken}`, '_self');
      }
    } else {
      window.open('https://' + environment.REDIRECT_PATH + '/' + domain + '/messages' + '?token=' + encryptedToken, '_self');
      if (is_new) {
        this.localStorageService.set('showTutorials', true);
      }
    }
    // const linkData = {
    //   data: {
    //     workspace: domain,
    //     token: token,
    //     '$desktop_url': 'https://' + domain + environment.REDIRECT_PATH + '?token=' + encryptedToken,
    //     '$android_url': 'https://play.google.com/store/apps/details?id=com.officechat&hl=en',
    //     '$ios_url': 'https://itunes.apple.com/us/app/fuguchat/id1336986136?mt=8'
    //   }
    // };
    // if (user_info.email) {
    //   linkData.data['email'] = user_info.email;
    // } else {
    //   linkData.data['contact_number'] = user_info.contact_number;
    // }
    // branch.link(linkData, (err, link) => {
    //   setTimeout(() => {
    //   }, 5000);
    // });
  }

  setInfoDetails() {
    if (this.createdWorkspaceInfo && Object.keys(this.createdWorkspaceInfo) && Object.keys(this.createdWorkspaceInfo).length) {
      const domain = this.createdWorkspaceInfo;
      // this.sessionService.set('currentSpace', domain);
      // const loginData = this.sessionService.get('loginData/v1')['user_info'];
      this.commonService.currentOpenSpace = domain;
      // this.commonService.spaceDataEmit();
      // const data = {
      //   full_name: domain.full_name,
      //   user_channel: loginData.user_channel,
      //   user_id: domain.fugu_user_id,
      //   user_unique_key: loginData.user_id,
      //   en_user_id: domain.en_user_id,
      //   app_secret_key: domain.fugu_secret_key,
      //   is_conferencing_enabled: domain.is_conferencing_enabled,
      //   role: domain.role,
      //   user_name: domain.attendance_user_name
      // };
      // if (domain.user_attendance_config) {
      //   data['user_attendance_config'] = {
      //     punch_in_permission: domain.user_attendance_config.punch_in_permission,
      //     punch_out_permission: domain.user_attendance_config.punch_out_permission
      //   };
      // }
      // this.commonService.updateUserDetails(data);
      // since the workspace openend from +10 more category , we need to bring it in the highlight
      if (!(this.spaces_info && this.spaces_info.length > 0)) {
        this.spaces_info = this.sessionService.get('domains');
      }
      if (this.spaces_info && this.spaces_info.length) {
        this.spaces_info.unshift(domain);
        this.sessionService.set('domains', this.spaces_info);
        this.commonService.createDomainDictionary(this.spaces_info);
      }

    }
  }

  async signIn() {
    // this.userData.email.split('@')[1]
    await this.commonService.insertGoogleScript();
    await this.commonService.insertSecondGoogleScript();
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: this.commonService.google_client_id,
        cookie_policy: 'single_host_origin',
        scope: 'profile email openid https://www.googleapis.com/auth/contacts.readonly'
      });
      /**google contacts case */
      if (!this.is_google_user) {
        this.auth2.attachClickHandler(document.getElementById('gmailAccessBtn'), {}, this.onGoogleContactsSignIn.bind(this),
          (error) => {
            console.log(error);
          });
      }
    });
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
        this.takeGooglePhoneNumber = true;
        this.googleVerificationObj.email = response.data.email;
        this.messageService.sendAlert({
          type: 'danger',
          msg: response.data.message,
          timeout: 2000
        });
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

  onGoogleContactsSignIn() {
    const token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    const obj = {
      user_api_token: token,
      workspace_id: this.workspace_id
    };
    this.service.getContacts(obj).subscribe((response) => {
      gapi.auth2.getAuthInstance().signOut().then(function () {
        gapi.auth2.getAuthInstance().disconnect();
      });
      this.importEmailData = response.data.map((item) => {
        return item;
      });
      if (this.importEmailData.length) {
        this.setImportedContactsData();
      } else {
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'No Contacts present.',
          timeout: 2000
        });
      }
    });
  }

  sendInviteViaGoogle() {
    const emails = Object.keys(this.selectedEmails);
    const obj = {
      emails: emails,
      workspace_id: this.workspace_id
    };
    this.service.inviteViaEmail(obj).subscribe(response => {
      if (response.statusCode === 200) {
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        // gapi.auth.setToken(null);
        // gapi.auth.signOut();
        this.skipToWorkspace();
        this.changeDet.detectChanges();
      }
    });

  }

  onOTPpaste(e, lastBox) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!/^[0-9]*$/.test(text)) {
      return false;
    }
    const otp = text.slice('');
    if (otp.length) {
      this.otpForm.setValue({
        otp_1: otp[0],
        otp_2: otp[1],
        otp_3: otp[2],
        otp_4: otp[3],
        otp_5: otp[4],
        otp_6: otp[5]
      });
      lastBox.focus();
    }
  }

  skipToWorkspace(is_new?) {
    let token;
    if (this.commonService.getCookieSubdomain('token').access_token) {
      token = this.commonService.getCookieSubdomain('token');
    }
    this.goToWorkspace(this.workspace_name,
      token.access_token, is_new);
  }

  getContactsAndGroups() {
    const obj = {
      workspace_id: this.workspace_id,
      contact_type: this.contact_type_enum.GROUPS
    };
    this.service.getUserContactsAndGroups(obj).subscribe((res) => {
      this.contacts = res.data;
      this.space_wise_groups = this.contacts.user_groups;
    });
  }

  getUserContacts(workspace_id) {
    const obj = {
      workspace_id: workspace_id,
      contact_type: this.contact_type_enum.CONTACTS
    };
    this.service.getUserContactsAndGroups(obj).subscribe((response) => {
      this.loader.hide();
      this.importEmailData = response.data.invite_emails.map((item) => {
        return item;
      });
      if (this.importEmailData.length) {
        this.setImportedContactsData();
      } else {
        // this.messageService.sendAlert({
        //   type: 'danger',
        //   msg: 'No Contacts present.',
        //   timeout: 2000
        // });
        this.skipToWorkspace(true);
      }
    });
  }

  private setupMarketingParameters(data) {

    if (data.utm_source) {
      this.marketingParams['utm_source'] = data.utm_source;
    }
    if (data.utm_medium) {
      this.marketingParams['utm_medium'] = data.utm_medium;
    }
    if (data.utm_campaign) {
      this.marketingParams['utm_campaign'] = data.utm_campaign;
    }
    if (data.refferal_id) {
      this.marketingParams['utm_refferal_id'] = data.refferal_id;
    }
    if (data.l_source) {
      this.marketingParams['utm_l_source'] = data.l_source;
    }
    if (data.tarsan) {
      this.marketingParams['utm_tarsan'] = data.tarsan;
      this.marketingParams['utm_source'] = 'Google',
        this.marketingParams['utm_medium'] = 'TN-' + data.tarsan;
    }
    if (data.previous_page) {
      this.marketingParams['utm_previous_page'] = data.previous_page;
    }
    if (data.referrer) {
      this.marketingParams['utm_referrer'] = data.referrer;
    }
    if (data.vertical) {
      this.marketingParams['utm_vertical'] = data.vertical;
    }
    if (data.ad_campaign_name) {
      this.marketingParams['utm_ad_campaign_name'] = data.ad_campaign_name;
    }
    if (data.web_referrer) {
      this.marketingParams['utm_web_referrer'] = data.web_referrer;
    }
    if (data.old_source) {
      this.marketingParams['utm_old_source'] = data.old_source;
    }
    if (data.old_medium) {
      this.marketingParams['utm_old_medium'] = data.old_medium;
    }
    if (data.vertical_page) {
      this.marketingParams['utm_vertical_page'] = data.vertical_page;
    }
    if (data.utm_term) {
      this.marketingParams['utm_term'] = data.utm_term;
    }
    if (data.gclid) {
      this.marketingParams['utm_gclid'] = data.gclid;
    }
    if (data.continent_code) {
      this.marketingParams['utm_continent_code'] = data.continent_code;
    }
    if (data.session_ip) {
      this.marketingParams['utm_session_ip'] = data.session_ip;
    }
    if (data.url) {
      this.marketingParams['utm_url'] = data.url;
    }
    if (data.productname) {
      this.marketingParams['utm_productname'] = data.productname;
    }
    if (data.ctaType) {
      this.marketingParams['utm_ctaType'] = data.ctaType;
    }
    if (data.old_utm_campaign) {
      this.marketingParams['utm_old_campaign'] = data.old_utm_campaign;
    }
    if (data.incomplete) {
      this.marketingParams['utm_incomplete'] = data.incomplete;
    }
    if (data.email) {
      this.emailForm.controls.email.setValue(decodeURIComponent(data.email));
    }
  }

  loginViaAccessToken() {
    const obj = {
      token: this.commonService.getCookieSubdomain('token').access_token
    };
    let url = window.location.hostname;
    if (url) {
      if (url == 'localhost') {
        url = environment.LOCAL_DOMAIN;
      }
      obj['domain'] = url.split('.').splice(1, 2).join('.');
    }
    this.commonApiService.loginViaAccessToken(obj).subscribe((response) => {
      domains = response.data.workspaces_info;
      this.ngZone.run(() => {
        if (response.data.user_info.onboard_source == 'GOOGLE' && !response.data.workspaces_info.length) {
          this.router.navigate(['/signup', 4], {queryParams: {g_user: true, g_popup: true}});
        } else {
          if (domains.length) {
            this.switchWorkspace(response.data, domains[0]);
          } else {
            this.router.navigate(['/spaces']);
          }
        }
      });
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
      this.commonService.updateUserDetails(space);
      const cookie_obj = {
        access_token: data.user_info.access_token
      };
      /**
       * If device id is already set through the sign up page, do not
       */
      this.commonApiService.setSubDomainCookie(cookie_obj);
      this.sessionService.set('domains', domains);
      this.commonService.createDomainDictionary(domains);
      this.router.navigate([space.workspace, 'messages', '0']);
    });
  }

  setSubDomainCookie(device_id, domain) {
    const d = new Date();
    d.setTime(d.getTime() + (100 * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    if (!(window.location.hostname.includes('fugu.chat') || window.location.hostname.includes('officechat.io') ||
      window.location.hostname.includes('localhost'))) {
      document.cookie = `device_id=${device_id};${expires};domain=${domain};path=/`;
    } else {
      if (environment.production) {
        document.cookie = 'device_id=' + device_id + ';' + expires + ';domain=fugu.chat;path=/';
      } else {
        document.cookie = 'device_id=' + device_id + ';' + expires + ';domain=localhost;path=/';
        document.cookie = 'device_id=' + device_id + ';' + expires + ';domain=officechat.io;path=/';
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
    return string + '.' + (new Date()).getTime();
  }
}
