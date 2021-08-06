import {Observable} from 'rxjs';
import {Injectable, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {ApiService} from './api.service';
import {environment} from '../../environments/environment';
import {MessageExtension, SignupMode} from '../enums/app.enums';
import {SessionService} from './session.service';
import {MessageService} from './message.service';
import {isArray} from 'util';
import {LocalStorageService} from './localStorage.service';

interface UserDetails {
  user_id: number;
  email: string;
  en_user_id: string;
  user_unique_key: string;
  user_channel: string;
  full_name: string;
  business_name: string;
  app_secret_key: string;
  is_conferencing_enabled: number;
}

interface ISpaceUnreadData {
  workspace: string,
  count: number
}

declare const moment: any;

@Injectable()
export class CommonService implements OnDestroy {
  alive = true;
  userDetails: UserDetails = <UserDetails>{};
  channelMedia = {};
  conversations = {};
  showExpiredPopup = false;
  web_worker_object: Worker;
  putUserDetail: EventEmitter<any> = new EventEmitter<any>();
  oldVersionAppEmitter: EventEmitter<any> = new EventEmitter<any>();
  slowInternetConnection: EventEmitter<any> = new EventEmitter<any>();
  channelImageEmitter: EventEmitter<any> = new EventEmitter<any>();
  spaceDataEmitter: EventEmitter<any> = new EventEmitter<any>();
  changeDetectEmittter: EventEmitter<any> = new EventEmitter<any>();
  createGroupEmitter: EventEmitter<any> = new EventEmitter<any>();
  showWorkspacesEmitter: EventEmitter<any> = new EventEmitter<any>();
  usersInvitedEmitter: EventEmitter<any> = new EventEmitter<any>();
  searchMessageEmitter: EventEmitter<any> = new EventEmitter<any>();
  openInvitePopup: EventEmitter<any> = new EventEmitter<any>();
  chatTypeUpdated: EventEmitter<any> = new EventEmitter<any>();
  groupAdminUpdated: EventEmitter<any> = new EventEmitter<any>();
  whiteLabelEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  otherSpaceNotificationEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  closeWorkspaceEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  setUnreadCountOfSpace: EventEmitter<ISpaceUnreadData> = new EventEmitter<ISpaceUnreadData>();
  switchSpaceEmitter: EventEmitter<any> = new EventEmitter<any>();
  updateHeaderEmitter: EventEmitter<any> = new EventEmitter<any>();
  jumpToSearch: EventEmitter<any> = new EventEmitter<any>();
  markAllReadEmitter: EventEmitter<any> = new EventEmitter<any>();
  scheduleMeetingClose: EventEmitter<any> = new EventEmitter<any>();
  scheduleMeetingDone: EventEmitter<any> = new EventEmitter<any>();
  openTaskPopUp: EventEmitter<any> = new EventEmitter<any>();
  newUserAddedToGroup: EventEmitter<any> = new EventEmitter<any>();
  NewAddedUserUpdatedData: EventEmitter<any> = new EventEmitter<any>();
  meetDetailsPopup: EventEmitter<any> = new EventEmitter<any>();

  google_client_id;
  snoozeArray = [];
  calendarLinked = false;
  notification_snooze_time;
  showAppDetails = false;
  show_meet_tab = 0;
  isMac;
  usersInChannels = [];
  isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
    navigator.userAgent
  );
  isAndroid = /android/i.test(navigator.userAgent);
  isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  browserChecks = {
    isChrome:
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
    // isWebkit: ('WebkitAppearance' in document.documentElement.style),
    isFirefox: /firefox/.test(navigator.userAgent.toLowerCase()),
    isWebkit: navigator.userAgent.search(/webkit/i) >= 0,
    isEdge: '-ms-accelerator' in document.documentElement.style
  };
  isOldFlow = false;
  public MessageExtensionEnum = MessageExtension;
  supportedFileExtensions = {
    image: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    file: [
      'pdf',
      'csv',
      'txt',
      'xls',
      'xlsx',
      'doc',
      'docx',
      'ppt',
      'pptx',
      'zip',
      '7z',
      'xlsm',
      'js',
      'ods',
      'odp',
      'odt'
    ],
    video: [
      'webm',
      'ogg',
      '3gp',
      'mp4',
      'mpeg',
      'mpg',
      'mts',
      'avi',
      'mov',
      'flv',
      'wmv',
      'mkv'
    ],
    // tslint:disable-next-line:max-line-length
    audio: [
      '3gp',
      'mp3',
      'midi',
      'mpeg',
      'x-aiff',
      'mpeg',
      'x-wav',
      'webm',
      'ogg',
      'm4a',
      'wav'
    ]
  };
  msgEditMode = false;
  whitelabelConfigurations = {};
  isWhitelabelled = false;
  showWorkspaces = false;
  notifications_menu_open = false;
  showThemesPopup = false;
  showUnreadDot = false;
  inviteBilling = false;
  paymentUrl = '';

  current_domain = window.location.hostname.split('.').splice(1, 2).join('.');
  signupMode = SignupMode.BOTH;
  external_perm_options = {
    is_one_to_one_chat_allowed: true,
    is_create_group_allowed: true,
    suspend_call: false
  };
  isInvalidWorkspace;
  urlToRedirect;
  domainDictionary = {};
  userDetailDict = {};
  secretKeyDictionary = {};
  channelStatus;
  // showMoveNewPopup = false;
  getConversationPending: boolean = false;
  private _currentOpenSpace;
  showOtherWSCallPopup: boolean = false;
  showUnreadCount: boolean = false;
  showSearchingText: boolean = false;
  openMeetProfile: boolean = false;
  currentTheme = {
    sidebar: 0,
    bubble: 0
  };
  noGroupImgURL: string =
    'https://fuguchat.s3.ap-south-1.amazonaws.com/default/WwX5qYGSEb_1518441286074.png';

  themesArr = [
    {
      name: 'Oxford Blue',
      class: 'theme-oxford-blue',
      src: 'assets/img/theme-icon.png',
      theme_id: 0,
      color: '#2f3e4d'
    },
    {
      name: 'White',
      class: 'theme-white',
      src: 'assets/img/theme-icon.png',
      theme_id: 1,
      color: '#fffff'
    },
    {
      name: 'Bleached Cedar',
      class: 'theme-bleached-cedar',
      src: 'assets/img/theme-icon.png',
      theme_id: 2,
      color: '#2c2035'
    },
    {
      name: 'Outer Space',
      class: 'theme-outer-space',
      src: 'assets/img/theme-icon.png',
      theme_id: 3,
      color: '#1a2120'
    },
    {
      name: 'Wood Smoke',
      class: 'theme-wood-smoke',
      src: 'assets/img/theme-icon.png',
      theme_id: 4,
      color: '#131517'
    },
    {
      name: 'Catskill White',
      class: 'theme-catskill-white',
      src: 'assets/img/theme-icon.png',
      theme_id: 5,
      color: '#F0F4F8'
    },
    {
      name: 'Dark',
      class: 'theme-dark',
      src: 'assets/img/theme-icon.png',
      theme_id: 6,
      color: '#000'
    },
    {
      name: 'Rainbow',
      class: 'theme-rainbow',
      src: 'assets/img/theme-icon.png',
      theme_id: 7,
      color: '#a67bc6'
    },
    {
      name: 'Curvy Light',
      class: 'theme-white-fb',
      src: 'assets/img/theme-icon.png',
      theme_id: 8,
      color: '#fffff'
    }
  ];

  bubbleArr = [
    {
      name: 'Dark',
      color: '#2e4776',
      class: 'dark',
      id: 0
    },
    {
      name: 'Classic',
      color: '#00c8fe',
      class: 'classic',
      id: 1
    },
    {
      name: 'Night',
      color: '#2c2432',
      class: 'night',
      id: 2
    },
    {
      name: 'Sunset',
      color: '#eda34e',
      class: 'sunset',
      id: 3
    },
    {
      name: 'Blush',
      color: '#f18372',
      class: 'blush',
      id: 4
    },
    {
      name: 'Arctic',
      color: '#e7f9ff',
      class: 'arctic',
      id: 5
    },
    {
      name: 'Greeny',
      color: '#3DBC79',
      class: 'greeny',
      id: 6
    },
    {
      name: 'Bluey',
      color: '#6B91D8',
      class: 'bluey',
      id: 7
    },
    {
      name: 'Blacky',
      color: '#000',
      class: 'blacky',
      id: 8
    }
  ];

  IsLocalhost() {
    return window.location.hostname == 'localhost';
  }

  set currentOpenSpace(space) {
    if (space) {
      this._currentOpenSpace = space;
    }
  }

  get currentOpenSpace() {
    return this._currentOpenSpace;
  }

  constructor(
    private sessionService: SessionService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService
  ) {
    this.checkSlowConnection();
    if (this.currentOpenSpace) {
      this.showExpiredPopupInSpace(this.currentOpenSpace);
    }
  }

  showExpiredPopupInSpace(data) {
    if (data.workspace_status == 'EXPIRED') {
      this.showExpiredPopup = true;
    }
  }

  checkSlowConnection() {
    if (navigator['connection']) {
      if (
        navigator['connection'].downlink < 1 ||
        ['2g', 'slow-2g'].includes(navigator['connection'].effectiveType)
      ) {
        this.slowInternetConnection.emit(true);
      }
      navigator['connection'].addEventListener('change', (event) => {
        if (
          (event.currentTarget.downlink < 1 &&
            event.currentTarget.downlink != 0) ||
          ['2g', 'slow-2g'].includes(navigator['connection'].effectiveType)
        ) {
          this.slowInternetConnection.emit(true);
        } else {
          this.slowInternetConnection.emit(false);
        }
      });
    }
  }

  initWebWorker() {
    this.web_worker_object = new Worker('../web-worker.js');
  }

  getErrorMessage(control) {
    for (const propertyName in control.errors) {
      if (
        control.errors.hasOwnProperty(propertyName) &&
        control.touched &&
        control.value
      ) {
        return true;
      }
    }
    return false;
  }

  public updateUserDetails(data) {
    this.userDetails.full_name = data.full_name;
    this.userDetails.user_channel = data.user_channel;
    this.userDetails.user_id = data.user_id;
    this.userDetails.user_unique_key = data.user_unique_key;
    this.userDetails.en_user_id = data.en_user_id;
    this.userDetails.app_secret_key = data.app_secret_key;
    this.userDetails.is_conferencing_enabled = data.is_conferencing_enabled;
    this.setNameCookie(this.userDetails.full_name.split(' ')[0]);
    this.setImageCookie(data.user_image);
    this.setUserDetailSpaceDict(data);
    // this.sessionService.set('user_details', data);
    this.putUserDetail.emit(data.workspace);
  }

  setUserDetailSpaceDict(data) {
    this.userDetailDict[data.workspace] = data;
    let userDetailsAll;
    if (this.sessionService.get('user_details_dict')) {
      userDetailsAll = this.sessionService.get('user_details_dict');
    }
    const user_details_dict = {...userDetailsAll, ...this.userDetailDict};
    this.sessionService.set('user_details_dict', user_details_dict);
  }

  createAppSecretKeyDictionary(domain) {
    this.secretKeyDictionary = {};
    if (domain && domain.length) {
      domain.forEach((item) => {
        this.secretKeyDictionary[item.fugu_secret_key] = item;
      });
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }

  putUserDetails() {
    this.putUserDetail.emit();
  }

  sendChannelImage(url) {
    this.channelImageEmitter.emit(url);
  }

  spaceDataEmit() {
    this.spaceDataEmitter.emit();
  }

  changeDetectEmit() {
    this.changeDetectEmittter.emit();
  }

  generateRandomString() {
    const charsNumbers = '0123456789';
    const charsLower = 'abcdefghijklmnopqrstuvwxyz';
    const charsUpper = charsLower.toUpperCase();
    let chars;

    chars = charsNumbers + charsLower + charsUpper;

    const length = 10;

    let string = '';
    for (let i = 0; i < length; i++) {
      let randomNumber = Math.floor(Math.random() * 32) + 1;
      randomNumber = randomNumber || 1;
      string += chars.substring(randomNumber - 1, randomNumber);
    }
    return string + '.' + new Date().getTime();
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
      c
    ) {
      // tslint:disable-next-line:no-bitwise
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
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

  setNameCookie(name) {
    name = JSON.stringify(name);
    const d = new Date();
    d.setTime(d.getTime() + 100 * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    if (
      !(
        window.location.hostname.includes('fugu.chat') ||
        window.location.hostname.includes('officechat.io') ||
        window.location.hostname.includes('localhost')
      )
    ) {
      document.cookie = `user_name=${name};${expires};domain=${this.whitelabelConfigurations['domain']};path=/`;
    } else {
      if (environment.production) {
        document.cookie =
          'user_name=' + name + ';' + expires + ';domain=fugu.chat;path=/';
      } else {
        document.cookie =
          'user_name=' + name + ';' + expires + ';domain=localhost;path=/';
        document.cookie =
          'user_name=' + name + ';' + expires + ';domain=officechat.io;path=/';
      }
    }
  }

  setImageCookie(name) {
    name = JSON.stringify(name);
    const d = new Date();
    d.setTime(d.getTime() + 100 * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    if (
      !(
        window.location.hostname.includes('fugu.chat') ||
        window.location.hostname.includes('officechat.io') ||
        window.location.hostname.includes('localhost')
      )
    ) {
      document.cookie = `user_image=${name};${expires};domain=${this.whitelabelConfigurations['domain']};path=/`;
    } else {
      if (environment.production) {
        document.cookie =
          'user_image=' + name + ';' + expires + ';domain=fugu.chat;path=/';
      } else {
        document.cookie =
          'user_image=' + name + ';' + expires + ';domain=localhost;path=/';
        document.cookie =
          'user_image=' + name + ';' + expires + ';domain=officechat.io;path=/';
      }
    }
  }

  /**
   * to delete a cookie, we set it's date in the past.
   * @param name
   */
  deleteCookie(name) {
    document.cookie =
      name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=fugu.chat;path=/';
  }

  checkMimeType(file_name) {
    try {
      const split_array = file_name.split('.');
      const extension = split_array[split_array.length - 1];
      for (const key in this.supportedFileExtensions) {
        if (
          this.supportedFileExtensions[key].indexOf(extension.toLowerCase()) >
          -1
        ) {
          return key;
        }
      }
      return 'image'; // temporary fix until we move mime type logic to backend, fix for ios no extension images
    } catch (e) {
      return 'image'; // temporary fix until we move mime type logic to backend, fix for ios no extension images
    }
  }

  checkFileExtension(file_name) {
    try {
      const split_array = file_name.split('.');
      return split_array[split_array.length - 1].toLowerCase();
    } catch (e) {
    }
  }

  emailValidator(email) {
    const regex = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return regex.test(String(email).toLowerCase());
  }

  checkSingleEmoji(string) {
    const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return string.replace(regex, '').length == 0;
  }

  convertGetRequestParams(data) {
    let str = '';
    // tslint:disable-next-line:forin
    for (const key in data) {
      if (str == '') {
        str += '?';
      }
      if (data[key]) {
        if (typeof data[key] === 'object' || isArray(data[key])) {
          str += key + '=' + JSON.stringify(data[key]) + '&';
        } else {
          str += key + '=' + encodeURIComponent(data[key]) + '&';
        }
      }
    }
    return str.substring(0, str.length - 1);
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

  convertMarkdownText(message, isReturnEmpty?) {
    const bold = /(\B\*)([\s\S]*?)(\*( |&nbsp;))/gm;
    const italic = /(\b\_)([\s\S]*?)(\_( |&nbsp;))/gm;
    const italicBold = /(\_\*)([\s\S]*?)(\*\_( |&nbsp;))/gm;
    const boldItalic = /(\*\_)([\s\S]*?)(\_\*( |&nbsp;))/gm;
    let text = message + ' ';
    // text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/<br>/g, ' \n');
    text = text.replace(/\n/g, ' \n');
    text = text.replace(/<\/span>/g, '&nbsp;</span>');
    let parsedText;
    parsedText = text.replace(italicBold, (str, offset, s) => {
      if (s == s.trim() && s.trim().length > 0) {
        if (isReturnEmpty) {
          return '' + s + ' ';
        } else {
          return (
            '<span class="TitilliumWeb-bold"><i>' + s + '</i></span>&nbsp;'
          );
        }
      } else {
        return str;
      }
    });
    parsedText = parsedText.replace(boldItalic, (str, offset, s) => {
      if (s == s.trim() && s.trim().length > 0) {
        if (isReturnEmpty) {
          return '' + s + ' ';
        } else {
          return (
            '<i><span class="TitilliumWeb-bold">' + s + '</span></i>&nbsp;'
          );
        }
      } else {
        return str;
      }
    });
    parsedText = parsedText.replace(bold, (str, offset, s) => {
      if (s == s.trim() && s.trim().length > 0) {
        if (isReturnEmpty) {
          return '' + s + ' ';
        } else {
          return '<span class="TitilliumWeb-bold">' + s + '</span>&nbsp;';
        }
      } else {
        return str;
      }
    });
    parsedText = parsedText.replace(italic, (str, offset, s) => {
      if (s == s.trim() && s.trim().length > 0) {
        if (isReturnEmpty) {
          return '' + s + ' ';
        } else {
          return '<i>' + s + '</i>&nbsp;';
        }
      } else {
        return str;
      }
    });
    return parsedText.trim();
  }

  createDateReminderDict() {
    let dateDict = {};
    if (this.localStorageService.get('dateRemDict')) {
      dateDict = this.localStorageService.get('dateRemDict');
    }
    dateDict[
      window.location.pathname.split('/')[1]
      ] = new Date().toISOString().split('T')[0];
    this.localStorageService.set('dateRemDict', dateDict);
  }

  createDomainDictionary(domain) {
    this.domainDictionary = {};
    if (domain && domain.length) {
      domain.forEach((item) => {
        this.domainDictionary[item.workspace] = item;
      });
    } else {
      this.domainDictionary = {};
    }
    this.sessionService.set('spaceDictionary', this.domainDictionary);
  }

  insertGoogleScript() {
    return new Promise((resolve, reject) => {
      if (!document.getElementById('googleSignup')) {
        const url = 'https://apis.google.com/js/platform.js';
        const script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', url);
        script.setAttribute('id', 'googleSignup');
        script.onload = () => {
          resolve(true);
        };
        document.head.appendChild(script);
      } else {
        resolve(true);
      }
    });
  }

  insertSecondGoogleScript() {
    return new Promise((resolve, reject) => {
      if (!document.getElementById('googleSignup2')) {
        const url = 'https://apis.google.com/js/api.js';
        const script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', url);
        script.setAttribute('id', 'googleSignup2');
        script.onload = () => {
          resolve(true);
        };
        document.head.appendChild(script);
      } else {
        resolve(true);
      }
    });
  }

  dataURLtoFile(dataurl, filename) {
    /**convert a base64 image back to input file format*/
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type: mime});
  }

  blobtoFile(theBlob, fileName) {
    /**convert a blob back to input file format*/
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  }

  getImageUrlToCrop(file) {
    return new Promise((resolve, reject) => {
      // FileReader support
      if (FileReader && file.length) {
        const fr = new FileReader();
        fr.onload = () => {
          return fr.result;
        };
        fr.readAsDataURL(file[0]);
      }
    });
  }

  updateTheme(theme) {
    /* function to update the class of theme */
    // let classes: any = document.documentElement.classList;
    // classes.forEach(function(value, key, listObj) {
    //   if (
    //     value != "overflow-hidden" &&
    //     !document.documentElement.classList.contains(theme)
    //   ) {
    //     document.documentElement.classList.remove(value);
    //   }
    // }, "arg");
    // document.documentElement.classList.add(theme);
    let classes = [];
    this.themesArr.map((item) => {
      classes.push(item.class);
    });
    this.checkClassDocument(classes, theme);
  }

  // updateBubbleTheme(theme) {
  //   /* function to update the class of theme */
  //   let classes = [];
  //   this.bubbleArr.map(item => {
  //     classes.push(item.class);
  //   });
  //   this.checkClassDocument(classes, theme)
  // }

  checkClassDocument(arr, theme) {
    arr.forEach(function (value, key, listObj) {
      if (
        value != 'overflow-hidden' &&
        !document.documentElement.classList.contains(theme)
      ) {
        document.documentElement.classList.remove(value);
      }
    }, 'arg');
    document.documentElement.classList.add(theme);
  }

  getCurrentTheme() {
    const theme: any = this.sessionService.get('theme');
    if (!this.currentTheme.sidebar && theme) {
      this.currentTheme.sidebar = theme.sidebar;
    }
    // if (!this.currentTheme?.bubble) {
    //   this.currentTheme.bubble = theme.bubble;
    // }
    if (this.currentTheme?.sidebar) {
      const currentThemeClass = this.themesArr.find((item) => {
        return item.theme_id === this.currentTheme.sidebar;
      });
      this.updateTheme(currentThemeClass.class);
    } else {
      this.updateTheme('theme-oxford-blue');
    }
    // if (this.currentTheme?.bubble) {
    //   const currentBubbleClass = this.bubbleArr.find(item => {
    //     return item.id === this.currentTheme.bubble;
    //   });
    //   this.updateBubbleTheme(currentBubbleClass.class);
    // } else {
    //   this.updateBubbleTheme("classic");
    // }
  }

  calculateFileSize(size) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (
      (!size && '0 Bytes') ||
      (size / Math.pow(1024, i)).toFixed(2) +
      ' ' +
      ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][i]
    );
  }

  findSignupText() {
    switch (this.signupMode) {
      case SignupMode.BOTH:
        return 'Email or Phone Number';
      case SignupMode.EMAIL:
        return 'Email';
      case SignupMode.PHONE:
        return 'Phone Number';
    }
  }

  changeS3Url(url) {
    const changed = url.replace('fchat.s3.ap-south-1.amazonaws.com', 's3.fugu.chat');
    return changed;
  }

  getCombinedUTCTimeReplace(date, time) {
    let formatted = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss a').format();
    let changedMoment = moment.utc(moment(formatted)).format();
    return changedMoment;
    // return changedMoment.replace('00Z', '99.999Z');
  }

  getCombinedUTCTime(date, time) {
    let formatted = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss a').format();
    let changedMoment = moment.utc(moment(formatted)).format();
    return changedMoment;
  }

  getUTCFromDateForLeave(date) {
    // 2020-09-10T14:00:00.000Z'
    const formatted = moment(moment(date).startOf('day')).subtract(this.getTimeZone(), 'minutes').format('YYYY-MM-DD[T]HH:mm:SS.SSS[Z]');
    // formatted = new Date(formatted).toISOString();
    return formatted;
    // // formatted.setMinutes(formatted.getMinutes() + formatted.getTimezoneOffset());
    // let str  = formatted.toISOString();
    // return str;
    //

    // let startDate =

    //
    // let formatted =  this.adjustForTimezone(startDate);
    // return formatted;

    // let sendDate = moment(date).startOf('day').add(this.getTimeZone()).toISOString();
    // let formatted = moment(moment(`${new Date(date)}`, 'ddd MMM DD').startOf('day')).subtract(this.getTimeZone(), 'minutes').toISOString();
    // return formatted;

    // return changedMoment.replace('Z', '.000Z');

    // 2020-09-10T14:00:00.000Z'

    // // let sendDate = moment(date).startOf('day').add(this.getTimeZone()).toISOString();
    // let formatted = moment(`${new Date(date)}`, 'ddd MMM DD HH:mm:ss a').startOf('day');
    // let changedMoment = moment.utc(moment(formatted)).toISOString();
    // return changedMoment;
    // // return changedMoment.replace('Z', '.000Z');
    //
    // // 2020-09-10T14:00:00.000Z'
  }

//   getUTCFromDate(date) {
//
//
//     // local test
//     // let afterMoment = moment(`${new Date(date)}`, 'ddd MMM DD HH:mm:ss a').format();
//     // return afterMoment;
//     //
//     let formatted = moment(`${new Date(date)}`, 'ddd MMM DD HH:mm:ss a').startOf('day');
//     let changedMoment = moment.utc(moment(formatted)).format();
//     return changedMoment.replace('Z', '.000Z');
//
// // return '2020-09-10T14:00:00.000Z'
//
//     // let formatted = moment(`${date}`, 'YYYY-MM-DD hh:mm a').format();
//     // let momentDate = moment(formatted).format();
//     // let momentDate = moment.utc(formatted).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
//     // momentDate.replace('Z', '00.000Zwwqw');
//     // return '2020-10-10T18:30:00.000Z'
//     // return momentDate;
//   }

  // "leave_start_date":"2020-09-05T18:30:00.000Z" for date

  getCurrentTimeLeave() {
    // const formatted = moment(moment(new Date()).startOf('day')).subtract(this.getTimeZone(), 'minutes').format('YYYY-MM-DD[T]HH:mm:SS.SSS[Z]');
    // return formatted;
    //

    let changedMoment = moment(moment(new Date())).format('YYYY-MM-DD[T]HH:mm:SS.SSS[Z]');
    //
    return changedMoment.replace('Z', '.000Z');
  }

  getCurrentUtcReplace() {
    const formatted = moment(moment(new Date()).startOf('day')).subtract(this.getTimeZone(), 'minutes').format('YYYY-MM-DD[T]HH:mm:SS.SSS[Z]');
    return formatted;

    //
    // let changedMoment = moment.utc(moment(new Date())).format();
    //
    // return changedMoment.replace('Z', '.000Z');
  }

  getCurrentUtc() {
    return moment.utc(moment(new Date())).format();
  }

  combineDates(date, time) {
    return moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss a').format();
  }

  showError(msg) {
    this.messageService.sendAlert({type: 'error', msg: msg, timeout: 2000});
  }

  showSuccess(msg) {
    this.messageService.sendAlert({type: 'error', msg: msg, timeout: 2000});
  }

  getTimeZone() {
    const d = new Date();
    return -1 * (d.getTimezoneOffset());
  }

  getDomainName(){
    let url = window.location.hostname;
    if (url) {
      // let domain = url.split('.').splice(1, 2).join('.');
      let domain = url.replace(url.substr(0, url.indexOf(".") + 1), "")
      if (url == 'localhost') {
        url = environment.LOCAL_DOMAIN;
        domain = url;
      }
      return domain;
    }
  }

}
