import { Component, OnInit } from '@angular/core';
import {CommonService} from '../../services/common.service';
import {environment} from '../../../environments/environment';
import {SessionService} from '../../services/session.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-not-invited',
  templateUrl: './not-invited.component.html',
})
export class NotInvitedComponent implements OnInit {
  spaceName = '';
  isPublicInvite;
  constructor(public commonService: CommonService, private sessionService: SessionService, public commonApiService: CommonApiService) { }

  ngOnInit() {
    this.spaceName = window.location.pathname.split('/')[1];
    const obj = {
      workspace: encodeURIComponent(window.location.pathname.split('/')[1])
    };
    // const url = '?workspace=' + encodeURIComponent(window.location.host.split('.')[0]);
    this.commonApiService.getPublicInviteDetails(obj).subscribe((res) => {
      this.isPublicInvite = res.data.public_invite_enabled;
    });
  }

  logout() {
    this.sessionService.removeAll();
    this.commonApiService.setSubDomainCookie([]);
    if (this.commonService.isWhitelabelled) {
      window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/login`, '_self');
    } else {
      window.open(environment.LOGOUT_REDIRECT, '_self');
    }
  }

}
