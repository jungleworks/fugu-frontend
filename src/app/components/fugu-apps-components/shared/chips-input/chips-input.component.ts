import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, ChangeDetectorRef} from '@angular/core';
import {BACKSPACE, DOWN_ARROW, ENTER, UP_ARROW} from '@angular/cdk/keycodes';
import {debounceTime} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import { CommonService } from '../../../../services/common.service';
import { SessionService } from '../../../../services/session.service';
import { chipsType } from '../../../../enums/app.enums';
import { CommonApiService } from '../../../../services/common-api.service';
let all_attendance_members = [];
let scrumUsers = [];
@Component({
  selector: 'app-chips-input',
  templateUrl: './chips-input.component.html',
  styleUrls: ['./chips-input.component.scss']
})
export class ChipsInputComponent implements OnInit {

  @Input() placeholder_text = '';
  selected_chips = [];
  chipType;
  idString;
  labelString;
  selected_chips_object = {};
  scrumUsersId = [];
  @Output() selected_results: EventEmitter<any> = new EventEmitter<any>();
  @Output() selected_chip: EventEmitter<any> = new EventEmitter<any>();
  @Input() set chip_type(data) {
    this.chipType = data;
    //set variable
    if (data == chipsType.CHANNELS) {
      this.idString = 'channel_id';
      this.labelString = 'label';
    } else {
      this.idString = 'user_id';
      this.labelString = 'full_name';
    }
  }
  @Input() set attendance_members(data) {
    if (this.chipType == chipsType.ATTENDANCE_BOT) {
      all_attendance_members = data;
      this.filtered_results = data;
    }
  }
  @Input() set scrumUsersNotAvailable(data) {
    scrumUsers = data;
    this.checkScrumUsers();
  }
  @Input() set selected_data(array) {
    this.selected_chips = array;
    if (array.length) {
      array.map((item) => {
        this.selected_chips_object[item[this.idString]] = item;
      });
    } else {
      this.selected_chips_object = {};
    }
  }
  @Input() lock_id;
  filtered_results = [];
  user_details;
  spaceData;
  search_ctrl;
  autocomplete_index = 0;
  search_results;
  show_autocomplete = false;
  chipsTypeEnum = chipsType;
  @ViewChild('autocompleteContainer') autocompleteContainer;
  @ViewChild('chipComponent', { static: true }) chipComponent;
  @ViewChild('searchInput', { static: true }) searchInput;
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Check if the click was outside the element
    if (targetElement && !this.chipComponent.nativeElement.contains(targetElement)) {
      this.show_autocomplete = false;
    }
  }
  constructor(private commonService: CommonService, private sessionService: SessionService,
    private cdRef: ChangeDetectorRef, private commonApiService: CommonApiService) { }

  ngOnInit() {
    const user_details = this.sessionService.get('user_details_dict')
    this.user_details = user_details[window.location.pathname.split('/')[1]];
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    if (!this.spaceData) {
      const spaceDataAll = <any>this.sessionService.get('spaceDictionary');
      const workspace = window.location.pathname.split('/')[1];
      this.spaceData = spaceDataAll[workspace];
    }
    this.search_ctrl = new FormControl();
    this.search_ctrl.setValue('');
    this.search_ctrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(string => {
        if (string && string.length > 1) {
          this._filter(string);
          this.show_autocomplete = true;
        } else {
          this.show_autocomplete = false;
        }
        this.cdRef.detectChanges();
      });
  }

  onKeyPressEvent(event) {
    switch (event.keyCode) {
      case ENTER:
        if (!this.filtered_results.length) {
          return;
        }
        const el = document.getElementById('chips-autocomplete' + this.autocomplete_index);
        if (el) {
          event.preventDefault();
          el.click();
        }
        break;
      case BACKSPACE:
        if (!this.search_ctrl.value.length && this.selected_chips.length && !(this.chipType == chipsType.GUEST_MEMBERS)) {
          this.removeChip(this.selected_chips[this.selected_chips.length - 1][this.idString]);
        }
        break;
      case UP_ARROW:
        event.preventDefault();
        this.autoCompleteUpArrow();
        break;
      case DOWN_ARROW:
        event.preventDefault();
        this.autoCompleteDownArrow();
        break;
    }
  }

  pushChip(data) {

    switch (this.chipType) {
      case chipsType.ATTENDANCE_BOT:
        this.selected_chips.push({
          user_id: data.user_id,
          user_name: data.user_name,
          full_name: data.full_name,
          email: data.email
        });
        break;
      case chipsType.GUEST_MEMBERS:
        this.selected_chips.push({
          user_id: data.user_id,
          full_name: data.full_name,
          email: data.email
        });
        break;
      case chipsType.MEMBERS:
        this.selected_chips.push({
          user_id: data.user_id,
          full_name: data.full_name,
          email: data.email
        });
        break;
      case chipsType.CHANNELS:
        this.selected_chips.push({
          channel_id: data.channel_id,
          label: data.label
        });
        break;
    }


    this.selected_chips_object[data[this.idString]] = data;
    this.search_ctrl.setValue('');
    this.searchInput.nativeElement.focus();
    this.selected_results.emit(this.selected_chips);
    this.selected_chip.emit(data);
  }

  private _filter(value: string) {
    if (this.chipType == chipsType.ATTENDANCE_BOT) {
      this.filtered_results = all_attendance_members.filter((user) => {
        return (user.full_name.toLowerCase().includes(value.toLowerCase()) && !this.selected_chips_object[user.user_id]);
      });
    } else {
      const obj = {
       en_user_id: this.user_details.en_user_id,
       search_text: value,
       user_role: this.spaceData.role,
       include_all_users: true
     };
     this.commonApiService.search(obj)
       .subscribe(response => {
         this.filtered_results = [];
         if (this.chipType == chipsType.CHANNELS) {
           this.filtered_results = [...response.data.channels, ...response.data.general_groups, ...response.data.open_groups];
         } else {
           this.filtered_results = response.data.users.filter((item) => {
             return (!this.selected_chips_object[item[this.idString]]);
           });
         }
         this.cdRef.detectChanges();
       });
    }
    this.cdRef.detectChanges();
  }

  removeChip(id) {
    for (let i = 0; i < this.selected_chips.length; i++) {
      if (this.selected_chips[i][this.idString] == id) {
        this.selected_chips.splice(i, 1);
      }
    }
    delete this.selected_chips_object[id];
    this.searchInput.nativeElement.focus();
    this.selected_results.emit(this.selected_chips);
  }
  autoCompleteUpArrow() {
    if (this.autocomplete_index != 0) {
      this.autocomplete_index--;
      const elHeight = 50;
      const scrollTop = this.autocompleteContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.autocompleteContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.autocomplete_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.autocompleteContainer.nativeElement.scrollTop -= 50;
      }
    }
  }
  autoCompleteDownArrow() {
    if (this.autocomplete_index != this.filtered_results.length - 1) {
      this.autocomplete_index++;
      // scroll the div
      const elHeight = 50;
      const scrollTop = this.autocompleteContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.autocompleteContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.autocomplete_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.autocompleteContainer.nativeElement.scrollTop += 50;
      }
    }
  }

  checkScrumUsers() {
    if (scrumUsers) {
      scrumUsers.map((user) => {
       this.scrumUsersId.push(parseInt(user.user_id));
     });
     this.selected_chips.map((item) => {
       if (!scrumUsers.length) {
         item['is_scrum_user'] = false;
       }
       if (this.scrumUsersId.includes(item.user_id)) {
         item['is_scrum_user'] = true;
       } else {
         item['is_scrum_user'] = false;
       }
       this.cdRef.detectChanges();
     });
    }
  }
}
