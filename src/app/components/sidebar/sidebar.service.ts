import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {ApiService} from '../../services/api.service';

@Injectable()
export class SidebarService {
  constructor(private api: ApiService) {
  }

  getConverSations(data) {
    const obj = {
      'url': 'conversation/getConversations',
      'type': 1,
      'body': data
    };
    return this.api.getFugu(obj);
  }

  createGroupChat(data) {
    const obj = {
      'url': 'chat/createGroupChat',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  editUserInfo(data) {
    const obj = {
      'url': 'user/editUserInfo',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  clearChatHistory(data) {
    const obj = {
      'url': 'chat/clearChatHistory',
      'type': 3,
      'body': data
    };
    return this.api.deleteFugu(obj);
  }
  createConversation(data): Observable<any> {
    const obj = {
      'url': 'chat/createOneToOneChat',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  phoneOtpRequest(data) {
    const obj = {
      'url': 'user/changeContactNumberRequest',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  otpSubmitRequest(data) {
    const obj = {
      'url': 'user/changeContactNumber',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  pinChat(data) {
    const obj = {
      'url': 'conversation/updateStatus',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getChannelInfo(data) {
    const obj = {
      'url': 'chat/getChannelInfo',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
}
