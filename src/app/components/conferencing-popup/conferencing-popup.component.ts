import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener,
  Input, OnInit, Output, ViewChild
} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {MessageService} from '../../services/message.service';
import {CommonService} from '../../services/common.service';
import {ConferencingPopupService} from './conferencing-popup.service';
import {SessionService} from '../../services/session.service';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {flyInOut} from '../../animations/animations';
import {CommonApiService} from '../../services/common-api.service';
import {environment} from '../../../environments/environment';

let users_list_copy = [];
let allMembersList;

interface IUserData {
  full_name: string;
  user_id: number;
  email: string;
  user_image: string;
}

interface ISelectedUserData {
  [member: number]: IUserData;
}

@Component({
  selector: 'app-conferencing-popup',
  templateUrl: './conferencing-popup.component.html',
  styleUrls: ['./conferencing-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    flyInOut,
    trigger('popup-open', [
      transition('void => *', [
        style({transform: 'scale(0)', opacity: 0}),
        animate('200ms', style({transform: 'scale(1)', opacity: 1}))
      ]),
      transition('* => void', [
        animate('200ms', style({transform: 'scale(0)', opacity: 0}))
      ])
    ])
  ]
})
export class ConferencingPopupComponent implements OnInit, AfterContentInit {
  users_list: Array<IUserData> = [];
  @Input() user_count;
  @Input() isLiveStream;

  @Input()
  set all_members_data(data: Array<IUserData>) {
    /**
     * filtering user's own user id
     */
    allMembersList = data;
    this.users_list = data.filter((item) => {
      return item.user_id != this.commonService.userDetails.user_id;
    });
    users_list_copy = [...this.users_list];
  }

  @Input() active_channel_id;
  @Input() isAudioConference;
  @Input() isTaskMembers;
  selected_members: ISelectedUserData = {};
  send_btn_enabled = false;
  spaceData;
  searchCtrl;
  active_index = 0;
  selectAllMembersCheckBox = false;
  @ViewChild('usersContainer', {static: true}) usersContainer;
  @Output() closeConferencingModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() startLivestreamPublish: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() selectedMembers: EventEmitter<any> = new EventEmitter<any>();

  /**
   * generate 10 character random room name as group name can be same
   */
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

  /**
   * handling escape key press
   */
  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (event.key === 'Escape') {
      this.closeConferencingModal.emit(true);
    }
  }

  constructor(
    private messageService: MessageService,
    private commonService: CommonService,
    private service: ConferencingPopupService,
    private sessionService: SessionService,
    private cdRef: ChangeDetectorRef,
    private commonApiService: CommonApiService
  ) {
  }

  ngOnInit() {
    this.searchCtrl = new FormControl();
    if (this.isLiveStream) {
      this.selectAllMembersCheckBox = true;
    }
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this.searchCtrl.valueChanges.pipe(debounceTime(300)).subscribe((data) => {
      if (data) {
        this.active_index = 0;
        this.searchUsers(data);
      } else {
        this.users_list = users_list_copy;
      }
      this.cdRef.detectChanges();
    });
  }

  ngAfterContentInit(): void {
    document.getElementById('conferenceSearchBox').focus();
  }

  unselectAllMembers() {
    this.selectAllMembersCheckBox = false;
    this.selected_members = {};
    this.selected_members = {...this.selected_members};
    this.send_btn_enabled = false;
  }

  selectAllMembers() {
    this.users_list.map((member) => {
      this.selected_members[member.user_id] = member;
    });
    this.selected_members = {...this.selected_members};
    this.selectAllMembersCheckBox = true;
    this.send_btn_enabled = true;
    this.cdRef.detectChanges();
  }

  addMember(member) {
    this.selectAllMembersCheckBox = false;
    if (
      Object.keys(this.selected_members).length ==
      JSON.parse(this.spaceData.config.max_conference_participants)
    ) {
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
      this.send_btn_enabled = !!Object.keys(this.selected_members).length;
      this.searchCtrl.reset();
    } else {
      delete this.selected_members[member.user_id];
      this.selected_members = {...this.selected_members};
      this.selectAllMembersCheckBox = false;
      if (!Object.keys(this.selected_members).length) {
        this.selectAllMembersCheckBox = false;
        this.send_btn_enabled = false;
      }
      this.searchCtrl.reset();
      // this.messageService.sendAlert({
      //   type: 'danger',
      //   msg: 'User already added.',
      //   timeout: 2000
      // });
    }
  }

  removeMember(member) {
    delete this.selected_members[member];
    this.selected_members = {...this.selected_members};
    this.selectAllMembersCheckBox = false;
    if (!Object.keys(this.selected_members).length) {
      this.selectAllMembersCheckBox = false;
    }
    this.send_btn_enabled = !!Object.keys(this.selected_members).length;
  }

  inviteLivestreamMembers() {
    this.startLivestreamPublish.emit();
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      invite_user_ids: !this.selectAllMembersCheckBox
        ? Object.keys(this.selected_members)
        : undefined,
      is_select_all: this.selectAllMembersCheckBox ? 1 : 0,
      workspace_id: this.spaceData.workspace_id,
      channel_id: this.active_channel_id,
      stream_type: 'PUBLISH'
    };
    if (this.commonService.isWhitelabelled) {
      obj['domain'] = this.commonApiService.whitelabelConfigurations['domain'];
    } else {
      obj['domain'] = environment.LOCAL_DOMAIN;
    }
    this.commonApiService.joinLiveStream(obj).subscribe((res) => {
      this.closeConferencingModal.emit(true);
      if (res.data.link) {
        window.open(res.data.link);
      }
    });
  }

  inviteMembers() {
    let domain = environment.FUGU_CONFERENCE_URL;
    if (this.commonApiService.whitelabelConfigurations['properties']) {
      domain = this.commonApiService.whitelabelConfigurations['properties'].conference_link;
    }
    let conf_url;
    if (this.isAudioConference) {
      // conf_url = `${domain}/${ConferencingPopupComponent.generateRandomString()}#${'config.startWithVideoMuted=true'}`;
      conf_url = `${
        environment.FUGU_CONFERENCE_URL
      }/${ConferencingPopupComponent.generateRandomString()}#config.startWithVideoMuted=true`;
    } else {
      // conf_url = `${domain}/${ConferencingPopupComponent.generateRandomString()}`;
      conf_url = `${
        environment.FUGU_CONFERENCE_URL
      }/${ConferencingPopupComponent.generateRandomString()}`;
    }
    window.open(
      conf_url,
      '_blank',
      `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${
        window.outerWidth - 100
      },height=${window.outerHeight - 100}`
    );
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      invite_user_ids: Object.keys(this.selected_members),
      invite_link: conf_url,
      is_audio_conference: this.isAudioConference ? true : undefined
    };
    this.service.inviteToConference(obj).subscribe((res) => {
      this.closeConferencingModal.emit(true);
    });
  }

  searchUsers(name: string) {
    if (this.user_count > allMembersList.length && name.length > 1) {
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        search_text: name,
        channel_id: this.active_channel_id
      };
      this.commonApiService.searchUsersInGroup(obj).subscribe((response) => {
        this.users_list = response.data.users.filter(
          (member) => member.user_id != this.commonService.userDetails.user_id
        );
        this.cdRef.detectChanges();
      });
    } else {
      this.users_list = users_list_copy.filter((member) =>
        member.full_name.toLowerCase().includes(name.toLowerCase())
      );
    }
  }

  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {
    if (event.key == 'ArrowUp') {
      this.searchUpArrow();
    } else if (event.key == 'ArrowDown') {
      this.searchDownArrow();
    } else if (event.key == 'Enter') {
      const el = document.getElementById('users' + this.active_index);
      if (el) {
        el.click();
      }
    }
  }

  private searchDownArrow() {
    if (this.active_index != this.users_list.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 64;
      const scrollTop = this.usersContainer.elementRef.nativeElement.scrollTop;
      const viewport =
        scrollTop + this.usersContainer.elementRef.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.usersContainer.elementRef.nativeElement.scrollTop += 64;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 64;
      const scrollTop = this.usersContainer.elementRef.nativeElement.scrollTop;
      const viewport =
        scrollTop + this.usersContainer.elementRef.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.usersContainer.elementRef.nativeElement.scrollTop -= 64;
      }
    }
  }

  sendInfo() {
    this.selectedMembers.emit(Object.keys(this.selected_members));
  }
}
