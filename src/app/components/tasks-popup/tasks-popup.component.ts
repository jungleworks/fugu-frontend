import {Component, OnInit, Output, EventEmitter, ChangeDetectorRef, Input} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {ChatService} from '../chat/chat.service';
import {SessionService} from '../../services/session.service';
import {MessageService} from '../../services/message.service';
import {LoaderService} from '../../services/loader.service';
import {FormBuilder, Validators} from '@angular/forms';
import {SocketioService} from '../../services/socketio.service';
import {CommonApiService} from '../../services/common-api.service';
import {LayoutService} from '../layout/layout.service';
import {messageModalAnimation} from '../../animations/animations';

declare const moment: any;

@Component({
  selector: 'app-tasks-popup',
  templateUrl: './tasks-popup.component.html',
  styleUrls: ['./tasks-popup.component.css'],
  animations: [
    messageModalAnimation
  ]
})
export class TasksPopupComponent implements OnInit {
  @Output()
  closePopup: EventEmitter<object> = new EventEmitter<object>();
  @Input() membersInfo;
  @Input() user_count;

  constructor(public commonService: CommonService, private service: ChatService, private sessionService: SessionService,
              private messageService: MessageService, private loader: LoaderService, private formBuilder: FormBuilder,
              private cdRef: ChangeDetectorRef, public socketService: SocketioService, private commonApiService: CommonApiService,
              public layoutService: LayoutService) {
  }

  showSelectMembersPopup = false;
  taskDateForm;
  taskDescription;
  taskTitle;
  selUserIds;
  isSelectAll;
  startDate;
  startTime;
  endTime;
  endDate;
  remTime;
  remDate;
  activeChannelId;
  spaceData;
  editData: any;
  reminders = [{name: '10 Min', value: 10}, {name: '15 Min', value: 15}, {name: '30 Min', value: 30},
    {name: '1 hour', value: 60}];

  @Input()
  set taskDataEdit(task) {
    this.taskDateForm = this.formBuilder.group({
      task_start: [this.setDateFormat(), [Validators.required]],
      time_start: [this.setTimeFormat(), [Validators.required]],
      task_end: [this.setDateFormat(), [Validators.required]],
      time_end: [this.setTimeFormat(), [Validators.required]],
      reminder: [this.reminders[0].value, [Validators.required]]
    });

    this.startDate = this.setDateFormat();
    this.startTime = this.setTimeFormat();
    this.endDate = this.setDateFormat();
    this.endTime = this.setTimeFormat();

    if (task) {
      this.membersInfo = task.user_data;
      this.editData = task;
      this.taskDescription = task.description;
      this.taskTitle = task.title;

      this.taskDateForm.patchValue({
        reminder: task.reminder,
        task_start: this.setDateFormat(task.start_datetime),
        time_start: this.setTimeFormat(task.start_datetime),
        task_end: this.setDateFormat(task.end_datetime),
        time_end: this.setTimeFormat(task.end_datetime)
      });

      // this.taskDateForm.controls.reminder.setValue(task.reminder);
      // this.taskDateForm.controls.task_start.setValue(this.setTimeFormat(task.start_datetime));
      // this.taskDateForm.controls.time_start.setValue(this.setDateFormat(task.start_datetime));
      // this.taskDateForm.controls.task_end.setValue(this.setDateFormat(task.end_datetime));
      // this.taskDateForm.controls.time_end.setValue(this.setDateFormat(task.end_datetime));

      this.startDate = this.setDateFormat(task.start_datetime);
      this.startTime = this.setTimeFormat(task.start_datetime);
      this.endDate = this.setDateFormat(task.end_datetime);
      this.endTime = this.setTimeFormat(task.end_datetime);
      this.isSelectAll = task.is_selected_all;
      this.cdRef.detectChanges();
    }
  }

  ngOnInit(): void {
    this.spaceData = this.commonService.currentOpenSpace;
    this.activeChannelId = Number(window.location.pathname.split('/')[3]);
  }

  setDateFormat(date?) {
    return moment(date).format('YYYY-MM-DD');
  }

  setTimeFormat(time?) {
    return moment(time).format('hh:mm A');
  }

  onReportDateChange(event, type) {
    const d = event.value;
    if (type == 'start') {
      this.taskDateForm.controls.task_start.setValue(this.setDateFormat(d));
      this.startDate = this.taskDateForm.controls.task_start.value;
    } else if (type == 'end') {
      this.taskDateForm.controls.task_end.setValue(this.setDateFormat(d));
      this.endDate = this.taskDateForm.controls.task_end.value;
    }
  }

  onTimeChange(event, type) {
    if (type == 'start') {
      this.startTime = event;
    } else if (type == 'end') {
      this.endTime = event;
    }
  }

  createTask() {
    if (!this.taskDateForm.valid) {
      return;
    }
    const startDateTime = this.commonService.getCombinedUTCTime(this.startDate, this.startTime);
    const endDateTime = this.commonService.getCombinedUTCTime(this.endDate, this.endTime);

    let timeNow = new Date().getTime();
    let startTemp = new Date(this.commonService.combineDates(this.startDate, this.startTime)).getTime();
    if (timeNow > startTemp) {
      this.commonService.showError('Add task for future');
      return;
    }

    let endTemp = new Date(this.commonService.combineDates(this.endDate, this.endTime)).getTime();
    if (endTemp < startTemp) {
      this.commonService.showError('Task end should be greater than start time');
      return;
    }

    const obj: any = {
      assigner_user_id: this.spaceData.fugu_user_id,
      channel_id: this.activeChannelId,
      title: this.taskTitle,
      description: this.taskDescription,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      reminder: this.taskDateForm.value.reminder,
      is_selected_all: this.isSelectAll ? 1 : 0,
      workspace_id: this.spaceData.workspace_id
    };

    if (!this.editData) {
      if (!this.isSelectAll) {
        if (this.selUserIds) {
          obj.user_ids = this.selUserIds;
        } else {
          this.commonService.showError('Please select atleast 1 member');
          return;
        }
      }
    }

    let url = 'task/assignTask';
    if (this.editData) {
      obj.task_id = this.editData.task_id;
      obj.is_deleted = 0;
      url = 'task/editTaskDetails';
    }
    this.commonApiService.assignTask(obj, url).subscribe((response) => {
      this.messageService.sendAlert({type: 'success', msg: response.message || 'Task added', timeout: 2000});
      this.closePopup.emit();
      this.cdRef.detectChanges();
    });
  }

  selectedMembers(data) {
    this.selUserIds = data;
    this.membersInfo = data;
    this.showSelectMembersPopup = false;
  }
}
