import {Component, HostListener, OnInit} from '@angular/core';
import { FuguAppsConfigurationService } from './fugu-apps-configuration.service';
import { SessionService } from '../../services/session.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from '../../services/message.service';
import { CommonService } from '../../services/common.service';

interface IWebhookData {
  label: string;
  full_name?: string;
  show_dropdown?: boolean;
  webhook_id: number;
  webhook_status: number;
}

@Component({
  selector: 'app-fugu-apps-configuration',
  templateUrl: './fugu-apps-configuration.component.html',
  styleUrls: ['./fugu-apps-configuration.component.scss']
})

export class FuguAppsConfigurationComponent implements OnInit {

  userData;
  webhooks_data: Array<IWebhookData> = [];
  currentAppId;
  pageUrl;
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Check if the click was outside the element
    if (targetElement && !event.target['classList'].contains('dropdown-class')) {
      this.closeDropdown();
    }
  }
  constructor(private service: FuguAppsConfigurationService, private route: ActivatedRoute, private router: Router,
              private sessionService: SessionService, private messageService: MessageService, private commonService: CommonService) { }

  ngOnInit() {
    this.route.params.subscribe(res => {
      this.currentAppId = res.appId;
      this.pageUrl = res.pageUrl;
    });
    this.userData = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    const obj = {
      en_user_id: this.userData.en_user_id,
      app_id: this.currentAppId
    };
    this.service.getConfigurations(obj)
    .subscribe((res) => {
      if (res.data) {
        this.webhooks_data = res.data;
      }
    });
  }

  closeDropdown() {
    for (let i = 0; i < this.webhooks_data.length; i++) {
      this.webhooks_data[i].show_dropdown = false;
    }
  }

  editWebhookStatus(index, status) {
    const obj = {
      en_user_id: this.userData.en_user_id,
      webhook_id: this.webhooks_data[index].webhook_id,
      webhook_status: status,
      app_id: this.currentAppId
    };
    this.service.editWebhook(obj)
      .subscribe((res) => {
        this.webhooks_data[index].webhook_status = status;
        // in case of deletion
        if (status == 2) {
          this.webhooks_data.splice(index, 1);
        }
        this.closeDropdown();
        this.messageService.sendAlert({
          type: 'success',
          msg: 'Successful',
          timeout: 3000
        });
      });
  }

  openNewConfiguration() {
    // this.router.navigate(['/apps/details/' + this.currentAppId + '/' + this.pageUrl + '/install']);
    this.router.navigate([this.commonService.currentOpenSpace.workspace + '/apps/details/' + this.currentAppId + '/' + this.pageUrl + '/install']);
  }

  editConfiguration(card) {
    // this.router.navigate(['/apps/details/' + this.currentAppId + '/' + this.pageUrl + '/install/' + card.webhook_id + (card.token ? '/' + card.token : '')]);
    this.router.navigate([this.commonService.currentOpenSpace.workspace + '/apps/details/' + this.currentAppId + '/' + this.pageUrl + '/install/' + card.webhook_id + (card.token ? '/' + card.token : '')]);
  }

}
