import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Injectable()
export class InvitedUsersService {

  constructor(private api:  ApiService) { }
  getInvitedUsers(data) {
    const obj = {
      'url': 'workspace/getAllMembers',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  resendInvitation(data) {
    const obj = {
      'url': 'user/resendInvitation',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  revokeInvitation(data) {
    const obj = {
      'url': 'user/revokeInvitation',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
