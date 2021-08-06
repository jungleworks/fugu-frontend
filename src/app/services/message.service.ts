import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class MessageService {
  private alertPush = new Subject<any>();
  punchInMessage = new Subject<any>();
  sendAlert(obj) {
    this.alertPush.next(obj);
  }

  getAlert() {
    return this.alertPush.asObservable();
  }
}
