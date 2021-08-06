import { RTCCallType } from './../../enums/app.enums';
import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ICallerInfo } from '../../interfaces/app.interfaces';
import { CommonService } from '../../services/common.service';
import { LayoutService } from '../layout/layout.service';

@Component({
  selector: 'app-call-ringer-popup',
  templateUrl: './call-ringer-popup.component.html',
  styleUrls: ['./call-ringer-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CallRingerPopupComponent implements OnInit, OnDestroy {

  @Input() call_type: any;
  @Input() caller_info: ICallerInfo;
  @Input() isGoogleMeetCall: ICallerInfo;
  @Output() p2pCallActionButton: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() conferenceCallActionButton: EventEmitter<any> = new EventEmitter<any>();
  @Output() meetActionButton: EventEmitter<any> = new EventEmitter<any>();

  public RTCCallTypeEnum = RTCCallType;

  constructor(private cdRef: ChangeDetectorRef, private layoutService: LayoutService) { }

  ngOnInit() {
    this.layoutService.playNotificationSound('../../../assets/audio/video_call_ringtone', true);
  }

  acceptVideoCall() {
    let link;
    if (this.caller_info) {
    }
    if (this.call_type != 'CONFERENCE') {
      this.p2pCallActionButton.emit(true);
    } else {
      if (this.caller_info.invite_link.includes('conferencing')) {
        this.caller_info.invite_link = this.caller_info.invite_link.replace('conferencing', 'meet')  
      }
      if (this.caller_info.is_audio_conference && !this.caller_info.invite_link.includes('#config.startWithVideoMuted')) {
          if (this.caller_info.invite_link.includes('https://')) {
            link =  this.caller_info.invite_link + '#config.startWithVideoMuted=true';
          } else {
            link = "https://" + this.caller_info.invite_link + '#config.startWithVideoMuted=true';
          }
      } else {
        if (this.caller_info.invite_link.includes('https://')) {
          link = this.caller_info.invite_link;
        } else {
          link = "https://" + this.caller_info.invite_link;
        }
      }
      window.open(link, '_blank',
      `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${window.outerWidth - 100},height=${window.outerHeight - 100}`);
      if (this.isGoogleMeetCall) {
        this.meetActionButton.emit("accept");
      } else {
        this.conferenceCallActionButton.emit("accept");
      }
    }
  }

  rejectVideoCall() {
    this.call_type != 'CONFERENCE' ? this.p2pCallActionButton.emit(false) : this.conferenceCallActionButton.emit('reject');
  }

  ngOnDestroy() {
    this.layoutService.stopVideoCallRinger();
  }
}
