import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { messageModalAnimation } from '../../../../../animations/animations';
import { ScrumBotService } from '../../../../../services/scrum-bot.service';
import { SessionService } from '../../../../../services/session.service';
import { LoaderService } from '../../../../../services/loader.service';
import { MessageService } from '../../../../../services/message.service';
import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    messageModalAnimation
  ]
})
export class DashboardComponent implements OnInit {
  weekdays = {
    '1': {
      name: 'Sun',
      value: 1
    },
    '2': {
      name: 'Mon',
      value: 2
    },
    '3': {
      name: 'Tue',
      value: 3
    },
    '4': {
      name: 'Wed',
      value: 4
    },
    '5': {
      name: 'Thu',
      value: 5
    },
    '6': {
      name: 'Fri',
      value: 6
    },
    '7': {
      name: 'Sat',
      value: 7
    }
};

  waitingTime = {
    '15': {
      name: '15 minutes',
      value: 15
    },
    '30': {
      name: '30 minutes',
      value: 30
    },
    '45': {
      name: '45 minutes',
      value: 45
    },
    '60': {
      name: '1 Hour',
      value: 60
    },
    '90': {
      name: '1.5 Hours',
      value: 90
    },
    '120': {
      name: '2 Hours',
      value: 120
    },
    '150': {
      name: '2.5 Hours',
      value: 150
    },
    '180': {
      name: '3 Hours',
      value: 180
    },
    '240': {
      name: '4 Hours',
      value: 240
    },
    '360': {
      name: '6 Hours',
      value: 360
    },
    '480': {
      name: '8 Hours',
      value: 480
    },
    '720': {
      name: '12 Hours',
      value: 720
    }
  };

  recurringTime = [
    {
      name: 'Non-recurrent',
      value: 0
    },
    {
      name: 'Every Week',
      value: 1
    },
    {
      name: 'Every 2 Week',
      value: 2
    },
    {
      name: 'Every 3 Week',
      value: 3
    },
    {
      name: 'Every 4 Week',
      value: 4
    }
  ];
  reports = [];
  spaceData;
  report_menu_open = false;
  showReport;
  userData;
  activateScrumReport = false;
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private scrumService: ScrumBotService,
    private sessionService: SessionService, private cdRef: ChangeDetectorRef, private loader: LoaderService,
    private messageService: MessageService, public commonService: CommonService) { }

  ngOnInit() {
    // this.spaceData = this.commonService.currentOpenSpace;
    const spaceDataAll = <any>this.sessionService.get('spaceDictionary');
    const workspace = window.location.pathname.split('/')[1];
    this.spaceData = spaceDataAll[workspace];
    const user_details = this.sessionService.get('user_details_dict')
    this.userData = user_details[window.location.pathname.split('/')[1]];
    //Only hit the get api here if the guard doesn't hit it first
    if (this.scrumService.reports && this.scrumService.reports.length) {
      this.reports = [...this.scrumService.reports];
    } else {
      this.getAllReports();
    }
  }

  getAllReports() {
    this.loader.show();
    const obj = {
      user_name: this.spaceData.fugu_user_id,
      business_id: this.spaceData.workspace_id
    };
    this.scrumService.getScrumDetails(obj).subscribe(res => {
      this.loader.hide();
      if (res.data.type == 'USER_DATA_NOT_FOUND') {
        this.router.navigate(['../report', 1], { relativeTo: this.activatedRoute });
      }
      if (res.data.scrum_status == 'RUNNING') {
        this.messageService.sendAlert({
          type: 'success',
          msg: res.data.message,
          timeout: 2000
        });
        return;
      }
      this.scrumService.reports = [];
      this.reports = res.data.data;
      this.cdRef.detectChanges();
    });
  }

  createNew() {
    this.router.navigate(['../report', 1], { relativeTo: this.activatedRoute });
  }

  openReportMenu(event, report) {
    event.preventDefault();
    report.reportMenuActive = true;
  }

  activateReport(report, name) {
    const obj = {
      business_id: this.spaceData.workspace_id,
      scrum_id: report.scrum_id,
      scrum_status: name
    };
    this.scrumService.editScrumDetails(obj)
      .subscribe(response => {
        if (response.data.statusCode == 400) {
           report.scrum_status = 'ACTIVE';
            this.messageService.sendAlert({
            type: 'success',
            msg: response.data.message,
            timeout: 2000
          });
          this.cdRef.detectChanges();
          return;
        }
        if (name == 'ACTIVE') {
          report.scrum_status = 'ACTIVE';
        } else {
          report.scrum_status = 'PAUSED';
        }
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        this.cdRef.detectChanges();
      });
  }

  onEditClickOutside(event, report) {
    if (event && event.value == true) {
      report.reportMenuActive = false;
    }
  }

  deleteScrum(report) {
    this.loader.show();
    const obj = {
      business_id: this.spaceData.workspace_id,
      scrum_id: report.scrum_id,
      scrum_status: 'DISABLED'
    };
    this.scrumService.editScrumDetails(obj)
      .subscribe(response => {
        this.loader.hide();
        if (response.data.statusCode == 400) {
          report.deleteScrumReport = false;
          this.messageService.sendAlert({
            type: 'success',
            msg: response.data.message,
            timeout: 2000
          });
          this.cdRef.detectChanges();
          return;
        }
        report.deleteScrumReport = false;
        this.getAllReports();
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        this.cdRef.detectChanges();
      });
  }

  runScrumNow(report) {
    const obj = {
      scrum_id: report.scrum_id
    };
    this.scrumService.runScrumNow(obj)
      .subscribe(response => {
        if (response.data.statusCode == 400) {
          this.messageService.sendAlert({
            type: 'success',
            msg: response.data.message,
            timeout: 2000
          });
          return;
        }
        report.deleteScrumReport = false;
        this.getAllReports();
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        this.cdRef.detectChanges();
      });
  }

}
