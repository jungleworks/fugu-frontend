import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { environment } from '../../../environments/environment';
import { LayoutService } from '../layout/layout.service';
import { Router } from '@angular/router';
import { CommonApiService } from '../../services/common-api.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Role } from '../../enums/app.enums';
import { LoaderService } from '../../services/loader.service';

let domainsDataAll;
@Component({
  selector: 'app-workspace-bar',
  templateUrl: './workspace-bar.component.html',
  styleUrls: ['./workspace-bar.component.scss']
})
export class WorkspaceBarComponent implements OnInit {
  domainsData;
  spaceData;
  active_index = -1;
  tokenData
  userData = {
    workspace_name: '',
    workspace: '',
    full_name : '',
    user_image: ''
  };
  workspacesSearchCtrl: FormControl
  showOverlay = false;
  role_status = Role.isUser;

  @Input()
  set user_data(data) {
    if(data) {
      this.userData = data;
    }
  }
  @ViewChild('workspacesContainer', { static: true }) workspacesContainer;
  newTabMenu: boolean ;
  clickedDomain;
  constructor(private sessionService: SessionService, public commonService: CommonService, private layoutService: LayoutService,
    private router : Router, private commonApiService: CommonApiService, private cdRef: ChangeDetectorRef, private loader: LoaderService,) { }

  ngOnInit() {
    this.workspacesSearchCtrl = new FormControl();
    this.domainsData = this.sessionService.get('domains');
    domainsDataAll = this.sessionService.get('domains');
    this.spaceData = this.commonService.currentOpenSpace;
    this.role_status = this.spaceData.role;
    this.setUnreadCount()
    if (this.commonService.getCookieSubdomain('token')) {
      this.tokenData = this.commonService.getCookieSubdomain('token');
    }

    this.commonService.otherSpaceNotificationEmitter.subscribe(
      (res) => {
        if(res) {
          const spaceDict = this.sessionService.get('spaceDictionary');
          this.onDomainChange('',spaceDict[res]);
        }
      });

     this.commonService.setUnreadCountOfSpace.subscribe(
       (data) => {
         if(data) {
           this.updateUnreadCount(data);
         }
       }
     );
     this.commonService.closeWorkspaceEmitter.subscribe(
      (data) => {
        if (!data) {
          this.workspacesSearchCtrl.reset()
          this.cdRef.detectChanges();
        }
      }
    );
     this.workspacesSearchCtrl.valueChanges
     .pipe(debounceTime(300))
     .subscribe(data => {
        this.active_index = -1;
        this.searchWorkspaces(data);
       this.cdRef.detectChanges();
     });
  }

  searchWorkspaces(data) {
    if (data) {
      this.domainsData = domainsDataAll.filter(member =>
        member.workspace_name.toLowerCase().includes(data.toLowerCase()) &&
        this.spaceData.workspace_id != member.workspace_id
        );
    } else {
      this.domainsData = domainsDataAll;
    }
  }
  setUnreadCount() {
    if(this.domainsData.length > 0) {
      this.domainsData.forEach(item => {
        if(item.workspace == this.spaceData.workspace) {
          item.unread_count = 0;
        }
      });
      this.sessionService.set('domains', this.domainsData);
      this.cdRef.detectChanges();
    }
  }

  updateUnreadCount(data) {
    if(this.domainsData.length) {
      this.domainsData.forEach(item => {
        if(item.workspace == data.workspace) {
          item.unread_count = data.count + 1;
        }
      });
      this.sessionService.set('domains', this.domainsData);
      this.cdRef.detectChanges();
    }
  }

  onDomainChange(event, domain, noRedirect?) {
    if (this.spaceData.workspace_id != domain.workspace_id) {
      this.loader.show();
    }
    this.emitOrCloseHandlers();
    this.domainsData = domainsDataAll;
    if (event.ctrlKey || event.metaKey == true) {
      event.preventDefault();
      this.loader.hide();
      this.openLinkInNewTab(event, domain);
      return;
    }

    if (domain.workspace != this.userData.workspace) {
      const loginData = this.sessionService.get('loginData/v1')['user_info'];
      this.commonService.currentOpenSpace = domain;
      this.spaceData = this.commonService.currentOpenSpace;
      this.role_status = this.spaceData.role;
      this.setUnreadCount();
      this.commonService.spaceDataEmit();
      const data = {
        full_name: domain.full_name,
        user_channel: loginData.user_channel,
        user_id: domain.user_id,
        user_unique_key: loginData.user_id,
        en_user_id: domain.en_user_id,
        app_secret_key: domain.fugu_secret_key,
        is_conferencing_enabled: domain.is_conferencing_enabled,
        role: domain.attendance_role,
        user_name: domain.attendance_user_name,
        workspace: domain.workspace
      };
      if (domain.user_attendance_config) {
        data['user_attendance_config'] = {
          punch_in_permission: domain.user_attendance_config.punch_in_permission,
          punch_out_permission: domain.user_attendance_config.punch_out_permission
        };
      }
      this.commonService.updateUserDetails(data);
      this.layoutService.resetGetConvo.emit(true);
      const obj = {
        token: localStorage.getItem('token') || undefined,
        workspace_id: domain.workspace_id,
        access_token: this.tokenData.access_token
      };
      this.commonApiService.switchWorkspace(obj)
        .subscribe(() => {

        });
        this.commonService.switchSpaceEmitter.emit(domain.workspace);
      if (!noRedirect) {
        if (this.commonService.isWhitelabelled) {
          this.router.navigate(['/' + domain.workspace , 'messages',0]);
        } else {
              this.router.navigate(['/' + domain.workspace , 'messages',0]);

        }
      } else {
        const url = window.location.hostname;
        if(url == 'localhost') {
          window.open('https://'+ environment.REDIRECT_PATH + '/'+domain.workspace , '_BLANK');
        } else {
          window.open('https://'+ environment.REDIRECT_PATH + '/'+domain.workspace , '_BLANK');
        }
      }
    } else {
      if(domain) {
        this.commonService.currentOpenSpace = domain;
        this.spaceData = this.commonService.currentOpenSpace;
        this.role_status = this.spaceData.role;
        this.commonService.spaceDataEmit();
      }
    }
  }

  emitOrCloseHandlers() {
    /**
    * emitter to reset the search form control
    */
    this.commonService.closeWorkspaceEmitter.emit(false);
    /**
     * emitter to close the create group on domain change
     */
    this.commonService.createGroupEmitter.emit({
      is_open: false
    });

    /**
     * emitter to close the starred message
     */
    this.layoutService.starredState.emit(false);
    /**
     * To hide the different workspace call popup if clicked on the push notification
     */
    this.commonService.showOtherWSCallPopup = false;
    /**to not show the unread count when workspace is switched*/
    this.commonService.showUnreadCount = false;
    this.cdRef.detectChanges();
  }

  createNewWorkspace() {
    this.commonService.showWorkspaces = false;
    this.layoutService.createNewWorkspace();
  }

  openInNewWindow(e, domain, index) {
    e.preventDefault();
    e.stopPropagation();
    this.showOverlay = true;
    this.clickedDomain = domain;
    this.newTabMenu = true;
    const ele = document.getElementById('workspace' + index);
    const rect = ele.getBoundingClientRect();
    setTimeout(() => {
      const el = document.getElementById('options-menu');
      if (el) {
        el.style.top = rect.top + 20 + 'px';
        el.style.left = rect.width - 70 + 'px';
      }
    });
  }

  openLinkInNewTab(e,domain) {
    this.showOverlay = false;
    this.commonService.showWorkspaces = false;
    if (domain.workspace != this.userData.workspace) {
      if (this.commonService.isWhitelabelled) {
        window.open(`https://${this.commonApiService.whitelabelConfigurations['full_domain']}/${domain.workspace}`, '_BLANK');
      } else {
          window.open('https://'+ environment.REDIRECT_PATH + '/'+domain.workspace);

      }

      const obj = {
        token: localStorage.getItem('token') || undefined,
        workspace_id: domain.workspace_id,
        access_token: this.tokenData.access_token
      };
      this.commonApiService.switchWorkspace(obj)
        .subscribe(() => {

        });
    }
    e.preventDefault();
    e.stopPropagation();
  }

  closeNewTabMenu(event) {
    if (event && event.value == true) {
      this.newTabMenu = false;
      this.showOverlay = false;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.domainsData, event.previousIndex, event.currentIndex);
    /**
     * storing domain data after drag drop so that the domaindata doesn't change when workspace is changed
     */
    this.sessionService.set('domains', this.domainsData);
  }

  closeWorkspaceBar(event) {
    if (event && event.value == true && !this.commonService.checkClassContains(['business-name', 'header-arrow-image', 'arrow-cont', 'workspace-name', 'arrow-fill'], event.target.classList)) {
      this.closeAndEmitWSBar();
      this.cdRef.detectChanges();
    }
  }

  closeAndEmitWSBar() {
    this.commonService.showWorkspaces = false;
    this.commonService.closeWorkspaceEmitter.emit(false);
  }

  public onSearchBoxKeyDownEvent(event: KeyboardEvent) {
    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      const el = document.getElementById('workspace' + this.active_index);
      if (el) {
        el.click();
        this.workspacesContainer.nativeElement.scrollTop = 0;
      }
    }
  }
  private searchDownArrow() {
    if (this.active_index != this.domainsData.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 53;
      const scrollTop = this.workspacesContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.workspacesContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.workspacesContainer.nativeElement.scrollTop += 53;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 53;
      const scrollTop = this.workspacesContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.workspacesContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.workspacesContainer.nativeElement.scrollTop -= 53;
      }
    }
  }
}
