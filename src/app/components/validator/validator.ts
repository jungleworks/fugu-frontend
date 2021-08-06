/**
 * Created by cl-macmini-10 on 19/09/16.
 */
import { Component, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {ValidationService} from '../../services/validation.service';
@Component({
    selector: 'app-validator',
    template: `<div *ngIf="errorMessage" style="font-size: 12px;color: red;">{{errorMessage}}</div>`,
    providers: [ValidationService]
})
export class ValidatorComponent {
    @Input() control: FormControl;
    constructor() { }
    get errorMessage() {
      for (const propertyName in this.control.errors) {
        if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched && this.control.value) {
            return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
        }
      }
      return null;
    }
}
