import { Injectable } from '@angular/core';

import {ApiService} from '../../services/api.service';

@Injectable()
export class FuguAppsConfigurationService {
  constructor(private api: ApiService) {
  }

  getConfigurations(data) {
    const obj = {
      'url': 'webhook/get',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }

  editWebhook(data) {
    const obj = {
      'url': 'webhook/edit',
      'type': 3,
      'body': data
    };
    return this.api.patchFugu(obj);
  }
}
