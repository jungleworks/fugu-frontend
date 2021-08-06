import {EventEmitter, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ApiService} from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { CommonApiService } from '../../services/common-api.service';
let hidden, visibilityChange;

@Injectable()
export class LayoutService {
  memberAddedEvent: EventEmitter<any> = new EventEmitter<any>();
  memberRemovedEvent: EventEmitter<any> = new EventEmitter<any>();
  notificationClickEvent: EventEmitter<any> = new EventEmitter<any>();
  chatTypeEmitter: EventEmitter<any> = new EventEmitter<any>();
  unreadCountEmitter: EventEmitter<any> = new EventEmitter<any>();
  starredState: EventEmitter<any> = new EventEmitter<any>();
  notificationState: EventEmitter<any> = new EventEmitter<any>();
  readAllEvent: EventEmitter<any> = new EventEmitter<any>();
  updateReadByWindow: EventEmitter<any> = new EventEmitter<any>();
  visibilityEvent: EventEmitter<any> = new EventEmitter<any>();
  page_visibility = true;
  pushNotificationEmitter: EventEmitter<any> = new EventEmitter<any>();
  showNotificationSettingsPopup: EventEmitter<any> = new EventEmitter<any>();
  showThemesPopup: EventEmitter<any> = new EventEmitter<any>();
  permissionsPopup: EventEmitter<any> = new EventEmitter<any>();
  messageModal: EventEmitter<any> = new EventEmitter<any>();
  resetGetConvo: EventEmitter<any> = new EventEmitter<any>();
  closeConferencePopup: EventEmitter<any> = new EventEmitter<any>();
  InvitePopupEmitter: EventEmitter<any> = new EventEmitter<any>();
  BrowseGroupEmitter: EventEmitter<any> = new EventEmitter<any>();
  unsentMessagesObject = {};
  revokeImagesArray = [];
  mutedStatusObject = {};
  expireBillingDetails;
  sendMessagePermission;
  groupAdminData = [];
  constructor(private api: ApiService, public commonService: CommonService, public commonApiService: CommonApiService) {
    this.listenPageVisibility();
  }

  updateDeviceToken(data) {
    const obj = {
      'url': 'user/updateDeviceToken',
      'type': 7,
      'body': data
    };
    return this.api.postOc(obj);
  }

  putUserDetails(data) {
    const obj = {
      'url': 'users/putUserDetails',
      'type': 1,
      'body': data
    };
    return this.api.postOc(obj);
  }

  listenPageVisibility() {
    // Set the name of the hidden property and the change event for visibility
    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document['msHidden'] !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof document['webkitHidden'] !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === 'undefined' || hidden === undefined) {
      console.log('Browser such as Google Chrome or Firefox supports the Page Visibility API.');
    } else {
      // Handle page visibility change
      document.addEventListener(visibilityChange, this.handleVisibilityChange.bind(this), false);
    }
  }
  handleVisibilityChange() {
    document[hidden] ? this.page_visibility = false : this.page_visibility = true;
    this.visibilityEvent.emit(this.page_visibility);
  }
  createNewWorkspace() {
    if (this.commonService.isWhitelabelled) {
      window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/spaces`);
    } else {
      window.open('https://' + environment.REDIRECT_PATH + '/spaces');
    }
  }

  compressImages(file) {
    return new Promise((resolve, reject) => {
      // tslint:disable-next-line:no-unused-expression
      new Compressor(file, {
        quality: 0.9,
        maxWidth: 1440,
        maxHeight: 900,
        strict: true,
        checkOrientation: true,
        convertSize: 1000000,
        success(result) {
          file = result;
          resolve(file);
        },
        error() {
          reject(file);
        }
      });
    });
  }
  getMembers(data) {
    const obj = {
      'url': 'chat/getGroupInfo',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  sortByNames(arr) {
    arr.sort((a, b) => {
      const nameA = a.full_name.toUpperCase();
      const nameB = b.full_name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
  }
  playNotificationSound(filename, loop) {
    document.getElementById('sound').innerHTML = '<audio id="sound-div" autoplay="autoplay">' +
      '<source src="' + filename + '.mp3" type="audio/mpeg" />' +
      '<source src="' + filename + '.ogg" type="audio/ogg" />' +
      '<embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3" /></audio>';
    const audio = <HTMLAudioElement>document.getElementById('sound-div');
    audio.loop = loop;
  }

  stopVideoCallRinger() {
    const sound = <HTMLAudioElement>document.getElementById('sound-div');
    if (sound) {
      sound.src = '';
    }
  }

}
