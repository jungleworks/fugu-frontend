import {animate, style, transition, trigger} from '@angular/animations';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  EventEmitter, Input, OnInit, Output, ViewChild
} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {fadeIn, messageModalAnimation, profileImageEnlarge} from '../../animations/animations';
import {
  ChatTypes,
  MessageType,
  NotificationAlertType,
  Role,
  UploadChannelImageTypes,
  UserStatus,
  UserType,
  groupNotificationType
} from '../../enums/app.enums';
import {CommonService} from '../../services/common.service';
import {LoaderService} from '../../services/loader.service';
import {MessageService} from '../../services/message.service';
import {SessionService} from '../../services/session.service';
import {SocketioService} from '../../services/socketio.service';
import {ChatService} from '../chat/chat.service';
import {LayoutService} from '../layout/layout.service';
import {CommonApiService} from '../../services/common-api.service';
import {MatAutocomplete} from '@angular/material/autocomplete';
import {CalendarOptions} from '@fullcalendar/angular';
import {ActivatedRoute, Router} from '@angular/router'; // useful for typechecking
declare const Calendar: any;
let all_members = [];
declare const moment: any;

interface IManagerData {
  full_name: string;
  fugu_user_id: number;
}

let user_page_start = 0;
let stopHitMembers = false;
let page_size_count;
let user_page_size_count;

@Component({
  selector: 'app-profile-component',
  templateUrl: './profile-component.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./profile-component.component.scss'],
  animations: [
    fadeIn,
    messageModalAnimation,
    profileImageEnlarge,
    trigger('mediaAnim', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate(250)
      ])
    ])
  ]
})
export class ProfileComponentComponent implements OnInit {
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  show_date_range_picker_start;
  show_date_range_picker_end;
  show_date_range_picker_rem;
  date_range_picker_obj = {
    start_date: this.createFormattedDate(new Date(), -6),
    end_date: this.createFormattedDate(new Date(), 0)
  };
  taskTitle;
  taskDescription;
  startDate;
  startTime;
  startDateTime;
  endTime;
  endDate;
  endDateTime;
  remTime;
  remDate;
  remDateTime;
  activeChannelId;
  animationHeightX;
  animationHeightY;
  managerData = <IManagerData>{
    full_name: '',
    fugu_user_id: null
  };
  previousManagerData = <IManagerData>{};
  managerDropupOpen = false;
  active_index = 0;
  show_members = false;
  membersInfo = [];
  memberSub: Subscription;
  is_group_joined;
  tempUserIdToRemove;
  otherUserId;
  spaceData;
  channel_image_object = {
    channel_image_url: '',
    channel_thumbnail_url: ''
  };
  profileForm;
  profileInfo;
  choosenUserEmail;
  memberSearchCtrl;
  managerSearchCtrl;
  RoleStatusEnum = Role;
  roleStatus = Role.isUser;
  currentGroupRole = Role.isUser;
  editContact = false;
  showImageLayer = false;
  showImageCarousel = false;
  dataForCarousel = {};
  isAllMediaFetched = false;
  isMembersFetched = false;
  UserTypeEnum = UserType;
  ChatTypeEnum = ChatTypes;
  userResults = [];
  showAllMedia = false;
  UserStatusEnum = UserStatus;
  MessageTypeEnum = MessageType;
  UploadImageEnum = UploadChannelImageTypes;
  userStatus = UserStatus.deactiveState;
  mentionUserId = '';
  editGroupName = false;
  is_owner_admin = false;
  label_header = '';
  label_header_copy = '';
  showProfilePopover = false;
  showAddMembersPopup;
  channel_data: any = {
    members_info: []
  };
  temp_custom_label = null;
  view_profile_enlarged = false;
  all_members_data = [];
  all_members_search_results = [];
  members_menu_open = false;
  members_menu_open_overall = false;
  temp_selected_member;
  removeGroupMember = false;
  leaveGroupPopup = false;
  statusPopup = false;
  mediaContainerEl;
  memberContainerEl;
  user_count;
  user_details;
  profileContainerEl;
  showLoaderPagination = false;
  deleteGroupPopup = false;
  adminIdData = [];
  showManageNotiPopup: boolean = false;
  groupNotificationValue;
  sendMessageSetting;
  groupNotificationTypeEnum = groupNotificationType;
  showSendMessageSettingPopup: boolean = false;
  cropObj: any = {};
  showMorePanel: boolean = false;
  showAssignTaskPopup;
  showViewTaskPopup = false;
  calendarStart;
  isSelectAll = false;
  selMembers;
  showSelectMembersPopup = false;
  calendarOptionsStart: CalendarOptions = {
    initialView: 'timeGridWeek',
    selectable: true,
    timeZone: 'UTC',
    dateClick: this.handleStartDateClick.bind(this),
    height: 250,
    aspectRatio: 0.5
  };
  taskData;
  taskDataEdit;

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('membersAccordionContainer') membersAccordionContainer: ElementRef;
  @ViewChild('managerScrollContainer') managerScrollContainer: ElementRef;

  @ViewChild('mediaContainerScroll') set mediaContainerScroll(
    content: ElementRef
  ) {
    if (content) {
      this.mediaContainerEl = content;
      document.getElementById('media-container').addEventListener('scroll', (event) => {
        this.checkPaginationOfMedia();
      });
    }
  }

  @ViewChild('memberContainerScroll') set memberContainerScroll(
    memberContent: ElementRef
  ) {
    if (memberContent) {
      this.memberContainerEl = memberContent;
      this.calculateHeightMembers();
      user_page_start = user_page_start;
      document.getElementById('member-container').addEventListener('scroll', (event) => {
        // if (this.bodyScrollDone) {
        this.checkPaginationOfGroupMembers();
        // } else {
        //   event.preventDefault();
        // }
      });
    }
  }

  // @ViewChild('profileContainer', { static: false }) profileContainerScroll: ElementRef;
  @ViewChild('profileContainer') set profileContainer(
    profileContainer: ElementRef
  ) {
    this.profileContainerEl = profileContainer;
    document.getElementById('profile-container').addEventListener('scroll', (event) => {
      if (
        this.profileContainerEl.nativeElement.scrollTop +
        this.profileContainerEl.nativeElement.clientHeight >=
        this.profileContainerEl.nativeElement.scrollHeight
      ) {
        this.bodyScrollDone = true;
      } else {
        this.bodyScrollDone = false;
      }
      this.cdRef.detectChanges();
    });
  }

  @ViewChild('memberSearchClear') memberSearchClear: ElementRef;
  chat_type;
  view_photo_options: boolean = false;
  bodyScrollDone = false;
  showCroppingPopup: boolean = false;
  selUserIds;
  month = new Date().getMonth() + 1;

  @Input()
  set params(val) {
    this.showMorePanel = false;
    this.chat_type = null;
    this.editGroupName = false;
    this.showImageCarousel = false;
    this.view_photo_options = false;
    this.channel_image_object = {
      channel_image_url: '',
      channel_thumbnail_url: ''
    };
    if (this.showAllMedia) {
      this.mediaContainerEl.nativeElement.scrollTop = 0;
      this.showAllMedia = false;
    }
    this.showProfilePopover = false;
    this.isAllMediaFetched = false;
    this.isMembersFetched = false;
    user_page_start = 0;
    if (val) {
      this.membersInfo = [];
      if (this.memberSub) {
        this.memberSub.unsubscribe();
      }
      this.editContact = false;
      this.profileInfo = null;
      this.activeChannelId = +val['channelId'];
      // this.otherUserId = parseInt(val['id']);
      this.label_header = '';
      // if (this.commonService.conversations[this.activeChannelId]) {
      //   this.chat_type = this.commonService.conversations[this.activeChannelId].chat_type;
      //   // this.getMembers();
      //   if (![2, 7].includes(this.chat_type)) {
      //     this.show_members = false;
      //   }
      // }
    }
    this.groupNotificationValue = this.layoutService.mutedStatusObject[
      this.activeChannelId
      ]
      ? this.layoutService.mutedStatusObject[this.activeChannelId]
      : this.groupNotificationTypeEnum.UNMUTED;
  }

  @Input()
  set group_data(data) {
    if (data) {
      this.label_header = data.label;
      this.temp_custom_label = data.custom_label;
      if (
        this.commonService.conversations[this.activeChannelId] &&
        this.label_header
      ) {
        this.commonService.conversations[
          this.activeChannelId
          ].label = this.label_header;
      }
      this.commonService.changeDetectEmit();
      // if (data.members_info.length) {
      //   this.channel_data.members_info = data.members_info;
      // }
    }
  }

  @Input()
  set members_data(data) {
    if (data) {
      this.setMembersData(data);
      user_page_size_count = data.user_page_size;
      /**
       * update the count of users in group information and calculate the height of the vs scroll container
       */
      // this.user_count = data.members.length;
      this.calculateHeightMembers();
    }
  }

  // taskDateForm;
  @Output()
  group_joined: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  membersInformation: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  groupName: EventEmitter<object> = new EventEmitter<object>();

  constructor(public commonService: CommonService, private service: ChatService, private sessionService: SessionService,
              private messageService: MessageService, private loader: LoaderService, private formBuilder: FormBuilder,
              private cdRef: ChangeDetectorRef, public socketService: SocketioService, private commonApiService: CommonApiService,
              public layoutService: LayoutService, private activatedRoute: ActivatedRoute, public  router: Router
  ) {
  }

  ngOnInit() {
    window['pro'] = this;
    // this.taskDateForm = this.formBuilder.group({
    //   task_start: ["", [Validators.required]],
    //   time_start: ["", [Validators.required]],
    //   task_end: ["", [Validators.required]],
    //   task_rem: ["", [Validators.required]],
    //   time_rem: ["", [Validators.required]],
    //   time_end: ["", [Validators.required]],
    // });


    this.user_details = this.commonService.userDetailDict[
      window.location.pathname.split('/')[1]
      ];
    this.memberSearchCtrl = new FormControl();
    this.managerSearchCtrl = new FormControl();
    this.memberSearchCtrl.valueChanges.pipe(debounceTime(300)).subscribe((data) => {
      if (data && data.length > 2) {
        this.searchUsers(data);
      } else {
        this.userResults = [];
        this.cdRef.detectChanges();
      }
    });
    // this.spaceData = this.sessionService.get('currentSpace');
    this.commonService.spaceDataEmitter.subscribe(() => {
      // this.spaceData = this.sessionService.get('currentSpace');
      this.spaceData = this.commonService.currentOpenSpace;
    });
    this.spaceData = this.commonService.currentOpenSpace;
    this.roleStatus = this.spaceData.role;
    this.is_owner_admin =
      this.roleStatus == Role.isOwner || this.roleStatus == Role.isAdmin;
    this.profileForm = this.formBuilder.group({
      // 'phone': ['', [Validators.required, ValidationService.mobileNumberValidator]],
      location: ['', []],
      designation: ['', []],
      department: ['', []]
    });
    this.managerSearchCtrl.valueChanges.pipe(debounceTime(300)).subscribe((data) => {
      this.active_index = 0;
      if (this.managerScrollContainer) {
        this.managerScrollContainer.nativeElement.scrollTop = 0;
      }
      if (data && data.length > 1) {
        this.searchManager(data);
      } else {
        this.all_members_search_results = JSON.parse(
          JSON.stringify(this.all_members_data)
        );
        this.all_members_search_results = this.all_members_search_results.filter(
          (member) => this.otherUserId != member.fugu_user_id
        );
      }
      this.cdRef.detectChanges();
    });
    this.commonService.changeDetectEmittter.subscribe((data) => {
      this.commonService.channelMedia = {...this.commonService.channelMedia};
      if (!this.cdRef['destroyed']) {
        this.cdRef.detectChanges();
      }
      this.groupNotificationValue = this.layoutService.mutedStatusObject[
        this.activeChannelId
        ]
        ? this.layoutService.mutedStatusObject[this.activeChannelId]
        : this.groupNotificationTypeEnum.UNMUTED;
    });
    // this.layoutService.chatTypeEmitter.subscribe(data => {
    //   if (!this.commonService.conversations[this.activeChannelId] || !this.chat_type) {
    //     this.chat_type = data;
    //     this.getMembers();
    //     if (![2, 7].includes(this.chat_type)) {
    //       this.show_members = false;
    //     }
    //   }
    //   this.cdRef.detectChanges();
    // });
    this.commonService.channelImageEmitter.subscribe((data) => {
      this.channel_image_object.channel_image_url = data;
      if (!this.cdRef['destroyed']) {
        this.cdRef.detectChanges();
      }
    });
    this.commonService.chatTypeUpdated.subscribe((data) => {
      this.chat_type = data.chat_type;
      if (!this.cdRef['destroyed']) {
        this.cdRef.detectChanges();
      }
    });
    this.commonService.groupAdminUpdated.subscribe((data) => {
      if (data.user_ids_to_remove_admin) {
        data.user_ids_to_remove_admin.map((item) => {
          for (let i = 0; i < this.membersInfo.length; i++) {
            const element = this.membersInfo[i];
            if (element.user_id == item) {
              element.role = this.RoleStatusEnum.isUser;
              if (element.user_id == this.commonService.userDetails.user_id) {
                this.currentGroupRole = this.RoleStatusEnum.isUser;
                if (this.editGroupName) {
                  this.closeEditGroupName();
                }
              }
              break;
            }
          }
        });
      } else if (data.user_ids_to_make_admin) {
        data.user_ids_to_make_admin.map((item) => {
          for (let i = 0; i < this.membersInfo.length; i++) {
            const element = this.membersInfo[i];
            if (element.user_id == item) {
              element.role = this.RoleStatusEnum.isAdmin;
              if (element.user_id == this.commonService.userDetails.user_id) {
                this.currentGroupRole = this.RoleStatusEnum.isAdmin;
              }
              break;
            }
          }
        });
      }
      this.fetchAllAdminData();
      this.cdRef.detectChanges();
    });
    this.groupNotificationValue = this.layoutService.mutedStatusObject[
      this.activeChannelId
      ]
      ? this.layoutService.mutedStatusObject[this.activeChannelId]
      : this.groupNotificationTypeEnum.UNMUTED;
    this.sendMessageSetting = this.layoutService.sendMessagePermission
      ? '1'
      : '0';
  }

  searchManager(name) {
    const obj = {
      en_user_id: this.user_details.en_user_id,
      search_text: name,
      no_guest_users: true,
      include_current_user: true
    };
    this.commonApiService.searchUsersInGroup(obj).subscribe((response) => {
      this.all_members_search_results = response.data.users.filter(
        (member) => this.otherUserId != member.fugu_user_id
      );
      this.cdRef.detectChanges();
    });
  }

  getAllMembers() {
    if (this.all_members_data.length) {
      this.managerDropupOpen = true;
      return;
    }
    const all_members_obj = {
      workspace_id: this.spaceData.workspace_id,
      user_status: 'ENABLED',
      user_type: 'ALL_MEMBERS',
      page_start: 0
    };
    this.service.getAllMembers(all_members_obj).subscribe((res) => {
      this.all_members_data = res.data.all_members;
      this.all_members_search_results = JSON.parse(
        JSON.stringify(this.all_members_data)
      );
      page_size_count = res.data.get_all_member_page_size;
      this.all_members_search_results = this.all_members_search_results.filter(
        (member) => this.otherUserId != member.fugu_user_id
      );
      this.cdRef.detectChanges();
      this.managerDropupOpen = true;
      this.cdRef.detectChanges();
    });
  }


  addChatMember(selected_members) {
    this.loader.show();
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId,
      user_ids_to_add: Object.keys(selected_members).map(Number)
    };
    this.service.addChatMember(obj).subscribe((response) => {
      this.loader.hide();
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      this.membersInfo = [
        ...this.membersInfo,
        ...Object.values(selected_members)
      ];
      // this.layoutService.sortByNames(this.membersInfo);
      this.membersInfo = this.membersInfo.slice();
      this.showAddMembersPopup = false;
      this.membersInformation.emit({
        members: this.membersInfo,
        chat_type: this.chat_type,
        user_count: this.user_count + Object.keys(selected_members).length
      });
      // window.location.reload()

      // this.router.navigate([this.commonService.currentOpenSpace.workspace, 'messages', this.activeChannelId] );
      // this.router.navigate([], {queryParams: {}});

      this.commonService.newUserAddedToGroup.emit(response);
      this.cdRef.detectChanges();
    });
  }

  removeChatMember() {
    this.loader.show();
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      user_id_to_remove: this.tempUserIdToRemove,
      channel_id: this.activeChannelId
    };
    this.service.removeChatMember(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      this.removeGroupMember = false;
      for (let i = 0; i < this.membersInfo.length; i++) {
        if (this.membersInfo[i].user_id == this.tempUserIdToRemove) {
          this.membersInfo.splice(i, 1);
        }
      }
      this.membersInfo = this.membersInfo.slice();
      this.loader.hide();
      this.membersInformation.emit({
        members: this.membersInfo,
        chat_type: this.chat_type,
        user_count: this.user_count - 1
      });
      this.cdRef.detectChanges();
    });
  }

  closeAddMemberPopup() {
    this.showAddMembersPopup = false;
  }

  openSearchModal() {
    setTimeout(() => {
      this.showAddMembersPopup = true;
      this.cdRef.detectChanges();
    });
  }

  fetchUserDetails() {
    const obj = {
      fugu_user_id: this.otherUserId,
      workspace_id: this.spaceData.workspace_id
    };
    this.commonApiService.getUserInfo(obj).subscribe((response) => {
      if (response.statusCode === 200) {
        this.profileInfo = response.data;
        this.userStatus = response.data.status;
        this.choosenUserEmail = response.data.email;
        this.profileForm.setValue({
          // phone: response.data.contact_number,
          location: response.data.location,
          designation: response.data.designation,
          department: response.data.department
        });
        this.managerData = response.data.manager_data;
        this.managerSearchCtrl.setValue(this.managerData.full_name);
        this.previousManagerData = response.data.manager_data;
        this.cdRef.detectChanges();
      }
    });
  }

  searchUsers(string) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      search_text: string
    };
    this.commonApiService.search(obj).subscribe((response) => {
      if (response.statusCode === 200) {
        this.userResults = response.data.users;
        this.cdRef.detectChanges();
      }
    });
  }

  muteGroup() {
    let obj, temp_status;
    if (
      this.layoutService.mutedStatusObject[this.activeChannelId] ==
      NotificationAlertType.UNMUTED
    ) {
      obj = {
        mute_channel_id: this.activeChannelId,
        en_user_id: this.commonService.userDetails.en_user_id
      };
      temp_status = NotificationAlertType.MUTED;
    } else {
      obj = {
        unmute_channel_id: this.activeChannelId,
        en_user_id: this.commonService.userDetails.en_user_id
      };
      temp_status = NotificationAlertType.UNMUTED;
    }
    this.commonApiService.editInfo(obj).subscribe((response) => {
      this.layoutService.mutedStatusObject[this.activeChannelId] = temp_status;
      this.commonService.changeDetectEmit();
    });
  }

  saveProfile() {
    const obj = {
      // contact_number: this.profileForm.value.phone.toString(),
      location: this.profileForm.value.location.trim()
        ? this.profileForm.value.location.trim()
        : undefined,
      designation: this.profileForm.value.designation.trim()
        ? this.profileForm.value.designation.trim()
        : undefined,
      department: this.profileForm.value.department.trim()
        ? this.profileForm.value.department.trim()
        : undefined,
      // manager: this.profileForm.value.manager.trim() ? this.profileForm.value.manager.trim() : undefined,
      workspace_id: this.spaceData.workspace_id,
      fugu_user_id: this.otherUserId,
      manager_data:
        this.managerSearchCtrl.value && this.managerData.fugu_user_id
          ? this.managerData
          : undefined
    };
    this.service.editUserInfo(obj).subscribe(
      (response) => {
        this.profileForm.setValue({
          // phone: this.profileForm.value.phone.trim(),
          location: this.profileForm.value.location.trim(),
          designation: this.profileForm.value.designation.trim(),
          department: this.profileForm.value.department.trim()
        });
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        this.editContact = false;
        this.cdRef.detectChanges();
      },
      (error) => {
        this.messageService.sendAlert({
          type: 'danger',
          msg: error.error.message,
          timeout: 2000
        });
      }
    );
  }

  async onImageFileSelect(event) {
    this.showCroppingPopup = true;
    const file = event.target.files;
    this.cropObj.file = event.target.files[0];
    this.cropObj.event = event;
    this.cropObj.isAspectRatio = true;
    this.cropObj.src = await this.commonService.getImageUrlToCrop(file);
  }

  closeCropPopupFunc() {
    this.showCroppingPopup = false;
    /** reset the file input so that cropping popup can be shown next time without refresh */
    this.fileInput.nativeElement.value = '';
  }

  saveCroppedImage(event, type) {
    this.loader.show();
    const formdata: FormData = new FormData();
    if (event) {
      formdata.append('file', event);
    }
    if (type == this.UploadImageEnum.User) {
      formdata.append('workspace_id', this.spaceData.workspace_id);
      formdata.append('fugu_user_id', this.otherUserId);
      this.service.editUserInfo(formdata).subscribe((response) => {
        if (response.data) {
          this.showCroppingPopup = false;
          this.fetchUserDetails();
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.commonService.conversations[
            this.activeChannelId
            ].channel_thumbnail_url = response.data.user_thumbnail_image_url;
          this.commonService.sendChannelImage(
            response.data.user_thumbnail_image_url
          );
          this.commonService.changeDetectEmit();
        }
      });
    } else {
      formdata.append('channel_id', this.activeChannelId);
      formdata.append('en_user_id', this.commonService.userDetails.en_user_id);
      this.service.editChannelInfo(formdata).subscribe((response) => {
        if (response.data) {
          this.showCroppingPopup = false;
          this.channel_image_object = response.data.channel_image;
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.commonService.conversations[
            this.activeChannelId
            ].channel_thumbnail_url = this.channel_image_object.channel_thumbnail_url;
          this.commonService.sendChannelImage(
            this.channel_image_object.channel_thumbnail_url
          );
          this.commonService.changeDetectEmit();
        }
      });
    }
    this.loader.hide();
    this.fileInput.nativeElement.value = '';
    this.showImageLayer = false;
  }

  deactivateUser() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      fugu_user_id: this.otherUserId,
      status: this.UserStatusEnum.deactiveState
    };
    this.commonService.channelStatus = 'DISABLED';
    this.service.editUserInfo(obj).subscribe((response) => {
      this.userStatus = this.UserStatusEnum.deactiveState;
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      for (let i = 0; i < this.membersInfo.length; i++) {
        if (this.membersInfo[i].user_id == this.otherUserId) {
          this.membersInfo[i].status = 0;
          this.membersInformation.emit({
            members: this.membersInfo,
            chat_type: this.chat_type,
            is_deactivated: true
          });
          break;
        }
      }
    });
    this.statusPopup = false;
  }

  activateUser() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      fugu_user_id: this.otherUserId,
      status: this.UserStatusEnum.activeState
    };
    this.commonService.channelStatus = 'ENABLED';
    this.service.editUserInfo(obj).subscribe(
      (response) => {
        this.userStatus = this.UserStatusEnum.activeState;
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        for (let i = 0; i < all_members.length; i++) {
          if (all_members[i].user_id == this.otherUserId) {
            all_members[i].status = 1;
            this.membersInformation.emit({
              members: all_members,
              chat_type: this.chat_type,
              is_deactivated: false
            });
            break;
          }
        }
      },
      (error) => {
        this.messageService.sendAlert({
          type: 'danger',
          msg: error.error.message,
          timeout: 2000
        });
      }
    );
  }

  cancelForm() {
    this.profileForm.setValue({
      // phone: this.profileInfo.contact_number,
      location: this.profileInfo.location,
      designation: this.profileInfo.designation,
      department: this.profileInfo.department
    });
    this.managerData = JSON.parse(JSON.stringify(this.previousManagerData));
    this.managerSearchCtrl.reset();
    this.managerSearchCtrl.setValue(this.managerData.full_name);
    this.managerDropupOpen = false;
    this.editContact = false;
  }

  leaveGroup() {
    this.loader.show();
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId
    };
    this.commonApiService.leaveGroup(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Left Group Successfully',
        timeout: 2000
      });
      this.leaveGroupPopup = false;
      const remove_obj = {
        channel_id: this.activeChannelId,
        removed_user_id: this.commonService.userDetails.user_id,
        notification_type: 2
      };
      this.socketService.onMemberRemoveEvent.emit(remove_obj);
      this.loader.hide();
    });
  }

  onImageClick(media) {
    this.dataForCarousel['currentMuid'] =
      media.message.thread_muid || media.message.muid || media.muid;
    this.dataForCarousel[
      'channelImage'
      ] = this.channel_image_object.channel_thumbnail_url;
    this.dataForCarousel['channelName'] = this.label_header;
    this.dataForCarousel['channelId'] = this.activeChannelId;
    this.dataForCarousel['chatType'] = this.chat_type;
    this.showImageCarousel = true;
  }

  checkPaginationOfMedia() {
    if (this.showAllMedia) {
      if (
        !this.isAllMediaFetched &&
        this.mediaContainerEl.nativeElement.scrollTop +
        this.mediaContainerEl.nativeElement.offsetHeight ==
        this.mediaContainerEl.nativeElement.scrollHeight
      ) {
        this.hitForNextImages();
      }
    }
  }

  checkPaginationOfGroupMembers() {
    if (
      !this.isMembersFetched &&
      (this.memberContainerEl.nativeElement.scrollTop +
        this.memberContainerEl.nativeElement.clientHeight) /
      this.memberContainerEl.nativeElement.scrollHeight >=
      0.98
    ) {
      if (!stopHitMembers) {
        this.showLoaderPagination = true;
        user_page_start = user_page_start + user_page_size_count;
        this.hitForNextMembers();
      }
    }
  }

  calculateHeightMembers() {
    const el = document.getElementById('member-container');
    if (el && this.membersInfo.length < 11) {
      el.style.maxHeight = this.membersInfo.length * 56 + 'px';
    }
    this.cdRef.detectChanges();
  }

  onAllMediaClick() {
    if (!this.isAllMediaFetched) {
      this.hitForNextImages();
    }
    this.showAllMedia = true;
  }

  hitForNextImages() {
    const obj = {
      channel_id: this.activeChannelId,
      en_user_id: this.commonService.userDetails.en_user_id,
      get_data_type: 'ATTACHMENTS',
      page_start: Object.keys(this.commonService.channelMedia).length + 1,
      page_end: Object.keys(this.commonService.channelMedia).length + 21
    };
    this.service.getMembers(obj).pipe(debounceTime(100)).subscribe((response) => {
      const groupMediaResponse = response.data.chat_media;
      if (groupMediaResponse.length) {
        groupMediaResponse.map((item) => {
          item.message.muid = item.muid;
          this.commonService.channelMedia[item.muid] = {
            message: item.message,
            messageType: item.message_type,
            date_time: item.created_at,
            documentType:
              item.document_type ||
              this.commonService.checkMimeType(
                item.message_type == this.MessageTypeEnum.Media_Message
                  ? item.message.image_url
                  : item.message.url
              )
          };
        });
      } else {
        this.isAllMediaFetched = true;
      }
      this.cdRef.detectChanges();
    });
  }

  hitForNextMembers() {
    stopHitMembers = true;
    const obj = {
      channel_id: this.activeChannelId,
      en_user_id: this.commonService.userDetails.en_user_id,
      get_data_type: 'MEMBERS',
      user_page_start: user_page_start
    };
    this.service.getMembers(obj).pipe(debounceTime(300)).subscribe((response) => {
      stopHitMembers = false;
      const chat_mem = response.data.chat_members;
      if (chat_mem.length) {
        this.membersInfo = [
          ...this.membersInfo,
          ...response.data.chat_members
        ];
      } else {
        this.isMembersFetched = true;
      }
      this.profileContainerEl.nativeElement.scrollTop;
      this.showLoaderPagination = false;
      this.cdRef.detectChanges();
    });
  }

  setImageURL(media) {
    if (
      media['messageType'] == this.MessageTypeEnum.Media_Message ||
      media['messageType'] == this.MessageTypeEnum.Video_Message
    ) {
      return media.message.thumbnail_url;
    } else if (media['messageType'] == this.MessageTypeEnum.File_Message) {
      if (media['messageExtension'] == 'audio') {
        return '../../../assets/img/audio.svg';
      } else {
        return '../../../assets/img/documents.svg';
      }
    }
  }

  popoverClickOutside(event) {
    if (
      event &&
      (event['value'] === true ||
        this.checkClassContains(['profile-mask'], event.target.classList)) &&
      !this.checkClassContains(
        ['member-image', 'member-name-text'],
        event.target.classList
      )
    ) {
      this.showProfilePopover = false;
    }
  }

  checkClassContains(array, list) {
    let flag = true;
    for (let i = 0; i < array.length; i++) {
      flag = list.contains(array[i]);
      if (flag) {
        return flag;
      }
    }
    return false;
  }

  openProfileNamePopover(event, id) {
    const el = document.getElementById('profile-popover-group');
    el.style.top = null;
    el.style.bottom = null;
    this.mentionUserId = id;
    this.showProfilePopover = true;
    const offsetY = event.clientY;
    if (offsetY + 240 > this.profileContainerEl.nativeElement.offsetHeight) {
      el.style.bottom =
        this.profileContainerEl.nativeElement.offsetHeight -
        offsetY +
        70 +
        'px';
    } else {
      el.style.top = offsetY + 10 + 'px';
    }
    el.style.right = 20 + 'px';
  }

  openAccordion() {
    if (this.membersAccordionContainer.nativeElement.style.maxHeight) {
      this.membersAccordionContainer.nativeElement.style.maxHeight = null;
    } else {
      setTimeout(() => {
        this.membersAccordionContainer.nativeElement.style.maxHeight =
          this.membersAccordionContainer.nativeElement.scrollHeight + 'px';
      });
    }
  }

  groupNameEdit() {
    if (
      (this.temp_custom_label ||
        (this.commonService.conversations[this.activeChannelId] &&
          this.commonService.conversations[this.activeChannelId].custom_label)) &&
      this.label_header == ''
    ) {
      this.editGroupName = false;
      this.label_header = JSON.parse(JSON.stringify(this.label_header_copy));
    } else if (this.label_header != this.label_header_copy) {
      if (!this.label_header.trim()) {
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'Group Name cannot be empty.',
          timeout: 2000
        });
        return;
      }
      const obj = {
        channel_id: this.activeChannelId,
        en_user_id: this.commonService.userDetails.en_user_id,
        custom_label: this.label_header.trim()
      };
      this.service.editChannelInfo(obj).subscribe((res) => {
        const group_data = {
          label: this.label_header,
          members_info: this.channel_data.members_info
        };
        this.label_header = JSON.parse(JSON.stringify(this.label_header_copy));
        this.groupName.emit(group_data);
        this.editGroupName = false;
        if (this.commonService.conversations[this.activeChannelId]) {
          this.commonService.conversations[
            this.activeChannelId
            ].label = this.label_header;
          delete this.commonService.conversations[this.activeChannelId].custom_label;
        }
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
      });
    } else {
      this.editGroupName = false;
    }
  }

  createGroup() {
    const user_object = {};
    user_object[this.otherUserId] = {
      full_name: this.profileInfo.full_name,
      user_thumbnail_image: this.profileInfo.user_image || '',
      fugu_user_id: this.otherUserId
    };
    this.commonService.createGroupEmitter.emit({
      is_open: true,
      members: user_object
    });
  }

  editGroupNameClicked() {
    this.label_header_copy = JSON.parse(JSON.stringify(this.label_header));
    this.editGroupName = true;
    if (
      this.temp_custom_label ||
      (this.commonService.conversations[this.activeChannelId] &&
        this.commonService.conversations[this.activeChannelId].custom_label)
    ) {
      this.label_header = '';
    }
  }

  closeEditGroupName() {
    this.editGroupName = false;
    this.label_header = this.label_header_copy;
  }

  profileOptionsClickOutside(event) {
    if (
      event &&
      event.value == true &&
      !this.checkClassContains(
        ['image-layer', 'fa-camera'],
        event.target.classList
      )
    ) {
      this.view_photo_options = false;
    }
  }

  managerDropupClickOutside(event) {
    if (
      event &&
      event.value == true &&
      !this.checkClassContains(
        ['manager-input', 'manager-card'],
        event.target.classList
      )
    ) {
      this.managerDropupOpen = false;
    }
  }

  public onManagerBoxKeyDownEvent(event: KeyboardEvent) {
    if (!this.managerDropupOpen) {
      return;
    }
    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      const el = document.getElementById('manager-card' + this.active_index);
      if (el) {
        el.click();
      }
      this.managerScrollContainer.nativeElement.scrollTop = 0;
    }
  }

  private searchDownArrow() {
    if (this.active_index != this.all_members_search_results.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 59;
      const scrollTop = this.managerScrollContainer.nativeElement.scrollTop;
      const viewport =
        scrollTop + this.managerScrollContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.managerScrollContainer.nativeElement.scrollTop += 59;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 59;
      const scrollTop = this.managerScrollContainer.nativeElement.scrollTop;
      const viewport =
        scrollTop + this.managerScrollContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.managerScrollContainer.nativeElement.scrollTop -= 59;
      }
    }
  }

  onManagerSelected(user) {
    this.managerData = {
      full_name: user.full_name,
      fugu_user_id: user.fugu_user_id
    };
    this.managerDropupOpen = false;
    this.managerSearchCtrl.setValue(user.full_name);
  }

  togglePublicToPrivate() {
    let obj, temp_status;
    obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId
    };
    if (
      this.commonService.conversations[this.activeChannelId].chat_type ==
      ChatTypes.PRIVATE
    ) {
      (obj['chat_type'] = ChatTypes.PUBLIC), (temp_status = ChatTypes.PUBLIC);
    } else if (
      this.commonService.conversations[this.activeChannelId].chat_type ==
      ChatTypes.PUBLIC
    ) {
      (obj['chat_type'] = ChatTypes.PRIVATE), (temp_status = ChatTypes.PRIVATE);
    }
    this.service.editChannelInfo(obj).subscribe((response) => {
      this.commonService.conversations[
        this.activeChannelId
        ].chat_type = temp_status;
      this.chat_type = temp_status;
      this.commonService.changeDetectEmit();
    });
  }

  makeAdmin(member) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId,
      user_ids_to_make_admin: [member.user_id]
    };
    this.service.editChannelInfo(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      for (let i = 0; i < this.membersInfo.length; i++) {
        const element = this.membersInfo[i];
        if (element.user_id == member.user_id) {
          element.role = this.RoleStatusEnum.isAdmin;
          break;
        }
      }
      this.commonService.changeDetectEmit();
    });
  }

  dismissAsAdmin(member) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId,
      user_ids_to_remove_admin: [member.user_id]
    };
    this.service.editChannelInfo(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      for (let i = 0; i < this.membersInfo.length; i++) {
        const element = this.membersInfo[i];
        if (element.user_id == member.user_id) {
          element.role = this.RoleStatusEnum.isUser;
          break;
        }
      }
      this.commonService.changeDetectEmit();
    });
  }

  isEditAllowed() {
    if (this.chat_type == this.ChatTypeEnum.PUBLIC) {
      return true;
    } else if (this.chat_type == this.ChatTypeEnum.PRIVATE) {
      if (this.currentGroupRole == this.RoleStatusEnum.isAdmin) {
        return true;
      } else {
        return false;
      }
    } else if (
      this.chat_type == this.ChatTypeEnum.DEFAULT_CHANNELS ||
      this.chat_type == this.ChatTypeEnum.GENERAL
    ) {
      if (this.roleStatus == this.RoleStatusEnum.isAdmin) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isMemberAddRemoveAllowed() {
    if (this.chat_type == this.ChatTypeEnum.PUBLIC) {
      return true;
    } else if (this.chat_type == this.ChatTypeEnum.PRIVATE) {
      if (this.currentGroupRole == this.RoleStatusEnum.isAdmin) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  openMemberOptionMenu(e, member) {
    this.temp_selected_member = member;
    this.members_menu_open = true;
    const el = document.getElementById('member-menu');
    if (this.currentGroupRole == this.RoleStatusEnum.isAdmin) {
      el.style.left = e.clientX - 160 + 'px';
    } else {
      el.style.left = e.clientX - 90 + 'px';
    }
    el.style.top = e.clientY + 10 + 'px';
  }

  openMemberOptionMenuOverall(e, member) {
    this.temp_selected_member = member;
    this.members_menu_open_overall = true;
    const el = document.getElementById('member-menu-overall');
    if (this.currentGroupRole == this.RoleStatusEnum.isAdmin) {
      el.style.left = e.clientX - 160 + 'px';
    } else {
      el.style.left = e.clientX - 90 + 'px';
    }
    if (window.innerHeight - e.pageY + 300 > window.innerHeight) {
      el.style.top = e.clientY + 10 + 'px';
    } else {
      el.style.top = e.clientY - 90 + 'px';
    }
  }

  viewEnlargedImage() {
    /**
     * if one to one and image is there then only open the popup and if not one to one and there is no image, meaning it is a channel
     */
    if (
      !(
        this.chat_type == ChatTypes.ONE_TO_ONE && this.profileInfo.user_image
      ) &&
      !(
        this.chat_type != ChatTypes.ONE_TO_ONE &&
        this.channel_image_object.channel_image_url
      )
    ) {
      return;
    }
    const profile_image_cont = document.getElementById('profile-image');
    const profile_image_cont_bounds = profile_image_cont.getBoundingClientRect();
    this.animationHeightX =
      profile_image_cont_bounds['x'] +
      profile_image_cont_bounds['width'] / 2 -
      window.innerWidth / 2 +
      'px';
    this.animationHeightY =
      profile_image_cont_bounds['y'] +
      profile_image_cont_bounds['height'] / 2 -
      window.innerHeight / 2 +
      'px';
    this.view_profile_enlarged = true;
  }

  setMembersData(data) {
    this.chat_type = data.chat_type;
    const groupMediaResponse = data.chat_media || [];
    if (this.chat_type != ChatTypes.ONE_TO_ONE) {
      this.channel_image_object = data.channel_image;
    } else {
      if (this.commonService.conversations[this.activeChannelId]) {
        this.channel_image_object = {
          channel_image_url: this.commonService.conversations[
            this.activeChannelId
            ].channel_image,
          channel_thumbnail_url: this.commonService.conversations[
            this.activeChannelId
            ].channel_thumbnail_url
        };
      }
    }
    this.channel_data = data;
    this.user_count = data.user_count;
    // const group_data = {
    //   label: this.label_header,
    //   custom_label: this.temp_custom_label,
    //   members_info: this.channel_data.members_info
    // };
    if (
      this.label_header &&
      this.commonService.conversations[this.activeChannelId]
    ) {
      this.commonService.conversations[
        this.activeChannelId
        ].label = this.label_header;
    }
    if (
      this.channel_data.members_info &&
      this.commonService.conversations[this.activeChannelId]
    ) {
      this.commonService.conversations[
        this.activeChannelId
        ].members_info = this.channel_data.members_info;
    }
    // this.groupName.emit(group_data);
    if (groupMediaResponse.length > 0) {
      groupMediaResponse.map((item) => {
        item.message.muid = item.muid;
        this.commonService.channelMedia[item.muid] = {
          message: item.message,
          date_time: item.created_at,
          messageType: item.message_type,
          documentType:
            item.document_type ||
            this.commonService.checkMimeType(
              item.message_type == this.MessageTypeEnum.Media_Message
                ? item.message.image_url
                : item.message.url
            )
        };
      });
    }
    this.membersInfo = data.members;
    this.membersInfo = [...this.membersInfo];
    this.fetchAllAdminData();
    this.currentGroupRole = data.role;
    this.is_group_joined = data.group_joined;
    // this.membersInfo.map((item) => {
    //   if (item.user_id === this.commonService.userDetails.user_id) {
    //     current_user = true;
    //     this.currentGroupRole = item.role;
    //   }
    //   if (item.status) {
    //     this.activeUsersLength += 1;
    //   }
    // });
    // !current_user ? this.is_group_joined = false : this.is_group_joined = true;
    // if (this.roleStatus == Role.isUser && ![2, 7].includes(this.chat_type)) {
    //   this.membersInfo = this.membersInfo.filter((item) => {
    //     if (item.user_id === this.commonService.userDetails.user_id) {
    //       current_user = true;
    //       this.currentGroupRole = item.role;
    //     }
    //     return item.status;
    //   });
    //   this.activeUsersLength = this.membersInfo.length;
    // }
    // this.group_joined.emit(this.is_group_joined);
    // this.membersInformation.emit(this.membersInfo);
    this.cdRef.detectChanges();
    // because input is called before init and space data is undefined first time.
    if (!this.spaceData) {
      // this.spaceData = this.sessionService.get('currentSpace');
      this.spaceData = this.commonService.currentOpenSpace;
    }
    all_members = data.chat_members;
    if ([2].includes(this.chat_type)) {
      this.otherUserId = data.other_user_id;
      this.fetchUserDetails();
    }
  }

  deleteGroup() {
    this.loader.show();
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId,
      status: 0
    };
    this.commonApiService.deleteGroup(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message || 'Group Deleted',
        timeout: 2000
      });
      this.deleteGroupPopup = false;
      this.loader.hide();
    });
  }

  /**
   * TO fetch all admin user ID
   * to put check for delete group
   */
  fetchAllAdminData() {
    this.adminIdData = [];
    this.layoutService.groupAdminData = [];
    this.membersInfo.forEach((item) => {
      if (item.role == this.RoleStatusEnum.isAdmin) {
        this.adminIdData.push(item.user_id);
      }
    });
    this.layoutService.groupAdminData = [...this.adminIdData];
    this.cdRef.detectChanges();
  }

  /**
   * notification management for specific group
   */
  manageNotifications() {
    this.showManageNotiPopup = true;
  }

  manageNotificationInfo() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      notification: this.groupNotificationValue,
      channel_id: this.activeChannelId
    };
    this.commonApiService.editInfo(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      this.showManageNotiPopup = false;
      this.layoutService.mutedStatusObject[
        this.activeChannelId
        ] = this.groupNotificationValue;
      this.commonService.changeDetectEmit();
      this.cdRef.detectChanges();
    });
  }

  cancelNotiPopup() {
    this.showManageNotiPopup = false;
    this.groupNotificationValue = this.layoutService.mutedStatusObject[
      this.activeChannelId
      ]
      ? this.layoutService.mutedStatusObject[this.activeChannelId]
      : this.groupNotificationTypeEnum.UNMUTED;
    this.cdRef.detectChanges();
  }

  manageSendMessage() {
    this.showSendMessageSettingPopup = true;
  }

  cancelSendMessagePopup() {
    this.showSendMessageSettingPopup = false;
    this.sendMessageSetting = this.layoutService.sendMessagePermission
      ? '1'
      : '0';
    this.cdRef.detectChanges();
  }

  manageSendMessageInfo() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId,
      only_admin_can_message: !!+this.sendMessageSetting
    };
    this.service.editChannelInfo(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      this.layoutService.sendMessagePermission = this.sendMessageSetting;
      this.showSendMessageSettingPopup = false;
      this.commonService.changeDetectEmit();
    });
  }

  showMorePanelProfile() {
    this.showMorePanel = true;
  }

  onDateSelected(data) {
    this.date_range_picker_obj = {
      start_date: data.start_date,
      end_date: data.end_date
    };
  }

  createFormattedDate(date, no_of_days) {
    date.setDate(date.getDate() + no_of_days);
    return this.formatDate(date);
  }

  formatDate(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  }

  handleStartDateClick(data) {
    this.startDateTime = data;
  }

  handleEndDateClick(data) {
    this.endDateTime = data;
  }

  handleRemDateClick(data) {
    this.remDateTime = data;
  }

  onTimeChange(event, type) {
    if (type == 'start') {
      this.startTime = event;
    } else if (type == 'end') {
      this.endTime = event;
    } else if (type == 'rev') {
      this.remTime = event;
    }
  }

  viewTasks() {
    this.showViewTaskPopup = true;
    // const obj = {
    //   user_id: this.spaceData.fugu_user_id,
    //   channel_id: this.activeChannelId,
    //   workspace_id: this.spaceData.workspace_id,
    //   month: this.month,
    //   //  month: 7
    //   //  is_complete: 0
    // };
    // this.commonApiService.viewTask(obj).subscribe((response) => {
    //   this.taskData = response.data;
    //   this.cdRef.detectChanges();
    // });
  }

  selectedMembers(data) {
    this.selUserIds = data;
    this.showSelectMembersPopup = false;
  }

  showEditTask(task) {
    this.showAssignTaskPopup = true;
    this.showViewTaskPopup = false;
    this.taskDataEdit = task;
    // this.taskDescription = task.description;
    // this.taskTitle = task.title;
    //       this.taskDateForm.controls.task_start.setValue(
    //         moment(task.start_datetime).format("YYYY-MM-DD")
    //       );
    //       this.taskDateForm.controls.time_start.setValue(
    //         moment(task.start_datetime).format("hh:mm A")
    //       );
    //       this.taskDateForm.controls.task_end.setValue(
    //         moment(task.end_datetime).format("YYYY-MM-DD")
    //       );
    //       this.taskDateForm.controls.time_end.setValue(
    //         moment(task.end_datetime).format("hh:mm A")
    //       );
    //       this.taskDateForm.controls.task_rem.setValue(
    //         moment(task.reminder_datetime).format("YYYY-MM-DD")
    //       );
    //       this.taskDateForm.controls.time_rem.setValue(
    //         moment(task.reminder_datetime).format("hh:mm A")
    //       );
    //       this.isSelectAll = task.is_selected_all;
    this.cdRef.detectChanges();
  }
}
