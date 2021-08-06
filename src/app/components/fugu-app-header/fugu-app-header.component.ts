import { Component, OnInit } from '@angular/core';
import { FuguAppService } from '../../services/fugu-apps.service';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-fugu-app-header',
  templateUrl: './fugu-app-header.component.html',
  styleUrls: ['./fugu-app-header.component.scss']
})
export class FuguAppHeaderComponent implements OnInit {
  spaceData;
  constructor(private service: FuguAppService, private sessionService: SessionService, public commonService: CommonService,
    public commonApiService: CommonApiService) { }

  ngOnInit() {
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
  }

}
