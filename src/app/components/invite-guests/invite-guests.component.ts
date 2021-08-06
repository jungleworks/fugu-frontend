import { Component, OnInit, EventEmitter, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { messageModalAnimation } from '../../animations/animations';
import { InviteInputFieldsComponent } from '../invite-input-fields/invite-input-fields.component';
import { CommonService } from '../../services/common.service';


@Component({
  selector: 'app-invite-guests',
  templateUrl: './invite-guests.component.html',
  styleUrls: ['./invite-guests.component.scss'],
  animations: [
    messageModalAnimation
  ]
})
export class InviteGuestsComponent implements OnInit {
  @Output()
  closeGuestInvite: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  showSelectMembersandChannels: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('inputFields', { static: true }) public inputFields: InviteInputFieldsComponent;

  userData;
  inviteContactObj;

  constructor() { }

  ngOnInit() {
  }

  closeGuestInvitePopup() {
    this.closeGuestInvite.emit();
  }

  specifyMembersandChannels() {
    this.inviteContactObj = this.inputFields.inviteGuestMember();
    if (!this.inviteContactObj) {
       return;
    }
    this.showSelectMembersandChannels.emit(this.inviteContactObj);
  }
}
