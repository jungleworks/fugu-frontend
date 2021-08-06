import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MeetSidebarService} from './meet.sidebar.service';
import {MessageService} from '../../services/message.service';
import {CommonService} from '../../services/common.service';
import {ApiService} from '../../services/api.service';
import {LayoutService} from '../layout/layout.service';
import {LoaderService} from '../../services/loader.service';

declare const moment: any;

@Component({
  selector: 'app-meet-sidebar',
  templateUrl: './meet-sidebar.component.html',
  styleUrls: ['./meet-sidebar.component.scss']
})
export class MeetSidebarComponent implements OnInit {

  form: FormGroup;
  spaceData: any;
  meetings: any = [];
  showJoinMeet = false;
  joinData: any = '';
  meetInfo: any = '';
  showMeetDetails = false;

  constructor(private fb: FormBuilder, private service: MeetSidebarService, public api: ApiService,
              private messageService: MessageService, private commonService: CommonService,
              private layoutService: LayoutService, public loader: LoaderService, private cdRef: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.spaceData = this.commonService.currentOpenSpace;
    this.meetingList();
    this.subscribeData();
  }

  subscribeData() {
    this.commonService.scheduleMeetingDone.subscribe(() => {
      this.meetingList();
      this.cdRef.detectChanges();
    });

    this.commonService.meetDetailsPopup.subscribe((data) => {
      this.meetInfo = data;
      this.showMeetDetails = true;
    });

  }

  meetingList() {
    // let start_datetime = this.commonService.getCurrentUtcReplace();
    let start_datetime = moment().utc().format();
    const obj = {
      'url': 'meeting/getMeetings',
      'type': 3,
      'body': {
        user_id: this.spaceData.fugu_user_id,
        workspace_id: this.spaceData.workspace_id,
        start_datetime: start_datetime
      }
    };
    this.loader.show();
    this.api.getFugu(obj).subscribe(res => {
      this.loader.hide();
      this.meetings = res.data;
      this.cdRef.detectChanges();
    }, () => {
      this.loader.hide();
    });
  }


  joinMeet(data) {
    this.showJoinMeet = false;
    this.showJoinMeet = true;
    this.joinData = data;
  }

}
