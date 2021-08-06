import {EventEmitter, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import * as io from 'socket.io-client';
import {SessionService} from './session.service';
import {CommonService} from './common.service';
import {NotificationType, SocketConnectionState, SocketErrorCodes, SocketEvents} from '../enums/app.enums';
import { MessageService } from './message.service';
import { CommonApiService } from './common-api.service';
const bufferMessageArray = {};

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  public socket;
  private userData;
  private access_token;
  public active_channel_id;
  public onTypingEvent: EventEmitter<object> = new EventEmitter<object>();
  public onActiveChannelMessageReceivedEvent: EventEmitter<object> = new EventEmitter<object>();
  public onControlChannelMessageReceivedEvent: EventEmitter<object> = new EventEmitter<object>();
  public onPinChatEvent: EventEmitter<object> = new EventEmitter<object>();
  public onUnpinChatEvent: EventEmitter<object> = new EventEmitter<object>();
  public onTypingStopEvent: EventEmitter<object> = new EventEmitter<object>();
  public connectionStateEvent: EventEmitter<object> = new EventEmitter<object>();
  public reconnectionEvent: EventEmitter<object> = new EventEmitter<object>();
  public onReactionEvent: EventEmitter<object> = new EventEmitter<object>();
  public onPollVoteEvent: EventEmitter<object> = new EventEmitter<object>();
  public onMemberAddEvent: EventEmitter<object> = new EventEmitter<object>();
  public onMemberRemoveEvent: EventEmitter<object> = new EventEmitter<object>();
  public onClearChatEvent: EventEmitter<object> = new EventEmitter<object>();
  public oldVersionErrorEvent: EventEmitter<object> = new EventEmitter<object>();
  public onGroupUpdateEvent: EventEmitter<object> = new EventEmitter<object>();
  public onDeleteMessageEvent: EventEmitter<object> = new EventEmitter<object>();
  public onEditMessageEvent: EventEmitter<object> = new EventEmitter<object>();
  public onSessionExpireEvent: EventEmitter<object> = new EventEmitter<object>();
  public onThreadMessageEvent: EventEmitter<object> = new EventEmitter<object>();
  public onReadAllEvent: EventEmitter<object> = new EventEmitter<object>();
  public onMessageSentEvent: EventEmitter<object> = new EventEmitter<object>();
  public notificationCenterEvent: EventEmitter<object> = new EventEmitter<object>();
  public onVideoCallEvent: EventEmitter<object> = new EventEmitter<object>();
  public onCallingEvent: EventEmitter<object> = new EventEmitter<object>();
  public differentWSCallEvent: EventEmitter<object> = new EventEmitter<object>();
  public onVideoConferenceEvent: EventEmitter<object> = new EventEmitter<object>();
  public onPresenceEvent: EventEmitter<object> = new EventEmitter<object>();

  static logConsole(text, data?) {
    if (!environment.production) {
      console.log(text, data);
    }
  }

  constructor(private sessionService: SessionService, private commonService: CommonService,private commonApiService: CommonApiService,
    private messageService: MessageService) {
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    this.commonService.putUserDetail.subscribe((workspace) => {
      // if (!this.userData) {
        this.userData = this.commonService.userDetailDict[workspace];
        if(this.socket) {
          this.disconnectSocket();
        }
        this.setupSocketConnection();
      // }
    });
  }


  setupSocketConnection() {
    if (!this.userData) {
      return;
    }
    if(this.socket) {
      this.disconnectSocket();
    }
    if (this.commonService.getCookieSubdomain('token')) {
      this.access_token = this.commonService.getCookieSubdomain('token')['access_token'];
    }
    this.socket = io(environment.SOCKET_ENDPOINT, {transports: ['websocket'],
      query: {
        en_user_id: this.userData.en_user_id,
        user_unique_key: this.userData.user_unique_key,
        device_type: 3,
        access_token: this.access_token
      }
    });
    this.socket.on('connect', () => {
      this.socket.emit(SocketEvents.SUBSCRIBE_USER, this.userData.user_channel, (err, ack_data) => {
        if (err) {
          SocketioService.logConsole('Error', err);
        } else {
          SocketioService.logConsole('Subscribed to channel', ack_data.channel);
        }
      });
      this.connectionStateEvent.emit({state: SocketConnectionState.CONNECTED, timestamp: new Date()});
    });
    this.socket.on('connecting', () => {
      this.connectionStateEvent.emit({state: SocketConnectionState.CONNECTING, timestamp: new Date()});
      SocketioService.logConsole('socket.io connecting');
    });
    this.socket.on('reconnect', () => {
      this.reconnectionEvent.emit({timestamp: new Date()});
      this.connectionStateEvent.emit({state: SocketConnectionState.CONNECTED, timestamp: new Date()});
      this.socket.emit(SocketEvents.SUBSCRIBE_CHANNEL, this.active_channel_id, (err, ack_data) => {
        if (err) {
          SocketioService.logConsole('Error', err);
        } else {
          SocketioService.logConsole('Subscribed to channel', ack_data.channel);
          if (Object.keys(bufferMessageArray).length) {
            for (const msg in bufferMessageArray) {
              this.sendMessage(bufferMessageArray[msg]);
              delete bufferMessageArray[msg];
            }
          }
        }
      });
    });
    this.socket.on('connect_error', (error) => {
      this.connectionStateEvent.emit({state: SocketConnectionState.DISCONNECTED, timestamp: new Date()});
      SocketioService.logConsole('Connection', error);
    });
    this.socket.on('connect_timeout', (timeout) => {
      this.connectionStateEvent.emit({state: SocketConnectionState.DISCONNECTED, timestamp: new Date()});
      SocketioService.logConsole('Connection Timeout', timeout);
    });
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      SocketioService.logConsole('Reconnection Attempt', attemptNumber);
    });
    this.socket.on('reconnecting', (attemptNumber) => {
      SocketioService.logConsole('Reconnecting', attemptNumber);
    });
    this.socket.on('reconnect_error', () => {
      this.connectionStateEvent.emit({state: SocketConnectionState.DISCONNECTED, timestamp: new Date()});
    });
    this.socket.on('disconnect', (reason) => {
      if (reason != 'io client disconnect') {
        this.connectionStateEvent.emit({state: SocketConnectionState.DISCONNECTED, timestamp: new Date()});
      }
      // if (reason === 'io server disconnect') {
      //   // the disconnection was initiated by the server, you need to reconnect manually
      //   this.socket.connect();
      // }
    });
    this.socket.on(SocketEvents.MESSAGE, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        SocketioService.logConsole('Message Received', data);
        if (data.notification_type != 16) {
        this.onControlChannelMessageReceivedEvent.emit(data);
        }
        if (data.channel_id == this.active_channel_id) {
          this.onActiveChannelMessageReceivedEvent.emit(data);
        }
      } else {
        if(data.workspace)
        this.commonService.setUnreadCountOfSpace.emit({workspace : data.workspace, count: data.unread_count || 0 });
      }
    });
    this.socket.on(SocketEvents.VIDEO_CONFERENCE_HUNGUP, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onControlChannelMessageReceivedEvent.emit(data);
      }
    });
    this.socket.on(SocketEvents.TYPING, (data) => {
      this.onTypingEvent.emit(data);
      // SocketioService.logConsole('Typing Event', data);
    });
    this.socket.on(SocketEvents.STOP_TYPING, (data) => {
      this.onTypingStopEvent.emit(data);
      // SocketioService.logConsole('Stop Typing Event', data);
    });
    this.socket.on('presence', (data) => {
      this.onPresenceEvent.emit(data);
    });
    this.socket.on(SocketEvents.REACTION, (data) => {
      this.onReactionEvent.emit(data);
      SocketioService.logConsole('Reaction Event', data);
    });
    this.socket.on(SocketEvents.POLL, (data) => {
      this.onPollVoteEvent.emit(data);
      SocketioService.logConsole('Poll Event', data);
    });
    this.socket.on(SocketEvents.ADD_MEMBER, (data) => {
      this.notificationCenterEvent.emit(Object.assign(data, {notification_type: 5}));
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onMemberAddEvent.emit(data);
        SocketioService.logConsole('Add Member Event', data);
      }
    });
    this.socket.on(SocketEvents.REMOVE_MEMBER, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onMemberRemoveEvent.emit(data);
        SocketioService.logConsole('Remove Member Event', data);
      }
    });
    this.socket.on(SocketEvents.CLEAR_CHAT, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onClearChatEvent.emit(data);
        SocketioService.logConsole('Clear Chat Event', data);
      }
    });
    this.socket.on(SocketEvents.CHANGE_GROUP_INFO, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onGroupUpdateEvent.emit(data);
        this.notificationCenterEvent.emit(Object.assign(data, {notification_type: 8}));
        SocketioService.logConsole('Group Update Event', data);
      }
    });
    this.socket.on(SocketEvents.DELETE_MESSAGE, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onDeleteMessageEvent.emit(data);
        SocketioService.logConsole('Delete Message Event', data);
      }
    });
    this.socket.on(SocketEvents.EDIT_MESSAGE, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onEditMessageEvent.emit(data);
        this.notificationCenterEvent.emit(Object.assign(data, {notification_type: 14}));
        SocketioService.logConsole('Edit Message Event', data);
      }
    });
    this.socket.on(SocketEvents.NEW_WORKSPACE, (data) => {
      this.notificationCenterEvent.emit(Object.assign(data, {notification_type: 5}));
      SocketioService.logConsole('New Workspace Event', data);
    });
    this.socket.on(SocketEvents.SESSION_EXPIRED, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onSessionExpireEvent.emit(data);
        SocketioService.logConsole('Session Expire Event', data);
      }
    });
    this.socket.on(SocketEvents.READ_ALL, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onReadAllEvent.emit(data);
      }
      // SocketioService.logConsole('Read All Event', data);
    });
    this.socket.on(SocketEvents.UPDATE_NOTIFICATION_COUNT, (data) => {
      this.notificationCenterEvent.emit(Object.assign(data, {notification_type: 10}));
      // SocketioService.logConsole('Read Unread Event', data);
    });
    this.socket.on(SocketEvents.PIN_CHAT, (data) => {
      this.onPinChatEvent.emit(data);
    });
    this.socket.on(SocketEvents.UNPIN_CHAT, (data) => {
      this.onUnpinChatEvent.emit(data);
    });


    this.socket.on(SocketEvents.THREAD_MESSAGE, (data) => {
      this.onThreadMessageEvent.emit(data);
      SocketioService.logConsole('Thread Message Event', data);
    });
    this.socket.on(SocketEvents.VIDEO_CALL, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onVideoCallEvent.emit(data);
        SocketioService.logConsole('Video Call Event', data);
      } else {
        let domain = window.location.hostname.split('.').splice(1, 2).join('.');
        if (window.location.hostname == 'localhost') {
          domain = environment.LOCAL_DOMAIN;
        }
        if (domain == data.domain) {
        this.differentWSCallEvent.emit(data);
        }
      }
    });
    this.socket.on(SocketEvents.AUDIO_CALL, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onVideoCallEvent.emit(data);
        SocketioService.logConsole('Audio Call Event', data);
      } else {
        let domain = window.location.hostname.split('.').splice(1, 2).join('.');
        if (window.location.hostname == 'localhost') {
          domain = environment.LOCAL_DOMAIN;
        }
        if (domain == data.domain) {
          this.differentWSCallEvent.emit(data);
        }
      }
    });
    this.socket.on(SocketEvents.CALLING, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        this.onCallingEvent.emit(data);
        SocketioService.logConsole('Audio/Video Call Event', data);
      } else {
        let domain = window.location.hostname.split('.').splice(1, 2).join('.');
        if (window.location.hostname == 'localhost') {
          domain = environment.LOCAL_DOMAIN;
        }
        if (domain == data.domain) {
          this.differentWSCallEvent.emit(data);
        }
      }
    });
    this.socket.on(SocketEvents.VIDEO_CONFERENCE, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        SocketioService.logConsole('Message Received', data);
          this.onControlChannelMessageReceivedEvent.emit(data);
        if (data.channel_id == this.active_channel_id) {
          this.onActiveChannelMessageReceivedEvent.emit(data);
        }
        this.onVideoConferenceEvent.emit(data);
      }
    });
    this.socket.on(SocketEvents.HANGOUTS_CALL, (data) => {
      if (data.app_secret_key == this.userData.app_secret_key) {
        SocketioService.logConsole("Message Received", data);
        this.onControlChannelMessageReceivedEvent.emit(data);
        if (data.channel_id == this.active_channel_id) {
          this.onActiveChannelMessageReceivedEvent.emit(data);
        }
        this.onVideoConferenceEvent.emit(data);
      }
    });
  }

  public setupCallingConnection(channel_id): Promise<any> {
    /* Sockets for receiver end */
    return new Promise((resolve, reject) => {
      if (this.sessionService.get('user_details_dict')) {
        const user_details = this.sessionService.get('user_details_dict');
        this.userData = user_details[window.location.pathname.split('/')[1]];
      }
      this.socket = io(environment.SOCKET_ENDPOINT, {transports: ['websocket'],
        query: {
          en_user_id: this.userData.en_user_id,
          user_unique_key: this.userData.user_unique_key,
          device_type: 3
        }
      });
      this.socket.on('connect', () => {
        SocketioService.logConsole('Conencted Client', `${this.socket.id} ${new Date()}`);
        this.socket.emit(SocketEvents.SUBSCRIBE_USER, this.userData.user_channel, (err, ack_data) => {
          if (err) {
            SocketioService.logConsole('Error', err);
          } else {
            SocketioService.logConsole('Subscribed to channel', ack_data.channel);
          }
        });
        this.socket.emit(SocketEvents.SUBSCRIBE_CHANNEL, channel_id, (err, ack_data) => {
          if (err) {
            SocketioService.logConsole('Error', err);
          } else {
            SocketioService.logConsole('Subscribed to channel', ack_data.channel);
            resolve('returned');
            this.active_channel_id = ack_data.channel;
          }
        });
        this.connectionStateEvent.emit({state: SocketConnectionState.CONNECTED, timestamp: new Date()});
      });
      this.socket.on(SocketEvents.VIDEO_CALL, (data) => {
        if (data.app_secret_key == this.userData.app_secret_key) {
          this.onVideoCallEvent.emit(data);
          SocketioService.logConsole('Video Call Event', data);
        } else {
          let domain = window.location.hostname.split('.').splice(1, 2).join('.');
          if (window.location.hostname == 'localhost') {
            domain = environment.LOCAL_DOMAIN;
          }
          if (domain == data.domain) {
          this.differentWSCallEvent.emit(data);
          }
        }
      });
      this.socket.on(SocketEvents.AUDIO_CALL, (data) => {
        if (data.app_secret_key == this.userData.app_secret_key) {
          this.onVideoCallEvent.emit(data);
          SocketioService.logConsole('Audio Call Event', data);
        } else {
          let domain = window.location.hostname.split('.').splice(1, 2).join('.');
          if (window.location.hostname == 'localhost') {
            domain = environment.LOCAL_DOMAIN;
          }
          if (domain == data.domain) {
          this.differentWSCallEvent.emit(data);
          }
        }
      });
      this.socket.on(SocketEvents.CALLING, (data) => {
        if (data.app_secret_key == this.userData.app_secret_key) {
          this.onCallingEvent.emit(data);
          SocketioService.logConsole('Audio Call Event', data);
        } else {
          let domain = window.location.hostname.split('.').splice(1, 2).join('.');
          if (window.location.hostname == 'localhost') {
            domain = environment.LOCAL_DOMAIN;
          }
          if (domain == data.domain) {
          this.differentWSCallEvent.emit(data);
          }
        }
      });
    });
  }

  subscribeToChannel(channel_id: number) {
    if (this.active_channel_id) {
      this.socket.emit(SocketEvents.UNSUBSCRIBE_CHANNEL, this.active_channel_id, (err, ack_data) => {
        if (err) {
          SocketioService.logConsole('Error', err);
        } else {
          SocketioService.logConsole('Unsubscribed from channel', ack_data.channel);
        }
      });
    }
    this.active_channel_id = channel_id;
    this.socket.emit(SocketEvents.SUBSCRIBE_CHANNEL, channel_id, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Subscribed to channel', ack_data.channel);
        this.active_channel_id = ack_data.channel;
      }
    });
  }

  subscribeToPresence(user_id: number) {
    const p_user_id = 'p_' + user_id;
    this.socket.emit(SocketEvents.SUBSCRIBE_PRESENCE, p_user_id, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Subscribed to user presence', ack_data.user_presence_subscribed);
      }
    });
  }

  unsubscribePresence(user_id: number) {
    const p_user_id = 'p_' + user_id;
    this.socket.emit(SocketEvents.UNSUBSCRIBE_PRESENCE, p_user_id, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Unsubscribed user presence', ack_data.user_presence_subscribed);
      }
    });
  }

  sendMessage(data): Promise<any> {
    return new Promise((resolve, reject) => {
      bufferMessageArray[data.muid] = data;
      /**
       * append some extra required data in every event.
       */
      data = Object.assign(data, {
        is_web: true,
        device_token: localStorage.getItem('token') || undefined,
        device_payload: {
          'device_details': navigator.userAgent,
          'device_id': this.commonService.getCookieSubdomain('device_id').toString(),
          'device_type': 3
        }
      });
      this.socket.emit(SocketEvents.MESSAGE, data, (err, ack_data) => {
        delete bufferMessageArray[data.muid];
        if (err) {
          switch (err.statusCode) {
            case SocketErrorCodes.User_Not_In_Channel:
              const obj = {
                channel_id: data.channel_id,
                notification_type: NotificationType.Clear_Chat
              };
              this.onClearChatEvent.emit(obj);
              break;
            case SocketErrorCodes.User_Blocked:
              this.commonApiService.logout();
              break;
            case SocketErrorCodes.Channel_Not_Found:
              this.messageService.sendAlert({
                type: 'danger',
                msg: 'You cannot send messages to this channel',
                timeout: 2000
              });
              break;
            case SocketErrorCodes.Move_To_New_Fugu:
              // this.commonService.showMoveNewPopup = true;
              break;
              case SocketErrorCodes.app_old_version:
                this.oldVersionErrorEvent.emit(err);
          }
          // reject(new Error(err));
          if(err.statusCode == SocketErrorCodes.Turn_Credential_Fail) {
            reject(err);
          } else {
            reject(new Error(err));
          }
          SocketioService.logConsole('Error', err);
        } else {
          resolve(data);
          this.onMessageSentEvent.emit(data);
          SocketioService.logConsole('Acknowledgement', JSON.stringify(ack_data));
        }
      });
    });
  }

  sendVideoInformation(data) : Promise<any> {
    return new Promise((resolve, reject) => {
    data = Object.assign(data, {
      is_web: true,
      device_token: localStorage.getItem('token') || undefined,
      device_payload: {
        'device_details': navigator.userAgent,
        'device_id': this.commonService.getCookieSubdomain('device_id').toString(),
        'device_type': 3
      }
    });
    this.socket.emit(SocketEvents.VIDEO_CONFERENCE, data, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Thread Acknowledgement', ack_data);
      }
    });
  })
  }
  sendMeetInformation(data) : Promise<any> {
    return new Promise((resolve, reject) => {
    data = Object.assign(data, {
      is_web: true,
      device_token: localStorage.getItem('token') || undefined,
      device_payload: {
        'device_details': navigator.userAgent,
        'device_id': this.commonService.getCookieSubdomain('device_id').toString(),
        'device_type': 3
      }
    });
    this.socket.emit(SocketEvents.HANGOUTS_CALL, data, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole("Error", err);
      } else {
        SocketioService.logConsole("Thread Acknowledgement", ack_data);
      }
    });
  })
  }
  sendThreadMessage(data) {
    /**
     * append some extra required data in every event.
     */
    data = Object.assign(data, {
      is_web: true,
      device_token: localStorage.getItem('token') || undefined,
      device_payload: {
        'device_details': navigator.userAgent,
        'device_id': this.commonService.getCookieSubdomain('device_id').toString(),
        'device_type': 3
      }
    });
    this.socket.emit(SocketEvents.THREAD_MESSAGE, data, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Thread Acknowledgement', ack_data);
      }
    });
  }

  typingEvent(data) {
    this.socket.emit(SocketEvents.TYPING, data,  (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        // SocketioService.logConsole(`Typing Acknowledgement ${JSON.stringify(ack_data)}`);
      }
    });
  }

  stopTypingEvent(data) {
    this.socket.emit(SocketEvents.STOP_TYPING, data, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        // SocketioService.logConsole(`Stop Typing Acknowledgement' ${JSON.stringify(ack_data)}`);
      }
    });
  }

  sendReaction(data) {
    this.socket.emit(SocketEvents.REACTION, data, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Reaction Acknowledgement', ack_data);
      }
    });
  }

  voteOnPoll(data) {
    this.socket.emit(SocketEvents.POLL, data, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Poll Acknowledgement', ack_data);
      }
    });
  }

  sendReadAllEvent(data) {
    this.socket.emit(SocketEvents.READ_ALL, data, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Read All Acknowledgement', ack_data);
      }
    });
  }

  sendNotificationEvent(data) {
    this.socket.emit(SocketEvents.READ_UNREAD_NOTIFICATION, data, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Send Notification Acknowledgement', ack_data);
      }
    });
  }

  unsubscribeChannel(channel_id) {
    this.socket.emit(SocketEvents.UNSUBSCRIBE_CHANNEL, channel_id, (err, ack_data) => {
      if (err) {
        SocketioService.logConsole('Error', err);
      } else {
        SocketioService.logConsole('Unsubscribed from channel', ack_data.channel);
      }
    });
  }

  disconnectSocket() {
    this.socket.disconnect();
  }
  // removeListeners() {
  //   this.socket.off('message');
  //   this.socket.off('typing');
  //   this.socket.off('stop typing');
  // }
}
