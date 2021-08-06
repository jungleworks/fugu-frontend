import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Sanitizer} from '@angular/core';
import { FuguAppService } from '../../services/fugu-apps.service';
import { SessionService } from '../../services/session.service';
import { FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-fugu-apps-installation',
  templateUrl: './fugu-apps-installation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./fugu-apps-installation.component.scss']
})
export class FuguAppsInstallationComponent implements OnInit {
  appId;
  trelloApiKey;
  searchUserInput;
  spaceData;
  standUpActiveStep = 1;
  textarea;
  userData;
  usersList;
  userListDisplayed;
  iframe_url;
  currentAppId;
  webhookId;
  pageUrl;
  params = {};
  currentUrl;
  token;
  match;
  @ViewChild('teamMembersContainer') teamMembersContainer;
  constructor(private service: FuguAppService, private sessionService: SessionService,
    private cdRef: ChangeDetectorRef, private messageService: MessageService, private commonService: CommonService,
    private activatedRoute: ActivatedRoute, private fb: FormBuilder, private sanitizer: DomSanitizer) {
     }

  ngOnInit() {

    this.activatedRoute.params.subscribe(res => {
      this.currentAppId = res.appId;
      this.webhookId = res.webhookId;
      this.token = res.token;
      this.pageUrl = decodeURIComponent(res.pageUrl);
      if (this.pageUrl.includes('trello')) {
        this.trelloApiKey = environment.TRELLO_API_KEY;
      }
    });
    window.onmessage = function (e) {
      if (e.data.type === 'trello_auth') {
        window.open(e.data.url, '_self');
      }
    };
    const regex = /[?&#]([^=#]+)=([^&#]*)/g;
      this.currentUrl = window.location.href;
    while ((this.match = regex.exec(this.currentUrl))) {
      this.params[this.match[1]] = this.match[2];
    }
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]]
    let iframe_temp_url = this.pageUrl + '?en_user_id='
    + this.userData.en_user_id + '&app_secret_key=' + this.spaceData.fugu_secret_key + '&app_id='
    + this.currentAppId + '&env=' + (environment.production ? 'prod' : 'dev');
    if (!this.params['token']) {
      iframe_temp_url += '&top=' + (encodeURIComponent(window.location.href)).replace('#token=', '');
    }
    if (this.webhookId) {
      iframe_temp_url += '&webhook_id=' + this.webhookId;
    }
    if (this.trelloApiKey) {
      iframe_temp_url += '&trkey=' + this.trelloApiKey;
    }
    if (this.token) {
      iframe_temp_url += '&token=' + this.token;
    }
    if (this.params['token']) {
      iframe_temp_url += '&token=' + this.params['token'];
    }
    this.iframe_url = iframe_temp_url;
    this.iframe_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.iframe_url);
    this.searchUserInput = new FormControl();
    this.textarea = new FormControl();
    // this.activatedRoute.params.subscribe(param => {
    //   this.appId = param.appId;
    //   switch (+this.appId) {
    //     case 1:
    //       this.searchUserInput.valueChanges
    //       .pipe(debounceTime(300))
    //       .subscribe(searchStr => {
    //         this.onUserSearch(searchStr);
    //       });
    //       this.getAllMembers();
    //       break;
    //   }
    // });
  }

  getAllMembers() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_type: 'ALL_MEMBERS',
      user_status: 'ENABLED',
    };
    this.service.getAllMembers(obj)
      .subscribe(res => {
        this.usersList = res.data.all_members;
        this.usersList.map(el => el.selected = false);
        this.userListDisplayed = this.usersList.slice();
        this.cdRef.detectChanges();
      });
  }

  onUserSearch(str) {
    if (str.trim() == '') {
      this.userListDisplayed = this.usersList.slice();
    } else {
      this.userListDisplayed = this.usersList.filter(member => member.full_name.toLowerCase().includes(str.toLowerCase()));
    }
    this.cdRef.detectChanges();
  }
  onMemberSelect(member) {
    member.selected = !member.selected;
    for (let i = 0; i < this.usersList.length; i++) {
      const element = this.usersList[i];
      if (element.fugu_user_id == member.fugu_user_id) {
        element.selected = member.selected;
        break;
      }
    }
    this.cdRef.detectChanges();
  }

  sendSecretSantaMessage() {
    const selectedUser = [];
    this.usersList.map(member => {
      if (member.selected) {
        selectedUser.push({
          user_id: member.fugu_user_id,
          full_name: member.full_name
        });
      }
    });
    if (selectedUser.length == 0) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'No user selected',
        timeout: 3000
      });
      return;
    } else if (selectedUser.length == 1) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Please select atleast two users',
        timeout: 3000
      });
      return;
    }
    const obj = {
      en_user_id: this.userData.en_user_id,
      users_data: selectedUser,
    };
    if (this.textarea.value && this.textarea.value.trim() != '') {
      obj['message'] = this.textarea.value.trim();
    }
    this.service.publishMessageOnFuguBot(obj).subscribe(res => {
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Message Sent',
        timeout: 3000
      });
      this.textarea.reset();
      this.userListDisplayed = this.usersList.slice();
      const data = {
        workspace_id: this.spaceData.workspace_id,
        is_secret_santa_enabled: 1
      };
      this.service.editConfiguration(data).subscribe(res1 => {
        this.spaceData.config['is_secret_santa_enabled'] = '1';
        // this.sessionService.set('currentSpace', this.spaceData);
        this.commonService.currentOpenSpace = this.spaceData;
      });
    });
  }
  onUserSelectAll() {
    this.usersList.map(member => {
      member.selected = true;
    });
    this.cdRef.detectChanges();
  }
  onUserUnselectAll() {
    this.usersList.map(member => {
      member.selected = false;
    });
    this.cdRef.detectChanges();
  }
}
