import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {SessionService} from '../../../../../services/session.service';
import {AttendaceBotService} from '../../attendace-bot.service';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {MessageService} from '../../../../../services/message.service';
import {CommonService} from '../../../../../services/common.service';
import {AttendanceRoles} from '../../../../../enums/app.enums';

declare const $: any;

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit, OnDestroy {

  @ViewChild('peopleTablePaginator', { static: true }) peopleTablePaginator: MatPaginator;

  searchMember;
  peopleTableData = new MatTableDataSource([]);
  userData;
  userRole;
  peopleTableColumns = [
    {
      field: 'activated',
      header: 'Active',
      class_name: ''
    },
    {
      field: 'full_name',
      header: 'Full name',
      class_name: 'table-link'
    },
    {
      field: 'email',
      header: 'Email',
      class_name: ''
    },
    {
      field: 'manager_name',
      header: 'Manager',
      class_name: ''
    }
  ];
  peopleTableDisplayedColumns = ['activated', 'full_name', 'email', 'manager_name'];
  get_members_subscription;
  disableToggleButtons = false;
  constructor(private cdRef: ChangeDetectorRef, private sessionService: SessionService,
              private commonService: CommonService,
              private service: AttendaceBotService, private messageService: MessageService) {
                const user_details = this.sessionService.get('user_details_dict')
                this.userData = user_details[window.location.pathname.split('/')[1]];
  }

  ngOnInit() {
    if (this.userData.role) {
      this.userRole = this.userData.role;
    } else {
      this.userRole = 'ADMIN';
    }
    if (this.userRole == AttendanceRoles.MANAGER || this.userRole == AttendanceRoles.USER) {
      this.disableToggleButtons = true;
    }
    this.searchMember = new FormControl();
    this.searchMember.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        this.peopleTableData.filter = data.trim().toLowerCase();
        if (this.peopleTableData.paginator) {
          this.peopleTableData.paginator.firstPage();
        }
        this.cdRef.detectChanges();
      });
    this.getAllUsers();
  }

  getAllUsers() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      user_count: 'ALL_USERS'
    };
    this.get_members_subscription = this.service.getAllMembers(obj).subscribe(res => {
      const userData = res.data.all_users_details;
      this.peopleTableData = new MatTableDataSource(<any>userData);
      this.peopleTableData['paginator'] = this.peopleTablePaginator;
      this.cdRef.detectChanges();
    });
  }

  updateUserStatus(user) {
    const obj = {
      en_user_id: this.userData.en_user_id,
      status: !user.status ? 1 : 0,
      action_user_name: user.user_name
    };
    this.service.editUserDetails(obj)
      .subscribe((res) => {
        user.status = !user.status;
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 3000
        });
      });
  }

  ngOnDestroy(): void {
    this.get_members_subscription.unsubscribe();
  }
}
