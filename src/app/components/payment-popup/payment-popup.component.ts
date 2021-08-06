import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { PaymentPopupService } from "./payment-popup.service";
import { CommonService } from "../../services/common.service";
import { debounceTime } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { MessageService } from "../../services/message.service";
import { LoaderService } from "../../services/loader.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-payment-popup",
  templateUrl: "./payment-popup.component.html",
  styleUrls: ["./payment-popup.component.scss"],
})
export class PaymentPopupComponent implements OnInit {
  @Output()
  closePaymentPopup: EventEmitter<any> = new EventEmitter<any>();
  usersToPay;
  spaceData;
  priceInfo:any = {
    totalPrice: 0
  };
  constructor(
    public paymentService: PaymentPopupService,
    public commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private messageService: MessageService,
    private loader: LoaderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.spaceData = this.commonService.currentOpenSpace;
  }
  getPrice() {
    if (typeof(Number(this.usersToPay)) != 'number') {
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Please enter a valid number',
        timeout: 3000
      });
    }
    const obj = {
      user_count: Number(this.usersToPay),
      en_user_id: this.commonService.userDetails.en_user_id,
      price_type: 1,
      workspace_id: this.spaceData.workspace_id,
    };
    this.paymentService
      .getPrice(obj)
      .pipe(debounceTime(1000))
      .subscribe((res) => {
        this.priceInfo = res.data;
        this.cdRef.detectChanges();
      });
  }
  payment() {
    this.loader.show();
    const obj = {
      amount: this.priceInfo.totalPrice,
      user_count: this.priceInfo.no_of_users,
      currency: this.priceInfo.currency,
      en_user_id: this.commonService.userDetails.en_user_id,
      price_type: 1,
      workspace_id: this.spaceData.workspace_id,
      domain: window.location.hostname.split('.').splice(1, 2).join('.')
    };
    if (window.location.hostname == 'localhost') {
      obj.domain = environment.LOCAL_DOMAIN
    }
    this.paymentService
      .initiatePayment(obj)
      .pipe(debounceTime(1000))
      .subscribe((res) => {
        // window.open(res.data.redirect_url, '_self');
        this.router.navigate(['/payment']);
        this.commonService.paymentUrl = res.data.redirect_url;
        this.loader.hide();
        this.closePaymentPopup.emit();
        this.cdRef.detectChanges();
      });
  }
}
