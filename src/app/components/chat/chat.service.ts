import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {ApiService} from '../../services/api.service';
import {LayoutService} from '../layout/layout.service';
import {LoaderService} from '../../services/loader.service';
declare const twemoji: any;
declare var moment: any;
declare const navigator: any;

@Injectable()
export class ChatService {
  permission_messages = {
    'camera': {
      heading: 'Allow Camera',
      permission: 'To take photos, click “Allow” above to give us access to your computer\'s camera.',
      error_message: 'To take photos, we need access to your computer\'s camera. Click ' +
        'Camera icon in the URL bar and choose \n“Always allow to access your camera."'
    },
    'geolocation': {
      heading: 'Allow Location',
      permission: 'To fetch location, click “Allow” above to give us access to your computer\'s location.',
      error_message: 'To fetch location, we need access to your computer\'s location. Click ' +
        'Location icon in the URL bar and choose \n“Always allow to access your location."'
    }
  };
  constructor(private api: ApiService, private layoutService: LayoutService, private loaderService: LoaderService) {
  }

  getMembers(data) {

    const obj = {
      'url': 'chat/getGroupInfo',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  addChatMember(data) {
    const obj = {
      'url': 'chat/addMember',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  removeChatMember(data) {
    const obj = {
      'url': 'chat/removeMember',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  deleteMessage(data) {
    const obj = {
      'url': 'chat/deleteMessage',
      'type': 3,
      'body': data
    };
    return this.api.deleteFugu(obj);
  }
  editUserInfo(data) {
    const obj = {
      'url': 'user/editUserInfo',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getLatestThreadMessages(data) {
    const obj = {
      'url': 'conversation/getLatestThreadMessage',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  getStarredUsers(data) {
    const obj = {
      'url': 'conversation/getStarredMessages',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  getThreadedMessages(data) {
    const obj = {
      'url': 'conversation/getThreadMessages',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  getMessages(data): Observable<any> {
    const obj = {
      'url': 'conversation/getMessages',
      'type': 1,
      'body': data
    };
    return this.api.getFugu(obj);
  }

  uploadFile(formdata: FormData): Observable<any> {
    const obj = {
      'url': 'conversation/uploadFile',
      'type': 3,
      'body': formdata
    };
    return this.api.uploadFileFugu(obj);
  }

  editChannelInfo(data) {
    const obj = {
      'url': 'chat/editInfo',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  muteThread(data) {
    const obj = {
      'url': 'chat/changeFollowingStatus',
      'type': 3,
      'body': data
    };
    return this.api.putFugu(obj);
  }
  starredMessages(data) {
    const obj = {
      'url': 'conversation/starMessage',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getAllMembers(data) {

    const obj = {
      'url': 'workspace/getAllMembers',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  editMessage(data) {
    const obj = {
      'url': 'chat/editMessage',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  getAttendanceConfig(data) {
    const obj = {
      'url': 'conversation/getBotConfiguration',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }

  parseEmoji(message = '') {
    const parsed_string = twemoji.parse(message, {
      folder: 'emojis',
      base: 'https://files.fugu.chat/',
      attributes: (unicode, variant) => {
        return {
          'data-is-emoji': 'true',
          'data-plain-text': unicode
        };
      },
      ext: '.svg',
    });
    const temp = document.createElement('span');
    temp.innerHTML = parsed_string;
    const emojiArray = [];
    for (let i = 0; i < temp.children.length; i++) {
      const element = temp.children[i];
      if (element.classList.contains('emoji')) {
        emojiArray.push({
          html: element.outerHTML.replace('/>', '>'),
          emoji: element['alt']
        });
      }
    }
    return {
      parsedString: parsed_string,
      emojiArray: emojiArray
    };
  }

  getDateRange(message) {
    if (message.includes('tomorrow')) {
      const today = moment();
      const tomorrow = moment(today).add(1, 'days');
      return {
        dates: [tomorrow],
        isInvalid: false
      };
    }
    const regex = /(\d+(\.|-|\/)\d+(\.|-|\/)\d)|(\d+(\.|-|\/)\d+)/gm;
    const str = message;
    let matchCount = 0;
    const dateObj = {
      dates: [],
      isInvalid: false
    };
    let m;
    while ((m = regex.exec(str)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      matchCount++;
      if (matchCount > 2) {
        dateObj.isInvalid = true;
        dateObj.dates = [];
        dateObj.dates.push(new Date());
        return dateObj;
      }
      const unparsedDate = m[0];
      let monthDate = [];
      if (unparsedDate.includes('.')) {
        monthDate = unparsedDate.split('.');
      } else if (unparsedDate.includes('/')) {
        monthDate = unparsedDate.split('/');
      } else if (unparsedDate.includes('-')) {
        monthDate = unparsedDate.split('-');
      }
      const now = new Date();
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth() + 1;
      const leaveDate = monthDate[0];
      const leaveMonth = monthDate[1];
      const leaveDateObj = moment().set('month', leaveMonth - 1).set('date', leaveDate);
      const temp = new Date(leaveDateObj);
      if (temp instanceof Date && !isNaN(temp.getTime())) {
        if (nowMonth == 1 && leaveMonth == 12) {
          temp.setFullYear(nowYear - 1);
        } else {
          temp.setFullYear(nowYear);
        }
        if (temp.getTime() < now.getTime()) {
          // Two cases are possible
          // 1. he is applying leave for a day in past
          // 2. he is applying for leave in next year
          // consider case 1 if leaveDate is within 1 month from 		today
          // else consider case 2
          if (moment(now).diff(moment(temp), 'months') < 1) {
            if (nowMonth == 1 && leaveMonth == 12) {
              leaveDateObj.set('year', nowYear - 1);
            } else {
              leaveDateObj.set('year', nowYear);
            }
          } else {
            if (nowMonth == 1 && leaveMonth == 12) {
              leaveDateObj.set('year', nowYear);
            } else {
              leaveDateObj.set('year', nowYear + 1);
            }
          }
        } else {
          // applying for leave for someday in future in same year
          leaveDateObj.set('year', nowYear);
        }
        dateObj.dates.push(new Date(leaveDateObj));
      } else {
        dateObj.isInvalid = true;
        dateObj.dates = [];
        dateObj.dates.push(new Date());
        return dateObj;
      }
    }
    return dateObj;
  }

  attendanceVerification(data) {
    const obj = {
      'url': 'attendance/verifyAttendanceCredentials',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  uploadSelfie(data) {
    const obj = {
      'url': 'attendance/uploadDefaultImage',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  getGeoLocation() {
    if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        if ('permissions' in navigator && 'query' in navigator['permissions']) {
          this.queryPermissions('geolocation');
        }
        navigator.geolocation.getCurrentPosition((position) => {
          resolve(position.coords);
        }, (error) => {
          resolve(undefined);
          this.layoutService.permissionsPopup.emit({
            is_open: false
          });
          const content_obj = {
            heading: '',
            description: ''
          };
          switch (error.code) {
            case 1:
              content_obj.heading = this.permission_messages['geolocation'].heading;
              content_obj.description = this.permission_messages['geolocation'].error_message;
              break;
            case 2:
              content_obj.heading = 'Location Fetching Error';
              content_obj.description = error.message + ' Please try punching in from mobile apps.';
              break;
            case 3:
              content_obj.heading = 'Timeout Error';
              content_obj.description = error.message + ' Please try punching in from mobile apps.';
              break;
          }
          this.layoutService.messageModal.emit({
            is_open: true,
            content: {
              heading: content_obj.heading,
              description: content_obj.description
            }
          });
        }, {timeout: 10000});
      });
    } else {
      /* geolocation IS NOT available */
    }
  }

  queryPermissions(permission) {
    navigator.permissions.query({name: permission.toLowerCase()})
      .then((permissionStatus) => {
        switch (permissionStatus.state) {
          case 'prompt':
            this.loaderService.hide();
            this.layoutService.permissionsPopup.emit({
              is_open: true,
              content: {
                heading: this.permission_messages[permission].heading,
                description: this.permission_messages[permission].permission
              }
            });
            break;
        }

        permissionStatus.onchange = () => {
          this.layoutService.permissionsPopup.emit({
            is_open: false,
            content: {
              heading: this.permission_messages[permission].heading,
              description: this.permission_messages[permission].permission
            }
          });
          switch (permissionStatus.state) {
            case 'denied':
              this.layoutService.messageModal.emit({
                is_open: true,
                content: {
                  heading: this.permission_messages[permission].heading,
                  description: this.permission_messages[permission].error_message
                }
              });
          }
        };
      });
  }


}
