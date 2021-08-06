import {
  Component,
  OnInit,
  Output,
  ChangeDetectorRef,
  EventEmitter,
  Input
} from '@angular/core';
import {CalendarOptions} from '@fullcalendar/angular';
import {CommonService} from '../../services/common.service';
import {CommonApiService} from '../../services/common-api.service';
import {messageModalAnimation} from '../../animations/animations';
import {LoaderService} from '../../services/loader.service';
import {Router} from '@angular/router';

declare const moment: any;

@Component({
  selector: 'app-tasks-calendar',
  templateUrl: './tasks-calendar.component.html',
  styleUrls: ['./tasks-calendar.component.css'],
  animations: [messageModalAnimation]
})
export class TasksCalendarComponent implements OnInit {
  filters = [{name: 'All', value: 3}, {name: 'Pending', value: 0}, {name: 'Completed', value: 1},
    {name: 'Assigned by You', value: 2}];
  selectedFilter: any = this.filters[0].value;
  showCal = false;
  month = new Date().getMonth() + 1;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    dateClick: this.handleDateClick.bind(this), // bind is important!
    eventClick: this.eventClick.bind(this) // bind is important!
  };
  spaceData;
  taskDataEdit;
  isAdmin = false;
  showAssignTaskPopup = false;
  showSubmitTask = false;
  userData;
  @Output()
  closePopup: EventEmitter<object> = new EventEmitter<object>();
  @Input() channelId;

  constructor(public commonService: CommonService, private cdRef: ChangeDetectorRef, private commonApiService: CommonApiService,
              private loader: LoaderService, public router: Router) {
  }

  ngOnInit(): void {
    this.spaceData = this.commonService.currentOpenSpace;
    this.viewOverallTasks();
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
  }

  filterChange() {
    this.viewOverallTasks();
  }

  taskChange() {
    this.viewOverallTasks();
  }

  viewOverallTasks() {
    const obj: any = {
      user_id: this.spaceData.fugu_user_id,
      workspace_id: this.spaceData.workspace_id,
      channel_id: this.channelId
    };
    if (this.selectedFilter !== 3) {
      obj.is_completed = this.selectedFilter;
    }

    this.commonApiService.viewTask(obj).subscribe(res => {
      let tasks: any = [];
      if (res.data) {
        res.data.map((ev) => {
          let task: any = {};
          task.title = ev.title;
          task.date = moment(ev.start_datetime).format('YYYY-MM-DD');
          task.id = ev.task_id;
          tasks.push(task);
        });
      }
      this.calendarOptions.events = tasks;
      const that = this;
      that.showCal = true;
      this.cdRef.detectChanges();
    }, () => {
    });

  }

  getTaskDetails(task_id) {
    const obj = {
      user_id: this.spaceData.user_id,
      task_id: task_id
    };

    this.commonApiService.getTaskDetails(obj).subscribe((response) => {
      this.taskDataEdit = response.data;
      if (response.data.assigner_user_id == this.userData.user_id) {
        this.isAdmin = true;
      }
      // this.showSubmitTask = true;
      this.closePopup.emit();
      this.commonService.openTaskPopUp.emit(response.data);
      this.cdRef.detectChanges();

      // setTimeout(() => {
      //   // this.router.navigate([], {queryParams: {openTask: true}});
      //   this.closePopup.emit({openTask: true});
      //
      // }, 1000);
    });
  }

  handleDateClick(arg) {
    console.log('date click! ' + arg.dateStr);
  }

  eventClick(calEvent: any) {
    calEvent.jsEvent.preventDefault(); // don't let the browser navigate
    this.getTaskDetails(calEvent.event.id);
  }

}
