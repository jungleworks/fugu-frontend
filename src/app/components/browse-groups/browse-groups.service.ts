import { Injectable } from '@angular/core';

import {ApiService} from '../../services/api.service';

@Injectable()
export class BrowseGroupsService {
  constructor(private api: ApiService) {
  }

  getGroups(data) {
    const obj = {
      'url': 'chat/getChatGroups',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
}
