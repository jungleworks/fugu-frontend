import { Component, OnInit, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { messageModalAnimation } from '../../animations/animations';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { GuestFieldsPopupService } from './guest-fields-popup.service';
import { MessageService } from '../../services/message.service';
import { chipsType } from '../../enums/app.enums';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-guest-fields-popup',
  templateUrl: './guest-fields-popup.component.html',
  styleUrls: ['./guest-fields-popup.component.scss'],
  animations: [
    messageModalAnimation
  ]
})
export class GuestFieldsPopupComponent implements OnInit {
  guest_data = {
    members: [],
    channels: []
  };
  showPaymentPopup = false;
  @Output()
  closeGuestFieldsPopup: EventEmitter<any> = new EventEmitter<any>();
  guest_settings_data;
  @Input() inviteContactObj;
  @Input() setGuestFields = false;
  @Input() set guest_settings(data) {
    if (data) {
      this.guest_settings_data = data;
      this.guest_data.members = data.members;
      this.guest_data.channels = data.channels;
    }
  }
  all_users_data = [];
  userData;
  newChannelName;
  showAddNewChannelField = false;
  chipsTypeEnum = chipsType;


  constructor(private sessionService: SessionService, private commonService: CommonService,private commonApiService: CommonApiService,
    public guestFieldService: GuestFieldsPopupService, private messageService: MessageService,     private cdRef: ChangeDetectorRef,
    ) { }

  ngOnInit() {
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]]
    //set default members only if it is a new invite and not an edit one
    if (this.setGuestFields) {
      const defaultMember = [
        {
          user_id: this.userData.user_id,
          full_name: this.userData.full_name,
        }
      ];
      this.guest_data.members = defaultMember;
    }
  }

  getAllUsers() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      user_count: 'ALL_USERS'
    };
    this.commonApiService.search(obj)
      .subscribe(response => {
        this.all_users_data = response.data.users;
      });
  }

  closePopup() {
    this.closeGuestFieldsPopup.emit();
  }

  selectedResultsMembers(data) {
    this.guest_data.members = data;
  }

  selectedResultsChannels(data) {
    this.guest_data.channels = data;
  }

  inviteGuestMembers() {
    const channel_ids = [];
    const user_ids = [];

    this.guest_data.members.map((user) => {
      user_ids.push(user.user_id);
    });

    this.guest_data.channels.map((channel) => {
      channel_ids.push(channel.channel_id);
    });

    const obj = {
      user_ids_to_connect: user_ids.length ? user_ids : undefined,
      channel_ids_to_connect: channel_ids.length ? channel_ids : undefined,
    };

    if (this.setGuestFields) {
      obj['is_guest'] = true;
      obj['custom_label'] = this.newChannelName || undefined;
      const guestObj = { ...this.inviteContactObj, ...obj };

      this.guestFieldService.inviteGuests(guestObj)
        .subscribe(response => {
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.closePopup();
        }, error => {
          if (error.error.statusCode === 402) {
            this.showPaymentPopup = true;
            this.cdRef.detectChanges();
          }
        });
    } else {
      obj['guest_id'] = Number(this.guest_settings_data.guest_id);
      obj['en_user_id'] = this.userData.en_user_id;
      this.guestFieldService.updateGuests(obj)
        .subscribe(response => {
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.closePopup();
        });
    }
  }

  showNewChannelField() {
    this.showAddNewChannelField = true;
  }

}
