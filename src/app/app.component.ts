import { CommonService } from './services/common.service';
import {Component, OnInit} from '@angular/core';
import { environment } from '../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CommonApiService } from './services/common-api.service';
import { SessionService } from './services/session.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  environmentVar = environment;
  showChangeUrlPopup = false;
  pointingUrlTest: string = environment.FUGU_API_ENDPOINT;
  socketPointingUrlTest: string = environment.SOCKET_ENDPOINT;
  constructor(public commonService: CommonService, private activatedRoute: ActivatedRoute,
     private commonApiService: CommonApiService, private sessionService: SessionService) {
  }
  ngOnInit() {
    if (localStorage.getItem('pointingUrlTest')) {
      this.pointingUrlTest = localStorage.getItem('pointingUrlTest');
      environment.FUGU_API_ENDPOINT = this.pointingUrlTest;
    }
    if (localStorage.getItem('socketPointingUrlTest')) {
      this.socketPointingUrlTest = localStorage.getItem('socketPointingUrlTest');
      environment.SOCKET_ENDPOINT = this.socketPointingUrlTest;
    }
    const domain = window.location.hostname.split('.').splice(1, 8).join('.');
    this.commonApiService.updateWhitelabelDomain(domain);
    if (['fugu.chat', 'officechat.io'].includes(domain)) {
      document.title = 'Fugu';
    }

    //fetch workspace from params
    let url, workspace;
    this.activatedRoute.params.subscribe(
      (params) => {
        if (params && params['space']) {
          workspace = params['space'];
        }
      });

    if (window.location.hostname) {
      url = window.location.hostname;
      if (url == 'localhost') {
        workspace = 'spaces';
      }
    }

    const d = {
      workspace: workspace || 'spaces',
      domain: url == 'localhost' ? environment.LOCAL_DOMAIN : url.replace(url.substr(0, url.indexOf('.') + 1), '')
    };
    this.commonApiService.getWorkspaceDetails(d).subscribe(res => {
      this.commonService.showAppDetails = true;
      const data  = res.data[0];
      if (data && data.google_client_id) {
        this.commonService.google_client_id = JSON.parse(data.google_client_id);
      }
      if (data && data.show_meet_tab) {
        this.commonService.show_meet_tab = data.show_meet_tab;
      }
      if (data && data.properties) {
        if (data.properties.is_old_flow) {
          this.commonService.isOldFlow = data.properties.is_old_flow;
        }
        if (data.properties.signup_mode) {
          this.commonService.signupMode = data.properties.signup_mode;
        }
        this.commonService.isWhitelabelled = data.properties.is_white_labelled;
        if (this.commonService.isWhitelabelled) {
          this.commonApiService.updateWhitelabelConfigutaions({
            app_name: data.app_name,
            logo: data.logo,
            fav_icon: data.fav_icon,
            full_domain: data.full_domain,
            domain: data.domain,
            is_whitelabeled: data.properties.is_white_labelled,
            branch_key: data.properties.branch_id,
            properties: data.properties,
            meet_url: data.properties.conference_link,
            colors: data.colors,
            android_app_link: data.android_app_link,
            ios_app_link: data.ios_app_link
          });
        }
      }
      setTimeout(() => {
        this.commonService.whiteLabelEmitter.emit(true);
      }, 300);
  });
}

savePointingUrlTest() {
  environment.FUGU_API_ENDPOINT = this.pointingUrlTest;
  environment.SOCKET_ENDPOINT = this.socketPointingUrlTest;
  localStorage.setItem('pointingUrlTest', this.pointingUrlTest);
  localStorage.setItem('socketPointingUrlTest', this.socketPointingUrlTest);
  this.showChangeUrlPopup = false;
}

}

