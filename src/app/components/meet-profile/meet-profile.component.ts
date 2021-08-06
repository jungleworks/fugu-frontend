import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonService } from "../../services/common.service";
import { CommonApiService } from "../../services/common-api.service";
import { SessionService } from "../../services/session.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-meet-profile",
  templateUrl: "./meet-profile.component.html",
  styleUrls: ["./meet-profile.component.scss"],
})
export class MeetProfileComponent implements OnInit {
  meetPoints = [
    {
      text: "Create a meeting",
    },
    {
      text: "Join meeting via link/ ID",
    },
    {
      text: "Schedule a meeting",
    },
    {
      text: "Present/share your screen",
    },
    {
      text: "Record the meeting",
    },
  ];
  userData;
  constructor(
    public commonService: CommonService,
    public commonApiService: CommonApiService,
    private sessionService: SessionService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userData = this.sessionService.get("loginData/v1")["user_info"];
    window.addEventListener("message", (e) => {
      switch (e.data.type) {
        case "cal_link":
          this.userData.is_calendar_linked = e.data.data.cal_link;
          this.cdRef.detectChanges();
          break;
      }
    });
  }
  changeAuthorizedUrl() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
    };
    obj["domain"] = environment.LOCAL_DOMAIN;
    this.commonApiService.getAuthorizeUrl(obj).subscribe((response) => {
      // resolve(response);
      window.open(
        response.data,
        "_blank",
        "toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=500,height=600"
      );
    });
  }
}
