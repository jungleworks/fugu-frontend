import { Injectable } from '@angular/core';

import {ApiService} from '../../services/api.service';

@Injectable()
export class HeaderService {
  constructor(private api: ApiService) { }

  submitUserRights(data) {
    const obj = {
      'url': 'user/submitGdprQuery',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  leaveOpenSpace(data) {
    const obj = {
      'url': 'workspace/leave',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getNotifications(data) {
    const obj = {
      'url': 'notification/getNotifications',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  markAllAsRead(data) {
    const obj = {
      'url': 'notification/markReadAll',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
