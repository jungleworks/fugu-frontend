import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {SocketErrorCodes, MessageStatus, MessageType, RTCCallType, UserType, VideoCallType, callHangupType} from '../../enums/app.enums';
import adapter from 'webrtc-adapter';
import {MessageService} from '../../services/message.service';
import {SessionService} from '../../services/session.service';
import {environment} from '../../../environments/environment';
import {takeWhile} from 'rxjs/operators';
import {SocketioService} from '../../services/socketio.service';
import { VideoCallService } from './video-call.service';
import { messageModalAnimation } from '../../animations/animations';
import { CommonApiService } from '../../services/common-api.service';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../layout/layout.service';

declare const moment: any;
declare const chrome: any;
declare const navigator: any;
declare const RTCPeerConnection: any;

let local_div_id, remote_div_id, local_audio_video_div_id, remote_audio_video_div_id;
let counterInterval, totalSeconds = 0;
const refreshCallTimer = 480000;

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  providers: [],
  animations: [messageModalAnimation]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  offer_data;
  channel_details = {};
  public RTCCallTypeEnum = RTCCallType;
  hasAddTrack = false;
  is_fullscreen = false;
  is_muted = false;
  video_disabled = false;
  peerConnection;
  retry_interval;
  retry_counter = 0;
  retry_timeout;
  unique_muid;
  alive = true;
  offerOptions;
  mediaConstraints;
  is_call_connected = false;
  show_screen_share = false;
  timedelay = 1;
  delay_interval;
  video_interchanged = false;
  calling_text = 'CALLING...';
  busy_call_timer;
  iceConfigData;
  senderTrackCall;
  senderTrackScreen;
  tempScreenAudioTrack = [];
  show_sharing_tooltip = false;
  showAddMemberConferencingPopup = false;
  userData;
  user_details;
  showFeedbackPopup = false;
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
  conferenceAcceptanceObject = {
    showAcceptConferencePopup: false,
    inviteFullName: '',
    conferenceLink: ''
  };
  window_obj = {
    is_video_open: false
  };
  showExtensionPopup = false;
  reconnection_overlay;
  call_timer;
  hangupErrorEnum = callHangupType;
  iceStatusChanged;
  audio_screen_share: boolean = false;
  remote_audio_screen_share: boolean = false;
  dualHangupCheck : boolean = false;
  isAudioConference : boolean = false;
  isRefreshCallOffer: boolean = false;
  permScreenSharing : boolean = false;
  showVideoCamOptions : boolean = false;
  enumeratorVideoDevices = [];
  deviceSelected = 0;
  @ViewChild('conferenceMemberContainer') conferenceMemberContainer;
  constructor(private socketService: SocketioService, public commonService: CommonService,
              private sessionService: SessionService, private activatedRoute: ActivatedRoute,
              private cdRef: ChangeDetectorRef, private messageService: MessageService,
    private videoService: VideoCallService, public commonApiService: CommonApiService,
    private layoutService: LayoutService) { }

  ngOnInit() {
    /* listener for external cameras if they connect */
    navigator.mediaDevices.ondevicechange = (event) => {
       this.updateDeviceCam(true);
    }
    this.activatedRoute.params.subscribe(
      (params) => {
        if(params && params['space']) {
          let domainDictionary = this.sessionService.get('spaceDictionary');
          this.userData = domainDictionary[params['space']];
        }
      });
    this.closeWindowEvent();
    this.channel_details = window['video_call_obj'] || {};
    if (!this.channel_details || !Object.keys(this.channel_details).length) {
      window.close();
      return;
    }
    this.offer_data = this.channel_details['video_offer_data'];
    this.setCallType();
    // this.userData = this.sessionService.get('currentSpace');
    if(!this.userData) {
      this.userData = this.commonService.currentOpenSpace;
    }
    this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    // this.socketService.setupCallingConnection(this.channel_details['channel_id']);
    this.socketService.setupCallingConnection(this.channel_details['channel_id']).then(() => {
      if (this.channel_details['is_video_caller']) {
        this.channel_details['video_offer_data'] = {};
        this.inviteUserToCall();
        window.opener.postMessage({ type: 'video-call', data: {is_video_open: true} }, '*');
      } else {
        if(!this.audio_screen_share && !this.is_call_connected) {
          this.calling_text = 'CONNECTING...';
        }
        this.handleVideoOfferMsg(this.offer_data);
      }
    });
    this.iceConfigData = this.sessionService.get('loginData/v1')['turn_credentials'];
    this.unique_muid = this.commonService.generateUUID();
    this.socketService.onVideoCallEvent.pipe(takeWhile(() => this.alive))
      .subscribe(data => this.onControlChannelNonMessageEvent(data));
    this.timedelay = 1;
    this.delay_interval = setInterval(() => {
      this.delayCheck();
    }, 500);
    document.getElementById('videoParent').addEventListener('mousemove', this.showActionButtons.bind(this));
    document.addEventListener('fullscreenchange', this.exitHandler.bind(this));
    document.addEventListener('webkitfullscreenchange', this.exitHandler.bind(this));
  }

  /**
   * to set variables according to call type - audio/video
   */
  setCallType() {
    /* get information of the cameras being used */
    this. updateDeviceCam();
    if (this.channel_details['call_type'] == RTCCallType.AUDIO) {
      local_div_id = <HTMLAudioElement>document.getElementById('local_audio');
      remote_div_id = <HTMLAudioElement>document.getElementById('received_audio');
      local_audio_video_div_id = <HTMLVideoElement>document.getElementById('local_audio_video');
      remote_audio_video_div_id = <HTMLVideoElement>document.getElementById('received_audio_video');
      this.offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0
      };
      this.mediaConstraints = {
        audio: true, // We want an audio track
        video: false // ...and we want a video track
      };
    } else {
      local_div_id = <HTMLVideoElement>document.getElementById('local_video');
      remote_div_id = <HTMLVideoElement>document.getElementById('received_video');
      local_audio_video_div_id = <HTMLVideoElement>document.getElementById('local_audio_video');
      remote_audio_video_div_id = <HTMLVideoElement>document.getElementById('received_audio_video');
      this.offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      };
      this.mediaConstraints = {
        audio: true, // We want an audio track
        video: true // ...and we want a video track
      };
    }
  }
  onControlChannelNonMessageEvent(data) {
    if (data.user_id != this.userData.fugu_user_id) {
      switch (data.video_call_type) {
        case VideoCallType.VIDEO_OFFER:
          if (data.is_screen_share || data.refresh_call) {
            if(this.channel_details['call_type'] == RTCCallType.AUDIO) {
              this.remote_audio_screen_share = (data.stop_screen_share) ? false : true;
            }
            /**If it is a refresh call connection, dont stop showing the name and timer */
            if (data.refresh_call) {
              this.remote_audio_screen_share = false;
              this.isRefreshCallOffer = true;
            }

              this.handleInCallOfferMsg(data);
          }
          break;
        case VideoCallType.VIDEO_ANSWER:
          if (data.muid == this.unique_muid && (!this.is_call_connected || data.is_screen_share || data.refresh_call)) {
            clearInterval(this.retry_interval);
            if(!this.audio_screen_share && !this.is_call_connected) {
              this.calling_text = 'CONNECTING';
            }
            this.handleVideoAnswerMsg(data);
          }
          break;
        case VideoCallType.CALL_REJECTED:
          if (data.muid == this.unique_muid && !this.is_call_connected) {
            this.socketService.socket.disconnect();
            clearInterval(this.retry_interval);
            this.calling_text = 'CALL DECLINED';
            this.cdRef.detectChanges();
            this.layoutService.playNotificationSound('assets/audio/call_busy', false);
            this.busy_call_timer = setTimeout(() => {
              try {
                this.closeVideoCall();
              } catch (e) {}
            }, 3000);
          }
          break;
        case VideoCallType.NEW_ICE_CANDIDATE:
          this.handleNewICECandidateMsg(data);
          break;
        case VideoCallType.READY_TO_CONNECT:
          if (data.muid == this.unique_muid) {
            /* refresh logic on comment */
            // if(data.refresh_call) {
            //   /** create new peer connection from caller end */
            //   this.isRefreshCallOffer = true;
            //   this.reinitializePeerConnection();
            //   /* get previous tracks and assign in to the new peer connection */
            //   local_div_id.srcObject.getTracks().forEach(track => this.peerConnection.addTrack(track, local_div_id.srcObject));
            // }
            //clearInterval(this.retry_interval);
            this.handleNegotiationNeededEvent(false,false);
          }
          break;
        case VideoCallType.USER_BUSY:
          if (data.muid == this.unique_muid && !this.is_call_connected) {
            this.socketService.socket.disconnect();
            clearInterval(this.retry_interval);
            this.calling_text = 'Busy on another call...';
            this.cdRef.detectChanges();
            this.layoutService.playNotificationSound('assets/audio/call_busy', false);
            this.busy_call_timer = setTimeout(() => {
              try {
                this.closeVideoCall();
              } catch (e) {}
            }, 3000);
          }
          break;
        case VideoCallType.CALL_HUNG_UP:
          if ((data.muid == this.channel_details['video_offer_data'].muid || data.muid == this.unique_muid) &&
            this.commonService.getCookieSubdomain('device_id').toString() != data.device_id) {
            this.socketService.socket.disconnect();
            this.closeVideoCall(false, true);
          }
          break;
        case VideoCallType.SWITCH_TO_CONFERENCE:
            this.acceptConferenceInvite(data);
          break;
          case VideoCallType.REFRESH_CALL:
            /**
             * Refresh call offer , to relay call after every X seconds only in case of audio calling
             */
            if (this.channel_details['call_type'] == RTCCallType.AUDIO) {
              this.isRefreshCallOffer = true;
              this.handleRefreshCallOffer();
              this.reinitializePeerConnection();
            }
        break;
      }
    }
  }
  closeWindowEvent() {
    window.addEventListener('beforeunload', () => {
      if (!this.dualHangupCheck) {
        this.hangUpCall(false, this.iceStatusChanged ? this.hangupErrorEnum.CALL_DISCONNECTED : this.hangupErrorEnum.CALL_TAB_CLOSE);
      }
      window.opener.postMessage({ type: 'video-call', data: this.window_obj }, '*');
    });
  }

  /**
   * check if mouse is idle for 3s
   */
  delayCheck() {
    try {
      if (this.timedelay == 3) {
        const buttons = document.getElementById('actionButtons').querySelectorAll('span');
        for (let i = 0; i < buttons.length; i++) {
          buttons[i]['style'].transform = 'translateY(200%)';
        }
        this.timedelay = 1;
      }
      this.timedelay += 1;
    } catch (e) {
      clearInterval(this.delay_interval);
    }
  }

  /**
   * show icons on mouse movement
   */
  showActionButtons() {
    try {
      const buttons = document.getElementById('actionButtons').querySelectorAll('span');
      for (let i = 0; i < buttons.length; i++) {
        buttons[i]['style'].transform = 'translateY(0)';
      }
      this.timedelay = 1;
    } catch (e) {
      clearInterval(this.delay_interval);
    }
    clearInterval(this.delay_interval);
    this.delay_interval = setInterval(() => {
      this.delayCheck();
    }, 500);
  }
  reportError(errMessage) {
    console.error('Error ' + errMessage.name + ': ' + errMessage.message);
  }

  /* Open fullscreen */
  openFullscreen() {
    const elem = <any> document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    }
    this.is_fullscreen = true;
  }
  /* Close fullscreen */
  closeFullscreen() {
    const fsDoc = <any> document;
    if (fsDoc.exitFullscreen) {
      fsDoc.exitFullscreen();
    }  else if (fsDoc.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      fsDoc.webkitExitFullscreen();
    }
    this.is_fullscreen = false;
    this.cdRef.detectChanges();
  }
  /* Mute Video */
  muteVideo() {
    this.is_muted = !this.is_muted;
    local_div_id.srcObject.getAudioTracks()[0].enabled = !this.is_muted;
  }
  /* Disable Video */
  disableVideo() {
    this.video_disabled = !this.video_disabled;
    local_div_id.srcObject.getVideoTracks()[0].enabled = !this.video_disabled;
  }

  onAddIceCandidateSuccess(pc) {
    console.log(`addIceCandidate success`);
  }

  onAddIceCandidateError(pc, error) {
    console.log(`failed to add ICE Candidate: ${error.toString()}`);
  }

  createPeerConnection() {

    // Create an RTCPeerConnection which knows to use our chosen
    // STUN/TURN server.
    const iceConfigArray = [];
    this.iceConfigData = this.sessionService.get('loginData/v1')['turn_credentials'];
    for (let i = 0; i < this.iceConfigData.ice_servers.stun.length; i++) {
      iceConfigArray.push({
        urls: this.iceConfigData.ice_servers.stun[i]
      });
    }
    for (let i = 0; i < this.iceConfigData.ice_servers.turn.length; i++) {
      iceConfigArray.push({
        urls: this.iceConfigData.ice_servers.turn[i],
        username: this.iceConfigData.username,
        credential: this.iceConfigData.credential
      });
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers: iceConfigArray,
      sdpSemantics: 'plan-b'
    });

    // Do we have addTrack()? If not, we will use streams instead.

    this.hasAddTrack = (this.peerConnection.addTrack !== undefined);

    // Set up event handlers for the ICE negotiation process.

    this.peerConnection.onicecandidate = this.handleICECandidateEvent.bind(this);
    // this.peerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
    this.peerConnection.onremovetrack = this.handleRemoveTrackEvent.bind(this);
    this.peerConnection.onnremovestream = this.handleRemoveStreamEvent.bind(this);
    this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent.bind(this);
    this.peerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent.bind(this);
    this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent.bind(this);
    if (this.hasAddTrack) {
      this.peerConnection.ontrack = this.handleTrackEvent.bind(this);
    } else {
      this.peerConnection.onaddstream = this.handleAddStreamEvent.bind(this);
    }
  }

  // Called by the WebRTC layer to let us know when it's time to
  // begin (or restart) ICE negotiation. Starts by creating a WebRTC
  // offer, then sets it as the description of our local media
  // (which configures our local media stream), then sends the
  // description to the callee as an offer. This is a proposed media
  // format, codec, resolution, etc.

  handleNegotiationNeededEvent(is_screen_share, stop_screen_share?) {
    this.peerConnection.createOffer(this.offerOptions).then((offer) => {
      return this.peerConnection.setLocalDescription(offer);
    })
      .then(() => {
        if(!this.audio_screen_share && !this.is_call_connected) {
          this.calling_text = 'RINGING...';
        }
        this.sendToServer({
          name: '',
          video_call_type: VideoCallType.VIDEO_OFFER,
          sdp: this.peerConnection.localDescription,
          is_screen_share: is_screen_share,
          stop_screen_share: stop_screen_share,
          is_silent: true,
          // refresh_call : this.isRefreshCallOffer  /* refresh logic on comment */
        });
      })
      .catch(this.reportError);
  }

  // Called by the WebRTC layer when events occur on the media tracks
  // on our WebRTC call. This includes when streams are added to and
  // removed from the call.
  //
  // track events include the following fields:
  //
  // RTCRtpReceiver       receiver
  // MediaStreamTrack     track
  // MediaStream[]        streams
  // RTCRtpTransceiver    transceiver

  handleTrackEvent(event) {
    if (remote_div_id.srcObject !== event.streams[0]) {
      remote_div_id.srcObject = event.streams[0];
    }
    if(this.channel_details['call_type'] == RTCCallType.AUDIO) {
      if (remote_audio_video_div_id.srcObject !== event.streams[0]) {
        remote_audio_video_div_id.srcObject = event.streams[0];
      }
    }
    this.layoutService.stopVideoCallRinger();
    if (this.channel_details['call_type'] == RTCCallType.AUDIO && !this.is_call_connected) {
      this.calling_text = 'ONGOING AUDIO CALL...';
        this.startCounter();
      }
    this.is_call_connected = true;
    // if (this.sessionService.get('screen_share_tooltip') == null) {
    //   this.show_sharing_tooltip = true;
    //   this.sessionService.set('screen_share_tooltip', false);
    //   setTimeout(() => {
    //     this.show_sharing_tooltip = false;
    //     if (!this.cdRef['destroyed']) {
    //       this.cdRef.detectChanges();
    //     }
    //   }, 5000);
    // }
    this.cdRef.detectChanges();
  }

  // Called by the WebRTC layer when a stream starts arriving from the
  // remote peer. We use this to update our user interface, in this
  // example.

  handleAddStreamEvent(event) {
    remote_div_id.srcObject = event.stream;
    if(this.channel_details['call_type'] == RTCCallType.AUDIO) {
      remote_audio_video_div_id.srcObject = event.stream;
    }
  }

  // An event handler which is called when the remote end of the connection
  // removes its stream. We consider this the same as hanging up the call.
  // It could just as well be treated as a "mute".
  //
  // Note that currently, the spec is hazy on exactly when this and other
  // "connection failure" scenarios should occur, so sometimes they simply
  // don't happen.

  handleRemoveStreamEvent(event) {
    this.closeVideoCall();
  }

  // Handles |icecandidate| events by forwarding the specified
  // ICE candidate (created by our local ICE agent) to the other
  // peer through the signaling server.

  handleICECandidateEvent(event) {
    if (event.candidate) {
      this.sendToServer({
        video_call_type: VideoCallType.NEW_ICE_CANDIDATE,
        rtc_candidate: event.candidate,
        is_silent: true
      });
    }
  }

  // Handle |iceconnectionstatechange| events. This will detect
  // when the ICE connection is closed, failed, or disconnected.
  //
  // This is called when the state of the ICE agent changes.
  handleICEConnectionStateChangeEvent(event) {
    switch (this.peerConnection.iceConnectionState) {
      case 'closed':
      case 'failed':
        this.closeVideoCall(true,false,this.hangupErrorEnum.CALL_DISCONNECTED);
        break;
      case 'disconnected':
        this.reconnection_overlay = 'Facing Connection issues\nReconnecting...';
        break;
      case 'completed':
      case 'connected':
        this.reconnection_overlay = '';
        break;
    }
  }

  // Set up a |signalingstatechange| event handler. This will detect when
  // the signaling connection is closed.
  //
  // NOTE: This will actually move to the new RTCPeerConnectionState enum
  // returned in the property RTCPeerConnection.connectionState when
  // browsers catch up with the latest version of the specification!

  handleSignalingStateChangeEvent(event) {
    switch (this.peerConnection.signalingState) {
      case 'closed':
        this.closeVideoCall();
        break;
    }
  }

  // Handle the |icegatheringstatechange| event. This lets us know what the
  // ICE engine is currently working on: "new" means no networking has happened
  // yet, "gathering" means the ICE engine is currently gathering candidates,
  // and "complete" means gathering is complete. Note that the engine can
  // alternate between "gathering" and "complete" repeatedly as needs and
  // circumstances change.
  //
  // We don't need to do anything when this happens, but we log it to the
  // console so you can see what's going on when playing with the sample.

  handleICEGatheringStateChangeEvent(event) {
    if (event) {
      console.log('ICE state change event: ', event);
    }
  }

  // Close the RTCPeerConnection and reset variables so that the user can
  // make or receive another call if they wish. This is called both
  // when the user hangs up, the other user hangs up, or if a connection
  // failure is detected.

  closeVideoCall(no_feedback = false, close_timer = false, reason?:string) {
    this.calling_text = 'CALL DISCONNECTED';
    this.iceStatusChanged = reason ? true: false;
    clearInterval(counterInterval);
    if (window.opener) {
      window.opener.postMessage({ type: 'video-call', data: this.window_obj }, '*');
    }
    this.layoutService.stopVideoCallRinger();
    this.layoutService.playNotificationSound('assets/audio/disconnect_call', false);
    if (this.retry_interval) {
      clearInterval(this.retry_interval);
    }
    if (this.retry_timeout) {
      clearTimeout(this.retry_timeout);
    }
    if (this.delay_interval) {
      clearTimeout(this.delay_interval);
    }
    if (this.busy_call_timer) {
      clearTimeout(this.busy_call_timer);
    }
    const remoteVideo = remote_div_id;
    const localVideo = local_div_id;
    const localAudioVideoId = local_audio_video_div_id;
    const remoteAudioVideoId = remote_audio_video_div_id;


    // Close the RTCPeerConnection

    if (this.peerConnection) {

      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.

      this.peerConnection.ontrack = null;
      this.peerConnection.onremovetrack = null;
      this.peerConnection.onremovestream = null;
      this.peerConnection.onnicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      this.peerConnection.onicegatheringstatechange = null;
      this.peerConnection.onnotificationneeded = null;

      // Stop the videos

      if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      }

      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
      }

      if(localAudioVideoId.srcObject) {
        localAudioVideoId.srcObject.getTracks().forEach(track => track.stop());
      }

      if(remoteAudioVideoId.srcObject) {
        remoteAudioVideoId.srcObject.getTracks().forEach(track => track.stop());
      }

      // saved audio track ref for video while screen share, need to stop audio track
      if (this.tempScreenAudioTrack.length) {
        for (let i = 0; i < this.tempScreenAudioTrack.length; i++) {
          this.tempScreenAudioTrack[i].getTracks().forEach(track => track.stop());
        }
      }

      // Close the peer connection

      this.peerConnection.close();
      this.peerConnection = null;
    }

    remoteVideo.removeAttribute('src');
    remoteVideo.removeAttribute('srcObject');
    localVideo.removeAttribute('src');
    remoteVideo.removeAttribute('srcObject');
    localAudioVideoId.removeAttribute('src');
    localAudioVideoId.removeAttribute('srcObject');
    remoteAudioVideoId.removeAttribute('src');
    remoteAudioVideoId.removeAttribute('srcObject');
    // this.is_call_connected = false;
    if (this.is_call_connected && !no_feedback) {
      document.getElementById('videoParent').style.display = 'none';
      this.showFeedbackPopup = true;
      this.is_call_connected = false;
    } else {
      this.is_call_connected = false;
      setTimeout(() => {
        window.close();
      }, close_timer ? 2000 : 0);
    }
  }

  // Hang up the call by closing our end of the connection, then
  // sending a "hang-up" message to the other peer (keep in mind that
  // the signaling is done on a different connection). This notifies
  // the other peer that the connection should be terminated and the UI
  // returned to the "no call in progress" state.

  hangUpCall(no_feedback = false, reason?:string) {
    this.sendToServer({
      video_call_type: VideoCallType.CALL_HUNG_UP,
      hungup_type: !no_feedback ? 'DEFAULT' : 'SWITCHED',
      is_silent: true,
      turn_creds: this.sessionService.get('loginData/v1')['turn_credentials'],
      reason: reason ? reason : ''
    }).then(() =>
    {
      if(reason == this.hangupErrorEnum.CALL_PICKUP) {
        this.calling_text = 'CALL NOT ANSWERED';
        this.cdRef.detectChanges();
        this.layoutService.playNotificationSound('assets/audio/call_busy', false);
        this.busy_call_timer = setTimeout(() => {
          try {
            this.closeVideoCall(no_feedback);
          } catch (e) {}
        },3000);

      } else {
        this.closeVideoCall(no_feedback);
      }

    });
  }
  handleRemoveTrackEvent(event) {
    const trackList = remote_div_id.srcObject.getTracks();

    if (trackList.length == 0) {
      this.closeVideoCall();
    }
  }

  // Handle a click on an item in the user list by inviting the clicked
  // user to video chat. Note that we don't actually send a message to
  // the callee here -- calling RTCPeerConnection.addStream() issues
  // a |notificationneeded| event, so we'll let our handler for that
  // make the offer.

  inviteUserToCall() {
    if (this.peerConnection) {
      alert('You can\'t start a call because you already have one open!');
    } else {

      // Call createPeerConnection() to create the RTCPeerConnection.

      this.createPeerConnection();

      /**
       * after a certain interval, initiate a new peer connection
       */
      // if(this.channel_details['call_type'] == this.RTCCallTypeEnum.AUDIO) {
      //   this.initiateOtherPeerConnection();
      // }

      // Now configure and create the local stream, attach it to the
      // "preview" box (id "local_div_id"), and add it to the
      // RTCPeerConnection.


      navigator.mediaDevices.getUserMedia(this.mediaConstraints)
        .then((localStream) => {
          local_div_id.srcObject = localStream;
          local_div_id.muted = true;
          if (this.hasAddTrack) {
            localStream.getTracks().forEach(track => this.senderTrackCall = this.peerConnection.addTrack(track, localStream));
          } else {
            this.peerConnection.addStream(localStream);
          }
          this.layoutService.playNotificationSound('assets/audio/call_ringer', true);
          this.retry_interval = setInterval(() => {
            this.iceConfigData = this.sessionService.get('loginData/v1')['turn_credentials'];
            this.sendToServer({
              turn_creds: this.iceConfigData,
              video_call_type: VideoCallType.START_CALL,
              is_silent: this.retry_counter != 0
            });
            this.retry_counter += 1;
          }, 2000);
          this.retry_timeout = setTimeout(() => {
            if (this.retry_interval) {
              clearInterval(this.retry_interval);
              if (!this.is_call_connected) {
                this.hangUpCall(false, this.hangupErrorEnum.CALL_PICKUP);
              }
            }
          }, 30000);
        })
        .catch(this.handleGetUserMediaError.bind(this));
    }
  }
  // Accept an offer to video chat. We configure our local settings,
  // create our RTCPeerConnection, get and attach our local camera
  // stream, then create and send an answer to the caller.

  handleVideoOfferMsg(msg) {
    let localStream = null;

    this.createPeerConnection();

    // We need to set the remote description to the received SDP offer
    // so that our local WebRTC layer knows how to talk to the caller.

    const desc = new RTCSessionDescription(msg.sdp);

    this.peerConnection.setRemoteDescription(desc).then( () => {
      return navigator.mediaDevices.getUserMedia(this.mediaConstraints);
    })
      .then((stream) => {
        localStream = stream;
        local_div_id.srcObject = localStream;
        local_div_id.muted = true;
        if (this.hasAddTrack) {
          localStream.getTracks().forEach(track =>
            this.senderTrackCall = this.peerConnection.addTrack(track, localStream)
          );
        } else {
          this.peerConnection.addStream(localStream);
        }
      })
      .then(() => {
        // Now that we've successfully set the remote description, we need to
        // start our stream up locally then create an SDP answer. This SDP
        // data describes the local end of our call, including the codec
        // information, options agreed upon, and so forth.
        console.log(this.peerConnection);
        return this.peerConnection.createAnswer();
      })
      .then((answer) => {
        // We now have our answer, so establish that as the local description.
        // This actually configures our end of the call to match the settings
        // specified in the SDP.
        return this.peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        const obj = {
          video_call_type: VideoCallType.VIDEO_ANSWER,
          sdp: this.peerConnection.localDescription,
          is_silent: true
        };
         /* refresh logic on comment */
        // if(this.isRefreshCallOffer) {
        //   obj['refresh_call'] = true;
        // }

        // this.commonService.web_worker_object.postMessage({video_call_type: VideoCallType.CALL_HUNG_UP});
        // We've configured our end of the call now. Time to send our
        // answer back to the caller so they know that we want to talk
        // and how to talk to us.


        this.sendToServer(obj);
        this.show_screen_share = true;
        this.cdRef.detectChanges();
      })
      .catch(this.handleGetUserMediaError.bind(this));
  }
  // A new ICE candidate has been received from the other peer. Call
  // RTCPeerConnection.addIceCandidate() to send it along to the
  // local ICE framework.

  handleVideoAnswerMsg(msg) {

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.

    const desc = new RTCSessionDescription(msg.sdp);
    this.peerConnection.setRemoteDescription(desc).catch(this.reportError);
    this.show_screen_share = true;
    this.cdRef.detectChanges();
  }

  handleNewICECandidateMsg(msg) {
    const candidate = new RTCIceCandidate(msg.rtc_candidate);
    this.peerConnection.addIceCandidate(msg.rtc_candidate)
      .then(() => this.onAddIceCandidateSuccess(this.peerConnection), err => this.onAddIceCandidateError(this.peerConnection, err));
    console.log(`peerConnection ICE candidate:\n${msg.rtc_candidate ? msg.rtc_candidate.candidate : '(null)'}`);
  }

  // Handle errors which occur when trying to access the local media
  // hardware; that is, exceptions thrown by getUserMedia(). The two most
  // likely scenarios are that the user has no camera and/or microphone
  // or that they declined to share their equipment when prompted. If
  // they simply opted not to share their media, that's not really an
  // error, so we won't present a message in that situation.

  handleGetUserMediaError(e) {
    switch (e.name) {
      case 'NotFoundError':
        alert('Unable to open your call because no camera and/or microphone ' +
          'were found.');
        break;
      case 'SecurityError':
      case 'PermissionDeniedError':
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert(`Error opening your camera and/or microphone: ${e.message}`);
        console.error('Error opening your camera and/or microphone: ' + e.message);
        break;
    }
    // this.closeVideoCall();
    setTimeout(() => {
      this.hangUpCall(false, this.hangupErrorEnum.GET_USER_MEDIA);
    }, 150);
  }

  sendToServer(data) {
    return new Promise((resolve, reject) => {
      let now = moment().utc().format();
      now = now.replace('Z', '.000Z');
      const obj = {
        full_name: this.userData.full_name,
        user_id: this.userData.fugu_user_id,
        call_type: this.channel_details['call_type'],
        date_time: now,
        channel_id: this.channel_details['channel_id'],
        muid: this.channel_details['video_offer_data'].muid || this.unique_muid,
        message_type: MessageType.Video_Call,
        user_type: UserType.USER,
        message_status: MessageStatus.Sending
      };
      this.socketService.sendMessage(Object.assign(obj, data))
        .then((res) => {
          resolve(res);
      }, error => {
        if (error.statusCode == SocketErrorCodes.Turn_Credential_Fail) {
          const loginData = this.sessionService.get('loginData/v1');
          loginData['turn_credentials'] = error.data;
          this.sessionService.set('loginData/v1', loginData);
          this.retry_counter = 0;
          // if(data.refresh_call) {
          //   this.handleRefreshCallOffer();
          // }
        }
      });
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  exitHandler() {
    const fsDoc = <any> document;
    if (!fsDoc.fullscreenElement && !fsDoc.webkitIsFullScreen) {
      this.closeFullscreen();
    }
  }

  /**
   * to capture user's screen, chrome needs an extension so we have an extension for desktop capture api, as until
   * chrome 69, no native support for desktop capture is there without extension.
   */
  captureScreen() {
    let active_video_div = this.channel_details['call_type'] == this.RTCCallTypeEnum.AUDIO ? local_audio_video_div_id : local_div_id ;
    if (this.commonService.browserChecks.isChrome) {
      /**
       * to check if extension is installed or not, we make a version request to extension, if it returns a version,
       * then extension exists, otherwise open a prompt popup to install extension.
       * After chrome 72, it has a native support for getdesktopmedia, so we check if getdesktopmedia is allowed then use
       * that otherwise install extension.
       * @type {string}
       */
      if (this.senderTrackScreen) {
        this.stopScreenCapture(active_video_div);
        return;
      }
      const displayMediaStreamConstraints = {
        video: true // currently you need to set {true} on Chrome
      };

      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints).then((stream) => {
          this.chromeScreenShare(stream);
        }).catch((error) => {
           if (error.code == 0) {
             this.permScreenSharing = true;
           }
        }
        );
      } else if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia(displayMediaStreamConstraints).then((stream) => {
          this.chromeScreenShare(stream);
        }).catch((error) => console.log(error));
      } else {
        const EXTENSION_ID = environment.CHROME_EXTENSION_ID;
        chrome.runtime.sendMessage(EXTENSION_ID, {type: 'version'}, res => {
          if (!res) {
            this.showExtensionPopup = true;
            return;
          } else {
            const request = {sources: ['screen', 'window', 'tab', 'audio'], type: !this.senderTrackScreen ? 'start' : 'stop'};
            // let stream;
            chrome.runtime.sendMessage(EXTENSION_ID, request, response => {
              if (response && response.type === 'success') {
                navigator.mediaDevices
                  .getUserMedia({
                    video: {
                      mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: response.streamId
                      }
                    }
                  })
                  .then(returnedStream => {
                    this.chromeScreenShare(returnedStream);
                  })
                  .catch(err => {
                    console.error('Could not get stream: ', err);
                  });
                /** Closing screen capture, if track exists in sender track screen **/
              } else if (this.senderTrackScreen) {
                this.stopScreenCapture(active_video_div);
              } else {
                console.error('Could not get stream');
              }
            });
          }
        });
      }
      /**
       * Firefox supports screen share without extension, so different handling for this.
       */
    } else if (this.commonService.browserChecks.isFirefox) {
      let adap:any = adapter.browserShim;
      adap.shimGetDisplayMedia(window, 'screen');
      if (!this.senderTrackScreen) {
        navigator.mediaDevices.getDisplayMedia({video: true})
          .then(returnedStream => {
            let stream;
            stream = returnedStream;
            // saving audio track as we stop only video track, so on closing call icon doesn't go off.
            this.tempScreenAudioTrack.push(active_video_div.srcObject);
            /**
             * stop video tracks and save audio track, due to unavailability of audio in desktopcapture api.
             */
            active_video_div.srcObject.getVideoTracks().forEach(track => track.stop());
            if (this.hasAddTrack) {
              const audioTracks = active_video_div.srcObject.getAudioTracks();
              active_video_div.srcObject = stream;
              // mix audio tracks to the video stream
              if (audioTracks.length > 0) {
                const mixAudioTrack = this.mixTracks(audioTracks);
                stream.addTrack(mixAudioTrack);
              }
              // remove old track before making screen share offer
              this.peerConnection.removeTrack(this.senderTrackCall);
              //add new track
              stream.getTracks().forEach(track => {
                this.senderTrackScreen = this.peerConnection.addTrack(track, stream);
              });
            } else {
              this.peerConnection.addStream(stream);
            }
            this.handleNegotiationNeededEvent(true , false);
          })
          .catch(err => {
            console.error('Could not get stream: ', err);
          });
      } else {
        this.stopScreenCapture(active_video_div);
      }
    } else if (this.commonService.browserChecks.isEdge) {
      if (!this.senderTrackScreen) {
        navigator.mediaDevices.getDisplayMedia({video: true}).then(returnedStream => {
          let stream;
          stream = returnedStream;
          // saving audio track as we stop only video track, so on closing call icon doesn't go off.
          this.tempScreenAudioTrack.push(active_video_div.srcObject);
          /**
           * stop video tracks and save audio track, due to unavailability of audio in desktopcapture api.
           */
          active_video_div.srcObject.getVideoTracks().forEach(track => track.stop());
          if (this.hasAddTrack) {
            const audioTracks = active_video_div.srcObject.getAudioTracks();
            active_video_div.srcObject = stream;
            // mix audio tracks to the video stream
            if (audioTracks.length > 0) {
              const mixAudioTrack = this.mixTracks(audioTracks);
              stream.addTrack(mixAudioTrack);
            }
            // remove old track before making screen share offer
            this.peerConnection.removeTrack(this.senderTrackCall);
            //add new track
            stream.getTracks().forEach(track => {
              this.senderTrackScreen = this.peerConnection.addTrack(track, stream);
            });
          } else {
            this.peerConnection.addStream(stream);
          }
          this.handleNegotiationNeededEvent(true , false);
        });
      } else {
        this.stopScreenCapture(active_video_div);
      }
    }
  }

  /**
   * mix audio tracks with screen capture video track
   * @param tracks
   * @returns {any}
   */
  mixTracks(tracks) {
    const ac = <any>new AudioContext();
    const dest = ac.createMediaStreamDestination();
    for (let i = 0; i < tracks.length; i++) {
      const source = ac.createMediaStreamSource(new MediaStream([tracks[i]]));
      source.connect(dest);
    }
    return dest.stream.getTracks()[0];
  }

  /**
   * handle in call offer message, for handling screen sharing offers.
   * @param msg
   */
  handleInCallOfferMsg(msg) {
     /* refresh logic on comment */
    /* Create new peer connection and add tracks in case of receiver after receiving refresh offer */
    // if (msg.refresh_call) {
    //   this.reinitializePeerConnection();
    //   local_div_id.srcObject.getTracks().forEach(track => this.peerConnection.addTrack(track, local_div_id.srcObject));
    // }

    const desc = new RTCSessionDescription(msg.sdp);

    this.peerConnection.setRemoteDescription(desc).then(() => {
      // Now that we've successfully set the remote description, we need to
      // start our stream up locally then create an SDP answer. This SDP
      // data describes the local end of our call, including the codec
      // information, options agreed upon, and so forth.
      return this.peerConnection.createAnswer();
    })
      .then((answer) => {
        // We now have our answer, so establish that as the local description.
        // This actually configures our end of the call to match the settings
        // specified in the SDP.
        return this.peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        const obj = {
          video_call_type: VideoCallType.VIDEO_ANSWER,
          sdp: this.peerConnection.localDescription,
          is_screen_share: true,
          is_silent: true
        };
         /* refresh logic on comment */
        // if(this.isRefreshCallOffer) {
        //   obj['refresh_call'] = true;
        // }

        // this.commonService.web_worker_object.postMessage({video_call_type: VideoCallType.CALL_HUNG_UP});
        // We've configured our end of the call now. Time to send our
        // answer back to the caller so they know that we want to talk
        // and how to talk to us.


        this.sendToServer(obj);
      });
  }

  updateDeviceCam(isDeviceChanged?) {
    if (isDeviceChanged) {
      this.deviceSelected = 0;
    }
    this.enumeratorVideoDevices = [];
    /* get all the video cameras */
    navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      devices.forEach( (device) => {
          if (device.kind == 'videoinput') {
             this.enumeratorVideoDevices.push(device);
          }
        });
      this.enumeratorVideoDevices = Array.from(new Set(this.enumeratorVideoDevices.map(i => JSON.stringify(i)))).map(i => <any>JSON.parse(i));
      // this.deviceSelected = this.enumeratorVideoDevices[0].deviceId

      /* if existing camera is removed, use the one that is remaining */
      if (this.enumeratorVideoDevices.length == 1 && isDeviceChanged) {
         this.changeVideoCam(this.enumeratorVideoDevices[0].deviceId)
      }
    })
    .catch((err) => {
      console.log(err.name + ": " + err.message);
    });
  }

  /* change output video camera */ 
  changeVideoCam(dev) {
    const localVideo = local_div_id;
    if (localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(track => track.stop());
    }
    this.mediaConstraints = {
      audio: true,
      video: { deviceId : dev},
    };
    navigator.mediaDevices.getUserMedia(this.mediaConstraints)
    .then((localStream) => {
      local_div_id.srcObject = localStream;
      this.peerConnection.getSenders().map(sender => sender.replaceTrack(localStream.getTracks().find(t => t.kind === sender.track.kind), localStream))
    })
    .catch(this.handleGetUserMediaError.bind(this));
    this.showVideoCamOptions = false;
            /**
         * check if video was muted before sharing the screen and maintain the state.
         */
        if (this.is_muted) {
          this.is_muted = !this.is_muted;
          this.muteVideo();
        }
  }
  /**
   * close current tracks and initiate new getusermedia request.
   */
  stopScreenCapture(video) {
    this.audio_screen_share = false;
    if(this.channel_details['call_type'] == this.RTCCallTypeEnum.AUDIO) {
      const audioVideoDiv = document.getElementById('local_audio_video');
      audioVideoDiv.classList.remove('non-invert-video');
    } else {
      const videoDiv = document.getElementById('local_video');
      videoDiv.classList.remove('non-invert-video');
    }
    video.srcObject.getTracks().forEach(track => track.stop());
    this.peerConnection.removeTrack(this.senderTrackScreen);
    this.senderTrackScreen = null;
    navigator.mediaDevices.getUserMedia(this.mediaConstraints)
      .then((localStream) => {
        video.srcObject = localStream;
        if (this.hasAddTrack) {
          localStream.getTracks().forEach(track => this.senderTrackCall = this.peerConnection.addTrack(track, localStream));
        } else {
          this.peerConnection.addStream(localStream);
        }
          this.handleNegotiationNeededEvent(true , true);
        /**
         * check if video was muted before sharing the screen and maintain the state.
         */
        if (this.is_muted) {
          this.is_muted = !this.is_muted;
          this.muteVideo();
        }
      })
      .catch(this.handleGetUserMediaError.bind(this));
  }

  openChromeStore() {
    this.showExtensionPopup = false;
    window.open('https://chrome.google.com/webstore/detail/fugu-screen-sharing/onnpnbcklmahhoajlilopflaandmlooa', '_blank');
  }
  chromeScreenShare(returnedStream) {
    let active_video_div = this.channel_details['call_type'] == this.RTCCallTypeEnum.AUDIO ? local_audio_video_div_id : local_div_id;
    const stream = returnedStream;
    // saving audio track as we stop only video track, so on closing call icon doesn't go off.
    // this.tempScreenAudioTrack.push(local_div_id.srcObject);
    let audioTracks = '';
    // stop current tracks
    if(active_video_div.srcObject) {
      active_video_div.srcObject.getTracks().forEach(track => track.stop());
    }

    /**
     * stop video tracks and audio track, ange get new audio track due to unavailability of audio in desktopcapture api,
     * earlier we used to save audio track but double voice issues appeared in phones while renegotiating so changing
     * the logic.
     */
    navigator.mediaDevices.getUserMedia({video: false, audio: true})
      .then((audioStream) => {
        audioTracks = audioStream.getAudioTracks();
        if (this.hasAddTrack) {
          // const audioTracks = local_div_id.srcObject.getAudioTracks();
          active_video_div.srcObject = stream;
          // mix audio tracks to the video stream
          if (audioTracks.length > 0) {
            const mixAudioTrack = this.mixTracks(audioTracks);
            stream.addTrack(mixAudioTrack);
          }
          // remove old track before making screen share offer
          // local_div_id.srcObject.getAudioTracks().forEach(track => track.stop());
          this.peerConnection.removeTrack(this.senderTrackCall);
          //add new track
          stream.getTracks().forEach(track => {
            this.senderTrackScreen = this.peerConnection.addTrack(track, stream);
          });
          stream.getVideoTracks()[0].onended = () => {
            this.stopScreenCapture(active_video_div);
          };
        } else {
          this.peerConnection.addStream(stream);
        }

        if(this.channel_details['call_type'] == this.RTCCallTypeEnum.AUDIO) {
          const audioVideoDiv = document.getElementById('local_audio_video');
          audioVideoDiv.classList.add('non-invert-video');
        } else {
          const videoDiv = document.getElementById('local_video');
          videoDiv.classList.add('non-invert-video');
        }
        //if call type is audio and we want screenshare in it
        if(this.channel_details['call_type'] == RTCCallType.AUDIO) {
          this.audio_screen_share = true;
          this.offerOptions = {
            offerToReceiveAudio: 1,
             offerToReceiveVideo: 1
          }
        }
        this.handleNegotiationNeededEvent(true , false);
        /**
         * check if video was muted before sharing the screen and maintain the state.
         */
        if (this.is_muted) {
          this.is_muted = !this.is_muted;
          this.muteVideo();
        }
      });
  }

  addMembersToConference() {
    this.showAddMemberConferencingPopup = true;
    if (this.channel_details['call_type'] == RTCCallType.AUDIO) {
      this.isAudioConference = true;
    } else {
      this.isAudioConference = false;
    }
  }

  inviteMembers(obj) {
    const data = {
      video_call_type: VideoCallType.SWITCH_TO_CONFERENCE,
      en_user_id: obj.en_user_id,
      invite_user_ids: obj.invite_user_ids,
      invite_link: obj.invite_link,
      is_audio_conference: this.isAudioConference ? true : undefined
    };
    this.sendToServer(data).then(() => {
      this.hangUpCall(true, this.hangupErrorEnum.CONF_INVITE);
    });
    window.open(obj.invite_link,  '_blank',
      `toolbar=no,scrollbars=yes,resizable=yes,top=50,left=50,width=${window.outerWidth - 100},height=${window.outerHeight - 100}`);
    this.showAddMemberConferencingPopup = false;
  }

  acceptConferenceInvite(data) {
    this.conferenceAcceptanceObject = {
      showAcceptConferencePopup: true,
      inviteFullName: data.full_name,
      conferenceLink: data.invite_link
    };
    window.opener.postMessage({ type: 'conference-call-invite', data: this.conferenceAcceptanceObject }, '*');
    this.hangUpCall(true, this.hangupErrorEnum.CONF_SWITCH);
  }
  submitFeedback() {
    const obj = {
      feedback: this.feedback_object.feedbackText,
      rating: this.feedback_object.selectedStar ? this.feedback_object.selectedStar.value : undefined,
      workspace_id: this.userData.workspace_id,
      type: `${this.channel_details['call_type'].toUpperCase()}_CALL`
    };
    /**
     * Nothin submitted
     */
    if (Object.keys(obj).length < 3) {
      // this.dualHangupCheck = true;
      window.close();
    } else {
      this.videoService.sendFeedback(obj).subscribe((res) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: 'Feedback Submitted.',
          timeout: 500
        });
        setTimeout(() => {window.close(); }, 500);
      });
    }
  }
  closeFeedbackWindow() {
    // this.dualHangupCheck = true;
    window.close();
  }

  startCounter() {
    counterInterval = setInterval(this.countTimer.bind(this), 1000);
  }
  countTimer() {
    ++totalSeconds;
    const hour = Math.floor(totalSeconds / 3600);
    const minute = Math.floor((totalSeconds - hour * 3600) / 60);
    const seconds = totalSeconds - (hour * 3600 + minute * 60);
    this.call_timer = `${hour.toString().length < 2 ? `0${hour}` : hour}:${minute.toString().length < 2 ? `0${minute}` : minute}:${seconds.toString().length < 2 ? `0${seconds}` : seconds}`;
    if (hour == 0) {
      this.call_timer = this.call_timer.slice(3);
    }
  }

  initiateOtherPeerConnection() {
    setInterval(()=>{
      this.refreshInviteToCall();
    }, refreshCallTimer);
  }

  refreshInviteToCall() {
    /**
     * sending refresh call event to the caller end, in return the receiver will now send readyToConnect to the caller
     */
    this.iceConfigData = this.sessionService.get('loginData/v1')['turn_credentials'];
    this.sendToServer({
      turn_creds: this.iceConfigData,
      video_call_type: VideoCallType.REFRESH_CALL,
      is_silent: true
    });
  }

  reinitializePeerConnection() {
    /** creating a new peer connection, so removing references from the old one */
    if(this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onremovetrack = null;
      this.peerConnection.onremovestream = null;
      this.peerConnection.onnicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      this.peerConnection.onicegatheringstatechange = null;
      this.peerConnection.onnotificationneeded = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onnremovestream = null;
      this.peerConnection.close(); //close the previous peer connection
      this.peerConnection = null;
    }
    this.createPeerConnection();
  }


  handleRefreshCallOffer() {
    /** after creating a new peer connection, send ready to connect to the caller */
    this.isRefreshCallOffer = false;
    this.sendToServer({
      is_silent: true,
      refresh_call: true,
      turn_creds: this.sessionService.get('loginData/v1')['turn_credentials'],
      video_call_type: VideoCallType.READY_TO_CONNECT
    })
  }
  
  openSystemPreferences() {
    window.open('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
  }
}
