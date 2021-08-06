import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class FuguAppService {

  constructor(private api: ApiService) { }

  getAllMembers(data) {
    const obj = {
      'url': 'workspace/getAllMembers',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  publishMessageOnFuguBot(data) {
    const obj = {
      'url': 'bot/publishMessageOnFuguBot',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  publishMessageSecretSanta(data) {
    const obj = {
      'url': 'bot/secretSanta',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  editConfiguration(data) {
    const obj = {
      'url': 'workspace/editConfiguration',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getAppDetail(data) {
    const obj = {
      'url': 'apps/get',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }

  installApp(data) {
    const obj = {
      'url': 'apps/install',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  editApp(data) {
    const obj = {
      'url': 'apps/edit',
      'type': 3,
      'body': data
    };
    return this.api.patchFugu(obj);
  }
}
