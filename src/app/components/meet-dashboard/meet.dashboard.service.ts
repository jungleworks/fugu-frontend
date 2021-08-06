import {Injectable} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {CommonApiService} from '../../services/common-api.service';

@Injectable()
export class MeetDashboardService {
  constructor(private api: ApiService, public commonService: CommonApiService) {
  }

  submitSchMeetData(data) {
    return this.api.postData('meeting/scheduleMeeting', data);
  }

}
