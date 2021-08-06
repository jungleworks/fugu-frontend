import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared.module';
import {SocketioService} from '../../services/socketio.service';
import { VideoCallService } from '../../components/video-call/video-call.service';
import { SwitchConferenccPopupComponent } from '../../components/switch-conference/switch-conference-popup.component';
import { LayoutService } from '../../components/layout/layout.service';
import { AudioVideoCallComponent } from '../../components/audio-video-call/audio-video-call.component';
const routes: Routes = [
  {
    path: '',
    component: AudioVideoCallComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    AudioVideoCallComponent,
    SwitchConferenccPopupComponent
  ],
  exports: [RouterModule],
  providers: [SocketioService, VideoCallService, LayoutService]
})
export class CallingModule { }
