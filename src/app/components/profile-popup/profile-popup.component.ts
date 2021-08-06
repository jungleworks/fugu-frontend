import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {SessionService} from '../../services/session.service';
import {CommonService} from '../../services/common.service';
import {UserStatus, Role} from '../../enums/app.enums';
import {SidebarService} from '../sidebar/sidebar.service';
import {Router, ActivatedRoute} from '@angular/router';
import { LayoutService } from '../layout/layout.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-profile-popup',
  templateUrl: './profile-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./profile-popup.component.scss']
})
export class ProfilePopupComponent implements OnInit {

  spaceData;
  profileInfo;
  userId;
  public RoleStatusEnum = Role;
  public UserStatusEnum = UserStatus;
  @Output('closePopup') closePopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('id') id;
  @Input()
  set user_id(val) {
    if (val) {
      this.profileInfo = null;
      this.userId = val;
      this.fetchUserDetails();
    }
  }
  constructor(private sessionService: SessionService, public commonService: CommonService, private cdRef: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute,
              private sidebarService: SidebarService, private layoutService: LayoutService, private router: Router, public commonApiService: CommonApiService) { }

  ngOnInit() {
    this.spaceData = this.commonService.currentOpenSpace;
    this.commonService.spaceDataEmitter.subscribe(() => {
      this.spaceData = this.commonService.currentOpenSpace;
    });
  }
  fetchUserDetails() {
    const obj = {
      'fugu_user_id': this.userId,
      'workspace_id': this.spaceData.workspace_id
    };
    this.commonApiService.getUserInfo(obj)
      .subscribe(response => {
        if (response.statusCode === 200) {
          this.profileInfo = response.data;
          this.cdRef.detectChanges();
        }
    });
  }
  createConversation() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      chat_with_user_id: this.userId
    };
    this.sidebarService.createConversation(obj)
      .subscribe((response) => {
        const channelId = response.data.channel_id;
        if (this.commonService.conversations[channelId] && this.commonService.conversations[channelId].unread_count) {
          this.layoutService.unreadCountEmitter.emit(this.commonService.conversations[channelId].unread_count);
          this.commonService.conversations[channelId].unread_count = 0;
        } else {
          this.layoutService.unreadCountEmitter.emit(0);
        }
        this.router.navigate([`../../${response.data.channel_id}`], {relativeTo: this.activatedRoute});
        // this.router.navigate(['/'+this.spaceData.workspace,'/messages', response.data.channel_id]);
        this.cdRef.markForCheck();
      });
  }
  createGroup() {
    this.closePopup.emit(false);
    const user_object = {};
    user_object[this.userId] = {
      full_name: this.profileInfo.full_name,
      user_thumbnail_image: this.profileInfo.user_image || '',
      fugu_user_id: this.userId
    };
    this.commonService.createGroupEmitter.emit({
      is_open: true,
      members: user_object
    });
  }
}
