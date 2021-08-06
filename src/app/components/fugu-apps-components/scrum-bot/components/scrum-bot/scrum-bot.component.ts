import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ScrumBotService } from '../../../../../services/scrum-bot.service';
import { debounceTime } from 'rxjs/operators';
import { timeZone } from '../../time-zone';
import { CommonService } from '../../../../../services/common.service';
import { chipsType, ChatTypes } from '../../../../../enums/app.enums';
import { SessionService } from '../../../../../services/session.service';
import { messageModalAnimation } from '../../../../../animations/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../../../../services/loader.service';
import { MessageService } from '../../../../../services/message.service';

declare const moment: any;
let publicChannels = [];
let privateChannels = [];
let questionIdsDeleted = [];
let reportData;
let dataLength = [];
let selectedChip = [];


@Component({
  selector: 'app-scrum-bot',
  templateUrl: './scrum-bot.component.html',
  styleUrls: ['./scrum-bot.component.scss'],
  animations: [messageModalAnimation]
})
export class ScrumBotComponent implements OnInit {

  constructor(private fb: FormBuilder, private sessionService: SessionService,
    private scrumBotService: ScrumBotService, private cdRef: ChangeDetectorRef,
    private commonService: CommonService, private activatedRoute: ActivatedRoute, private router: Router,
    private messageService: MessageService, private loader: LoaderService) {
    this.timezone = timeZone;
    this.timezoneDisplayed = this.timezone.slice();
    this.selectedRecurringTime = this.recurringTime[1];
    this.selectedWaitingTime = this.waitingTime[1];
    this.selectedEndTime = this.endTime[1];
    this.selectedTimeZone = this.setDefaultTimeZone();
  }
  recurringTime = [
    {
      name: 'Non-recurrent',
      value: 0
    },
    {
      name: 'Every Week',
      value: 1
    },
    {
      name: 'Every 2 Week',
      value: 2
    },
    {
      name: 'Every 3 Week',
      value: 3
    },
    {
      name: 'Every 4 Week',
      value: 4
    }
  ];
  endTime = [
    {
      name: '5 minutes',
      value: 5
    },
    {
      name: '10 minutes',
      value: 10
    },
    {
      name: '15 minutes',
      value: 15
    },
    {
      name: '20 minutes',
      value: 20
    }
  ];
  waitingTime = [
    {
      name: '15 minutes',
      value: 15
    },
    {
      name: '30 minutes',
      value: 30
    },
    {
      name: '45 minutes',
      value: 45
    },
    {
      name: '1 Hour',
      value: 60
    },
    {
      name: '1.5 Hours',
      value: 90
    },
    {
      name: '2 Hours',
      value: 120
    },
    {
      name: '2.5 Hours',
      value: 150
    },
    {
      name: '3 Hours',
      value: 180
    },
    {
      name: '4 Hours',
      value: 240
    },
    {
      name: '6 Hours',
      value: 360
    },
    {
      name: '8 Hours',
      value: 480
    },
    {
      name: '12 Hours',
      value: 720
    }
  ];
  weekdays = [
    {
      name: 'Sun',
      value: 1,
      selected: false
    },
    {
      name: 'Mon',
      value: 2,
      selected: true
    },
    {
      name: 'Tue',
      value: 3,
      selected: true
    },
    {
      name: 'Wed',
      value: 4,
      selected: true
    },
    {
      name: 'Thu',
      value: 5,
      selected: true
    },
    {
      name: 'Fri',
      value: 6,
      selected: true
    },
    {
      name: 'Sat',
      value: 7,
      selected: false
    }
  ];
  navOption = [
    {
      name: 'Scheduling',
      value: 1
    },
    {
      name: 'Respondents and Questions',
      value: 2
    },
    {
      name: 'Results Delivery',
      value: 3
    }
  ];
  standUpActiveStep = 1;
  standupForm;
  spaceData;
  searchTimezone;
  selectedRecurringTime;
  selectedWaitingTime;
  selectedEndTime;
  selectedTimeZone;
  selectedPeople = {};
  selectedChannels = {};
  showTimezoneBox;
  showRecurringBox;
  teamMembers;
  timezone;
  timezoneDisplayed;
  showWaitingTime;
  showEndTime;
  endTimeText = 'The standup is running. Answer the questions or no lunch time';
  openAddAllChannelPopup = false;
  channel_value = false;
  channelsToShow = [];
  groupMembers = [];
  chipsTypeEnum = chipsType;
  selectedChips = {
    respondents: [],
    members: [],
    channels: []
  };
  userData;
  scrumId;
  end_time_reminder = true;
  searchChannelsCtrl;
  isEdit = false;
  scrumUsersNotAvailable = [];
  scrum_name = 'Classic Scrum Report';
  editScrumName = false;
  isScrumRunning = false;
  scrum_user_Id;

  ngOnInit() {
    const user_details = this.sessionService.get('user_details_dict')
    this.userData = user_details[window.location.pathname.split('/')[1]];
    // this.spaceData = this.sessionService.get('currentSpace');
    const spaceDataAll = <any>this.sessionService.get('spaceDictionary');
    const workspace = window.location.pathname.split('/')[1];
    this.spaceData = spaceDataAll[workspace];
    /**
     * add your own self in members by default
     */
    this.selectedChips.members.push(this.userData);
    this.activatedRoute.params.subscribe(res => {
      if (res.reportTab && ['2', '3'].includes(res.reportTab)) {
        this.standUpActiveStep = res.reportTab;
      }
    });

    this.searchChannelsCtrl = new FormControl();
    this.searchTimezone = new FormControl();
    this.initStandupForm();
    this.searchTimezone.valueChanges
      .pipe(debounceTime(300))
      .subscribe(searchStr => {
        this.onTimezoneSearch(searchStr);
      });

    this.searchChannelsCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data) {
          this.channelsToShow = this.searchChannels(data);
        } else {
          if (this.channel_value) {
            this.channelsToShow = privateChannels;
          } else {
            this.channelsToShow = publicChannels;
          }
        }
        this.cdRef.detectChanges();
      });
    this.setDefaultStartDay();
    this.activatedRoute.queryParams.subscribe(data => {
      if (data && data.edit) {
        this.isEdit = true;
        this.scrumId = data.id;
        //empty the deleted questions array
        questionIdsDeleted = [];
        this.setReportData();
      }
    });
  }

  searchChannels(name: string) {
    if (this.channel_value) {
      return privateChannels.filter(channel =>
        (channel.label.toLowerCase().includes(name.toLowerCase()))
      );
    } else {
      return publicChannels.filter(channel =>
        (channel.label.toLowerCase().includes(name.toLowerCase()))
      );
    }
  }

  initStandupForm() {
    this.standupForm = this.fb.group({
      session_start: [' ', [Validators.required]],
      time_zone_value: [this.setDefaultTimeZone(), [Validators.required]],
      schedule_hour: ['10', [Validators.required, Validators.min(0), Validators.max(23)]],
      schedule_min: ['00', [Validators.required, Validators.min(0), Validators.max(59)]],
      welcome_message: [`Come on, it's time to start the standup meeting.`, [Validators.required]],
      questions: this.fb.array([]),
      waiting_time: [' ', [Validators.required]],
      end_time: [' '],
    });
    /**
     * send -2 as id in case of a new question
     */
    this.addQuestion({
      id: -2,
      question: 'What did you do yesterday?',
    });
    this.addQuestion({
      id: -2,
      question: 'What do you plan on doing today?',
    });
    this.addQuestion({
      id: -2,
      question: 'Okay, any obstacles?',
    });
  }

  createQuestion(ques) {
    return this.fb.group({
      id: ques.id || -2,
      question: [ques.question, Validators.required]
    });
  }

  addQuestion(ques?): void {
    const items = this.standupForm.get('questions') as FormArray;
    items.push(this.createQuestion(ques || {}));
  }
  removeQuestion(index, id): void {
    const items = this.standupForm.get('questions') as FormArray;
    items.removeAt(index);
    questionIdsDeleted.push(id);
  }
  moveQues(index, val) {
    const items = this.standupForm.get('questions') as FormArray;
    if ((index == 0 && val == -1) || (index == items.length - 1 && val == 1)) {
      return;
    }
    const control = items.at(index);
    items.removeAt(index);
    items.insert(index + val, control);
  }

  private setDefaultTimeZone() {
    for (let i = 0; i < this.timezone.length; i++) {
      const time = this.timezone[i];
      if (time.offset == this.getTimezone()) {
        return time;
      }
    }
    return '';
  }

  setDefaultStartDay() {
    //set today's date as the default date
    this.standupForm.controls.session_start.setValue(new Date());
  }

  private getTimezone() {
    const date = new Date();
    let t = date.getTimezoneOffset();
    if (t < 0) {
      t = Math.abs(t);
    } else if (t > 0) {
      t = -Math.abs(t);
    } else if (t == 0) {
      t = 0;
    }
    return t;
  }

  onTimezoneSearch(str) {
    if (str.trim() == '') {
      this.timezoneDisplayed = this.timezone.slice();
    } else {
      this.timezoneDisplayed = this.timezone.filter(zone => zone.text.toLowerCase().includes(str.toLowerCase()));
    }
    this.cdRef.detectChanges();
  }

  changeTime(type, amount) {
    if (type == 'hour') {
      let value = this.standupForm.value.schedule_hour;
      value = +value + amount;
      if (value >= 0 && value <= 23) {
        if (value < 10) {
          value = '0' + value;
        }
        this.standupForm.controls.schedule_hour.setValue(value);
      }
    } else if (type == 'min') {
      let value = this.standupForm.value.schedule_min;
      value = +value + amount;
      if (value >= 0 && value <= 59) {
        if (value < 10) {
          value = '0' + value;
        }
        this.standupForm.controls.schedule_min.setValue(value);
      }
    }
  }

  onTimeKeyPress(event, type) {
    if (event.code == 'ArrowDown') {
      event.preventDefault();
      this.changeTime(type, -1);
    } else if (event.code == 'ArrowUp') {
      event.preventDefault();
      this.changeTime(type, 1);
    }
  }
  onWeekdayChange(day) {
    day.selected = !day.selected;
  }

  chooseRecurringTime(i) {
    this.selectedRecurringTime = this.recurringTime[i];
    this.showRecurringBox = false;
  }

  chooseWaitingTime(i) {
    this.selectedWaitingTime = this.waitingTime[i];
    if (this.selectedWaitingTime.value == this.waitingTime[0].value) {
      this.endTime = [
        {
          name: '5 minutes',
          value: 5
        },
        {
          name: '10 minutes',
          value: 10
        }
      ];
    } else {
      this.endTime = [
        {
          name: '5 minutes',
          value: 5
        },
        {
          name: '10 minutes',
          value: 10
        },
        {
          name: '15 minutes',
          value: 15
        },
        {
          name: '20 minutes',
          value: 20
        }
      ];
    }
    this.showWaitingTime = false;
  }

  chooseEndTime(i) {
    this.selectedEndTime = this.endTime[i];
    this.showEndTime = false;
  }
  chooseTimezone(item) {
    this.selectedTimeZone = item;
    this.searchTimezone.setValue('');
    this.showTimezoneBox = false;
  }
  removeSelectedPeople(removedMemberId) {
    delete this.selectedPeople[removedMemberId];
    this.selectedPeople = { ...this.selectedPeople };
    this.cdRef.detectChanges();
  }
  removeSelectedChannels(removedMemberId) {
    delete this.selectedChannels[removedMemberId];
    this.selectedChannels = { ...this.selectedChannels };
    this.cdRef.detectChanges();
  }

  removeAllTeamMembers() {
    this.selectedChips.respondents = [];
    this.selectedChips.respondents = this.selectedChips.respondents.slice();
    this.cdRef.detectChanges();
  }
  onRecurringClickOutside(event) {
    if (event && event.value == true) {
      this.showRecurringBox = false;
    }
  }
  onWaitingClickOutside(event) {
    if (event && event.value == true) {
      this.showWaitingTime = false;
    }
  }
  onEndClickOutside(event) {
    if (event && event.value == true) {
      this.showEndTime = false;
    }
  }
  onTimezoneClickOutside(event) {
    if (event && event.value == true && !this.commonService.checkClassContains(['form-control'], event.target.classList)) {
      this.showTimezoneBox = false;
    }
  }

  onEditClickOutside(event) {
    if (event && event.value == true && !this.commonService.checkClassContains(['pencil-icon', 'input-edit'], event.target.classList)) {
      this.editScrumName = false;
    }
  }
  getChannelMembers() {
    this.channel_value = false;
    this.openAddAllChannelPopup = true;
    const obj = {
      en_user_id: this.userData.en_user_id
    };
    this.scrumBotService.getGroups(obj)
      .subscribe(response => {
        const channels = response.data.joined_channels;
        publicChannels = channels.filter(item => item.chat_type == ChatTypes.PUBLIC);
        privateChannels = channels.filter(item => item.chat_type == ChatTypes.PRIVATE);
        this.channelsToShow = publicChannels;
      });
  }

  showPrivateChannel() {
    this.channel_value = !this.channel_value;
    if (this.channel_value) {
      this.channelsToShow = privateChannels;
    } else {
      this.channelsToShow = publicChannels;
    }
  }

  selectChannelMembers(channel) {

    const respondents = [];
    if (this.selectedChips.respondents.length) {
      this.selectedChips.respondents.map((user) => {
        respondents.push(user.user_id);
      });
    }
    const obj = {
      channel_id: channel.channel_id,
      en_user_id: this.userData.en_user_id,
      get_data_type: 'MEMBERS',
    };

    this.scrumBotService.getGroupMembers(obj)
      .subscribe(response => {
        let members = response.data.chat_members;
        /**
         *filter member array to select only those members who are not already selected in the chip input
         */
        members = members.filter((user) => {
          return !respondents.includes(user.user_id);
        });
        this.selectedChips.respondents = [...this.selectedChips.respondents, ...members];
        this.openAddAllChannelPopup = false;
        selectedChip = members;
        this.checkUserAvailability();
        this.cdRef.detectChanges();
      });
  }

  sendScrumDetails() {
    this.loader.show();
    const questions = this.standupForm.value.questions;
    /**
     *add position key in questions array of objects
     */
    questions.map((data, index) => {
      data.pos = index;
    });
    const week = [];

    /**
    * week array on basis of values 0,1,2
    */
    this.weekdays.forEach((item) => {
      if (item.selected) {
        week.push(item.value);
      }
    });

    const channel_ids = [];
    const user_ids = [];
    const respondents = [];
    this.selectedChips.respondents = this.selectedChips.respondents.filter(user =>
      user.is_scrum_user != true
    );
    if (this.selectedChips.respondents.length) {
      this.selectedChips.respondents.map((user) => {
        respondents.push(user.user_id);
      });
    }

    this.selectedChips.members.map((user) => {
      user_ids.push(user.user_id);
    });

    this.selectedChips.channels.map((channel) => {
      channel_ids.push(channel.channel_id);
    });
    if (!this.selectedChips.respondents.length) {
      this.loader.hide();
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Add user',
        timeout: 2000
      });
      return;
    }
    const startTimeStr = `${this.standupForm.get('schedule_hour').value}:${this.standupForm.get('schedule_min').value}`;
    let startTime;
    if (this.selectedTimeZone.offset >= 0) {
      startTime = moment(startTimeStr, 'kk:mm').subtract(this.selectedTimeZone.offset, 'minutes').format('kk:mm');
    } else {
      startTime = moment(startTimeStr, 'kk:mm').add(this.selectedTimeZone.offset, 'minutes').format('kk:mm');
    }
    const obj = {
      business_id: this.spaceData.workspace_id,
      scrum_name: this.scrum_name,
      start_day: moment(this.standupForm.get('session_start').value).format('YYYY-MM-DD'),
      time_zone: this.selectedTimeZone.offset,
      start_time: startTime,
      active_days: week,
      frequency: this.selectedRecurringTime.value,
      respondants: respondents,
      questions: questions,
      welcome_message: this.standupForm.get('welcome_message').value,
      scrum_time: this.selectedWaitingTime.value,
      end_time_reminder: this.end_time_reminder ? this.selectedEndTime.value : 0,
      delivering_result_to_users: user_ids,
      delivering_result_to_channels: channel_ids,
      end_time_text: this.end_time_reminder ? this.endTimeText : undefined
    };
    if (this.isEdit) {
      const editObj = {};
      editObj['questions'] = [];
      editObj['scrum_id'] = parseInt(this.scrumId);
      for (const data in obj) {
        if (typeof (obj[data]) == 'object' && data != 'questions') {
          if (JSON.stringify(reportData[data]) != JSON.stringify(obj[data])) {
            editObj[data] = obj[data];
          }
        } else if (data == 'questions') {
          obj[data].map(ques => {
            // if it is a new question, push the object
            if (ques.id == -2) {
              editObj[data].push(ques);
            }
            for (let i = 0; i < reportData[data].length; i++) {
              // if a question is deleted, change the id to -1 and push the object
              if (questionIdsDeleted.length) {
                if (questionIdsDeleted.includes(reportData[data][i].id)) {
                  reportData[data][i].isDeleted = true;
                  editObj[data].push(reportData[data][i]);
                }
              }
              //check if a question is different from the previous one or the postion is different
              if (reportData[data][i].id == ques.id) {
                if (reportData[data][i].question != ques.question || reportData[data][i].pos != ques.pos) {
                  if (reportData[data][i].pos != ques.pos) {
                    ques.pos_changed = true;
                  }
                  editObj[data].push(ques);
                }
              }
            }
            //empty the questiondeleted array
            questionIdsDeleted = [];
          });
        } else {
          //if it is not array, object or questions
          if (reportData[data] != obj[data]) {
            editObj[data] = obj[data];
          }
        }
      }

      if (!editObj['questions'].length) {
        editObj['questions'] = undefined;
      }
      this.scrumBotService.editScrumDetails(editObj)
        .subscribe(response => {
          this.loader.hide();
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          // this.router.navigate(['scrum-bot/dashboard']);
          this.router.navigate(['../../dashboard'], { relativeTo: this.activatedRoute });
        });
    } else {
      obj['business_id'] = this.spaceData.workspace_id,
        obj['manager_user_id'] = this.spaceData.fugu_user_id,
        this.scrumBotService.sendScrumDetails(obj)
          .subscribe(response => {
            this.loader.hide();
            this.messageService.sendAlert({
              type: 'success',
              msg: response.message,
              timeout: 2000
            });
            this.router.navigate(['../../dashboard'], { relativeTo: this.activatedRoute });
            // this.router.navigate(['scrum-bot/dashboard']);
          });
    }
  }

  setReportData() {
    /**
     * set the value of all fields in reports
     */
    this.loader.show();
    const obj = {
      business_id: this.spaceData.workspace_id,
      scrum_id: this.scrumId
    };
    this.scrumBotService.getScrumDetails(obj).subscribe(res => {
      this.loader.hide();
      if (res.data.data[0].scrum_status == 'RUNNING') {
        this.isScrumRunning = true;
        this.messageService.sendAlert({
          type: 'success',
          msg: 'Scrum is running',
          timeout: 2000
        });
      } else {
        this.isScrumRunning = false;
      }
      this.scrumBotService.reports = [];
      const [data] = res.data.data;
      this.scrum_user_Id = data.manager_user_id.user_id;
      [reportData] = JSON.parse(JSON.stringify(res.data.data));
      if (reportData.respondants.length) {
        reportData.respondants = [];
        reportData.respondants = data.respondants.map(data => {
          return data.user_id;
        });
      }
      if (reportData.delivering_result_to_users.length) {
        reportData.delivering_result_to_users = [];
        reportData.delivering_result_to_users = data.delivering_result_to_users.map(data => {
          return data.user_id;
        });
      }
      let startTime;
      if (this.selectedTimeZone.offset >= 0) {
        startTime = moment(data.start_time, 'kk:mm').add(this.selectedTimeZone.offset, 'minutes').format('kk:mm');
      } else {
        startTime = moment(data.start_time, 'kk:mm').subtract(this.selectedTimeZone.offset, 'minutes').format('kk:mm');
      }
      const time = startTime.split(':');
      this.scrum_name = data.scrum_name;
      this.standupForm.controls.session_start.setValue(data.start_day);
      this.selectedTimeZone = this.timezoneDisplayed.find((item) => {
        return item.offset == data.time_zone;
      });
      this.standupForm.controls.schedule_hour.setValue(time[0]);
      this.standupForm.controls.schedule_min.setValue(time[1]);
      this.weekdays.map((day, index) => {
        day.selected = data.active_days.includes(day.value);
      });

      this.selectedRecurringTime = {
        name: this.recurringTime[(data.frequency)].name,
        value: (data.frequency)
      };
      this.selectedChips.respondents = data.respondants;
      this.standupForm.controls.welcome_message.setValue(data.welcome_message);
      /**
       * empty the form array first to remove the previous questions to avoid adding duplicate questions
       */
      this.standupForm.setControl('questions', this.fb.array([]));

      if (data.questions) {
        data.questions.map((ques) => {
          this.addQuestion({
            question: ques.question,
            id: ques.id
          });
        });
      }
      this.selectedWaitingTime = this.waitingTime.find((item) => {
        return item.value == data.scrum_time;
      });
      if (data.end_time_reminder != 0) {
        this.selectedEndTime = this.endTime.find((item) => {
          return item.value == data.end_time_reminder;
        });
        this.endTimeText = data.end_time_text;
      }
      if (data.end_time_reminder == 0) {
        this.end_time_reminder = false;
      }
      this.selectedChips.members = data.delivering_result_to_users;
      this.selectedChips.channels = data.delivering_result_to_channels;
      this.cdRef.detectChanges();
    });
  }

  respondentSelectedResults(data) {
    /**
     * only check user availability if a user is added. don't check if a user is removed by clicking on a the cross
     */
    // if (dataLength.length < this.selectedChips.respondents.length) {
    //   this.checkUserAvailability();
    // }
    this.selectedChips.respondents = data;
    // dataLength = [...data];
  }

  respondentSelectedChip(data) {
    selectedChip.push(data);
    this.checkUserAvailability();
  }
  membersSelectedResults(data) {
    this.selectedChips.members = data;
  }
  channelsSelectedResults(data) {
    this.selectedChips.channels = data;
  }

  checkUserAvailability(type?) {
    /**
     * check to see if a user is already added in a scrum made previously,
     * if yes, then that user will not be added in the scrum, error will be displayed
     */
    const respondents = [];
    const week = [];
    if (type == 'next') {
      this.selectedChips.respondents.map((user) => {
        respondents.push(user.user_id);
      });
    } else {
      selectedChip.map((user) => {
        respondents.push(user.user_id);
      });
    }
    this.weekdays.forEach((item) => {
      if (item.selected) {
        week.push(item.value);
      }
    });
    const startTimeStr = `${this.standupForm.get('schedule_hour').value}:${this.standupForm.get('schedule_min').value}`;
    let startTime;
    if (this.selectedTimeZone.offset >= 0) {
      startTime = moment(startTimeStr, 'kk:mm').subtract(this.selectedTimeZone.offset, 'minutes').format('kk:mm');
    } else {
      startTime = moment(startTimeStr, 'kk:mm').add(this.selectedTimeZone.offset, 'minutes').format('kk:mm');
    }
    const obj = {
      business_id: this.spaceData.workspace_id,
      user_id: respondents,
      scrum_id: this.scrumId, //send scrum id in case of edit, in normal case it will undefined
      start_day: this.standupForm.get('session_start').value,
      time_zone: this.selectedTimeZone.offset,
      active_days: week,
      frequency: this.selectedRecurringTime.value,
      start_time: startTime
    };
    this.scrumBotService.checkUserAvailability(obj).subscribe(res => {
      this.scrumUsersNotAvailable = res.data.data;
      selectedChip = [];
    });
  }

  goNext() {
    this.standUpActiveStep = this.standUpActiveStep + 1;
  }

  goBack() {
    this.standUpActiveStep = this.standUpActiveStep - 1;
  }

}
