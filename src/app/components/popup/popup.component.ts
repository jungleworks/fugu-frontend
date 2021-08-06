import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MessageService} from '../../services/message.service';
import { Subscription} from 'rxjs';
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupComponent implements OnInit {
  alerts: any = [];
  subscription: Subscription;

  constructor(private messageService: MessageService, private cdRef: ChangeDetectorRef) {
    this.subscription = this.messageService.getAlert().subscribe(message => {
      this.alerts = [];
      this.add(message.type, message.msg, message.timeout);
    });
  }

  ngOnInit() {
  }

  add(type, msg, timeout): void {
    this.alerts.push({
      type: type,
      msg: msg,
      timeout: timeout
    });
    setTimeout(() => {
      this.alerts = [];
      this.cdRef.detectChanges();
    }, timeout);
    this.cdRef.detectChanges();
  }
}
