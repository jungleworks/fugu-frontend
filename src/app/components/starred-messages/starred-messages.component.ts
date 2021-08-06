import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { StarredMessagesService } from './starred-messages.service';
import { CommonService } from '../../services/common.service';
import { MessageType } from '../../enums/app.enums';
import { MessageService } from '../../services/message.service';
import { animate, style, transition, trigger, state, query, animateChild } from '@angular/animations';
import { LayoutService } from '../layout/layout.service';
import { fadeIn, messageModalAnimation } from '../../animations/animations';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-starred-messages',
  templateUrl: './starred-messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./starred-messages.component.scss'],
  animations: [
    fadeIn,
    messageModalAnimation
  ]
})
export class StarredMessagesComponent implements OnInit {
  public MessageTypeEnum = MessageType;
  dataForCarousel = {};
  page_start = 1;
  page_size;
  showImageCarousel = false;
  starred_messages_end = false;
  showLoader = false;
  menu_open = false;
  starred_messages = {};
  unstarAllMessagePopup = false;
  @Input()
  set deletedMessage(data) {
    if (data) {
      this.unstar_messages(data.muid);
    }
  }
  @Input()
  set clearChatItem(data) {
      if (data) {
        this.clearChatItemData = data;
        this.starred_messages = {};
        this.getStarredUsers();
      }
  }
  @Input()
  set message_item(data) {
    if (data) {
      if (data.is_starred) {
        if (!data.thread_muid) {
          this.starred_messages[data.muid] = data;
        } else {
          this.starred_messages[data.thread_muid] = data;
        }
        this.starred_messages = { ...this.starred_messages };
        this.cdRef.detectChanges();
      } else {
        this.unstar_messages(data.thread_muid || data.muid);
      }
    }
  }
  @ViewChild('starredBody', { static: true }) starredBody;
  @Output() jumpToStar: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  closeStarredMessage: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  unstarringAll: EventEmitter<any> = new EventEmitter<any>();
  clearChatItemData: any;
  constructor(private messageService: MessageService, private service: StarredMessagesService, private commonService: CommonService,
    private cdRef: ChangeDetectorRef, private layoutService: LayoutService) { }

  ngOnInit() {
    this.starredBody.nativeElement.scrollTop = 0;
    if (!this.clearChatItemData) {
      this.getStarredUsers();
    }
    document.getElementById('starredBody').addEventListener('scroll', (e) => {
      this.onMessagesScroll(e);
    });
  }
  unstarAll() {
    this.starred_messages = {};
    const unstarall_obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      unstar_all: true
    };
    this.service.unstarMessage(unstarall_obj)
      .subscribe((res) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
        this.unstarAllMessagePopup = false;
        this.cdRef.detectChanges();
      });
    this.unstarringAll.emit('all');
  }
  getStarredUsers() {
    this.showLoader = true;
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      page_start: this.page_start
    };
    this.service.getStarredUsers(obj)
    .pipe(debounceTime(100))
      .subscribe((res) => {
        res.data.starred_messages.map((item) => {
          this.starred_messages[item.thread_muid || item.muid] = item;
        });
        this.starred_messages = { ...this.starred_messages };
        this.page_size = res.data.page_size;
        this.starred_messages_end = !!!res.data.starred_messages.length;
        this.showLoader = false;
        this.cdRef.detectChanges();
      });
  }
  unstar_messages(muid) {
    delete this.starred_messages[muid];
    this.starred_messages = { ...this.starred_messages };
    this.cdRef.detectChanges();
  }
  onMessagesScroll(e) {
    if (this.starredBody.nativeElement.scrollHeight -
      this.starredBody.nativeElement.scrollTop - this.starredBody.nativeElement.clientHeight == 0 &&
      !this.starred_messages_end) {
      this.page_start += this.page_size;
      this.getStarredUsers();
    }
  }
  jumpToMessage(muid) {
    this.jumpToStar.emit(this.starred_messages[muid]);
  }
  unstarMessage(item) {
    const unstar_obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      thread_muid: item.thread_muid || undefined,
      muid: !item.thread_muid ? item.muid : undefined,
      is_starred: 0,
      channel_id: item.channel_id
    };
    this.service.unstarMessage(unstar_obj)
      .subscribe((res) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
        this.unstar_messages(item.thread_muid ? item.thread_muid : item.muid);
        this.unstarringAll.emit(item.thread_muid ? item.thread_muid : item.muid);
      });
  }
  openImage(media, muid) {
    media.type = this.commonService.checkMimeType(media.message_type ==
      this.MessageTypeEnum.Media_Message ? media.image_url : media.url);
    media.documentType = media.document_type;
    media.messageExtension = this.commonService.checkFileExtension(media.message_type ==
      this.MessageTypeEnum.Media_Message ? media.image_url : media.url);
    media = {
      message: media,
      messageType: media.message_type,
      documentType: media.document_type,
      messageExtension: this.commonService.checkMimeType(media['image_url'] || media['url'])
    };
    this.dataForCarousel['carouselArray'] = [media];
    this.dataForCarousel['imageIndex'] = 0;
    this.dataForCarousel['type'] = 'CHAT';
    this.dataForCarousel['media'] = media;
    this.dataForCarousel['channelName'] = this.starred_messages[muid].label;
    this.dataForCarousel['chatType'] = this.starred_messages[muid].chat_type;
    this.showImageCarousel = true;
  }
  closeStarred() {
    this.closeStarredMessage.emit();
    this.layoutService.starredState.emit(false);
  }
  unstarClickOutside(event) {
    if (event && event['value'] === true && !this.checkClassContains(['three-dots'], event.target.classList)) {
      this.menu_open = false;
    }
  }
  checkClassContains(array, list) {
    let flag = true;
    for (let i = 0; i < array.length; i++) {
      flag = list.contains(array[i]);
      if (flag) {
        return flag;
      }
    }
    return false;
  }

}
