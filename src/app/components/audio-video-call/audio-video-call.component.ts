import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  RTCCallType,
  MessageType,
  UserType,
  MessageStatus,
  SocketErrorCodes,
  VideoCallType,
  callHangupType
} from '../../enums/app.enums';
import { ActivatedRoute } from '@angular/router';
import { VideoCallService } from '../video-call/video-call.service';
import { CommonApiService } from '../../services/common-api.service';
import { CommonService } from '../../services/common.service';
import { SessionService } from '../../services/session.service';
import { SocketioService } from '../../services/socketio.service';
import { takeWhile } from 'rxjs/operators';
import { LayoutService } from '../layout/layout.service';
import { MessageService } from '../../services/message.service';
import { messageModalAnimation } from '../../animations/animations';
declare const moment: any;
let oldConferenceUrl;
@Component({
  selector: 'app-audio-video-call',
  templateUrl: './audio-video-call.component.html',
  styleUrls: ['./audio-video-call.component.scss'],
  animations: [messageModalAnimation]
})
export class AudioVideoCallComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private videoService: VideoCallService,
    public commonApiService: CommonApiService,
    public commonService: CommonService,
    private sessionService: SessionService,
    private socketService: SocketioService,
    private cdRef: ChangeDetectorRef,
    private layoutService: LayoutService,
    private messageService: MessageService
  ) {}
  retry_counter = 0;
  retry_interval;
  retry_interval_ios;
  retry_timeout;
  showFeedbackPopup = false;
  hangupErrorEnum = callHangupType;
  alive = true;
  offer_data;
  channel_details = {};
  callingUrl = '';
  userData;
  user_details;
  is_call_connected = false;
  calling_text = 'CALLING...';
  unique_muid;
  showCallingScreen = true;
  showVersionPopup = false;
  window_obj = {
    is_video_open: false
  };
  conf_invite_link;

  feedback_object = {
    selectedStar: undefined,
    feedbackText: undefined,
    starsArray: [
      {
        label: 'Very Bad',
        value: 1
      },
      {
        label: 'Bad',
        value: 2
      },
      {
        label: 'Average',
        value: 3
      },
      {
        label: 'Good',
        value: 4
      },
      {
        label: 'Very Good',
        value: 5
      }
    ]
  };
  showOldtext = false;
  fugu_config;
  static generateRandomString() {
    const charsLower = 'abcdefghijklmnopqrstuvwxyz';
    const charsUpper = charsLower.toUpperCase();
    let chars;

    chars = charsLower + charsUpper;

    const length = 10;

    let string = '';
    for (let i = 0; i < length; i++) {
      let randomNumber = Math.floor(Math.random() * 32) + 1;
      randomNumber = randomNumber || 1;
      string += chars.substring(randomNumber - 1, randomNumber);
    }
    return string;
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params && params['space']) {
        const domainDictionary = this.sessionService.get('spaceDictionary');
        this.userData = domainDictionary[params['space']];
      }
    });

    /* error for old version, open the old route of /calling */
      this.socketService.oldVersionErrorEvent.subscribe(error => {
        clearInterval(this.retry_interval);
        clearInterval(this.retry_interval_ios);
        if (error.statusCode == SocketErrorCodes.app_old_version) {
          this.calling_text = this.channel_details['user_name'] + ' ' +  'doesn\'t have the latest version of app installed.';
           this.showOldtext = true;

          // setTimeout(() => {
          //   window.close();
          //   window.opener.postMessage({ type: 'old-version', data: this.window_obj }, '*');
          // }, 5000);
        }
      });


    /* event to listen from jitsi iframe */
    this.listenFromJitsiFrame();

    /* when browser is closed or cross is clicked from  window tab */
    this.closeWindowEvent();

    this.channel_details = window['video_call_obj'] || {};

    /* for cases like refresh when there is no channel detail */
    // if (!this.channel_details || !Object.keys(this.channel_details).length) {
    //   window.close();
    //   return;
    // }

    /* Check conference call */
    this.checkForConferenceCall();

    this.offer_data = this.channel_details['video_offer_data'];

    this.unique_muid = this.commonService.generateUUID();

    if (!this.userData) {
      this.userData = this.commonService.currentOpenSpace;
    }
    this.user_details = this.commonService.userDetailDict[
      window.location.pathname.split('/')[1]
    ];

    if (Object.keys(this.channel_details).length) {
      this.socketService
        .setupCallingConnection(this.channel_details['channel_id'])
        .then(() => {
          if (this.channel_details['is_video_caller']) {
            /* deciding if audio or video and generate URL*/
            this.setCallUrl();
            /* if you are calling */
            this.channel_details['video_offer_data'] = {};
            this.inviteUserToCall();
            window.opener.postMessage(
              { type: 'video-call', data: { is_video_open: true } },
              '*'
            );
          } else {
            /* if you are receiving call */
            if (!this.is_call_connected) {
              this.calling_text = 'CONNECTING...';
            }
            this.handleVideoOfferMsg(this.offer_data);
          }
        });
    }

    /* subscribe to socket events */
    this.socketService.onCallingEvent
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => this.onControlChannelNonMessageEvent(data));
  }

  listenFromJitsiFrame() {
    window.onmessage = e => {
      if (e.data.hangup) {
        /* if hangup button is called from the iframe, end call */
        this.hangUpCall();
      }
      // if (e.data.totalParticipants) {
      //   console.log('TOTALLL' + e.data.totalParticipants);
      // }
      // if (e.data.totalParticipants <= 2) {
      //   /* only send hangup in one to one case, not in conference*/
      //    this.closeVideoCall(false, true);
      // }
    };
  }

  openOldCalling() {
      const url = window.location.hostname;
      if (url == 'localhost') {
        const newWindow = window.open(window.location.pathname.split('/')[1] + '/calling', '_blank', 'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
        newWindow['video_call_obj'] =  this.channel_details;
      } else {
        if (this.commonService.isWhitelabelled) {
          const newWindow = window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${window.location.pathname.split('/')[1]}/calling`,
          '_blank',
          'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
          newWindow['video_call_obj'] =  this.channel_details;
        } else {
          const newWindow = window.open('https://' + environment.REDIRECT_PATH + '/' + window.location.pathname.split('/')[1] + '/calling' , '_blank', 'toolbar=no,scrollbars=yes,resizable=yes,top=100,left=250,width=800,height=600');
          newWindow['video_call_obj'] =  this.channel_details;
        }

      }
      window.close();
      // window.opener.postMessage({ type: 'old-version', data: this.window_obj }, '*');
  }

  hitConferenceCount(url) {
    const obj = {
      user_id_in_call: this.userData?.fugu_user_id,
      calling_link: url
    };
    this.videoService.updateConferenceCall(obj).subscribe(res => {});
  }

  checkForConferenceCall() {
    /* to find if it is a conference call */
    this.conf_invite_link = window.location.href.split('invite_link=')[1];
    /* hit api */
    if (this.conf_invite_link) {
      this.callingUrl = `${environment.FUGU_CONFERENCE_URL}/${this.conf_invite_link}`;
      this.is_call_connected = true;
          /* hit this api everytime to detect if a 3rd person joined in backend */
    this.hitConferenceCount(this.callingUrl);
    } else {
      /* for cases like refresh when there is no channel detail */
      if (!this.channel_details || !Object.keys(this.channel_details).length) {
        window.close();
        return;
      }
    }
  }

  // sendUserInfoToFrame(bool) {
  //    let frameEl:any = document.getElementById('frameEl');
  //    const obj = {
  //     totalParticipants: bool
  //    }
  //    frameEl.contentWindow.postMessage(obj, '*');
  // }

  setCallUrl() {

    if (this.channel_details['call_type'] == RTCCallType.AUDIO) {
      /* audio url has startWithVideoMuted param */
      this.callingUrl = `${
        environment.FUGU_CONFERENCE_URL
      }/${AudioVideoCallComponent.generateRandomString()}#${'config.startWithVideoMuted=true'}`;
    } else {
      this.callingUrl = `${
        environment.FUGU_CONFERENCE_URL
      }/${AudioVideoCallComponent.generateRandomString()}`;
    }
  }

  inviteUserToCall() {
    this.layoutService.playNotificationSound('assets/audio/call_ringer', true);
    this.sendToServer({
      video_call_type: VideoCallType.START_CONFERENCE,
      is_silent: false
    });
    this.sendToServer({
      video_call_type: VideoCallType.START_CONFERENCE_IOS,
      is_silent: true
    });

    this.retry_interval = setInterval(() => {
      this.sendToServer({
        video_call_type: VideoCallType.START_CONFERENCE,
        is_silent: this.retry_counter != 0
      });
      this.retry_counter += 1;
    }, 2000);
    this.retry_interval_ios = setInterval(() => {
      this.sendToServer({
        video_call_type: VideoCallType.START_CONFERENCE_IOS,
        is_silent: true
      });
      this.retry_counter += 1;
    }, 2000);
    /* after 1 min stop ringing the call */
    this.retry_timeout = setTimeout(() => {
      if (this.retry_interval) {
        clearInterval(this.retry_interval);
        if (!this.is_call_connected) {
          this.hangUpCall(false, this.hangupErrorEnum.CALL_PICKUP);
        }
      }
    }, 60000);
  }

  onControlChannelNonMessageEvent(data) {
    if (data.user_id != this.userData.fugu_user_id) {
      switch (data.video_call_type) {
        case VideoCallType.OFFER_CONFERENCE:
          break;
        case VideoCallType.ANSWER_CONFERENCE:
          if (data.invite_link == this.callingUrl && !this.is_call_connected) {
            clearInterval(this.retry_interval);
            clearInterval(this.retry_interval_ios);

            this.hitConferenceCount(data.invite_link);

            this.layoutService.stopVideoCallRinger();
            if (!this.is_call_connected) {
              this.calling_text = 'CONNECTING';
            }
            this.is_call_connected = true;
          }
          break;
        case VideoCallType.REJECT_CONFERENCE:
          /* if A is calling B and B rejects the call */
          if (data.invite_link == this.callingUrl && !this.is_call_connected) {
            clearInterval(this.retry_interval_ios);
            clearInterval(this.retry_interval);
            this.socketService.socket.disconnect();
            this.calling_text = 'CALL DECLINED';
            this.cdRef.detectChanges();
            this.layoutService.playNotificationSound(
              'assets/audio/call_busy',
              false
            );
            setTimeout(() => {
              try {
                this.closeVideoCall();
              } catch (e) {}
            }, 3000);
          }
          break;
        case VideoCallType.READY_TO_CONNECT_CONFERENCE:
          if (data.invite_link == this.callingUrl) {
            clearInterval(this.retry_interval);
            this.handleNegotiationNeededEvent();
          }
          break;
        case VideoCallType.READY_TO_CONNECT_CONFERENCE_IOS:
          if (data.invite_link == this.callingUrl) {
            clearInterval(this.retry_interval_ios);
            this.handleNegotiationNeededEvent();
          }
          break;
        case VideoCallType.USER_BUSY_CONFERENCE:
          if (data.invite_link == this.callingUrl && !this.is_call_connected) {
            clearInterval(this.retry_interval);
            this.socketService.socket.disconnect();
            this.calling_text = 'Busy on another call...';
            this.cdRef.detectChanges();
            this.layoutService.playNotificationSound(
              'assets/audio/call_busy',
              false
            );
            setTimeout(() => {
              try {
                this.closeVideoCall();
              } catch (e) {}
            }, 3000);
          }
          break;
        case VideoCallType.HUNGUP_CONFERENCE:
          if (data.invite_link == this.callingUrl) {
            this.socketService.socket.disconnect();
            this.closeVideoCall(false, true);
          }
          break;
      }
    }
  }

  handleNegotiationNeededEvent() {
    this.calling_text = 'RINGING...';
    this.sendToServer({
      name: '',
      video_call_type: VideoCallType.OFFER_CONFERENCE,
      is_silent: true
    });
  }

  handleVideoOfferMsg(offerData) {
    const obj = {
      video_call_type: VideoCallType.ANSWER_CONFERENCE,
      is_silent: true
    };
    this.is_call_connected = true;
    if (offerData.invite_link && offerData.invite_link.includes('conferencing')) {
     oldConferenceUrl = offerData.invite_link;
      offerData['invite_link'] = offerData.invite_link.replace('conferencing', 'meet');
    }
    this.callingUrl = offerData.invite_link;
    this.hitConferenceCount(this.callingUrl);
    this.sendToServer(obj);
  }

  hangUpCall(no_feedback = false, reason?: string) {
    this.sendToServer({
      video_call_type: VideoCallType.HUNGUP_CONFERENCE,
      is_silent: true,
      reason: reason ? reason : ''
    }).then(() => {
      if (reason == this.hangupErrorEnum.CALL_PICKUP) {
        this.calling_text = 'CALL NOT ANSWERED';
        this.layoutService.playNotificationSound(
          'assets/audio/call_busy',
          false
        );
        this.closeVideoCall(no_feedback);
        this.cdRef.detectChanges();
      } else {
        this.closeVideoCall(no_feedback);
      }
    });
  }

  closeVideoCall(no_feedback = false, close_timer = false, reason?: string) {
    this.calling_text = 'CALL DISCONNECTED';
    if (window.opener) {
      window.opener.postMessage(
        { type: 'video-call', data: this.window_obj },
        '*'
      );
    }

    this.layoutService.stopVideoCallRinger();
    this.layoutService.playNotificationSound(
      'assets/audio/disconnect_call',
      false
    );

    if (this.retry_interval) {
      clearInterval(this.retry_interval);
    }

    if (this.retry_timeout) {
      clearTimeout(this.retry_timeout);
    }

    this.showCallingScreen = false;
    if (this.is_call_connected && !no_feedback) {
      this.showFeedbackPopup = true;
      this.is_call_connected = false;
    } else {
      this.is_call_connected = false;
      setTimeout(
        () => {
          window.close();
        },
        close_timer ? 2000 : 0
      );
    }
  }

  closeWindowEvent() {
    window.addEventListener('beforeunload', () => {
      /* do not send hangup if skip is clicked from the feedback popup */
      if (!this.showFeedbackPopup) {
        this.hangUpCall(false, this.hangupErrorEnum.CALL_TAB_CLOSE);
      }
      window.opener.postMessage(
        { type: 'video-call', data: this.window_obj },
        '*'
      );
    });
  }

  closeFeedbackWindow() {
    window.close();
  }

  sendToServer(data) {
    return new Promise((resolve, reject) => {
      let now = moment()
        .utc()
        .format();
      now = now.replace('Z', '.000Z');
      const obj = {
        user_id: this.userData.fugu_user_id,
        channel_id: this.channel_details['channel_id'],
        message_type: MessageType.Video_Call,
        call_type: this.channel_details['call_type'],
        date_time: now,
        invite_link: oldConferenceUrl ? oldConferenceUrl : this.callingUrl,
        muid: this.channel_details['video_offer_data'].muid || this.unique_muid
      };
      this.socketService.sendMessage(Object.assign(obj, data)).then(
        res => {
          resolve(res);
        },
        error => {
          if (error.statusCode == SocketErrorCodes.Turn_Credential_Fail) {
            const loginData = this.sessionService.get('loginData/v1');
            loginData['turn_credentials'] = error.data;
            this.sessionService.set('loginData/v1', loginData);
            this.retry_counter = 0;
          }
        }
      );
    });
  }

  submitFeedback() {
    const obj = {
      feedback: this.feedback_object.feedbackText,
      rating: this.feedback_object.selectedStar
        ? this.feedback_object.selectedStar.value
        : undefined,
      workspace_id: this.userData.workspace_id,
      type: `${this.channel_details['call_type'].toUpperCase()}_CALL`
    };
    /**
     * Nothin submitted
     */
    if (Object.keys(obj).length < 3) {
      window.close();
    } else {
      this.videoService.sendFeedback(obj).subscribe(res => {
        this.messageService.sendAlert({
          type: 'success',
          msg: 'Feedback Submitted.',
          timeout: 500
        });
        setTimeout(() => {
          window.close();
        }, 500);
      });
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
