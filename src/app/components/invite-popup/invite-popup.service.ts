import { Injectable } from '@angular/core';
import {ApiService} from '../../services/api.service';

@Injectable()
export class InvitePopupService {

  constructor(private api:  ApiService) { }

  inviteViaEmail(data) {
    const obj = {
      'url': 'user/inviteUser',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getContacts(data) {
    const obj = {
      'url': 'user/getUserContacts',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
}
