import {
  ChangeDetectionStrategy,
  ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { CommonService } from '../../services/common.service';
import { SessionService } from '../../services/session.service';
import { SidebarService } from './sidebar.service';
import { trigger, style, transition, animate, keyframes, query, stagger , state } from '@angular/animations';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MessageType,
  NotificationLevelTypes,
  NotificationAlertType,
  Role,
  NotificationType, MessageStateTypes, ChatTypes, RTCCallType, memberType, groupNotificationType
} from '../../enums/app.enums';
import { MessageService } from '../../services/message.service';
import { LoaderService } from '../../services/loader.service';
import {LayoutService} from '../layout/layout.service';
import {Subscription} from 'rxjs';
import {debounceTime, takeWhile} from 'rxjs/operators';
import {SocketioService} from '../../services/socketio.service';
import { messageModalAnimation } from '../../animations/animations';
import { CommonApiService } from '../../services/common-api.service';
import { LocalStorageService } from '../../services/localStorage.service';

declare const moment: any;
let putUserData;
let page_size = 0, page_start = 1, conv_end_bool = false, last_timestamp = null;
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    // state('in', style({transform: 'translateX(0)'})),
    messageModalAnimation,
    trigger('rotate', [
      state('true', style({
        transform: 'rotate(90deg)'})
      ),
      state('false', style({
        transform: 'rotate(0deg)'})
      ),
      transition('true => false', animate('150ms ease-in')),
      transition('false => true', animate('150ms ease-in'))
    ]),
    trigger('searchInputTransform', [
      state('true', style({
        backgroundColor: '#fff'})
      ),
      state('false', style({
        backgroundColor: '#FBFBFB'})
      ),
      transition('true => false', animate('150ms ease-in')),
      transition('false => true', animate('150ms ease-in'))
    ]),
    trigger('fadeInCurtain', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(32, [
            animate('.2s ease', keyframes([
              style({ opacity: 1, offset: 0 }),
              style({ opacity: 0, offset: 1.0 })
            ]))

          ])
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 }),
          stagger(50, [
            animate('.32s .16ms cubic-bezier(0.23, 1, 0.32, 1)', keyframes([
              style({ opacity: 0, transform: 'translateX(-8px)', offset: 0 }),
              style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
            ]))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeOut', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate('.2s ease', keyframes([
          style({ opacity: 1, maxHeight: '100%', offset: 0 }),
          style({ opacity: 0, maxHeight: '0', offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('activeChatsContainer', { static: true }) activeChatsContainer: ElementRef;
  @ViewChild('memberAdd') memberAdd: ElementRef;
  public MessageTypeEnum = MessageType;
  public RTCCallTypeEnum = RTCCallType;
  public MessageStateTypes = MessageStateTypes;
  userData;
  spaceData;
  showMembersAndChannels;

  selected_country_code = {
    'name': '',
    'dialCode': '91',
    'countryCode': 'in'
  };
  inviteContactObj;
  notificationType;
  channelInfoSubscription: Subscription;
  choosenNotificationType;
  showPunchReminder = false;
  punchInFromSidebar = false;
  user_id;
  channel_id;
  inviteForm;
  public RoleStatusEnum = Role;
  // searchResults = [];
  searchResults = {
    members: [],
    groups: [],
    messages: []
  };
  userResults = [];
  hideChats = false;
  isSearchView = false;
  alive = true;
  _params;
  domainsData;
  searchCtrl;
  activeIndex = 0;
  scroll_notification_top = false;
  unreadCountOnTab = 0;
  documentTitle;
  search_complete = true;
  menu_open = false;
  down_arrow_index;
  routeAttendanceBot;
  clear_chat_temp_obj;
  open_browse_groups = false;
  is_invite_open = false;
  search_box_focus = false;
  showDeleteChatModal = false;
  leaveGroupPopup = false;
  showInviteOptionsPopup = false;
  showInviteGuestPopup = false;
  memberTypeEnum = memberType;
  groupNotificationTypeEnum = groupNotificationType;
  showInvitedUsers = false;
  showSidebarDropdown = false;
  showSnoozeBox;
  selectedSnoozeTime =  this.commonService.snoozeArray[0];
  sidebarSearchFilterOptions = [
    // {/* to show all the categories */
    //   name: 'All',
    //   selected: true,
    //   value: 0
    // },
    {
      name: 'Members/Groups',
      selected: false,
      value: 1
    },
    {
      name: 'Groups',
      selected: false,
      value: 2
    },
    {
      name: 'Messages',
      selected: false,
      value: 3
    }
  ];
  currentTabSelected = this.sidebarSearchFilterOptions[0];
  searchMessagesObject = {};

  hideOtherOptions = false;
  previous_search_keyword = '';
  searchingTextCurrent = '';
  sidebarSearchSubscription: Subscription;

  @Input()
  set group_data(data) {
    if (data) {
      this.changeDetectorRef.detectChanges();
    }
  }
  @Input('extra_data') extra_data ;
  @ViewChild('searchChats', { static: true }) searchChats;
  @Output()
  unreadCountClick: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  clearChatEmit: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  userDataUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  set params(val) {
    if (!this.sessionService.get('loginData/v1')) {
      return;
    }
    this.userData = this.sessionService.get('loginData/v1')['user_info'];
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this._params = val;
    if (+val.channelId) {
      this.channel_id = +val.channelId;
    }
    this.previous_search_keyword = '';
  }

  get params() {
    return this._params;
  }

  @Output()
  groupName: EventEmitter<object> = new EventEmitter<object>();
  constructor(private sessionService: SessionService,             private localStorageService: LocalStorageService, private service: SidebarService, public commonService: CommonService,
              private formBuilder: FormBuilder, private messageService: MessageService,
              private changeDetectorRef: ChangeDetectorRef, private router: Router,
              private loader: LoaderService, public layoutService: LayoutService,
              private commonApiService: CommonApiService,
              private socketService: SocketioService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.layoutService.resetGetConvo.emit(true);
    document.getElementById('active-chats-container').addEventListener('scroll', () => {
      this.onConversationScroll();
    });
    this.layoutService.resetGetConvo.subscribe(
      (res) => {
        if (res) {
          conv_end_bool = false;
          page_start = 1;
          /**
          * set scroll to zero when workspace is switched
          */
          this.activeChatsContainer.nativeElement.scrollTop = 0;
        }
      });
    this.layoutService.InvitePopupEmitter.subscribe(
      (res) => {
        if (res) {
          this.showInviteOptions();
        }
      });
    this.layoutService.BrowseGroupEmitter.subscribe(
      (res) => {
        if (res) {
          this.open_browse_groups = true;
        }
      });
    this.commonService.switchSpaceEmitter.subscribe(
      (res) => {
        if (res) {
          if (this.commonService.userDetailDict) {
            this.showPunchReminder = false;
            putUserData = <any>this.commonService.userDetailDict[res];
            this.user_id = putUserData.user_id;
            this.commonService.getConversationPending = false;
            this.params = { id: 0 , channelId : 0};
            this.searchCtrl.reset();
            this.hideChats = false;
            this.clearSearchResults();
            this.getConversations(putUserData);
          }
        }
      });
    this.commonService.otherSpaceNotificationEmitter.subscribe(
      (res) => {
        if (res) {
          if (this.commonService.userDetailDict) {
            putUserData = <any>this.commonService.userDetailDict[res];
            this.user_id = putUserData.user_id;
            this.commonService.getConversationPending = false;
            this.getConversations(putUserData);
          }
        }
      });

    if (this.commonService.userDetailDict) {
      putUserData = <any>this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
      this.user_id = putUserData.user_id;
      this.commonService.getConversationPending = false;
      this.getConversations(putUserData);
    }
    this.notificationType = this.spaceData.notification_level;
    this.choosenNotificationType = this.notificationType;
    this.previous_search_keyword = '';
    page_start = 1;
    this.commonService.conversations = {};
    this.searchCtrl = new FormControl();
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        this.isSearchView = true;
        if (data && data.length > 1) {
          this.searchUsers(data, 1);
        } else {
          this.hideChats = false;
          this.isSearchView = false;
          this.clearSearchResults();
          this.currentTabSelected = this.sidebarSearchFilterOptions[0];
          this.changeDetectorRef.detectChanges();
        }
      });
    this.domainsData = this.sessionService.get('domains');
    this.userData = this.sessionService.get('loginData/v1')['user_info'];
    this.inviteForm = this.formBuilder.group({
      properties: this.formBuilder.array([])
    });
    this.inviteForm.get('properties').push(new FormControl());
    this.setupSocketListeners();
    this.commonService.changeDetectEmittter.subscribe((data) => {
      this.changeDetectorRef.detectChanges();
    });

    this.commonService.openInvitePopup.subscribe(() => {
      this.is_invite_open = true;
      this.changeDetectorRef.detectChanges();
    });
    /**
     * emitter listener for routing channel on push notification click
     */
    this.layoutService.pushNotificationEmitter.pipe(takeWhile(() => this.alive)).subscribe((data) => {
      if (data && data.channel_id) {
        if (this.commonService.conversations[data.channel_id]) {
          this.commonService.conversations[data.channel_id].unread_count = 0;
        }
        if (data.channel_id != this.params.channelId) {
          this.scroll_notification_top = true;
        }
        if (data.noti_workspace && data.noti_workspace != this.spaceData.workspace) {
          this.commonService.otherSpaceNotificationEmitter.emit(data.noti_workspace);
        }
        if (data.noti_workspace) {
          if (data.is_thread_message == 'true') {
            this.router.navigate([data.noti_workspace, 'messages', data.channel_id], { queryParams: { muid: data.muid } });
          } else {
            this.router.navigate([data.noti_workspace, 'messages', data.channel_id]);
          }
        }

        // this.routeToPath(-1, data.channel_id, 0);
        this.changeDetectorRef.detectChanges();
      }
    });

        this.commonService.jumpToSearch.subscribe((data) => {
          this.searchCtrl.reset();
        });
    this.commonService.isMac = window.navigator.platform.includes('Mac');
    this.documentTitle = this.spaceData.workspace_name || 'Fugu';
  }

  displayUnreadCount() {
    this.unreadCountOnTab = 0;
    for ( const channelID in this.commonService.conversations) {
      if (this.commonService.conversations[channelID].unread_count > 0 &&
        this.layoutService.mutedStatusObject[channelID] == NotificationAlertType.UNMUTED) {
        this.unreadCountOnTab++;
      }
    }
    if (this.unreadCountOnTab > 0) {
      document.title = '(' + this.unreadCountOnTab + ') ' + this.documentTitle;
    } else {
      document.title = this.documentTitle;
    }
  }

  setupSocketListeners() {
    this.socketService.onMemberAddEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.addMemberEvent(data));
    this.socketService.onMemberRemoveEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.removeMemberEvent(data));
    this.socketService.onGroupUpdateEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.groupInfoChangeEvent(data));
    this.socketService.onClearChatEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.clearChatEvent(data));
    this.socketService.onDeleteMessageEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.deleteMessageEvent(data));
    this.socketService.onEditMessageEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.editMessageEvent(data));
    this.socketService.onControlChannelMessageReceivedEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.onControlChannelMessageEvent(data));
    this.socketService.onPinChatEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.onPinChatEvent(data));
    this.socketService.onUnpinChatEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.onUnpinChatEvent(data));
    this.socketService.reconnectionEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.onSocketConnectReconnectEvent(data));
    this.socketService.onReadAllEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.onSocketReadAllEvent(data));
  }

  onSocketConnectReconnectEvent(data) {
    if (this.socketService.socket.disconnected && (!last_timestamp ||
      (moment.duration(moment().diff(last_timestamp)).asSeconds() > 30))) {
      this.commonService.getConversationPending = false;
      this.refreshConversationList(this.commonService.userDetails);
      this.changeDetectorRef.detectChanges();
      last_timestamp = data.timestamp;
    }
  }
  setChannel(channel) {
    if (this.params.id == -1) {
      this.channel_id = channel != -1 ? +channel : null;
      if (this.commonService.conversations[this.channel_id]) {
        // this.chatType.emit(this.commonService.conversations[this.channel_id].chat_type);
        if (this.scroll_notification_top) {
          this.scrollToChannel();
          this.scroll_notification_top = false;
        }
      }
    }
  }
  /**
   * handling read all event for same user
   */
  onSocketReadAllEvent(data) {
    if (this.commonService.userDetails.user_id == data.user_id
      && this.commonService.conversations[data.channel_id]) {
      this.commonService.conversations[data.channel_id].unread_count = 0;
      this.changeDetectorRef.detectChanges();
    }
  }
  searchMessages() {
    this.commonService.showSearchingText = true;
    this.searchCtrl.value = this.searchCtrl.value.trim();
    if (this.searchCtrl.value && this.previous_search_keyword != this.searchCtrl.value) {
      // this.show_search_loader = true;
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        search_text: this.searchCtrl.value,
        page_start: 1
      };
      this.commonApiService.searchMessages(obj)
        .subscribe((res) => {
          /**
           * passing search text
           */
          this.searchResults.messages = res;
          this.searchMessagesObject = {
            search_text: this.searchCtrl.value,
            messages: res.data.searchable_messages.concat(res.data.thread_messages),
            page_size: res.data.page_size,
            page_size_search: res.data.page_size
          };
          this.commonService.searchMessageEmitter.emit(this.searchMessagesObject);
          // this.show_search_loader = false;
          this.previous_search_keyword = this.searchCtrl.value;
          this.commonService.showSearchingText = false;
          this.changeDetectorRef.detectChanges();
        });
    } else {
      this.commonService.searchMessageEmitter.emit();
    }
  }

  searchUsers(search_text, type) {
     if (this.sidebarSearchSubscription) {
       this.sidebarSearchSubscription.unsubscribe();
     }
      this.search_complete = false;
      type === 1 ? this.hideChats = true : this.hideChats = false;
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        search_text: search_text,
        user_role: this.spaceData.role,
        search_deactivated_member: true
      };
      if (!this.spaceData.config.enable_one_to_one_chat.includes(this.spaceData.role)) {
        obj['searchOnlyGroupsAndBots'] = true;
      }
      this.sidebarSearchSubscription = this.commonApiService.search(obj)
        .subscribe(response => {
          if (response.statusCode === 200) {
            if (type === 1) {
              this.clearSearchResults();
              // this.searchResults = this.searchResults.concat(response.data.users, response.data.channels)
              //   .concat(response.data.open_groups).concat(response.data.general_groups).concat(response.data.bot);
              this.searchResults.groups = [...response.data.channels, ...response.data.open_groups,
                 ...response.data.general_groups, ...response.data.bot];
              this.searchResults.members = [...response.data.users, ...this.searchResults.groups];
              this.searchResults.members = this.searchResults.members.filter((item) => {
                return item.user_id != this.commonService.userDetails.user_id;
              });
              this.activeIndex = 0;
            } else {
              this.userResults = response.data.users;
            }
            this.search_complete = true;
            this.activeChatsContainer.nativeElement.scrollTop = 0;
            this.changeDetectorRef.detectChanges();
          }
        });
  }
  createGroup() {
    const obj = {
      is_open: true
    };
    this.commonService.createGroupEmitter.emit(obj);
    this.closeSidebarOptionsPopup();
  }

  /**
   * Called when chat is cleared.
   * @param data
   */
  clearChatEvent(data) {
    delete this.commonService.conversations[data.channel_id];
    this.clearChatEmit.emit(data);
    this.changeDetectorRef.detectChanges();
    const firstChatId = document.getElementById('active-chats-container').firstElementChild.id;
    this.routeToPath(-1, firstChatId, 0,
      this.commonService.conversations[firstChatId].channel_thumbnail_url);
  }

  /**
   * Called when message is deleted.
   * @param data
   */
  deleteMessageEvent(data) {
    if (this.commonService.conversations[data.channel_id] && data.muid == this.commonService.conversations[data.channel_id].muid) {
      this.commonService.conversations[data.channel_id].message_state = 0;
      this.changeDetectorRef.detectChanges();
    }
  }

  editMessageEvent(data) {
    if (!data.is_thread_message && this.commonService.conversations[data.channel_id] &&
      data.muid == this.commonService.conversations[data.channel_id].muid) {
      this.commonService.conversations[data.channel_id].message_state =  MessageStateTypes.MESSAGE_EDITED;
      this.commonService.conversations[data.channel_id].message =  data.message;
      this.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Called when member is removed from group.
   * @param data
   */
  removeMemberEvent(data) {
    if (data.removed_user_id == this.commonService.userDetails.user_id) {
      this.clearChatEvent(data);
      return;
    }
    if (this.commonService.conversations[data.channel_id]) {
      if (this.channel_id == data.channel_id && data.user_id != this.commonService.userDetails.user_id) {
        this.layoutService.memberRemovedEvent.emit(data.removed_user_id);
      }
    }
    this.onControlChannelMessageEvent(data);
  }

  /**
   * Called when any group information is changed, i.e. name, channel image
   * @param data
   */
  groupInfoChangeEvent(data) {
    // when a group is deleted by admin
    if (data.notification_type == 8 && data.is_deleted_group ) {
      if (this.commonService.conversations[data.channel_id]) {
        this.clearChatEvent(data);
      }
      return;
    }
    if (data.custom_label) {
      data.label = data.custom_label;
      delete data.custom_label;
    }
    if (this.commonService.conversations[data.channel_id]) {
      if (data.label) {
        this.commonService.conversations[data.channel_id].label = data.label;
        if (data.channel_id == this.channel_id) {
          const groupData = {
            label: data.label,
            members_info: data.members_info || []
          };
          this.groupName.emit(groupData);
        }
      }
      if (data.channel_thumbnail_url) {
        this.commonService.conversations[data.channel_id].channel_thumbnail_url = data.channel_thumbnail_url;
        if (data.channel_id == this.channel_id) {
          this.commonService.sendChannelImage(data.channel_thumbnail_url);
        }
      }
    }
    this.onControlChannelMessageEvent(data);
    this.changeDetectorRef.detectChanges();
  }
  /**
   * Called when any member is added to group or group is created.
   * @param data
   */
  addMemberEvent(data) {
    this.onControlChannelMessageEvent(data);
    if (this.commonService.conversations[data.channel_id]) {
      if (this.channel_id == data.channel_id && data.user_id != this.commonService.userDetails.user_id) {
        this.layoutService.memberAddedEvent.emit(data.added_member_info);
      }
    }
  }
  private onControlChannelMessageEvent(newChatData) {
    /**Close the conference popup when rejected button is pressed on conference bot*/
    if (newChatData.notification_type == 19) {
      this.layoutService.closeConferencePopup.emit();
    }
    if (newChatData.channel_id == this.channel_id) {
      this.layoutService.sendMessagePermission = newChatData.only_admin_can_message ? '1' : '0';
      this.changeDetectorRef.detectChanges();
      this.commonService.changeDetectEmit();
    }
    /** If control channel is of a thread message or if message_type key is not there , do nothing */
    if (!newChatData.is_thread_message && newChatData.message_type ) {
      if (!newChatData['last_updated_at']) {
        newChatData['last_updated_at'] = newChatData.date_time;
      }

      const channelId = newChatData.channel_id;
      /**
       * Update mute status of a chat
       */
      if (newChatData.notification) {
        this.layoutService.mutedStatusObject[channelId] = newChatData.notification;
      }
      // check if chat is already in list
      if (this.commonService.conversations[channelId]) {
        newChatData.is_pinned = this.commonService.conversations[channelId].is_pinned;
        this.changeDetectorRef.detectChanges();
        this.commonService.changeDetectEmit();
        if (!newChatData.chat_type) {
          newChatData.chat_type = this.commonService.conversations[channelId].chat_type;
        }
        if (!newChatData.label) {
          newChatData.label = this.commonService.conversations[channelId].label;
        }
        if (!newChatData.channel_thumbnail_url) {
          newChatData.channel_thumbnail_url = this.commonService.conversations[channelId].channel_thumbnail_url;
        }
        if (newChatData.notification_type == NotificationType.Add_Member) {
          newChatData.label = this.commonService.conversations[channelId].label;
        }
        if (newChatData.last_sent_by_id == this.commonService.userDetails.user_id) {
          newChatData.label = this.commonService.conversations[channelId].label;
          newChatData.channel_thumbnail_url = this.commonService.conversations[channelId].channel_thumbnail_url;
        }
        if (this.commonService.conversations[channelId].custom_label ||
          this.commonService.conversations[channelId].channel_thumbnail_url
          == 'https://fuguchat.s3.ap-south-1.amazonaws.com/default/WwX5qYGSEb_1518441286074.png') {
          if (this.commonService.conversations[channelId].custom_label) {
            newChatData.custom_label = this.commonService.conversations[newChatData.channel_id].custom_label;
          }
          if (newChatData.notification_type != NotificationType.Remove_Member) {
            newChatData.members_info = this.commonService.conversations[newChatData.channel_id].members_info;
          }
          if (newChatData.last_sent_by_id != this.commonService.userDetails.user_id && newChatData.members_info
            && newChatData.notification_type != NotificationType.Add_Member
            && newChatData.notification_type != NotificationType.Group_Update) {
            if (newChatData.notification_type != NotificationType.Remove_Member) {
              newChatData = this.setUnNamedGroupLabel(newChatData);
            } else {
              newChatData = this.removeMemberSetGroupLabel(newChatData);
            }
          }
        }
        newChatData.notification = this.layoutService.mutedStatusObject[channelId];
        newChatData.unread_count = this.commonService.conversations[channelId].unread_count;
        if (newChatData.message_type != MessageType.Public_Notes) {
          if (this.channel_id != channelId && newChatData.last_sent_by_id != this.commonService.userDetails.user_id) {
            newChatData.unread_count = this.commonService.conversations[channelId].unread_count + 1;
          } else {
            newChatData.unread_count = 0;
          }
        } else {
          // preserve unread count
          if (newChatData.notification_type == NotificationType.Group_Update) {
            if (this.channel_id != channelId && newChatData.last_sent_by_id != this.commonService.userDetails.user_id) {
              newChatData.unread_count = this.commonService.conversations[channelId].unread_count;
            }
          }
        }
        newChatData.status = 1;
        newChatData['last_updated_at'] = newChatData.date_time;
        if (newChatData.message.trim() != '') {
          this.commonService.conversations[channelId] = newChatData;
          this.playSoundAndSetUnread(newChatData);
        }
      } else {
        if (newChatData.is_deleted_group) {
          return;
        }
        const object = {
          id: channelId,
          last_updated_at: newChatData.date_time
        };
        if (newChatData.last_sent_by_id != this.commonService.userDetails.user_id
          && newChatData.message_type != MessageType.Public_Notes && newChatData.chat_type != ChatTypes.BOT) {
          newChatData.unread_count = 1;
        } else {
          if (newChatData.chat_type == 2) {
            page_start = 1;
            this.commonService.getConversationPending = false;
            this.getConversations(this.commonService.userDetails); // --> when first time chat is started from mobile,
            // faye doesn't send name and image, doing this fix until apps send the last sent to key on faye
          }
        }
        if (!newChatData.unread_count) {
          newChatData.unread_count = 0;
        }
        /**
         * doing this because type 8 only send 1 key which is updated photo or name
         */
        if (![2, 7].includes(newChatData.chat_type)) {
          if (this.channelInfoSubscription) {
            this.channelInfoSubscription.unsubscribe();
          }
          const obj = {
            channel_id: newChatData.channel_id,
            en_user_id: this.commonService.userDetails.en_user_id
          };
          this.channelInfoSubscription = this.service.getChannelInfo(obj)
            .subscribe((res) => {
              newChatData.label = res.data.label;
              newChatData.channel_thumbnail_url = res.data.channel_thumbnail_url;
              newChatData.members_info = res.data.members_info;
              this.appendNewChannelData(newChatData, object);
              this.playSoundAndSetUnread(newChatData);
            });
        } else {
          this.appendNewChannelData(newChatData, object);
          this.playSoundAndSetUnread(newChatData);
        }
      }
    }
  }

  appendNewChannelData(data, object) {
    this.commonService.conversations[data.channel_id] = data;
    if (!this.layoutService.mutedStatusObject[data.channel_id]) {
      this.layoutService.mutedStatusObject[data.channel_id] = NotificationAlertType.UNMUTED;
    }
    this.commonService.conversations = {...this.commonService.conversations};
  }

  playSoundAndSetUnread(newChatData) {
    if (((newChatData.last_sent_by_id || newChatData.user_id) != this.commonService.userDetails.user_id &&
      this.layoutService.mutedStatusObject[newChatData.channel_id] == NotificationAlertType.UNMUTED) &&
      (this.notificationType == NotificationLevelTypes.ALL_CHATS
        || (newChatData.chat_type == 2 && this.notificationType == NotificationLevelTypes.DIRECT_MESSAGES)) && newChatData.notification_type != 16 && newChatData.play_sound) {
      this.displayUnreadCount();
      this.playNotificationSound('../../../assets/audio/beep');
    }
    this.changeDetectorRef.detectChanges();
  }

  playNotificationSound(filename) {
    document.getElementById('sound').innerHTML = '<audio autoplay="autoplay">' +
      '<source src="' + filename + '.mp3" type="audio/mpeg" />' +
      '<source src="' + filename + '.ogg" type="audio/ogg" />' +
      '<embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3" /></audio>';
  }

  routeToPath(user_id, channel_id, unread_count = 0, channel_image = '') {
    if (channel_id != this.channel_id || user_id != -1) {
      if (channel_id && channel_id != -1) {
        if (this.commonService.conversations[channel_id]) {
          this.commonService.conversations[channel_id].unread_count = 0;
          this.displayUnreadCount();
        }
        this.setChannel(channel_id);
        this.routeFunction(user_id, channel_id, unread_count, channel_image);
      } else {
        const obj = {
          en_user_id: this.commonService.userDetails.en_user_id,
          chat_with_user_id: user_id
        };
        this.service.createConversation(obj)
          .pipe(takeWhile(() => this.alive))
          .subscribe(response => {
            this.channel_id = response.data.channel_id;
            this.commonService.channelStatus = response.data.other_user_status;
            this.routeFunction(user_id, response.data.channel_id, 0, response.data.channel_image);
          });
      }
    }
  }
  routeFunction(user_id, channel_id, unread_count = 0, channel_image = '') {
    // '/'+this.spaceData.workspace_name,
    this.router.navigate([`../../${channel_id}`], {relativeTo: this.activatedRoute});
    this.unreadCountClick.emit(unread_count);
    this.searchCtrl.reset();
    this.clearSearchResults();
    if (channel_image) {
      this.commonService.sendChannelImage(channel_image);
    } else {
      try {
        this.commonService.sendChannelImage(this.commonService.conversations[channel_id].channel_thumbnail_url);
      } catch (e) {}
    }
    this.changeDetectorRef.detectChanges();
  }
  showSidebarOptionsDropdown() {
    this.showSidebarDropdown = !this.showSidebarDropdown;
  }

  getConversations(data) {
    const obj = {
      en_user_id: data.en_user_id,
      page_start: page_start
    };
    this.service.getConverSations(obj)
    .pipe(debounceTime(300))
      .subscribe(response => {
        if (page_start == 1) {
          this.commonService.conversations = {};
        }
        page_size = response.data.page_size;
        let channel_obj;
        if (response.data.conversation_list.length) {
          channel_obj = response.data.conversation_list[0];
        } else {
          conv_end_bool = true;
        }


        // check if billing plan is getting expired
        if (response.data && response.data.billing_details) {
          this.layoutService.expireBillingDetails = response.data.billing_details || {};
        }
        response.data.conversation_list.map(element => {
          this.commonService.conversations[element.channel_id] = element;
          this.layoutService.mutedStatusObject[element.channel_id] = element.notification;
        });
        if (this.params.id == 0 && this.params.channelId == 0) {
          // if (response.data.conversation_list.length <= 5) {
          //   if (channel_obj.label != 'Fugu Bot') {
          //     channel_obj = response.data.conversation_list.slice(0,5).find( (item) => {
          //         return item.label == 'Fugu Bot'
          //     });
          //   }
          // }
          if (channel_obj && channel_obj.channel_id) {
            // this.router.navigate([`${this.spaceData.workspace}`,'messages', channel_obj.channel_id]);
            this.router.navigate([`../../${channel_obj.channel_id}`], {relativeTo: this.activatedRoute});
            this.setChannel(channel_obj.channel_id);
            // this.chatType.emit(channel_obj.chat_type);
            if (channel_obj.chat_type != ChatTypes.ONE_TO_ONE) {
              this.commonService.sendChannelImage(channel_obj.channel_thumbnail_url);
              // this.channelImage.emit(channel_obj.channel_image); // <-- Channel image emitted to chat component
            }
            this.commonService.conversations[channel_obj.channel_id].unread_count = 0;
          }
        } else {
          this.setChannel(this.params.channelId);
          if (this.commonService.conversations[this.params.channelId] &&
            this.commonService.conversations[this.params.channelId].chat_type != 2) {
            this.commonService.sendChannelImage(this.commonService.conversations[this.params.channelId].channel_thumbnail_url);
          }
          if (this.commonService.conversations[this.params.channelId]) {
            this.commonService.conversations[this.params.channelId].unread_count = 0;
            this.commonService.sendChannelImage(this.commonService.conversations[this.params.channelId].channel_thumbnail_url);
          }
        }

        // this.getInfo();
        this.loader.hide();
        this.documentTitle = this.spaceData.workspace_name || 'Fugu';
        this.displayUnreadCount();
        this.commonService.getConversationPending = true;
        if (response.data.punch_in_obj) {
          if (!response.data.punch_in_obj.status) {
            let datecom: any;
            if (this.localStorageService.get('dateRemDict')) {
              datecom = this.localStorageService.get('dateRemDict')[
                window.location.pathname.split('/')[1]
              ];
            }
            if (datecom != new Date().toISOString().split('T')[0]) {
              this.routeAttendanceBot =
                response.data.punch_in_obj.attendance_bot_channel_id;
              this.showPunchReminder = true;
            }
          }
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  switchToPunch() {
    this.punchInFromSidebar = true;
    const obj = {
      punchInSidebar: true,
      routeAttendanceBot: this.routeAttendanceBot
    };
    this.messageService.punchInMessage.next(obj);
    this.dismissReminder();
  }

  dismissReminder() {
    this.showPunchReminder = false;
    this.commonService.createDateReminderDict();
    // this.localStorageService.set('dateRem', new Date().toISOString().split('T')[0]);
  }

  /***
   * refresh conversations data after reconnecting socket
   */
  refreshConversationList(data) {
    const obj = {
      en_user_id: data.en_user_id,
      page_start: 1
    };
    this.service.getConverSations(obj)
      .subscribe(response => {
        /**
         * take a temp map so that we store new conversation data and loop over conv array only once at end.
         */
        if (response && response.data && response.data.conversation_list) {
          response.data.conversation_list.map(element => {
            this.commonService.conversations[element.channel_id] = element;
          });
          this.displayUnreadCount();
          this.commonService.getConversationPending = true;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  scrollToChannel() {
    setTimeout(() => {
      this.activeChatsContainer.nativeElement.scrollTop
        = document.getElementById(this.channel_id).offsetTop -
        document.getElementById(document.getElementById('active-chats-container').firstElementChild.id).offsetTop;
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    try {
      if (event.key.toLowerCase() == 'k' && event.metaKey == true
        || (event.key.toLowerCase() == 'k' && event.ctrlKey == true)) {
        event.preventDefault();
        this.searchChats.nativeElement.focus();
      }
    } catch (e) {}
  }

  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {
    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      if (this.currentTabSelected.value == 3) {
        this.searchMessages();
      } else {
        const el = document.getElementById('results' + this.activeIndex);
        if (el) {
          el.click();
          setTimeout(() => {
            this.activeChatsContainer.nativeElement.scrollTop = 0;
          });
        }
      }
    } else if (event.keyCode == 27 ) {
      this.searchCtrl.reset();
    }
  }

  private searchDownArrow() {
    if (this.activeIndex != this.searchResults.members.length - 1) {
      this.activeIndex++;
      // scroll the div
      const elHeight = 75;
      const scrollTop = this.activeChatsContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.activeChatsContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.activeIndex;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.activeChatsContainer.nativeElement.scrollTop += 75;
      }
    }
  }

  private searchUpArrow() {
    if (this.activeIndex != 0) {
      this.activeIndex--;
      const elHeight = 75;
      const scrollTop = this.activeChatsContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.activeChatsContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.activeIndex;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.activeChatsContainer.nativeElement.scrollTop -= 75;
      }
    }
  }

  getInfo() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id
    };
    this.commonApiService.getInfo(obj)
    .pipe(debounceTime(100))
      .subscribe((response) => {
        this.notificationType = response.data[0].notification_level;
        this.choosenNotificationType = this.notificationType;
        let now = moment().utc().format();
        now = now.replace('Z', '.000Z');
        this.commonService.notification_snooze_time = response.data[0].notification_snooze_time;
          if (this.commonService.notification_snooze_time && now > this.commonService.notification_snooze_time) {
            this.commonService.notification_snooze_time = null;
          }
          this.changeDetectorRef.detectChanges();
      });
  }

  openSidebarMenu(e) {
    const el = document.getElementById('sidebar-menu');
    const dimen = e.target.getBoundingClientRect();
    el.style.left = dimen.left + 35 + 'px';
    // case for last and second last conversation which exceeds page height, considering non one to one chat
    if (e.pageY + 125 > window.innerHeight && this.clear_chat_temp_obj.chat_type != 2) {
      el.style.top = e.pageY - 130 + 'px';
      // case for last message in one to one chat
    } else if (e.pageY + 45 > window.innerHeight && this.clear_chat_temp_obj.chat_type == 2) {
      el.style.top = e.pageY - 50 + 'px';
      // normal case for opening menu
    } else {
      el.style.top = e.pageY - 30 + 'px';
    }
    this.menu_open = true;
    this.changeDetectorRef.detectChanges();
  }

  clearChat(data) {
    const obj = {
      'en_user_id': this.commonService.userDetails.en_user_id,
      'channel_id': data.channel_id,
      'muid': data.muid
    };
    this.service.clearChatHistory(obj)
      .subscribe((response) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        this.showDeleteChatModal = false;
        this.clear_chat_temp_obj = null;
        this.clearChatEvent(obj);
        this.changeDetectorRef.detectChanges();
      });
  }



  // leave group
  leaveGroup() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.clear_chat_temp_obj.channel_id
    };
    this.commonApiService.leaveGroup(obj)
      .subscribe(response => {
        if (response.statusCode === 200) {
          this.messageService.sendAlert({
            type: 'success',
            msg: 'Left Group Successfully',
            timeout: 2000
          });
          this.leaveGroupPopup = false;
          this.clear_chat_temp_obj = null;
          this.clearChatEvent(obj);
        }
      });
  }
  // mute group
  muteGroup() {
    let obj, temp_status;
    if (this.layoutService.mutedStatusObject[this.clear_chat_temp_obj.channel_id] == this.groupNotificationTypeEnum.UNMUTED) {
      obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        notification: this.groupNotificationTypeEnum.MUTED,
        channel_id: this.clear_chat_temp_obj.channel_id
      };
      temp_status = this.groupNotificationTypeEnum.MUTED;
    } else {
      obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        notification: this.groupNotificationTypeEnum.UNMUTED,
        channel_id: this.clear_chat_temp_obj.channel_id
      };
      temp_status = this.groupNotificationTypeEnum.UNMUTED;
    }
    this.commonApiService.editInfo(obj)
      .subscribe(() => {
        this.layoutService.mutedStatusObject[this.clear_chat_temp_obj.channel_id] = temp_status;
        this.changeDetectorRef.detectChanges();
        this.commonService.changeDetectEmit();
      });
  }

  /**
   * check pagination in conversation
   */
  onConversationScroll() {
    // check if scroll has reached bottom of div
    if ((this.activeChatsContainer.nativeElement.scrollTop + this.activeChatsContainer.nativeElement.clientHeight)
      / this.activeChatsContainer.nativeElement.scrollHeight >= 0.98 && !conv_end_bool) {
      page_start += page_size;
      this.commonService.getConversationPending = false;
      this.getConversations(this.commonService.userDetails);
    }
  }

  trackBySidebar(index, item) {
    return item ? item.muid : undefined;
  }

  /**
   * Method to set label and image for un named groups and groups with default image.
   * @param data
   * @returns {any}
   */
  setUnNamedGroupLabel(data) {
    let flag = false;
    for (let i = 0; i < this.commonService.conversations[data.channel_id].members_info.length; i++) {
      const obj = this.commonService.conversations[data.channel_id].members_info[i];
      if (obj.user_id == data.last_sent_by_id) {
        this.commonService.conversations[data.channel_id].members_info.splice(i, 1);
        this.commonService.conversations[data.channel_id].members_info.unshift(obj);
        flag = true;
        break;
      }
    }
    data.members_info = this.commonService.conversations[data.channel_id].members_info;
    if (!flag && data.notification_type != NotificationType.Add_Member && data.last_sent_by_id) {
      data.members_info.unshift({
        full_name: data.last_sent_by_full_name,
        user_image: data.user_thumbnail_image,
        user_id: data.last_sent_by_id
      });
    }
    data.members_info = data.members_info.slice(0, 3);
    if (data.custom_label) {
      let label_string = '';
      for (let i = 0; i < data.members_info.length; i++) {
        label_string += `${data.members_info[i].full_name.split(' ')[0]}${i != data.members_info.length - 1 ? ', ' : ''}`;
      }
      data.label = label_string;
    }
    if (data.channel_id == this.channel_id) {
      const groupData = {
        label: data.label,
        members_info: data.members_info
      };
      this.groupName.emit(groupData);
    }
    return data;
  }

  removeMemberSetGroupLabel(data) {
    this.commonService.conversations[data.channel_id].members_info = data.members_info;
    let label_string = '';
    if (data.custom_label) {
      for (let i = 0; i < data.members_info.length; i++) {
        label_string += `${data.members_info[i].full_name.split(' ')[0]}${i != data.members_info.length - 1 ? ', ' : ''}`;
      }
      this.commonService.conversations[data.channel_id].label = label_string;
      data.label = label_string;
    }
    if (data.channel_id == this.channel_id) {
      const groupData = {
        label: label_string || data.label,
        members_info: data.members_info
      };
      this.groupName.emit(groupData);
    }
    return data;
  }

  inviteAsGuest() {
    this.showInviteOptionsPopup = false;
    this.showInviteGuestPopup = true;
  }

  showSelectMembersandChannels(guestData) {
    this.showMembersAndChannels = true;
    this.showInviteGuestPopup = false;
    this.inviteContactObj = guestData;
  }

  showInviteOptions() {
    if (this.spaceData.config['is_guest_allowed'] == 1) {
      this.showInviteOptionsPopup = true;
    } else {
      this.is_invite_open = true;
    }
    this.closeSidebarOptionsPopup();
  }

  closeSidebarOptionsPopup() {
    this.showSidebarDropdown = false;
    this.changeDetectorRef.detectChanges();
  }

  filterSearchResults(item) {
    this.currentTabSelected = item;
    switch (item.value) {
      // case 0:  //all
      case 1:  //members
      break;
      case 2:  //groups
      break;
      case 3:  //messages
      this.searchMessages();
      break;

    }
  }
  clearSearchResults() {
    this.searchResults.members = [];
    this.searchResults.groups = [];
    this.searchResults.messages = [];
  }

  onSidebarOptionsClickOutside(event) {
      if (event && event['value'] === true && !this.commonService.checkClassContains(['three-dots', 'groups-cont', 'stroke-plus'], event.target.classList)) {
        this.showSidebarDropdown = false;
      }
  }

  chooseSnoozeTime(i) {
    this.selectedSnoozeTime = this.commonService.snoozeArray[i];
    this.showSnoozeBox = false;
  }

  onSnoozeClickOutside(event) {
    if (event && event.value == true) {
      this.showSnoozeBox = false;
    }
  }

  pinChat() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      conversation_status: this.clear_chat_temp_obj.is_pinned ? 'UNPIN_CHAT' : 'PIN_CHAT',
      channel_id: this.clear_chat_temp_obj.channel_id
    };
    this.service.pinChat(obj)
      .subscribe((res) => {
      });
  }

  private onPinChatEvent(data) {
     if (this.commonService.conversations[data.channel_id]) {
       this.commonService.conversations[data.channel_id].is_pinned = 1;
       this.commonService.conversations = JSON.parse(JSON.stringify(this.commonService.conversations));
       this.changeDetectorRef.detectChanges();
     }
  }
  private onUnpinChatEvent(data) {
    if (this.commonService.conversations[data.channel_id]) {
      this.commonService.conversations[data.channel_id].is_pinned = 0;
      this.commonService.conversations = JSON.parse(JSON.stringify(this.commonService.conversations));
      this.changeDetectorRef.detectChanges();
    }
  }

}

