import { Component, OnInit, ViewChild, EventEmitter, Output, ChangeDetectorRef, Input } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { CreateGroupService } from '../create-group/create-group.service';
import { FormControl } from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import { LocalStorageService } from '../../services/localStorage.service';
import { flyInOut, scaleInOut } from '../../animations/animations';
import { MessageService } from '../../services/message.service';
import { CommonApiService } from '../../services/common-api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-switch-conference-popup',
  templateUrl: './switch-conference-popup.component.html',
  styleUrls: ['./switch-conference-popup.component.scss'],
  animations: [
    flyInOut,
    scaleInOut
  ]
})
export class SwitchConferenccPopupComponent implements OnInit {
  showAddMemberConferencingPopup = false;
  spaceData;
  inviteConferenceSearchCtrl;
  search_results = [];
  selected_members = {};
  active_index = 0;
  user_details;
  frequently_contacted = {};
  @ViewChild('conferenceMemberContainer', { static: true }) conferenceMemberContainer;
  @Output() closeConferenceInvitePopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() inviteMembersEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() channel_info;
  @Input() isAudioConference;
  static generateRandomString() {
    const charsLower = 'abcdefghijklmnopqrstuvwxyz';
    const charsUpper = charsLower.toUpperCase();
    let chars;

    chars = charsLower + charsUpper;

    const length = 10;

    let string = '';
    for (let i = 0; i < length; i++) {
      let randomNumber = Math.floor(Math.random() * 32) + 1;
      randomNumber = randomNumber || 1;
      string += chars.substring(randomNumber - 1, randomNumber);
    }
    return string;
  }
  constructor(private commonService: CommonService, private sessionService: SessionService,
    private service: CreateGroupService, private commonApiService: CommonApiService,
    private cdRef: ChangeDetectorRef, private localStorageService: LocalStorageService, private messageService: MessageService,) {}


  ngOnInit() {
    if (this.localStorageService.get('frequently-contacted-v2')) {
      this.frequently_contacted = <any>this.localStorageService.get('frequently-contacted-v2')[window.location.pathname.split('/')[1]];
    }
    const user_details = this.sessionService.get('user_details_dict')
    this.user_details = user_details[window.location.pathname.split('/')[1]];
    this.inviteConferenceSearchCtrl = new FormControl();
    this.inviteConferenceSearchCtrl.valueChanges
    .pipe(debounceTime(300))
    .subscribe(data => {
      this.active_index = 0;
      this.conferenceMemberContainer.nativeElement.scrollTop = 0;
      if (data && data.length > 1) {
        this.searchUsersInInvite(data);
      } else {
        this.search_results = this.searchUsers(data || '');
      }
      this.cdRef.detectChanges();
    });
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    if(!this.spaceData) {
      const currentWorkspace = window.location.pathname.split('/')[1];
      const domainsData = this.sessionService.get('spaceDictionary');
      this.spaceData = domainsData[currentWorkspace];
    }
    this.getMembersList();
  }

  getMembersList() {
    if (this.frequently_contacted) {
      this.search_results = Object.values(this.frequently_contacted);
      this.search_results = this.search_results.filter((item) => {
        return (item.user_id != this.channel_info.user_id);
      });
    }
  }

  inviteMembers() {
    let domain = environment.FUGU_CONFERENCE_URL
    if (this.commonApiService.whitelabelConfigurations['properties']) {
      domain = this.commonApiService.whitelabelConfigurations['properties'].conference_link;
    }
    // in case of video call object is empty 
    let userData = this.sessionService.get('loginData/v1');
    if(userData && userData['whitelabel_details'] && userData['whitelabel_details']['properties']) {
      domain = userData['whitelabel_details']['properties'].conference_link;
    }
    // whitelabel_details.properties.conference_link
    let conf_url;
    if (this.isAudioConference) {
      conf_url = `${domain}/${SwitchConferenccPopupComponent.generateRandomString()}#${'config.startWithVideoMuted=true'}`;
    } else {
      conf_url = `${domain}/${SwitchConferenccPopupComponent.generateRandomString()}`;
    }
    const obj = {
      en_user_id: this.user_details.en_user_id,
      invite_user_ids: Object.keys(this.selected_members).map(item => {
        return parseInt(item);
      }),
      invite_link: conf_url,
      is_audio_conference: this.isAudioConference ? true : undefined
    };
    this.inviteMembersEvent.emit(obj);
  }

  addMember(member) {
    if (Object.keys(this.selected_members).length ==
    JSON.parse(this.spaceData.config.max_conference_participants)) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: `Max ${JSON.parse(this.spaceData.config.max_conference_participants)} persons are allowed.`,
        timeout: 2000
      });
      return;
    }
    if (!this.selected_members[member.user_id]) {
      this.selected_members[member.user_id] = member;
      this.selected_members = {...this.selected_members};
      this.inviteConferenceSearchCtrl.reset();
      document.getElementById('conference-search-box').focus();
    }
  }
  removeMember(member) {
    delete this.selected_members[member];
    this.selected_members = {...this.selected_members};
    if (!this.inviteConferenceSearchCtrl.value) {
      this.search_results = Object.values(this.frequently_contacted);
      this.search_results = this.searchUsers('');
    }
  }
  searchUsers(name: string) {
    return this.search_results.filter(member =>
      member.full_name.toLowerCase().includes(name.toLowerCase()) && !this.selected_members[member.user_id]
      && member.user_id != this.channel_info.user_id);
  }
  searchUsersInInvite(search_text) {
    const obj = {
      en_user_id: this.user_details.en_user_id,
      search_text: search_text,
      user_role: this.spaceData.role
    };
    this.commonApiService.search(obj)
    .subscribe(response => {
      if (response.statusCode === 200) {

          this.search_results = [];
          this.search_results = response.data.users;
          this.search_results = this.search_results.filter((item) => {
            return (item.user_id != this.user_details.user_id && item.user_id != this.channel_info.user_id);
          });
          this.active_index = 0;

        this.conferenceMemberContainer.nativeElement.scrollTop = 0;
        this.cdRef.detectChanges();
      }
    });
  }

  private searchDownArrow() {
    if (this.active_index != this.search_results.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 62;
      const scrollTop = this.conferenceMemberContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.conferenceMemberContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.conferenceMemberContainer.nativeElement.scrollTop += 62;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 62;
      const scrollTop = this.conferenceMemberContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.conferenceMemberContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.conferenceMemberContainer.nativeElement.scrollTop -= 62;
      }
    }
  }

  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {
    if (event.key == 'ArrowUp') {
      this.searchUpArrow();
    } else if (event.key == 'ArrowDown') {
      this.searchDownArrow();
    } else if (event.key == 'Enter') {
      document.getElementById('conference-members' + this.active_index).click();
      this.conferenceMemberContainer.nativeElement.scrollTop = 0;
    }
  }

}
