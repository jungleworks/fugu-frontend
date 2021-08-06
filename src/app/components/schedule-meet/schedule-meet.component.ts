import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input,
  OnInit, Output, ViewChild
} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {CommonService} from '../../services/common.service';
import {MessageService} from '../../services/message.service';
import {LoaderService} from '../../services/loader.service';
import {SessionService} from '../../services/session.service';
import {CountryService} from '../../services/country.service';
import {messageModalAnimation} from '../../animations/animations';
import {CommonApiService} from '../../services/common-api.service';
import {InvitePopupService} from '../invite-popup/invite-popup.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-schedule-meet',
  templateUrl: './schedule-meet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./schedule-meet.component.scss'],
  animations: [messageModalAnimation]
})
export class ScheduleMeetComponent implements OnInit {

  @Input() allData: any;
  @Output() closeSchJoinPopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  openJoinPopup = true;
  isMicOn = true;
  isVideoOn = true;
  meetingText = '';

  constructor(public commonService: CommonService, private messageService: MessageService,
              private loader: LoaderService, private cdRef: ChangeDetectorRef, private service: InvitePopupService,
              private sessionService: SessionService, private countryService: CountryService,
              public commonApiService: CommonApiService) {
  }

  ngOnInit() {
    this.meetingText = this.allData.meet_id;
  }

  closePopup(e) {
    this.closeSchJoinPopup.emit(e);
    this.openJoinPopup = false;
  }

  joinMeeting() {

    let conf_url;
    if (!this.isVideoOn && this.isMicOn) {
      conf_url = `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}#config.startWithVideoMuted=true`;
    } else if (!this.isMicOn && this.isVideoOn) {
      conf_url = `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}#config.startWithAudioMuted=true`;
    } else if (!this.isMicOn && !this.isVideoOn) {
      conf_url = `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}#config.startWithAudioMuted=true&config.startWithVideoMuted=true`;
    } else {
      conf_url = `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}`;
    }

    window.open(
      conf_url,
      '_blank',
      `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${
        window.outerWidth - 100
      },height=${window.outerHeight - 100}`
    );

  }
}
