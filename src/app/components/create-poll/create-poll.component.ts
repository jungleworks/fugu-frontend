import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonService} from '../../services/common.service';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.scss']
})
export class CreatePollComponent implements OnInit {

  pollForm: FormGroup;
  pollOptions: FormArray;
  daysOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  hoursOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 , 17, 18, 19, 20, 21, 22, 23];
  @Output() closeCreatePoll: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sendPollMessage: EventEmitter<object> = new EventEmitter<object>();
  constructor(private formBuilder: FormBuilder, private commonService: CommonService) { }

  ngOnInit() {
    this.pollForm = this.formBuilder.group({
      question: ['', Validators.required],
      poll_options: this.formBuilder.array([ this.createOption() ]),
      multiple_select: '',
      days: [''],
      hours: ['']
    });
    //for 2 options at a time.
    this.addOption();
    /**
     * setting default values, days to 7 days.
     */
    this.pollForm.patchValue({
      multiple_select: false,
      days: 7,
      hours: 0
    });
  }

  createOption(): FormGroup {
    return this.formBuilder.group({
      label: ['', Validators.required],
      puid: this.commonService.generateRandomString(),
      users_map: {},
      poll_count: 0
    });
  }

  addOption(): void {
    if (this.pollOptions && this.pollOptions.length >= 10) {
      return;
    }
    this.pollOptions = this.pollForm.get('poll_options') as FormArray;
    this.pollOptions.push(this.createOption());
  }

  removeOption(index): void {
    this.pollOptions.removeAt(index);
  }

  /**
   * expire time is in seconds so we multiply and convert it.
   */
  createPoll() {
    const message_obj = {};
    let expire_time = 0;
    Object.keys(this.pollForm.controls).forEach(key => {
      if ('days' == key) {
        expire_time += this.pollForm.controls[key].value * 86400;
      } else if ('hours' == key) {
        expire_time += this.pollForm.controls[key].value * 3600;
      } else {
        message_obj[key] = this.pollForm.controls[key].value;
      }
    });
    message_obj['expire_time'] = expire_time;
    this.sendPollMessage.emit(message_obj);
    this.closeCreatePoll.emit(true);
  }

  onDayChange() {
    if (this.pollForm.controls.days.value == 0) {
      this.hoursOptions = this.hoursOptions.slice(1);
      if (this.pollForm.controls.hours.value == 0) {
        this.pollForm.patchValue({
          hours: 1
        });
      }
    } else {
      if (!this.hoursOptions.includes(0)) {
        this.hoursOptions.unshift(0);
        this.pollForm.patchValue({
          hours: 0
        });
      }
    }
  }
}
