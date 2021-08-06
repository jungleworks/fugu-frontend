import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Injectable()
export class GuestFieldsPopupService {

  constructor(private api: ApiService) { }

  inviteGuests(data) {
    const obj = {
      'url': 'user/inviteUser',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  updateGuests(data) {
    const obj = {
      'url': 'chat/updateGuest',
      'type': 3,
      'body': data
    };
    return this.api.patchFugu(obj);
  }

}
