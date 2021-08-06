import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Injectable()
export class InviteInputFieldService {

  constructor(private api: ApiService) { }

  getContacts(data) {
    const obj = {
      'url': 'user/getUserContacts',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
}
