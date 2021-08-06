import {Component, OnInit, Output, EventEmitter, ChangeDetectorRef, Input} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {ChatService} from '../chat/chat.service';
import {SessionService} from '../../services/session.service';
import {MessageService} from '../../services/message.service';
import {LoaderService} from '../../services/loader.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {SocketioService} from '../../services/socketio.service';
import {CommonApiService} from '../../services/common-api.service';
import {LayoutService} from '../layout/layout.service';
import {messageModalAnimation} from '../../animations/animations';
import {ApiService} from '../../services/api.service';

declare const moment: any;

@Component({
  selector: 'app-submit-task-popup',
  templateUrl: './submit-task-popup.component.html',
  styleUrls: ['./submit-task-popup.component.css'],
  animations: [
    messageModalAnimation
  ]
})
export class SubmitTaskPopupComponent implements OnInit {
  @Output()
  closePopup: EventEmitter<object> = new EventEmitter<object>();
  @Input() membersInfo;
  @Input() user_count;

  showSubmit = false;
  selectedUser = '';
  userData;
  fugu_config;
  showEdit = false;
  savedData;
  showAssignTaskPopup = false;

  constructor(public commonService: CommonService, private service: ChatService, private sessionService: SessionService,
              private messageService: MessageService, private loader: LoaderService, private formBuilder: FormBuilder,
              private cdRef: ChangeDetectorRef, public socketService: SocketioService, private commonApiService: CommonApiService,
              public layoutService: LayoutService, private api: ApiService) {
  }

  taskDateForm;
  taskDescription;
  taskTitle;
  content = new FormControl('');
  startDate;
  startTime;
  endTime;
  endDate;
  remTime;
  remDate;
  activeChannelId;
  spaceData;
  editData: any;
  isAdmin: boolean = false;

  @Input()
  set taskDataEdit(task) {
    this.taskDateForm = this.formBuilder.group({
      task_start: ['', [Validators.required]],
      time_start: ['', [Validators.required]],
      task_end: ['', [Validators.required]],
      task_rem: ['', [Validators.required]],
      time_rem: ['', [Validators.required]],
      time_end: ['', [Validators.required]]
    });
    if (task) {
      this.membersInfo = task.user_data;

      this.editData = task;
      if (task.task_work) {
        this.content.patchValue(task.content);
      }
      this.taskDescription = task.description;
      this.taskTitle = task.title;
      this.taskDateForm.controls.task_start.setValue(moment(task.start_datetime).format('YYYY-MM-DD'));
      this.startDate = moment(task.start_datetime).format('YYYY-MM-DD');

      this.taskDateForm.controls.time_start.setValue(moment(task.start_datetime).format('hh:mm A'));
      this.startTime = moment(task.start_datetime).format('hh:mm A');

      this.taskDateForm.controls.task_end.setValue(moment(task.end_datetime).format('YYYY-MM-DD'));
      this.endDate = moment(task.end_datetime).format('YYYY-MM-DD');

      this.taskDateForm.controls.time_end.setValue(moment(task.end_datetime).format('hh:mm A'));
      this.endTime = moment(task.end_datetime).format('hh:mm A');

      this.taskDateForm.controls.task_rem.setValue(moment(task.reminder_datetime).format('YYYY-MM-DD'));
      this.remDate = moment(task.reminder_datetime).format('YYYY-MM-DD');

      this.taskDateForm.controls.time_rem.setValue(moment(task.reminder_datetime).format('hh:mm A'));
      this.remTime = moment(task.reminder_datetime).format('hh:mm A');

      this.cdRef.detectChanges();
    }
  }

  ngOnInit(): void {
    this.spaceData = this.commonService.currentOpenSpace;
    this.activeChannelId = Number(window.location.pathname.split('/')[3]);
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.fugu_config = this.sessionService.get('loginData/v1')['fugu_config'];
    this.getTaskDetails();
  }

  meetingStatus = 'join';

  checkAdmin() {
    if (this.editData.assigner_user_id == this.userData.user_id) {
      this.isAdmin = true;
      if (this.commonService.getCurrentUtc() < this.editData.start_datetime) {
        this.showEdit = true;
      } else {
        this.showEdit = false;
      }
    } else {
      if (this.commonService.getCurrentUtc() < this.editData.start_datetime) {
        this.showSubmit = false;
        this.meetingStatus = 'before';
      } else if (this.commonService.getCurrentUtc() > this.editData.end_datetime) {
        this.showSubmit = false;
        this.meetingStatus = 'after';
      } else {
        this.showSubmit = true;
      }
    }
  }

  userChange() {
    if (this.selectedUser) {
      this.getTaskDetails();
    } else {
      this.savedData = '';
    }
  }

  getTaskDetails() {
    const obj: any = {
      task_id: this.editData.task_id
    };
    if (this.selectedUser) {
      obj.user_id = this.selectedUser;
    } else {
      obj.user_id = this.userData.user_id;
    }
    this.commonApiService.getTaskDetails(obj).subscribe((response) => {
      if (this.selectedUser) {
        this.savedData = response.data;
        this.content.patchValue(this.savedData.content);
      } else {
        this.editData = response.data;
        this.checkAdmin();
      }
      this.cdRef.detectChanges();
    });
  }

  async submitTask() {
    if (!this.isAdmin) {
      if (this.commonService.getCurrentUtc() > this.editData.end_datetime) {
        this.messageService.sendAlert({
          type: 'error',
          msg: `Please wait for the task to start! Try again after ${moment(this.editData.start_datetime).format('dd/MM/yyyy, hh:mm A')}`,
          timeout: 3000
        });
        return;
      }
    }

    if (!this.content.value && !this.files) {
      this.messageService.sendAlert({
        type: 'error',
        msg: 'Please add content or file',
        timeout: 3000
      });
      return;
    }

    this.loader.show();

    const newObj: any = {
      task_id: this.editData.task_id,
      user_id: this.userData.user_id

    };
    if (this.content.value) {
      newObj.content = this.content.value;
    }
    if (this.files) {
      const file = this.files[0];
      newObj.file_size = this.commonService.calculateFileSize(file.size);
      newObj.file_name = file.name;
      newObj.muid = this.fileData.muid;
      newObj.url = this.fileData.url;
    } else {
      newObj.muid = this.commonService.generateRandomString();
    }

    const obj = {
      'url': 'task/submitTask',
      'type': 3,
      'body': newObj
    };
    this.api.postOc(obj).subscribe(res => {
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 3000
      });
      this.loader.hide();
      this.closePopup.emit();
    }, () => {
      this.loader.hide();
    });
  }

  files;
  fileData;

  fileUpload(event, is_drop = false) {
    this.loader.show();
    event.preventDefault();
    event.stopPropagation();
    if (is_drop) {
      this.files = event.dataTransfer.files;
    } else {
      this.files = event.target.files;
    }
    if (!this.files.length) {
      return;
    }
    if (this.files) {
      const file = this.files[0];
      if (file) {
        const mime_type = file['type'] || 'file/file';
        const formData: FormData = new FormData();
        const name = file.name.replace(/\,/g, '_');
        formData.append('file_name', name);
        formData.append('file_size', this.commonService.calculateFileSize(file.size));
        formData.append('file_type', mime_type);
        formData.append('file', file, file.name);
        formData.append('muid', this.commonService.generateRandomString());
        const spaceFormData = this.commonService.currentOpenSpace;
        formData.append('app_secret_key', spaceFormData['fugu_secret_key']);

        const obj = {
          'url': 'conversation/uploadFile',
          'type': 3,
          'body': formData
        };
        this.api.uploadFileFugu(obj).subscribe(res => {
          if (res.message) {
            this.fileData = res.message.data;
            this.loader.hide();
          }
        }, () => {
          this.loader.hide();
        });
        this.cdRef.detectChanges();
      }

    }
  }

  openEdit() {
    this.showAssignTaskPopup = true;
  }

  downloadVideo(url) {
    const newlink = document.createElement('a');
    newlink.setAttribute('href', this.commonService.changeS3Url(url));
    newlink.setAttribute('download', '');
    newlink.click();
    newlink.remove();
  }

  deleteTask() {
    let url = 'task/editTaskDetails';
    const obj: any = {
      task_id: this.editData.task_id,
      assigner_user_id: this.editData.assigner_user_id,
      is_deleted: 1
    };
    this.commonApiService.assignTask(obj, url).subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message || 'Task Saved Successfully',
        timeout: 2000
      });
      this.closePopup.emit();
      this.cdRef.detectChanges();
    });
  }

}
