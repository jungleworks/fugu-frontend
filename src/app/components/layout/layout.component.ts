import {animate, state, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import {Subscription} from 'rxjs';
import {messageModalAnimation, barFadeInOut} from '../../animations/animations';
import {IGroupInfoData} from '../../interfaces/app.interfaces';
import {CommonService} from '../../services/common.service';
import {SessionService} from '../../services/session.service';
import {SocketioService} from '../../services/socketio.service';
import {ChatTypes, NotificationType, Role, Bots} from '../../enums/app.enums';
import {LayoutService} from './layout.service';
import {CommonApiService} from '../../services/common-api.service';
import {debounceTime} from 'rxjs/operators';
import * as branch from 'branch-sdk';
import {environment} from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import {LoaderService} from '../../services/loader.service';
import * as introJs from 'intro.js/intro.js';
import tutorialObj from '../../services/tutorial.service';
import {LocalStorageService} from '../../services/localStorage.service';

let putUserData, memberSub: Subscription;
const timeoutInMiliseconds = 3600000; //1 hour timeout for online
let timeoutId;
let staleSocket = false;
const membersPageSize = 30;

interface IConferencePopup {
  conferenceLink: string;
  showAcceptConferencePopup: boolean;
  inviteFullName: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./layout.component.scss'],
  animations: [
    barFadeInOut,
    messageModalAnimation,
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate('200ms cubic-bezier(0.600, 0.040, 0.980, 0.335)')
      ]),
      transition('* => void', [
        animate('200ms cubic-bezier(0.600, 0.040, 0.980, 0.335)', style({transform: 'translateX(-100%)'}))
      ])
    ])
    // trigger('flyRightIn', [
    //   state('in', style({ transform: 'translateX(0)' })),
    //   transition('void => *', [
    //     style({ transform: 'translateX(100%)' }),
    //     animate('50ms cubic-bezier(0.600, 0.040, 0.980, 0.335)')
    //   ]),
    //   transition('* => void', [
    //     animate('50ms cubic-bezier(0.600, 0.040, 0.980, 0.335)', style({ transform: 'translateX(100%)' }))
    //   ])
    // ])
  ]
})
export class LayoutComponent implements OnInit {

  public chat_type = -1;
  public params: any = {
    channelId: 0,
    id: 0
  };
  public current_unread_count;
  isChat = true;
  isMeet = false;
  messageItem;
  spaceData;
  userData;
  group_data;
  is_group_joined;
  showProfile = false;
  show_sidebar = false;
  show_chat = false;
  groupInfo = <IGroupInfoData>{};
  getMembersData = <IGroupInfoData>{};
  conferenceAcceptanceObject = <IConferencePopup>({});
  cookie_consent_shown = false;
  botsEnum = Bots;
  search_view_open = false;
  search_messages_data = [];
  jumpSearchData;
  unread_notification_count;
  create_group_open = false;
  starred_open;
  unstarAllItem;
  group_members_added = {};
  deletedMessageItem;
  clearChatEmitter;
  user_profile_open = false;
  showWhatsNew = false;
  permissions_popup_object = {
    is_open: false,
    content: {
      heading: '',
      description: ''
    }
  };
  error_message_modal_object = {
    is_open: false,
    content: {
      heading: '',
      description: ''
    }
  };
  showReadBy = false;
  readByData;
  fetchedNotificationData;
  RoleStatusEnum = Role;
  showSlowInternetBar = false;
  showMeetDashboard = false;
  introJS;


  constructor(private activatedRoute: ActivatedRoute, private sessionService: SessionService,
              public commonService: CommonService, public commonApiService: CommonApiService, private ngZone: NgZone, private router: Router,
              public cdRef: ChangeDetectorRef, private layoutService: LayoutService, private socketService: SocketioService,
              private loader: LoaderService, public localStorageService: LocalStorageService) {
  }

  updateTagUsers() {
    this.getMembers(this.params.channelId, true);
  }

  ngOnInit() {

    if (this.localStorageService.get('showTutorials')) {
      this.introJS = introJs();
      this.introJS.setOptions({
        steps: [
          {
            element: '#chatLayout',
            intro: tutorialObj.step1,
            position: 'right'
          },
          {
            element: '#meetLayout',
            intro: tutorialObj.step2,
            position: 'right'
          }
        ]
      });

      setTimeout(() => {
        this.introJS.setOptions({
          showBullets: false,
          skipLabel: 'Skip Tutorial',
          doneLabel: 'Okay',
          hidePrev: true,
          hideNext: true,
          showStepNumbers: false
        }).start();
      }, 500);

      this.introJS.oncomplete(() => {
        this.localStorageService.remove('showTutorials');
      });
      this.introJS.onexit(() => {
        this.localStorageService.remove('showTutorials');
      });

      // this.getMembers(channel_id)

    }

    this.spaceData = this.commonService.currentOpenSpace;
    if (window.location.pathname.split('/')[2] == 'meet') {
      this.showMeetDashboard = true;
      this.isChat = false;
      this.isMeet = true;
    }
    if ((this.commonService.isMobile && !this.commonService.isWhitelabelled)) {
      this.loader.show();
      branch.init(environment.BRANCH_KEY,
        (err, data) => {
          console.log(data);
        });
      this.checkBranch();
    }
    this.setupTimers();
    // this.commonService.initWebWorker();
    this.socketService.setupSocketConnection();
    this.onWindowReceiveData();
    this.userData = this.sessionService.get('loginData/v1')['user_info'];
    // this.spaceData = this.sessionService.get('currentSpace');
    if (!this.layoutService.expireBillingDetails) {
      this.commonService.showExpiredPopupInSpace(this.userData);
    }
    if (this.commonService.userDetailDict) {
      putUserData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
      // this.commonService.updateUserDetails(putUserData);
      this.show_sidebar = true;
      this.show_chat = true;
      this.cdRef.detectChanges();
    }
    //this.putUserDetails();
    if (this.sessionService.get('cookie_consent_shown') != null) {
      this.cookie_consent_shown = <any>this.sessionService.get('cookie_consent_shown');
    } else {
      this.cookie_consent_shown = true;
      this.sessionService.set('cookie_consent_shown', true);
    }
    this.activatedRoute.params.subscribe((params: Params) => {
      /**
       * hide read by section when channel swtiches
       */
      this.commonService.showWorkspaces = false;
      this.showReadBy = false;
      if (this.layoutService.revokeImagesArray) {
        this.layoutService.revokeImagesArray.map(img => {
          URL.revokeObjectURL(img);
        });
      }
      if (+params.channelId) {
        this.commonService.channelMedia = {};
        this.params = params;
        this.cdRef.detectChanges();
        this.getMembers(params.channelId);
      }
    });
    if ('serviceWorker' in window.navigator) {
      window.navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.channel_id) {
          // event.data.channel_id
          this.layoutService.pushNotificationEmitter.emit(event.data);
          /**
           * emitter to clear the workspace bar
           */
          this.commonService.closeWorkspaceEmitter.emit(false);
          try {
            if (JSON.parse(event.data.is_thread_message)) {
              // this.thread_msg_data = event.data;
            }
          } catch (e) {
            if (event.data.is_thread_message == 'true') {
              // this.thread_msg_data = event.data;
            }
          }
          this.cdRef.detectChanges();
          // this.router.navigate(['/messages', -1, event.data.channel_id]);
        }
      });
    }
    // init firebase
    try {
      this.firebaseInit();
    } catch (e) {
    }
    this.commonService.searchMessageEmitter.subscribe((data) => {
      this.closeOtherViews();
      this.search_view_open = true;
      this.layoutService.starredState.emit(false);
      if (data) {
        this.search_messages_data = data;
      }
      this.cdRef.detectChanges();
    });

    /**
     * create group emitter, open create group component on receiving this
     */
    this.commonService.createGroupEmitter.subscribe(data => {
      this.create_group_open = data.is_open;
      if (!data.is_open) {
        this.group_members_added = null;
      }
      if (data.members) {
        this.group_members_added = data.members;
      }
      this.cdRef.detectChanges();
    });

    /**
     * notification clicked from notification center, handled here
     */
    this.layoutService.notificationClickEvent.subscribe((data) => {
      this.fetchedNotificationData = data;
      if (this.spaceData.workspace != data.workspace) {
        this.commonService.otherSpaceNotificationEmitter.emit(data.workspace);
      }
      if (![NotificationType.Add_Member, NotificationType.Group_Update].includes(data.notification_type)) {
        switch (data.notification_type) {
          case 22:
            this.router.navigate([data.workspace, 'messages', data.channel_id], {queryParams: {openTask: true}});
            break;
          case 23:
            this.router.navigate([data.workspace, 'meet']);
            break;
          default:
            this.router.navigate([data.workspace, 'messages', data.channel_id], {queryParams: {muid: data.muid}});
        }

      } else {
        this.router.navigate([data.workspace, 'messages', data.channel_id]);
      }
      // this.router.navigate([`../../${data.channel_id}`], { queryParams: { muid: data.muid } , relativeTo: this.activatedRoute });
      if (this.commonService.conversations[data.channel_id]) {
        this.commonService.conversations[data.channel_id].unread_count = 0;
      }
      this.current_unread_count = 0;
      if (data.thread_muid || data.is_tagged) {
        // this.thread_msg_data = data;
      }
      this.commonService.changeDetectEmit();
    });
    this.layoutService.unreadCountEmitter.subscribe((data) => {
      this.current_unread_count = data;
    });
    /**
     * if thread window is to be opened after clicking notification on another space, check if the cookie contains
     * the data, that expires in 30s and set that data to thread msg data.
     */
    this.commonService.putUserDetail.subscribe((workspace) => {
      const notification_cookie = this.commonService.getCookieSubdomain('notification_data');
      if (notification_cookie && notification_cookie.app_secret_key == this.spaceData.fugu_secret_key) {
        // this.thread_msg_data = notification_cookie;
        this.commonService.deleteCookie('notification_data');
      }
    });

    this.commonService.newUserAddedToGroup.subscribe(res => {
      this.updateTagUsers();
    });

    this.layoutService.starredState.subscribe(data => {
      if (data) {
        this.closeOtherViews();
        this.starred_open = true;
      }
      if (data == false) {
        this.commonService.notifications_menu_open = false;
        this.starred_open = false;
        this.messageItem = undefined;
        this.unstarAllItem = undefined;
        this.deletedMessageItem = undefined;
      }
    });

    this.commonService.slowInternetConnection.subscribe((bool) => {
      this.showSlowInternetBar = bool;
      this.cdRef.detectChanges();
    });

    this.layoutService.notificationState.subscribe(data => {
      if (data) {
        this.closeOtherViews();
        this.commonService.notifications_menu_open = true;
      }
      if (data == false) {
        this.commonService.notifications_menu_open = false;
        this.starred_open = false;
        this.messageItem = undefined;
        this.unstarAllItem = undefined;
        this.deletedMessageItem = undefined;
      }
    });
    /**
     * for showing allow permissions popup
     */
    this.layoutService.permissionsPopup.subscribe(data => {
      if (data) {
        this.permissions_popup_object = data;
        this.cdRef.detectChanges();
      }
    });
    /**
     * for showing message error modal
     */
    this.layoutService.messageModal.subscribe(data => {
      if (data) {
        this.error_message_modal_object = data;
        this.cdRef.detectChanges();
      }
    });
    this.layoutService.memberAddedEvent.subscribe((member) => {
      this.getMembersData.members.push(Object.assign(member, {status: 1}));
      this.layoutService.sortByNames(this.getMembersData.members);
      this.onMembersInfoReceived({...this.getMembersData});
    });
    this.layoutService.memberRemovedEvent.subscribe((removed_user_id) => {
      for (let i = 0; i < this.getMembersData.members.length; i++) {
        if (this.getMembersData.members[i]['user_id'] == removed_user_id) {
          this.getMembersData.members.splice(i, 1);
          break;
        }
      }
      this.getMembersData.members = this.getMembersData.members.slice();
      this.onMembersInfoReceived({...this.getMembersData});
    });

    this.activatedRoute.queryParams.subscribe(
      (param) => {
        if (param && param['muid']) {
          if (this.fetchedNotificationData && (this.fetchedNotificationData.thread_muid || this.fetchedNotificationData.is_tagged)) {
            // this.thread_msg_data = this.fetchedNotificationData;
          } else {
            if (this.fetchedNotificationData && this.fetchedNotificationData.notification_type != NotificationType.Group_Update &&
              this.fetchedNotificationData.notification_type != NotificationType.Add_Member) {
              // this.thread_msg_data = {'muid': param['muid'] };
            }
          }
          this.commonService.changeDetectEmit();
        }
      });

    this.commonService.spaceDataEmitter.subscribe(() => {
      // this.spaceData = this.sessionService.get('currentSpace');
      this.spaceData = this.commonService.currentOpenSpace;
      this.search_messages_data = [];
      this.closeOtherViews();
      this.cdRef.detectChanges();

    });

    this.commonService.jumpToSearch.subscribe((data) => {
      this.jumpSearchEmitter(data);
    });


  }

  checkBranch() {
    let wsName = window.location.pathname.split('/')[1];
    const linkData = {
      data: {
        workspace: wsName,
        token: this.commonService.getCookieSubdomain('token').access_token
      }
    };
    const encryptedToken = CryptoJS.AES.encrypt(this.commonService.getCookieSubdomain('token').access_token, 'keytoencrypt');

    if (this.commonService.isWhitelabelled && !this.commonApiService.whitelabelConfigurations['branch_key']) {
      window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${wsName}?token=${encryptedToken}`, '_self');
    } else {
      if (this.commonService.isWhitelabelled) {
        linkData.data['$android_url'] = this.commonApiService.whitelabelConfigurations['android_app_link'];
        linkData.data['$ios_url'] = this.commonApiService.whitelabelConfigurations['ios_app_link'];
      } else {
        linkData.data['$android_url'] = 'https://play.google.com/store/apps/details?id=com.officechat&hl=en';
        linkData.data['$ios_url'] = 'https://itunes.apple.com/us/app/fuguchat/id1336986136?mt=8';
      }
      linkData.data['$desktop_url'] = 'https://' + environment.REDIRECT_PATH + '/' + wsName + '/messages' + '?token=' + encryptedToken;
      if (this.spaceData.email) {
        linkData.data['email'] = this.spaceData.email;
      } else {
        linkData.data['contact_number'] = this.spaceData.contact_number;
      }
      if (this.commonService.isMobile) {
        branch.link(linkData, (err, link) => {
          if (!err) {
            window.open(link, '_self');
          } else {
            console.log('Branch IO ERROR: ', err);
          }
        });
      }

    }
  }

  setupTimers() {
    window.addEventListener('mousemove', (e) => {
      this.resetTimer();
    });
    window.addEventListener('mousedown', (e) => {
      this.resetTimer();
    });
    window.addEventListener('keypress', (e) => {
      this.resetTimer();
    });
    window.addEventListener('touchmove', (e) => {
      this.resetTimer();
    });
    this.startTimer();
  }

  resetTimer() {
    clearTimeout(timeoutId);
    if (this.socketService.socket && !this.socketService.socket.connected && staleSocket) {
      this.socketService.socket.connect();
      staleSocket = false;
      this.socketService.reconnectionEvent.emit({timestamp: new Date()});
    }
    this.startTimer();
  }

  startTimer() {
    timeoutId = setTimeout(() => {
      this.doSocketDisconnect();
    }, timeoutInMiliseconds);
  }

  doSocketDisconnect() {
    this.socketService.socket.disconnect();
    staleSocket = true;
  }

  private firebaseInit() {
    // firebase initialization and register service worker
    firebase.initializeApp(environment.FIREBASE_CONFIG);
    const messaging = firebase.messaging();
    navigator.serviceWorker.register('../sw.js').then((registration) => {
      messaging.useServiceWorker(registration);
      // Request permission and get token.....
      messaging.requestPermission().then(() => {
        // TODO(developer): Retrieve an Instance ID token for use with FCM.
        // Get Instance ID token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        messaging.getToken().then((currentToken) => {
          if (currentToken) {
            this.saveFirebaseToken(currentToken);
          } else {
            // Show permission request.
            // Show permission UI.
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
      }).catch(function (err) {
        console.log('Unable to get permission to notify.', err);
      });
      // Callback fired if Instance ID token is updated.
      messaging.onTokenRefresh(function () {
        messaging.getToken().then((refreshedToken) => {
          // Indicate that the new Instance ID token has not yet been sent to the app server.
          this.setTokenSentToServer(refreshedToken);
          // Send Instance ID token to app server.
        }).catch((err) => {
        });
      });
    });
    // TO HANDLE NOTIFICATIONS IF APP IS IN FOREGROUND
    // Handle incoming messages. Called when a message is received while the app has focus
    //   the user clicks on an app notification created by a sevice worker
    messaging.onMessage((payload) => {
      // Customize notification here
      let notification;

      if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
      } else if (Notification['permission'] === 'granted') {
        // If it's okay let's create a notification
        let is_thread;
        let notiWorkspace;
        try {
          if (JSON.parse(payload['data'].is_thread_message) || JSON.parse(payload['data'].workspace)) {
            is_thread = JSON.parse(payload['data'].is_thread_message);
            notiWorkspace = JSON.parse(payload['data'].workspace);
          }
        } catch (e) {
          if (payload['data'].is_thread_message == 'true' || payload['data'].workspace) {
            is_thread = payload['data'].is_thread_message;
            notiWorkspace = payload['data'].workspace;
          }
        }
        if ((is_thread != 'false') || (notiWorkspace && notiWorkspace != this.spaceData.workspace)) {
          const notificationTitle = payload['data'].title;
          const notificationOptions = {
            body: payload['data'].body,
            icon: payload['data'].icon,
            data: {
              url: self.location.protocol + '//' + self.location.hostname + '/' + notiWorkspace + '/messages/' + payload['data'].channel_id,
              channel_id: payload['data'].channel_id,
              muid: payload['data'].muid,
              is_thread_message: payload['data'].is_thread_message,
              noti_workspace: payload['data'].workspace
            }
          };
          notification = new Notification(notificationTitle, notificationOptions);
          notification.onclick = (event) => {
            this.ngZone.run(() => {
              if (event.target.data.channel_id) {
                // event.target.data.channel_id
                this.layoutService.pushNotificationEmitter.emit(event.target.data);
                try {
                  if (JSON.parse(event.target.data.is_thread_message)) {
                    // this.thread_msg_data = event.target.data;
                  }
                } catch (e) {
                  if (event.target.data.is_thread_message == 'true') {
                    // this.thread_msg_data = event.target.data;
                  }
                }
                notification.close();
                // this.router.navigate(['/messages', -1, event.data.channel_id]);
              }
              this.cdRef.detectChanges();
            });
          };
        }
      }
    });
  }

  private saveFirebaseToken(token) {
    this.setTokenSentToServer(token);
    localStorage.setItem('token', token);
  }

  setTokenSentToServer(token) {
    const obj = {
      token: token,
      device_id: this.getCookieSubdomain('device_id').toString(),
      web_token_status: 1,
      domain: window.location.hostname.split('.').splice(1).join('.')
    };
    if (window.location.hostname == 'localhost') {
      obj['domain'] = environment.LOCAL_DOMAIN;
    }
    this.layoutService.updateDeviceToken(obj).subscribe(() => {
    });
  }

  hideCookieConsent() {
    this.cookie_consent_shown = false;
    this.sessionService.set('cookie_consent_shown', false);
  }

  onUnreadCountClick(count) {
    this.current_unread_count = count;
    this.cdRef.detectChanges();
  }

  onGroupJoined(bool) {
    this.is_group_joined = bool;
  }

  onMembersInfoReceived(data) {
    if (typeof data.group_joined == 'undefined') {
      data.group_joined = this.groupInfo.group_joined;
    }
    this.getMembersData.members = data.members;
    this.getMembersData.chat_type = data.chat_type;
    this.getMembersData.user_count = data.user_count;
    this.getMembersData = {...this.getMembersData};
    this.groupInfo = data;
    this.cdRef.detectChanges();
  }

  profileBtnClick(bool) {
    this.closeOtherViews();
    this.showProfile = bool;
    this.layoutService.starredState.emit(false);
  }

  labelHeaderReceived(data) {
    this.group_data = data;
  }

  userDataUpdate(data) {
    this.spaceData = data;
  }

  /**
   * pass jump search data to chat component
   * @param data
   */
  jumpSearchEmitter(data) {
    // this.show_chat = true;
    // this.showMeetDashboard = false;
    this.chat_type = data.chat_type;
    this.jumpSearchData = {...data};
  }

  showUserProfile(bool) {
    this.closeOtherViews();
    this.user_profile_open = bool;
  }

  showNewFeatures(bool) {
    this.closeOtherViews();
    this.showWhatsNew = bool;
  }

  showReadByWindow(data) {
    this.closeOtherViews();
    this.readByData = data;
    this.showReadBy = true;
  }

  closeOtherViews() {
    this.showProfile = false;
    this.search_view_open = false;
    this.user_profile_open = false;
    this.starred_open = false;
    this.commonService.notifications_menu_open = false;
    this.commonService.openMeetProfile = false;
    this.showWhatsNew = false;
    this.showReadBy = false;
  }

  starClicked(item) {
    this.messageItem = item;
    this.cdRef.detectChanges();
  }

  unstarAll(item) {
    this.unstarAllItem = item;
    this.cdRef.detectChanges();
  }

  deletedMessage(obj) {
    this.deletedMessageItem = obj;
    this.cdRef.detectChanges();
  }

  clearChat(obj) {
    this.clearChatEmitter = obj;
    this.cdRef.detectChanges();
  }

  onWindowReceiveData() {
    window.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'conference-call-invite':
          this.conferenceAcceptanceObject = e.data.data;
          this.cdRef.detectChanges();
          break;
      }
    });
  }

  joinConference() {
    window.open(this.conferenceAcceptanceObject.conferenceLink, '_blank',
      `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${window.outerWidth - 100},height=${window.outerHeight - 100}`);
    this.conferenceAcceptanceObject.showAcceptConferencePopup = false;
    this.cdRef.detectChanges();
  }

  putUserDetails() {
    const obj = {
      email: this.userData.email,
      full_name: this.spaceData.full_name || this.userData.full_name || undefined,
      phone_number: this.spaceData.contact_number || undefined,
      user_image: this.spaceData.user_image || this.userData.user_image || undefined,
      user_unique_key: this.userData.user_id,
      device_type: 3,
      device_token: localStorage.getItem('token') || undefined,
      web_token: localStorage.getItem('token') || undefined,
      neglect_conversations: true
    };
    this.layoutService.putUserDetails(obj).subscribe(response => {
      this.commonService.putUserDetails();
      this.commonService.updateUserDetails(response.data);
      // const data = <any>this.sessionService.get('currentSpace');
      const data = this.commonService.currentOpenSpace;
      data.app_secret_key = response.data.app_secret_key;
      // this.sessionService.set('currentSpace', data);
      this.commonService.currentOpenSpace = data;
      this.show_sidebar = true;
      this.show_chat = true;
      this.cdRef.detectChanges();
    });
  }

  getMembers(channel_id, isUpdated?) {
    if (memberSub) {
      memberSub.unsubscribe();
    }

    const obj = {
      channel_id: channel_id,
      en_user_id: this.commonService.userDetails.en_user_id,
      get_data_type: 'DEFAULT',
      page_start: 0,
      page_end: membersPageSize - 1,
      user_page_start: 0,
      user_page_end: membersPageSize - 1
    };


    let activeChannelId = Number(window.location.pathname.split('/')[3]);

    // if(activeChannelId == 58068) {

    // setTimeout(() => {
      memberSub = this.layoutService.getMembers(obj).pipe(debounceTime(100)).subscribe(response => {
        if (response.data) {
          let membersData = response.data;
          if (response.data && response.data.chat_members && response.data.chat_members.length > 0) {
            this.fetchAllAdminData(response.data.chat_members);
          }
          membersData = Object.assign(membersData, {
            members: [],
            group_joined: false,
            channel_image: response.data.channel_image,
            role: 'USER',
            user_count: response.data.user_count
          });
          this.commonService.usersInChannels = [];
          if(response.data.chat_type != 7){
            this.commonService.usersInChannels.push(response.data.chat_members[0].user_id)
          }
          membersData.members = response.data.chat_members.filter((user) => {
            if (user.user_id == this.commonService.userDetails.user_id) {
              membersData.group_joined = true;
              membersData.role = user.role;
            }
            if (response.data.chat_type == ChatTypes.ONE_TO_ONE && user.user_id != this.commonService.userDetails.user_id) {
              membersData.other_user_id = user.user_id;
              membersData.is_deactivated = user.status == 0;
            }
            return user.status;
          });
          this.getMembersData = membersData;
          this.layoutService.mutedStatusObject[channel_id] = response.data.user_notification_status;
          this.onMembersInfoReceived(membersData);
          if (isUpdated) {
            this.commonService.NewAddedUserUpdatedData.emit(this.getMembersData);
          }
          this.cdRef.detectChanges();
        }
      });
    // }
    // },5000)

  }

  fetchAllAdminData(memberData) {
    const adminIdData = [];
    this.layoutService.groupAdminData = [];
    memberData.forEach((item) => {
      if (item.role == this.RoleStatusEnum.isAdmin) {
        adminIdData.push(item.user_id);
      }
    });
    this.layoutService.groupAdminData = [...adminIdData];
    this.cdRef.detectChanges();
    this.commonService.changeDetectEmit();

  }

  /**
   * handle join group button on public group
   */
  joinGroup() {
    const member = {
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      user_image: this.userData.user_image,
      status: 1
    };
    this.getMembersData.members.push(member);
    this.getMembersData.group_joined = true;
    this.getMembersData = {...this.getMembersData};
    this.groupInfo = {...this.getMembersData};
  }

  getCookieSubdomain(cname) {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        try {
          return JSON.parse(c.substring(name.length, c.length));
        } catch (e) {
          return c.substring(name.length, c.length);
        }
      }
    }
    return '';
  }

  onStarEsc() {
    this.starred_open = false;
    this.layoutService.starredState.emit(false);
  }

  onNotificationEsc() {
    this.layoutService.notificationState.emit(false);

  }

  goToMeet() {
    this.isMeet = true;
    this.isChat = false;
    this.router.navigate(['/' + this.spaceData.workspace, 'meet']);
    this.layoutService.resetGetConvo.emit(true);
  }

  goToChat() {
    if (!this.isChat) {
      this.loader.show();
      // this.router.navigate(['messages']);
      this.router.navigate(['/' + this.spaceData.workspace]);
    }
    this.isChat = true;
    this.isMeet = false;
    this.commonService.openMeetProfile = false;
    this.loader.hide();
    // this.router.navigate(['/'+this.spaceData.workspace, 'messages/0']);
  }
}
