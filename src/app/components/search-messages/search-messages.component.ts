import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CommonService} from '../../services/common.service';
import { CommonApiService } from '../../services/common-api.service';

let page_start_search = 1;
let page_size_search;
@Component({
  selector: 'app-search-messages',
  templateUrl: './search-messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./search-messages.component.scss']
})
export class SearchMessagesComponent implements OnInit {

  search_text;
  page_size;
  page_start = 1;
  searched_messages = [];
  showLoader = false;
  messages_end = false;
  notificationsContainerEl;
  stopSearchHit = false;
  @Input()
  set messages_data(data) {
    if (Object.keys(data).length) {
      page_size_search = data.page_size_search;
      page_start_search = 1;
      this.search_text = data.search_text;
      this.searched_messages = data.messages;
      // this.searched_messages = this.searched_messages.concat(data.messages);
      this.page_size = data.page_size;
      // this.searchContainer.nativeElement.scrollTop = 0;
      this.messages_end = false;
    }
  }
  @Output() jumpToSearch: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeSearch: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('searchContainer') set searchContainer(ref) {
    if (ref) {
      // this.notificationsContainerEl = ref;
      this.notificationsContainerEl = ref;
      const el = document.getElementById('search-container');
      document.getElementById('search-container').addEventListener('scroll', (e) => {
        if (!this.stopSearchHit && !this.messages_end ) {
          this.searchScroll(e);
        }
      });
    }
  }
  constructor(public commonService: CommonService, private cdRef: ChangeDetectorRef, private commonApiService: CommonApiService) { }

  ngOnInit() {

  }

  jumpToMessage(data) {
    this.commonService.jumpToSearch.emit(data);
  }

  searchScroll(e) {
    if ((this.notificationsContainerEl.nativeElement.scrollTop +
      this.notificationsContainerEl.nativeElement.clientHeight)
      / this.notificationsContainerEl.nativeElement.scrollHeight >= 0.98) {
      // this.showLoader = true;
      this.stopSearchHit = true;
      page_start_search += page_size_search;
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        search_text: this.search_text,
        page_start: page_start_search
      };
      this.commonApiService.searchMessages(obj)
        .subscribe((res) => {
          // this.showLoader = false;
          /**
           * passing search text
           */
          if (!res.data.searchable_messages.length) {
            this.messages_end = true;
          }

          this.stopSearchHit = false;
          this.notificationsContainerEl.nativeElement.scrollTop = this.notificationsContainerEl.nativeElement.scrollTop - 1000;
          this.searched_messages = this.searched_messages.concat(res.data.searchable_messages);
          this.cdRef.detectChanges();
        });
    } 
  }
}
