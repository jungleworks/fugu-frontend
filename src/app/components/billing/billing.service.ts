import { Injectable } from '@angular/core';

import { ApiService } from '../../services/api.service';

@Injectable()
export class BillingService {
  constructor(private api: ApiService) {
  }

  addCard(data) {
    const obj = {
      'url': 'billing/addUserCard',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  getCard(data) {
    const obj = {
      'url': 'billing/getPaymentDetails',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  buyPlan(data) {
    const obj = {
      'url': 'billing/buyPlan',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
  billingSetupIntent(data) {
    const obj = {
      'url': 'billing/getIntentToken',
      'type': 3,
      'body': data
    }; 
    return this.api.getFugu(obj);
  }
}
