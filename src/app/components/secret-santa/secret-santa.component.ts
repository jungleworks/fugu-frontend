import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FuguAppService } from '../../services/fugu-apps.service';
import { MessageService } from '../../services/message.service';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { messageModalAnimation } from '../../animations/animations';
import { CommonApiService } from '../../services/common-api.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-secret-santa',
  templateUrl: './secret-santa.component.html',
  styleUrls: ['./secret-santa.component.scss'],
  animations: [
    messageModalAnimation
  ]
})
export class SecretSantaComponent implements OnInit {
  appId;
  activeIndexTeamMember = -1;
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
  endingPopup;
  constructor(private service: FuguAppService,
    private cdRef: ChangeDetectorRef, private messageService: MessageService, public commonService: CommonService,
    public commonApiService: CommonApiService, private router: Router, private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    ) { }

  ngOnInit() {
    this.spaceData = this.commonService.currentOpenSpace;
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.searchUserInput = new FormControl();
    this.textarea = new FormControl();
    this.getAllMembers();
    this.searchUserInput.valueChanges
    .pipe(debounceTime(300))
    .subscribe(searchStr => {
      this.onUserSearch(searchStr);
    });
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
    this.service.publishMessageSecretSanta(obj).subscribe(res => {
      // this.messageService.sendAlert({
      //   type: 'success',
      //   msg: 'Message Sent',
      //   timeout: 3000
      // });
      this.textarea.reset();
      this.userListDisplayed = this.usersList.slice();
      // const data = {
      //   workspace_id: this.spaceData.workspace_id,
      //   is_secret_santa_enabled: 1
      // };
      // this.service.editConfiguration(data).subscribe(res1 => {
      //   this.spaceData.config['is_secret_santa_enabled'] = '1';
      //   // this.sessionService.set('currentSpace', this.spaceData);
      //   this.commonService.currentOpenSpace = this.spaceData;
      // });
      this.endingPopup = true;
    });
  }
  onUserSelectAll() {
    this.usersList.map(member => {
      member.selected = true;
    });
    this.cdRef.detectChanges();
  }
  goToHome() {
    this.loaderService.show();
    this.router.navigate(['../../../' + '/messages'], { relativeTo: this.activatedRoute });
    this.loaderService.hide();
  }
  onUserUnselectAll() {
    this.usersList.map(member => {
      member.selected = false;
    });
    this.cdRef.detectChanges();
  }

}
