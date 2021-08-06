import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {MessageService} from '../../services/message.service';
import {messageModalAnimation} from '../../animations/animations';
import {CommonApiService} from '../../services/common-api.service';
import {environment} from '../../../environments/environment';

declare const moment: any;

@Component({
  selector: 'app-scheduled-meet-join',
  templateUrl: './scheduled-meet-join.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./scheduled-meet-join.component.scss'],
  animations: [messageModalAnimation]
})
export class ScheduledMeetJoinComponent implements OnInit {

  @Input() allData: any;
  @Output() closeSchJoinPopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  openJoinPopup = true;
  isMicOn = true;
  isVideoOn = true;
  showEdit = false;
  showShareBtn = false;
  meetingText = '';
  userData;
  joinStr = 'will join the meeting';
  namesArr: any = [];
  assigneData;

  constructor(public commonService: CommonService, private messageService: MessageService, public commonApiService: CommonApiService) {
  }

  ngOnInit() {
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.meetingText = this.allData.room_id;
    if (this.userData.user_id === this.allData.user_id && this.commonService.getCurrentUtc() < this.allData.end_datetime) {
      this.showEdit = true;
    }
    this.setNames();
    this.checkShareBtn();
  }

  checkShareBtn() {
    this.showShareBtn = false;
    if (this.commonService.getCurrentUtc() > this.allData.start_datetime && this.commonService.getCurrentUtc() < this.allData.end_datetime) {
      this.showShareBtn = true;
    }
  }

  setNames() {
    this.allData.attendees.forEach((val, key) => {
      if (this.userData.user_id != val.user_id && this.namesArr.length < 2) {
        this.namesArr.push(this.transform(val.full_name));
      }
      if (this.userData.user_id === val.user_id) {
        this.assigneData = val;
      }
    });

    if (this.namesArr.length >= 2) {
      if (this.allData.attendees?.length - 3 > 0) {
        this.joinStr = `and ${this.allData.attendees?.length - 3} more will join the meeting`;
      }
    }
  }

  transform(fullName: string): any {
    return fullName.split(' ')[0];
  }

  openEdit() {
    if (this.commonService.getCurrentUtc() > this.allData.end_datetime) {
      this.commonService.showError('Unable to edit');
      return;
    } else {
      this.openJoinPopup = false;
      this.commonService.scheduleMeetingClose.emit(this.allData);
      this.closeSchJoinPopup.emit(true);
    }
  }

  closePopup(e) {
    this.closeSchJoinPopup.emit(e);
    this.openJoinPopup = false;
  }

  joinMeeting() {
    if (this.commonService.getCurrentUtc() < this.allData.start_datetime) {
      this.commonService.showError('Meeting yet to begin');
      return;
    } else {
      window.open(this.getMeetLink(), '_blank', `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${
          window.outerWidth - 100
        },height=${window.outerHeight - 100}`
      );
    }
  }

  onCopiedClick(event) {
    this.commonService.showSuccess('Link copied successfully');
    let value = `${this.assigneData.full_name} is inviting you to a scheduled meeting(${this.allData.title}).\nTimings :- ${moment(this.allData.start_datetime).format('DD-MM-YYYY')} (${moment(this.allData.start_datetime).format('hh:mm a')} - ${moment(this.allData.end_datetime).format('hh:mm a')})\nJoin the meeting here: ${this.getMeetLink()}`;

    const span = document.createElement('span');
    span.innerHTML = value;
    value = span.innerText;
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    document.body.removeChild(span);
  }

  getMeetLink() {
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
    return conf_url;
  }

}
