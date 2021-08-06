import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
@Injectable()
export class MessageReadService {
  constructor(private api: ApiService) {
  }
  getReadUsers(data) {
    const obj = {
      'url': 'chat/getMessageSeenBy',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
}
