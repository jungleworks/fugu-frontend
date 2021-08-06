import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {PopupComponent} from '../components/popup/popup.component';
import {ValidatorComponent} from '../components/validator/validator';
import {AutofocusDirective} from '../directives/autofocus.directive';
import {HttpAuthInterceptor} from '../services/http-interceptor.service';
import {ForgotPasswordComponent} from '../components/forgot-password/forgot-password.component';
import {LoginGuardService} from '../services/loginGuard.service';
import {MessageAuthGuardService} from '../services/messageAuthGuard.service';
import {RouterModule} from '@angular/router';
import {CountryService} from '../services/country.service';
import {IntlPhoneInputComponent} from '../components/intl-phone-input/intl-phone-input.component';
import {ClickOutside} from '../directives/click-outside.directive';
import {SafeHtmlPipe, EmojiPipe, SortDataPipe, SortDateObjectPipe,
   ObjectLengthPipe, MarkdownPipe, EditedTextPipe, SortGroupMembers, RandomColorPipe, KeysPipe, InnerTextPipe, OrderSortByPipe } from '../pipes/pipe';
import { KeyboardEventsDirective } from '../directives/keyboard-events.directive';
import { FuguSwitchComponent } from '../components/fugu-switch/fugu-switch.component';
import {PermissionsPopupComponent} from '../components/permissions-popup/permissions-popup.component';
import {MessageModalComponent} from '../components/message-modal/message-modal.component';
import { CreateGroupService } from '../components/create-group/create-group.service';
import { ConferencingPopupService } from '../components/conferencing-popup/conferencing-popup.service';
import { AttendanceBotGuardService } from '../services/attendanceBotGuard.service';
import { TooltipDirective } from '../directives/tooltip.directive';
import { BillingGuardService } from '../services/billingGuard.service';
import { ChipsInputComponent } from '../components/fugu-apps-components/shared/chips-input/chips-input.component';
import { DateRangePickerComponent } from '../components/date-range-picker/date-range-picker.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginSpaceGuardService } from '../services/loginspaceGuard.service';
import { GoogleLoginComponent } from '../components/google-login/google-login.component';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MatTooltipModule,
    ImageCropperModule
  ],
  declarations: [
    PopupComponent,
    ValidatorComponent,
    AutofocusDirective,
    ForgotPasswordComponent,
    IntlPhoneInputComponent,
    FuguSwitchComponent,
    ClickOutside,
    SafeHtmlPipe,
    EmojiPipe,
    MarkdownPipe,
    InnerTextPipe,
    EditedTextPipe,
    SortDataPipe,
    SortGroupMembers,
    SortDateObjectPipe,
    ObjectLengthPipe,
    OrderSortByPipe,
    RandomColorPipe,
    KeyboardEventsDirective,
    TooltipDirective,
    KeysPipe,
    PermissionsPopupComponent,
    MessageModalComponent,
    ChipsInputComponent,
    DateRangePickerComponent,
    GoogleLoginComponent
  ],
  exports: [
    MatTooltipModule,
    ValidatorComponent,
    FormsModule,
    ReactiveFormsModule,
    PopupComponent,
    ForgotPasswordComponent,
    AutofocusDirective,
    IntlPhoneInputComponent,
    FuguSwitchComponent,
    ClickOutside,
    SafeHtmlPipe,
    MarkdownPipe,
    InnerTextPipe,
    EditedTextPipe,
    EmojiPipe,
    SortDataPipe,
    SortGroupMembers,
    SortDateObjectPipe,
    ObjectLengthPipe,
    RandomColorPipe,
    OrderSortByPipe,
    KeyboardEventsDirective,
    TooltipDirective,
    KeysPipe,
    PermissionsPopupComponent,
    MessageModalComponent,
    ChipsInputComponent,
    DateRangePickerComponent,
    GoogleLoginComponent,
    ImageCropperModule
  ],
  providers: [
    LoginGuardService,
    MessageAuthGuardService,
    BillingGuardService,
    LoginSpaceGuardService,
    // AttendanceBotGuardService,
    CountryService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptor,
      multi: true
    },
    SafeHtmlPipe,
    CreateGroupService,
    ConferencingPopupService
  ]
})
export class SharedModule { }
