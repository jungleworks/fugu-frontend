import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Injectable()
export class RedirectInvitationService {

  constructor(
    private api: ApiService
  ) { }

  verifyToken(data) {
    const obj = {
      'url': 'user/verifyToken',
      'type': 2,
      'body': data
    };
    return this.api.getFugu(obj);
 }
}
