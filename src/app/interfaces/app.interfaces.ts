export interface ICallerInfo {
  full_name: string;
  call_type?: string;
  user_thumbnail_image: string;
  caller_text?: string;
  invite_link?: string;
  is_audio_conference?: boolean
}
export interface IContentEditableData {
  trigger_info: Array<IContentEditableTrigger>;
  chat_type: number;
  input_id: string;
  is_thread?: boolean;
  image_preview?: boolean;
  user_type?: number;
  muid?: string;
}

export interface IContentEditableTrigger {
  trigger: string;
  allowSpaces: boolean;
  commandEvent: boolean;
  requireLeadingSpace: boolean;
  data_array: Array<any>;
  template: Function;
  triggerType: string;
  members_count?: number;
  chat_type?: number;
}

export interface Message {
  date_time: string;
  full_name: string;
  email?: string;
  id?: number;
  message: string;
  message_status: number;
  message_type: number;
  user_id: number;
  user_type: number;
  image_url?: string;
  url?: string;
  muid?: string;
  thread_muid?: string;
  file_name?: string;
  file_size?: string;
  thumbnail_url?: string;
  state?: string;
  thread_message?: boolean;
  user_reaction?: object;
  user_image?: string;
  total_reaction?: string;
  reply_count?: number;
  reply_date_time?: string;
  message_state?: any;
  user_reaction_emoji?: any;
  last_sent_by_full_name?: string;
  last_sent_by_id?: any;
  thread_menu_open?: boolean;
  is_following_thread?: number;
  is_starred?: boolean;
  video_call_duration?;
  poll_options?: Array<IPollOptions>;
  question?: string;
  multiple_select?: boolean;
  total_votes?: number;
  expire_time?: any;
  is_expired?: boolean;
  expire_at?: string;
  call_type?: string;
  document_type?: string;
  thread_message_count?: number;
  last_reply?: string
  user_channel_status?: number
  thread_message_data?: any
}

export interface IPollOptions {
  puid: string;
  label: string;
  users_map?: object;
  poll_count?: number;
}

export interface IGroupInfoData {
  chat_type: number;
  role?: string;
  group_joined?: boolean;
  members: Array<object>;
  other_user_id?: number;
  is_deactivated?: boolean;
  user_count?: number;
}
