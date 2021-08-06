import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from "@angular/core";
import { CommonService } from "../../services/common.service";
import { SidebarService } from "../sidebar/sidebar.service";
import { MessageService } from "../../services/message.service";
import { LayoutService } from "../layout/layout.service";
import { CommonApiService } from "../../services/common-api.service";
import { debounceTime } from "rxjs/operators";
import { messageModalAnimation } from "../../animations/animations";
declare const moment: any;

@Component({
  selector: "app-notification-settings-popup",
  templateUrl: "./notification-settings-popup.component.html",
  styleUrls: ["./notification-settings-popup.component.scss"],
  animations: [
    messageModalAnimation
  ]
})
export class NotificationSettingsPopupComponent implements OnInit {
  @Output()
  closeNotificationPopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(
    private service: SidebarService,
    public commonService: CommonService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    public layoutService: LayoutService,
    private commonApiService: CommonApiService
  ) {}
  selectedSnoozeTime = this.commonService.snoozeArray[0];
  showSnoozeBox;
  choosenNotificationType;
  notificationType;
  spaceData;
  ngOnInit(): void {
    this.spaceData = this.commonService.currentOpenSpace;
    this.getInfo();
    this.notificationType = this.choosenNotificationType;
    /* if snooze time is over and window is not refreshed, check locally */
    let now = moment().utc().format();
    now = now.replace('Z', '.000Z');
    if (this.commonService.notification_snooze_time && now > this.commonService.notification_snooze_time) {
      this.commonService.notification_snooze_time = null;
    }

  }


  getInfo() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id
    };
    this.commonApiService.getInfo(obj)
    .pipe(debounceTime(100))
      .subscribe((response) => {
        this.notificationType = response.data[0].notification_level;
        this.choosenNotificationType = this.notificationType;
        let now = moment().utc().format();
        now = now.replace('Z', '.000Z');
        this.commonService.notification_snooze_time = response.data[0].notification_snooze_time;
          if (this.commonService.notification_snooze_time && now > this.commonService.notification_snooze_time) {
            this.commonService.notification_snooze_time = null;
          }
          this.changeDetectorRef.detectChanges();
      });
  }

  chooseSnoozeTime(i) {
    this.selectedSnoozeTime = this.commonService.snoozeArray[i];
    this.showSnoozeBox = false;
  }

  onSnoozeClickOutside(event) {
    if (event && event.value == true) {
      this.showSnoozeBox = false;
    }
  }

  editNotificationInfo() {
    if (this.notificationType != "SNOOZE") {
      const obj = {
        en_user_id: this.commonService.userDetails.en_user_id,
        notification_level: this.notificationType,
      };
      this.commonApiService.editInfo(obj).subscribe((response) => {
        this.messageService.sendAlert({
          type: "success",
          msg: response.message,
          timeout: 2000,
        });
        this.closeNotificationPopup.emit();
        this.choosenNotificationType = this.notificationType;
        this.changeDetectorRef.detectChanges();
      });
    } else if (this.notificationType == "SNOOZE") {
      const obj = {
        workspace_id: this.spaceData.workspace_id,
        fugu_user_id: this.spaceData.fugu_user_id,
        notification_snooze_time: this.selectedSnoozeTime.time_slot,
      };
      this.service.editUserInfo(obj).subscribe((response) => {
        this.messageService.sendAlert({
          type: "success",
          msg: response.message,
          timeout: 2000,
        });
        this.closeNotificationPopup.emit();
        this.commonService.notification_snooze_time =
          response.data.notification_snooze_time;
        this.choosenNotificationType = this.notificationType;
        this.changeDetectorRef.detectChanges();
      });
    }
  }


  endSnooze() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      fugu_user_id: this.spaceData.fugu_user_id,
      end_snooze: true
    };
    this.service.editUserInfo(obj)
    .subscribe((response) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      this.commonService.notification_snooze_time = null;
      this.closeNotificationPopup.emit();
      this.choosenNotificationType = this.notificationType;
      this.changeDetectorRef.detectChanges();
    });
  }
}
