import {PrependConvTextPipe, ShortNamePipe} from './../../pipes/pipe';
import {ContenteditableInputComponent} from './../../components/contenteditable-input/contenteditable-input.component';
import {CallRingerPopupComponent} from './../../components/call-ringer-popup/call-ringer-popup.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared.module';
import {SidebarComponent} from '../../components/sidebar/sidebar.component';
import {LayoutComponent} from '../../components/layout/layout.component';
import {
  CheckUserPipe,
  ExtractHTMLPipe,
  OrderByPipe,
  SortReactionsPipe,
  TaggedUserPipe,
  TimeConverterPipe,
  UrlPhonePipe,
  ImageDimension,
  CheckGif,
  ParseIntPipe,
  HighlightTextPipe,
  ClubSearchResultsPipe,
  RandomColorPipe,
  DurationPipe,
  SortVotesPipe,
  OrderByKeyValPipe
} from '../../pipes/pipe';
import {TagUsersComponent} from '../../components/tag-users/tag-users.component';
import {ChatComponent} from '../../components/chat/chat.component';
import {ScrollToUnreadDirective} from '../../directives/scroll-to-unread.directive';
import {ChatService} from '../../components/chat/chat.service';
import {SidebarService} from '../../components/sidebar/sidebar.service';
import {ProfilePopupComponent} from '../../components/profile-popup/profile-popup.component';
import {ProfileComponentComponent} from '../../components/profile-component/profile-component.component';
import {HeaderComponent} from '../../components/header/header.component';
import {InvitePopupComponent} from '../../components/invite-popup/invite-popup.component';
import {InvitePopupService} from '../../components/invite-popup/invite-popup.service';
import {GalleryCarouselComponent} from '../../components/gallery-carousel/gallery-carousel.component';
import {EmojiPickerComponent} from '../../components/emoji-picker/emoji-picker.component';
import {EmojiPickerService} from '../../components/emoji-picker/emoji-picker.service';
import {HeaderService} from '../../components/header/header.service';
import {ForwardPopupComponent} from '../../components/forward-popup/forward-popup.component';
import {SettingsPermissionsComponent} from '../../components/settings-permissions/settings-permissions.component';
import {SettingsPermissionsService} from '../../components/settings-permissions/settings-permissions.service';
import {BrowseGroupsComponent} from '../../components/browse-groups/browse-groups.component';
import {BrowseGroupsService} from '../../components/browse-groups/browse-groups.service';
import {InvitedUsersComponent} from '../../components/invited-users/invited-users.component';
import {InvitedUsersService} from '../../components/invited-users/invited-users.service';
import {SearchMessagesComponent} from '../../components/search-messages/search-messages.component';
import {CreateGroupComponent} from '../../components/create-group/create-group.component';
import {LayoutService} from '../../components/layout/layout.service';
import {AddMembersComponent} from '../../components/add-members/add-members.component';
import {ImagePreviewComponent} from '../../components/image-preview/image-preview.component';
import {UnnamedImageComponent} from '../../components/unnamed-image/unnamed-image.component';
import {EmailPopupComponent} from '../../components/email-popup/email-popup.component';
import {EmailPopupService} from '../../components/email-popup/email-popup.service';
import {GifComponent} from '../../components/gif/gif.component';
import {StarredMessagesComponent} from '../../components/starred-messages/starred-messages.component';
import {StarredMessagesService} from '../../components/starred-messages/starred-messages.service';
import {UserProfileComponent} from '../../components/user-profile/user-profile.component';
import {UserProfileService} from '../../components/user-profile/user-profile.service';
import {CreatePollComponent} from '../../components/create-poll/create-poll.component';
import {CapturePhotoComponent} from '../../components/capture-photo/capture-photo.component';
import {SocketioService} from '../../services/socketio.service';
import {ConferencingPopupComponent} from '../../components/conferencing-popup/conferencing-popup.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {BroadcastMessageComponent} from '../../components/broadcast-message/broadcast-message.component';
import {BroadcastMessageService} from '../../components/broadcast-message/broadcast-message.service';
import {WhatsNewComponent} from '../../components/whats-new/whats-new.component';
import {WhatsNewService} from '../../components/whats-new/whats-new.service';
import {InviteGuestsComponent} from '../../components/invite-guests/invite-guests.component';
import {InviteInputFieldsComponent} from '../../components/invite-input-fields/invite-input-fields.component';
import {InviteInputFieldService} from '../../components/invite-input-fields/invite-input-fields.service';
import {GuestFieldsPopupComponent} from '../../components/guest-fields-popup/guest-fields-popup.component';
import {GuestFieldsPopupService} from '../../components/guest-fields-popup/guest-fields-popup.service';
import {MessageReadByComponent} from '../../components/message-read-by/message-read-by.component';
import {MessageReadService} from '../../components/message-read-by/message-read-by.service';
import {WorkspaceBarComponent} from '../../components/workspace-bar/workspace-bar.component';
import {ImageCropperComponent} from '../../components/image-cropper/image-cropper.component';
import {CanvasDrawComponent} from '../../components/canvas-draw/canvas-draw.component';
import {NotificationComponent} from '../../components/notification/notification.component';
import {ThemesComponent} from '../../components/themes/themes.component';
import {MeetDashboardComponent} from '../../components/meet-dashboard/meet-dashboard.component';
import {MeetSidebarComponent} from '../../components/meet-sidebar/meet-sidebar.component';
import {MeetProfileComponent} from '../../components/meet-profile/meet-profile.component';
import {NotificationSettingsPopupComponent} from '../../components/notification-settings-popup/notification-settings-popup.component';
import {PaymentPopupComponent} from '../../components/payment-popup/payment-popup.component';
import {PaymentPopupService} from '../../components/payment-popup/payment-popup.service';
import {PaymentsComponent} from '../../components/payments/payments.component';
import {FullCalendarModule} from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {TasksPopupComponent} from '../../components/tasks-popup/tasks-popup.component';
import {TasksCalendarComponent} from '../../components/tasks-calendar/tasks-calendar.component';
import {MeetSidebarService} from '../../components/meet-sidebar/meet.sidebar.service';
import {MeetDashboardService} from '../../components/meet-dashboard/meet.dashboard.service';
import {ScheduledMeetJoinComponent} from '../../components/scheduled-meet-join/scheduled-meet-join.component';
import {ScheduleMeetComponent} from '../../components/schedule-meet/schedule-meet.component';
import {SubmitTaskPopupComponent} from '../../components/submit-task-popup/submit-task-popup.component';
import {MeetDetailsComponent} from '../../components/meet-details/meet-details.component';

FullCalendarModule.registerPlugins([
  // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin
]);

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    ScrollingModule,
    FullCalendarModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    NgxMaterialTimepickerModule
    // DragDropModule
  ],
  declarations: [
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    ProfileComponentComponent,
    GalleryCarouselComponent,
    ChatComponent,
    TaggedUserPipe,
    ScrollToUnreadDirective,
    CheckUserPipe,
    UrlPhonePipe,
    OrderByPipe,
    OrderByKeyValPipe,
    TimeConverterPipe,
    ParseIntPipe, ShortNamePipe,
    TagUsersComponent,
    ProfilePopupComponent,
    InvitePopupComponent,
    ScheduledMeetJoinComponent, ScheduleMeetComponent, MeetDetailsComponent,
    EmojiPickerComponent,
    SortReactionsPipe,
    ExtractHTMLPipe,
    SettingsPermissionsComponent,
    ImageDimension,
    CheckGif,
    ForwardPopupComponent,
    BrowseGroupsComponent,
    InvitedUsersComponent,
    SearchMessagesComponent,
    HighlightTextPipe,
    ClubSearchResultsPipe,
    ImagePreviewComponent,
    CreateGroupComponent,
    AddMembersComponent,
    UnnamedImageComponent,
    EmailPopupComponent,
    StarredMessagesComponent,
    GifComponent,
    DurationPipe,
    UserProfileComponent,
    CreatePollComponent,
    SortVotesPipe,
    CapturePhotoComponent,
    ConferencingPopupComponent,
    CallRingerPopupComponent,
    ContenteditableInputComponent,
    BroadcastMessageComponent,
    WhatsNewComponent,
    InviteGuestsComponent,
    InviteInputFieldsComponent,
    GuestFieldsPopupComponent,
    MessageReadByComponent,
    WorkspaceBarComponent,
    ImageCropperComponent,
    CanvasDrawComponent,
    PrependConvTextPipe,
    NotificationComponent,
    ThemesComponent,
    MeetDashboardComponent,
    MeetSidebarComponent,
    MeetProfileComponent,
    NotificationSettingsPopupComponent,
    PaymentPopupComponent,
    PaymentsComponent,
    TasksPopupComponent, SubmitTaskPopupComponent,
    TasksCalendarComponent
  ],
  exports: [RouterModule],
  providers: [
    SidebarService, ChatService, InvitePopupService, EmojiPickerService, HeaderService, SettingsPermissionsService,
    BrowseGroupsService, InvitedUsersService, LayoutService, EmailPopupService, StarredMessagesService,
    UserProfileService, SocketioService, BroadcastMessageService, WhatsNewService, InviteInputFieldService,
    GuestFieldsPopupService, MessageReadService, PaymentPopupService, MeetSidebarService, MeetDashboardService
  ]
})
export class ChatModule {
}
