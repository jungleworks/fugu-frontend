import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {messageModalAnimation} from '../../animations/animations';
import {CommonApiService} from '../../services/common-api.service';
import {environment} from '../../../environments/environment';

declare const moment: any;

@Component({
  selector: 'app-meet-details',
  templateUrl: './meet-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./meet-details.component.scss'],
  animations: [messageModalAnimation]
})
export class MeetDetailsComponent implements OnInit {

  @Input() allData: any;
  @Output() closeBtn: EventEmitter<boolean> = new EventEmitter<boolean>();
  showShareBtn = true;
  meetingText = '';
  userData;

  constructor(public commonService: CommonService, public commonApiService: CommonApiService) {
  }

  ngOnInit() {
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.meetingText = this.allData.room_id;
  }

  closePopup(e) {
    this.closeBtn.emit(e);
  }

  onCopiedClick(event) {
    this.commonService.showSuccess('Link copied successfully');
    let value = `${this.userData.full_name} is inviting you to a scheduled meeting(${this.allData.title}).\nTimings :- ${moment(this.allData.start_datetime).format('DD-MM-YYYY')} (${moment(this.allData.start_datetime).format('hh:mm a')} - ${moment(this.allData.end_datetime).format('hh:mm a')})\nJoin the meeting here: ${this.getMeetLink()}`;
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
    return `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}`;
  }

}
