import { Injectable } from '@angular/core';

import {ApiService} from '../../services/api.service';

@Injectable()
export class BroadcastMessageService {
  constructor(private api: ApiService) {
  }

  sendBroadcastMessage(data) {
    const obj = {
      'url': 'bot/publishMessageOnFuguBot',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
