import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import {SessionService} from '../../services/session.service';
import {environment} from '../../../environments/environment';
import {CommonService} from '../../services/common.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {HeaderService} from './header.service';
import {NotificationType, Role} from '../../enums/app.enums';
import {MessageService} from '../../services/message.service';
import {ActivatedRoute} from '@angular/router';
import {LayoutService} from '../layout/layout.service';
import {animate, style, transition, trigger} from '@angular/animations';
import {SocketioService} from '../../services/socketio.service';
import {
  fadeIn,
  barFadeInOut,
  messageModalAnimation
} from '../../animations/animations';
import * as Raven from 'raven-js';
import {takeWhile} from 'rxjs/operators';
import {CommonApiService} from '../../services/common-api.service';
import {CalendarOptions, FullCalendarComponent} from '@fullcalendar/angular';
import {ApiService} from '../../services/api.service';

declare const moment: any;
let scrollTopNotifications;
let stopHit = false;
let page_end;
let prev_page_end;

interface NotificationsInterface {
  notification_id: number;
  user_unique_key: string;
  action_by_user_id: any;
  action_by_user_name: string;
  action_by_user_image: string;
  channel_id: any;
  chat_type: any;
  muid: string;
  thread_muid: string;
  notification_title: string;
  message: string;
  app_secret_key: string;
  is_tagged: any;
  notification_type: any;
  read_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./header.component.scss'],
  animations: [fadeIn, barFadeInOut, messageModalAnimation]
})
export class HeaderComponent implements OnInit {
  userData = {
    workspace_name: '',
    workspace: '',
    full_name: '',
    user_image: ''
  };
  searchCtrl;
  tokenData;
  loginData = {
    full_name: '',
    user_image: '',
    unread_notification_count: 0,
    whats_new_status: 0
  };
  currentChannelId;
  domainsData;
  spaceData;
  showNotCursor = false;
  alive = true;
  settings_option = 0;
  show_search_loader = false;
  public RoleStatusEnum = Role;
  roleStatus = this.RoleStatusEnum.isUser;
  workspace_dropdown_active = false;
  profile_dropdown_active = false;
  rightsForm: FormGroup;
  settings_open = false;
  settings_open_header = false;
  previous_search_keyword = '';
  notifications_menu_open = false;
  domains_map = {};
  page_start = 1;
  page_size;
  show_loader = false;
  showAssignTaskPopup = false;
  taskDataEdit: any = [];
  starred_open = false;
  search_expanded = false;
  showNotificationSettingsPopup = false;
  // showSlowInternetBar = false;
  notificationsContainerEl;
  rights = [
    {label: 'Right to be forgotten', value: 'FORGOTTEN'},
    {label: 'Right to portability', value: 'PORTABILITY'},
    {label: 'Right to rectification', value: 'RECTIFICATION'},
    {label: 'Right to restriction of processing', value: 'RESTRICTION'}
  ];
  notifications_end_bool = false;
  show_fugu_apps_popup = false;
  exitCommunityModal = false;
  rightsPopup = false;
  setPageEnd;
  @ViewChild('fullcalendar') fullcalendar: FullCalendarComponent;
  @ViewChild('searchMessageInput') searchMessageInput;
  // @ViewChild('notificationsContainer', { static: false }) set notificationsContainer(ref) {
  //   if (ref) {
  //     this.notificationsContainerEl = ref;
  //     document.getElementById('notification-container').addEventListener('scroll', (e) => {
  //       this.onNotificationsScroll(e, ref.nativeElement);
  //     });
  //   }
  // }
  @Output()
  showUserProfile: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  showNewFeatures: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  set user_data(data) {
    this.userData = data;
  }

  notifications_count = 0;
  whats_new_count = 0;
  openBroadcastPopup = false;
  notifications_array: Array<NotificationsInterface> = [];
  showLogoutModal = false;
  showDisableWorkplace = false;
  showUnreadDot = false;
  showViewTaskPopup = false;

  constructor(
    public api:ApiService,
    private sessionService: SessionService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private service: HeaderService,
    private messageService: MessageService,
    private socketService: SocketioService,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    public commonApiService: CommonApiService,
    public layoutService: LayoutService
  ) {
  }

  ngOnInit() {
    if (window.location.pathname.split('/')[2] == 'meet') {
      this.showNotCursor = true;
    }
    this.searchCtrl = new FormControl();
    this.domainsData = this.sessionService.get('domains');
    this.loginData = this.sessionService.get('loginData/v1')['user_info'];
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this.commonService.setUnreadCountOfSpace.subscribe((data) => {
      if (data && this.spaceData.workspace != data.workspace) {
        this.commonService.showUnreadDot = true;
        this.cdRef.detectChanges();
      }
    });

    this.commonService.closeWorkspaceEmitter.subscribe((data) => {
      if (!data) {
        this.commonService.showWorkspaces = false;
        this.cdRef.detectChanges();
      }
    });
    this.commonService.updateHeaderEmitter.subscribe((res) => {
      if (res) {
        this.cdRef.detectChanges();
      }
    });
    this.commonService.markAllReadEmitter.subscribe((res) => {
      if (res) {
        this.notifications_count = 0;
        this.cdRef.detectChanges();
      }
    });

    this.commonService.openTaskPopUp.subscribe((res) => {
      if (res) {
        this.showAssignTaskPopup = true;
        this.taskDataEdit = res;
        this.cdRef.detectChanges();
      }
    });

    Raven.setUserContext({
      name: this.loginData['full_name'],
      email: this.loginData['email']
    });
    this.roleStatus = this.spaceData.role;
    // this.commonService.slowInternetConnection.subscribe((bool) => {
    //   this.showSlowInternetBar = bool;
    //   this.cdRef.detectChanges();
    // });
    if (this.commonService.getCookieSubdomain('token')) {
      this.tokenData = this.commonService.getCookieSubdomain('token');
    }
    this.rightsForm = this.fb.group({
      option: ['', Validators.required],
      reason: ['', Validators.required]
    });
    this.notifications_count = this.loginData.unread_notification_count || 0;
    this.whats_new_count = this.sessionService.get('loginData/v1')['whatsNew'];
    // this.domainsData.map((domain) => {
    //   if (domain.unread_count > 0 && (this.spaceData.workspace_id != domain.workspace_id)) {
    //     this.showUnreadDot = true;
    //   }
    //   this.domains_map[domain.fugu_secret_key] = domain;
    // });
    this.rightsForm.controls['option'].setValue(this.rights[0], {
      onlySelf: true
    });
    this.commonService.spaceDataEmitter.subscribe(() => {
      // this.spaceData = this.sessionService.get('currentSpace');
      this.searchCtrl = new FormControl();
      this.previous_search_keyword = '';
      this.spaceData = this.commonService.currentOpenSpace;
      this.user_data = this.spaceData;
      if (this.domainsData) {
        for (let i = 0; i < this.domainsData.length; i++) {
          if (this.spaceData.workspace_id == this.domainsData[i].workspace_id) {
            this.domainsData[i].workspace_name = this.spaceData.workspace_name;
            this.userData.workspace_name = this.spaceData.workspace_name;
            this.cdRef.detectChanges();
            break;
          }
        }
        this.roleStatus = this.spaceData.role;
      }
    });
    this.activatedRoute.params.subscribe((data) => {
      this.currentChannelId = data.channelId;
    });
    this.socketService.notificationCenterEvent.subscribe((data) => {
      this.onNotificationCenterSocketEvent(data);
    });
    this.layoutService.starredState.subscribe(data => {
      this.starred_open = data;
      this.cdRef.detectChanges();
    });
    this.layoutService.notificationState.subscribe((data) => {
      this.commonService.notifications_menu_open = data;
      this.cdRef.detectChanges();
    });
  }


  onProfileClickOutside(event) {
    if (event && event['value'] === true) {
      this.profile_dropdown_active = false;
    }
  }
  onSearchBarClickOutside(event) {
    if (
      event &&
      event['value'] === true &&
      !this.checkClassContains(['search-box'], event.target.classList)
    ) {
      this.search_expanded = false;
    }
  }

  searchIconClick() {
    this.search_expanded = !this.search_expanded;
    setTimeout(() => {
      this.searchMessageInput.nativeElement.focus();
    });
  }

  onDomainChange(domain, noRedirect?) {
    if (domain.workspace != this.userData.workspace) {
      if (!noRedirect) {
        if (this.commonService.isWhitelabelled) {
          window.open(
            `https://${this.commonApiService.whitelabelConfigurations['full_domain']}`
          );
        } else {
          window.open('https://' + domain.workspace + environment.REDIRECT_PATH);
        }
      }
      const obj = {
        token: localStorage.getItem('token') || undefined,
        workspace_id: domain.workspace_id,
        access_token: this.tokenData.access_token
      };
      this.commonApiService.switchWorkspace(obj)
        .subscribe(() => {

        });
    }
  }

  openUserProfile() {
    this.profile_dropdown_active = false;
    this.showUserProfile.emit(true);
    this.layoutService.starredState.emit(false);
  }

  openNewFeatures() {
    this.whats_new_count = 0;
    let loginDataobj = this.sessionService.get('loginData/v1');
    loginDataobj['whatsNew'] = this.whats_new_count;
    this.sessionService.set('loginData/v1', loginDataobj);
    this.profile_dropdown_active = false;
    this.showNewFeatures.emit(true);
    this.layoutService.starredState.emit(false);
  }

  createNewWorkspace() {
    this.layoutService.createNewWorkspace();
  }

  submitRights() {
    const obj = {
      query: this.rightsForm.value.option.value,
      reason: this.rightsForm.value.reason,
      workspace_id: this.spaceData.workspace_id
    };
    this.service.submitUserRights(obj).subscribe((response) => {
      this.rightsPopup = false;
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      this.cdRef.detectChanges();
    });
  }

  clearRightsForm() {
    this.rightsForm.reset();
    this.rightsForm.controls['option'].setValue(this.rights[0], {
      onlySelf: true
    });
  }

  leaveOpenCommunity() {
    const obj = {
      workspace_id: this.spaceData.workspace_id
    };
    const tab = window.open('', '_self');
    this.service.leaveOpenSpace(obj).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      if (this.domainsData && this.domainsData.length === 1) {
        // logout
        this.commonApiService.logout();
      } else {
        // switch to workspace at 0th index if is not current workspace
        let domainToSwitched;
        // tslint:disable-next-line:max-line-length
        this.domainsData[0].workspace_id == this.spaceData.workspace_id
          ? (domainToSwitched = this.domainsData[1])
          : (domainToSwitched = this.domainsData[0]);
        this.onDomainChange(domainToSwitched, true);
        if (this.commonService.isWhitelabelled) {
          tab.location.href =
            'https://' +
            this.commonApiService.whitelabelConfigurations['full_domain'];
        } else {
          tab.location.href =
            'https://' + domainToSwitched.workspace + environment.REDIRECT_PATH;
        }
      }
    });
  }

  searchMessages() {
    this.searchCtrl.value = this.searchCtrl.value.trim();
    if (
      this.searchCtrl.value &&
      this.previous_search_keyword != this.searchCtrl.value
    ) {
      this.show_search_loader = true;
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        search_text: this.searchCtrl.value,
        page_start: 1
      };
      this.commonApiService.searchMessages(obj).subscribe((res) => {
        /**
         * passing search text
         */
        const object = {
          search_text: this.searchCtrl.value,
          messages: res.data.searchable_messages.concat(res.data.thread_messages),
          page_size: res.data.page_size
        };
        this.commonService.searchMessageEmitter.emit(object);
        this.show_search_loader = false;
        this.previous_search_keyword = this.searchCtrl.value;
        this.cdRef.detectChanges();
      });
    } else {
      this.commonService.searchMessageEmitter.emit();
    }
  }

  // /**
  //  * get notifications in notification center
  //  */
  // getNotifications() {
  //   this.show_loader = true;
  //   stopHit = true;
  //   const obj = {
  //     en_user_id: this.commonService.userDetails.en_user_id,
  //     page_start: this.page_start,
  //     page_end: this.setPageEnd ? prev_page_end : undefined
  //   };
  //   this.service.getNotifications(obj)
  //     .pipe(takeWhile(() => this.alive))
  //     .subscribe((res) => {
  //       /**
  //        * set array to data if page start is 1 else append, because we use page_start 1 hit when
  //        * menu is already open and we receive a notification
  //        */
  //       if (this.page_start == 1) {
  //         this.notifications_array = res.data.notifications;
  //         /**
  //          * Set scroll top only first time
  //          */
  //         if (scrollTopNotifications) {
  //           setTimeout(() => {
  //           this.notificationsContainerEl.nativeElement.scrollTop = scrollTopNotifications;
  //           }, 500);
  //         }
  //       } else {
  //         this.notifications_array = [...this.notifications_array, ...res.data.notifications];
  //       }
  //       this.page_start = obj.page_start + res.data.notifications.length;
  //       this.notifications_count = 0;
  //       this.page_size = res.data.notification_page_size;
  //       if (!this.setPageEnd) {
  //         page_end = this.page_start + this.page_size;
  //       }
  //       if (!res.data.notifications.length) {
  //         this.notifications_end_bool = true;
  //       }
  //       this.show_loader = false;
  //       stopHit = false;
  //       this.setPageEnd = false;
  //       this.cdRef.detectChanges();
  //     });
  // }

  /**
   * on receiving faye event
   * @param data
   */
  onNotificationCenterSocketEvent(data) {
    if (!this.notifications_count) {
      this.notifications_count = 0;
    }
    const prev_count = JSON.parse(JSON.stringify(this.notifications_count));
    if (data.notification_count) {
      this.notifications_count = data.notification_count;
    }
    /**
     * increment when same channel is not focused and message is not sent by same user
     */
    if (
      data.user_unique_key != this.commonService.userDetails.user_unique_key
    ) {
      /**
       * overwrite notification count when we receive unread_notification_count in push
       */
      if (data.domain == this.commonService.current_domain) {
        if (data.update_notification_count) {
          /**
           * handling create group and added to group case
           * create group -- no added_member_info key
           * add member - added_member_info object has user id
           */
          if (data.notification_type == NotificationType.Add_Member) {
            if (
              !data.added_member_info ||
              data.added_member_info.user_unique_key ==
              this.commonService.userDetails.user_unique_key
            ) {
              this.notifications_count += 1;
            }
            /**
             * handling group update and added to new space case
             */
          } else if ([5, 8, NotificationType.Edit_Message].includes(data.notification_type)) {
            this.notifications_count += 1;
          }
        }
      }
      this.cdRef.detectChanges();
    }
    /**
     * if menu is open and user receives a notification and counter increases and no pagination is there,
     * we hit api again to update data.
     */
    if (this.notifications_menu_open && this.notifications_count != prev_count && this.page_start == 1) {
      // this.getNotifications();
    }
  }

  // setPageEndFirstTime() {
  //   /**
  //    * Set page end when notification is opened first time
  //    */
  //   this.setPageEnd = true;
  //   prev_page_end = page_end ? page_end : undefined;
  // }

  /**
   * on notification click
   * @param data
   */
  // onNotificationClick(data) {
  //   /**
  //    * setting reat at time to current time
  //    */
  //   if (!data.read_at) {
  //     let now = moment().utc().format();
  //     now = now.replace('Z', '.000Z');
  //     data.read_at = now;
  //   }
  //   /**
  //    * publish faye on control channel to notify notification is read
  //    */
  //   this.socketService.sendNotificationEvent({
  //     notification_id: data.notification_id,
  //     notification_type: NotificationType.Notification_Read,
  //     user_id: this.commonService.userDetails.user_id
  //   });
  //   /**
  //    * same space push, emit data and route
  //    */
  //   if (data.app_secret_key == this.spaceData.fugu_secret_key) {
  //     data.workspace = this.domains_map[data.app_secret_key].workspace;
  //     this.layoutService.notificationClickEvent.emit(data);
  //   } else {
  //     /**
  //      * different space push, set data in cookie if thread window is to be opened,
  //      * window to be opened in case of tagging or thread message
  //      * and open new url
  //      * @type {string}
  //      */
  //     let url = '';
  //     if (data.notification_type != NotificationType.Added_To_Space) {
  //       if (data.thread_muid || data.is_tagged) {
  //         this.setNotitificationCookie({ muid: data.muid, app_secret_key: data.app_secret_key });
  //       }
  //       if (this.commonService.isWhitelabelled) {
  //         // tslint:disable-next-line:max-line-length
  //         url = `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${encodeURIComponent(this.domains_map[data.app_secret_key].workspace)}/messages/${data.channel_id}?muid=${data.muid}`;
  //       } else {
  //         // tslint:disable-next-line:max-line-length
  //         // url = `https://${environment.REDIRECT_PATH}/${encodeURIComponent(this.domains_map[data.app_secret_key].workspace)}/messages/${data.channel_id}`;
  //         data.workspace = this.domains_map[data.app_secret_key].workspace;
  //         this.layoutService.notificationClickEvent.emit(data);

  //       }
  //     } else {
  //       /**
  //        * invited to new workspace type
  //        */
  //       if (this.commonService.isWhitelabelled) {
  //         url = `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/spaces`;
  //       } else {
  //         url = environment.INVITE_REDIRECT;
  //       }
  //     }
  //     if(url) {
  //       window.open(url , '_self');
  //     }

  //   }
  //   this.notifications_menu_open = false;
  // }
  // notificationsClickOutside(event) {
  //   if (event && event['value'] && !this.checkClassContains(['notification-bell-icon', 'notification-count'], event.target.classList)) {
  //     this.notifications_menu_open = false;
  //   }
  // }
  checkClassContains(array, list) {
    let flag = true;
    if (array) {
      for (let i = 0; i < array.length; i++) {
        flag = list.contains(array[i]);
        if (flag) {
          return flag;
        }
      }
    }

    return false;
  }

  /**
   * set cookie for notifications thread and tagging cases when we need to open the reply popup.
   * @param array
   */
  setNotitificationCookie(array) {
    array = JSON.stringify(array);
    const d = new Date();
    d.setTime(d.getTime() + (30 * 1000));
    const expires = 'expires=' + d.toUTCString();
    if (environment.production) {
      document.cookie =
        'notification_data=' +
        array +
        ';' +
        expires +
        ';domain=fugu.chat;path=/';
    } else {
      document.cookie = 'notification_data=' + array + ';' + expires + ';domain=localhost;path=/';
      document.cookie = 'notification_data=' + array + ';' + expires + ';domain=officechat.io;path=/';
    }
  }

  /**
   * func to mark all notifications as read
   */
  markAllRead() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id
    };
    this.service.markAllAsRead(obj)
      .subscribe((res) => {
        /**
         * marking all as read and set counter to 0 and set read_at of all available data to current time.
         * @type {number}
         */
        this.notifications_count = 0;
        this.notifications_array.map((item) => {
          let now = moment().utc().format();
          now = now.replace('Z', '.000Z');
          item.read_at = now;
        });
        this.cdRef.detectChanges();
      });
  }

  /**
   * called on scrolling notifications
   */
  // onNotificationsScroll(e, el) {
  //   scrollTopNotifications = this.notificationsContainerEl.nativeElement.scrollTop;
  //   if ((el.scrollTop + el.clientHeight)
  //     / el.scrollHeight >= 0.98 && !this.notifications_end_bool) {
  //     if (!stopHit) {
  //     this.getNotifications();
  //     }
  //   }
  // }
  showProfileDropdown() {
    if (window.location.pathname.split('/')[2] == 'meet') {
      this.profile_dropdown_active = false;
      this.showNotCursor = true;
    } else {
      this.profile_dropdown_active = !this.profile_dropdown_active;
    }
  }

  showStarredMessage() {
    this.starred_open = !this.starred_open;
    this.profile_dropdown_active = false;
    this.layoutService.starredState.emit(this.starred_open);
  }

  onBellIconClick() {
    this.commonService.notifications_menu_open = !this.commonService.notifications_menu_open;
    this.starred_open = false;
    const obj = {
      is_open: false
    };
    this.commonService.createGroupEmitter.emit(obj);
    this.layoutService.notificationState.emit(this.commonService.notifications_menu_open);
  }

  emitNotificationSettingsOpenEvent() {
    this.showNotificationSettingsPopup = true;
    this.profile_dropdown_active = false;
  }

  emitThemesOpenEvent() {
    this.profile_dropdown_active = false;
    this.commonService.showThemesPopup = true;
    this.layoutService.showThemesPopup.emit(true);
  }

  openWorkspaces() {
    this.commonService.showUnreadDot = false;
    this.commonService.showWorkspaces = !this.commonService.showWorkspaces;
    this.commonService.closeWorkspaceEmitter.emit(this.commonService.showWorkspaces);
    setTimeout(() => {
      const el = document.getElementById('search-ws-container');
      if (el) {
        el.focus();
       }
    }, 100);
  }

  disableWorkplace() {
    const obj = {
      'url': 'workspace/editInfo',
      'type': 3,
      'body': {
        workspace_id: this.spaceData.workspace_id,
        status: 'DISABLED'
      }
    };

    this.showDisableWorkplace = false;
    this.api.postOc(obj).subscribe((res) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Disabled successfully',
        timeout: 2000
      });
      if (this.domainsData.length > 1) {
        window.location.href = window.location.origin;
      } else {
        this.commonApiService.logout();
      }
      this.commonService.spaceDataEmit();
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy() {
    /* to update count in the meet dashboard as well */
    let data: any = this.sessionService.get('loginData/v1');
    data.user_info.unread_notification_count = this.notifications_count;
    this.sessionService.set('loginData/v1', data);
    this.alive = false;
  }
}
