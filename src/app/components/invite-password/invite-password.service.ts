import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Injectable()
export class InvitePasswordService {

  constructor(
    private api: ApiService
  ) { }

  setPassword(data) {
    const obj = {
      'url': 'user/setPassword',
      'type': 8,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
