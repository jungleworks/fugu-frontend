import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { InvitedUsersService } from './invited-users.service';
import { SessionService } from '../../services/session.service';
import { FormControl } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import {CountryService} from '../../services/country.service';
import {MessageService} from '../../services/message.service';
import {LoaderService} from '../../services/loader.service';
import {debounceTime} from 'rxjs/operators';
import { CommonApiService } from '../../services/common-api.service';


let stopInviteHit = false;
let page_size_count;

@Component({
  selector: 'app-invited-users',
  templateUrl: './invited-users.component.html',
  styleUrls: ['./invited-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitedUsersComponent implements OnInit {
  acceptedInvitations = [];
  acceptedInvitationsToDisplay = [];
  pendingInvitations = [];
  pendingInvitationsToDisplay = [];
  searchMembers;
  selected_tab = 1;
  workspace_id;
  pendingUsersEl;
  acceptedUsersEl;
  page_start = 0;
  user_details;
  isInviteMembersFetched = false;
  bodyScrollDone = false;
  containerEl;
  totalCountMembers;
  pendingMembers;
  acceptedMembers;
  spaceData;
  @Output() closeInvited: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('pendingUsersContainer') set pendingUsersContainer(invitedUsersContent: ElementRef) {
    if (invitedUsersContent) {
      this.pendingUsersEl = invitedUsersContent;
      if (this.totalCountMembers > this.pendingMembers.length &&
        (this.searchMembers.value == '' || this.searchMembers.value == null)) {
        document.getElementById('pending-users-container').addEventListener('scroll', (event) => {
          if (this.bodyScrollDone) {
            this.checkPaginationOfPendingInvitedUsers();
          } else {
            event.preventDefault();
          }
        });
      }
    }
  }
  @ViewChild('acceptedUsersContainer') set acceptedUsersContainer(invitedUsersContent: ElementRef) {
    if (invitedUsersContent) {
      this.acceptedUsersEl = invitedUsersContent;
      if (this.totalCountMembers > this.acceptedMembers.length &&
        (this.searchMembers.value == '' || this.searchMembers.value == null)) {
      document.getElementById('accepted-users-container').addEventListener('scroll', (event) => {
        if (this.bodyScrollDone) {
          this.checkPaginationOfAcceptedInvitedUsers();
        } else {
          event.preventDefault();
        }
      });
    }
    }
  }

  @ViewChild('invitedUserContainer') set invitedUserContainer(invitedUsersContainer: ElementRef) {
    this.containerEl = invitedUsersContainer;
    document.getElementById('invited-user-container').addEventListener('scroll', (event) => {
      if ((this.containerEl.nativeElement.scrollTop + this.containerEl.nativeElement.clientHeight) >= this.containerEl.nativeElement.scrollHeight) {
        this.bodyScrollDone = true;
      } else {
        this.bodyScrollDone = false;
      }
      this.cdRef.detectChanges();
    });
  }

  constructor(public service: InvitedUsersService, public sessionService: SessionService, public cdRef: ChangeDetectorRef,
              public commonService: CommonService, private countryService: CountryService,private commonApiService: CommonApiService,
              private messageService: MessageService, private loader: LoaderService) { }

  ngOnInit() {
    this.searchMembers = new FormControl();
    this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.spaceData = this.commonService.currentOpenSpace;
    this.workspace_id = this.spaceData['workspace_id'];
    this.getInvitedMembers('PENDING');
    this.searchMembers.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data && data.length > 1) {
          this.isInviteMembersFetched = true;
          if (this.selected_tab == 1) {
            this.searchUsers(data, 'PENDING');
          } else {
            this.searchUsers(data, 'ACCEPTED');
          }
        } else {
          this.isInviteMembersFetched = false;
          this.acceptedInvitationsToDisplay = this.acceptedInvitations.slice();
          this.pendingInvitationsToDisplay = this.pendingInvitations.slice();
        }
        this.cdRef.detectChanges();
    });
    this.commonService.usersInvitedEmitter.subscribe(data => {
      const newArray = [];
      const today = new Date();
      if ( data.emails) {
        data.emails.map(el => {
          newArray.push({email: el, date_time: today});
        });
      }
      if (data.contactNumbers) {
        data.contactNumbers.map(el => {
          newArray.push({contact_number: el, date_time: today});
        });
      }
      this.pendingInvitations.unshift(...newArray);
      this.pendingInvitationsToDisplay = this.pendingInvitations.slice();
      this.cdRef.markForCheck();
    });
  }

  getInvitedMembers(type) {
    stopInviteHit = true;
    const obj = {
      workspace_id: this.workspace_id,
      user_type : type,
      page_start: this.page_start
    };
    this.service.getInvitedUsers(obj).subscribe(res => {
      stopInviteHit = false;
      if (res.data.user_count) {
        this.totalCountMembers = res.data.user_count;
      }
      this.pendingMembers = res.data.pending_members;
      this.acceptedMembers = res.data.accepted_members;
      if (res.data.get_all_member_page_size) {
        page_size_count = res.data.get_all_member_page_size;
      }
      if ((res.data.pending_members && !res.data.pending_members.length) ||
      (res.data.accepted_members && !res.data.accepted_members.length)) {
        this.isInviteMembersFetched = true;
      }
      if (type == 'PENDING') {
        this.pendingInvitations = [...this.pendingInvitations, ...res.data.pending_members];
      } else {
        this.acceptedInvitations = [...this.acceptedInvitations, ...res.data.accepted_members];
      }
      this.acceptedInvitationsToDisplay = this.acceptedInvitations.slice();
      this.pendingInvitationsToDisplay = this.pendingInvitations.slice();
      this.cdRef.detectChanges();
    });
  }
  searchUsers(name: string, type) {
    if (this.totalCountMembers > (type == 'PENDING' ? this.pendingMembers.length : this.acceptedMembers.length)) {
      const obj = {
        en_user_id: this.user_details.en_user_id,
        search_text: name,
        user_type: type
      };
      this.commonApiService.searchUsersInInvite(obj)
        .subscribe(response => {
          if (type == 'PENDING') {
            this.pendingInvitationsToDisplay = response.data.users;
          } else {
            this.acceptedInvitationsToDisplay = response.data.users;
          }
          this.cdRef.detectChanges();
        });
    } else {
      if (type == 'PENDING') {
        this.pendingInvitationsToDisplay = this.pendingInvitations.filter(item => {
          if (item.email) {
            return item.email.toLowerCase().startsWith(name.toLowerCase());
          } else if (item.contact_number) {
            return item.contact_number.includes(name);
          }
        });
      } else {
        this.acceptedInvitationsToDisplay = this.acceptedInvitations.filter(item => {
          if (item.email) {
            return item.email.toLowerCase().startsWith(name.toLowerCase());
          } else if (item.contact_number) {
            return item.contact_number.includes(name);
          }
        });
      }
    }
  }
  revokeInvitation(user) {
    this.loader.show();
    const obj = {
      workspace_id: this.workspace_id
    };
    if (user.email) {
      obj['email'] = user.email;
    } else {
      obj['contact_info'] = {
        contact_number: user.contact_number,
        country_code: this.countryService.dialCodeMap[user.contact_number.split('-')[0].substring(1)]
      };
    }
    this.service.revokeInvitation(obj)
      .subscribe((res) => {
        this.loader.hide();
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
        for (let i = 0; i < this.pendingInvitations.length; i++) {
          if ((obj['email'] && this.pendingInvitations[i].email == obj['email']) ||
            (obj['contact_info'] && this.pendingInvitations[i].contact_number == obj['contact_info'].contact_number)) {
            this.pendingInvitations.splice(i, 1);
            this.pendingInvitationsToDisplay = this.pendingInvitations.slice();
            break;
          }
        }
        this.searchMembers.reset();
        this.cdRef.detectChanges();
      });
  }
  resendInvitation(user, index) {
    this.loader.show();
    const obj = {
      workspace_id: this.workspace_id
    };
    if (user.email) {
      obj['email'] = user.email;
    } else {
      obj['contact_info'] = {
        contact_number: user.contact_number,
        country_code: this.countryService.dialCodeMap[user.contact_number.split('-')[0].substring(1)]
      };
    }
    this.service.resendInvitation(obj)
      .subscribe((res) => {
        this.loader.hide();
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
        this.pendingInvitations[index].status = 'RE_INVITED';
        this.pendingInvitationsToDisplay = this.pendingInvitations.slice();
        this.searchMembers.reset();
        this.cdRef.detectChanges();
      });
  }

  onTabClick(index, text) {
    this.selected_tab = index;
    this.page_start = 0;
    if (index == 1) {
      this.pendingInvitations = [];
    } else {
      this.acceptedInvitations = [];
    }
    this.isInviteMembersFetched = false;
    this.searchMembers.reset();
    this.getInvitedMembers(text);
  }

  checkPaginationOfPendingInvitedUsers() {
    if (!this.isInviteMembersFetched && (this.pendingUsersEl.nativeElement.scrollTop +
      this.pendingUsersEl.nativeElement.clientHeight)
      / this.pendingUsersEl.nativeElement.scrollHeight >= 0.98) {
      if (!stopInviteHit) {
        this.page_start = this.page_start + page_size_count;
          this.getInvitedMembers('PENDING');
      }
    }
  }
  checkPaginationOfAcceptedInvitedUsers() {
    if (!this.isInviteMembersFetched && (this.acceptedUsersEl.nativeElement.scrollTop +
      this.acceptedUsersEl.nativeElement.clientHeight)
      / this.acceptedUsersEl.nativeElement.scrollHeight >= 0.98) {
      if (!stopInviteHit) {
        this.page_start = this.page_start + page_size_count;
          this.getInvitedMembers('ACCEPTED');
      }
    }
  }
}
