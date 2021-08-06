import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {SessionService} from '../../../../../services/session.service';
import {AttendaceBotService} from '../../attendace-bot.service';
import { CommonService } from '../../../../../services/common.service';

declare const $: any;

@Component({
  selector: 'app-leave-balance',
  templateUrl: './leave-balance.component.html',
  styleUrls: ['./leave-balance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaveBalanceComponent implements OnInit, OnDestroy {

  date_range_picker_obj = {
    start_date: this.service.createFormattedDate(new Date(), -6),
    end_date: this.service.createFormattedDate(new Date(), 0)
  };
  show_date_range_picker = false;
  @ViewChild('allLeavePaginator', { static: true }) allLeavePaginator: MatPaginator;
  @ViewChild('punchTablePaginator') punchTablePaginator: MatPaginator;
  userLeaveSelected = false;
  searchMember;
  allLeaveBalanceCols;
  allLeaveBalanceDisplayedCols;
  allLeaveBalanceData = new MatTableDataSource([]);
  allLeaveBalanceLoading = false;
  leaveTypesDict = {};
  selectedUserLeaveData;
  userVacationData;
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
  selectedUserPunchData = new MatTableDataSource([]);
  editPunchObject = {
    id: null,
    punch_event: '',
    timestamp: null,
    hour: null,
    min: null,
    date_array: []
  };
  punchEditTimePicker = false;
  editPunchForm;
  get_leave_subscription;
  constructor(private cdRef: ChangeDetectorRef, private sessionService: SessionService,
              private service: AttendaceBotService, private fb: FormBuilder, public commonService: CommonService) {
                const user_details = this.sessionService.get('user_details_dict')
                this.userData = user_details[window.location.pathname.split('/')[1]];
  }

  ngOnInit() {
    this.searchMember = new FormControl();
    this.editPunchForm = this.fb.group({
      selected_date: [1, [Validators.required]],
      punch_timestamp: ['', [Validators.required]]
    });
    this.searchMember.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        this.allLeaveBalanceData.filter = data.trim().toLowerCase();
        if (this.allLeaveBalanceData.paginator) {
          this.allLeaveBalanceData.paginator.firstPage();
        }
        this.cdRef.detectChanges();
    });
    this.resetSelectedUserLeaveData();
  }
  getAllLeaveBalance() {
    // this.allLeaveBalanceData = new LeaveBalanceDataSource(this.service);
    // this.allLeaveBalanceData.loadLessons(1);
    const obj = {
      en_user_id: this.userData.en_user_id,
      users_count: 'ALL_USERS'
    };
    this.get_leave_subscription = this.service.getUserDetails(obj).subscribe(res => {
      const userData = res.data.user_data;
      this.allLeaveBalanceCols = res.data.business_leaves.filter((item) => {
        return item.status;
      });
      this.allLeaveBalanceCols.map(el => {
        this.leaveTypesDict[el.field] = {
          header: el.header,
          accrual_interval: el.accrual_interval,
          total_count: el.total_count,
        };
        el['field'] = el['field'].toString();
      });
      this.allLeaveBalanceCols.unshift({header: 'Email', field: 'email'});
      this.allLeaveBalanceCols.unshift({header: 'Name', field: 'full_name'});
      this.allLeaveBalanceDisplayedCols = this.allLeaveBalanceCols.map(el => el.field);
      for (let i = 0; i < userData.length; i++) {
        userData[i] = {...userData[i], ...userData[i].leave_balance};
      }
      this.allLeaveBalanceData = new MatTableDataSource(<any>userData);
      this.allLeaveBalanceData['paginator'] = this.allLeavePaginator;
      this.cdRef.detectChanges();
    });
  }
  getUserLeave(element) {
    this.userLeaveSelected = true;
    this.selectedUserLeaveData = element;
    const obj = {
      en_user_id: this.userData.en_user_id,
      users_count: 'USER',
      user_name: element.user_name,
      start_date: this.date_range_picker_obj.start_date,
      end_date: this.date_range_picker_obj.end_date
    };
    this.service.getUserDetails(obj).subscribe(res => {
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
      this.userVacationData = res.data.user_leaves_status;
      this.userVacationData.map(el => {
        el.leaveType = this.leaveTypesDict[el.leave_type_id].header;
        el.duration = el.days > 1 ? `${el.days} days` : `${el.days} day`;
        el.start_days = el.start_date;
      });
      const leaveData = res.data.user_data[0].leave_balance;
      this.userLeavesData = [];
      Object.keys(leaveData).map(key => {
        const temp = {
          leave_title: this.leaveTypesDict[key].header,
          balance: leaveData[key],
          total: this.leaveTypesDict[key].total_count,
          accrual_interval: this.accrualIntervalsDict[this.leaveTypesDict[key].accrual_interval],
          leave_type_id: key
        };
        this.userLeavesData.push(temp);
      });
      this.cdRef.detectChanges();
    });
  }
  resetSelectedUserLeaveData() {
    this.userLeaveSelected = false;
    this.userVacationData = [];
    this.selectedUserLeaveData = {};
    this.searchMember.setValue('');
    this.getAllLeaveBalance();
    this.cdRef.detectChanges();
  }
  onEscKeyPress() {
    if (!!$('#leaveAdjustModal').hasClass('show')) {
      $('#leaveAdjustModal').modal('toggle');
    } else {
      this.resetSelectedUserLeaveData();
    }
  }
  saveUserLeave() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      leave_type_id: this.selectedLeaveAdjustData.leave_type_id,
      leave_count: this.selectedLeaveAdjustData.new_balance.toString(),
      user_name: this.selectedUserLeaveData.user_name
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
    // $('#adjust-leave-count').val(new_balance);
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
    this.getUserLeave(this.selectedUserLeaveData);
  }
  onEditPunchClick(data) {
    this.editPunchObject = data;
    this.editPunchObject.date_array = this.create3dateArray(data.timestamp, [-1 , 0 , 1]);
    this.editPunchObject['hour'] = new Date(data.timestamp).getHours();
    this.editPunchObject['min'] = new Date(data.timestamp).getMinutes();
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
    this.service.updatePunchTimings(obj).subscribe((res) => {});
  }
  ngOnDestroy(): void {
    this.get_leave_subscription.unsubscribe();
  }
}
