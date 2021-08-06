import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { SessionService } from '../../services/session.service';
import { ContactTypes } from '../../enums/app.enums';
import { InviteInputFieldService } from './invite-input-fields.service';
import { MessageService } from '../../services/message.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: "app-invite-input-fields",
  templateUrl: "./invite-input-fields.component.html",
  styleUrls: ["./invite-input-fields.component.scss"],
})
export class InviteInputFieldsComponent implements OnInit {
  inviteForm;
  all_contacts = [];
  userData;
  spaceData;
  filtered_contacts = [];
  autocomplete_index = 0;
  active_input = 0;
  phonesCountryCodeArray = [
    {
      is_email: true,
      selected_country_code: {
        name: "",
        dialCode: "91",
        countryCode: "in",
      },
    },
    {
      is_email: true,
      selected_country_code: {
        name: "",
        dialCode: "91",
        countryCode: "in",
      },
    },
  ];

  @ViewChild("autocompleteContainer") autocompleteContainer;
  signupText = "";

  constructor(
    private formBuilder: FormBuilder,
    private countryService: CountryService,
    private cdRef: ChangeDetectorRef,
    private sessionService: SessionService,
    private service: InviteInputFieldService,
    private messageService: MessageService,
    public commonService: CommonService
  ) {}

  ngOnInit() {
       this.signupText = this.commonService.findSignupText();
       this.commonService.whiteLabelEmitter.subscribe((data) => {
         this.signupText = this.commonService.findSignupText();
       }); 
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this.userData = this.sessionService.get("loginData/v1")["user_info"];
    this.inviteForm = this.formBuilder.group({
      properties: this.formBuilder.array([]),
    });
    this.inviteForm.get("properties").push(new FormControl());
    this.inviteForm.get("properties").push(new FormControl());
    this.getContacts();
  }

  addFormField(index) {
    if (
      this.inviteForm.value.properties[0] &&
      this.inviteForm.value.properties[index]
    ) {
      this.inviteForm.get("properties").push(new FormControl());
      this.phonesCountryCodeArray.push({
        is_email: true,
        selected_country_code: {
          name: "",
          dialCode: "91",
          countryCode: "in",
        },
      });
    }
  }

  setFormValues(obj, index) {
    this.inviteForm
      .get("properties")
      .controls[index].setValue(obj.email || obj.contact_number);
    const value = this.inviteForm.get("properties").controls[index].value;
    if (value) {
      value.includes("@") || isNaN(value)
        ? (this.phonesCountryCodeArray[index].is_email = true)
        : (this.phonesCountryCodeArray[index].is_email = false);
      if (obj.country_code) {
        this.phonesCountryCodeArray[index].selected_country_code = {
          name: "",
          dialCode: obj.country_code,
          countryCode: this.countryService.dialCodeMap[obj.country_code],
        };
      }
    }
    this.filtered_contacts = [];
  }

  dropDownKeyEvent(event, index) {
    if (event.keyCode == 38) {
      this.autoCompleteUpArrow();
    } else if (event.keyCode == 40) {
      this.autoCompleteDownArrow();
    } else if (event.keyCode == 13) {
      if (this.filtered_contacts.length) {
        document
          .getElementById("autocomplete" + this.autocomplete_index)
          .click();
      }
    } else if (event.keyCode == 27) {
      this.filtered_contacts = [];
    } else {
      this.checkValueChanges(index);
    }
  }
  autoCompleteUpArrow() {
    if (this.autocomplete_index != 0) {
      this.autocomplete_index--;
      const elHeight = 64;
      const scrollTop = this.autocompleteContainer.nativeElement.scrollTop;
      const viewport =
        scrollTop + this.autocompleteContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.autocomplete_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.autocompleteContainer.nativeElement.scrollTop -= 64;
      }
    }
  }
  autoCompleteDownArrow() {
    if (this.autocomplete_index != this.filtered_contacts.length - 1) {
      this.autocomplete_index++;
      // scroll the div
      const elHeight = 64;
      const scrollTop = this.autocompleteContainer.nativeElement.scrollTop;
      const viewport =
        scrollTop + this.autocompleteContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.autocomplete_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.autocompleteContainer.nativeElement.scrollTop += 64;
      }
    }
  }
  checkValueChanges(index) {
    const value = this.inviteForm.get("properties").controls[index].value;
    if (value) {
      value.includes("@") || isNaN(value)
        ? (this.phonesCountryCodeArray[index].is_email = true)
        : (this.phonesCountryCodeArray[index].is_email = false);
      this.filtered_contacts = this.searchContacts(value);
    } else {
      this.filtered_contacts = this.all_contacts.slice();
    }
    this.autocomplete_index = 0;
    this.cdRef.detectChanges();
  }

  searchContacts(name: string) {
    const array = [];
    this.all_contacts.map((object, index) => {
      const temp_obj = {
        full_name: object.full_name,
        index: index,
        email: undefined,
        contact_number: undefined,
        country_code: object.country_code,
        selected: object.selected || false,
      };
      if (
        object.email &&
        object.email.toLowerCase().includes(name.toLowerCase())
      ) {
        temp_obj.email = object.email;
        array.push(temp_obj);
      } else if (
        object.contact_number &&
        object.contact_number.toLowerCase().includes(name.toLowerCase())
      ) {
        temp_obj.contact_number = object.contact_number;
        array.push(temp_obj);
      }
    });
    return array;
  }

  getContacts() {
    const obj = {
      workspace_id: this.spaceData["workspace_id"],
      contact_type: ContactTypes.CONTACTS,
    };
    this.service.getContacts(obj).subscribe((res) => {
      if (res.data.invite_emails) {
        res.data.invite_emails = res.data.invite_emails.map((email) => {
          return {
            full_name: null,
            email: email,
            contact_number: null,
          };
        });
      }
      if (res.data.phone_contacts) {
        this.all_contacts = this.all_contacts.concat(res.data.phone_contacts);
      }
      if (res.data.workspace_contacts) {
        this.all_contacts = this.all_contacts.concat(
          res.data.workspace_contacts
        );
      }
      if (res.data.invite_emails) {
        this.all_contacts = this.all_contacts.concat(res.data.invite_emails);
      }
      const temp_array = [];
      this.all_contacts.map((contact) => {
        if (contact.email && contact.contact_number) {
          if (
            (!contact.email.includes("@fuguchat.com") ||
              !contact.email.includes("@junglework.auth")) &&
            contact.email != this.userData.email
          ) {
            const temp_email = {
              full_name: contact.full_name,
              email: contact.email,
            };
            temp_array.push(temp_email);
          }
          const temp_number = {
            full_name: contact.full_name,
            contact_number:
              contact.contact_number.split("-").length > 1
                ? contact.contact_number.split("-")[1]
                : contact.contact_number,
            country_code:
              contact.contact_number.split("-").length > 1
                ? contact.contact_number.split("-")[0].substring(1)
                : undefined,
          };
          temp_array.push(temp_number);
        } else if (contact.email && contact.email != this.userData.email) {
          const temp_email = {
            full_name: contact.full_name,
            email: contact.email,
          };
          temp_array.push(temp_email);
        } else if (
          contact.contact_number &&
          contact.contact_number != this.userData.contact_number
        ) {
          const temp_number = {
            full_name: contact.full_name,
            contact_number:
              contact.contact_number.split("-").length > 1
                ? contact.contact_number.split("-")[1]
                : contact.contact_number,
            country_code:
              contact.contact_number.split("-").length > 1
                ? contact.contact_number.split("-")[0].substring(1)
                : undefined,
          };
          temp_array.push(temp_number);
        }
      });
      this.all_contacts = temp_array;
      if (this.all_contacts.length) {
        this.sessionService.set("contacts_available", true);
      } else {
        this.sessionService.set("contacts_available", false);
      }
      this.cdRef.detectChanges();
    });
  }

  autocompleteClickOutside(event) {
    if (
      event &&
      event["value"] === true &&
      !this.checkClassContains(["form-control"], event.target.classList)
    ) {
      this.filtered_contacts = [];
    }
  }

  checkClassContains(array, list) {
    let flag = true;
    for (let i = 0; i < array.length; i++) {
      flag = list.contains(array[i]);
      if (flag) {
        return flag;
      }
    }
    return false;
  }

  inviteGuestMember() {
    const obj = {
      workspace_id: this.spaceData["workspace_id"],
    };
    const emailsArray = [],
      phoneArray = [];
    // check if first field is empty.
    if (!this.inviteForm.value.properties[0]) {
      this.messageService.sendAlert({
        type: "danger",
        msg: "Please enter a valid email or phone number.",
        timeout: 3000,
      });
      return false;
    }
    for (let i = 0; i < this.inviteForm.value.properties.length; i++) {
      const item = this.inviteForm.value.properties[i];
      if (item) {
        // if entry is email, push it to email array
        if (this.phonesCountryCodeArray[i].is_email) {
          emailsArray.push(item);
          // if entry is phone, push it to phone array
        } else {
          phoneArray.push({
            contact_number:
              "+" +
              this.phonesCountryCodeArray[i].selected_country_code.dialCode +
              "-" +
              item,
            country_code: this.phonesCountryCodeArray[
              i
            ].selected_country_code.countryCode.toUpperCase(),
          });
        }
      }
    }
    // put emails array into object key emails
    if (emailsArray.length) {
      obj["emails"] = emailsArray;
      if (this.phonesCountryCodeArray[0].is_email) {
        for (let i = 0; i < emailsArray.length; i++) {
          if (!this.commonService.emailValidator(emailsArray[i])) {
            this.messageService.sendAlert({
              type: "danger",
              msg: "Please enter valid email addresses.",
              timeout: 3000,
            });
            return;
          }
        }
      }
    }
    // put phone array into object key numbers
    if (phoneArray.length) {
      obj["contact_numbers"] = phoneArray;
    }

    if (
      (obj["emails"] && obj["emails"].length) ||
      (obj["contact_numbers"] && obj["contact_numbers"].length)
    ) {
      return obj;
    }
  }
}
