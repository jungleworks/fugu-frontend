import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SessionService} from '../../services/session.service';
import {CommonService} from '../../services/common.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CreateGroupService} from '../create-group/create-group.service';
import {Bots, leaveRole} from '../../enums/app.enums';
import {CommonApiService} from '../../services/common-api.service';
import {debounceTime} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {LayoutService} from '../layout/layout.service';
import {LoaderService} from '../../services/loader.service';
import {MessageService} from '../../services/message.service';
import {MeetDashboardService} from './meet.dashboard.service';
import {ApiService} from '../../services/api.service';
import {log} from 'util';

let page_start = 0;
let stopGroupHit = false;
let all_members_count;
let allMembers;
let page_size_count;
declare const moment: any;

@Component({
  selector: 'app-meet-dashboard',
  templateUrl: './meet-dashboard.component.html',
  styleUrls: ['./meet-dashboard.component.scss']
})
export class MeetDashboardComponent implements OnInit {

  spaceData;
  schForm: FormGroup;
  showError = false;
  callingType;
  showInvite = false;
  openNewMeetingPopup = false;
  showInvitePopup = false;
  openJoinPopup = false;
  search_results = [];
  all_members = [];
  memberContainerEl;
  isGroupMembersFetched = false;
  selected_members = {};
  active_index = 0;
  searchCtrl = new FormControl();
  leaveRoleEnum = leaveRole;
  botsEnum = Bots;
  user_details;
  isMicOn = true;
  isVideoOn = true;
  meetingText = '';
  openLiveJoinPopup = false;
  openScheduleMeeting = false;
  userData;

  constructor(private sessionService: SessionService, public commonService: CommonService,
              private service: CreateGroupService, private cdRef: ChangeDetectorRef,
              public commonApiService: CommonApiService, public layoutService: LayoutService,
              private loader: LoaderService, private fb: FormBuilder, private messageService: MessageService,
              public localService: MeetDashboardService, private api: ApiService
  ) {
  }

  @ViewChild('membersContainer') set membersContainer(
    memberContent: ElementRef
  ) {
    if (memberContent) {
      this.memberContainerEl = memberContent;
      if (all_members_count && all_members_count > allMembers.length &&
        (this.searchCtrl.value == '' || this.searchCtrl.value == null) &&
        document.getElementById('group-member-container')
      ) {
        document.getElementById('group-member-container').addEventListener('scroll', (event) => {
          if (all_members_count > allMembers.length) {
            this.checkPaginationOfCreateGroup();
          }
        });
      }
    }
  }

  ngOnInit(): void {
    this.userData = this.sessionService.get('loginData/v1')['user_info'];
    window.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'cal_link':
          this.userData.is_calendar_linked = e.data.data.cal_link;
          this.cdRef.detectChanges();
          break;
      }
    });
    this.commonService.openMeetProfile = true;
    this.showInvite = false;
    this.search_results = [];
    this.spaceData = this.sessionService.get('spaceDictionary')[
      window.location.pathname.split('/')[1]
      ];
    this.user_details = this.commonService.userDetailDict[
      window.location.pathname.split('/')[1]
      ];
    this.subscribeEditSchMeet();

    this.searchCtrl.valueChanges.pipe(debounceTime(300)).subscribe(data => {
      this.active_index = -1;
      if (data && data.length > 1) {
        this.searchUsers(data || '');
      } else {
        this.search_results = this.all_members.filter(member =>
          !this.selected_members[member.fugu_user_id]);
      }
      this.cdRef.detectChanges();
    });

  }


  subscribeEditSchMeet() {
    this.commonService.scheduleMeetingClose.subscribe(res => {
      this.openScheduleMeeting = true;
      this.fetchMembers();
      this.schFormInit(res);
    });
  }

  openNewMeeting(type) {
    this.callingType = type;
    page_start = 0;
    this.openNewMeetingPopup = true;
    this.searchCtrl = new FormControl();
    this.fetchMembers();
    this.searchCtrl.valueChanges.pipe(debounceTime(300)).subscribe((data) => {
      this.active_index = 0;
      this.memberContainerEl.elementRef.nativeElement.scrollTop = 0;
      if (data && data.length > 1) {
        this.isGroupMembersFetched = true;
        this.searchUsers(data);
      } else {
        this.isGroupMembersFetched = false;
        page_start = 0;
        // this.search_results = this.all_members.filter(member =>
        //  !this.selected_members[member.fugu_user_id]);
        this.search_results = this.all_members;

        this.cdRef.detectChanges();
      }
      this.cdRef.detectChanges();
    });
    if (document.getElementById('create-search-box')) {
      document.getElementById('create-search-box').focus();
    }
  }

  // getMemberResults() {
  //   if (this.sessionService.get("cached-members")) {
  //     return <any>this.sessionService.get("cached-members");
  //   } else {
  //     return null;
  //   }
  // }

  checkPaginationOfCreateGroup() {
    if (
      !this.isGroupMembersFetched &&
      (this.memberContainerEl.elementRef.nativeElement.scrollTop +
        this.memberContainerEl.elementRef.nativeElement.clientHeight) /
      this.memberContainerEl.elementRef.nativeElement.scrollHeight >=
      0.98
    ) {
      if (!stopGroupHit) {
        page_start = page_start + page_size_count;
        this.hitForNextMembers();
      }
    }
  }

  hitForNextMembers() {
    stopGroupHit = true;
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_status: 'ENABLED',
      user_type: 'ALL_MEMBERS',
      page_start: page_start,
      include_user_guests: true
    };
    this.service.getAllMembers(obj).subscribe((res) => {
      stopGroupHit = false;
      const group_mem = res.data.all_members;
      if (group_mem.length) {
        this.search_results = [...this.search_results, ...group_mem];
        // this.search_results = this.search_results.filter(member =>
        //   !this.selected_members[member.fugu_user_id]);
      } else {
        this.isGroupMembersFetched = true;
      }
      this.cdRef.detectChanges();
    });
  }

  fetchMembers() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_status: 'ENABLED',
      user_type: 'ALL_MEMBERS',
      page_start: page_start,
      include_user_guests: true
    };
    this.service.getAllMembers(obj).subscribe((res) => {
      this.all_members = res.data.all_members;
      page_size_count = res.data.get_all_member_page_size;
      allMembers = [...res.data.all_members];
      all_members_count = res.data.user_count;
      if (!this.all_members.length) {
        this.isGroupMembersFetched = false;
      }
      this.all_members = allMembers.filter(
        (member) =>
          this.commonService.userDetails.user_id != member.fugu_user_id
      );
      this.search_results = [...this.all_members];
      if (!this.search_results.length) {
        this.showInvite = true;
      }
      this.saveMemberResults(this.search_results);
      this.cdRef.detectChanges();
    });
  }

  saveMemberResults(data) {
    this.sessionService.set('cached-members', data);
  }

  addMember(member) {
    if (!this.selected_members[member.fugu_user_id]) {
      this.selected_members[member.fugu_user_id] = member;
      this.selected_members = {...this.selected_members};
      if (this.searchCtrl.value) {
        this.searchCtrl.reset();
      }

      document.getElementById('create-search-box').focus();
    } else {
      this.removeMember(member.fugu_user_id);
    }
  }

  removeMember(member) {
    delete this.selected_members[member];
    this.selected_members = {...this.selected_members};
  }

  searchUsers(name: string) {
    this.showInvite = false;
    if (all_members_count > allMembers.length) {
      const obj = {
        en_user_id: this.user_details.en_user_id,
        search_text: name
      };
      this.commonApiService.searchUsersInGroup(obj).subscribe((response) => {
        this.search_results = response.data.users;
        this.cdRef.detectChanges();
      });
    } else {
      this.search_results = this.all_members.filter(
        (member) =>
          member.full_name.toLowerCase().includes(name.toLowerCase()) ||
          (member.email &&
            member.email.toLowerCase().includes(name.toLowerCase()))
      );
    }
  }

  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {
    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      const el = document.getElementById('members' + this.active_index);
      if (el) {
        el.click();
      }
      this.memberContainerEl.elementRef.nativeElement.scrollTop = 0;
    }
  }

  private searchDownArrow() {
    if (this.active_index != this.search_results.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 62;
      const scrollTop = this.memberContainerEl.elementRef.nativeElement.scrollTop;
      const viewport =
        scrollTop +
        this.memberContainerEl.elementRef.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.memberContainerEl.elementRef.nativeElement.scrollTop += 62;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 62;
      const scrollTop = this.memberContainerEl.elementRef.nativeElement.scrollTop;
      const viewport =
        scrollTop +
        this.memberContainerEl.elementRef.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.memberContainerEl.elementRef.nativeElement.scrollTop -= 62;
      }
    }
  }

  inviteMembers() {
    let domain = environment.FUGU_CONFERENCE_URL;
    if (this.commonApiService.whitelabelConfigurations['properties']) {
      domain = this.commonApiService.whitelabelConfigurations['properties'].conference_link;
    }
    let conf_url;
    if (!this.isVideoOn && this.isMicOn) {
      conf_url = `${
        environment.FUGU_CONFERENCE_URL
      }/${this.commonService.generateRandomString()}#config.startWithVideoMuted=true`;
    } else if (!this.isMicOn && this.isVideoOn) {
      conf_url = `${
        environment.FUGU_CONFERENCE_URL
      }/${this.commonService.generateRandomString()}#config.startWithAudioMuted=true`;
    } else if (!this.isMicOn && !this.isVideoOn) {
      conf_url = `${
        environment.FUGU_CONFERENCE_URL
      }/${this.commonService.generateRandomString()}#config.startWithAudioMuted=true&config.startWithVideoMuted=true`;
    } else {
      conf_url = `${
        environment.FUGU_CONFERENCE_URL
      }/${this.commonService.generateRandomString()}`;
    }
    window.open(
      conf_url,
      '_blank',
      `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${
        window.outerWidth - 100
      },height=${window.outerHeight - 100}`
    );
    if (Object.keys(this.selected_members).length) {
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        invite_user_ids: Object.keys(this.selected_members),
        invite_link: conf_url
      };
      this.commonApiService.inviteToConference(obj).subscribe((res) => {
        this.clearSelectedSettings();
      });
    }
  }

  inviteForGoogleMeet() {
    this.loader.show();
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      is_scheduled: 0,
      timezone: this.getTimezone(),
      summary: 'calling meet',
      description: 'calling meet desc',
      // user_id: this.other_user_id,
      attendees: Object.keys(this.selected_members)
    };
    obj['domain'] = environment.LOCAL_DOMAIN;
    this.commonApiService.addEvent(obj).subscribe((res) => {
      this.openNewMeetingPopup = false;
      this.loader.hide();
      //  if (res.data.link) {
      window.open(res.data.hangoutLink);
      //  }
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        invite_user_ids: Object.keys(this.selected_members),
        invite_link: res.data.hangoutLink,
        is_google_meet_conference: true
      };
      this.commonApiService.inviteToConference(obj).subscribe((res) => {
        this.clearSelectedSettings();
      });
    });
  }

  getTimezone() {
    const date = new Date();
    let t = date.getTimezoneOffset();
    if (t < 0) {
      t = Math.abs(t);
    } else if (t > 0) {
      t = -Math.abs(t);
    } else if (t == 0) {
      t = 0;
    }
    return t.toString();
  }

  clearSelectedSettings() {
    this.openNewMeetingPopup = false;
    this.openJoinPopup = false;
    this.selected_members = {};
    this.isVideoOn = true;
    this.isMicOn = true;
    this.meetingText = '';
    this.cdRef.detectChanges();
  }

  joinMeeting() {
    let domain = environment.FUGU_CONFERENCE_URL;
    if (this.commonApiService.whitelabelConfigurations['properties']) {
      domain = this.commonApiService.whitelabelConfigurations['properties'].conference_link;
    }
    let conf_url;
    if (this.meetingText.startsWith(domain)) {
      if (!this.isVideoOn && this.isMicOn) {
        conf_url = `${this.meetingText}#config.startWithVideoMuted=true`;
      } else if (!this.isMicOn && this.isVideoOn) {
        conf_url = `${this.meetingText}#config.startWithAudioMuted=true`;
      } else if (!this.isMicOn && !this.isVideoOn) {
        conf_url = `${this.meetingText}#config.startWithAudioMuted=true&config.startWithVideoMuted=true`;
      } else {
        conf_url = `${this.meetingText}`;
      }
    } else {
      if (!this.isVideoOn && this.isMicOn) {
        conf_url = `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}#config.startWithVideoMuted=true`;
      } else if (!this.isMicOn && this.isVideoOn) {
        conf_url = `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}#config.startWithAudioMuted=true`;
      } else if (!this.isMicOn && !this.isVideoOn) {
        conf_url = `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}#config.startWithAudioMuted=true&config.startWithVideoMuted=true`;
      } else {
        conf_url = `${environment.FUGU_CONFERENCE_URL}/${this.meetingText}`;
      }
    }
    window.open(
      conf_url,
      '_blank',
      `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${
        window.outerWidth - 100
      },height=${window.outerHeight - 100}`
    );
    this.clearSelectedSettings();
  }

  inviteMembersPopup() {
    this.openNewMeetingPopup = false;
    this.showInvitePopup = true;
    this.cdRef.detectChanges();
  }

  openLivestreamWindow() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      workspace_id: this.spaceData.workspace_id,
      stream_type: 'PUBLISH',
      is_select_all: 1
    };
    if (this.commonService.isWhitelabelled) {
      obj['domain'] = this.commonApiService.whitelabelConfigurations['domain'];
    } else {
      obj['domain'] = environment.LOCAL_DOMAIN;
    }
    this.commonApiService.joinLiveStream(obj).subscribe((res) => {
      if (res.data.link) {
        window.open(res.data.link);
      }
    });
  }

  getAuthorizedUrl() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id
    };
    obj['domain'] = environment.LOCAL_DOMAIN;
    this.commonApiService.getAuthorizeUrl(obj).subscribe((response) => {
      // resolve(response);
      window.open(
        response.data,
        '_blank',
        'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=500,height=600'
      );
      this.loader.hide();
    });
  }

  onReportDateChange(event, type) {
    const d = event.value;
    if (type === 'start') {
      this.schForm.patchValue({
        start_date: (moment(d).format('YYYY-MM-DD'))
      });
    } else {
      this.schForm.patchValue({
        end_date: (moment(d).format('YYYY-MM-DD'))
      });
    }
  }

  reminderTimes: any = [
    {name: '10 minutes', id: 10},
    {name: '15 minutes', id: 15},
    {name: '30 minutes', id: 30},
    {name: '1 hour', id: 60}
  ];

  timeOptions: any = [
    {name: 'Every Day', val: 1},
    {name: 'Weekdays', val: 2},
    {name: 'Every Week', val: 3},
    {name: 'Monthly', val: 4}
  ];

  onTimeChange(event, type) {
    if (type == 'start') {
      this.schForm.controls.start_time.patchValue(event);
    } else {
      this.schForm.controls.end_time.patchValue(event);
    }
  }

  openSchModal() {
    this.openScheduleMeeting = true;
    this.fetchMembers();
    this.schFormInit();
  }

  combineDates(date, time) {
    return moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss a').format();
  }

  editData;

  schFormInit(data?) {
    this.schForm = this.fb.group({
      title: ['', Validators.required],
      start_date: [(moment().format('YYYY-MM-DD')), [Validators.required]],
      end_date: [(moment().format('YYYY-MM-DD')), [Validators.required]],
      start_time: [(moment().add(1, 'minutes').format('hh:mm a')), Validators.required],
      end_time: [(moment().add(10, 'minutes').format('hh:mm a')), Validators.required],
      frequency: [1],
      isRepeat: [false],
      reminder_time: [this.reminderTimes[0].id, Validators.required]
    });
    this.editData = '';
    this.selected_members = [];

    if (data) {
      this.editData = data;
      data.attendees.forEach((val, key) => {

        if (this.commonService.userDetails.user_id != val.user_id) {
          this.selected_members[val.user_id] = val;
          this.selected_members = {...this.selected_members};
        }
      });

      this.schForm.patchValue({
        title: data.title,
        start_date: moment(data.start_datetime).format('YYYY-MM-DD'),
        start_time: moment(data.start_datetime).format('hh:mm a'),
        end_date: moment(data.end_datetime).format('YYYY-MM-DD'),
        end_time: moment(data.end_datetime).format('hh:mm a'),
        frequency: data.frequency,
        isRepeat: !!data.frequency,
        reminder_time: data.reminder_time
      });
    }

  }

  finalSubmit() {
    const obj: any = {
      meet_type: 'JITSI',
      user_id: this.spaceData.fugu_user_id,
      workspace_id: this.spaceData.workspace_id
    };
    // meeting stat time and end time in utc logic
    let nowTime = moment().format('hh:mm a');
    let nowDate = moment().format('YYYY-MM-DD');
    let nowDateTime = new Date(this.combineDates(nowDate, nowTime));

    let startTemp = new Date(this.combineDates(this.schForm.value.start_date, this.schForm.value.start_time));
    let endTemp = new Date(this.combineDates(this.schForm.value.end_date, this.schForm.value.end_time));

    if (nowDateTime > endTemp) {
      this.commonService.showError('Meeting can be schedule for future');
      return;
    }
    if (endTemp <= startTemp) {
      this.commonService.showError('Meeting end should be greater than start time');
      return;
    }

    obj.start_datetime = this.commonService.getCombinedUTCTimeReplace(this.schForm.value.start_date, this.schForm.value.start_time);
    obj.end_datetime = this.commonService.getCombinedUTCTimeReplace(this.schForm.value.end_date, this.schForm.value.end_time);
    let temp1 = Object.keys(this.selected_members);
    let temp2: any = [];
    temp1.forEach(val => {
      temp2.push(JSON.parse(val));
    });
    obj.attendees = temp2;
    if (!obj.attendees.length) {
      this.commonService.showError('Please select participants ');
      return;
    }
    if (this.schForm.valid) {
      this.showError = false;
      obj.title = this.schForm.value.title;
      obj.reminder_time = this.schForm.value.reminder_time;
      obj.room_id = this.commonService.generateRandomString();
      if (this.schForm.value.isRepeat) {
        obj.frequency = this.schForm.value.frequency;
      }
      let apiUrl = 'meeting/scheduleMeeting';
      if (this.editData) {
        obj.meet_id = this.editData.meet_id;
        apiUrl = 'meeting/editMeeting';
      } else {
        obj.domain = this.commonApiService.whitelabelConfigurations['full_domain'] || this.commonService.getDomainName() || 'Fugu';
      }
      this.openScheduleMeeting = false;
      this.loader.show();
      this.api.postData(apiUrl, obj).subscribe(res => {
        this.openMeetDetails(obj);
        this.loader.hide();
        this.commonService.scheduleMeetingDone.emit(true);
        this.schForm.reset();
        this.selected_members = {};
        this.commonService.showSuccess(res.message);
      }, error => {
        this.loader.hide();
        this.commonService.showError(error.error.message);
      });
    } else {
      this.showError = true;
    }
  }

  openMeetDetails(data) {
    this.commonService.meetDetailsPopup.emit(data);
  }

  deleteMeeting() {
    const obj: any = {
      meet_type: 'JITSI',
      user_id: this.spaceData.fugu_user_id,
      workspace_id: this.spaceData.workspace_id,
      meet_id: this.editData.meet_id,
      is_deleted: 1
    };
    let apiUrl = 'meeting/editMeeting';
    this.openScheduleMeeting = false;
    this.api.postData(apiUrl, obj).subscribe(() => {
      this.commonService.scheduleMeetingDone.emit(true);
      this.schForm.reset();
      this.selected_members = {};
      this.commonService.showSuccess('Meeting deleted successfully');
    });
  }

}
