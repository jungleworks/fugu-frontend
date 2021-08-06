import { Injectable } from '@angular/core';

import {ApiService} from '../../services/api.service';

@Injectable()
export class ConferencingPopupService {
  constructor(private api: ApiService) {
  }

  inviteToConference(data) {
    const obj = {
      'url': 'conversation/inviteToConference',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
