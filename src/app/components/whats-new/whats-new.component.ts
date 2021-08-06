import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { WhatsNewService } from './whats-new.service';
import { CommonService } from '../../services/common.service';
import { SessionService } from '../../services/session.service';


let spaceData, page_size, whats_new_end = false;


interface IWhatsNewArray {
  date: string;
  heading: string;
  description: string;
  role: string;
  link_text: string;
  link: string;
}
@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.scss']
})
export class WhatsNewComponent implements OnInit {

  @Output()
  closeWhatsNew: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('whatsNew', { static: true }) whatsNew;
  page_start = 1;
  showLoader = false;
  whatsNewArray: Array<IWhatsNewArray> = [];

  constructor(private sessionService: SessionService, public whatsNewService: WhatsNewService, private cdRef: ChangeDetectorRef, private commonService: CommonService) { }

  ngOnInit() {
    // spaceData = this.sessionService.get('currentSpace');
    spaceData = this.commonService.currentOpenSpace;
    this.whatsNew.nativeElement.scrollTop = 0;
    this.getWhatsNewData();
    document.getElementById('whatsNew').addEventListener('scroll', (e) => {
      this.onScroll(e);
    });
  }

  getWhatsNewData() {
    this.showLoader = true;
    const obj = {
      workspace_id: spaceData.workspace_id,
      page_start: this.page_start
    };

    this.whatsNewService.getWhatsNew(obj).subscribe((response) => {
      this.whatsNewArray = [...this.whatsNewArray, ...response.data.data];
      whats_new_end = !!!response.data.data.length;
      page_size = response.data.page_size;
      this.showLoader = false;
      this.cdRef.detectChanges();
    });
  }

  onScroll(e) {
    if (this.whatsNew.nativeElement.scrollHeight -
      this.whatsNew.nativeElement.scrollTop - this.whatsNew.nativeElement.clientHeight == 0 && !whats_new_end) {
      this.page_start += page_size;
      this.getWhatsNewData();
    }
  }

}
