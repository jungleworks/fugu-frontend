import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { MessageReadService } from './message-read-by.service';
import { SessionService } from '../../services/session.service';
import { MessageType } from '../../enums/app.enums';
import { CommonService } from '../../services/common.service';
import { MessageService } from '../../services/message.service';
import { LayoutService } from '../layout/layout.service';

let page_start = 0;
let page_size_count;
let stopHitMembers = false;

@Component({
  selector: 'app-message-read-by',
  templateUrl: './message-read-by.component.html',
  styleUrls: ['./message-read-by.component.scss']
})
export class MessageReadByComponent implements OnInit {
  @Output()
  closeReadBy: EventEmitter<any> = new EventEmitter<any>();
  @Input() set readByData(data) {
      this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
      this.readByMembersData = data;
      this.read_members = [];
      page_start = 0;
      this.getReadBy();
      this.cdRef.detectChanges();
  }
  @ViewChild('readByContainer') set readByContainer(memberContent: ElementRef) {
    if (memberContent) {
      this.readByContainerEl = memberContent;
      if (document.getElementById('read-by-container')) {
        document.getElementById('read-by-container').addEventListener('scroll', (event) => {
          this.onUsersScroll();
        });
      }
    }
  }
  readByMembersData;
  readByContainerEl;
  user_details;
  isMembersFetched = false;
  read_members = [];
  dataForCarousel = {};
  MessageTypeEnum = MessageType;
  showImageCarousel = false;
  statusCode;
  readMessageStatus;
  constructor(public messageReadService: MessageReadService, public sessionService: SessionService, public cdRef: ChangeDetectorRef,
    public commonService: CommonService, public messageService: MessageService, public layoutService: LayoutService) { }

  ngOnInit() {
    /**
     * update edit and delete real time in message time info from chat
     */
    this.layoutService.updateReadByWindow.subscribe(data => {
      if ((data.muid && data.muid == this.readByMembersData.muid) || (data.thread_muid && data.thread_muid == this.readByMembersData.thread_muid)) {
        this.readByMembersData = Object.assign(this.readByMembersData, data);
        this.cdRef.detectChanges();
      }
    });
  }

  getReadBy() {
    if (page_start == 0) {
      this.isMembersFetched = false;
      this.cdRef.detectChanges();
    }
    stopHitMembers = true;
    const obj = {
     en_user_id: this.user_details.en_user_id,
     channel_id: this.readByMembersData.channel_id,
     page_start: page_start
    };
    obj[this.readByMembersData.thread_muid ? 'thread_muid' : 'muid'] = this.readByMembersData.thread_muid ? this.readByMembersData.thread_muid : this.readByMembersData.muid;
    this.messageReadService.getReadUsers(obj)
      .subscribe(response => {
        if (page_start == 0) {
          const el = document.getElementById('message-read-by-container');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
        this.statusCode = response.statusCode;
        this.readMessageStatus = response.data.customMessage;
        if (response.statusCode == 204) {
          this.messageService.sendAlert({
            type: 'success',
            msg: response.statusCode.message,
            timeout: 3000
          });
          this.cdRef.detectChanges();
          return;
        }
        stopHitMembers = false;
        if (!response.data.message_seen_by.length) {
          this.isMembersFetched = true;
        }
        this.read_members = [...this.read_members, ...response.data.message_seen_by];
        page_size_count = response.data.page_size;
        this.cdRef.detectChanges();
    });
  }

  onUsersScroll() {
    if (!this.isMembersFetched && (this.readByContainerEl.nativeElement.scrollTop +
      this.readByContainerEl.nativeElement.clientHeight)
      / this.readByContainerEl.nativeElement.scrollHeight >= 0.98) {
      if (!stopHitMembers) {
        page_start = page_start + page_size_count;
        this.getReadBy();
      }
    }
  }

  openImage(media) {
    /**
     * isSingle key and singleData for exception cases in gallery carousel when only a single thumbnail is required in the view
     */
    let singleData = {};
    singleData[media.thread_muid || media.muid] = {
      message: media,
      date_time: media.date_time,
      messageType: media.message_type,
      documentType: media.document_type || this.commonService.checkMimeType(media.message_type == this.MessageTypeEnum.Media_Message ?
        media['image_url'] : media['url'])
    };
    this.dataForCarousel['isSingle'] = true;
    this.dataForCarousel['singleData'] = singleData;
    this.dataForCarousel['currentMuid'] = media.thread_muid || media.muid;
    this.dataForCarousel['channelImage'] = this.readByMembersData.channelImage;
    this.dataForCarousel['channelName'] = this.readByMembersData.channelName;
    this.dataForCarousel['channelId'] = media.channel_id;
    this.dataForCarousel['chatType'] = media.chat_type;
    this.showImageCarousel = true;
  }

  onFileClick(event, element, message) {
    element.href = message.url;
    element.click();
  }

  closeReadByWindow() {
    this.closeReadBy.emit();
  }
}
