import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AttendaceBotService} from '../../attendace-bot.service';
import {SessionService} from '../../../../../services/session.service';
import { CommonService } from '../../../../../services/common.service';
let page_start = 1;

interface ITimeSheetData {
  full_name: string;
  punchings: Array<IPunchingData>;
  total_work_hours: string;
}
interface IPunchingData {
  clocked_in: string;
  clocked_out: string;
  date: string;
  user_id: number;
  work_time: number;
  over_time: number;
}
@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimesheetComponent implements OnInit {
  constructor(private service: AttendaceBotService, private sessionService: SessionService, 
    private cdRef: ChangeDetectorRef, public commonService: CommonService) { }
  date_range_picker_obj = {
    start_date: this.service.createFormattedDate(new Date(), -6),
    end_date: this.service.createFormattedDate(new Date(), 0)
  };
  show_date_range_picker = false;
  timesheet_data = new Array<ITimeSheetData>();
  userData;
  paginator_obj = {
    length: 0,
    page_size: 0
  };
  range_max_date = this.service.createFormattedDate(new Date(), 0);
  ngOnInit() {
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.getAllUsersTimesheet();
  }

  getAllUsersTimesheet() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      start_date: this.date_range_picker_obj.start_date,
      end_date: this.date_range_picker_obj.end_date,
      page_start: page_start
    };
    this.service.getTimeSheet(obj).subscribe(res => {
      for (let i = 0; i < res.data.users_timesheet.length; i++) {
        res.data.users_timesheet[i].total_work_hours = 0;
        res.data.users_timesheet[i].punchings.map((item) => {
          res.data.users_timesheet[i].total_work_hours += item.work_time || 0;
        });
      }
      this.timesheet_data = res.data.users_timesheet;
      this.paginator_obj = {
        length: res.data.total_users_count,
        page_size: res.data.page_size
      };
      this.cdRef.detectChanges();
    });
  }
  onDateSelected(data) {
    this.date_range_picker_obj = {
      start_date: data.start_date,
      end_date: data.end_date
    };
    this.getAllUsersTimesheet();
  }
  onPageChaneEvent(event) {
    page_start = (event.pageIndex * this.paginator_obj.page_size + 1) || 1;
    this.getAllUsersTimesheet();
  }
}
