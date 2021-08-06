import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {SessionService} from '../../../../../services/session.service';
import {AttendaceBotService} from '../../attendace-bot.service';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {MessageService} from '../../../../../services/message.service';
import {CommonService} from '../../../../../services/common.service';
import {AttendanceRoles} from '../../../../../enums/app.enums';

declare const $: any;
declare const moment: any;

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {

  date_range_picker_obj = {
    start_date: this.service.createFormattedDate(new Date(), -6),
    end_date: this.service.createFormattedDate(new Date(), 0)
  };
  show_date_range_picker = false;
  @ViewChild('punchTablePaginator', { static: true }) punchTablePaginator: MatPaginator;
  @ViewChild('vacationDataPaginator', { static: true }) vacationDataPaginator: MatPaginator;
  leaveTypesDict = {};
  allLeaveTypesDict = {};
  selectedUserLeaveData;
  enterStartTime = false;
  userVacationData = new MatTableDataSource([]);
  userLeavesData;
  accrualIntervalsDict = {
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    HALF_YEARLY: 'Half Yearly',
    ANNUALLY: 'Annually',
  };
  selectedLeaveAdjustData;
  userData;
  leaveAdjustMode = 'add';
  selectedUserData;
  userProfileForm;
  selectedUserPunchData = new MatTableDataSource([]);
  editPunchObject = {
    id: null,
    punch_event: '',
    timestamp: null,
    hour: null,
    min: null,
    date_array: []
  };
  weekdays = [
    {
      name: 'Sunday',
      id: 0,
      selected: false
    },
    {
      name: 'Monday',
      id: 1,
      selected: false
    },
    {
      name: 'Tuesday',
      id: 2,
      selected: false
    },
    {
      name: 'Wednesday',
      id: 3,
      selected: false
    },
    {
      name: 'Thursday',
      id: 4,
      selected: false
    },
    {
      name: 'Friday',
      id: 5,
      selected: false
    },
    {
      name: 'Saturday',
      id: 6,
      selected: false
    },
  ];
  punchEditTimePicker = false;
  startTimeTimePicker = false;
  disableEditFields = false;
  editPunchForm;
  userRole;
  selected_user_id;
  get_leave_subscription;
  attendanceRolesEnum = AttendanceRoles;
  range_max_date = this.service.createFormattedDate(new Date(), 0);
  currentDate;
  reportDatesForm: FormGroup;

  constructor(private cdRef: ChangeDetectorRef, private sessionService: SessionService, private messageService: MessageService,
              private service: AttendaceBotService, private fb: FormBuilder,
              private activatedRoute: ActivatedRoute, public commonService: CommonService) {
  }

  ngOnInit() {
    this.initReportForm();
    this.currentDate = new Date();
    const user_details = this.sessionService.get('user_details_dict');
    this.userData = user_details[window.location.pathname.split('/')[1]];
    this.userData.user_name = localStorage.getItem('attendance_user_name');
    this.activatedRoute.params.subscribe(params => {
      this.selected_user_id = params.user_id;
      this.getUserLeave();
    });
    this.userData.role = localStorage.getItem('attendance_role');
    if (this.userData.role) {
      this.userRole = this.userData.role;
    } else {
      this.userRole = 'ADMIN';
    }
    if (this.userRole == AttendanceRoles.USER ||
      (this.userData.user_name == this.selected_user_id && this.userRole == AttendanceRoles.MANAGER)) {
         this.disableEditFields = true;
    }
    this.userProfileForm = this.fb.group({
      joining_date: [{value: '', disabled: true}],
      birth_date: [{value: '', disabled: true}],
      shift_start_time: [{value: '', disabled: this.disableEditFields}, [Validators.required]],
      work_hours: [{value: '', disabled: this.disableEditFields}, [Validators.required]],
      employee_id: [{value: '', disabled: this.disableEditFields}],
      punch_in_permission: [{value: 'NONE', disabled: this.disableEditFields}, [Validators.required]],
      punch_out_permission: [{value: 'NONE', disabled: this.disableEditFields}, [Validators.required]]
    });
    this.editPunchForm = this.fb.group({
      selected_date: [1, [Validators.required]],
      punch_timestamp: ['', [Validators.required]]
    });
    this.resetSelectedUserLeaveData();
    $('#leaveAdjustModal').on('show.bs.modal', (e) => {
      $('#adjust-leave-count').val(0);
    });
  }

  initReportForm() {
    this.reportDatesForm = this.fb.group({
      report_start: ['', [Validators.required]],
      report_end: ['', [Validators.required]]
    });
  }

  getUserLeave() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      users_count: 'USER',
      user_name: this.selected_user_id,
      start_date: this.date_range_picker_obj.start_date,
      end_date: this.date_range_picker_obj.end_date
    };
    this.get_leave_subscription = this.service.getUserDetails(obj).subscribe(res => {
      res.data.business_leaves.map(el => {
        this.allLeaveTypesDict[el.field] = {
          header: el.header,
          accrual_interval: el.accrual_interval,
          total_count: el.total_count,
        };
        if (el.status) {
          this.leaveTypesDict[el.field] = this.allLeaveTypesDict[el.field];
        }
        el['field'] = el['field'].toString();
      });
      const punchData = [];
      res.data.punchings.forEach((item) => {
        if (item.time_out) {
          punchData.push({
            id: item.id,
            punch_event: 'IN',
            timestamp: item.punch_in
          });
          punchData.push({
            id: item.id,
            punch_event: 'OUT',
            timestamp: item.punch_out
          });
        } else {
          punchData.push({
            id: item.id,
            punch_event: 'IN',
            timestamp: item.punch_in
          });
        }
      });
      this.selectedUserPunchData = new MatTableDataSource(<any>punchData);
      this.selectedUserPunchData['paginator'] = this.punchTablePaginator;
      this.selectedUserData = res.data.user_data[0];
      this.userProfileForm.setValue({
        joining_date: this.selectedUserData.joining_date,
        birth_date: this.selectedUserData.birth_date,
        employee_id: this.selectedUserData.employee_id,
        shift_start_time: this.selectedUserData.shift_start_time ?
          this.service.setStartTimeDateObject(this.selectedUserData.shift_start_time) : '',
        work_hours: this.selectedUserData.work_hours ? parseFloat((this.selectedUserData.work_hours / 60).toFixed(1)) : '',
        punch_in_permission: this.selectedUserData.config.punch_in_permission,
        punch_out_permission: this.selectedUserData.config.punch_out_permission
      });
      if (this.selectedUserData.work_days) {
        this.selectedUserData.work_days.map((day) => {
          this.weekdays[day].selected = true;
        });
      }
      const vacationData = res.data.user_leaves_status;
      vacationData.map(el => {
        el.leaveType = this.allLeaveTypesDict[el.leave_type_id].header;
        el.duration = el.days > 1 ? `${el.days} days` : `${el.days} day`;
        el.start_days = el.start_date;
      });
      this.userVacationData = new MatTableDataSource(<any>vacationData);
      this.userVacationData['paginator'] = this.vacationDataPaginator;
      const leaveData = res.data.user_data[0].leave_balance;
      this.userLeavesData = [];
      Object.keys(leaveData).map(key => {
        if (this.leaveTypesDict[key]) {
          const temp = {
            leave_title: this.leaveTypesDict[key].header,
            balance: leaveData[key],
            total: this.leaveTypesDict[key].total_count,
            accrual_interval: this.accrualIntervalsDict[this.leaveTypesDict[key].accrual_interval],
            leave_type_id: key
          };
          this.userLeavesData.push(temp);
        }
      });
      this.cdRef.detectChanges();
    });
  }

  resetSelectedUserLeaveData() {
    this.userVacationData = new MatTableDataSource(<any>[]);
    this.selectedUserLeaveData = {};
    this.cdRef.detectChanges();
  }

  saveUserLeave() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      leave_type_id: this.selectedLeaveAdjustData.leave_type_id,
      leave_count: this.selectedLeaveAdjustData.new_balance.toString(),
      user_name: this.selectedUserData.user_name
    };
    this.service.editUserLeave(obj).subscribe(res => {
      this.selectedLeaveAdjustData.balance = this.selectedLeaveAdjustData.new_balance;
      $('#leaveAdjustModal').modal('hide');
      this.cdRef.detectChanges();
    });
  }

  onEditUserLeaveClick(element) {
    this.selectedLeaveAdjustData = element;
    this.selectedLeaveAdjustData.new_balance = element.balance;
    // this.showLeaveAdjustModal = true;
  }

  setLeaveAdjustMode(type) {
    this.leaveAdjustMode = type;
    let new_balance;
    if (type == 'add') {
      new_balance = this.selectedLeaveAdjustData.balance + +$('#adjust-leave-count').val();
    } else if (type == 'subtract') {
      new_balance = this.selectedLeaveAdjustData.balance - +$('#adjust-leave-count').val();
    }
    this.selectedLeaveAdjustData.new_balance = new_balance;
  }

  onLeaveAdjust(event) {
    if (this.leaveAdjustMode == 'add') {
      this.selectedLeaveAdjustData.new_balance = this.selectedLeaveAdjustData.balance + +event.target.value;
    } else if (this.leaveAdjustMode == 'subtract') {
      this.selectedLeaveAdjustData.new_balance = this.selectedLeaveAdjustData.balance - +event.target.value;
    }
  }

  onDateSelected(data) {
    this.date_range_picker_obj = {
      start_date: data.start_date,
      end_date: data.end_date
    };
    this.getUserLeave();
  }

  onEditPunchClick(data) {
    this.editPunchObject = data;
    this.editPunchObject.date_array = this.create3dateArray(data.timestamp, [-1, 0, 1]);
    this.editPunchObject['hour'] = new Date(data.timestamp).getHours();
    if (this.editPunchObject['hour'] < 10) {
      this.editPunchObject['hour'] = '0' + this.editPunchObject['hour'];
    }
    this.editPunchObject['min'] = new Date(data.timestamp).getMinutes();
    if (this.editPunchObject['min'] < 10) {
      this.editPunchObject['min'] = '0' + this.editPunchObject['min'];
    }
    $('#punchTimingUpdateModal').modal('show');
    this.editPunchForm.patchValue({
      punch_timestamp: this.editPunchObject['hour'] + ':' + this.editPunchObject['min']
    });
  }

  onPunchTimeChange(data) {
    data.formControl.setValue(data.time);
  }

  create3dateArray(date, days_array) {
    const array = [];
    days_array.map((item, index) => {
      const d = new Date(date);
      d.setDate(d.getDate() + item);
      array.push({
        id: index,
        date: d
      });
    });
    return array;
  }

  updatePunchTiming() {
    const updated_timestamp =
      new Date(`${this.service.formatDate(this.editPunchObject.date_array[this.editPunchForm.controls.selected_date.value].date)} ${this.editPunchForm.controls.punch_timestamp.value}:00`)
        .toISOString();
    const obj = {
      en_user_id: this.userData.en_user_id,
      punch_id: this.editPunchObject.id,
      punch_in_time: this.editPunchObject.punch_event == 'IN' ? updated_timestamp : undefined,
      punch_out_time: this.editPunchObject.punch_event == 'OUT' ? updated_timestamp : undefined,
    };
    this.service.updatePunchTimings(obj)
      .subscribe((res) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
        this.getUserLeave();
        this.punchEditTimePicker = false;
        $('#punchTimingUpdateModal').modal('hide');
      });
  }
  updateUserProfile() {
    if (this.userProfileForm.invalid) {
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Please fill all the required fields',
        timeout: 2000
      });
      return;
    }
    const obj = {
      en_user_id: this.userData.en_user_id,
      action_user_name: this.selectedUserData.user_name,
      employee_id: (<HTMLInputElement>document.getElementById('employee_id')).value.trim(),
      joining_date: this.userProfileForm.get('joining_date').value ?
        moment(this.userProfileForm.get('joining_date').value).format('YYYY-MM-DD') : undefined,
      birth_date: this.userProfileForm.get('birth_date').value ?
        moment(this.userProfileForm.get('birth_date').value).format('YYYY-MM-DD') : undefined,
      shift_start_time: this.service.returnStartTimeDateObject(this.userProfileForm.get('shift_start_time').value),
      work_hours: this.userProfileForm.get('work_hours').value * 60,
      config: {
        punch_in_permission: this.userProfileForm.get('punch_in_permission').value,
        punch_out_permission: this.userProfileForm.get('punch_out_permission').value
      }
    };
    if (Object.keys(obj).length < 3) {
      return;
    }
    this.service.editUserDetails(obj)
      .subscribe((res) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
      });
  }
  startTimeChange(data) {
    data.formControl.setValue(data.time);
    this.startTimeTimePicker = false;
  }
  onWeekdayChange(day) {
    day.selected = !day.selected;
  }
  onTimePickerClickOutside(event, type) {
    if (event && event.value == true && !this.commonService.checkClassContains(['time-picker-input'], event.target.classList)) {
      switch (type) {
        case 'startTime':
          this.startTimeTimePicker = false;
          break;
        case 'punchTime':
          this.punchEditTimePicker = false;
          break;
      }
    }
  }
  updateWorkingWeek() {
    const week = [];
    this.weekdays.forEach((item) => {
      if (item.selected) {
        week.push(item.id);
      }
    });
    const obj = {
      en_user_id: this.userData.en_user_id,
      action_user_name: this.selectedUserData.user_name,
      work_days: week
    };
    this.service.editUserDetails(obj)
      .subscribe((res) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
    });
  }

  /**
   * remove user punch image
   */
  removePunchImage() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      action_user_name: this.selectedUserData.user_name,
      user_punch_image: null
    };
    this.service.editUserDetails(obj)
      .subscribe((res) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: 'Image removed successfully.',
          timeout: 3000
        });
        this.selectedUserData.user_punch_image = null;
        this.cdRef.detectChanges();
      });
  }
  goBack() {
    window.history.back();
  }
  onReportDateChange(event, type) {
    const d = event.value;
    if (type == 'start') {
      this.reportDatesForm.controls.report_start.setValue(moment(d).format('YYYY-MM-DD'));
    } else if (type == 'end') {
      this.reportDatesForm.controls.report_end.setValue(moment(d).format('YYYY-MM-DD'));
    }
  }

  fetchAttendanceReport() {
    if(!this.reportDatesForm.valid) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Please fill start date and end date',
        timeout: 2000
      });
      return ;
    }
    const startDate = moment(this.reportDatesForm.controls.report_start.value, "YYYY-MM-DD");
    const endDate =  moment(this.reportDatesForm.controls.report_end.value, "YYYY-MM-DD");
    const difference = endDate.diff(startDate, 'days');

    if(difference > 62) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Date range cannot be more than 60 days',
        timeout: 3000
      });
      return ;
    }

    const obj = {
      en_user_id: this.userData.en_user_id,
      action_user_name: this.selectedUserData.user_name,
      start_date: moment(this.reportDatesForm.controls.report_start.value).format('YYYY-MM-DD'),
      end_date: moment(this.reportDatesForm.controls.report_end.value).format('YYYY-MM-DD'),
    };
     this.service.fetchAttendanceReport(obj).subscribe(
       (response) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
       });
  }

  ngOnDestroy(): void {
    this.get_leave_subscription.unsubscribe();
  }
}
