import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { JoinService } from './join.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { MessageService } from '../../services/message.service';
import {SessionService} from '../../services/session.service';
import {CommonService} from '../../services/common.service';
import { CommonApiService } from '../../services/common-api.service';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: "app-join",
  templateUrl: "./join.component.html",
  styleUrls: ["./join.component.scss"],
})
export class JoinComponent implements OnInit {
  spaceName = "";
  usersCount;
  inviteForm;
  isPublicInvite;
  ws;
  isEmail;
  selected_country_code = {
    name: "",
    dialCode: "91",
    countryCode: "in",
  };
  showJoinButton = false;
  ws_name;
  invite_token;
  constructor(
    private service: JoinService,
    private router: Router,
    private sessionService: SessionService,
    public commonService: CommonService,
    public commonApiService: CommonApiService,
    private loader: LoaderService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    // this.spaceName = window.location.host.split('.')[0];
    this.inviteForm = this.formBuilder.group({
      email: [
        "",
        [Validators.required, ValidationService.emailOrPhoneValidator],
      ],
    });
    this.ws = window.location.pathname.split("/")[1];
    //window.location.host.split('.')[0]
    const obj = {
      workspace: encodeURIComponent(window.location.pathname.split("/")[1]),
    };

    if (
      this.sessionService.get("loginData/v1") &&
      this.sessionService.get("loginData/v1")["user_info"]
    ) {
      const loginData = this.sessionService.get("loginData/v1")["user_info"];
      obj["user_unique_key"] = loginData.user_id;
    }
    // const url = '?workspace=' + encodeURIComponent(window.location.host.split('.')[0]);
    this.commonApiService.getPublicInviteDetails(obj).subscribe((res) => {
      if (res.data.user_already_exist) {
        this.router.navigate([res.data.workspace_name, "messages", 0]);
        return;
      }
      if (res.data.invitation_token) {
        this.ws_name = res.data.workspace_name;
        this.showJoinButton = true;
        this.invite_token = res.data.invitation_token;
        // this.joinSpace(res.data.invitation_token, res.data.workspace_name);
      }
      this.isPublicInvite = res.data.public_invite_enabled;
      this.usersCount = res.data.registered_users;
      if (!this.isPublicInvite) {
        const obj1 = { space: this.ws };
        /**
         * sending query param to differentiate the login page from the officechat login page
         */
        this.router.navigate(["/login"], {
          queryParams: obj1,
        });
      }
    });

    this.inviteForm.valueChanges.subscribe((value) => {
      if (value.email && (value.email.includes("@") || isNaN(value.email))) {
        this.isEmail = true;
      } else {
        this.isEmail = false;
      }
    });
  }

  joinSpace(token, space) {
    this.loader.show();
    const obj = {
      email_token: token,
      invitation_type: "ALREADY_INVITED",
    };
    this.commonApiService.joinWorkspace(obj).subscribe((res) => {
      this.router.navigate([space, "messages", 0]);
    });
  }

  joinCommunity() {
    if (this.invite_token) {
      this.joinSpace(this.invite_token, this.ws_name);
    } else {
      this.router.navigate([this.ws_name, "messages", 0]);
    }
  }

  onInviteClick() {
    const obj = {
      workspace: this.ws,
      invitation_type: "PUBLIC_INVITATION",
    };
    if (this.isEmail) {
      obj["email"] = this.inviteForm.value.email;
    } else {
      obj["contact_number"] =
        "+" +
        this.selected_country_code.dialCode +
        "-" +
        this.inviteForm.value.email;
      obj[
        "country_code"
      ] = this.selected_country_code.countryCode.toUpperCase();
    }

    this.service.invitePublicUser(obj).subscribe((response) => {
      this.inviteForm.reset();
      this.messageService.sendAlert({
        type: "success",
        msg: response.message,
        timeout: 4000,
      });
    });
  }
}
