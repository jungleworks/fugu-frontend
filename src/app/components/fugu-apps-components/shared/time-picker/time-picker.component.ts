import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {
  timeForm;
  @Input() hour;
  @Input() min;
  @Input() formControlInput;
  @Output() timeChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    const hour = this.hour ? this.hour : '10';
    const min = this.min ? this.min : '00';
    this.timeForm = this.fb.group({
      hour: [hour, [Validators.required, Validators.min(0), Validators.max(23)]],
      min: [min, [Validators.required, Validators.min(0), Validators.max(59)]],
    });
  }
  changeTime(type, amount) {
    if (type == 'hour') {
      let value = this.timeForm.value.hour;
      value = +value + amount;
      if (value >= 0 && value <= 23) {
        if (value < 10) {
          value = '0' + value;
        }
        this.timeForm.controls.hour.setValue(value);
      }
    } else if (type == 'min') {
      let value = this.timeForm.value.min;
      value = +value + amount;
      if (value >= 0 && value <= 59) {
        if (value < 10) {
          value = '0' + value;
        }
        this.timeForm.controls.min.setValue(value);
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

  saveTime() {
    if (this.timeForm.valid) {
      this.timeChange.emit({
        time: `${this.timeForm.value.hour}:${this.timeForm.value.min}`,
        formControl: this.formControlInput
      });
    }
  }
}
