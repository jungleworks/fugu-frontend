import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { messageModalAnimation } from '../../animations/animations';
import { CommonService } from '../../services/common.service';
import { BillingService } from './billing.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { LoaderService } from '../../services/loader.service';
import { PlanType } from '../../enums/app.enums';
import { environment } from '../../../environments/environment';

declare const Stripe: any;

let appId;
interface UserCardsInterface {
  brand: string;
  expiry_date: string;
  funding: string;
  last4_digits: string;
  source: number;
  class: string;
}

interface TotalPlanInterface {
  savings: number;
  cost: string;
}

let cardNumberElement;
let cardExpiryElement;
let cardCvcElement;
// let stripe_token;
let payment_method;
const style = {
  base: {
    iconColor: '#666EE8',
    color: '#31325F',
    lineHeight: '40px',
    fontWeight: 300,
    fontFamily: 'Helvetica Neue',
    fontSize: '15px',
    '::placeholder': {
      color: '#CFD7E0',
    },
  },
};

const brandCards = {
  'visa': 'fa-cc-visa',
  'mastercard': 'fa-cc-mastercard',
  'american express': 'fa-cc-amex',
  'amex': 'fa-cc-amex',
  'discover': 'fa-cc-discover',
  'diners club': 'fa-cc-diners-club',
  'diners': 'fa-cc-diners-club',
  'jcb': 'fa-cc-jcb',
  'unknown': 'far fa-credit-card'
};

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  animations: [
    messageModalAnimation
  ]
})
export class BillingComponent implements OnInit, AfterViewInit {
  stripe;
  errorMessage;
  elements;
  openCardPopup = true;
  paymentType;
  spaceData;
  billingPlans = [];
  totalUsers = 1;
  planType;
  classBrand;
  planTypeEnum = PlanType;
  userCards = <UserCardsInterface>{};
  totalPlanCost = <TotalPlanInterface>{};
  isMobile = false;
  showCancelButton: boolean = true;
  constructor(public commonService: CommonService, public billingService: BillingService,
    private router: Router, private sessionService: SessionService, private loader: LoaderService,
    private activatedRoute: ActivatedRoute , private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    if (window.location.href.includes('is_mobile')) {
      this.isMobile = true;
    }
    this.activatedRoute.params.subscribe(res => {
      appId = res.appId;
    });
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    if(!this.spaceData) {
      const spaceDataAll = <any>this.sessionService.get('spaceDictionary');
      const workspace = window.location.pathname.split('/')[1];
      this.spaceData = spaceDataAll[workspace];
      this.commonService.currentOpenSpace = this.spaceData;
    }
    this.getCardDetails();
    /*
    * hide the expired popup in this component
    **/
    if (this.commonService.showExpiredPopup) {
      this.commonService.showExpiredPopup = false;
    }
    if (this.spaceData) {
      this.checkForExpiredWorkspace(this.spaceData);
    }

  }

  ngAfterViewInit() {
    this.getScript('https://js.stripe.com/v3/');
  }

  getCardDetails() {
    this.loader.show();
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      app_id: appId
    };
    this.billingService.getCard(obj)
      .subscribe((response) => {
        this.totalUsers = response.data.active_users || 1;
        this.planType = response.data.plan_type;
        this.billingPlans = response.data.billing_plans;
        this.userCards = response.data.user_cards;
        /**
        * mapping to set card brand icon
        */
       if (this.userCards && this.userCards.brand) {
         this.userCards.class = brandCards[this.userCards.brand.toLowerCase()];
       }
        this.openAddCardPopup();
        if (this.billingPlans && this.billingPlans.length) {
          this.paymentType = this.billingPlans[0].id;
          this.calcTotal(this.billingPlans[0]); //by default calculate the total of monthly plan
        }
        this.loader.hide();
      });
  }

  calcTotal(plan) {
    // const savings = Math.round((((price_per_user_monthly - price_per_user_annual) / (price_per_user_monthly)) * 100));
    // this.totalPlanCost.savings = savings;
    switch (plan.plan_type) {
      case 'SUBSCRIPTION':
        this.totalPlanCost.cost = plan.price;
        break;
      case 'PER_USER':
        if (plan.period == 'ANNUALY') {
          this.totalPlanCost.cost = (plan.price * this.totalUsers * 12).toFixed(3);
        } else if (plan.period == 'MONTHLY') {
          this.totalPlanCost.cost = (plan.price * this.totalUsers).toFixed(3);
        }
        break;
    }
  }

  openAddCardPopup(newcard?) {
    Object.keys(this.userCards).length && !newcard ? this.openCardPopup = false : this.openCardPopup = true;
  }

  cancelAddCardPopup() {
    this.openCardPopup = false;
    this.errorMessage = '';
  }

  getScript(source) {
    let script = <any>document.createElement('script');
    const prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    script.onload = script.onreadystatechange = (_, isAbort) => {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = script.onreadystatechange = null;
        script = undefined;

        if (!isAbort) { this.initScript(); }
      }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
  }

  initScript() {
    this.stripe = Stripe(environment.STRIPE_KEY);
    this.elements = this.stripe.elements();

    cardNumberElement = this.elements.create('cardNumber', {
      style: style
    });
    cardNumberElement.mount('#card-number-element');

    cardExpiryElement = this.elements.create('cardExpiry', {
      style: style
    });
    cardExpiryElement.mount('#card-expiry-element');

    cardCvcElement = this.elements.create('cardCvc', {
      style: style
    });
    cardCvcElement.mount('#card-cvc-element');
    cardNumberElement.on('change', (event) => {
      // Switch brand logo
      if (event.brand) {
        this.setBrandIcon(event.brand);
      }

      // this.setOutcome(event);
    });
  }

  setBrandIcon(brand) {
    this.classBrand = brandCards[brand.toLowerCase()];
  }

  setOutcome(result) {
    if (result.error) {
      this.loader.hide();
      this.errorMessage = result.error.message;
      return;
    } else {
      if(result && result.setupIntent && result.setupIntent.payment_method)
      payment_method = result.setupIntent.payment_method;
      const obj = {
        payment_method: payment_method,
        workspace_id: this.spaceData.workspace_id
      };
      this.billingService.addCard(obj).subscribe(() => {
        this.getCardDetails();
        this.openCardPopup = false;
      });
    }
  }

  async addCard() {
    this.loader.show();
    const intentData: any = await this.setupIntentToken();
      if (!intentData.data && intentData.data.client_secret) {
        return;
      }

      this.stripe.handleCardSetup(intentData.data.client_secret, cardNumberElement
      ).then((response) => {
        this.setOutcome(response);
      });
    // this.stripe.createToken(cardNumberElement).then(this.setOutcome.bind(this));

  }

  cancelBillingPage() {
    this.router.navigate(['/' + this.spaceData.workspace ,'/messages']);
  }

  buyPlan() {
    this.loader.show();
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      plan_id: this.paymentType
    };
    this.billingService.buyPlan(obj).subscribe(() => {
      if (!appId) {
        this.spaceData.workspace_status = 'ENABLED';
        this.commonService.currentOpenSpace = this.spaceData;
        // this.sessionService.set('currentSpace', this.spaceData);
      }
      if (this.isMobile) {
        window.location.href = `${window.location.href}&success=true`;
      } else {
        this.router.navigate(['/' + this.spaceData.workspace, '/messages']);
      }
      this.loader.hide();
    });
  }

  checkForExpiredWorkspace(data) {
    if (data.workspace_status == 'EXPIRED') {
      this.showCancelButton = false;
    }
    this.cdRef.detectChanges();
  }

  setupIntentToken() {
    return new Promise((resolve, reject) => {
    const obj = {
      access_token: this.commonService.getCookieSubdomain('token').access_token,
      workspace_id: this.spaceData.workspace_id
    };
    this.billingService.billingSetupIntent(obj).subscribe(
      (res) => {
        this.loader.hide();
          resolve(res.data || {});
      });
  });
}
}
