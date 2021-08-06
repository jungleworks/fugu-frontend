import { Component, OnInit } from '@angular/core';
import {ValidationService} from '../../services/validation.service';
import {FormBuilder, Validators} from '@angular/forms';
import {LoginService} from '../login/login.service';
import {CommonService} from '../../services/common.service';
import {MessageService} from '../../services/message.service';
import { CommonApiService } from '../../services/common-api.service';
import { SignupMode } from '../../enums/app.enums';
@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm;
  selected_country_code = {
    name: "",
    dialCode: "91",
    countryCode: "in",
  };
  isEmail;
  signupText = "";
  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    public commonApiService: CommonApiService,
    public commonService: CommonService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
            this.signupText = this.commonService.findSignupText();
       this.commonService.whiteLabelEmitter.subscribe((data) => {
         this.signupText = this.commonService.findSignupText();
       }); 
    this.forgotPasswordForm = this.formBuilder.group({
      emailOrPhone: [
        "",
        [Validators.required, ValidationService.emailOrPhoneValidator],
      ],
    });
    this.forgotPasswordForm.valueChanges.subscribe((value) => {
      if (
        value.emailOrPhone &&
        (value.emailOrPhone.includes("@") || isNaN(value.emailOrPhone))
      ) {
        this.isEmail = true;
      } else {
        this.isEmail = false;
      }
    });
  }

  getResetLink() {
    const obj = {};
      if (this.isEmail && this.commonService.signupMode == SignupMode.PHONE) {
        this.messageService.sendAlert({
          type: "danger",
          msg: "Enter a valid phone number",
          timeout: 2000,
        });
        return;
      } else if (
        !this.isEmail &&
        this.commonService.signupMode == SignupMode.EMAIL
      ) {
        this.messageService.sendAlert({
          type: "danger",
          msg: "Enter a valid email",
          timeout: 2000,
        });
        return;
      }
    if (this.isEmail) {
      obj["email"] = this.forgotPasswordForm.value.emailOrPhone;
    } else {
      obj["contact_number"] =
        "+" +
        this.selected_country_code.dialCode +
        "-" +
        this.forgotPasswordForm.value.emailOrPhone;
      obj[
        "country_code"
      ] = this.selected_country_code.countryCode.toUpperCase();
    }
    let space;

    // const path = window.location.pathname;
    // if(path) {
    //   space = url.split('/')[1];
    // }
    // const domain = window.location.hostname.split('.').splice(1,2).join('.');
    if (window.location.hostname != "localhost") {
      const domain = window.location.hostname.split(".").splice(1, 2).join(".");
      if (!["fugu.chat", "officechat.io"].includes(domain)) {
        obj["workspace"] = "spaces";
        obj["domain"] = domain;
      }
    }

    this.loginService.forgotPassword(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: "success",
        msg: response.message,
        timeout: 2000,
      });
      this.forgotPasswordForm.reset();
    });
  }
}
