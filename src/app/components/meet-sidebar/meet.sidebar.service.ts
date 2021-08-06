import {Injectable} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {environment} from '../../../environments/environment';

@Injectable()
export class MeetSidebarService {
  constructor(private api: ApiService) {
  }

  submitMeetData(data) {
    const obj = {
      'url': 'conversation/starMessage',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }



}
