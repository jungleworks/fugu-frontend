import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {IContentEditableTrigger} from '../../interfaces/app.interfaces';
import {UserType, ChatTypes, leaveRole} from '../../enums/app.enums';
import {SessionService} from '../../services/session.service';
import {CommonApiService} from '../../services/common-api.service';

let searchStringNotExist;

@Component({
  selector: 'app-tag-users',
  templateUrl: './tag-users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tag-users.component.scss']
})
export class TagUsersComponent implements OnInit {

  @ViewChild('mentionListScroll', {static: true}) private mentionListScroll: ElementRef;
  @Input() mentionData = <IContentEditableTrigger>{
    data_array: []
  };
  @Input() activeChannelId;
  sortedList = [];
  tag_index = 0;
  UserTypeEnum = UserType;
  user_details;
  leaveRoleEnum = leaveRole;
  spaceData;
  @Output() itemClickEvent: EventEmitter<object> = new EventEmitter<object>();
  @Output() closeMentionList: EventEmitter<boolean> = new EventEmitter<boolean>();

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeMentionList.emit(true);
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Check if the click was outside the element
    if (targetElement && !this.mentionListScroll.nativeElement.contains(targetElement)) {
      this.closeMentionList.emit(true);
    }
  }

  constructor(public commonService: CommonService, private cdRef: ChangeDetectorRef, private sessionService: SessionService,
              private commonApiService: CommonApiService) {
  }

  ngOnInit() {
    this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
  }

  public enterToSelect() {
    if (this.sortedList.length) {
      const user = this.sortedList[this.tag_index];
      this.itemClickEvent.emit(user);
    }
  }

  public upArrow() {
    if (this.tag_index != 0) {
      this.tag_index--;
      const elHeight = 52;
      const scrollTop = this.mentionListScroll.nativeElement.scrollTop;
      const viewport = scrollTop + this.mentionListScroll.nativeElement.offsetHeight;
      const elOffset = elHeight * this.tag_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.mentionListScroll.nativeElement.scrollTop -= 52;
      }
      this.cdRef.detectChanges();
    }
  }

  public downArrow() {
    if (this.tag_index != this.sortedList.length - 1) {
      this.tag_index++;
      // scroll the div
      const elHeight = 52;
      const scrollTop = this.mentionListScroll.nativeElement.scrollTop;
      const viewport = scrollTop + this.mentionListScroll.nativeElement.offsetHeight;
      const elOffset = elHeight * this.tag_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.mentionListScroll.nativeElement.scrollTop += 52;
      }
      this.cdRef.detectChanges();
    }
  }

  public filterList(value: string) {
    /**
     * checking group members length, if it is less then show tagging users from local array
     * else show from the search API
     * In case of bots (changemymanager, getcontactnumber), check if chat type is 7
     */
    if (this.mentionData.members_count > this.mentionData.data_array.length || this.mentionData.chat_type == ChatTypes.BOT) {
      /**
       * if string value is more than 1, then only hit the api else show from the local
       * Also, if a string doesn't exist, stop further api hits by checking the prefix
       */

      if (value.startsWith(searchStringNotExist)) {
        this.sortedList = [];
        /**
         * append everyone in every case except bots
         */
        if ('everyone'.includes(value.toLowerCase()) && this.mentionData.chat_type != ChatTypes.BOT) {
          this.sortedList.unshift({
            full_name: 'Everyone',
            user_id: -1,
            user_image: 'assets/img/channel-placeholder.png',
            is_everybody: true
          });
        }
        this.cdRef.detectChanges();
        return;
      }
      if (value.length > 1) {
        const obj = {
          en_user_id: this.user_details.en_user_id,
          search_text: value,
          tagging: true,
          channel_id: this.mentionData.chat_type == ChatTypes.BOT ? undefined : this.activeChannelId
        };


        this.commonApiService.searchUsersInGroup(obj).subscribe(response => {
          if (this.mentionData.triggerType == 'USERS') {
            this.sortedList = response.data.users;
            if (!this.sortedList.length) {
              searchStringNotExist = value;
            }
            this.cdRef.detectChanges();
          }
        });
        this.cdRef.detectChanges();
      } else {
        this.sortedList = this.mentionData.data_array.filter((item) => {
          if (this.mentionData.triggerType == 'USERS') {
            return item.full_name.toLowerCase().includes(value) && item.user_id != this.commonService.userDetails.user_id;
          } else {
            return item.tag.toLowerCase().includes(value);
          }
        });
        this.cdRef.detectChanges();
      }
    } else {
      value = value.toLowerCase().trim();
      this.sortedList = this.mentionData.data_array.filter((item) => {
        if (this.mentionData.triggerType == 'USERS') {
          return item.full_name.toLowerCase().includes(value) && item.user_id != this.commonService.userDetails.user_id;
        } else {
          return item.tag.toLowerCase().includes(value);
        }
      });
      if (!this.sortedList.length) {
        this.closeMentionList.emit(true);
      }
      this.cdRef.detectChanges();
    }

  }

}
