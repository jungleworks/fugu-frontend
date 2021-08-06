import {ChangeDetectorRef, Component, Input, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {SessionService} from '../../services/session.service';
import {environment} from '../../../environments/environment';
import {CommonService} from '../../services/common.service';
import {NotificationType} from '../../enums/app.enums';
import {MessageService} from '../../services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import {LayoutService} from '../layout/layout.service';
import {SocketioService} from '../../services/socketio.service';
import { takeWhile } from 'rxjs/operators';
import { CommonApiService } from '../../services/common-api.service';
import { HeaderService } from '../header/header.service';
import { fadeIn} from '../../animations/animations';

let scrollTopNotifications;
let stopHit = false;
let page_end;
let prev_page_end;
declare const moment: any;


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
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    fadeIn
  ]
})
export class NotificationComponent implements OnInit {
  notifications_array: Array<NotificationsInterface> = [];
  page_start = 1;
  page_size;
  show_loader = false;
  setPageEnd;
  alive = true;
  notificationsContainerEl;
  notifications_end_bool = false;
  domainsData;
  domains_map = {};
  spaceData;


  @ViewChild('notificationsContainer') set notificationsContainer(ref) {
    if (ref) {
      this.notificationsContainerEl = ref;
      if (document.getElementById('notification-container')) {
        document.getElementById('notification-container').addEventListener('scroll', (e) => {
          this.onNotificationsScroll(e, ref.nativeElement);
      });
    }
    }
  }

  constructor(private sessionService: SessionService, public commonService: CommonService,
    private service: HeaderService, private messageService: MessageService, private socketService: SocketioService,
    private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef,public commonApiService: CommonApiService,
    public layoutService: LayoutService,  private router: Router) { }

  ngOnInit() {
    this.notifications_end_bool = false;
    this.setPageEndFirstTime();
    this.page_start = 1;
    this.notifications_array = []
    this.domainsData = this.sessionService.get('domains');
    this.spaceData = this.commonService.currentOpenSpace;
    this.domainsData.map((domain) => {
      // if (domain.unread_count > 0 && (this.spaceData.workspace_id != domain.workspace_id)) {
      //   this.commonService.showUnreadDot = true;
      // }
      this.domains_map[domain.fugu_secret_key] = domain;
    });
    this.getNotifications();
  }

    /**
   * get notifications in notification center
   */
  getNotifications() {
    this.show_loader = true;
    stopHit = true;
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      page_start: this.page_start,
      page_end: this.setPageEnd ? prev_page_end : undefined
    };
    this.service.getNotifications(obj)
      .pipe(takeWhile(() => this.alive))
      .subscribe((res) => {
        /**
         * set array to data if page start is 1 else append, because we use page_start 1 hit when
         * menu is already open and we receive a notification
         */
        if (this.page_start == 1) {
          this.notifications_array = res.data.notifications;
          /**
           * Set scroll top only first time
           */
          if (scrollTopNotifications) {
            setTimeout(() => {
            this.notificationsContainerEl.nativeElement.scrollTop = scrollTopNotifications;
            }, 500);
          }
        } else {
          this.notifications_array = [...this.notifications_array, ...res.data.notifications];
        }
        this.page_start = obj.page_start + res.data.notifications.length;
        // this.notifications_count = 0;
        this.commonService.markAllReadEmitter.emit(true);
        this.page_size = res.data.notification_page_size;
        if (!this.setPageEnd) {
          page_end = this.page_start + this.page_size;
        }
        if (!res.data.notifications.length) {
          this.notifications_end_bool = true;
        }
        this.show_loader = false;
        stopHit = false;
        this.setPageEnd = false;
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }


    /**
   * called on scrolling notifications
   */
  onNotificationsScroll(e, el) {
    scrollTopNotifications = this.notificationsContainerEl.nativeElement.scrollTop;
    if ((el.scrollTop + el.clientHeight)
      / el.scrollHeight >= 0.98 && !this.notifications_end_bool) {
      if (!stopHit) {
      this.getNotifications();
      }
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

        // this.notifications_count = 0;
        this.commonService.markAllReadEmitter.emit(true);
        this.notifications_array.map((item) => {
          let now = moment().utc().format();
          now = now.replace('Z', '.000Z');
          item.read_at = now;
        });
        this.cdRef.detectChanges();
      });
  }

  onNotificationClick(data) {
    /**
     * setting reat at time to current time
     */
    if (!data.read_at) {
      let now = moment().utc().format();
      now = now.replace('Z', '.000Z');
      data.read_at = now;
    }
    /**
     * publish faye on control channel to notify notification is read
     */
    this.socketService.sendNotificationEvent({
      notification_id: data.notification_id,
      notification_type: NotificationType.Notification_Read,
      user_id: this.commonService.userDetails.user_id
    });
    /**
     * same space push, emit data and route
     */
    if (data.app_secret_key == this.spaceData.fugu_secret_key) {
      data.workspace = this.domains_map[data.app_secret_key].workspace;
      this.layoutService.notificationClickEvent.emit(data);
    } else {
      /**
       * different space push, set data in cookie if thread window is to be opened,
       * window to be opened in case of tagging or thread message
       * and open new url
       * @type {string}
       */
      if (!this.domains_map[data.app_secret_key]) {
        this.router.navigate(['/spaces']);
          return;
      }
      let url = '';
      if (data.notification_type != NotificationType.Added_To_Space) {
        if (data.thread_muid || data.is_tagged) {
          this.setNotitificationCookie({ muid: data.muid, app_secret_key: data.app_secret_key });
        }
        if (this.commonService.isWhitelabelled) {
          // tslint:disable-next-line:max-line-length
          url = `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${encodeURIComponent(this.domains_map[data.app_secret_key].workspace)}/messages/${data.channel_id}?muid=${data.muid}`;
        } else {
          // tslint:disable-next-line:max-line-length
          // url = `https://${environment.REDIRECT_PATH}/${encodeURIComponent(this.domains_map[data.app_secret_key].workspace)}/messages/${data.channel_id}`;
          data.workspace = this.domains_map[data.app_secret_key].workspace;
          this.layoutService.notificationClickEvent.emit(data);

        }
      } else {
        /**
         * invited to new workspace type
         */
        if (this.commonService.isWhitelabelled) {
          url = `https://${this.commonApiService.whitelabelConfigurations['full_domain']}/spaces`;
        } else {
          url = environment.INVITE_REDIRECT;
        }
      }
      if(url) {
        window.open(url , '_self');
      }

    }
    this.commonService.notifications_menu_open = false;
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
      document.cookie = 'notification_data=' + array + ';' + expires + ';domain=fugu.chat;path=/';
    } else {
      document.cookie = 'notification_data=' + array + ';' + expires + ';domain=localhost;path=/';
      document.cookie = 'notification_data=' + array + ';' + expires + ';domain=officechat.io;path=/';
    }
  }

  setPageEndFirstTime() {
    /**
     * Set page end when notification is opened first time
     */
    this.setPageEnd = true;
    prev_page_end = page_end ? page_end : undefined;
  }


}
