import {Injectable} from '@angular/core';
import {ApiService} from '../../services/api.service';
import { Observable } from 'rxjs';

@Injectable()
export class SettingsPermissionsService {
  constructor(private api: ApiService) {
  }

  getConfiguration(data) {
    const obj = {
      'url': 'workspace/getConfiguration',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  editConfiguration(data) {
    const obj = {
      'url': 'workspace/editConfiguration',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getPublicEmailDomain(data) {
    const obj = {
      'url': 'workspace/getPublicEmailDomains',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  editPublicEmailDomain(data) {
    const obj = {
      'url': 'workspace/editPublicEmailDomain',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getAllMembers(data) {
    const obj = {
      'url': 'workspace/getAllMembers',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  manageUserRole(data) {
    const obj = {
      'url': 'user/manageUserRole',
      'type': 3,
      'body': data
    };
    return this.api.patchFugu(obj);
  }
  editUserInfo(data) {
    const obj = {
      'url': 'user/editUserInfo',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getGroups(data) {
    const obj = {
      'url': 'chat/getChatGroups',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  changeGroupStatus(data) {
    const obj = {
      'url': 'chat/changeGroupInfo',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  editWorkspace(data) {
    const obj = {
      'url': 'workspace/editInfo',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  uploadFile(formdata: FormData): Observable<any> {
    const obj = {
      'url': 'conversation/uploadFile',
      'type': 3,
      'body': formdata
    };
    return this.api.postOc(obj);
  }
  getGuestdata(data) {
    const obj = {
      'url': 'chat/getGuestChannels',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
}
