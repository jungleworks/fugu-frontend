import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

interface IDayObject {
  date: number;
  is_disabled: boolean;
  formatted_date: string;
  tz_date: string;
}
@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent implements OnInit {

  days_header_list = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  month_names = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  calendar_obj = {
    left_cal: {
      class_name: 'date-range-picker__left-column',
      current_date: new Date(),
      days_array: new Array<IDayObject>()
    },
    right_cal: {
      class_name: 'date-range-picker__right-column',
      current_date: new Date(),
      days_array: new Array<IDayObject>()
    }
  };
  selected_date_obj = {
    start_date: null,
    end_date: null
  };
  @ViewChild('dateRangeRef', { static: true }) dateRangeRef: ElementRef;
  @Input() btn_class_name;
  @Input() min_date;
  @Input() max_date;
  @Input() set input_date_obj(data) {
    this.selected_date_obj = {
      start_date: data.start_date,
      end_date: data.end_date
    };
  }
  @Output() dateSelectEvent: EventEmitter<object> = new EventEmitter<object>();
  @Output() closePicker: EventEmitter<boolean> = new EventEmitter<boolean>();
  // today = DateRangePickerComponent.formatDate(new Date());

  static getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }
  // static getLastDayOfMonth(date) {
  //   return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay();
  // }
  static getFirstDateOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  // static getLastDateOfMonth(date) {
  //   return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  // }
  static daysInMonthArray(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
  static createFormattedDate(date, no_of_days) {
    date.setDate(date.getDate() + no_of_days);
    return DateRangePickerComponent.formatDate(date);
  }
  static createFormattedTZDate(date, no_of_days) {
    date.setDate(date.getDate() + no_of_days);
    return DateRangePickerComponent.formatTz(date);
  }
  static formatTz(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
      .toISOString();
  }
  static formatDate(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
      .toISOString()
      .split('T')[0];
  }
  static addMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }
  static isDateBeforeToday(new_date, original_date) {
    return new Date(new_date).getTime() < new Date(original_date).getTime();
  }
  static isDateAfterToday(new_date, original_date) {
    return new Date(new_date).getTime() > new Date(original_date).getTime();
  }
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Check if the click was outside the element
    if (targetElement && !this.dateRangeRef.nativeElement.contains(targetElement)
      && !event.target['classList'].contains(this.btn_class_name)) {
      this.closePicker.emit(true);
    }
  }
  constructor() { }

  ngOnInit() {
    this.createCalendar(new Date());
  }

  createCalendar(date) {
    const left_date = date;
    const right_date = DateRangePickerComponent.addMonth(date);
    this.calendar_obj.left_cal.current_date = left_date;
    this.calendar_obj.right_cal.current_date = right_date;
    const left_cal_first_day = DateRangePickerComponent.getFirstDayOfMonth(left_date);
    // const left_cal_last_day = DateRangePickerComponent.getLastDayOfMonth(left_date);
    const left_cal_first_date = DateRangePickerComponent.getFirstDateOfMonth(left_date);
    // const left_cal_last_date = DateRangePickerComponent.getLastDateOfMonth(left_date);
    const left_cal_days = DateRangePickerComponent.daysInMonthArray(left_date);
    const right_cal_first_day = DateRangePickerComponent.getFirstDayOfMonth(right_date);
    // const right_cal_last_day = DateRangePickerComponent.getLastDayOfMonth(right_date);
    const right_cal_first_date = DateRangePickerComponent.getFirstDateOfMonth(right_date);
    // const right_cal_last_date = DateRangePickerComponent.getLastDateOfMonth(right_date);
    const right_cal_days = DateRangePickerComponent.daysInMonthArray(right_date);
    this.calendar_obj.left_cal.days_array = [];
    this.calendar_obj.right_cal.days_array = [];
    for (let i = 0; i < left_cal_first_day; i++) {
      this.calendar_obj.left_cal.days_array.push(null);
    }
    for (let i = 0; i < left_cal_days; i++) {
      const tz_date = DateRangePickerComponent.createFormattedTZDate(new Date(left_cal_first_date.getTime()), i);
      this.calendar_obj.left_cal.days_array.push({
        date: i + 1,
        is_disabled: DateRangePickerComponent.isDateBeforeToday(tz_date, this.min_date) ||
          DateRangePickerComponent.isDateAfterToday(tz_date, this.max_date),
        tz_date: tz_date,
        formatted_date: DateRangePickerComponent.createFormattedDate(new Date(left_cal_first_date.getTime()), i)
      });
    }
    for (let i = 0; i < right_cal_first_day; i++) {
      this.calendar_obj.right_cal.days_array.push(null);
    }
    for (let i = 0; i < right_cal_days; i++) {
      const tz_date = DateRangePickerComponent.createFormattedTZDate(new Date(right_cal_first_date.getTime()), i);
      this.calendar_obj.right_cal.days_array.push({
        date: i + 1,
        is_disabled: DateRangePickerComponent.isDateBeforeToday(tz_date, this.min_date) ||
          DateRangePickerComponent.isDateAfterToday(tz_date, this.max_date),
        tz_date: tz_date,
        formatted_date: DateRangePickerComponent.createFormattedDate(new Date(right_cal_first_date.getTime()), i)
      });
    }
  }
  nextMonth(now) {
    const new_month = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    this.createCalendar(new_month);
  }
  previousMonth(now) {
    const new_month = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    this.createCalendar(new_month);
  }
  onDateChange(day) {
    if (!day) {
      return;
    }
    if (this.selected_date_obj.start_date && this.selected_date_obj.end_date) {
      this.selected_date_obj.end_date = '';
      this.selected_date_obj.start_date = day.formatted_date;
    } else if (this.selected_date_obj.start_date) {
      if (DateRangePickerComponent.isDateAfterToday(day.formatted_date, this.selected_date_obj.start_date)) {
        if (this.selected_date_obj.end_date == day.formatted_date) {
          this.selected_date_obj.start_date = day.formatted_date;
        } else {
          this.selected_date_obj.end_date = day.formatted_date;
        }
      } else if (this.selected_date_obj.start_date == day.formatted_date && !this.selected_date_obj.end_date) {
        this.selected_date_obj.end_date = day.formatted_date;
      } else {
        this.selected_date_obj.end_date = '';
        this.selected_date_obj.start_date = day.formatted_date;
      }
    } else if (!this.selected_date_obj.start_date) {
      this.selected_date_obj.start_date = day.formatted_date;
    }
  }
  highlightDate(day) {
    if (!day) {
      return false;
    }
    if (this.selected_date_obj.start_date && this.selected_date_obj.end_date) {
      return DateRangePickerComponent.isDateBeforeToday(day.formatted_date, this.selected_date_obj.end_date) &&
        DateRangePickerComponent.isDateAfterToday(day.formatted_date, this.selected_date_obj.start_date);
    }
    return false;
  }
  choosePredefinedDate(no_of_days) {
    this.selected_date_obj = {
      start_date: DateRangePickerComponent.createFormattedDate(new Date(), -no_of_days),
      end_date: DateRangePickerComponent.createFormattedDate(new Date(), 0)
    };
    this.createCalendar(new Date());
  }
  submitDate() {
    this.dateSelectEvent.emit(this.selected_date_obj);
    this.closePicker.emit(true);
  }
}
