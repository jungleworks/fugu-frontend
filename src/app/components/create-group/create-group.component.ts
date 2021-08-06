import { LayoutService } from './../layout/layout.service';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {CreateGroupService} from './create-group.service';
import {SessionService} from '../../services/session.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {NotificationAlertType, leaveRole} from '../../enums/app.enums';
import {MessageService} from '../../services/message.service';
import {Router, ActivatedRoute} from '@angular/router';
import {LoaderService} from '../../services/loader.service';
import {debounceTime} from 'rxjs/operators';
import { flyInOutLeft, scaleInOut } from '../../animations/animations';
import { CommonApiService } from '../../services/common-api.service';

let page_start = 0;
let stopGroupHit = false;
let all_members_count;
let allMembers;
let page_size_count;

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./create-group.component.scss'],
  animations: [
    flyInOutLeft,
    scaleInOut,
    trigger('flySlowIn', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate('200ms cubic-bezier(0.600, 0.040, 0.980, 0.335)')
      ]),
      transition('* => void', [
        animate('200ms cubic-bezier(0.600, 0.040, 0.980, 0.335)', style({transform: 'translateX(-100%)'}))
      ])
    ])
  ]
})
export class CreateGroupComponent implements OnInit {
  spaceData;
  searchCtrl;
  all_members = [];
  search_results = [];
  is_forward_enabled = false;
  selected_members = {};
  create_step = 1;
  groupImageLayer = false;
  is_private = true;
  isGroupMembersFetched = false;
  create_group_image;
  create_group_image_file;
  groupForm;
  active_index = 0;
  memberContainerEl;
  user_details;
  search_res;
  leaveRoleEnum = leaveRole;
  cropObj :any = {};
  showCroppingPopup: boolean = false;
  @ViewChild('groupFileInput') groupFileInput: ElementRef;
  @ViewChild('membersContainer') set membersContainer(memberContent: ElementRef) {
    if (memberContent) {
      this.memberContainerEl = memberContent;
      if (all_members_count && all_members_count > allMembers.length &&
        (this.searchCtrl.value == '' || this.searchCtrl.value == null) && document.getElementById('group-member-container')) {
        document.getElementById('group-member-container').addEventListener('scroll', (event) => {
          if (all_members_count > allMembers.length) {
            this.checkPaginationOfCreateGroup();
          }
        });
      }
    }
  }
  @Input()
  set added_members(data) {
    if (data) {
      this.selected_members = data;
      this.is_forward_enabled = !!Object.keys(this.selected_members).length;
    }
  }
  constructor(private commonService: CommonService, private service: CreateGroupService,
              private sessionService: SessionService, private cdRef: ChangeDetectorRef,
              private formBuilder: FormBuilder, private messageService: MessageService,
              private commonApiService: CommonApiService,
    private router: Router, private loader: LoaderService, private layoutService: LayoutService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    page_start = 0;
    this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.searchCtrl = new FormControl();
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    const cachedResults = this.getMemberResults();
    if (cachedResults) {
      this.all_members = cachedResults;
      this.search_results = cachedResults;
    }
    this.fetchMembers();
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        this.active_index = 0;
        this.memberContainerEl.elementRef.nativeElement.scrollTop = 0;
        if (data && data.length > 1) {
          this.isGroupMembersFetched = true;
          this.searchUsers(data);
        } else {
          this.isGroupMembersFetched = false;
          page_start = 0;
          // this.search_results = this.all_members.filter(member =>
          //  !this.selected_members[member.fugu_user_id]);
          this.search_results = this.all_members;
          this.cdRef.detectChanges();
        }
        this.cdRef.detectChanges();
      });
    this.groupForm = this.formBuilder.group({
      'name': ['']
    });
    if(document.getElementById('create-search-box')) {
      document.getElementById('create-search-box').focus();
    }

  }

  closeCreateGroup() {
    const obj = {
      is_open: false
    };
    this.commonService.createGroupEmitter.emit(obj);
  }

  fetchMembers() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_status: 'ENABLED',
      user_type: 'ALL_MEMBERS',
      page_start: page_start,
      include_user_guests: true
    };
    this.service.getAllMembers(obj)
      .subscribe((res) => {
        this.all_members = res.data.all_members;
        page_size_count = res.data.get_all_member_page_size;
        allMembers = [...res.data.all_members];
        all_members_count = res.data.user_count;
        if (!this.all_members.length) {
          this.isGroupMembersFetched = false;
        }
        this.all_members = allMembers.filter(member =>
          this.commonService.userDetails.user_id != member.fugu_user_id);
        this.search_results = [...this.all_members];
        this.saveMemberResults(this.search_results);
        this.cdRef.detectChanges();
      });
  }
  addMember(member) {
    // this.isGroupMembersFetched = false;
    // page_start = 0;
    if (!this.selected_members[member.fugu_user_id]) {
      this.selected_members[member.fugu_user_id] = member;
      this.selected_members = {...this.selected_members};
      this.is_forward_enabled = !!Object.keys(this.selected_members).length;
      // this.search_results = this.all_members.filter(member =>
      //   !this.selected_members[member.fugu_user_id]);
      if (this.searchCtrl.value) {
        this.searchCtrl.reset();
      }
      document.getElementById('create-search-box').focus();
    } else {
      this.removeMember(member.fugu_user_id);
    }
  }

  removeMember(member) {
    delete this.selected_members[member];
    this.selected_members = {...this.selected_members};
    this.is_forward_enabled = !!Object.keys(this.selected_members).length;
    // if (all_members_count > allMembers.length) {
    //   this.searchCtrl.reset();
    // } else {
    //   if (!this.searchCtrl.value) {
    //     this.searchUsers('');
    //   }
    // }
  }
  searchUsers(name: string) {
    if (all_members_count > allMembers.length) {
      const obj = {
        en_user_id: this.user_details.en_user_id,
        search_text: name,
      };
      this.commonApiService.searchUsersInGroup(obj)
        .subscribe(response => {
          this.search_results = response.data.users;
          this.cdRef.detectChanges();
        });

    } else {
      this.search_results = this.all_members.filter(member =>
        (member.full_name.toLowerCase().includes(name.toLowerCase()) ||
          (member.email && member.email.toLowerCase().includes(name.toLowerCase()))));
    }
  }


  async groupImageUpload(event) {
    this.showCroppingPopup = true;
    const file = event.target.files;
    this.cropObj.file = event.target.files[0];
    this.cropObj.event = event;
    this.cropObj.isAspectRatio = true;
    this.cropObj.src = await this.commonService.getImageUrlToCrop(file);
  }

  closeCropPopupFunc() {
    this.showCroppingPopup = false;
    /** reset the file input so that cropping popup can be shown next time without refresh */
    this.groupFileInput.nativeElement.value = '';
  }

  /**
   * function to upload group image in create group modal
   * @param event
   */
  saveCroppedImage(event) {
    this.create_group_image = event.src;
    this.create_group_image_file = event;
    this.showCroppingPopup = false;
  }

  createGroupChat() {
    this.loader.show();
    const formData: FormData = new FormData();
    formData.append('en_user_id', this.commonService.userDetails.en_user_id);
    if (this.groupForm.value.name.trim()) {
      formData.append('custom_label', this.groupForm.value.name.trim());
    }
    formData.append('chat_type',  this.is_private ? '3' : '4');
    if (this.create_group_image_file) {
      formData.append('file', this.create_group_image_file, this.create_group_image_file.name);
    }
    const ids_array = Object.keys(this.selected_members).map(Number);
    formData.append('user_ids_to_add', JSON.stringify(ids_array));
    this.groupFileInput.nativeElement.value = '';
    this.service.createGroupChat(formData)
      .subscribe(response => {
        this.loader.hide();
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
        const obj = {
          is_open: false
        };
        this.commonService.createGroupEmitter.emit(obj);
        this.router.navigate(['../' + response.data.channel_id], { relativeTo: this.activatedRoute });
        response.data.label = response.data.custom_label;
        delete response.data.custom_label;
        this.commonService.conversations[response.data.channel_id] = response.data;
        this.layoutService.mutedStatusObject[response.data.channel_id] = NotificationAlertType.UNMUTED;
        this.commonService.conversations[response.data.channel_id].chat_type = this.is_private ? 3 : 4;
        this.commonService.conversations = {...this.commonService.conversations};
      });
  }
  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {

    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      const el = document.getElementById('members' + this.active_index);
      if (el) {
        el.click();
      }
      this.memberContainerEl.elementRef.nativeElement.scrollTop = 0;
    }
  }
  private searchDownArrow() {
    if (this.active_index != this.search_results.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 62;
      const scrollTop = this.memberContainerEl.elementRef.nativeElement.scrollTop;
      const viewport = scrollTop + this.memberContainerEl.elementRef.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.memberContainerEl.elementRef.nativeElement.scrollTop += 62;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 62;
      const scrollTop = this.memberContainerEl.elementRef.nativeElement.scrollTop;
      const viewport = scrollTop + this.memberContainerEl.elementRef.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.memberContainerEl.elementRef.nativeElement.scrollTop -= 62;
      }
    }
  }
  saveMemberResults(data) {
    this.sessionService.set('cached-members', data);
  }
  getMemberResults() {
    if (this.sessionService.get('cached-members')) {
      return <any>this.sessionService.get('cached-members');
    } else {
      return null;
    }
  }

  checkPaginationOfCreateGroup() {
    if (!this.isGroupMembersFetched && (this.memberContainerEl.elementRef.nativeElement.scrollTop +
      this.memberContainerEl.elementRef.nativeElement.clientHeight)
      / this.memberContainerEl.elementRef.nativeElement.scrollHeight >= 0.98) {
      if (!stopGroupHit) {
        page_start = page_start + page_size_count;
        this.hitForNextMembers();
      }
    }
  }


  hitForNextMembers() {
    stopGroupHit = true;
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_status: 'ENABLED',
      user_type: 'ALL_MEMBERS',
      page_start: page_start,
      include_user_guests: true
    };
    this.service.getAllMembers(obj)
      .subscribe(res => {
        stopGroupHit = false;
        const group_mem = res.data.all_members;
        if (group_mem.length) {
          this.search_results = [...this.search_results, ...group_mem];
          // this.search_results = this.search_results.filter(member =>
          //   !this.selected_members[member.fugu_user_id]);
        } else {
          this.isGroupMembersFetched = true;
        }
        this.cdRef.detectChanges();
      });
  }
}
