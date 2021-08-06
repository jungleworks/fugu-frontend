import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {SessionService} from '../../../../../services/session.service';
import {AttendaceBotService} from '../../attendace-bot.service';
import {MessageService} from '../../../../../services/message.service';
import {CommonService} from '../../../../../services/common.service';

declare const $: any;

@Component({
  selector: 'app-leave-types',
  templateUrl: './leave-types.component.html',
  styleUrls: ['./leave-types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaveTypesComponent implements OnInit, OnDestroy {

  newLeaveTypeForm;
  editLeaveForm;
  userData;
  leaveTypesData;
  accrualIntervalsDict = {
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    HALF_YEARLY: 'Half Yearly',
    ANNUALLY: 'Annually',
  };
  accrualIntervals = [
    {
      name: 'Monthly',
      value: 'MONTHLY'
    },
    {
      name: 'Quarterly',
      value: 'QUARTERLY'
    },
    {
      name: 'Half Yearly',
      value: 'HALF_YEARLY'
    },
    {
      name: 'Annually',
      value: 'ANNUALLY'
    }
  ];
  createLeaveButtonClicked = false;
  selectedEditedLeaveData;
  selectedAccrualInterval = {};
  showIntervalBox = false;
  get_leave_types_subscription;
  constructor(private sessionService: SessionService, private service: AttendaceBotService,
              private commonService: CommonService,
              private cdRef: ChangeDetectorRef, private fb: FormBuilder, private messageService: MessageService) { }

  ngOnInit() {
    const user_details = this.sessionService.get('user_details_dict')
    this.userData = user_details[window.location.pathname.split('/')[1]];
    this.initNewLeaveTypeForm();
    this.initEditLeaveForm();
    this.getAllLeaveTypes();
  }

  initNewLeaveTypeForm() {
    this.newLeaveTypeForm = this.fb.group({
      title: ['', [Validators.required]],
      synonym: ['', [Validators.required]]
    });
  }
  initEditLeaveForm() {
    this.editLeaveForm = this.fb.group({
      title: ['', [Validators.required]],
      synonym: ['', [Validators.required]],
      annual_count: ['', [Validators.required, Validators.min(0)]],
      annual_rollover: ['', [Validators.required]],
      is_unlimited: [true, []],
      is_negative: [true, []]
    });
  }
  getAllLeaveTypes() {
    const obj = {
      en_user_id: this.userData.en_user_id
    };
    this.get_leave_types_subscription = this.service.getBusinessLeaves(obj).subscribe(res => {
      this.leaveTypesData = res.data;
      this.leaveTypesData.map(el => {
        el.accrual_interval = this.accrualIntervalsDict[el.accrual_interval];
      });
      this.cdRef.detectChanges();
    });
  }
  createNewLeave() {
    this.createLeaveButtonClicked = true;
    if (this.newLeaveTypeForm.invalid) {
      return;
    } else {
      this.createLeaveButtonClicked = false;
    }
    let synonym = this.newLeaveTypeForm.value.synonym.toLowerCase().split(',');
    synonym = synonym.map(el => el = el.trim());
    const obj = {
      en_user_id: this.userData.en_user_id,
      leave_title: this.newLeaveTypeForm.value.title,
      leave_synonyms: synonym
    };
    this.service.editBusinessLeaves(obj).subscribe(res => {
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
      const newItem = {
        accrual_interval: 'Annually',
        annual_count: -1,
        leave_type_id: res.data.leave_type_id,
        synonyms: this.newLeaveTypeForm.value.synonym.toLowerCase().split(','),
        title: this.newLeaveTypeForm.value.title,
        max_annual_rollover: 0,
        status: 1
      };
      this.leaveTypesData.push(newItem);
      this.leaveTypesData = [...this.leaveTypesData];
      this.newLeaveTypeForm.reset();
      this.cdRef.detectChanges();
    }, err => {
      this.messageService.sendAlert({
        type: 'error',
        msg: err.error.message,
        timeout: 3000
      });
    });
  }
  editLeaveTypeStatus(element) {
    if (element.status == 1) {
      element.status = 0;
    } else {
      element.status = 1;
    }
    const obj = {
      leave_type_id: element.leave_type_id,
      en_user_id: this.userData.en_user_id,
      status: element.status
    };
    this.service.editBusinessLeaves(obj).subscribe(res => {});
  }
  onEditLeaveClick(element) {
    this.selectedEditedLeaveData = element;
    for (let i = 0; i < this.accrualIntervals.length; i++) {
      const el = this.accrualIntervals[i];
      if (el.name == element.accrual_interval) {
        this.selectedAccrualInterval = el;
        break;
      }
    }
    this.editLeaveForm.setValue({
      title: element.title,
      synonym: element.synonyms ? element.synonyms.toString() : '',
      annual_count: element.annual_count < 0 ? 0 : element.annual_count,
      annual_rollover: element.max_annual_rollover,
      is_unlimited: element.annual_count < 0,
      is_negative: element.is_negative_leave_allowed == 1,
    });
  }
  editLeaveSubmit() {
    let synonym = this.editLeaveForm.value.synonym.toLowerCase().split(',');
    synonym = synonym.map(el => el = el.trim());
    const obj = {
      leave_type_id: this.selectedEditedLeaveData.leave_type_id,
      en_user_id: this.userData.en_user_id,
      leave_title: this.editLeaveForm.value.title,
      leave_synonyms: synonym,
      annual_count: this.editLeaveForm.value.is_unlimited ? '-1' : this.editLeaveForm.value.annual_count.toString(),
      accrual_interval: this.selectedAccrualInterval['value'],
      max_annual_rollover: this.editLeaveForm.value.annual_rollover.toString(),
      is_negative_leave_allowed: this.editLeaveForm.value.is_negative ? 1 : 0
    };
    if (this.editLeaveForm.value.is_unlimited) {
      obj['is_negative_leave_allowed'] = 1;
    }
    this.service.editBusinessLeaves(obj).subscribe(res => {
      $('#leaveEditModal').modal('hide');
      for (let i = 0; i < this.leaveTypesData.length; i++) {
        const el = this.leaveTypesData[i];
        if (el.leave_type_id == this.selectedEditedLeaveData.leave_type_id) {
          el.title = this.editLeaveForm.value.title;
          el.synonyms = this.editLeaveForm.value.synonym.toLowerCase().split(',');
          el.annual_count = this.editLeaveForm.value.is_unlimited ? -1 : this.editLeaveForm.value.annual_count;
          el.accrual_interval = this.selectedAccrualInterval['name'];
          el.max_annual_rollover = this.editLeaveForm.value.annual_rollover;
          el.is_negative_leave_allowed = this.editLeaveForm.value.is_negative ? 1 : 0;
          break;
        }
      }
      this.leaveTypesData = [...this.leaveTypesData];
      this.cdRef.detectChanges();
    }, err => {
      this.messageService.sendAlert({
        type: 'error',
        msg: err.error.message,
        timeout: 3000
      });
    });
  }
  chooseInterval(item) {
    this.selectedAccrualInterval = item;
    this.showIntervalBox = false;
  }
  onIntervalClickOutside(event) {
    if (event && event.value == true && !this.commonService.checkClassContains(['form-control-plaintext'], event.target.classList)) {
      this.showIntervalBox = false;
    }
  }
  ngOnDestroy(): void {
    this.get_leave_types_subscription.unsubscribe();
  }
}
