import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {ChatTypes} from '../../enums/app.enums';
import { EmailPopupService } from './email-popup.service';
import {MessageService} from '../../services/message.service';
import {debounceTime} from 'rxjs/operators';
import { CommonApiService } from '../../services/common-api.service';

declare const jQuery: any;
@Component({
  selector: 'app-email-popup',
  templateUrl: './email-popup.component.html',
  styleUrls: ['./email-popup.component.scss']
})
export class EmailPopupComponent implements OnInit {
  members_object = {};
  selected_members = {};
  all_members = [];
  addMemberSearchCtrl;
  spaceData;
  search_results = [];
  active_index = -1;
  select_all = false;
  selected_check_count = 0;
  user_details;
  @ViewChild('membersContainer', { static: true }) membersContainer;
  @Input() addedMembers;
  @Input() activeChannelId;
  @Input() membersCount;
  @Output()
  closeEmailPopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  sendEmailData: EventEmitter<any> = new EventEmitter<boolean>();
  @Output()
  sendMembersData: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private messageService: MessageService, private emailService: EmailPopupService, private commonService: CommonService,
    private sessionService: SessionService, private cdRef: ChangeDetectorRef, private formBuilder: FormBuilder, private commonApiService: CommonApiService) { }
  ngOnInit() {
    this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.addMemberSearchCtrl = new FormControl();
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this.fetchMembers();
    this.selected_members = {};
    this.addMemberSearchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        this.active_index = -1;
        this.membersContainer.nativeElement.scrollTop = 0;
        if (data && data.length > 1) {
          this.searchUsers(data || '');
        } else {
          this.search_results = this.all_members;
        }
        this.cdRef.detectChanges();
      });
    jQuery('#emailPopup').on('hidden.bs.modal', () => {
      this.closeEmailPopup.emit();
    });
    document.getElementById('email-search-box').focus();
  }
   /**
     * to select all the checkboxes
   */
  selectAll() {
    for (let i = 0; i < this.addedMembers.length; i++) {
      this.members_object[this.addedMembers[i].user_id] = !this.select_all;
    }
    this.select_all = !this.select_all;
    this.select_all ? this.selected_check_count = this.addedMembers.length : this.selected_check_count = 0;
  }
   /**
     * setting the value of all checkboxes to false by default
   */
  fetchMembers() {
    for (let i = 0; i < this.addedMembers.length; i++) {
      this.members_object[this.addedMembers[i].user_id] = false;
    }
    this.all_members = this.addedMembers;
    this.search_results = this.all_members.slice();
    setTimeout(() => {
      document.getElementById('email-search-box').focus();
    }, 600);
    this.cdRef.detectChanges();
  }
   /**
     * show the forward icon when more than one checkbox is selected
   */
  showForward(selected, member) {
    !selected ? this.selected_check_count += 1 : this.selected_check_count -= 1;
    this.members_object[member.user_id] = !this.members_object[member.user_id];
    this.members_object = { ...this.members_object };
  }

  searchUsers(name: string) {
    if (this.membersCount > this.addedMembers.length) {
      const obj = {
        en_user_id: this.user_details.en_user_id,
        search_text: name,
        channel_id: this.activeChannelId
      };
      this.commonApiService.searchUsersInGroup(obj)
        .subscribe(response => {
          this.search_results = response.data.users;
          this.cdRef.detectChanges();
        });
    } else {
      this.search_results = this.all_members.filter(member =>
        member.full_name.toLowerCase().includes(name.toLowerCase()) && !this.selected_members[member.user_id]);
    }
  }
  /**
  * send email to selected users by pushing them in a new array
  */
  sendEmail() {
    const selected_array =  [];
    for (const key in this.members_object) {
      if (this.members_object[key] ) {
        selected_array.push(parseInt(key));
      }
    }
    this.sendEmailData.emit(selected_array);
  }
  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {
    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      jQuery('#email-members' + this.active_index).click();
      this.membersContainer.nativeElement.scrollTop = 0;
    }
  }
  private searchDownArrow() {
    if (this.active_index != this.search_results.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 68;
      const scrollTop = this.membersContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.membersContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.membersContainer.nativeElement.scrollTop += 68;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 68;
      const scrollTop = this.membersContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.membersContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.membersContainer.nativeElement.scrollTop -= 68;
      }
    }
  }
}
