import { Injectable } from '@angular/core';

import {ApiService} from '../../services/api.service';

@Injectable()
export class CreateGroupService {
  constructor(private api: ApiService) {
  }

  getAllMembers(data) {
    const obj = {
      'url': 'workspace/getAllMembers',
      'type': 3,
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
}
