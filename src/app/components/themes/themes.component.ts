import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonService } from "../../services/common.service";
import { SessionService } from "../../services/session.service";
import { MessageService } from "../../services/message.service";
import { ChatService } from "../chat/chat.service";
import { LocalStorageService } from "../../services/localStorage.service";

let obj = {};

@Component({
  selector: "app-themes",
  templateUrl: "./themes.component.html",
  styleUrls: ["./themes.component.scss", "../sidebar/sidebar.component.scss"]
})
export class ThemesComponent implements OnInit {
  spaceData;

  constructor(
    public commonService: CommonService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef,
    private service: ChatService,
    private localStorageService: LocalStorageService
  ) {}
  themeColor = this.commonService.themesArr[0];
  bubbleColor = this.commonService.bubbleArr[0];

  ngOnInit() {
    this.spaceData = this.commonService.currentOpenSpace;
    this.getCurrentTheme();
  }

  getCurrentTheme() {
    let theme = this.commonService.currentTheme;
    if (theme && theme.sidebar) {
      this.themeColor = this.commonService.themesArr[theme.sidebar];
    } else {
      this.themeColor = this.commonService.themesArr[0];
    }
    // if (theme.bubble) {
    //   this.bubbleColor = this.commonService.bubbleArr[theme.bubble];
    // } else {
    //   this.bubbleColor = this.commonService.bubbleArr[0];
    // }
  }

  saveTheme() {
    const theme_obj = {
      theme_id: this.themeColor.theme_id
    };
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      fugu_user_id: this.commonService.currentOpenSpace.fugu_user_id,
      web_theme: theme_obj
    };
    this.localStorageService.set("theme", {
      sidebar: this.themeColor.theme_id,
    });
    this.service.editUserInfo(obj).subscribe(() => {
      this.commonService.currentTheme.sidebar = this.themeColor.theme_id;
      // this.commonService.currentTheme.bubble = this.bubbleColor.id;
      this.messageService.sendAlert({
        type: "success",
        msg: "Theme updated",
        timeout: 3000
      });
    });
    this.commonService.showThemesPopup = false;
    this.cdRef.detectChanges();
  }

  closeThemePopup() {
    let theme:any = this.sessionService.get("theme");
    if (!theme) {
      theme = {}
     theme.sidebar = this.commonService.currentTheme.sidebar;
    }
    if (theme && theme.sidebar) {
      this.themeColor = this.commonService.themesArr[theme.sidebar];
    } else {
      this.themeColor = this.commonService.themesArr[0];
    }
    // if (theme.bubble) {
    //   this.bubbleColor = this.commonService.bubbleArr[theme];
    // } else {
    //   this.bubbleColor = this.commonService.bubbleArr[0];
    // }
    this.commonService.updateTheme(this.themeColor.class);
    // this.commonService.updateBubbleTheme(this.bubbleColor.class);
    this.commonService.showThemesPopup = false;
  }

  // updateBubble(item) {
  //   this.commonService.updateBubbleTheme(item.class);
  // }
}
