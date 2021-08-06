import { Component, OnInit } from "@angular/core";
import { CommonService } from "../../services/common.service";

@Component({
  selector: "app-payments",
  templateUrl: "./payments.component.html",
  styleUrls: ["./payments.component.css"],
})
export class PaymentsComponent implements OnInit {
  constructor(public commonService: CommonService) {}

  ngOnInit(): void {
    window.onmessage = (e) => {
      if (e.data.success) {
        window.open(`${window.location.origin}/${e.data.workspace}`, "_self");
      }
    };
  }
}
