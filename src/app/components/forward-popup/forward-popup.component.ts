import { ChatTypes } from './../../enums/app.enums';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {FormControl} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {SidebarService} from '../sidebar/sidebar.service';
import {MessageStatus, Typing} from '../../enums/app.enums';
import {SessionService} from '../../services/session.service';
import {debounceTime} from 'rxjs/operators';
import { LayoutService } from '../layout/layout.service';
import {SocketioService} from '../../services/socketio.service';
import { CommonApiService } from '../../services/common-api.service';

declare const jQuery: any;
declare const moment: any;

@Component({
  selector: 'app-forward-popup',
  templateUrl: './forward-popup.component.html',
  styleUrls: ['./forward-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForwardPopupComponent implements OnInit {

  chats_list = [];
  chats_list_copy = [];
  chatSearchCtrl;
  active_index = -1;
  userData;
  @Input('msg_data') msg_data;
  @Input('active_channel_id') active_channel_id;
  @Output()
  closeForwardPopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('chatsContainer', { static: true }) chatsContainer;
  constructor(private commonService: CommonService, private router: Router, private sidebarService: SidebarService,
              private commonApiService: CommonApiService,
              private cdRef: ChangeDetectorRef, private sessionService: SessionService, private socketService: SocketioService,
              private layoutService: LayoutService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.userData = this.sessionService.get('loginData/v1')['user_info'];
    this.chatSearchCtrl = new FormControl();
    this.chatSearchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((data) => {
        this.active_index = -1;
        this.chatsContainer.nativeElement.scrollTop = 0;
        if (data && data.length > 2) {
          this.searchChats(data);
        } else {
          this.chats_list = this.chats_list_copy;
          this.cdRef.detectChanges();
        }
      });
    this.chats_list = Object.values(this.commonService.conversations).filter((item) => {
      return item['chat_type'] != ChatTypes.BOT && item['other_user_status'] != 'DISABLED';
    });
    this.chats_list_copy = JSON.parse(JSON.stringify(this.chats_list));
    jQuery('#forwardPopup').on('hidden.bs.modal', () => {
      this.closeForwardPopup.emit();
    });
    setTimeout(() => {
      document.getElementById('forward-search-box').focus();
    }, 800);
  }

  searchChats(search_text) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      search_text: search_text
    };
    this.commonApiService.search(obj)
      .subscribe((response) => {
        this.chats_list = [];
        this.chats_list = this.chats_list.concat(response.data.users, response.data.channels);
        this.cdRef.detectChanges();
      });
  }
  sendAttachment(obj) {
    if (obj.channel_id) {
      this.forwardMessage(this.msg_data, obj.channel_id);
    } else {
      this.createConversation(obj);
    }
  }
  createConversation(data) {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      chat_with_user_id: data.user_id
    };
    this.sidebarService.createConversation(obj)
      .subscribe((response) => {
        this.forwardMessage(this.msg_data, response.data.channel_id);
      });
  }
  routeToChannel(channel_id, user_id = -1) {
    if (channel_id != this.active_channel_id) {
      // this.router.navigate(['/messages', channel_id]);
      this.router.navigate(['../' + channel_id], { relativeTo: this.activatedRoute });
    }
  }
  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {

    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      jQuery('#results' + this.active_index).click();
      this.chatsContainer.nativeElement.scrollTop = 0;
    }
  }
  private searchDownArrow() {
    if (this.active_index != this.chats_list.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 71;
      const scrollTop = this.chatsContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.chatsContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.chatsContainer.nativeElement.scrollTop += 71;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 71;
      const scrollTop = this.chatsContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.chatsContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.chatsContainer.nativeElement.scrollTop -= 71;
      }
    }
  }
  forwardMessage(data, channel_id) {
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    const obj = {
      message: '',
      full_name: this.commonService.userDetails.full_name,
      user_id: this.commonService.userDetails.user_id,
      date_time: now,
      email: this.userData.email,
      is_thread_message: false,
      channel_id: channel_id,
      muid: this.commonService.generateRandomString(),
      image_width: data.image_width,
      image_height: data.image_height,
      message_type: data.message_type,
      user_type: data.user_type,
      message_status: MessageStatus.Sent,
      file_name: data.file_name,
      file_size: data.file_size
    };
    this.setServerUrls(obj, data);
    this.socketService.sendMessage(obj).then((res) => {
      this.layoutService.unreadCountEmitter.emit(0);
      this.routeToChannel(channel_id);
    });
    jQuery('#forwardPopup').modal('hide');
  }
  setServerUrls(obj, msg_obj) {
    const data = msg_obj.server_obj || msg_obj;
    obj['image_url'] = data.image_url;
    obj['thumbnail_url'] = data.thumbnail_url;
    obj['image_url_100x100'] = data.image_url_100x100;
    obj['url'] = data.url;
  }
}
