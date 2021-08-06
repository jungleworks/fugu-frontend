import { ChangeDetectorRef, Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { CreateGroupService } from '../create-group/create-group.service';
import { CommonService } from '../../services/common.service';
import {debounceTime} from 'rxjs/operators';
import { flyInOut, scaleInOut } from '../../animations/animations';
import { Role, leaveRole } from '../../enums/app.enums';
import { CommonApiService } from '../../services/common-api.service';

let allMembersCount;
@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss'],
  animations: [
    flyInOut,
    scaleInOut
  ]
})
export class AddMembersComponent implements OnInit {
  temp_array = [];
  already_selected_members = [];
  selected_members = {};
  all_members = [];
  addMemberSearchCtrl;
  is_forward_enabled = false;
  spaceData;
  search_results = [];
  active_index = -1;
  selected_members_padding;
  user_details;
  leaveRoleEnum = leaveRole;
  @ViewChild('membersContainer', { static: true }) membersContainer;
  @Input() addedMembers;
  @Output()
  closeAddMembers: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  sendMembersData: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private commonService: CommonService, private service: CreateGroupService,
    private sessionService: SessionService,private commonApiService: CommonApiService, private cdRef: ChangeDetectorRef, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.addMemberSearchCtrl = new FormControl();
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData =  this.commonService.currentOpenSpace;
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
          this.search_results = this.all_members.filter(member =>
            !this.selected_members[member.fugu_user_id]);
        }
        this.cdRef.detectChanges();
      });
    document.getElementById('search-box').focus();
  }

  fetchMembers() {
    for (let i = 0 ; i < this.addedMembers.length; i++) {
       this.already_selected_members.push(this.addedMembers[i].user_id);
    }
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_status: 'ENABLED',
      user_type: 'ALL_MEMBERS',
      page_start: 0,
      include_user_guests: true
    };
    this.service.getAllMembers(obj)
      .subscribe((res) => {
        // const temp_array = [];
        this.all_members = res.data.all_members;
        allMembersCount = res.data.user_count;
        // const frequently_contacted = <any>this.sessionService.get('frequently-contacted');
        // this.all_members.map((item, index) => {
        //   if (!this.already_selected_members.includes(item.fugu_user_id)) {
        //     frequently_contacted && frequently_contacted[item.fugu_user_id] ? item.priority =
        //     Number(frequently_contacted[item.fugu_user_id]) : item.priority = 0;
        //     temp_array.push(item);
        //   }
        // });
        // this.all_members = temp_array;
        this.search_results = this.all_members.filter(member =>
          !this.already_selected_members.includes(member.fugu_user_id)
        );
        setTimeout(() => {
          document.getElementById('search-box').focus();
        }, 500);
        this.cdRef.detectChanges();
      });
  }
  searchUsers(name: string) {
    if (allMembersCount > this.all_members.length) {
      const addedIds = [];
    /* Added members has the total number of members
    */
      this.addedMembers.map((added) => {
        addedIds.push(added.user_id);
      });
      const obj = {
        en_user_id: this.user_details.en_user_id,
        search_text: name,
      };
      this.commonApiService.search(obj)
        .subscribe(response => {
          this.search_results = response.data.users.filter(member =>
            !addedIds.includes(member.user_id) && !this.selected_members[member.fugu_user_id]
          );
          this.addedMembers.find(added => added.user_id);
          this.cdRef.detectChanges();
        });
    } else {
      this.search_results = this.all_members.filter(member =>
        member.full_name.toLowerCase().includes(name.toLowerCase()) && !this.selected_members[member.fugu_user_id]);
    }
  }
  removeMember(member) {
    delete this.selected_members[member];
    this.selected_members = { ...this.selected_members };
    this.is_forward_enabled = !!Object.keys(this.selected_members).length;
    this.addMemberSearchCtrl.reset();
    if (allMembersCount > this.all_members.length) {
      this.addMemberSearchCtrl.reset();
    } else {
      if (!this.addMemberSearchCtrl.value) {
        this.searchUsers('');
      }
    }
  }
  addMember(member) {
    this.selected_members_padding = true;
    if (!this.selected_members[member]) {
      member.user_id = member.fugu_user_id;
      member.role = Role.isUser;
      this.selected_members[member.fugu_user_id] = member;
      this.selected_members = {...this.selected_members };
      this.is_forward_enabled = !!Object.keys(this.selected_members).length;
      this.addMemberSearchCtrl.reset();
      document.getElementById('search-box').focus();
    }
  }
  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {

    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      const el = document.getElementById('add-members' + this.active_index);
      if (el) {
        el.click();
        this.membersContainer.nativeElement.scrollTop = 0;
      }
    }
  }
  private searchDownArrow() {
    if (this.active_index != this.search_results.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 66;
      const scrollTop = this.membersContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.membersContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.membersContainer.nativeElement.scrollTop += 66;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 66;
      const scrollTop = this.membersContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.membersContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.membersContainer.nativeElement.scrollTop -= 66;
      }
    }
  }
}
