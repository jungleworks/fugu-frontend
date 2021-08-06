import {Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { FormControl } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { FuguAppService } from '../../services/fugu-apps.service';
import { CommonService } from '../../services/common.service';

interface IFuguApps {
  app_id: number;
  name: string;
  icon: string;
  description: string;
  status: number;
  tag_line: string;
}
@Component({
  selector: 'app-fugu-apps-popup',
  templateUrl: './fugu-apps-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./fugu-apps-popup.component.scss']
})
export class FuguAppsPopupComponent implements OnInit {
  @Output() closeAppsPopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  searchFuguApps;
  all_apps: Array<IFuguApps> = [];
  userData;
  spaceData;
  constructor(private sessionService: SessionService, private service: FuguAppService, private cdRef: ChangeDetectorRef, private commonService: CommonService) { }

  ngOnInit() {
    this.searchFuguApps = new FormControl();
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.getFuguApps();
  }

  getFuguApps() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      workspace_id: this.spaceData.workspace_id
    };
    this.service.getAppDetail(obj)
      .subscribe((res) => {
        this.all_apps = res.data;
        this.cdRef.detectChanges();
      });
    // const apps = [
    //   {
    //     app_id: 1,
    //     name: 'Secret Santa',
    //     logo: 'assets/img/santa-claus.svg',
    //     desc: 'Run Secret Santa for your organisation',
    //     is_installed: this.spaceData.config['is_secret_santa_enabled'] == 1 ? true : false,
    //   },
    //   {
    //     app_id: 2,
    //     name: 'Attendace Bot',
    //     logo: 'assets/img/test4.png',
    //     desc: 'Super simple attendance and time tracking',
    //     is_installed: this.spaceData.config['is_secret_santa_enabled'] == 1 ? true : false,
    //   }
    // ];
    // apps.map(app => {
    //   if (app.is_installed) {
    //     this.installedApps.push(app);
    //   } else {
    //     this.availableApps.push(app);
    //   }
    // });
  }

}
