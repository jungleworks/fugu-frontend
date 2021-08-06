// import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// import { messageModalAnimation } from '../../animations/animations';
// import { SessionService } from '../../services/session.service';
// import { CommonService } from '../../services/common.service';

// @Component({
//   selector: 'app-shift-to-new-workspace',
//   templateUrl: './shift-to-new-workspace.component.html',
//   styleUrls: ['./shift-to-new-workspace.component.scss'],
//   animations: [
//     messageModalAnimation
//   ]
// })
// export class ShiftToNewWorkspaceComponent implements OnInit {
//   spaceData;
//   @Output() closeModal: EventEmitter<boolean> = new EventEmitter();
//   constructor(private sessionService: SessionService, public commonService: CommonService) { }

//   ngOnInit() {
//     this.spaceData = this.sessionService.get('currentSpace');
//   }

//   switchToNewWebLook() {
//    if(this.commonService.isWhitelabelled) {
//     window.open(`https://${this.commonService.whitelabelConfigurations['full_domain']}`);
//    } else {
//     window.open('https://app.fugu.chat', '_self');
//    }

//   }
 
// }
