import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FuguAppService } from '../../services/fugu-apps.service';
import { SessionService } from '../../services/session.service';
import { MessageService } from '../../services/message.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-fugu-apps-details',
  templateUrl: './fugu-apps-details.component.html',
  styleUrls: ['./fugu-apps-details.component.scss']
})
export class FuguAppsDetailsComponent implements OnInit {
  appDetails;
  currentAppId;
  spaceData;
  userData;
  showSecretSanta = false;
  openInputPopup = false;
  authToken;
  hrmUrl;
  constructor(private router: Router, private route: ActivatedRoute, private service: FuguAppService,
    private sessionService: SessionService, private messageService: MessageService, private commonService: CommonService) { }

  ngOnInit() {
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.route.params.subscribe(res => {
      this.currentAppId = res.appId;
      this.getAppDetails();
    });
    this.route.queryParams
    .subscribe(params => {
      if (params['santa']) {
        this.showSecretSanta = params['santa'];
      }
    });
  }
  getAppDetails() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      workspace_id: this.spaceData.workspace_id,
      app_id: this.currentAppId
    };
    this.service.getAppDetail(obj)
    .subscribe((res) => {
      this.appDetails = res.data[0];
      if (this.appDetails.page_url) {
        this.appDetails.page_url = encodeURIComponent(this.appDetails.page_url.startsWith('http') ? this.appDetails.page_url : 'https://' + window.location.hostname + this.appDetails.page_url );
      }
      this.appDetails.categories = JSON.parse(this.appDetails.categories);
    });
  }
  openInstallation() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      workspace_id: this.spaceData.workspace_id,
      app_id: +this.currentAppId,
      time_zone: new Date().getTimezoneOffset() * -1,
      auth_token: this.authToken ? this.authToken : undefined,
      hrm_url: this.hrmUrl ? this.hrmUrl : undefined,
      is_install_hrm_bot: this.currentAppId == 12 ? 1 : undefined
    };
    this.service.installApp(obj)
      .subscribe((res) => {
        if (this.openInputPopup) {
          this.openInputPopup = false;
        }
        this.appDetails.status = 1;
        this.messageService.sendAlert({
          type: 'success',
          msg: 'Installed successfully',
          timeout: 2000
        });
      });
  }

  editApp() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      app_id: +this.currentAppId,
      workspace_id: this.spaceData.workspace_id,
      status: this.appDetails.status == 0 ? 1 : 0
    };
    this.service.editApp(obj).subscribe(res => {
      this.appDetails.status == 0 ? this.appDetails.status = 1 : this.appDetails.status = 0;
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Successful',
        timeout: 2000
      });
      // this.spaceData.config['is_secret_santa_enabled'] = '0';
      // this.sessionService.set('currentSpace', this.spaceData);
    });
  }
}
