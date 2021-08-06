import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Injectable()
export class RedirectCalendarService {
  constructor(private api: ApiService) {}

  submitAuthorizeCode(data) {
    const obj = {
      url: "googleCalendar/submitAuthorizeCode",
      type: 2,
      body: data,
    };
    return this.api.postOc(obj);
  }
}
