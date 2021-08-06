import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { RedirectCalendarService } from "./redirect-calendar.service";
import { ActivatedRoute } from "@angular/router";
import { SessionService } from "../../services/session.service";
import { CommonService } from "../../services/common.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-redirect-calendar",
  templateUrl: "./redirect-calendar.component.html",
  styleUrls: ["./redirect-calendar.component.css"],
})
export class RedirectCalendarComponent implements OnInit {
  constructor(
    public redirectCalendarService: RedirectCalendarService,
    private activatedRoute: ActivatedRoute,
    private sessionService: SessionService,
    public commonService: CommonService,
    private cdRef: ChangeDetectorRef
  ) {}
  userData = this.sessionService.get("loginData/v1")["user_info"];
  auth_token;
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((param) => {
      this.auth_token = param.code;
    });
    const obj = {
      user_unique_key: this.userData.user_id,
      auth_token: this.auth_token,
    };
    obj["domain"] = environment.LOCAL_DOMAIN;
    this.redirectCalendarService
      .submitAuthorizeCode(obj)
      .subscribe((response) => {
            window.opener.postMessage(
              { type: "cal_link", data: { cal_link: true } },
              "*"
            );
        this.cdRef.detectChanges();
        setTimeout( () => {
          window.close();
        }, 1000)
      });
  }
}
