import { Injectable } from '@angular/core';
import {ApiService} from '../../services/api.service';

@Injectable()
export class EmailPopupService {
  constructor(private api: ApiService) {
  }

  sendEmail(data) {
    const obj = {
      'url': 'users/sendMessageEmail',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
}
}
