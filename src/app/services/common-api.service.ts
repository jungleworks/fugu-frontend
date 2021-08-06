import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {SessionService} from './session.service';
import {MessageService} from './message.service';
import {CommonService} from './common.service';
import {environment} from '../../environments/environment';

@Injectable()
export class CommonApiService {
  alive = true;
  whitelabelConfigurations = {};
  isWhitelabelled = false;

  constructor(
    private api: ApiService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private commonService: CommonService
  ) {
  }

  search(data) {
    const obj = {
      url: 'chat/groupChatSearch',
      type: 3,
      body: data
    };
    return this.api.getFugu(obj);
  }

  searchUsersInGroup(data) {
    const obj = {
      url: 'chat/userSearch',
      type: 3,
      body: data
    };
    return this.api.getFugu(obj);
  }

  searchUsersInInvite(data) {
    const obj = {
      url: '/chat/pendingAndAcceptedUserSearch',
      type: 3,
      body: data
    };
    return this.api.getFugu(obj);
  }

  getUserInfo(data) {
    const obj = {
      url: 'user/getUserInfo',
      type: 3,
      body: data
    };
    return this.api.getFugu(obj);
  }

  joinGroup(data) {
    const obj = {
      url: 'chat/join',
      type: 3,
      body: data
    };
    return this.api.postOc(obj);
  }

  leaveGroup(data) {
    const obj = {
      url: 'chat/leave',
      type: 3,
      body: data
    };
    return this.api.postOc(obj);
  }

  deleteGroup(data) {
    const obj = {
      url: 'chat/editInfo',
      type: 3,
      body: data
    };
    return this.api.postOc(obj);
  }

  loginViaAccessToken(data) {
    data.time_zone = this.commonService.getTimeZone();

    const obj = {
      url: 'user/v1/loginViaAccessToken',
      type: 5,
      body: data
    };
    return this.api.postOc(obj);
  }

  /**
   * Logout OfficeChat
   * @returns {Observable<any>}
   */
  logoutOcApi() {
    const obj = {
      url: 'user/userLogout',
      type: 7,
      body: {}
    };
    return this.api.postOc(obj);
  }

  /**
   * Logout Fugu
   * @param data
   * @returns {Observable<any>}
   */
  logoutFuguApi(data) {
    const obj = {
      url: 'users/userlogout',
      type: 3,
      body: data
    };
    return this.api.postOc(obj);
  }

  switchWorkspace(data) {
    const obj = {
      url: 'workspace/switchWorkspace',
      type: 6,
      body: data
    };
    return this.api.postOc(obj);
  }

  getInfo(data) {
    const obj = {
      url: 'users/getInfo',
      type: 3,
      body: data
    };
    return this.api.getFugu(obj);
  }

  editInfo(data) {
    const obj = {
      url: 'users/editInfo',
      type: 3,
      body: data
    };
    return this.api.postOc(obj);
  }

  getPublicInviteDetails(data) {
    if (window.location.hostname) {
      let url = window.location.hostname;
      if (url == 'localhost') {
        data.workspace = 'spaces';
      }
    }


    const obj = {
      url: 'workspace/getPublicInfo',
      type: 2,
      body: data
    };
    return this.api.getFugu(obj);
  }

  getWorkspaceDetails(data) {
    if (window.location.hostname) {
      let url = window.location.hostname;
      if (url == 'localhost') {
        data.workspace = 'spaces';
      }
    }

    const obj = {
      url: 'workspace/getWorkspaceDetails',
      type: 1,
      body: data
    };
    return this.api.getFugu(obj);
  }

  joinWorkspace(data) {
    const obj = {
      url: 'workspace/join',
      type: 7,
      body: data
    };
    return this.api.postOc(obj);
  }

  searchMessages(data) {
    const obj = {
      url: 'conversation/searchMessages',
      type: 3,
      body: data
    };
    return this.api.getFugu(obj);
  }

  getFuguToken(data, header) {
    const obj = {
      url: 'auth/getAccessToken',
      type: 3,
      body: data
    };
    return this.api.getFugu(obj, header);
  }

  getAuthorizeUrl(data) {
    const obj = {
      url: 'googleCalendar/getAuthorizeUrl',
      type: 1,
      body: data
    };
    return this.api.getFugu(obj);
  }

  assignTask(data, url) {
    // url: "task/assignTask",
    const obj = {
      url: url,
      type: 1,
      body: data
    };
    return this.api.postOc(obj);
  }

  submitTask(data, url) {
    // url: "task/assignTask",
    const obj = {

      url: url,
      type: 1,
      body: data
    };
    return this.api.postOc(obj);
  }

  viewTask(data) {
    const obj = {
      url: 'task/getAssignedTask',
      type: 1,
      body: data
    };
    return this.api.getFugu(obj);
  }

  getTaskDetails(data) {
    const obj = {
      url: 'task/getTaskDetails',
      type: 1,
      body: data
    };
    return this.api.getFugu(obj);
  }

  // ** Update business details for whitelabeling */
  updateWhitelabelDomain(domain) {
    this.whitelabelConfigurations['domain'] = domain;
  }

  // ** Update business details for whitelabeling */
  updateWhitelabelConfigutaions(data) {
    environment.BRANCH_KEY = data.branch_key;
    environment.REDIRECT_PATH = data.full_domain;
    environment.FUGU_CONFERENCE_URL = data.meet_url;
    this.whitelabelConfigurations['app_name'] = data.app_name;
    this.whitelabelConfigurations['branch_key'] = data.branch_key;
    this.whitelabelConfigurations['fav_icon'] = data.fav_icon;
    this.whitelabelConfigurations['logo'] = data.logo;
    this.whitelabelConfigurations['domain'] = data.domain;
    this.whitelabelConfigurations['full_domain'] = data.full_domain;
    this.whitelabelConfigurations['properties'] = data.properties;
    this.whitelabelConfigurations['colors'] = data.colors;
    this.whitelabelConfigurations['android_app_link'] = data.android_app_link;
    this.whitelabelConfigurations['ios_app_link'] = data.ios_app_link;
    this.isWhitelabelled = data.is_whitelabeled;
    this.api.isWhitelabelled = data.is_whitelabeled;
    this.api.whitelabelConfigurations = this.whitelabelConfigurations;
    document.title = this.whitelabelConfigurations['app_name'];
    const rootStyle = document.getElementsByTagName('html')[0].style;
    if (this.whitelabelConfigurations['colors'].theme_color) {
      rootStyle.setProperty(
        '--app-color',
        this.whitelabelConfigurations['colors'].theme_color
      );
    }
    if (this.whitelabelConfigurations['colors'].theme_color) {
      rootStyle.setProperty(
        '--app-button',
        this.whitelabelConfigurations['colors'].theme_color
      );
    }
    if (this.whitelabelConfigurations['colors'].theme_color_light) {
      rootStyle.setProperty(
        '--app-color-highlight',
        this.whitelabelConfigurations['colors'].theme_color_light
      );
    }
    if (this.whitelabelConfigurations['colors'].loader_color) {
      rootStyle.setProperty(
        '--loader-color',
        this.whitelabelConfigurations['colors'].loader_color
      );
    }
    if (this.whitelabelConfigurations['colors'].scroll_color) {
      rootStyle.setProperty(
        '--scroll-color',
        this.whitelabelConfigurations['colors'].scroll_color
      );
    }
    if (this.whitelabelConfigurations['colors'].header_color) {
      rootStyle.setProperty(
        '--header-color',
        this.whitelabelConfigurations['colors'].header_color
      );
    }
    if (this.whitelabelConfigurations['colors'].sender_chat_bubble_color) {
      rootStyle.setProperty(
        '--sender-chat-bubble-color',
        this.whitelabelConfigurations['colors'].sender_chat_bubble_color
      );
    }
    if (this.whitelabelConfigurations['colors'].icon_color) {
      rootStyle.setProperty(
        '--icon-color',
        this.whitelabelConfigurations['colors'].icon_color
      );
    }
    if (this.whitelabelConfigurations['colors'].date_divider_color) {
      rootStyle.setProperty(
        '--date-divider-color',
        this.whitelabelConfigurations['colors'].date_divider_color
      );
    }
    const link = document.querySelector('link[rel*="icon"]');
    link['href'] = this.whitelabelConfigurations['fav_icon'];
  }

  /**
   * Code to Logout the user, kept in common so that after 401 this can be called from anywhere.
   */
  logout(isRedirect?) {
    if (this.getCookieSubdomain('token')) {
      this.logoutOcApi().subscribe((response) => {
        if (response.statusCode === 200) {
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          if (!this.commonService.currentOpenSpace) {
            this.sessionService.removeAll();
            this.setSubDomainCookie([]);
            window.location.reload();
            return;
          }
          // this.logoutFugu();
          this.sessionService.removeAll();
          this.setSubDomainCookie([]);
          if (!isRedirect) {
            if (this.isWhitelabelled) {
              window.open(
                `https://${this.whitelabelConfigurations['full_domain']}/login`,
                '_self'
              );
            } else {
              window.open(environment.LOGOUT_REDIRECT, '_self');
            }
          }
        }
      });
    } else {
      this.sessionService.removeAll();
      this.setSubDomainCookie([]);
      window.location.reload();
    }
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

  setSubDomainCookie(array) {
    array = JSON.stringify(array);
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
      document.cookie = `token=${array};${expires};domain=${this.whitelabelConfigurations['domain']};path=/`;
    } else {
      if (environment.production) {
        document.cookie =
          'token=' + array + ';' + expires + ';domain=fugu.chat;path=/';
      } else {
        document.cookie =
          'token=' + array + ';' + expires + ';domain=localhost;path=/';
        document.cookie =
          'token=' + array + ';' + expires + ';domain=officechat.io;path=/';
      }
    }
  }

  inviteToConference(data) {
    const obj = {
      url: 'conversation/inviteToConference',
      type: 3,
      body: data
    };
    return this.api.postOc(obj);
  }

  joinLiveStream(data) {
    const obj = {
      url: 'stream/joinLiveStream',
      type: 3,
      body: data
    };
    return this.api.postOc(obj);
  }

  addEvent(data) {
    const obj = {
      url: 'googleCalendar/addEvent',
      type: 3,
      body: data
    };
    return this.api.postOc(obj);
  }
}
