import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
@Injectable()
export class StarredMessagesService {
  constructor(private api: ApiService) {
  }
  getStarredUsers(data) {
    const obj = {
      'url': 'conversation/getStarredMessages',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  unstarMessage(data) {
    const obj = {
      'url': 'conversation/starMessage',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
}

}
