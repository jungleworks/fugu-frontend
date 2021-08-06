import {ContenteditableInputComponent} from './../contenteditable-input/contenteditable-input.component';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import {Router, ActivatedRoute, Route} from '@angular/router';
import {CommonService} from '../../services/common.service';
import {
  MessageType,
  UserType,
  Typing,
  MessageStatus,
  NotificationType,
  Role,
  VideoCallType,
  MessageStateTypes,
  ChatTypes,
  SocketErrorCodes,
  RTCCallType,
  ButtonMessageActionTypes,
  SocketConnectionState,
  presenceType,
  leaveRole,
  StreamType,
  Bots
} from '../../enums/app.enums';
import {trigger, state, style, transition, animate, keyframes, query, animateChild} from '@angular/animations';
import {SessionService} from '../../services/session.service';
import {ChatService} from './chat.service';
import {MessageService} from '../../services/message.service';
import {Subscription} from 'rxjs';
import {LoaderService} from '../../services/loader.service';
import {environment} from '../../../environments/environment';
import {LayoutService} from '../layout/layout.service';
import {EmailPopupService} from '../email-popup/email-popup.service';
import {takeWhile} from 'rxjs/operators';
import {SocketioService} from '../../services/socketio.service';
import {LocalStorageService} from '../../services/localStorage.service';
import {scaleInOut, fadeIn, messageModalAnimation, barFadeInOut} from '../../animations/animations';
import {IContentEditableData, Message} from '../../interfaces/app.interfaces';
import {CommonApiService} from '../../services/common-api.service';
import {debounceTime} from 'rxjs/operators';
import {ThrowStmt} from '@angular/compiler';

declare var moment: any;
declare var jQuery: any;
let networkDataReceived = false;
const TYPING_TIMER_LENGTH = 800;
let typingTimerId, callingPopupTimerId, el_thread;
const CHAT_INPUT_ID = 'chat-input', CHAT_INPUT_REPLY_ID = 'chat-input-reply';
let isScrollBottom = true;
let oldCalling = false;

interface VideoCallMessage {
  full_name?: string;
  user_id: any;
  sdp?: string;
  rtc_candidate?: string;
  notification_type: any;
  video_call_type: any;
  user_thumbnail_image?: string;
  channel_id: string;
  muid: string;
  call_type?: string;
  invite_link?: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./chat.component.scss'],
  animations: [
    scaleInOut,
    fadeIn,
    messageModalAnimation,
    barFadeInOut,
    trigger('openWebcamAnimation', [
      state('in', style({transform: 'translateY(0)'})),
      transition('void => *', [
        style({transform: 'translateY(100%)'}),
        animate('200ms cubic-bezier(0.600, 0.040, 0.980, 0.335)')
      ]),
      transition('* => void', [
        animate('150ms ease-out', style({transform: 'translateY(100%)'}))
      ])
    ]),
    trigger('imagePreviewAnimation', [
      state('in', style({transform: 'translateY(0)'})),
      transition('void => *', [
        style({transform: 'translateY(-100%)'}),
        animate('300ms ease-in')
      ]),
      transition('* => void', [
        animate('300ms ease-in', style({transform: 'translateY(-100%)'}))
      ])
    ]),
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({transform: 'translateY(15px)', opacity: 0}),
        animate('.32s .16ms cubic-bezier(0.23, 1, 0.32, 1)', keyframes([
          style({opacity: 0, transform: 'translateY(15px)', offset: 0}),
          style({opacity: 1, transform: 'translateY(0)', offset: 1.0})
        ]))]),
      transition(':leave', [
        style({transform: 'translateY(0px)', opacity: 1}),
        animate('.32s cubic-bezier(0.23, 1, 0.32, 1)', keyframes([
          style({opacity: 1, transform: 'translateY(0)', offset: 0}),
          style({opacity: 0, transform: 'translateY(15px)', offset: 1.0})
        ]))])
    ]),
    trigger('typingSlideIn', [
      transition(':enter', [
        style({height: 0, opacity: 0}),
        animate('100ms ease-in', style({height: '20px', opacity: 1})
        )]),
      transition(':leave', [
        style({height: '20px', opacity: 0}),
        animate('100ms ease-out', style({height: 0})
        )])
    ]),
    trigger('fadeSlideInMessages', [
      transition('* => new', [
        query('.other-message', [
          style({opacity: 0, transform: 'translateX(-15px)'}),
          animate('.42s .16ms cubic-bezier(0.23, 1, 0.32, 1)', keyframes([
            style({opacity: 0, transform: 'translateX(-15px)', offset: 0}),
            style({opacity: 1, transform: 'translateX(0)', offset: 1.0})
          ]))
        ], {optional: true}),
        query('.user-message', [
          style({opacity: 0, transform: 'translateX(15px)'}),
          animate('.42s .16ms cubic-bezier(0.23, 1, 0.32, 1)', keyframes([
            style({opacity: 0, transform: 'translateX(15px)', offset: 0}),
            style({opacity: 1, transform: 'translateX(0)', offset: 1.0})
          ]))
        ], {optional: true})
      ]),
      transition('* => added', [
        query('.other-message', [
          style({opacity: 0, transform: 'translateY(15px)'}),
          animate('.32s .16ms ease', keyframes([
            style({opacity: 0, transform: 'translateY(15px)', offset: 0}),
            style({opacity: 1, transform: 'translateY(0)', offset: 1.0})
          ]))
        ], {optional: true}),
        query('.user-message', [
          style({opacity: 0, transform: 'translateY(15px)'}),
          animate('.32s .16ms ease', keyframes([
            style({opacity: 0, transform: 'translateY(15px)', offset: 0}),
            style({opacity: 1, transform: 'translateY(0)', offset: 1.0})
          ]))
        ], {optional: true})
      ])
    ]),
    trigger('onEmojiClick', [
      state('true', style({transform: 'scale(1.0)'})),
      state('false', style({transform: 'scale(1.0)'})),

      transition('*=>true', [
        animate('300ms linear', keyframes([
          style({transform: 'scale(1.0)', offset: 0}),
          style({transform: 'scale(0.8)', offset: 0.25}),
          style({transform: 'scale(1.0)', offset: 0.5}),
          style({transform: 'scale(1.2)', offset: 0.75}),
          style({transform: 'scale(1.0)', offset: 1})
        ]))]),
      transition('true=>false', [
        animate('300ms linear', keyframes([
          style({transform: 'scale(1.0)', offset: 0}),
          style({transform: 'scale(0.8)', offset: 0.25}),
          style({transform: 'scale(1.0)', offset: 0.5}),
          style({transform: 'scale(1.2)', offset: 0.75}),
          style({transform: 'scale(1.0)', offset: 1})
        ]))])
    ])
  ]
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('replyMessageMask') set content(content: ElementRef) {
    if (content) {
      el_thread = document.getElementById('replyMessageMask');
      this.dragAndDropImagesEvent(el_thread);
    }
  }

  @Input()
  set group_data(data) {
    if (data && data.label) {
      this.label_header = data.label;
    }
  }

  @Input()
  set unstarAllMessages(data) {
    this.unstarringAllMessages(data);
  }

  @Input()
  set current_unread_count(data) {
    this.unread_count = data;
    this.commonService.showUnreadCount = true;
  }

  @Input()
  set searchParams(data) {
    /**
     * search message data output from search component and if channel id is same as active channel,
     * just hit get messages as router won't be working.
     */
    if (data) {
      /**
       * if search message is not a thread.
       */
      if (!data.thread_muid) {
        this.searchMessageData = data;
        this.scrollToMessageId = this.searchMessageData.muid || this.searchMessageData.id.toString();
      }
      this.messages = [];
      this.messages_dictionary = {};
      this.messages_map = new Map();
      if (data.channel_id == this.activeChannelId) {
        // clear photo carousel in case of same channel jump
        this.getMessages(data.channel_id, 1);
      } else {
        // '/'+this.spaceData.workspace_name,
        // this.router.navigate(['/'+this.spaceData.workspace,'/messages', data.channel_id]);
        this.router.navigate(['../' + data.channel_id], {relativeTo: this.activatedRoute});
      }
      /**
       * if message is thread then open reply popup
       */
      if (data.thread_muid) {
        setTimeout(() => {
          this.openReplyPopup(data, true);
          this.scrollToThreadId = data.thread_muid;
        }, 500);
      }
    }
  }

  @Input()
  set membersInformation(data) {
    if (!data || !Object.keys(data).length) {
      return;
    }
    this.is_deactivated_user = false;
    this.user_count = data.user_count;
    this.is_group_joined = data.group_joined;
    this.chat_type = data.chat_type;
    this.user_type = this.contentEditableData.user_type;
    const tempContentEditableData = {
      trigger_info: this.contentEditableData.trigger_info || [],
      chat_type: this.chat_type,
      input_id: CHAT_INPUT_ID,
      user_type: this.contentEditableData.user_type || null
    };
    const tempContentEditableReplyData = {
      trigger_info: [],
      is_thread: true,
      muid: this.contentEditableReplyData.muid || undefined,
      chat_type: this.chat_type,
      input_id: CHAT_INPUT_REPLY_ID,
      user_type: this.contentEditableReplyData.user_type || null
    };
    if (this.chat_type != ChatTypes.BOT) {
      if (this.chat_type != ChatTypes.ONE_TO_ONE) {
        // tempContentEditableData.trigger_info = [];
        tempContentEditableReplyData.trigger_info = [];
        const members_array = [...data.members];
        members_array.unshift({
          full_name: 'Everyone',
          user_id: -1,
          user_image: 'assets/img/channel-placeholder.png',
          is_everybody: true
        });

        const obj = {
          trigger: '@',
          allowSpaces: true,
          commandEvent: false,
          requireLeadingSpace: true,
          data_array: members_array,
          triggerType: 'USERS',
          members_count: data.user_count,
          template: (item) => {
            if (typeof item === 'undefined') {
              return null;
            }
            return `<a contenteditable="false" class="tagged-agent tagged-user" href="mention://${item.user_id}" data-uid="${item.user_id}">@${item.full_name}</a>`;
          }
        };
        tempContentEditableData.trigger_info.push(obj);
        tempContentEditableReplyData.trigger_info.push(obj);
      }
      this.membersInfo = data.members;
      this.selectedMembersInfo = data.members;

      this.membersCount = data.user_count;
    }
    this.contentEditableData = tempContentEditableData;
    this.contentEditableReplyData = tempContentEditableReplyData;
    if (this.chat_type == ChatTypes.ONE_TO_ONE) {
      this.is_deactivated_user = data.is_deactivated;
      if (data && data.members) {
        for (const i of data.members) {
          if (i.email && (i.email.includes('@fuguchat.com') || i.email.includes('@junglework.auth')) && i.user_id != this.commonService.userDetails.user_id) {
            this.send_email_enabled = false;
          }
        }
      }
    }
    if (!this.cdRef['destroyed']) {
      this.cdRef.detectChanges();
    }
  }

  // params for route change/ channel changed
  @Input()
  set params(val) {
    this._params = val;
    if (this.commonService.userDetails.user_id) {
      this.onParamsChange(val);
      this.scrolled_once = false;
    }
  }

  get params() {
    return this._params;
  }

  constructor(private router: Router, public commonService: CommonService,
              private cdRef: ChangeDetectorRef, private sessionService: SessionService,
              private service: ChatService, private messageService: MessageService,
              public layoutService: LayoutService, private emailService: EmailPopupService,
              private loaderService: LoaderService, public socketService: SocketioService,
              private localStorageService: LocalStorageService, public commonApiService: CommonApiService,
              private activatedRoute: ActivatedRoute) {
  }
  @ViewChild('scroll') scrollDiv: ElementRef;
  @ViewChild('chatScroll', {static: true}) private messagesScrollContainer: ElementRef;
  @ViewChild('replyModalContainer') private replyModalContainer: ElementRef;
  @ViewChild('readMoreText') private readMoreText: ElementRef;
  @ViewChild('chatInput') private chatInput: ContenteditableInputComponent;
  @ViewChild('chatInputReply') private chatInputReply: ContenteditableInputComponent;

  public MessageTypeEnum = MessageType;
  public ChatTypeEnum = ChatTypes;
  public RTCCallTypeEnum = RTCCallType;
  public MessageStatusEnum = MessageStatus;
  public MessageStateTypes = MessageStateTypes;
  showStickerPopupThread = false;
  otherUserData = {
    channel_image: '',
    user_name: '',
    user_id: ''
  };
  openInfoSafariPopup = false;
  isGroupType;
  email_array = [];
  email_popup_open = false;
  image_preview_open = false;
  alive = true;
  pageIndex = 1;
  showProfile = false;
  activeChannelId = -1;
  messages: Array<Message> = [];
  showLoader = false;
  isUserTyping = false;
  userTyping = false;
  userTypingName = '';
  userPresenceStatus = null;
  openConferencingPopup = false;
  openSelectLivestreamPopup = false;
  public isOnline = true;
  other_user_id;
  other_user_name;
  other_user_photo;
  other_user_type;
  messageEnd = false;
  messagesSubscription: Subscription;
  uploadSub: Subscription;
  getMembersSubscription: Subscription;
  userData;
  spaceData;
  pageSize = 0;
  fetchingOnScrollData: boolean;
  _params;
  is_scroll_enabled = false;
  scrolled_once = false;
  unread_placement_count;
  showProfilePopover = false;
  mentionProfileId = '';
  is_group_joined;
  membersInfo = [];
  membersCount;
  showImageDropOverlay = false;
  fugu_config;
  showThreadImageDropOverlay = false;
  showImageCarousel = false;
  dataForCarousel = {};
  channelImage;
  messages_dictionary = {};
  showStickerPopup = false;
  showEmojiPicker = false;
  showReplyCard = false;
  emojiPickerType;
  tempMessageObject;
  replyMessageArray = [];
  replyMessageDict = {};
  replyCommentObject: Message;
  allReactionsArray = [];
  selectedemoji;
  currentindex;
  is_deactivated_user = false;
  hideRight = true;
  hideLeft = true;
  isGoogleMeetCall = false;
  current_catalog_index;
  total_reaction_count = 0;
  menu_open_index;
  reply_menu_open_index;
  showReplyLoader = false;
  temp_message_menu_object;
  message_delete_time_expired = false;
  message_edit_time_expired = false;
  roleStatusEnum = Role;
  role_status = Role.isUser;
  forward_popup_open = false;
  reply_popup_enlarged = false;
  searchMessageData;
  is_search_conversation = false;
  scrollToMessageId;
  scrollToThreadId;
  is_thread_scroll_enabled = false;
  pageEnd;
  label_header = '';
  leave_role = '';
  frequent_contacted_flag = false;
  image_preview_files;
  send_email_enabled;
  chat_type;
  user_type;
  combined_object = {};
  starred_messages_open = false;
  bot_tags_data = [];
  bot_tags_data_displayed = [];
  show_bots_tags = false;
  tags_active_index = 0;
  video_call_obj = {
    is_video_open: false,
    is_video_caller: false,
    video_offer_data: {},
    incoming_call_popup: false,
    channel_id: null,
    channel_image: '',
    user_name: '',
    user_id: '',
    call_type: null
  };
  caller_info = <VideoCallMessage>{};
  conference_caller_info = {};
  call_type_popup;
  dropup_open = false;
  poll_popup_open = false;
  poll_view_open = false;
  total_votes_open = false;
  temp_poll_view_data;
  selectedVote;
  messages_map = new Map();
  editMsgObj;
  readEventsDelayedArray = [];
  socketConnectionState = 'CONNECTED';
  socketReconnectState;
  presenceTypeEnum = presenceType;
  showBillingStrip = true;
  user_count;
  starred_messages_ids = [];
  leaveRoleEnum = leaveRole;
  userTypeEnum = UserType;
  botsEnum = Bots;
  wsCallingData;
  callerAnotherWSInfo;
  showRitPopup = false;
  isAudioConference = false;
  livestreamId;

  selectedMembersInfo: any = [];

  // handle reply message from push notification
  // @Input()
  // set thread_msg_data(data) {
  //   if (data) {
  //     setTimeout(() => {
  //       this.openReplyPopup(data, true);
  //     }, 200);
  //   }
  // }
  @Output()
  deleteClick: EventEmitter<any> = new EventEmitter<boolean>();
  @Output()
  starClick: EventEmitter<any> = new EventEmitter<boolean>();
  @Output()
  unstarClick: EventEmitter<any> = new EventEmitter<boolean>();
  @Output()
  infoBtnClick: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  groupName: EventEmitter<object> = new EventEmitter<object>();
  @Output()
  joinGroupEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  showReadByWindow: EventEmitter<any> = new EventEmitter<any>();

  unread_count;
  _showTagList = false;
  show_more_text = false;
  view_more_bool = false;
  punchFromSidebar;
  isScrollToBottomComplete = true;
  attendanceChannel
  public showFloatingBtn: boolean;
  user_channel_status: number;
  public showFloatingBtnLength = 0;
  webcam_object = {
    is_open: false,
    stream: null,
    extras: {}
  };
  putUserData = {
    user_attendance_config: {
      punch_in_permission: 'NONE',
      punch_out_permission: 'NONE'
    }
  };
  contentEditableData = <IContentEditableData>{};
  contentEditableReplyData = <IContentEditableData>{};
  imageContentData = <IContentEditableData>{};

  showViewTaskPopup = false;

  @HostListener('document:click', ['$event'])
  private onMentionClick(event) {
    const targetElement: any = event.target as HTMLElement;

    const checkClick = targetElement.classList.contains('tagged-agent');

    if (targetElement.text && targetElement.text.includes(environment.FUGU_CONFERENCE_URL)) {
      const inviteLink = targetElement.text.split('/');
      const newUrl = `https://${window.location.host}/conference?invite_link=${inviteLink[3]}`;
      targetElement.href = newUrl;
    }
    if (checkClick) {
      event.preventDefault();
      const str = event.target.attributes.href.nodeValue;
      let user_id;
      if (isNaN(str)) {
        user_id = str.toString().split('//')[1];
      }
      if (user_id == -1) {
        return;
      }
      this.openProfileMentionPopover(event, user_id);
    }
  }

  ngOnInit() {
    this.commonService.openMeetProfile = false;
    this.onWindowReceiveData();
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['muid']) {
        this.activeChannelId = Number(window.location.pathname.split('/')[3]);
        const obj = {
          muid: params['muid'],
          channel_id: this.activeChannelId
        };
        this.openReplyPopup(obj, true);
      }

      this.activatedRoute.queryParams.subscribe(params => {
        if (params['openTask']) {
          this.viewTasks();
          this.router.navigate([], {queryParams: {}});
        }
      });

    });
    document.getElementById('chat-window').addEventListener('scroll', (e) => {
      this.messagesScroll(e, this.messagesScrollContainer.nativeElement);
    });
    this.userData = this.sessionService.get('loginData/v1')['user_info'];
    this.fugu_config = this.sessionService.get('loginData/v1')['fugu_config'];
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    if (this.spaceData.config.enable_one_to_one_chat && typeof (this.spaceData.config.enable_one_to_one_chat) == 'string') {
      this.spaceData.config.enable_one_to_one_chat = JSON.parse(this.spaceData.config.enable_one_to_one_chat);
      this.cdRef.detectChanges();
    } else if (this.spaceData.config.enable_one_to_one_chat) {
      this.spaceData.config.enable_one_to_one_chat = JSON.stringify(this.spaceData.config.enable_one_to_one_chat);
      this.spaceData.config.enable_one_to_one_chat = JSON.parse(this.spaceData.config.enable_one_to_one_chat);
      this.cdRef.detectChanges();
    }

    this.commonService.changeDetectEmittter.subscribe((data) => {
      this.cdRef.detectChanges();
    });

    this.role_status = this.spaceData.role;
    if (this.commonService.userDetailDict) {
      this.putUserData = <any>this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    }
    this.setupSocketListeners();
    this.commonService.putUserDetail.pipe(debounceTime(200)).subscribe((workspace) => {
      this.putUserData = <any>this.commonService.userDetailDict[workspace];
      if (this.activeChannelId < 1) {
        if (this.commonService.userDetails.user_id) {
          this.onParamsChange(this._params);
          this.scrolled_once = false;
        }
      }

    });

    this.commonService.spaceDataEmitter.subscribe(() => {
      // this.spaceData = this.sessionService.get('currentSpace');
      this.spaceData = this.commonService.currentOpenSpace;
      if (this.spaceData.config.enable_one_to_one_chat && typeof (this.spaceData.config.enable_one_to_one_chat) == 'string') {
        this.spaceData.config.enable_one_to_one_chat = JSON.parse(this.spaceData.config.enable_one_to_one_chat);
        this.cdRef.detectChanges();
      } else if (this.spaceData.config.enable_one_to_one_chat) {
        this.spaceData.config.enable_one_to_one_chat = JSON.stringify(this.spaceData.config.enable_one_to_one_chat);
        this.spaceData.config.enable_one_to_one_chat = JSON.parse(this.spaceData.config.enable_one_to_one_chat);
        this.cdRef.detectChanges();
      }
    });
    const el = document.getElementById('fugu-messenger-parent-div');
    this.dragAndDropImagesEvent(el);

    this.layoutService.visibilityEvent.subscribe(data => {
      if (data && this.readEventsDelayedArray.length) {
        for (let i = 0; i < this.readEventsDelayedArray.length; i++) {
          this.socketService.sendReadAllEvent(this.readEventsDelayedArray[i]);
        }
        this.readEventsDelayedArray = [];
      }
    });
    this.commonService.channelImageEmitter.subscribe(data => {
      this.channelImage = data;
    });
    this.layoutService.starredState.subscribe(data => {
      this.starred_messages_open = data;
    });

    this.layoutService.closeConferencePopup.subscribe(
      (res) => {
        /**close conference popup */
        this.video_call_obj.incoming_call_popup = false;
        this.cdRef.detectChanges();
      });
    /**
     * handling faye disconnection(when user clicks on video call notification)
     */
    if ('serviceWorker' in window.navigator) {
      window.navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.notification_type == MessageType.Video_Call) {
          if (this.isOnline && !this.socketService.socket.connected) {
            window.location.reload();
          }
        }
      });
    }
    this.messageService.punchInMessage
      .pipe(takeWhile(_ => this.alive))
      .subscribe((res: any) => {
        if (res) {
          this.punchFromSidebar = res.punchInSidebar;
          this.attendanceChannel = res.routeAttendanceBot;
          const hrefArray = window.location.href.split('/');
          if (hrefArray[hrefArray.length - 1] == res.routeAttendanceBot){
            if (this.activeChannelId == this.attendanceChannel && this.punchFromSidebar) {
              this.onSendClick({ message: 'in', tagged_users: Array(0), tagged_all: false, is_thread: undefined });
              this.punchFromSidebar = false;
            }
          } else {
            this.router.navigate([`../../${res.routeAttendanceBot}`], { relativeTo: this.activatedRoute });
            this.user_type = UserType.AttendanceBot;
            if (this.user_type == UserType.AttendanceBot) {
              const attObj = {
                en_user_id: this.commonService.userDetails.en_user_id,
                channel_id: this.activeChannelId
              };
              this.service.getAttendanceConfig(attObj).subscribe(resp => {
                this.putUserData = {
                  user_attendance_config: {
                    punch_in_permission: resp.data.user_attendance_config.punch_in_permission,
                    punch_out_permission: resp.data.user_attendance_config.punch_out_permission
                  }
                };
              });
              this.user_type = undefined;
          }
        }
        this.cdRef.detectChanges();
      }
    });

  }

  viewTasks() {
    this.showViewTaskPopup = true;
  }

  onSessionExpireMessageEvent(data) {
    jQuery('#sessionExpirePopup').modal('show');
    this.detectChanges();
  }

  emptyScrollId() {
    this.scrollToMessageId = '';
    this.cdRef.detectChanges();
  }

  cancelCallingWSPopup() {
    this.layoutService.stopVideoCallRinger();
    this.commonService.showOtherWSCallPopup = false;
    /**send hang up event to the server */
    this.rejectOtherWSCall();
    this.cdRef.detectChanges();
  }

  switchToCallingWS() {
    const wsName = this.callerAnotherWSInfo.workspace;
    this.commonService.showOtherWSCallPopup = false;
    this.router.navigate(['/' + wsName]);
    this.layoutService.stopVideoCallRinger();
    this.cdRef.detectChanges();
  }

  differentWSCallEvent(data) {
    this.wsCallingData = data;
    this.callerAnotherWSInfo = this.commonService.secretKeyDictionary[this.wsCallingData['app_secret_key']];
    if (data.user_unique_key == this.commonService.userDetails.user_unique_key) {
      if (data.video_call_type == 'CALL_HUNG_UP') {
        this.layoutService.stopVideoCallRinger();
        this.commonService.showOtherWSCallPopup = false;
        this.cdRef.detectChanges();
      }
    }
    if (data.user_unique_key != this.commonService.userDetails.user_unique_key) {
      switch (data.video_call_type) {
        /** show the switch workspace popup and play the sound*/
        case VideoCallType.START_CALL:
          if (!this.commonService.showOtherWSCallPopup) {
            this.layoutService.playNotificationSound('../../../assets/audio/video_call_ringtone', true);
          }
          this.commonService.showOtherWSCallPopup = true;
          this.cdRef.detectChanges();
          break;
        /**
         * if the caller hangs up, close the switch workspace popup.
         */
        case VideoCallType.CALL_HUNG_UP:
          this.layoutService.stopVideoCallRinger();
          this.commonService.showOtherWSCallPopup = false;
          this.cdRef.detectChanges();
          break;
        case VideoCallType.CALL_REJECTED:
          /* If call is picked up from some other device */
          if (this.commonService.showOtherWSCallPopup) {
            this.layoutService.stopVideoCallRinger();
            this.commonService.showOtherWSCallPopup = false;
            this.cdRef.detectChanges();
          }
          break;
      }
    }
  }

  rejectOtherWSCall() {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');

    const obj = {
      full_name: this.commonService.secretKeyDictionary[this.wsCallingData['app_secret_key']].full_name,
      user_id: this.commonService.secretKeyDictionary[this.wsCallingData['app_secret_key']].user_id,
      date_time: now,
      channel_id: this.wsCallingData.channel_id,
      message_type: MessageType.Video_Call,
      user_type: UserType.USER,
      is_silent: true,
      video_call_type: VideoCallType.CALL_REJECTED,
      muid: this.wsCallingData.muid
    };
    this.socketService.sendMessage(obj).then((res) => {
      },
      (error) => {
        if (error.statusCode == SocketErrorCodes.Turn_Credential_Fail) {
          const loginData = this.sessionService.get('loginData/v1');
          loginData['turn_credentials'] = error.data;
          this.sessionService.set('loginData/v1', loginData);
        }
      });
  }

  private videoCallEvent(data) {
    /**
     * 2 cases, when other user emits a faye message, 2nd when same user emits from another device
     */
    if (data.user_id != this.commonService.userDetails.user_id) {
      switch (data.video_call_type) {
        case VideoCallType.START_CALL:
          oldCalling = true;
          /**
           * when we receive start call, we check if popup is not already open and video call component
           * is already not open, then we set data, and send ready to connect event.
           */
          if (!this.video_call_obj.incoming_call_popup && !this.video_call_obj.is_video_open) {
            this.caller_info = data;
            this.video_call_obj.channel_image = (data && data.user_thumbnail_image) ? data.user_thumbnail_image : '';
            this.video_call_obj.user_name = data.full_name;
            this.video_call_obj.user_id = data.user_id;
            const iceConfigData = this.sessionService.get('loginData/v1')['turn_credentials'];
            this.createVideoCallMessage(data.channel_id, {
              turn_creds: iceConfigData,
              video_call_type: VideoCallType.READY_TO_CONNECT,
              muid: data.muid
            });
            this.cdRef.detectChanges();
            /**
             * if anything given above is open, we send a user busy event in socket, when call is different
             * from current call muid
             */
          } else if (data.muid != this.caller_info.muid) {
            this.createVideoCallMessage(data.channel_id, {
              video_call_type: VideoCallType.USER_BUSY,
              is_silent: true,
              muid: data.muid
            });
          }
          break;
        /**
         * open popup on receiving video offer when call is not connected or popup is not open.
         */
        case VideoCallType.VIDEO_OFFER:
          if (!this.video_call_obj.incoming_call_popup && !this.video_call_obj.is_video_open && !data.is_screen_share) {
            this.onVideoCallReceived(data);
            this.video_call_obj.video_offer_data = data;
            this.video_call_obj.call_type = data.call_type;
            clearTimeout(callingPopupTimerId);
            callingPopupTimerId = setTimeout(() => {
              this.video_call_obj.incoming_call_popup = false;
              this.cdRef.detectChanges();
            }, 30000);
          }
          break;
        /**
         * if user disconnects the call before it is picked up, we close the ringing popup( only if popup was open).
         */
        case VideoCallType.CALL_HUNG_UP:
          if (!this.video_call_obj.is_video_open && this.video_call_obj.incoming_call_popup
            && this.caller_info.muid == data.muid) {
            clearTimeout(callingPopupTimerId);
            this.video_call_obj.incoming_call_popup = false;
            this.cdRef.detectChanges();
          }
          break;
      }
      /**
       * cases when we receive socket event from same user
       */
    } else {
      switch (data.video_call_type) {
        /**
         * hangup the call when call is picked up from some other device.
         */
        case VideoCallType.CALL_HUNG_UP:
          if (!this.video_call_obj.is_video_open && this.video_call_obj.incoming_call_popup
            && this.caller_info.muid == data.muid) {
            clearTimeout(callingPopupTimerId);
            this.video_call_obj.incoming_call_popup = false;
            this.cdRef.detectChanges();
          }
          break;
        /**
         * hangup the call when call is rejected from some other device.
         */
        case VideoCallType.CALL_REJECTED:
          if (!this.video_call_obj.is_video_open && this.video_call_obj.incoming_call_popup) {
            clearTimeout(callingPopupTimerId);
            this.video_call_obj.incoming_call_popup = false;
            this.cdRef.detectChanges();
          }
          break;
      }
    }
  }

  private onCallingEvent(data) {
    /**
     * 2 cases, when other user emits a faye message, 2nd when same user emits from another device
     */
    oldCalling = false;
    if (data.user_id != this.commonService.userDetails.user_id) {
      switch (data.video_call_type) {
        case VideoCallType.START_CONFERENCE:
          /**
           * when we receive start call, we check if popup is not already open and video call component
           * is already not open, then we set data, and send ready to connect event.
           */
          if (!this.video_call_obj.incoming_call_popup && !this.video_call_obj.is_video_open) {
            this.caller_info = data;
            this.video_call_obj.channel_image = (data && data.user_thumbnail_image) ? data.user_thumbnail_image : '';
            this.video_call_obj.user_name = data.full_name;
            this.video_call_obj.user_id = data.user_id;
            this.createVideoCallMessage(data.channel_id, {
              // turn_creds: iceConfigData,
              video_call_type: VideoCallType.READY_TO_CONNECT_CONFERENCE,
              muid: data.muid,
              invite_link: data.invite_link
            });
            this.cdRef.detectChanges();
            /**
             * if anything given above is open, we send a user busy event in socket, when link is different
             * from current link
             */
          } else if (this.caller_info.invite_link != data.invite_link) {
            this.createVideoCallMessage(data.channel_id, {
              video_call_type: VideoCallType.USER_BUSY_CONFERENCE,
              is_silent: true,
              invite_link: data.invite_link,
              muid: data.muid
            });
          }
          break;
        /**
         * open popup on receiving video offer when call is not connected or popup is not open.
         */
        case VideoCallType.OFFER_CONFERENCE:
          if (!this.video_call_obj.incoming_call_popup && !this.video_call_obj.is_video_open && !data.is_screen_share) {
            this.onVideoCallReceived(data);
            this.video_call_obj.video_offer_data = data;
            this.video_call_obj.call_type = data.call_type;
            clearTimeout(callingPopupTimerId);
            callingPopupTimerId = setTimeout(() => {
              this.video_call_obj.incoming_call_popup = false;
              this.cdRef.detectChanges();
            }, 60000);
          }
          break;
        /**
         * if user disconnects the call before it is picked up, we close the ringing popup( only if popup was open).
         */
        case VideoCallType.HUNGUP_CONFERENCE:
          if (!this.video_call_obj.is_video_open && this.video_call_obj.incoming_call_popup
            && this.caller_info.invite_link == data.invite_link) {
            clearTimeout(callingPopupTimerId);
            this.video_call_obj.incoming_call_popup = false;
            this.cdRef.detectChanges();
          }
          break;
      }
      /**
       * cases when we receive socket event from same user
       */
    } else {
      switch (data.video_call_type) {
        /**
         * hangup the call when call is picked up from some other device.
         */
        case VideoCallType.HUNGUP_CONFERENCE:
          if (!this.video_call_obj.is_video_open && this.video_call_obj.incoming_call_popup) {
            clearTimeout(callingPopupTimerId);
            this.video_call_obj.incoming_call_popup = false;
            this.cdRef.detectChanges();
          }
          break;
        /**
         * hangup the call when call is rejected from some other device.
         */
        case VideoCallType.REJECT_CONFERENCE:
          if (!this.video_call_obj.is_video_open && this.video_call_obj.incoming_call_popup) {
            clearTimeout(callingPopupTimerId);
            this.video_call_obj.incoming_call_popup = false;
            this.cdRef.detectChanges();
          }
          break;
      }
    }
  }

  private deleteMessageEvent(data) {
    const updateReadObj = {
      message_state: 0,
      is_delete: true
    };
    updateReadObj[data.thread_muid ? 'thread_muid' : 'muid'] = data.thread_muid ? data.thread_muid : data.muid;
    this.layoutService.updateReadByWindow.emit(updateReadObj);
    // delete message control channel
    if (data.muid) {
      if (this.messages_dictionary[data.muid] || this.messages_dictionary[data.muid] == 0) {
        this.messages[this.messages_dictionary[data.muid]].message_state = 0;
        if (this.messages[this.messages_dictionary[data.muid]].message_type == 10 ||
          this.messages[this.messages_dictionary[data.muid]].message_type == 11) {
          if (this.commonService.channelMedia[data.muid]) {
            delete this.commonService.channelMedia[data.muid];
            this.commonService.changeDetectEmit();
          }
        }
      }
      if (this.replyCommentObject && this.replyCommentObject.muid == data.muid) {
        this.closeReplyPopup();
      }
    } else {
      if (this.replyMessageDict[data.thread_muid] || this.replyMessageDict[data.thread_muid] == 0) {
        if (this.replyMessageArray[this.replyMessageDict[data.thread_muid]]) {
          this.replyMessageArray[this.replyMessageDict[data.thread_muid]].message_state = 0;
          if (this.replyMessageArray[this.replyMessageDict[data.thread_muid]].message_type == 10 ||
            this.replyMessageArray[this.replyMessageDict[data.thread_muid]].message_type == 11) {
            if (this.commonService.channelMedia[data.thread_muid]) {
              delete this.commonService.channelMedia[data.thread_muid];
              this.commonService.changeDetectEmit();
            }
          }
        }
      }
    }
    const delete_star_obj = {
      muid: data.thread_muid || data.muid
    };
    this.deleteClick.emit(delete_star_obj);
    this.handleEditModeForDeleteFaye(data);
    this.cdRef.detectChanges();
  }

  private onEditMessageEvent(data) {
    const updateReadObj = {
      isEdit: true,
      message_state: 4
    };
    updateReadObj[data.thread_muid ? 'thread_muid' : 'muid'] = data.thread_muid ? data.thread_muid : data.muid;
    this.layoutService.updateReadByWindow.emit(updateReadObj);
    if (data.channel_id == this.activeChannelId) {
      if (data.thread_muid) {
        const index = this.replyMessageDict[data.thread_muid];
        if (index && this.replyMessageArray[index]) {
          this.replyMessageArray[index].message = data.message;
          this.replyMessageArray[index].message_state = MessageStateTypes.MESSAGE_EDITED;
        }
      } else if (data.muid) {
        const index = this.messages_dictionary[data.muid];
        if (index && this.messages[index]) {
          this.messages[index].message = data.message;
          this.messages[index].message_state = MessageStateTypes.MESSAGE_EDITED;
        }
      }
    }
    this.detectChanges();
  }

  private handleEditModeForDeleteFaye(data) {
    // handle edit message if deleted from other device
    if (this.editMsgObj) {
      if (this.editMsgObj.muid && this.editMsgObj.muid == data.muid) {
        this.cancelEditedMode();
      } else if (this.editMsgObj.thread_muid && this.editMsgObj.thread_muid == data.thread_muid) {
        this.cancelEditedMode();
      }
    }
  }

  private onParamsChange(params) {
    if (this.chatInput && this.activeChannelId) {
      this.chatInput.switchChannelSaveHTML(this.activeChannelId);
    }

    /**
     *on channel switch, empty the presence object and unsubscribe from the previous user
     */
    if (this.chat_type == 2) {
      this.userPresenceStatus = null;
      this.socketService.unsubscribePresence(this.other_user_id);
    }
    this.showImageCarousel = false;
    this.chat_type = null;
    this.closeReplyPopup();
    this.send_email_enabled = true;
    this.userTyping = false;
    this.pageEnd = undefined;
    this.is_search_conversation = false;
    this.showProfilePopover = false;
    this.messages_map = new Map();
    this.messages = [];
    this.messageEnd = false;
    this.replyMessageArray = [];
    this.messages_dictionary = {};
    this.showFloatingBtn = false;
    this.frequent_contacted_flag = false;
    this.showFloatingBtnLength = 0;
    this.image_preview_open = false;
    this.show_bots_tags = false;
    this.webcam_object.is_open = false;
    this.membersInfo = [];
    this.otherUserData = {
      channel_image: '',
      user_name: '',
      user_id: ''
    };
    // this.unread_count = 0;
    this.label_header = '';
    this.leave_role = null;
    this.starred_messages_ids = [];
    const channelId = +params['channelId'];
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
      this.messages = [];
    }
    if (this.getMembersSubscription) {
      this.getMembersSubscription.unsubscribe();
    }
    this.contentEditableData = <IContentEditableData>{};
    this.contentEditableReplyData = <IContentEditableData>{};
    this.pageIndex = 1;
    this.pageSize = 0;
    if (channelId) {
      this.activeChannelId = channelId;
      this.other_user_id = null;
      this.getMessages(channelId, this.pageIndex);
    }

  }

  getMessages(channelId, pageStart) {
    if (pageStart == 1) {
      this.isGroupType = false;
    }
    networkDataReceived = false;
    this.showLoader = true;
    this.cdRef.detectChanges();
    if (this.activeChannelId != channelId) {
    }
    this.is_scroll_enabled = false;
    if (this.searchMessageData) {
      pageStart = this.searchMessageData.message_index - 20 >= 0 ? this.searchMessageData.message_index - 20 : 1;
      this.pageEnd = this.searchMessageData.message_index + 20;
      this.pageIndex = pageStart;
      this.unread_count = 0;
      this.is_search_conversation = true;
    }
    if (this.unread_count > 100 && !this.scrolled_once) {
      this.pageEnd = this.unread_count + 20;
    }
    const obj = {
      channel_id: channelId,
      en_user_id: this.commonService.userDetails.en_user_id,
      page_start: pageStart,
      page_end: this.pageEnd,
      store_promise: true
    };
    if (this.unread_count > 100 && !this.scrolled_once) {
      this.pageIndex = this.pageIndex + this.unread_count - 80;
    }
    const params = this.commonService.convertGetRequestParams(obj);
    if ('caches' in window && pageStart == 1) {
      caches.match(environment.FUGU_API_ENDPOINT + 'conversation/getMessages' + params).then((response) => {
        if (response) {
          return response.json();
        }
      }).then((response) => {
        // don't overwrite newer network data
        if (!networkDataReceived && response && response.data && response.data.channel_id == this.activeChannelId) {
          this.chat_type = response.data.chat_type;
          this.isGroupType = [3, 4, 5, 6, 7, 8].includes(this.chat_type);
          this.isScrollToBottomComplete = false;
          this.layoutService.sendMessagePermission = response.data.only_admin_can_message ? 1 : 0;
          this.cdRef.detectChanges();
          this.messages = <Array<Message>>(response.data.messages).concat(this.messages);
          // this.messages = this.messages.concat(<Array<Message>>(response.data.messages));
          response.data.messages.map(item => {
            this.makeInChatPhotoCarousel(item);
            this.appendMessageInMap(item);
          });
          this.scrollToBottom();
          this.cdRef.detectChanges();
        }
      });
    }

    this.messagesSubscription = this.service.getMessages(obj).pipe(debounceTime(100)).pipe(takeWhile(() => this.alive)).subscribe(response => {

      if (response.data) {
        this.layoutService.chatTypeEmitter.emit(response.data.chat_type);
        this.chat_type = response.data.chat_type;
        this.user_channel_status = response.data.user_channel_status || 1;
        this.commonService.channelStatus = response.data.status == 0 ? 'DISABLED' : 'ENABLED';
        this.isGroupType = [3, 4, 5, 6, 7, 8].includes(this.chat_type);
        this.user_type = response.data.user_type;
        if (this.chat_type == 7 && this.showProfile) {
          this.onShowProfile();
        }
        this.layoutService.sendMessagePermission = response.data.only_admin_can_message ? 1 : 0;
        this.cdRef.detectChanges();
        this.other_user_id = response.data.user_id;
        this.other_user_name = response.data.label;
        this.other_user_photo = response.data.user_image;
        this.other_user_type = response.data.user_type;
        if (this.chat_type == 2) {
          this.socketService.subscribeToPresence(this.other_user_id);
        }
        if (pageStart == 1) {
          this.messages = [];
          this.messages_map.clear();
          if (!this.isScrollToBottomComplete) {
            this.isScrollToBottomComplete = false;
          }
        }
        this.showFloatingBtnLength += response.data.messages.length;
        try {
          if (!response.data.messages.length) {
            this.messageEnd = true;
          }
          this.pageSize = response.data.page_size;
          this.socketService.subscribeToChannel(this.activeChannelId);
          this.socketService.active_channel_id = this.activeChannelId;
          if (response.data.channel_id == this.activeChannelId) {
            this.messages = <Array<Message>>(response.data.messages).concat(this.messages);
          }
          this.label_header = response.data.label;
          this.leave_role = response.data.leave_type;
          const group_data = {
            label: this.label_header,
            custom_label: response.data.custom_label,
            members_info: []
          };
          this.groupName.emit(group_data);
          this.fetchingOnScrollData = false;
          if (this.unread_count > 0) {
            this.calculateUnreadPosition();
          }
          if (this.chatInput && !this.showReplyCard) {
            this.chatInput.focusContentEditable();
          }
          /**
           * if saved message from channel is emoji
           */
          if (this.layoutService.unsentMessagesObject[response.data.channel_id]
            && !this.is_deactivated_user && this.chatInput) {
            this.chatInput.setUnsentHTML(this.layoutService.unsentMessagesObject[response.data.channel_id]);
          }
          const thread_array = [];
          const dict_obj = {};
          /**
           * clear dictionary every time in case of search conversation.
           */
          if (this.is_search_conversation) {
            this.messages_dictionary = {};
          }
          const temp_merge_map = new Map();
          let msgArray;
          if (pageStart == 1) {
            msgArray = response.data.messages;
          } else {
            msgArray = response.data.messages.reverse();
          }
          msgArray.map((item) => {
            this.makeInChatPhotoCarousel(item);
            if (item.thread_message) {
              thread_array.push(item.muid);
            }
            /***
             * build a map for poll options users array for O(1) comparison.
             * when message type is 13 and users array exists.
             */
            if (item.message_type == MessageType.Poll) {
              item.expire_at = moment(item.date_time).add(item.expire_time, 'seconds');
              for (let i = 0; i < item.poll_options.length; i++) {
                if (item.poll_options[i].users) {
                  item.poll_options[i].users_map = item.poll_options[i].users.reduce((object, value) => {
                    object[value.user_id] = value;
                    return object;
                  }, {});
                } else {
                  item.poll_options[i].users_map = {};
                }
              }
            }
            /**
             * scroll is from top to prevent scroll top reaching on adding new messages
             * on pagination we move the scroll to 1.
             */
            if (pageStart != 1) {
              try {
                this.messagesScrollContainer.nativeElement.scrollTo(0, 1);
              } catch (error) {
                console.log(error);
              }
            }
            /**
             * map = {
             *     date: messages-array[]
             * }
             * 3 cases for building our map, as we have pagination and map maintains its order so we don't need to sort,
             * but due to pagination if we push any item after pagination it will be added at last of map but we want it
             * in front, so we take a temporary map and push items into that and merge both maps.
             * but we also check if that date already exists inside main map as when we merge two maps and if they both have
             * common key, it will keep the data of only recent map.
             * 1. check if main map if date exists and push into that
             * 2. check if temp map consists that date and push into that
             * 3. if nothing matches create new entry and push.
             * page start == 1 we push into array but if pagestart not equals 1 we unshift as paginated messages come in front.
             */
            if (this.messages_map.get(moment(item.date_time).format('YYYY-MM-DD'))) {
              const array = this.messages_map.get(moment(item.date_time).format('YYYY-MM-DD'));
              if (pageStart == 1) {
                array.push(item);
              } else {
                array.unshift(item);
              }
              this.messages_map.set(moment(item.date_time).format('YYYY-MM-DD'), array);
            } else if (temp_merge_map.get(moment(item.date_time).format('YYYY-MM-DD'))) {
              const array = temp_merge_map.get(moment(item.date_time).format('YYYY-MM-DD'));
              if (pageStart == 1) {
                array.push(item);
              } else {
                array.unshift(item);
              }
              temp_merge_map.set(moment(item.date_time).format('YYYY-MM-DD'), array);
            } else {
              const array = [];
              if (pageStart == 1) {
                array.push(item);
              } else {
                array.unshift(item);
              }
              temp_merge_map.set(moment(item.date_time).format('YYYY-MM-DD'), array);
            }
          });
          /**
           * merging maps
           */
          this.messages_map = new Map([...temp_merge_map, ...this.messages_map]);
          /**
           * 1. dictionary has 2 cases, 1st when normal pagination going on we increment index by page size
           * with each respective pagination hit.
           * 2. when we search message we don't have a valid page index position, so we normally do it
           * with every hit of pagination, as i have cleared the dictionary above in case of search.
           */
          for (let index = 0; index < this.messages.length; index++) {
            dict_obj[this.messages[index].muid] = index;
            // if (!this.is_search_conversation) {
            //   dict_obj[this.messages[index].muid] = index;
            // } else {
            //   dict_obj[this.messages[index].muid] = index;
            // }
          }
          this.messages_dictionary = Object.assign(this.messages_dictionary, dict_obj);
          if (response.data.messages && response.data.messages.length) {
            const thread_obj = {
              en_user_id: this.commonService.userDetails.en_user_id,
              channel_id: this.activeChannelId
            };
            if (pageStart == 1) {
              thread_obj['start_message_id'] = response.data.messages[0].id;
              thread_obj['end_message_id'] = response.data.messages[response.data.messages.length - 1].id;
            } else {
              thread_obj['start_message_id'] = response.data.messages[response.data.messages.length - 1].id;
              thread_obj['end_message_id'] = response.data.messages[0].id;
            }
            this.service.getStarredUsers(thread_obj).pipe(debounceTime(100)).subscribe((res) => {
              this.starred_messages_ids = [...this.starred_messages_ids, ...res.data.starred_muids];
              this.cdRef.detectChanges();
            });
          }

          /**
           * send bot tags data to bot input if it's a bot channel.
           */
          this.contentEditableData.user_type = response.data.user_type;
          this.contentEditableData = {...this.contentEditableData};
          if (response.data.chat_type != ChatTypes.ONE_TO_ONE && response.data.user_type != UserType.FuguSupportBot) {
            this.bot_tags_data = response.data.fugu_bot_tags;
            this.bot_tags_data_displayed = this.bot_tags_data.slice();
            const obj = {
              trigger: '/',
              allowSpaces: false,
              commandEvent: false,
              triggerType: 'BOT',
              requireLeadingSpace: true,
              data_array: response.data.fugu_bot_tags,
              template: (item) => {
                if (typeof item === 'undefined') {
                  return null;
                }
                return `<span class="bot-tags">/${item.tag}</span>`;
              }
            };
            if (!this.contentEditableData.trigger_info) {
              this.contentEditableData.trigger_info = [];
            }

            this.contentEditableData.trigger_info.push(obj);

            if (response.data.user_type != UserType.FuguSupportBot) {
              const all_members_obj = {
                workspace_id: this.spaceData.workspace_id,
                user_status: 'ENABLED',
                user_type: 'ALL_MEMBERS',
                page_start: 0
              };

              this.getMembersSubscription = this.service.getAllMembers(all_members_obj).pipe(debounceTime(100)).subscribe((res) => {
                this.membersInfo = res.data.all_members.map((item) => {
                  item.user_id = item.fugu_user_id;
                  return item;
                });

                const obj = {
                  trigger: '@',
                  allowSpaces: true,
                  commandEvent: false,
                  requireLeadingSpace: true,
                  data_array: this.membersInfo,
                  triggerType: 'USERS',
                  chat_type: response.data.chat_type,
                  template: (item) => {
                    if (typeof item === 'undefined') {
                      return null;
                    }
                    return `<a contenteditable="false" class="tagged-agent tagged-user" href="mention://${item.user_id}" data-uid="${item.user_id}">@${item.full_name}</a>`;
                  }
                };

                if (response.data.chat_type == ChatTypes.BOT) {
                  this.contentEditableData.trigger_info.push(obj);
                }

              });

            }
          }
          /**
           * set last conversation message from messages for cases when faye misses, so that sidebar message can
           * be updated, this is not done in case of search as it will set sidebar to some previous search value.
           */
          if (!this.is_search_conversation) {
            this.setLastConversationMessage(this.messages[this.messages.length - 1]);
          }
          /**
           * video call information object
           */
          this.otherUserData = {
            channel_image: response.data.user_image,
            user_name: response.data.label,
            user_id: response.data.user_id
          };
          if (this.unread_count > 0 && pageStart == 1) {
            let unread_count = this.unread_count;
            const revMsg = this.messages.slice().reverse();
            for (let i = 0; i < revMsg.length; i++) {
              const element = revMsg[i];
              if (element.message_type != MessageType.Public_Notes) {
                unread_count = unread_count - 1;
              }
              if (unread_count == 0) {
                element['unread_start'] = true;
                break;
              }
            }
          }
          if (pageStart == 1 && !this.is_search_conversation) {
            this.scrollToBottom();
          }
        } catch (e) {
          console.log(e);
        } finally {
          this.showLoader = false;
          setTimeout(() => {
            if (this.unread_count > 0 && !this.scrolled_once) {
              this.is_scroll_enabled = true;
              this.scrolled_once = true;
            }
            if (this.searchMessageData) {
              this.is_scroll_enabled = true;
              this.searchMessageData = null;
            }
            this.cdRef.detectChanges();
          }, 300);
        }
        networkDataReceived = true;
      }

      if (this.user_type == UserType.AttendanceBot) {
        const attObj = {
          en_user_id: this.commonService.userDetails.en_user_id,
          channel_id: this.activeChannelId
        };
        this.service.getAttendanceConfig(attObj).subscribe(res => {
          this.putUserData = {
            user_attendance_config: {
              punch_in_permission: res.data.user_attendance_config.punch_in_permission,
              punch_out_permission: res.data.user_attendance_config.punch_out_permission
            }
          };
        });
        if (this.activeChannelId == this.attendanceChannel && this.punchFromSidebar) {
          this.onSendClick({ message: 'in', tagged_users: Array(0), tagged_all: false, is_thread: undefined });
          this.punchFromSidebar = false;
        }
      }
    });

  }

  setLastConversationMessage(obj) {
    if (this.commonService.conversations[this.activeChannelId]) {
      obj.last_sent_by_full_name = obj.full_name;
      obj.last_sent_by_id = obj.user_id;
      this.commonService.conversations[this.activeChannelId] = Object.assign(
        {...this.commonService.conversations[this.activeChannelId]}, obj);
    }
  }

  openImage(media) {
    if (media.is_uploading) {
      return;
    }
    this.dataForCarousel['currentMuid'] = media.thread_muid || media.muid;
    this.dataForCarousel['channelImage'] = this.channelImage;
    this.dataForCarousel['channelName'] = this.label_header;
    this.dataForCarousel['channelId'] = this.activeChannelId;
    this.dataForCarousel['chatType'] = this.chat_type;
    this.showImageCarousel = true;
  }

  async onSendClick(data) {
    if (!(this.socketService.socket.connected && this.isOnline)) {
      return;
    }
    if (!([ChatTypes.BOT].includes(this.chat_type)) || data.is_thread || this.user_type == UserType.SelfNote) {
      const msg = this.createSocketMessageToSend(data);
      if (msg.is_thread_message) {
        this.appendReplyMessage(msg);
        this.socketService.sendThreadMessage(msg);
      } else {
        delete this.layoutService.unsentMessagesObject[this.activeChannelId];
        this.unread_count = 0;
        this.appendMessage(msg, true);
        this.sendMessageThroughSocket(msg);
      }
    } else {

      const message = data.message;
      const metric_array = message.split(' ');
      const metric = metric_array[0].substring(1);
      const obj = {
        workspace_id: this.spaceData.workspace_id,
        tagged_users: data.tagged_users,
        metric: message.includes('/') ? metric.trim() : undefined,
        metric_text: !data.tagged_users.length || !message.includes('/') ?
          message.includes('/') ? message.replace(metric_array[0], '').trim() : message : undefined,
        channel_id: this.activeChannelId,
        bot_user_id: this.other_user_id,
        tagged_all: data.tagged_all
      };
      if (this.user_type == UserType.AttendanceBot && (message.toLowerCase().includes('leave') || message.toLowerCase().includes('home'))) {
        const dateObj = this.service.getDateRange(message);
        if (dateObj.dates.length == 0) {
          // let now = moment().utc().format();
          // now = now.replace('Z', '.000Z');
          const nowDate = new Date();
          const date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
          const now = new Date(date).toISOString();
          // local test
          // obj['leave_start_date'] = now;
          // obj['leave_start_date'] = this.commonService.getUTCFromDate(now);\

          // if not date specified
          //   let formatted = moment(`${new Date()}`, 'ddd MMM DD HH:mm:ss a');
          obj['leave_start_date'] = this.commonService.getCurrentTimeLeave();
          // obj['leave_start_date'] = obj['leave_start_date'] = moment(nowDate).format('YYYY-MM-DD[T]HH:mm:SS.SSS[Z]');
          obj['time_zone'] = this.commonService.getTimeZone();

          // 2020-09-10T07:34:01Z my
          // 2020-09-10T05:38:40.512Z app

        } else if (dateObj.dates.length == 1) {

          // Fri Sep 11 2020 15:30:10 GMT+0530
          const nowDate = new Date(dateObj.dates[0]);
          let date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
          date = new Date(date).toISOString();
          // let date = moment(dateObj.dates[0]).utc().format();
          // date = date.replace('Z', '.000Z');
          // local test
          // obj['leave_start_date'] = date;
          // 2020-10-10T00:00:00.000Z
          // 2020-10-10T00:00:000Z
          obj['leave_start_date'] = this.commonService.getUTCFromDateForLeave(dateObj.dates[0]);
          obj['time_zone'] = this.commonService.getTimeZone();
          // obj['leave_start_date'] = '2020-10-11T00:00:00.000Z';
          // obj['leave_start_date'] = afterMoment;

        } else if (dateObj.dates.length == 2) {
          let startDate, endDate;
          if (dateObj.dates[0].getTime() > dateObj.dates[1].getTime()) {
            // startDate = moment(dateObj.dates[1]).utc().format();
            const nowDate = new Date(dateObj.dates[1]);
            const endNowDate = new Date(dateObj.dates[0]);
            startDate = new Date(nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate()).toISOString();
            // endDate = moment(dateObj.dates[0]).utc().format();
            endDate = new Date(endNowDate.getFullYear() + '-' + (endNowDate.getMonth() + 1) + '-' + endNowDate.getDate()).toISOString();
          } else {
            const nowDate = new Date(dateObj.dates[0]);
            const endNowDate = new Date(dateObj.dates[1]);
            // startDate = moment(dateObj.dates[0]).utc().format();
            startDate = new Date(nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate()).toISOString();
            endDate = new Date(endNowDate.getFullYear() + '-' + (endNowDate.getMonth() + 1) + '-' + endNowDate.getDate()).toISOString();
          }
          // startDate = startDate.replace('Z', '.000Z');
          // endDate = endDate.replace('Z', '.000Z');
          // local test
          // obj['leave_start_date'] = startDate;
          obj['leave_start_date'] = this.commonService.getUTCFromDateForLeave(dateObj.dates[0]);
          obj['leave_end_date'] = this.commonService.getUTCFromDateForLeave(dateObj.dates[1]);
          obj['time_zone'] = this.commonService.getTimeZone();
          // obj['leave_end_date'] = endDate;
        }

      } else if (this.user_type == UserType.AttendanceBot
        && ['in', '/in', 'out', '/out'].includes(message.toLowerCase())) {
        const text = ['in', '/in'].includes(message.toLowerCase()) ? 'in' : 'out';
        /**
         * if permission is set to CAMERA OR BOTH we open camera.
         */
        if (this.putUserData.user_attendance_config) {
          const punch_in_permission = this.putUserData.user_attendance_config.punch_in_permission;
          const punch_out_permission = this.putUserData.user_attendance_config.punch_out_permission;
          if ((text == 'in' && ['CAMERA', 'BOTH'].includes(punch_in_permission)) ||
            (text == 'out' && ['CAMERA', 'BOTH'].includes(punch_out_permission))) {
            this.openWebCam({
              type: 'PUNCH',
              text: text,
              permission: text == 'in' ? punch_in_permission : punch_out_permission
            });
          } else if ((text == 'in' && punch_in_permission == 'NONE') ||
            (text == 'out' && punch_out_permission == 'NONE')) {
            this.attendanceUpload({
              extras: {
                text: text,
                permission: text == 'in' ? punch_in_permission : punch_out_permission
              }
            });
          } else if ((text == 'in' && punch_in_permission == 'LOCATION') ||
            (text == 'out' && punch_out_permission == 'LOCATION')) {
            this.loaderService.show();
            this.messageService.sendAlert({
              type: 'success',
              msg: 'Fetching your location.',
              timeout: 3000
            });
            const location = await this.service.getGeoLocation();
            this.loaderService.hide();
            this.attendanceUpload({
              location: location,
              extras: {
                text: text,
                permission: text == 'in' ? punch_in_permission : punch_out_permission
              }
            });
          }
        }
        return;
      }
      this.bot_tags_data_displayed = this.bot_tags_data.slice();
      this.createBotMessageAndSend(Object.assign(obj, {message: message}));
    }
  }

  public createSocketMessageToSend(obj?) {

    // let now = moment().utc().format();
    // now = now.replace('Z', '.000Z');

    let now = moment().format();
    now = now.replace('Z', '.000Z');

    const data = {
      message: obj.message,
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      email: this.userData.email,
      channel_id: this.activeChannelId,
      is_thread_message: obj.is_thread,
      is_typing: Typing.Typing_End,
      muid: !obj.is_thread ? this.commonService.generateRandomString() : this.replyCommentObject.muid,
      thread_muid: obj.is_thread ? this.commonService.generateRandomString() : undefined,
      message_type: MessageType.Text_Message,
      user_type: UserType.USER,
      message_status: MessageStatus.Sending,
      formatted_message: this.commonService.convertMarkdownText(obj.message, true),
      tagged_all: obj.tagged_all,
      tagged_users: obj.tagged_users
    };
    return data;
  }

  private createBotMessageAndSend(obj) {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    let data = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      email: this.userData.email,
      muid: this.commonService.generateRandomString(),
      message_type: MessageType.Text_Message,
      channel_id: this.activeChannelId,
      message_status: MessageStatus.Sending
    };
    data = Object.assign(data, obj);
    this.appendMessage(data, true);
    this.sendMessageThroughSocket(data);
  }

  private sendMessageThroughSocket(message) {
    if (!this.is_group_joined) {
      return;
    }
    if (!message.muid) {
      message['muid'] = this.commonService.generateRandomString();
    }
    if (this.other_user_id && !this.frequent_contacted_flag) {
      this.setFrequentlyContactedUsers();
      this.setFrequentlyContactedUsersDetail();
    }
    this.sendTypingStoppedEvent();
    this.socketService.sendMessage(message).then(() => {
    }, error => {
      if (error.statusCode == SocketErrorCodes.Poll_expired) {
        this.messages[this.messages_dictionary[message.muid]].is_expired = true;
      }
    });
  }

  setupSocketListeners() {
    // socket event subscriptions
    this.socketService.onTypingEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onTypingStartEvent(data));

    this.socketService.onTypingStopEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onTypingStopEvent(data));

    this.socketService.onPresenceEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onPresenceEvent(data));

    this.socketService.onActiveChannelMessageReceivedEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onMessageReceivedEvent(data));

    this.socketService.onThreadMessageEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onThreadMessageReceivedEvent(data));

    this.socketService.onMessageSentEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onMessageSentEvent(data));

    this.socketService.onReadAllEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onMessageReadEvent(data));

    this.socketService.onReactionEvent.pipe(takeWhile(() => this.alive)).subscribe((data: Message) => {
      const msg_ref = !data['thread_muid'] ?
        this.messages[this.messages_dictionary[data.muid]] :
        this.replyMessageArray[this.replyMessageDict[data['thread_muid']]];
      this.onReactionClick(msg_ref,
        data.user_reaction_emoji, data.user_id, data.full_name);
    });

    this.socketService.onMemberAddEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onMessageReceivedEvent(data));

    this.socketService.onDeleteMessageEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.deleteMessageEvent(data));

    this.socketService.onEditMessageEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onEditMessageEvent(data));

    this.socketService.onMemberRemoveEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onMessageReceivedEvent(data));

    this.socketService.onSessionExpireEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onSessionExpireMessageEvent(data));

    this.socketService.onVideoCallEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.videoCallEvent(data));

    this.socketService.onCallingEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onCallingEvent(data));

    this.socketService.differentWSCallEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.differentWSCallEvent(data));

    this.socketService.onGroupUpdateEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onMessageReceivedEvent(data));

    this.socketService.onPollVoteEvent.pipe(takeWhile(() => this.alive)).subscribe((data: Message) => {
      if (this.messages[this.messages_dictionary[data.muid]]) {
        let poll_option_obj = {};
        for (let i = 0; i < this.messages[this.messages_dictionary[data.muid]].poll_options.length; i++) {
          if (this.messages[this.messages_dictionary[data.muid]].poll_options[i].puid == data['puid']) {
            poll_option_obj = this.messages[this.messages_dictionary[data.muid]].poll_options[i];
            break;
          }
        }
        this.addOrRemoveVote(this.messages[this.messages_dictionary[data.muid]],
          poll_option_obj, {user_id: data.user_id, full_name: data.full_name, user_image: data.user_image});
      }
    });

    this.socketService.connectionStateEvent.pipe(takeWhile(() => this.alive)).
      subscribe(data => this.onSocketConnectionStateEvent(data));

    this.socketService.onVideoConferenceEvent.pipe(takeWhile(() => this.alive)).subscribe(data => this.onConferenceCallEvent(data));

    this.socketService.reconnectionEvent.pipe(takeWhile(() => this.alive)).
      subscribe(data => this.onSocketReconnect(data));
  }

  onMessageReceivedEvent(data) {
    if (data.message_type) {
      //if message state is not present set default to 1
      if (!data.message_state) {
        data.message_state = MessageStateTypes.MESSAGE_NOT_DELETED;
      }

      /* update time from server of message */
      if (!data.is_thread_message && data.date_time && this.messages_dictionary[data.muid] && this.messages[this.messages_dictionary[data.muid]]) {
        this.messages[this.messages_dictionary[data.muid]].date_time = data.date_time;
      }
      /**
       * If hascaption key is false, empty the message string
       */
      if ('hasCaption' in data && !data.hasCaption) {
        data.message = '';
      }
      // if (data.message_type != MessageType.Video_Call) {
      // handle already sent messages if muid exists in dictionary
      if (!(this.messages_dictionary[data.muid]
        || this.messages_dictionary[data.muid] == 0)) {
        // handle new messages
        if ((data.message || data.thumbnail_url || data.url) && !data.thread_muid) {
          this.pageIndex = this.pageIndex + 1;
          // now message will NOT be appened by FAYE. but read/ unread receipt will be updated by FAYE

          if (data.channel_id == this.activeChannelId) {
            if (data.user_id != this.commonService.userDetails.user_id || !data.is_web || data.message_type == MessageType.Button_Message) {
              /**
               * set message status to sent if message is sent from another device but same account.
               */
              if (this.commonService.userDetails.user_id == data.user_id) {
                data.message_status = MessageStatus.Sent;
              }
              if (this.unread_count != 0 && data.user_id != this.commonService.userDetails.user_id) {
                if (data.message_type != MessageType.Public_Notes) {
                  this.unread_count += 1;
                }
                // this.unread_placement_count -= 1;
              } else {
                this.unread_count = 0;
                this.unread_placement_count = 0;
              }
              if (data.notification_type == NotificationType.Group_Update) {
                if (data.channel_id == this.activeChannelId) {
                  if (data.is_chat_type_changed) {
                    // emit chattype change
                    this.commonService.chatTypeUpdated.emit(data);
                  } else if (data.user_ids_to_make_admin || data.user_ids_to_remove_admin) {
                    if (data.user_ids_to_make_admin) {
                      this.layoutService.groupAdminData = [...this.layoutService.groupAdminData, ...data.user_ids_to_make_admin];
                    }
                    if (data.user_ids_to_remove_admin) {
                      data.user_ids_to_remove_admin.forEach((item) => {
                        const index = this.layoutService.groupAdminData.indexOf(item);
                        if (index > -1) {
                          this.layoutService.groupAdminData.splice(index, 1);
                        }
                      });
                    }
                    this.commonService.groupAdminUpdated.emit(data);
                  }
                }
              }

              // event sent by user or another user
              if (!this.is_search_conversation) {
                /**
                 * fill required information for poll (users_map and poll count, users map is required to be
                 * empty as caching doesn't store our own maps and when cache return before getmessages, we encounter an error.
                 */
                if (data.message_type == MessageType.Poll) {
                  data.total_votes = 0;
                  for (let i = 0; i < data.poll_options.length; i++) {
                    data.poll_options[i].users_map = {};
                    data.poll_options[i].poll_count = 0;
                  }
                }
                // donot scroll on new msg if he is not at bottom
                if (this.showFloatingBtn) {
                  this.appendMessage(data);
                } else {
                  this.appendMessage(data, true);
                }
              }
              // send read response as the agent has already opened the current chat
              // let now = moment().utc().format();
              // now = now.replace('Z', '.000Z');
              const obj = {
                user_id: +this.commonService.userDetails.user_id,
                channel_id: JSON.parse(JSON.stringify(this.activeChannelId)),
                notification_type: NotificationType.Read_All
              };
              if (this.layoutService.page_visibility) {
                this.socketService.sendReadAllEvent(obj);
              } else {
                this.readEventsDelayedArray.push(obj);
              }
            } else {
              this.unread_count = 0;
            }
          }
        }
        this.cdRef.detectChanges();
      }
    }
  }

  onThreadMessageReceivedEvent(data) {

    if (data.is_thread_message) {
      const obj = {
        full_name: data.full_name,
        user_image_50x50: data.user_image_50x50,
        user_id: data.user_id
      };
      /* update date_time from server */
      if (this.replyMessageArray[this.replyMessageDict[data.thread_muid]] && (data.date_time && this.replyMessageDict[data.thread_muid] || this.replyMessageDict[data.thread_muid] == 0)) {
        this.replyMessageArray[this.replyMessageDict[data.thread_muid]].date_time = data.date_time;
      }

      /* if thread is new, add a thread_message_data array */
      if (this.messages_dictionary[data.muid] && !this.messages[this.messages_dictionary[data.muid]].thread_message_data) {
        this.messages[this.messages_dictionary[data.muid]].thread_message_data = [];
      }
      /* if user id exists already delete it and then push it again in the array */
      if (this.messages_dictionary[data.muid] && this.messages[this.messages_dictionary[data.muid]].thread_message_data) {
        this.messages[this.messages_dictionary[data.muid]].thread_message_data.map((item, index) => {
          if (item.user_id == data.user_id) {
            this.messages[this.messages_dictionary[data.muid]].thread_message_data.splice(index, 1);
          }
        });
      }
      if (this.messages_dictionary[data.muid]) {
        this.messages[this.messages_dictionary[data.muid]].thread_message_data.push(obj);
      }
    }
    if ((data.user_id != this.commonService.userDetails.user_id || !data.is_web) && !this.replyMessageDict[data.thread_muid]) {
      // if that thread is open, append in current reply window
      if (this.replyCommentObject && this.replyCommentObject.muid == data.muid
        && this.showReplyCard) {
        isScrollBottom = false;
        if (this.replyModalContainer) {
          if ((this.replyModalContainer.nativeElement.scrollTop +
            this.replyModalContainer.nativeElement.clientHeight)
            / this.replyModalContainer.nativeElement.scrollHeight >= 0.98) {
            isScrollBottom = true;
          }
        }
        this.appendReplyMessage(data);
        // else just increment count in get messages
      } else {
        try {
          if (data.is_thread_message) {
            this.messages[this.messages_dictionary[data.muid]].thread_message = true;
            this.messages[this.messages_dictionary[data.muid]].last_reply = data.date_time;
            this.messages[this.messages_dictionary[data.muid]].thread_message_count
              ? this.messages[this.messages_dictionary[data.muid]].thread_message_count += 1
              : this.messages[this.messages_dictionary[data.muid]].thread_message_count = 1;
            // if (data.user_image_50x50) {
            //   let obj = {
            //     full_name: data.full_name,
            //     user_image_50x50: data.user_image_50x50,
            //     user_id: data.user_id
            //     }
            //   if (!this.messages[this.messages_dictionary[data.muid]].thread_message_data) {
            //     this.messages[this.messages_dictionary[data.muid]].thread_message_data = [];
            //     this.messages[this.messages_dictionary[data.muid]].thread_message_data[0] = obj;
            //   } else if (this.messages[this.messages_dictionary[data.muid]].thread_message_data[0].user_id != data.user_id) {
            //     this.messages[this.messages_dictionary[data.muid]].thread_message_data[1] = obj;
            //   }
            // }
          }
          if ([MessageType.Media_Message, MessageType.Video_Message,
            MessageType.File_Message].includes(data.message_type)) {
            this.commonService.channelMedia[data.thread_muid] = {
              message: data,
              date_time: data.date_time,
              messageType: data.message_type,
              documentType: data.document_type || this.commonService.checkMimeType(data.message_type == this.MessageTypeEnum.Media_Message ?
                data['image_url'] : data['url'])
            };
            this.commonService.changeDetectEmit();
          }
        } catch (e) {
          console.log(e);
        }
      }
      this.cdRef.detectChanges();
    }
  }

  onPresenceEvent(data) {
    if (data.user_id != this.commonService.userDetails.user_id && this.other_user_id == data.user_id) {
      this.userPresenceStatus = data;
    }
    this.cdRef.detectChanges();
  }

  onTypingStartEvent(data) {
    if (data.user_id != this.commonService.userDetails.user_id
      && data.channel_id == this.activeChannelId) {
      this.userTyping = true;
      this.userTypingName = data.full_name;
    }
    this.cdRef.detectChanges();
  }

  onTypingStopEvent(data) {
    if (data.user_id != this.commonService.userDetails.user_id) {
      // delete typing timer
      this.userTyping = false;
      this.userTypingName = '';
    }
    this.cdRef.detectChanges();
  }

  private sendTypingStartEvent() {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    const data = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      channel_id: this.activeChannelId
    };
    this.socketService.typingEvent(data);
    // if timer exist delete previous timer before starting new
    const lastTypingTime = (new Date()).getTime();

    if (typingTimerId) {
      clearTimeout(typingTimerId);
    }
    typingTimerId = setTimeout(() => {
      const typingTimer = (new Date()).getTime();
      const timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH) {
        this.sendTypingStoppedEvent();
      }
    }, TYPING_TIMER_LENGTH);

  }

  private sendTypingStoppedEvent() {
    if (typingTimerId) {
      clearTimeout(typingTimerId);
    }
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    const data = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      user_type: UserType.USER,
      channel_id: this.activeChannelId
    };
    this.socketService.stopTypingEvent(data);
  }

  onMessageSentEvent(data) {
    if ((this.messages_dictionary[data.muid] || this.messages_dictionary[data.muid] == 0) && !data.thread_muid
      && typeof data.user_reaction_emoji == 'undefined' && !data.message_poll
      && this.messages[this.messages_dictionary[data.muid]]) {

      this.messages[this.messages_dictionary[data.muid]].message_status = MessageStatus.Sent;
      let now = moment().utc().format();
      now = now.replace('Z', '.000Z');
      this.messages[this.messages_dictionary[data.muid]].date_time = now;
      this.cdRef.detectChanges();
      if ('caches' in window) {
        const obj = {
          channel_id: this.activeChannelId,
          en_user_id: this.commonService.userDetails.en_user_id,
          page_start: 1
        };
        const params = this.commonService.convertGetRequestParams(obj);
        caches.match(environment.FUGU_API_ENDPOINT + 'conversation/getMessages' + params).then((response) => {
          if (response) {
            const clonedResponse = response.clone();
            clonedResponse.text().then(body => {
              const parsedResponse = JSON.parse(body);
              data['message_status'] = 1;
              parsedResponse.data.messages.push(data);
              try {
                navigator.serviceWorker.controller.postMessage({
                  source: 'alterMessageResponse',
                  url: clonedResponse.url ? clonedResponse.url : environment.FUGU_API_ENDPOINT + 'conversation/getMessages' + params,
                  response: parsedResponse
                });
              } catch (e) {
              }
            });
          }
        });
      }
    }
  }

  onMessageReadEvent(data) {
    // check if user has read or not?
    if (this.commonService.userDetails.user_id != data.user_id && this.messages[0]
      && data.channel_id == this.activeChannelId) {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (this.messages[i].message_status == MessageStatus.Sent) {
          this.messages[i].message_status = MessageStatus.Read;
        } else {
          break;
        }
      }
      this.cdRef.detectChanges();
    }
  }

  onSocketConnectionStateEvent(data) {
    this.socketConnectionState = data.state;
    this.cdRef.detectChanges();
  }

  onSocketReconnect(data) {
    if (this.chat_type == 2) {
      this.socketService.subscribeToPresence(this.other_user_id);
    }
    this.socketReconnectState = true;
    setTimeout(() => {
      this.socketReconnectState = false;
      this.cdRef.detectChanges();
    }, 2000);
  }

  private appendMessage(data, scroll_to_bottom?): void {
    // check for invalid data
    if (data.message_type == this.MessageTypeEnum.Text_Message && !data.message.trim()) {
      return;
    } else if (data.message_type == this.MessageTypeEnum.Media_Message && !data.image_url.trim()) {
      return;
    } else if ((data.message_type == this.MessageTypeEnum.File_Message || data.message_type ==
      this.MessageTypeEnum.Video_Message) && !data.url.trim()) {
      return;
    }
    let msgStatus = data.message_status;
    msgStatus = ((msgStatus == undefined) ||
      (msgStatus == MessageStatus.Sending && data.user_id != this.commonService.userDetails.user_id)) ?
      MessageStatus.Sent : msgStatus;
    this.isUserTyping = false;
    this.userTyping = false;
    const obj = Object.assign(data, {
      'message_status': msgStatus,
      'state': 'added', 'message_state': MessageStateTypes.MESSAGE_NOT_DELETED
    });
    if (data.message_type == this.MessageTypeEnum.Poll) {
      obj['expire_at'] = moment(data.date_time).add(data.expire_time, 'seconds');
      obj['total_votes'] = 0;
    }

    if ([MessageType.Media_Message, MessageType.Video_Message,
      MessageType.File_Message].includes(data.message_type)) {
      this.commonService.channelMedia[data.muid] = {
        message: obj,
        date_time: obj.date_time,
        messageType: data.message_type,
        documentType: data.document_type || this.commonService.checkMimeType(data.message_type == this.MessageTypeEnum.Media_Message ?
          obj['image_url'] : obj['url'])
      };
      this.commonService.changeDetectEmit();
    }
    if (scroll_to_bottom) {
      this.showFloatingBtn = false;
      this.cdRef.detectChanges();
    }
    this.messages.push(obj);
    this.makeInChatPhotoCarousel(obj);
    this.appendMessageInMap(this.messages[this.messages.length - 1]);
    // this.incrementCounter();
    this.messages_dictionary[data.muid] = this.messages.length - 1;
    if (!this.is_search_conversation) {
      this.setLastConversationMessage(data);
    }
    setTimeout(() => {
      if (scroll_to_bottom) {
        this.scrollToBottom();
      }
    }, 200);
  }

  private appendReplyMessage(data) {
    const obj = Object.assign(data, {'message_state': MessageStateTypes.MESSAGE_NOT_DELETED});
    if (data.message_type == this.MessageTypeEnum.Media_Message || data.message_type == this.MessageTypeEnum.File_Message
      || data.message_type == this.MessageTypeEnum.Video_Message) {
      this.commonService.channelMedia[data.thread_muid] = {
        message: obj,
        date_time: obj.date_time,
        messageType: data.message_type,
        documentType: data.document_type || this.commonService.checkMimeType(data.message_type == this.MessageTypeEnum.Media_Message ?
          obj['image_url'] : obj['url'])
      };
      this.commonService.changeDetectEmit();
    }
    this.replyMessageArray.push(obj);
    this.makeInChatPhotoCarousel(obj);
    this.replyMessageDict[data.thread_muid] = this.replyMessageArray.length - 1;
    try {
      this.messages[this.messages_dictionary[data.muid]].thread_message = true;
      this.messages[this.messages_dictionary[data.muid]].last_reply = data.date_time;
      this.messages[this.messages_dictionary[data.muid]].thread_message_count
        ? this.messages[this.messages_dictionary[data.muid]].thread_message_count += 1
        : this.messages[this.messages_dictionary[data.muid]].thread_message_count = 1;
    } catch (e) {
      console.log(e);
    }
    this.cdRef.detectChanges();
    if (isScrollBottom) {
      this.scrollReplyMessagesToBottom();
    }
    isScrollBottom = true;
    if (this.commonService.userDetails.user_id == data.user_id) {
      this.replyCommentObject.is_following_thread = 1;
    }
  }

  private sendActionMessage(message) {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    let data = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      message_type: MessageType.Text_Message,
      channel_id: this.activeChannelId,
      message_status: MessageStatus.Sending
    };
    data = {...message, ...data};
    this.sendMessageThroughSocket(data);
  }

  onAttchmentClick(fileControl) {
    this.dropup_open = false;
    fileControl.click();
  }

  showDragOverlay(e) {
    if (e.dataTransfer.files) {
      e.stopPropagation();
      e.preventDefault();
      this.showReplyCard ? this.showThreadImageDropOverlay = true : this.showImageDropOverlay = true;
      this.cdRef.detectChanges();
    }
  }

  hideDragOverlay(event) {
    if (event.target.id.toString().includes('fugu-messenger-parent-div')) {
      this.showImageDropOverlay = false;
    }
    if (event.target.id.toString().includes('replyMessageCard')) {
      this.showThreadImageDropOverlay = false;
    }
    this.cdRef.detectChanges();
  }

  openPreviewPopup() {
    this.image_preview_open = false;
  }

  fileUpload(event, is_drop = false) {
    event.preventDefault();
    event.stopPropagation();
    let files;
    if (is_drop) {
      if (!event.dataTransfer.files.length) {
        this.showImageDropOverlay = false;
        this.showThreadImageDropOverlay = false;
      }
      files = event.dataTransfer.files;
    } else {
      files = event.target.files;
    }
    if (!files.length) {
      return;
    }
    this.imageContentData = this.showReplyCard ? {...this.contentEditableReplyData} : {...this.contentEditableData};
    this.image_preview_open = true;
    this.image_preview_files = files;
    this.cdRef.detectChanges();
  }

  clipboardPasteEvent(event) {
    if (event.clipboardData.files.length) {
      this.imageContentData = this.showReplyCard ? {...this.contentEditableReplyData} : {...this.contentEditableData};
      this.image_preview_open = true;
      this.image_preview_files = event.clipboardData.files;
      if (!this.showReplyCard) {
        this.chatInput.clearInput();
      } else {
        this.chatInputReply.clearInput();
      }
      this.cdRef.detectChanges();
    }
  }

  prepareFileForUpload(file_data) {
    const file = file_data.file;
    const message_data = {...file_data.data} || {};
    if (file.size > this.fugu_config.max_upload_file_size) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: `File size should be smaller than ${(this.fugu_config.max_upload_file_size / 1024 / 1024).toFixed(0)} mb.`,
        timeout: 2000
      });
      return;
    }
    const mime_type = file['type'] || 'file/file';
    const is_thread = message_data.is_thread;
    const mimeTypeParent = mime_type.split('/');
    const channel_object = {
      sent_channel_id: this.activeChannelId,
      sent_thread_muid: this.replyCommentObject ? this.replyCommentObject.muid : undefined
    };
    const obj = {
      src: file_data.src,
      mime_type: mime_type,
      is_thread: is_thread,
      message_data: message_data,
      channel_object: channel_object,
      file: file
    };
    if (mimeTypeParent[0] == 'image' && !['vnd.adobe.photoshop', 'psd', 'tiff', 'svg', 'svg+xml', 'gif'].includes(mimeTypeParent[1])) {
      obj['message_type'] = MessageType.Media_Message;
    } else if (mimeTypeParent[0] == 'video') {
      obj['message_type'] = MessageType.Video_Message;
      obj['thumbnail'] = file_data.thumbnail_src;
    } else {
      obj['message_type'] = MessageType.File_Message;
    }
    this.uploadFileToServer(obj);
  }

  editMessage(selectedMsgItem) {
    if (this.showReplyCard) {
      selectedMsgItem = Object.assign(selectedMsgItem, {muid: this.replyCommentObject.muid});
    }
    this.editMsgObj = {...selectedMsgItem};
  }

  saveEditedMessage(data) {
    if (data) {
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        channel_id: this.activeChannelId,
        message: data.message,
        formatted_message: this.commonService.convertMarkdownText(data.message, true),
        muid: data.muid,
        tagged_users: data.tagged_users,
        tagged_all: data.tagged_all,
        thread_muid: data.thread_muid
      };
      this.service.editMessage(obj).subscribe(res => {
        if (!data.is_thread) {
          const index = this.messages_dictionary[this.editMsgObj.muid];
          this.messages[index].message = data['message'];
          this.messages[index].message_state = MessageStateTypes.MESSAGE_EDITED;
        } else {
          const index = this.replyMessageDict[this.editMsgObj.thread_muid];
          this.replyMessageArray[index].message = data['message'];
          this.replyMessageArray[index].message_state = MessageStateTypes.MESSAGE_EDITED;
        }
        this.cancelEditedMode();
        this.detectChanges();
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
      }, error => {
        this.cancelEditedMode();
      });
    }
  }

  cancelEditedMode() {
    this.editMsgObj = null;
  }

  async uploadFileToServer(objFile) {
    if (objFile.file) {
      this.cdRef.detectChanges();
      const formData: FormData = new FormData();
      formData.append('file_type', objFile.mime_type);
      formData.append('file', objFile.file, objFile.file.name);
      // replace , in file name to _ to avoid multiple content disposition issue
      const name = objFile.file.name.replace(/\,/g, '_');
      const spaceFormData = this.commonService.currentOpenSpace;
      formData.append('file_name', name);
      formData.append('message_type', objFile.message_type);
      formData.append('app_secret_key', spaceFormData['fugu_secret_key']);
      const append_obj: any = await this.createSocketMediaMessageAndSend(objFile);
      if (!objFile.is_thread) {
        this.appendMessage(append_obj);
      } else {
        this.appendReplyMessage(append_obj);
      }
      this.scrollToBottom();
      append_obj.sent_channel_id = objFile.channel_object.sent_channel_id;
      this.uploadFile(append_obj, formData);
    }
  }

  cancelUpload(messageItem, e) {
    e.stopPropagation();
    messageItem.upload_fail = true;
    messageItem.is_uploading = false;
    messageItem.subscription_active = false;
  }

  uploadFile(append_obj, formData) {
    /*
     showing the progress loader when sending files, images and videos
     */
    append_obj.retry_obj = formData;
    append_obj.progress_percent = 0;
    append_obj.subscription_active = true;
    this.uploadSub = this.service.uploadFile(formData).pipe(takeWhile(() => append_obj.subscription_active)).subscribe(
      response => {
        switch (response.status) {
          case 'sent':
            append_obj.is_uploading = true;
            append_obj.upload_fail = false;
            break;
          case 'progress':
            append_obj.progress_percent = response.message;
            if (response.message == 100) {
              append_obj.is_uploading = false;
            }
            break;
          case 'response':
            /* if message is of video type, add thumbnail for the video */
            if (append_obj.message_type == MessageType.Video_Message) {
              append_obj.thumbnail_url = response.message.data.thumbnail_url;
            }
            append_obj.url = response.message.data.url;
            append_obj.server_obj = {};
            this.setServerUrls(append_obj.server_obj, response.message.data);
            const obj = {...append_obj};
            this.setServerUrls(obj, response.message.data);
            if (append_obj.sent_channel_id && this.activeChannelId != append_obj.sent_channel_id) {
              this.socketService.sendMessage(obj);
            } else {
              this.sendMediaMessage(obj);
            }
            append_obj.subscription_active = false;
            break;
        }
        this.cdRef.detectChanges();
      }, error => {
        append_obj.upload_fail = true;
        append_obj.is_uploading = false;
        this.cdRef.detectChanges();
      });
  }

  setServerUrls(obj, response) {
    obj['image_url'] = response.image_url;
    obj['thumbnail_url'] = response.thumbnail_url;
    obj['image_url_100x100'] = response.image_url_100x100;
    obj['url'] = response.url;
  }

  retrySendAttachment(appendObj, formData) {
    this.uploadFile(appendObj, formData);
  }

  onFileClick(event, element, message) {
    if (!message.upload_fail && !message.is_uploading) {
      element.href = this.commonService.changeS3Url(message.url);
      element.click();
    } else if (message.upload_fail) {
      this.retrySendAttachment(message, message.retry_obj);
    }
  }

  ngOnDestroy() {
    this.alive = false;
    this.sendTypingStoppedEvent();
    this.socketService.unsubscribeChannel(this.activeChannelId);
  }

  @HostListener('window:offline', [])
  onWindowOffline() {
    this.isOnline = false;
  }

  @HostListener('window:online', [])
  onWindowOnline() {
    this.isOnline = true;
  }

  reload() {
    window.location.reload();
  }

  joinGroup() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId
    };
    this.commonApiService.joinGroup(obj).subscribe(response => {
      this.joinGroupEvent.emit(true);
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Joined Successfully',
        timeout: 2000
      });
    });
  }

  copyEvent(e) {
    if (e.clipboardData) {
      const text = window.getSelection().toString();
      e.preventDefault();
      e.clipboardData.setData('Text', text);
    }
  }

  popoverClickOutside(event) {
    if (event && (event['value'] === true || this.checkClassContains(['profile-mask'],
      event.target.classList)) && !this.checkClassContains(['user-name', 'tagged-agent'], event.target.classList)) {
      this.showProfilePopover = false;
    }
  }

  emojiPickerClickOutside(event) {
    if (event && event.value == true && !this.checkClassContains(['emoji-trigger'], event.target.classList)) {
      this.showEmojiPicker = false;
    }
  }

  replyClickOutside(event, is_escape_key = false) {
    if (event && (this.checkClassContains(['reply-mask'], event.target.classList) || is_escape_key)) {
      this.closeReplyPopup();
    }
  }

  stickerPopoverClickOutside(event) {
    if (event && event['value'] == true && (!this.checkClassContains(['gif-btn'], event.target.classList))) {
      this.showStickerPopup = false;
      this.showStickerPopupThread = false;
    }
  }

  dropupClickOutside(event) {
    if (event && event['value'] == true) {
      this.dropup_open = false;
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

  closeReplyPopup() {
    this.cancelEditedMode();
    if (this.showReplyCard) {
      this.removeDragAndDropEvents(el_thread);
    }
    this.showReplyCard = false;
    this.replyMessageArray = [];
    this.show_more_text = false;
    this.view_more_bool = false;
    if (this.chatInput) {
      this.chatInput.focusContentEditable();
    }
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.showFloatingBtnLength = this.messages.length;
        this.messagesScrollContainer.nativeElement.scrollTop = this.messagesScrollContainer.nativeElement.scrollHeight;
        this.isScrollToBottomComplete = true;
        this.detectChanges();
      }, 0);
    } catch (err) {
    }
  }

  messagesScroll(e, el) {
    if (networkDataReceived && !this.is_search_conversation) {
      if (el.scrollTop < el.scrollHeight - el.offsetHeight - 30) {
        if (!this.showFloatingBtn) {
          this.showFloatingBtn = true;
          this.showFloatingBtnLength = this.messages.length;
          this.cdRef.detectChanges();
        }
      } else {
        if (this.showFloatingBtn) {
          this.showFloatingBtn = false;
          this.showFloatingBtnLength = this.messages.length;
          this.cdRef.detectChanges();
        }
      }
      if (el.scrollTop == 0) {
        if (!this.messageEnd && !this.fetchingOnScrollData && !this.is_search_conversation && this.commonService.getConversationPending) {
          this.pageIndex = this.pageIndex + this.pageSize;
          this.fetchingOnScrollData = true;
          if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
          }
          el.scrollTop = el.scrollTop + 1;

          this.getMessages(this.activeChannelId, this.pageIndex);
        }
      }
    }
  }

  calculateUnreadPosition() {
    let counter = 0;
    for (let i = this.messages.length - 1; i > 0; i--) {
      if (counter == this.unread_count) {
        /**
         * for placement of bar we increment the counter by as it starts from length - 1
         * @type {number}
         */
        this.unread_placement_count = i + 2;
        break;
      }
      if (this.messages[i].message_type != 5) {
        counter += 1;
      }
    }
  }

  onShowProfile() {
    this.showProfile = !this.showProfile;
    this.infoBtnClick.emit(this.showProfile);
  }

  openProfileNamePopover(event, user_id) {
    const el = document.getElementById('profile-popover-menu');
    el.style.top = null;
    el.style.bottom = null;
    el.style.left = null;
    this.mentionProfileId = user_id;
    this.showProfilePopover = true;
    el.style.right = window.innerWidth - event.pageX + 'px';
    if (window.innerHeight - event.pageY + 300 > window.innerHeight) {
      el.style.top = event.pageY - 40 + 'px';
    } else {
      el.style.bottom = window.innerHeight - event.pageY + 20 + 'px';
    }
  }

  openProfileMentionPopover(event, user_id) {
    const el = document.getElementById('profile-popover-menu');
    el.style.top = null;
    el.style.bottom = null;
    el.style.left = null;
    this.mentionProfileId = user_id;
    this.showProfilePopover = true;
    el.style.right = window.innerWidth - event.pageX + 'px';
    if (window.innerHeight - event.pageY + 300 > window.innerHeight) {
      el.style.top = event.pageY - 40 + 'px';
    } else {
      el.style.bottom = window.innerHeight - event.pageY + 20 + 'px';
    }
  }

  onGIFClick() {
    this.dropup_open = false;
    this.showStickerPopup = !this.showStickerPopup;
  }

  onGIFClickThread() {
    this.showStickerPopupThread = !this.showStickerPopupThread;
  }

  openEmojiPicker(e, type, msg) {
    this.emojiPickerType = type;
    const el = document.getElementById('emoji-picker');
    el.style.left = null;
    el.style.right = null;
    if (type == 1) { //main messages hover picker
      if (e.target.offsetLeft + 330 > this.messagesScrollContainer.nativeElement.scrollWidth) {
        el.style.left = e.target.offsetLeft - 210 + 'px';
      } else {
        el.style.left = e.target.offsetLeft + 'px';
      }
      if (e.clientY - 215 < 0) {
        el.style.top = e.clientY - 30 + 'px';
      } else {
        el.style.top = e.clientY - 225 + 'px';
      }
      this.tempMessageObject = msg;
    } else if (type == 3) { //reply messages picker
      if (e.pageX + 320 > window.innerWidth) {
        el.style.right = window.innerWidth - e.pageX + 'px';
      } else {
        // el.style.right = e.target.offsetLeft - 140 + 'px';
        el.style.right = window.innerWidth - e.pageX + 'px';
      }
      // el.style.top = e.target.offsetTop + e.target.offsetParent.offsetTop - 20 + 'px';
      if (e.clientY - 215 < 0) {
        el.style.top = e.clientY - 30 + 'px';
      } else {
        el.style.top = e.clientY - 225 + 'px';
      }
      this.tempMessageObject = msg;
    }
    this.showEmojiPicker = true;
  }

  emojiClickEvent(emojiObj) {
    const emojiHex = String.fromCodePoint(parseInt('0x' + emojiObj.unicode, 16));
    this.createReactionFayeMessage(this.tempMessageObject, emojiHex);
  }

  onReactionClick(msg, reaction, user_id, full_name) {
    if (msg) {
      let reaction_index, already_reacted = false, already_reacted_index, user_index;
      if (msg.user_reaction && msg.user_reaction.total_reaction) {
        for (let i = 0; i < msg.user_reaction.reaction.length; i++) {
          // if selected reaction already exists, then save the reaction object index in array
          if (reaction == msg.user_reaction.reaction[i].reaction) {
            reaction_index = i;
          }
          for (let k = 0; k < msg.user_reaction.reaction[i].users.length; k++) {
            // check if user had already reacted, save already reacted flag, already reacted on index
            // and user index in array of users
            if (user_id == msg.user_reaction.reaction[i].users[k]) {
              already_reacted = true;
              already_reacted_index = i;
              user_index = k;
            }
          }
        }
      }
      // case when user has already reacted
      if (already_reacted) {
        // when user selects his already reacted emoji
        if (!reaction) {
          this.removeReaction(msg,
            msg.user_reaction.reaction[already_reacted_index].users.length, already_reacted_index, user_index);
          // when user selects a different emoji than this already selected one and that emoji exists in list
        } else if (msg.user_reaction.reaction[already_reacted_index].reaction != reaction && (reaction_index || reaction_index == 0)) {
          this.removeReaction(msg,
            msg.user_reaction.reaction[already_reacted_index].users.length, already_reacted_index, user_index);
          // if index doesn't exist after removing
          reaction_index = this.calculateNewReactionIndex(msg, reaction);
          this.addReaction(msg, reaction_index, user_id, full_name);
          // if reaction already exists from same user and the reaction is also same,
          // sometimes happens because of socket 1 emoji in 1 second check
        } else if (msg.user_reaction.reaction[already_reacted_index].reaction == reaction && (reaction_index || reaction_index == 0)) {
          return false;
          // else delete his current and add new emoji
        } else {
          this.removeReaction(msg,
            msg.user_reaction.reaction[already_reacted_index].users.length, already_reacted_index, user_index);
          this.createReactionNewMessage(msg, reaction, user_id, full_name);
        }
        // if not already reacted but the emoji exists
      } else if (!already_reacted && (reaction_index || reaction_index == 0)) {
        this.addReaction(msg, reaction_index, user_id, full_name);
        // if nothing exists, a completely new message
      } else {
        if (!reaction) {
          return false;
        }
        this.createReactionNewMessage(msg, reaction, user_id, full_name);
      }
      this.bringCurrentEmojiAtFront(msg);
      this.cdRef.detectChanges();
    }
  }

  calculateNewReactionIndex(msg, reaction) {
    for (let i = 0; i < msg.user_reaction.reaction.length; i++) {
      // if selected reaction already exists, then save the reaction object index in array
      if (reaction == msg.user_reaction.reaction[i].reaction) {
        return i;
      }
    }
  }

  bringCurrentEmojiAtFront(msg) {
    for (let i = 0; i < msg.user_reaction.reaction.length; i++) {
      // if selected reaction already exists, then save the reaction object index in array
      for (let k = 0; k < msg.user_reaction.reaction[i].users.length; k++) {
        if (this.commonService.userDetails.user_id == msg.user_reaction.reaction[i].users[k]) {
          if (i > 2) {
            const temp = msg.user_reaction.reaction[i];
            const temp2 = msg.user_reaction.reaction[2];
            msg.user_reaction.reaction[2] = temp;
            msg.user_reaction.reaction[i] = temp2;
            break;
          }
        }
      }
    }
  }

  removeReaction(msg, users_length, index, user_index) {
    msg.user_reaction.total_reaction -= 1;
    if (users_length == 1) {
      msg.user_reaction.reaction.splice(index, 1);
    } else {
      msg.user_reaction.reaction[index].total_count -= 1;
      msg.user_reaction.reaction[index].users.splice(user_index, 1);
      msg.user_reaction.reaction[index].full_names.splice(user_index, 1);
      msg.user_reaction.reaction[index].users = msg.user_reaction.reaction[index].users.slice();
    }
  }

  addReaction(msg, index, user_id, full_name) {
    msg.user_reaction.total_reaction += 1;
    msg.user_reaction.reaction[index].total_count += 1;
    msg.user_reaction.reaction[index].users.push(user_id.toString());
    msg.user_reaction.reaction[index].full_names.push(full_name);
    msg.user_reaction.reaction[index].users = msg.user_reaction.reaction[index].users.slice();
  }

  createReactionNewMessage(msg, reaction, user_id, full_name) {
    if (!msg.user_reaction) {
      msg.user_reaction = {
        reaction: [],
        total_reaction: 0
      };
    }
    msg.user_reaction.total_reaction = msg.user_reaction.total_reaction + 1;
    const obj = {
      users: [user_id.toString()],
      full_names: [full_name],
      reaction: reaction,
      total_count: 1
    };
    msg.user_reaction.reaction.push(obj);
  }

  createReactionFayeMessage(msg, reaction) {
    let flag = false;
    if (msg.user_reaction && msg.user_reaction.total_reaction) {
      for (let i = 0; i < msg.user_reaction.reaction.length; i++) {
        // if selected reaction already exists, then save the reaction object index in array
        for (let k = 0; k < msg.user_reaction.reaction[i].users.length; k++) {
          // check if user had already reacted, save already reacted flag, already reacted on index
          // and user index in array of users
          if (this.commonService.userDetails.user_id == msg.user_reaction.reaction[i].users[k]) {
            if (reaction == msg.user_reaction.reaction[i].reaction) {
              flag = true;
            }
          }
        }
      }
    }
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    const data = {
      full_name: this.commonService.userDetails.full_name,
      date_time: now,
      email: this.userData.email,
      is_thread_reaction: !!msg.thread_muid,
      user_id: this.commonService.userDetails.user_id,
      muid: !!msg.thread_muid ? this.replyCommentObject.muid : msg.muid,
      thread_muid: msg.thread_muid,
      channel_id: this.activeChannelId,
      user_reaction_emoji: flag ? '' : reaction
    };
    this.socketService.sendReaction(data);
    this.showEmojiPicker = false;
  }

  getMessageReactions(msg) {
    this.allReactionsArray = msg.user_reaction.reaction;
    this.currentindex = null;
    this.selectedemoji = null;
    jQuery('#reactionsModal').modal('show');
    this.cdRef.detectChanges();
  }

  animateOnClickReaction(array, c_index) {
    array.map((item, index) => {
      if (index != c_index) {
        item.state = null;
      } else {
        item.state = !item.state;
      }
      return item;
    });
  }

  openReplyPopup(msg, is_push = false) {
    if (!this.showReplyCard || this.replyCommentObject.muid != msg.muid) {
      this.showReplyLoader = true;
      if (!is_push) {
        this.replyCommentObject = msg;
      }
      this.replyMessageArray = [];
      this.cancelEditedMode();
      this.contentEditableReplyData.muid = msg.muid;
      this.contentEditableReplyData.is_thread = true;
      this.contentEditableReplyData.input_id = CHAT_INPUT_REPLY_ID;
      const obj = {
        muid: msg.muid,
        en_user_id: this.commonService.userDetails.en_user_id,
        channel_id: this.activeChannelId
      };
      this.service.getThreadedMessages(obj).subscribe((res) => {
        if (this.replyCommentObject && !this.replyCommentObject.user_image) {
          this.replyCommentObject.user_image = res.data.message.user_image;
        }
        if (res.data.other_user_type) {
          this.contentEditableReplyData.user_type = res.data.other_user_type;
        }
        if (is_push) {
          this.replyCommentObject = res.data.message;
        }
        if (typeof res.data.user_following_status != 'undefined') {
          this.replyCommentObject.is_following_thread = res.data.user_following_status;
        } else {
          this.replyCommentObject.is_following_thread = this.commonService.userDetails.user_id ==
          res.data.message.user_id ? 1 : 0;
        }
        if (res.data.message) {
          this.makeInChatPhotoCarousel(res.data.message);
        }
        res.data.thread_message.map((item, index) => {
          item.delete_dots_enabled = false;
          this.makeInChatPhotoCarousel(item);
          this.replyMessageDict[item.thread_muid] = index;
        });

        this.replyMessageArray = res.data.thread_message;
        this.showReplyLoader = false;
        // update url incase of refresh to stop continue open thread
        // window.history.pushState({}, null, '/messages/' + this.activeChannelId);

        this.cdRef.detectChanges();
        setTimeout(() => {
          this.is_thread_scroll_enabled = true;
          this.cdRef.detectChanges();
        }, 1000);
        this.showReplyCard = true;
        this.clearThreadUrl();
        this.cdRef.detectChanges();
      });
      // this.showReplyCard = true;

      setTimeout(() => {
        if (is_push) {
          this.scrollReplyMessagesToBottom();
          if (this.messages_dictionary[msg.muid] || this.messages_dictionary[msg.muid] == 0) {
            // preserve following status
            const is_following_thread = this.replyCommentObject ? this.replyCommentObject.is_following_thread : 0;
            this.replyCommentObject = this.messages[this.messages_dictionary[msg.muid]];
            this.replyCommentObject.is_following_thread = is_following_thread;
          }
        }
        try {
          this.readMoreText.nativeElement.scrollHeight > 170 ? this.show_more_text = true : this.show_more_text = false;
        } catch (e) {
        }
        this.cdRef.detectChanges();
      }, 500);
    }
    if (this.showReplyCard) {
      this.clearThreadUrl();
    }
  }

  clearThreadUrl() {
    this.router.navigate([], {
      queryParams: {
        muid: null
      },
      queryParamsHandling: 'merge'
    });
  }

  dragAndDropImagesEvent(el) {
    this.addEventListeners(el, ['dragenter'], this.showDragOverlay.bind(this));
    this.addEventListeners(el, ['dragleave'], this.hideDragOverlay.bind(this));
    this.addEventListeners(el, ['dragover'], this.preventDefaults.bind(this));
    this.addEventListeners(el, ['drop', 'dragdrop'], this.dragAndDropImages.bind(this));
  }

  removeDragAndDropEvents(el) {
    this.removeEventListeners(el, ['dragenter'], this.showDragOverlay.bind(this));
    this.removeEventListeners(el, ['dragleave'], this.hideDragOverlay.bind(this));
    this.removeEventListeners(el, ['dragover'], this.preventDefaults.bind(this));
    this.removeEventListeners(el, ['drop', 'dragdrop'], this.dragAndDropImages.bind(this));
  }

  dragAndDropImages(e?) {
    e.preventDefault();
    e.stopPropagation();
    this.showReplyCard ? this.showThreadImageDropOverlay = false : this.showImageDropOverlay = false;
    this.cdRef.detectChanges();
    this.fileUpload(e, true);
  }

  scrollReplyMessagesToBottom() {
    setTimeout(() => {
      try {
        this.replyModalContainer.nativeElement.scrollTop = this.replyModalContainer.nativeElement.scrollHeight;
      } catch (e) {
      }
    }, 100);
  }

  // REACTION MODAL NAVBAR

  scrollReactionHeader(label: string) {
    const t = document.getElementById('reactionCalScroll')
      , e = document.getElementById('reactionScrollspy')
      , o = document.getElementById('reactionTab');
    let n = t.scrollLeft ? t.scrollLeft : -1;
    if (label === 'right') {
      n = t.scrollLeft + 300;
      jQuery('.wrapper').animate({
        scrollLeft: n
      }, 300);
    } else if (label === 'left') {
      jQuery('.wrapper').animate({
        scrollLeft: n
      }, 300);
    }
    if (o.offsetWidth < e.offsetWidth) {
      this.hideLeft = true;
      this.hideRight = true;
    } else if (n < 0) {
      this.hideLeft = true;
    } else {
      this.hideLeft = false;
    }
    this.hideRight = (n + e.offsetWidth >= o.offsetWidth);
  }

  selectCategory(indexValue) {
    this.current_catalog_index = indexValue;
    const child = jQuery('#myTab').children();
    const elmnt = document.getElementById('reactionCalScroll');
    const offset = document.getElementById('reactionScrollspy');
    const fullwidth = document.getElementById('reactionTab');
    let scrollLeftVal = 0;
    const totalWrapper = 0;
    for (let li = 0; li < indexValue; li++) {
      scrollLeftVal += (jQuery(child[li]).width() + 26);
    }
    scrollLeftVal = scrollLeftVal - 50;
    jQuery('.wrapper').animate({ // for sliding the categories
      scrollLeft: scrollLeftVal
    }, 300);

    if (fullwidth.offsetWidth < offset.offsetWidth) {
      this.hideRight = true;
      this.hideLeft = true;
    } else {
      scrollLeftVal <= 0 ? this.hideLeft = true : this.hideLeft = false;
      scrollLeftVal + offset.offsetWidth >= fullwidth.offsetWidth ? this.hideRight = true : this.hideRight = false;
    }
  }

  openMessageMenu(e, type) {
    this.checkMessageDuration(this.temp_message_menu_object);
    const el = document.getElementById('message-menu');
    el.style.top = 'unset';
    el.style.bottom = 'unset';
    const sidebarEl = document.getElementById('app-sidebar');
    if (type == 0) {
      el.style.left = e.target.offsetLeft + sidebarEl.offsetWidth + 10 + 'px';
    } else {
      el.style.left = e.clientX - 30 + 'px';
    }
    if (e.pageY + 200 > window.innerHeight) {
      el.style.bottom = (window.innerHeight - e.pageY) + 10 + 'px';
    } else {
      el.style.top = e.pageY + 15 + 'px';
    }
  }

  deleteMessage(data) {
    const obj = {
      'en_user_id': this.commonService.userDetails.en_user_id,
      'channel_id': this.activeChannelId,
      'muid': data.thread_muid ? undefined : data.muid,
      'thread_muid': data.thread_muid
    };
    this.service.deleteMessage(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      jQuery('#deleteMessageModal').modal('hide');
    });
  }

  checkMessageDuration(obj, return_bool = false) {
    const message_duration = moment.duration(moment().diff(moment(obj.date_time)));
    if (message_duration.asSeconds() > this.spaceData.config.delete_message_duration &&
      this.spaceData.config.delete_message_duration != 0) {
      this.message_delete_time_expired = true;
    } else {
      this.message_delete_time_expired = false;
    }
    if (message_duration.asSeconds() > this.spaceData.config.edit_message_duration &&
      this.spaceData.config.edit_message_duration != 0) {
      this.message_edit_time_expired = true;
    } else {
      this.message_edit_time_expired = false;
    }
    if (return_bool) {
      return this.message_delete_time_expired;
    }
  }

  openForwardPopup() {
    this.forward_popup_open = true;
    setTimeout(() => {
      jQuery('#forwardPopup').modal('show');
    });
  }

  openEmailPopup() {
    for (let i = 0; i < this.membersInfo.length; i++) {
      if (this.membersInfo[i].email && (!this.membersInfo[i].email.includes('@fuguchat.com') || !this.membersInfo[i].email.includes('@junglework.auth')) &&
        this.membersInfo[i].user_id != this.commonService.userDetails.user_id) {
        this.email_array.push(this.membersInfo[i]);
      }
    }
    if (this.chat_type == 2) {
      const one_to_one_email_array = [];
      one_to_one_email_array.push(this.email_array[0].user_id);
      this.sendMessageEmail(one_to_one_email_array);
    } else {
      if (this.email_array.length) {
        this.email_popup_open = true;
        setTimeout(() => {
          jQuery('#emailPopup').modal('show');
        });
      } else {
        this.send_email_enabled = false;
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'Email not present',
          timeout: 2000
        });
      }
    }
  }

  sendMessageEmail(array_selected) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      user_ids: array_selected,
      channel_id: this.activeChannelId,
      custom_label: this.label_header,
      workspace_domain_name: this.spaceData.workspace
    };
    if (!this.showReplyCard) {
      obj['muid'] = this.temp_message_menu_object.muid;
    } else {
      obj['thread_muid'] = this.temp_message_menu_object.thread_muid;
    }
    this.emailService.sendEmail(obj).subscribe((res) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
      this.email_popup_open = false;
      this.closeEmailPopup();
    });
  }

  async sendGif(event) {
    const channel_object = {
      sent_channel_id: this.activeChannelId,
      sent_thread_muid: this.replyCommentObject ? this.replyCommentObject.muid : undefined
    };
    const append_obj = await this.createSocketMediaMessageAndSend(Object.assign(event, {channel_object: channel_object}));
    if (!event.is_thread) {
      this.appendMessage(append_obj, true);
    } else {
      this.appendReplyMessage(append_obj);
    }
    this.sendMediaMessage(append_obj);
  }

  async createSocketMediaMessageAndSend(obj) {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    let mimeTypeParent = [];
    if (obj.file) {
      mimeTypeParent = obj.file.type.split('/');
    }
    let d = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      channel_id: obj.channel_object.sent_channel_id || this.activeChannelId,
      is_thread_message: obj.is_thread,
      email: this.userData.email,
      muid: !obj.is_thread ? this.commonService.generateRandomString()
        : obj.channel_object.sent_thread_muid || this.replyCommentObject.muid,
      thread_muid: obj.is_thread ? this.commonService.generateRandomString()
        : undefined,
      is_thread: obj.is_thread,
      user_type: UserType.USER,
      message_status: MessageStatus.Sending
    };
    d = Object.assign(d, obj.message_data);
    if (obj.message_type === MessageType.Media_Message) {
      d['image_url'] = obj.src || obj.image_url;
      d['message_type'] = MessageType.Media_Message;
      d['thumbnail_url'] = obj.src || obj.thumbnail_url;
      if (obj.file && obj.file.size) {
        d['file_size'] = this.calculateFileSize(obj.file.size);
      }
      if (obj.file) {
        d = Object.assign(d, await this.getImageHeightWidth(obj.file));
      } else {
        // For GIFs
        d['image_width'] = obj.width;
        d['image_height'] = obj.height;
        this.cdRef.detectChanges();
      }
    } else {
      // ternary for corner cases like svg files,etc mentioned in array above
      d['message_type'] = obj.message_type == MessageType.Video_Message ? MessageType.Video_Message : MessageType.File_Message;
      d['url'] = obj.src;
      d['file_name'] = obj.file.name;
      d['document_type'] = this.checkFileType(mimeTypeParent);
      d['thumbnail_url'] = obj.thumbnail;
      d['file_size'] = this.calculateFileSize(obj.file.size);
    }
    this.showStickerPopup = false;
    this.showStickerPopupThread = false;
    return d;
  }

  sendMediaMessage(fayeMessage) {
    /**
     * because file uploads in background, we check if the same thread is open when appending else
     * we just increment the count by checking the dict for muid.
     */
    if (fayeMessage.is_thread_message && !(this.replyCommentObject &&
      fayeMessage.muid == this.replyCommentObject.muid) && this.messages_dictionary[fayeMessage.muid]
      && this.messages[this.messages_dictionary[fayeMessage.muid]]) {
      this.messages[this.messages_dictionary[fayeMessage.muid]].thread_message_count
        ? this.messages[this.messages_dictionary[fayeMessage.muid]].thread_message_count += 1
        : this.messages[this.messages_dictionary[fayeMessage.muid]].thread_message_count = 1;
      this.cdRef.detectChanges();
    }
    this.sendMessageThroughSocket(fayeMessage);
    this.unread_count = 0;
  }

  /**
   * function to mute or unmute thread
   * @param item -> message object
   * @param status
   */
  muteThread(item, status) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.activeChannelId,
      following_status: status,
      muid: item.muid
    };
    this.service.muteThread(obj).subscribe((res) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
      this.replyCommentObject.is_following_thread = status;
      this.replyCommentObject.thread_menu_open = false;
      this.cdRef.detectChanges();
    });
  }

  closeEmailPopup() {
    jQuery('#emailPopup').modal('hide');
    this.email_popup_open = false;
    this.email_array = [];
  }

  trackById(index, item) {
    return item ? item.key : undefined;
  }

  trackByMuid(index, item) {
    return item ? item.muid : undefined;
  }

  calculateFileSize(size) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return !size && '0 Bytes' || (size / Math.pow(1024, i)).toFixed(2) + ' ' +
      ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][i];
  }

  setFrequentlyContactedUsers() {
    let obj = <any>this.sessionService.get('frequently-contacted');
    if (obj) {
      obj[this.other_user_id] ? obj[this.other_user_id] = Number(obj[this.other_user_id]) + 1 : obj[this.other_user_id] = 1;
    } else {
      obj = {};
      obj[this.other_user_id] = 1;
    }
    this.sessionService.set('frequently-contacted', obj);
    this.frequent_contacted_flag = true;
  }

  setFrequentlyContactedUsersDetail() {
    if (this.other_user_type != 1) {
      return;
    }
    const obj = {};
    // if (this.localStorageService.get('frequently-contacted-v2')[this.commonService.currentOpenSpace.workspace]) {
    //   obj = <any>this.localStorageService.get('frequently-contacted-v2')[this.commonService.currentOpenSpace.workspace];
    // }
    let priority = 1;
    if (obj && obj[this.other_user_id]) {
      priority = Number(obj[this.other_user_id].priority) + 1;
    }
    const freq_dict = {};
    let temp = {};
    obj[this.other_user_id] = {
      full_name: this.other_user_name,
      user_image: this.other_user_photo,
      priority: priority,
      user_id: this.other_user_id
    };
    temp = obj;
    let old = {};
    if (localStorage.getItem('frequently-contacted-v2')) {
      old = this.localStorageService.get('frequently-contacted-v2')[this.commonService.currentOpenSpace.workspace];
    }
    freq_dict[this.commonService.currentOpenSpace.workspace] = {...old, ...temp};
    let old_freq = {};
    old_freq = this.localStorageService.get('frequently-contacted-v2');
    const freq_temp = {...freq_dict, ...old_freq};
    this.localStorageService.set('frequently-contacted-v2', freq_temp);
    this.frequent_contacted_flag = true;
  }

  /**
   * called when image preview component emits file with captions
   * @param files_array
   */
  onMediaMessageDataReceived(files_array) {
    for (let i = 0; i < files_array.length; i++) {
      this.prepareFileForUpload(files_array[i]);
    }
  }

  starredMessages(messageItem) {
    if (!messageItem.thread_muid) {
      if (this.starred_messages_ids.includes(messageItem.muid)) {
        messageItem.is_starred = true;
      } else {
        messageItem.is_starred = false;
      }
    }
    messageItem.is_starred = !messageItem.is_starred;
    if (!messageItem.thread_muid) {
      if (this.starred_messages_ids.includes(messageItem.muid)) {
        this.starred_messages_ids = this.starred_messages_ids.filter((item) => {
          return item != messageItem.muid;
        });
      } else {
        this.starred_messages_ids.push(messageItem.muid);
      }
    }
    if (messageItem.server_obj) {
      this.setServerUrls(messageItem, messageItem.server_obj);
    }
    const element = document.getElementById(messageItem.thread_muid || messageItem.muid).getElementsByClassName('star-fa-icon');
    for (let i = 0; i < element.length; i++) {
      if (!messageItem.thread_muid ? this.starred_messages_ids.includes(messageItem.muid) : messageItem.is_starred) {
        element[i].className = 'fa-star-on';
      } else {
        element[i].className = 'fa-star-off';
      }
    }
    const el = document.getElementById(messageItem.thread_muid || messageItem.muid).getElementsByClassName('shiner');
    for (let i = 0; i < el.length; i++) {
      el[i].classList.add('shiner-after');
    }
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      muid: !messageItem.thread_muid ? messageItem.muid || this.replyCommentObject.muid : undefined,
      thread_muid: messageItem.thread_muid,
      channel_id: this.activeChannelId
    };

    if (!messageItem.thread_muid ? true : false) {
      obj['is_starred'] = this.starred_messages_ids.includes(messageItem.muid) ? 1 : 0;
    } else {
      obj['is_starred'] = messageItem.is_starred ? 1 : 0;
    }
    const message_obj = {
      label: this.label_header,
      channel_id: this.activeChannelId,
      user_name: messageItem.full_name,
      message_index: this.messages_dictionary[messageItem.muid],
      is_starred: messageItem.is_starred,
      muid: messageItem.muid || this.replyCommentObject.muid,
      thread_muid: messageItem.thread_muid,
      chat_type: this.chat_type
    };
    this.service.starredMessages(obj).subscribe((res) => {
      this.combined_object = {...Object.assign(messageItem, message_obj)};
      if (this.starred_messages_open) {
        this.starClick.emit(this.combined_object);
        this.combined_object = undefined;
        this.cdRef.detectChanges();
      }
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
    });
  }

  unstarringAllMessages(data) {
    this.combined_object = undefined;
    if (this.starred_messages_ids) {
      if (data == 'all') {
        this.starred_messages_ids = [];
      } else {
        this.starred_messages_ids = this.starred_messages_ids.filter((item) => {
          return item != data;
        });
      }
    }
  }

  /**
   * fired on receiving a video call
   * @param data
   */
  onVideoCallReceived(data) {
    if (data.full_name) {
      this.video_call_obj.incoming_call_popup = true;
    }
    this.video_call_obj.channel_id = data.channel_id;
    this.cdRef.detectChanges();
  }

  /**
   * object creating video call object and send it to server.
   * @param channel_id
   * @param data
   */
  createVideoCallMessage(channel_id, data) {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    const obj = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      channel_id: channel_id,
      message_type: MessageType.Video_Call,
      user_type: UserType.USER,
      is_silent: oldCalling ? data.video_call_type != 'START_CALL' : data.video_call_type != 'START_CALL_CONFERENCE'
    };
    this.socketService.sendMessage(Object.assign(obj, data)).then((res) => {
      },
      (error) => {
        if (error.statusCode == SocketErrorCodes.Turn_Credential_Fail) {
          const loginData = this.sessionService.get('loginData/v1');
          loginData['turn_credentials'] = error.data;
          this.sessionService.set('loginData/v1', loginData);
        }
      });

  }

  onConferenceCallEvent(data) {
    if (data.notification_type == NotificationType.Google_Meet) {
      this.isGoogleMeetCall = true;
    } else {
      this.isGoogleMeetCall = false;
    }
    this.call_type_popup = 'CONFERENCE';
    this.conference_caller_info = {
      caller_text: data.caller_text,
      invite_link: data.invite_link,
      user_thumbnail_image: data.channel_thumbnail_url,
      is_audio_conference: data.is_audio_conference
    };
    if (data.sender_user_id != this.commonService.userDetails.user_id) {
      this.video_call_obj.incoming_call_popup = true;
    }
    setTimeout(() => {
      this.video_call_obj.incoming_call_popup = false;
      this.call_type_popup = null;
      this.cdRef.detectChanges();
    }, 30000);
    this.cdRef.detectChanges();
  }

  p2pCallActionEvent(data: boolean) {
    data ? this.acceptVideoCall() : this.rejectVideoCall();
  }

  conferenceCallActionButton(data: any) {
    if (data == 'accept') {
      this.createConferenceCallMessage(this.caller_info.channel_id, {
        video_call_type: VideoCallType.ANSWER_MULTI_CALL,
        message_type: MessageType.conference_call
      });
    } else {
      this.createConferenceCallMessage(this.caller_info.channel_id, {
        video_call_type: VideoCallType.REJECT_MULTI_CALL,
        message_type: MessageType.conference_call
      });
    }
    this.video_call_obj.incoming_call_popup = false;
    this.call_type_popup = null;
  }

  meetActionButton(data: any) {
    if (data == 'accept') {
      this.createMeetCallMessage(this.caller_info.channel_id, {
        video_call_type: VideoCallType.ANSWER_MULTI_CALL,
        message_type: MessageType.conference_call
      });
    } else {
      this.createMeetCallMessage(this.caller_info.channel_id, {
        video_call_type: VideoCallType.REJECT_MULTI_CALL,
        message_type: MessageType.conference_call
      });
    }
    this.video_call_obj.incoming_call_popup = false;
    this.call_type_popup = null;
  }

  createConferenceCallMessage(channel_id, data) {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    const obj = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      channel_id: channel_id,
      user_unique_key: this.commonService.userDetails.user_unique_key,
      message_type: MessageType.Video_Call,
      user_type: UserType.USER,
      is_silent: oldCalling ? data.video_call_type != 'START_CALL' : data.video_call_type != 'START_CALL_CONFERENCE'
    };
    this.socketService.sendVideoInformation(Object.assign(obj, data)).then((res) => {
      },
      (error) => {
        if (error.statusCode == SocketErrorCodes.Turn_Credential_Fail) {
          const loginData = this.sessionService.get('loginData/v1');
          loginData['turn_credentials'] = error.data;
          this.sessionService.set('loginData/v1', loginData);
        }
      });
  }

  createMeetCallMessage(channel_id, data) {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    const obj = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      channel_id: channel_id,
      user_unique_key: this.commonService.userDetails.user_unique_key,
      message_type: MessageType.Video_Call,
      user_type: UserType.USER,
      is_silent: oldCalling ? data.video_call_type != 'START_CALL' : data.video_call_type != 'START_CALL_CONFERENCE'
    };
    this.socketService.sendMeetInformation(Object.assign(obj, data)).then(
      (res) => {
      },
      (error) => {
        if (error.statusCode == SocketErrorCodes.Turn_Credential_Fail) {
          const loginData = this.sessionService.get('loginData/v1');
          loginData['turn_credentials'] = error.data;
          this.sessionService.set('loginData/v1', loginData);
        }
      }
    );
  }

  acceptVideoCall() {
    this.video_call_obj.incoming_call_popup = false;
    this.video_call_obj.is_video_caller = false;
    this.video_call_obj.is_video_open = true;
    // tslint:disable-next-line:max-line-length
    const url = window.location.hostname;
    let route = '/conference';
    if (oldCalling) {
      route = '/calling';
    }
    if (url == 'localhost') {
      const newWindow = window.open(this.spaceData.workspace + route, 'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
      newWindow['video_call_obj'] = this.video_call_obj;
    } else {
      if (this.commonService.isWhitelabelled) {
        const newWindow = window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${this.spaceData.workspace}${route}`,
          '_blank',
          'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
        newWindow['video_call_obj'] = this.video_call_obj;
      } else {
        const newWindow = window.open('https://' + environment.REDIRECT_PATH + '/' + this.spaceData.workspace + route, '_blank', 'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
        newWindow['video_call_obj'] = this.video_call_obj;
      }

    }
    this.cdRef.detectChanges();
  }

  rejectVideoCall() {
    this.createVideoCallMessage(this.caller_info.channel_id, {
      video_call_type: oldCalling ? VideoCallType.CALL_REJECTED : VideoCallType.REJECT_CONFERENCE,
      muid: this.video_call_obj.video_offer_data['muid'],
      invite_link: this.caller_info.invite_link
    });
    this.video_call_obj.incoming_call_popup = false;
    this.caller_info = <VideoCallMessage>{};
    this.cdRef.detectChanges();
  }

  onWindowReceiveData() {
    window.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'video-call':
          this.video_call_obj.is_video_open = e.data.data.is_video_open;
          this.caller_info = <VideoCallMessage>{};
          break;
        case 'old-version':
          oldCalling = false;
          const url = window.location.hostname;
          if (url == 'localhost') {
            const newWindow = window.open(this.spaceData.workspace + '/calling', '_blank', 'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
            newWindow['video_call_obj'] = this.video_call_obj;
          } else {
            if (this.commonService.isWhitelabelled) {
              const newWindow = window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${this.spaceData.workspace}/calling`,
                '_blank',
                'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
              newWindow['video_call_obj'] = this.video_call_obj;
            } else {
              const newWindow = window.open('https://' + environment.REDIRECT_PATH + '/' + this.spaceData.workspace + '/calling', '_blank', 'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
              newWindow['video_call_obj'] = this.video_call_obj;
            }

          }
      }
    });
  }

  closeVideoCallComponent() {
    this.video_call_obj.is_video_open = false;
    this.caller_info = <VideoCallMessage>{};
    this.cdRef.detectChanges();
  }

  openPollPopup() {
    this.dropup_open = false;
    this.poll_popup_open = true;
  }

  createPollMessageAndSend(data) {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    const obj = {
      message: 'Created a poll.',
      is_expired: false,
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      email: this.userData.email,
      muid: this.commonService.generateRandomString(),
      message_type: MessageType.Poll,
      channel_id: this.activeChannelId,
      message_status: MessageStatus.Sending
    };
    data = Object.assign(data, obj);
    this.appendMessage(data, true);
    this.sendMessageThroughSocket(data);
  }

  onPollVote(msg, poll_option) {
    const obj = {
      puid: poll_option.puid,
      message_poll: true,
      is_voted: !(poll_option.users_map && poll_option.users_map[this.commonService.userDetails.user_id]),
      muid: msg.muid
    };
    if (moment().diff(msg.expire_at) > 0) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Poll expired.',
        timeout: 2000
      });
      msg.is_expired = true;
      this.cdRef.detectChanges();
      this.onVotePollSocketMessage(obj);
      return;
    }
    this.onVotePollSocketMessage(obj);
  }

  addOrRemoveVote(msg, poll_option, user_obj) {
    if (!poll_option.users_map) {
      poll_option.users_map = {};
    }
    if (!msg.multiple_select) {
      for (let i = 0; i < msg.poll_options.length; i++) {
        if (msg.poll_options[i].users_map[user_obj.user_id]) {
          delete msg.poll_options[i].users_map[user_obj.user_id];
          msg.poll_options[i].poll_count -= 1;
          msg.total_votes -= 1;
          for (let j = 0; j < msg.poll_options[i].users.length; j++) {
            if (msg.poll_options[i].users[j].user_id == user_obj.user_id) {
              msg.poll_options[i].users.splice(j, 1);
              break;
            }
          }
          break;
        }
      }
    }
    if (poll_option.users_map[user_obj.user_id]) {
      poll_option.poll_count -= 1;
      msg.total_votes -= 1;
      delete poll_option.users_map[user_obj.user_id];
      for (let j = 0; j < poll_option.users.length; j++) {
        if (poll_option.users[j].user_id == user_obj.user_id) {
          poll_option.users.splice(j, 1);
          break;
        }
      }
    } else {
      const obj = {
        user_id: user_obj.user_id,
        full_name: user_obj.full_name,
        user_image: user_obj.user_image
      };
      poll_option.users_map[user_obj.user_id] = obj;
      if (!poll_option.users) {
        poll_option.users = [];
      }
      poll_option.users.push(obj);
      msg.total_votes += 1;
      poll_option.poll_count += 1;
    }
    this.cdRef.detectChanges();
  }



  onVotePollSocketMessage(data) {
    const obj = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      email: this.userData.email,
      channel_id: this.activeChannelId,
      message_type: MessageType.Poll
    };
    data = Object.assign(data, obj);
    this.socketService.voteOnPoll(data);
  }

  closePollView() {
    this.poll_view_open = false;
    this.messages[this.messages_dictionary[this.temp_poll_view_data.muid]].poll_options =
      this.messages[this.messages_dictionary[this.temp_poll_view_data.muid]].poll_options.slice();
  }

  shouldOpenVideoPopup() {
    if (this.commonService.isSafari) {
      this.openInfoSafariPopup = true;
    } else {
      this.openVideoAudioCallPopup(RTCCallType.VIDEO);
    }
  }

  openVideoAudioCallPopup(callType) {
    if (this.video_call_obj.is_video_open) {
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Call is already in progress.',
        timeout: 3000
      });
      return;
    }
    this.video_call_obj.call_type = callType;
    this.video_call_obj.user_name = this.otherUserData.user_name;
    this.video_call_obj.user_id = this.otherUserData.user_id;
    this.video_call_obj.channel_image = this.otherUserData.channel_image;
    this.video_call_obj.channel_id = this.activeChannelId;
    this.video_call_obj.is_video_caller = true;
    // this.video_call_obj.is_video_open = true;
    let route = '/conference';
    if (oldCalling) {
      route = '/calling';
    }
    if (window.location.hostname == 'localhost') {
      const newWindow = window.open(this.spaceData.workspace + route, 'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
      newWindow['video_call_obj'] = this.video_call_obj;
    } else {
      if (this.commonService.isWhitelabelled) {
        const newWindow = window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${this.spaceData.workspace}${route}`,
          '_blank',
          'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
        newWindow['video_call_obj'] = this.video_call_obj;
      } else {
        const newWindow = window.open('https://' + environment.REDIRECT_PATH + '/' + this.spaceData.workspace + route,
          '_blank',
          'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
        newWindow['video_call_obj'] = this.video_call_obj;
      }

    }

  }

  openGoogleMeetPopup(callType) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      is_scheduled: 0,
      timezone: this.getTimezone(),
      summary: 'calling meet',
      description: 'calling meet desc',
      user_id: this.other_user_id
      // attendees: [this.other_user_id],
    };
    obj['domain'] = environment.LOCAL_DOMAIN;
    this.commonApiService.addEvent(obj).subscribe((res) => {
      //  if (res.data.link) {
      //    window.open(res.data.link);
      //  }
    });
  }

  getTimezone() {
    const date = new Date();
    let t = date.getTimezoneOffset();
    if (t < 0) {
      t = Math.abs(t);
    } else if (t > 0) {
      t = -Math.abs(t);
    } else if (t == 0) {
      t = 0;
    }
    return t.toString();
  }

  openLiveStreamWindow(StreamType) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      workspace_id: this.spaceData.workspace_id,
      channel_id: this.activeChannelId,
      stream_type: StreamType,
      stream_id: this.livestreamId ? this.livestreamId : undefined
    };

    if (this.commonService.isWhitelabelled) {
      obj['domain'] = this.commonApiService.whitelabelConfigurations['domain'];
    } else {
      obj['domain'] = environment.LOCAL_DOMAIN;
    }

    this.commonApiService.joinLiveStream(obj).subscribe((res) => {
      if (res.data.link) {
        window.open(res.data.link);
      }
    });

  }

  detectChanges() {
    this.cdRef.detectChanges();
  }

  /**
   * when user clicks go to channel in search conversation.
   */
  goToChannelFromSearch() {
    // this.searchMessageData = null;
    // this.is_search_conversation = false;
    // this.messages_map = new Map();
    // this.getMessages(this.activeChannelId, 1);
    this.onParamsChange({
      channelId: this.activeChannelId
    });
  }

  /**
   * append message in message on posting, item is message object
   * @param item
   */
  appendMessageInMap(item) {
    let array = this.messages_map.get(moment(item.date_time).format('YYYY-MM-DD'));
    if (array) {
      array.push(item);
    } else {
      array = [];
      array.push(item);
    }
    this.messages_map.set(moment(item.date_time).format('YYYY-MM-DD'), array);
  }

  sendButtonMessageComment(originalMessage, action, button?) {
    // const el = document.getElementById(`button-message-comment`);
    const el = document.getElementById(`button-message-comment-${originalMessage.user_type == UserType.ScrumBot ?
      action.question_id : action.leave_id}`);
    if (!el) {
      return false;
    }
    let newMessage = el.innerHTML.trim();
    newMessage = newMessage.replace(/^(<br>\s*)+|(\s*<br>)+$/g, '');
    newMessage = newMessage.replace(/^(&nbsp;\s*)+|(\s*&nbsp;)+$/g, '');
    /**
     * check if message is empty
     */
    if (!newMessage || !newMessage.replace(/(<br>\s*)+|(\s*<br>)+$/g, '').replace(/(&nbsp;\s*)+|(\s*&nbsp;)+$/g, '').length) {
      if (button && action.default_text_field && action.default_text_field.is_required && action.default_text_field.id == button.id) {
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'Please enter comment',
          timeout: 2000
        });
        return true;
      } else {
        return false;
      }
    }
    let showSendInvite = false;
    action.buttons.map((btn) => {
      if (['SEND_INVITE_MESSAGE'].includes(btn.action)) {
        showSendInvite = true;
      }

    });
    if ((button && button.action == 'SEND_INVITE_MESSAGE') || showSendInvite) {
      if (!(newMessage.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$|^\d{10}/))) {
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'Please enter valid email address or phone number',
          timeout: 2000
        });
        return true;
      }
    } else {
      if (action.default_text_field && (!button || action.default_text_field.id == button.id)) {
        if (action.default_text_field.minimum_length && newMessage.length < action.default_text_field.minimum_length) {
          this.messageService.sendAlert({
            type: 'danger',
            msg: `Comment must be of alteast ${action.default_text_field.minimum_length} characters`,
            timeout: 2000
          });
          return true;
        } else if (!action.default_text_field.minimum_length && action.default_text_field.is_required) {
          this.messageService.sendAlert({
            type: 'danger',
            msg: 'Please enter comment',
            timeout: 2000
          });
          return true;
        }
      }
    }
    const data = {
      message: originalMessage.message,
      muid: originalMessage.muid,
      // comment: newMessage,
      button_data: {
        tagged_user_id: action.tagged_user_id,
        leave_id: action.leave_id,
        confirmation_type: action.confirmation_type,
        title: action.title
      }
    };


    if (action.confirmation_type == 'LEAVE_TYPE_SELECT') {
      data['time_zone'] = this.commonService.getTimeZone();
    }

    let propertyToSet;
    if (action.default_text_field) {
      data['button_action'] = action.default_text_field.action;
      propertyToSet = action.default_text_field.output;
    } else {
      data['button_action'] = action.textboxButton.action;
      propertyToSet = action.textboxButton.output;
      action.showCommentBox = false;
    }
    if (!action[propertyToSet]) {
      action[propertyToSet] = newMessage;
    } else {
      action[propertyToSet] = `${action[propertyToSet]}\n${newMessage}`;
    }
    // data.button_data[propertyToSet] = newMessage;
    if (showSendInvite) {
      if (action.comment.includes('@') || isNaN(action.comment)) {
        data.button_data['email'] = action.comment;
      } else {
        data.button_data['contact_number'] = '+91-' + action.comment;
        data.button_data['country_code'] = 'IN';
      }
    } else {
      if (action.remark) {
        data.button_data['remark'] = action.remark;
      }
      if (action.comment) {
        data.button_data['comment'] = action.comment;
      }
    }
    if (!button) {
      this.sendActionMessage(data);
      action.is_action_taken = true;
    }
    this.detectChanges();
    return false;
  }

  onButtonMessageClick(button, action, message) {
    this.unread_count = 0;
    switch (button.action_type) {
      case ButtonMessageActionTypes.ACTION_PUBLISH:
        // if (action.default_text_field && action.default_text_field.id == button.id) {
        //   if (action.default_text_field.is_required && !action.comment) {
        //     let msg;
        //     if (action.default_text_field.minimum_length) {
        //       msg = `Please enter comment of atleast ${action.default_text_field.minimum_length} characters.`;
        //     } else {
        //       msg = 'Please enter comment';
        //     }
        //     this.messageService.sendAlert({
        //       type: 'danger',
        //       msg: msg,
        //       timeout: 2000
        //     });
        //     return;
        //   }
        // } else if (button.style == 'danger') {
        //   // maybe popup confirmation
        // }
        switch (button.action) {
          case 'OPEN_CAMERA':
            this.openWebCam({
              type: 'SELFIE',
              muid: message.muid
            });
            action.is_action_taken = true;
            break;
          case 'VIDEO_CONFERENCE':
            /** config.startWithVideoMuted=true param starts audio conferencing*/
            let link;
            if (button.is_audio_conference && !button.invite_link.includes('#config.startWithVideoMuted')) {
              if (button.invite_link.includes('https://')) {
                link = button.invite_link + '#config.startWithVideoMuted=true';
              } else {
                link = 'https://' + button.invite_link + '#config.startWithVideoMuted=true';
              }
            } else {
              if (button.invite_link.includes('https://')) {
                link = button.invite_link;
              } else {
                link = 'https://' + button.invite_link;
              }
            }
            window.open(link,
              `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${window.outerWidth - 100},height=${window.outerHeight - 100}`);
            this.actionButtonClickPublish(message, action, button);
            break;
          case 'CREATE_GROUP':
            if (!this.spaceData.config.enable_create_group.includes(this.spaceData.role)) {
              this.messageService.sendAlert({
                type: 'danger',
                msg: 'You are not authorized to perform this operation.',
                timeout: 3000
              });
              return;
            }
            this.emitGroupEvent(true);
            // this.actionButtonClickPublish(message, action, button);
            break;
          case 'INVITE_MEMBER':
            // document.getElementById('inviteMember').click();
            this.layoutService.InvitePopupEmitter.emit(true);
            // this.actionButtonClickPublish(message, action, button);
            break;
          case 'BROWSE_GROUP':
            //this.emitGroupEvent(false);
            this.layoutService.BrowseGroupEmitter.emit(true);
            // document.getElementById('browse-groups').click();
            this.actionButtonClickPublish(message, action, button);
            break;
          case 'CREATE_WORKSPACE':
           this.layoutService.createNewWorkspace();
            // this.actionButtonClickPublish(message, action, button);
            break;
          case 'APPS':
            window.open('/' + this.commonService.currentOpenSpace.workspace + '/apps');
            //this.actionButtonClickPublish(message, action, button);
            break;
          case 'GO_TO_NOTES':
            this.router.navigate([`../../${action.channel_id_notes}`], {relativeTo: this.activatedRoute});
            break;
          case 'start_conference_call':
            this.router.navigate([`../../${action.conference_channel_id}`], {relativeTo: this.activatedRoute});
            break;
          default:
            this.actionButtonClickPublish(message, action, button);
        }
        break;
      case ButtonMessageActionTypes.FAYE_PUBLISH:
        break;
      case ButtonMessageActionTypes.TEXT_FIELD:
        action.showCommentBox = true;
        setTimeout(() => {
          jQuery(`#button-message-comment-${action.leave_id}`).focus();
        }, 0);
        action.textboxButton = button;
        break;
      case ButtonMessageActionTypes.MESSAGE_PUBLISH:
        this.livestreamId = button.data;
        this.openLiveStreamWindow('PLAY');
        break;
      default:
        break;
    }
    this.detectChanges();
  }

  emitGroupEvent(flag) {
    const obj = {
      is_open: flag
    };
    this.commonService.createGroupEmitter.emit(obj);
  }

  actionButtonClickPublish(message, action, button) {
    const retValue = this.sendButtonMessageComment(message, action, button);
    if (retValue) {
      return;
    }


    const data = {
      message: message.message,
      muid: message.muid,
      button_action: button.action,
      button_data: {
        tagged_user_id: action.tagged_user_id,
        leave_id: action.leave_id,
        confirmation_type: action.confirmation_type,
        title: action.title,
        type_id: button.type_id
      }
    };

    if (action.confirmation_type == 'LEAVE_TYPE_SELECT') {
        data['time_zone'] = this.commonService.getTimeZone();
    }
    if (action.confirmation_type == 'USER_LEAVE_CONFIRMATION') {
        data['time_zone'] = this.commonService.getTimeZone();
    }
    if (action.remark) {
      data.button_data['remark'] = action.remark;
    }

    if (button.action == 'SEND_INVITE_MESSAGE') {
      if (action.comment.includes('@') || isNaN(action.comment)) {
        data.button_data['email'] = action.comment;
      } else {
        data.button_data['contact_number'] = '+91-' + action.comment;
        data.button_data['country_code'] = 'IN';
      }
    } else {
      if (action.comment) {
        data.button_data['comment'] = action.comment;
      }
    }
    this.sendActionMessage(data);
    action.is_action_taken = true;
    action.showCommentBox = false;
    action.buttons.map((btn) => {
      if (['SHOW_ALL_APPS', 'SHOW_NOTES'].includes(btn.action)) {
        action.is_action_taken = false;
      }
      if (['FUGU_INVITE_MEMBER'].includes(btn.action)) {

      }
    });
  }

  onButtonMessageTextfieldKeyEvent(event, originalMessage, action) {
    if (event.keyCode == 13 && !event.shiftKey && this._showTagList != true) {
      event.preventDefault();
      if (!(this.socketService.socket.connected && this.isOnline)) {
        return false;
      }
      this.sendButtonMessageComment(originalMessage, action);
    }
  }

  checkFileType(mimeTypeParent) {
    if (['audio', 'video'].includes(mimeTypeParent[0]) && !['ogg'].includes(mimeTypeParent[1])) {
      return mimeTypeParent[0];
    } else {
      return 'file';
    }
  }

  getImageHeightWidth(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const image: any = new Image();
        image.src = e.target['result'];
        image.onload = () => {
          resolve({
            image_width: image.width,
            image_height: image.height
          });
        };
      };
    });
  }

  private makeInChatPhotoCarousel(data: Message) {
    if ([MessageType.Media_Message, MessageType.Video_Message,
        MessageType.File_Message].includes(data.message_type) &&
      data.message_state != MessageStateTypes.MESSAGE_DELETED) {
      const obj = {
        message: data,
        date_time: data.date_time,
        messageType: data.message_type,
        documentType: data.document_type || this.commonService.checkMimeType(data['image_url'] || data['url'])
      };
      this.commonService.channelMedia[data.thread_muid || data.muid] = obj;
    }
  }

  openWebCam(extras_object: Object) {
    if ('permissions' in navigator && 'query' in navigator['permissions']
      && this.commonService.browserChecks.isChrome) {
      this.service.queryPermissions('camera');
    }
    navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
      this.webcam_object = {
        is_open: true,
        stream: stream,
        extras: extras_object
      };
      this.cdRef.detectChanges();
    }).catch((error) => {
      this.layoutService.permissionsPopup.emit({
        is_open: false
      });
      const error_object = {
        is_open: true,
        content: {
          heading: '',
          description: ''
        }
      };
      switch (error.name) {
        case 'NotFoundError':
          error_object.content.heading = 'Camera not found';
          error_object.content.description = 'We were not able to detect any camera on your computer.';
          break;
        default:
          error_object.content.heading = 'Allow Camera';
          error_object.content.description = 'To take photos, we needs access to your computer\'s camera. Click' +
            'Camera icon in the URL bar and choose \n“Always allow to access your camera."';
      }
      this.layoutService.messageModal.emit(error_object);
      this.cdRef.detectChanges();
    });
  }

  /**
   * when data is received from webcam capture and send event
   * @param object
   */
  webcamDataReceived(object) {
    if (object.extras.type == 'SELFIE') {
      this.uploadSelfie(object);
    } else {
      this.attendanceUpload(object);
    }
  }

  /**
   * upload location or file or both while punching in or out.
   * @param object
   */
  attendanceUpload(object) {
    this.webcam_object.is_open = false;
    const file = object.file;
    const formData: FormData = new FormData();
    const spaceFormData = this.commonService.currentOpenSpace;
    if (object.location) {
      object.location = {
        latitude: object.location.latitude.toString(),
        longitude: object.location.longitude.toString()
      };
    }
    if (['CAMERA'].includes(object.extras.permission)) {
      formData.append('file_type', file.type);
      formData.append('file', file, file.name);
    } else if (['LOCATION'].includes(object.extras.permission)) {
      if (!object.location) {
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'Location could not be fetched.',
          timeout: 3000
        });
        return;
      }
      formData.append('location', JSON.stringify(object.location));
    } else if (['BOTH'].includes(object.extras.permission)) {
      if (!object.location) {
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'Location could not be fetched.',
          timeout: 3000
        });
        return;
      }
      formData.append('file_type', file.type);
      formData.append('file', file, file.name);
      formData.append('location', JSON.stringify(object.location));
    }
    formData.append('attendance_authentication_level', object.extras.text == 'in' ?
      this.putUserData.user_attendance_config.punch_in_permission :
      this.putUserData.user_attendance_config.punch_out_permission);
    formData.append('action', object.extras.text);
    formData.append('en_user_id', this.commonService.userDetails.en_user_id);
    formData.append('app_secret_key', spaceFormData['fugu_secret_key']);
    this.service.attendanceVerification(formData).subscribe(() => {

    }, error => {
      // Permission mismatch, we update the new permissions into our local
      if (error.status == 412) {
        this.putUserData.user_attendance_config = error.error.data.user_attendance_config;
        this.sessionService.set('user_details', this.putUserData);
      }
    });
  }

  /**
   * upload selfie in case of no default image is present.
   * @param object
   */
  uploadSelfie(object) {
    const file = object.file;
    const formData: FormData = new FormData();
    const spaceFormData = this.commonService.currentOpenSpace;
    formData.append('file_type', file.type);
    formData.append('channel_id', this.activeChannelId.toString());
    formData.append('muid', object.extras.muid);
    formData.append('en_user_id', this.commonService.userDetails.en_user_id);
    formData.append('file', file, file.name);
    formData.append('app_secret_key', spaceFormData['fugu_secret_key']);
    this.webcam_object.is_open = false;
    this.service.uploadSelfie(formData).subscribe(() => {
      this.cdRef.detectChanges();
    }, error => {
      this.cdRef.detectChanges();
    });
  }

  onTextCopied(event) {
    if (event.clipboardData) {
      const selectedText = window.getSelection().toString();
      event.clipboardData.setData('text/plain', selectedText.trim());
      event.preventDefault();
    }
  }

  onCopiedClick(event) {
    let value = this.temp_message_menu_object.message;
    const span = document.createElement('span');
    span.innerHTML = value;
    value = span.innerText;
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    document.body.removeChild(span);
  }

  onInputPaste(e: ClipboardEvent) {
    e.preventDefault();
    let text = e.clipboardData.getData('text/plain').trim();
    text = text.replace(/&/g, '&amp;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/</g, '&lt;');
    text = text.replace(/"/g, '&quot;');
    text = text.replace(/'/g, '&#039;');
    document.execCommand('insertHTML', false, text);
  }

  addEventListeners(el, eventsArray, method) {
    eventsArray.forEach(evt =>
      el.addEventListener(evt, (e) => {
        method(e);
      })
    );
  }

  removeEventListeners(el, eventsArray, method) {
    eventsArray.forEach(evt =>
      el.removeEventListener(evt, (e) => {
        method(e);
      })
    );
  }

  preventDefaults(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  downloadVideo(obj) {
    const changedUrl = this.commonService.changeS3Url(obj.url);
    const newLink = document.createElement('a');
    newLink.setAttribute('href', changedUrl);
    newLink.setAttribute('download', '');
    newLink.click();
    newLink.remove();
  }

  redirectToBilling() {
    if (this.layoutService.expireBillingDetails) {
      window.open(this.layoutService.expireBillingDetails.billing_url, '_BLANK');
      this.showBillingStrip = false;
    }
  }

  showReadBy(data) {
    if (data.thread_muid) {
      this.closeReplyPopup();
    }
    if (!data.channel_id) {
      data.channel_id = this.activeChannelId;
    }
    data.chat_type = this.chat_type;
    data['channelImage'] = this.channelImage;
    data['channelName'] = this.label_header;
    this.showReadByWindow.emit(data);
  }
}
