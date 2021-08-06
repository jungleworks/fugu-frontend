import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
@Injectable()
export class WhatsNewService {
  constructor(private api: ApiService) {
  }

  getWhatsNew(data) {
    const obj = {
      'url': 'fugu/whatsNewFeature',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }

}
