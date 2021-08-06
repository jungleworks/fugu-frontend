export enum MessageType {
  Text_Message = 1,
  Public_Notes = 5,
  Media_Message = 10,
  File_Message = 11,
  Video_Message = 12,
  Video_Call = 13,
  Button_Message = 14,
  Poll = 15,
  conference_call = 16,
}

export enum StreamType {
  PUBLISH = 'PUBLISH',
  PLAY = 'PLAY',
}

export enum UserType {
  WebhookBot = 0,
  USER = 1,
  Bot = 3,
  AttendanceBot = 4,
  FuguSupportBot = 5,
  Guest = 6,
  ScrumBot = 7,
  SelfNote = 10
}

export enum SocketErrorCodes {
  User_Not_In_Channel = 409,
  User_Blocked = 401,
  Message_Deleted = 410,
  Turn_Credential_Fail = 413,
  Poll_expired = 414,
  app_old_version = 415,
  Channel_Not_Found = 407,
  Move_To_New_Fugu = 429
}

export enum NotificationType {
  Normal_Message = 1,
  Clear_Chat = 2,
  Delete_Message = 3,
  Added_To_Space = 5,
  Read_All = 6,
  Remove_Member = 7,
  Group_Update = 8,
  Add_Member = 9,
  Notification_Read = 10,
  Video_Call = 12,
  Audio_Call = 13,
  Edit_Message = 14,
  Session_Expire = 15,
  Google_Meet = 21,
  Task_Assign = 22,
}

export enum Typing {
  Typing_End = 0,
  Typing_Start = 1,
  Typing_Stopped = 2
}

export enum MessageStatus {
  Sending = 0,
  Sent = 1,
  Delivered = 2,
  Read = 3
}
export enum NotificationLevelTypes {
  ALL_CHATS = 'ALL_CHATS',
  DIRECT_MESSAGES = 'DIRECT_MESSAGES',
  NONE = 'NONE'
}
export enum NotificationAlertType {
  MUTED = 'MUTED',
  UNMUTED = 'UNMUTED'
}

export enum UploadChannelImageTypes {
  Group = 'GROUP',
  User = 'USER'
}

export  enum UserStatus {
  deactiveState = 'DISABLED',
  activeState = 'ENABLED',
  invited = 'INVITED'
}
export enum Role {
  isOwner = 'OWNER',
  isUser = 'USER',
  isAdmin = 'ADMIN',
  isGuest = 'GUEST',
  isPayingGuest = 'PAYING_GUEST'
}
export enum MessageExtension {
  IMAGE = 'image',
  FILE = 'file',
  VIDEO = 'video',
  AUDIO = 'audio'
}
export enum ContactTypes {
  ALL = 'ALL',
  CONTACTS = 'CONTACTS',
  GROUPS = 'GROUPS'
}
export enum ChatTypes {
  ONE_TO_ONE = 2,
  PRIVATE = 3,
  PUBLIC = 4,
  GENERAL = 5,
  DEFAULT_CHANNELS = 6,
  BOT = 7,
  RESTRICTED = 8
}
export enum VideoCallType {
  START_CONFERENCE = 'START_CONFERENCE',
  START_CONFERENCE_IOS = 'START_CONFERENCE_IOS',
  READY_TO_CONNECT_CONFERENCE = 'READY_TO_CONNECT_CONFERENCE',
  READY_TO_CONNECT_CONFERENCE_IOS = 'READY_TO_CONNECT_CONFERENCE_IOS',
  HUNGUP_CONFERENCE = 'HUNGUP_CONFERENCE',
  REJECT_CONFERENCE = 'REJECT_CONFERENCE',
  USER_BUSY_CONFERENCE = 'USER_BUSY_CONFERENCE',
  ANSWER_MULTI_CALL = 'ANSWER_MULTI_CALL',
  REJECT_MULTI_CALL = 'REJECT_MULTI_CALL',
  ANSWER_CONFERENCE = 'ANSWER_CONFERENCE',
  OFFER_CONFERENCE = 'OFFER_CONFERENCE',
  START_CALL = 'START_CALL',
  CALL_REJECTED = 'CALL_REJECTED',
  READY_TO_CONNECT = 'READY_TO_CONNECT',
  CALL_HUNG_UP = 'CALL_HUNG_UP',
  USER_BUSY = 'USER_BUSY',
  VIDEO_OFFER = 'VIDEO_OFFER',
  NEW_ICE_CANDIDATE = 'NEW_ICE_CANDIDATE',
  VIDEO_ANSWER = 'VIDEO_ANSWER',
  SWITCH_TO_CONFERENCE = 'SWITCH_TO_CONFERENCE',
  REFRESH_CALL = 'REFRESH_CALL'
}
export enum MessageStateTypes {
  MESSAGE_DELETED = 0,
  MESSAGE_NOT_DELETED = 1,
  MISSED_CALL = 2,
  COMPLETED_CALL = 3,
  MESSAGE_EDITED = 4
}
export enum RTCCallType {
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  HANGOUT = "HANGOUTS",
}
export enum SignupType {
  LOGIN = 1,
  SIGNUP = 2
}
export enum SignupMode {
  BOTH = 1,
  EMAIL = 2,
  PHONE = 3,
}

export enum ButtonMessageActionTypes {
  ACTION_PUBLISH = 'ACTION_PUBLISH',
  FAYE_PUBLISH = 'FAYE_PUBLISH',
  TEXT_FIELD = 'TEXT_FIELD',
  MESSAGE_PUBLISH = "MESSAGE_PUBLISH"
}

export enum AttendanceAuthenticationLevel {
  CAMERA = 'CAMERA',
  LOCATION = 'LOCATION',
  BOTH = 'BOTH',
  NONE = 'NONE'
}

export enum SocketEvents {
  MESSAGE = "message",
  THREAD_MESSAGE = "thread_message",
  CLEAR_CHAT = "clear_chat",
  DELETE_MESSAGE = "delete_message",
  NEW_WORKSPACE = "new_workspace",
  READ_ALL = "read_all",
  REMOVE_MEMBER = "remove_member",
  CHANGE_GROUP_INFO = "change_group_info",
  ADD_MEMBER = "add_member",
  READ_UNREAD_NOTIFICATION = "read_unread_notification",
  UPDATE_NOTIFICATION_COUNT = "update_notification_count",
  VIDEO_CALL = "video_call",
  AUDIO_CALL = "audio_call",
  CALLING = "calling",
  EDIT_MESSAGE = "edit_message",
  SESSION_EXPIRED = "session_expired",
  TYPING = "typing",
  STOP_TYPING = "stop_typing",
  SUBSCRIBE_USER = "subscribe_user",
  SUBSCRIBE_CHANNEL = "subscribe_channel",
  UNSUBSCRIBE_CHANNEL = "unsubscribe_channel",
  POLL = "poll",
  REACTION = "reaction",
  VIDEO_CONFERENCE = "video_conference",
  SUBSCRIBE_PRESENCE = "subscribe_presence",
  UNSUBSCRIBE_PRESENCE = "unsubscribe_presence",
  VIDEO_CONFERENCE_HUNGUP = "video_conference_hungup",
  PIN_CHAT = "pin_chat",
  UNPIN_CHAT = "unpin_chat",
  HANGOUTS_CALL = "hangouts_call",
}

export enum SocketConnectionState {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED'
}

export enum AttendanceRoles {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  HR = 'HR',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export enum BroadcastMessageType {
  ALl = 'ALL',
  EXCEPT = 'EXCEPT',
  ONLY = 'ONLY',
}

export enum PlanType {
  PER_USER = 'PER_USER',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum chipsType {
  ATTENDANCE_BOT = 'ATTENDANCE_BOT',
  GUEST_MEMBERS = 'GUEST_MEMBERS',
  CHANNELS = 'CHANNELS',
  MEMBERS = 'MEMBERS'
}

export enum presenceType {
  UNAVAILABLE = 'unavailable',
  AVAILABLE = 'available'
}
export enum memberType {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum callHangupType {
  CALL_PICKUP = 'Call not picked within 30 sec(web)',
  GET_USER_MEDIA = 'Call disconnected by getUserMedia Error(web)',
  CONF_SWITCH = 'Switched to conference call(web)',
  CONF_INVITE = 'Call disconnected while inviting members for conf(web)',
  CALL_TAB_CLOSE = 'Call disconnected as window was closed(web)',
  CALL_DISCONNECTED = 'Ice connection status changed to disconnected(web)',
  CALL_HANGUP = 'call disconnected by user(web)'
}
export enum leaveRole {
  WORK_FROM_HOME = 'WORK_FROM_HOME',
  ABSENT = 'ABSENT',
  PRESENT = 'PRESENT'
}

export enum groupNotificationType {
  UNMUTED = 'UNMUTED',
  MUTED = 'MUTED',
  DIRECT_MENTIONS =  'DIRECT_MENTIONS'
}

export enum Bots {
  FUGU_LIVE = 1,
  TOOKAN = 4,
  JIRA = 5,
  BIT_BUCKET = 6,
  ATTENDANCE_BOT = 7,
  CONFERENCE_BOT = 8,
  TRELLO = 9,
  ALERT_BOT = 10,
  SCRUM_BOT = 11,
  HUSKY = 12,
  GOOGLE_CAL = 13,
  SECRET_SANTA = 14
}
