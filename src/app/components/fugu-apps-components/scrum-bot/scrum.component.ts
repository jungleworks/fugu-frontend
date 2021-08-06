import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-scrum',
  templateUrl: './scrum.component.html',
  styleUrls: ['./scrum.component.scss']
})
export class ScrumComponent implements OnInit {
  constructor(public sessionService: SessionService) { }
  spaceData;

  ngOnInit() {
    const spaceDataAll = <any>this.sessionService.get('spaceDictionary');
    const workspace = window.location.pathname.split('/')[1];
    this.spaceData = spaceDataAll[workspace];
  }

}
