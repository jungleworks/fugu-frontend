import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Injectable()
export class VideoCallService {
  constructor(private api: ApiService) {
  }
  sendFeedback(data) {
    const obj = {
      'url': 'user/sendFeedback',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  updateConferenceCall(data) {
    const obj = {
      'url': 'conversation/updateConferenceCall',
      'body': data,
      'type': 3
    };
    return this.api.postOut(obj);
  }


}
