import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { messageModalAnimation } from '../../animations/animations';
import { Role } from '../../enums/app.enums';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-expired-billing',
  templateUrl: './expired-billing.component.html',
  styleUrls: ['./expired-billing.component.scss'],
  animations: [
    messageModalAnimation
  ]
})
export class ExpiredBillingComponent implements OnInit {
  RoleStatusEnum = Role;
  spaceData;
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();
  constructor(private sessionService: SessionService, public commonService: CommonService, public commonApiService: CommonApiService) { }

  ngOnInit() {
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
  }

}
