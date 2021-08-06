import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import {ApiService} from '../../services/api.service';

@Injectable()
export class PaymentPopupService {
  constructor(private api: ApiService) {
  }

  getPrice(data) {
    const obj = {
      'url': 'calculateInviteTotalPrice',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
  initiatePayment(data) {
    const obj = {
      'url': 'payment/initiatePayment',
      'type': 2,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
