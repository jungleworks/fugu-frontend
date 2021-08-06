import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CountryService } from '../../services/country.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-intl-phone-input',
  templateUrl: './intl-phone-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./intl-phone-input.component.scss']
})
export class IntlPhoneInputComponent implements OnInit {
  inputSearchCtrl;
  countriesList = [];
  phone_dropdown_active = false;
  @Input() phoneObj;
  @Output() phoneObjChange: EventEmitter<any> = new EventEmitter();

  constructor(public countryService: CountryService, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.countriesList = this.countryService.getCountries();
    const allCountryList = this.countryService.getCountries();
    this.inputSearchCtrl = new FormControl();
    this.inputSearchCtrl.valueChanges.subscribe(data => {
      if (data) {
        this.countriesList = allCountryList.filter(num =>
          num.dialCode.includes(data) || num.country.toLowerCase().includes(data.toLowerCase())
        );
        this.cdRef.detectChanges();
      } else {
        this.countriesList = [...allCountryList];
      }
    });
  }

  changeDialCode(code) {
    this.phoneObjChange.emit(code);
  }
  onClickOutside(event) {
    if (event && event['value'] === true && this.phone_dropdown_active) {
      this.phone_dropdown_active = false;
    }
  }
  stopDefaultEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }
}
