import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {BrowseGroupsService} from './browse-groups.service';
import {Router} from '@angular/router';
import {MessageService} from '../../services/message.service';
import {FormBuilder, FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {SocketioService} from '../../services/socketio.service';
import { messageModalAnimation } from '../../animations/animations';
import { CommonApiService } from '../../services/common-api.service';
@Component({
  selector: 'app-browse-groups',
  templateUrl: './browse-groups.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./browse-groups.component.scss'],
  animations: [
    messageModalAnimation
  ]
})
export class BrowseGroupsComponent implements OnInit {

  groupsData;
  clonedObj;
  activeChannel = 0;
  searchCtrl;
  currentObj = [];
  tempGroup;
  leaveGroupPopup = false;
  @Output()
  closeBrowseGroups: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private commonService: CommonService, private service: BrowseGroupsService, private router: Router,
          private commonApiService: CommonApiService,
              private messageService: MessageService, public cdRef: ChangeDetectorRef, public socketService: SocketioService) {
  }

  ngOnInit() {
    this.searchCtrl = new FormControl();
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data) {
          this.groupsData = this.searchGroups(data);
        } else {
          this.groupsData = this.currentObj;
        }
        this.cdRef.detectChanges();
      });
    this.fetchData();
  }
  getAllChannels() {
    this.groupsData = this.clonedObj.joined_channels.concat(this.clonedObj.open_channels);
    this.currentObj = JSON.parse(JSON.stringify(this.groupsData));
  }

  getJoinedChannels() {
    this.groupsData = this.clonedObj.joined_channels;
    this.currentObj = JSON.parse(JSON.stringify(this.groupsData));
  }

  fetchData() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id
    };
    this.service.getGroups(obj)
      .subscribe(response => {
        if (response.statusCode === 200) {
          response.data.joined_channels.map((item) => {
            item.is_joined = true;
          });
          this.clonedObj = JSON.parse(JSON.stringify(response.data));
          this.activeChannel === 0 ? this.getAllChannels() : this.getJoinedChannels();
          this.cdRef.detectChanges();
        }
      });
  }
  joinGroup(data) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: data.channel_id
    };
    this.commonApiService.joinGroup(obj)
      .subscribe(response => {
        if (response.statusCode === 200) {
          this.messageService.sendAlert({
            type: 'success',
            msg: 'Joined Successfully',
            timeout: 2000
          });
          // this.searchCtrl.reset();
          for (let i = 0; i < this.clonedObj.open_channels.length; i++) {
            if (this.clonedObj.open_channels[i].channel_id === data.channel_id) {
              this.clonedObj.open_channels[i].is_joined = true;
              this.clonedObj.joined_channels.push(this.clonedObj.open_channels[i]);
              this.clonedObj.open_channels.splice(i, 1);
              break;
            }
          }
          this.getAllChannels();
          this.search();
          // this.fetchData();
          this.cdRef.detectChanges();
        }
      });
  }
  leaveGroup() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_id: this.tempGroup.channel_id
    };
    this.commonApiService.leaveGroup(obj)
      .subscribe(response => {
        if (response.statusCode === 200) {
          this.messageService.sendAlert({
            type: 'success',
            msg: 'Left Group Successfully',
            timeout: 2000
          });
          this.searchCtrl.reset();
          this.leaveGroupPopup = false;
          this.fetchData();
          const remove_obj = {
            channel_id: this.tempGroup.channel_id,
            removed_user_id: this.commonService.userDetails.user_id,
            notification_type: 2
          };
          this.socketService.onMemberRemoveEvent.emit(remove_obj);
          this.cdRef.detectChanges();
        }
      });
  }
  searchGroups(name: string) {
    return this.currentObj.filter(state =>
      state.label.toLowerCase().includes(name.toLowerCase()));
  }
  leaveGroupModal(group) {
    this.tempGroup = group;
    this.leaveGroupPopup = true;
  }
  search() {
    if (this.searchCtrl.value) {
      this.groupsData = this.searchGroups(this.searchCtrl.value);
    } else {
      this.groupsData = this.currentObj;
    }
  }
}
