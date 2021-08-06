import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { RouterModule, Routes } from '@angular/router';
import { FuguAppsComponent } from '../../components/fugu-apps/fugu-apps.component';
import { FuguAppsDetailsComponent } from '../../components/fugu-apps-details/fugu-apps-details.component';
import { FuguAppsInstallationComponent } from '../../components/fugu-apps-installation/fugu-apps-installation.component';
import { FuguAppService } from '../../services/fugu-apps.service';
import { FuguAppHeaderComponent } from '../../components/fugu-app-header/fugu-app-header.component';
import { AttendaceBotService } from '../../components/fugu-apps-components/attendance-bot/attendace-bot.service';
import {FuguAppsPopupComponent} from '../../components/fugu-apps-popup/fugu-apps-popup.component';
import {FuguAppsConfigurationComponent} from '../../components/fugu-apps-configuration/fugu-apps-configuration.component';
import { FuguAppsConfigurationService } from '../../components/fugu-apps-configuration/fugu-apps-configuration.service';
import { SecretSantaComponent } from '../../components/secret-santa/secret-santa.component';

const routes: Routes = [
  {
    path: '',
    component: FuguAppsComponent,
    children: [
      {
        path: '',
        component: FuguAppsPopupComponent
      },
      {
        path: 'details/:appId',
        component: FuguAppsDetailsComponent
      },
      {
        path: 'details/:appId/:pageUrl/install',
        component: FuguAppsInstallationComponent
      },
      {
        path: 'details/:appId/:pageUrl/install/:webhookId',
        component: FuguAppsInstallationComponent
      },
      {
        path: 'details/:appId/:pageUrl/install/:webhookId/:token',
        component: FuguAppsInstallationComponent
      },
      {
        path: 'details/:appId/configuration/:pageUrl',
        component: FuguAppsConfigurationComponent
      },
      {
        path: 'attendance',
        loadChildren: () => import('../attendance-bot/attendance-bot.module').then(m => m.AttendanceBotModule)
      }
    ]
  },
];

@NgModule({
  declarations: [
    FuguAppsComponent,
    FuguAppsDetailsComponent,
    FuguAppsInstallationComponent,
    FuguAppHeaderComponent,
    FuguAppsPopupComponent,
    FuguAppsConfigurationComponent,
    SecretSantaComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: [FuguAppService, AttendaceBotService, FuguAppsConfigurationService]
})
export class FuguAppsModule { }
