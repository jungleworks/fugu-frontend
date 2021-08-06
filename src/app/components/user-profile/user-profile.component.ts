import {
  ChangeDetectionStrategy,
  ChangeDetectorRef, Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, Input
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { CommonService } from '../../services/common.service';
import { debounceTime } from 'rxjs/operators';
import {Role} from '../../enums/app.enums';
import { UserProfileService } from './user-profile.service';
import { MessageService } from '../../services/message.service';
import { LoaderService } from '../../services/loader.service';
import { messageModalAnimation, profileImageEnlarge } from '../../animations/animations';
import { CommonApiService } from '../../services/common-api.service';
interface UserProfile {
  user_image;
  user_image_url;
  email;
  contact_number;
  manager;
  designation;
  department;
}
interface IManagerData {
  full_name: string;
  fugu_user_id: number;
}
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  animations: [
    messageModalAnimation,
    profileImageEnlarge
  ]
})
export class UserProfileComponent implements OnInit {
  selected_country_code = {
    'name': '',
    'dialCode': '91',
    'countryCode': 'in'
  };
  profileForm;
  spaceData;
  edit = false;
  showDeleteConfirmationPopup = false;
  is_owner_admin = false;
  editLocation = false;
  editHR = false;
  profileInfo: UserProfile = <UserProfile>({});
  otpRequestForm;
  otpForm;
  active_index = 0;
  all_members_data = [];
  all_members_search_results = [];
  user_details;
  showImageLayer = false;
  view_photo_options = false;
  otp_requested = false;
  view_profile_enlarged = false;
  phoneChangePopup = false;
  RoleStatusEnum = Role;
  roleStatus = Role.isUser;
  managerData = <IManagerData>{
    full_name: '',
    fugu_user_id: null
  };
  previousManagerData = <IManagerData>{};
  managerDropupOpen = false;
  managerSearchCtrl;
  animationHeightX;
  animationHeightY;
  cropObj: any = {};
  // @Input()
  // set params(val) {
  //   this.spaceData = this.sessionService.get('currentSpace');
  // }
  showCroppingPopup = false;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  @ViewChild('managerScrollContainer') managerScrollContainer: ElementRef;
  constructor(private loader: LoaderService, private formBuilder: FormBuilder, private sessionService: SessionService,
    public commonService: CommonService,
    private commonApiService: CommonApiService,
    public service: UserProfileService, private messageService: MessageService, private changeDetectorRef: ChangeDetectorRef, ) { }
  @Output()
  closeProfile: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  userDataUpdate: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit() {
    this.user_details = this.commonService.userDetailDict[
      window.location.pathname.split('/')[1]
    ];
    this.otpRequestForm = this.formBuilder.group({
      'phone': ['', [Validators.required]]
    });
    this.otpForm = this.formBuilder.group({
      'otp_1': ['', [Validators.required]],
      'otp_2': ['', [Validators.required]],
      'otp_3': ['', [Validators.required]],
      'otp_4': ['', [Validators.required]],
      'otp_5': ['', [Validators.required]],
      'otp_6': ['', [Validators.required]]
    });
    this.profileForm = this.formBuilder.group({
      'full_name': ['', [Validators.required]],
      // 'phone': ['', [Validators.required]],
      'location': ['', [Validators.required]],
      'designation': ['', [Validators.required]],
      'department': ['', [Validators.required]],
    });
    this.profileInfo.user_image = '';
    // this.spaceData = this.sessionService.get('currentSpace');
    this.managerSearchCtrl = new FormControl();
    this.spaceData = this.commonService.currentOpenSpace;
    this.managerSearchCtrl.valueChanges.pipe(debounceTime(300)).subscribe((data) => {
      this.active_index = 0;
      if (this.managerScrollContainer) {
        this.managerScrollContainer.nativeElement.scrollTop = 0;
      }
      if (data && data.length > 1) {
        this.searchManager(data);
      } else {
        this.all_members_search_results = JSON.parse(
          JSON.stringify(this.all_members_data)
        );
        this.all_members_search_results = this.all_members_search_results.filter(
          (member) => this.spaceData.fugu_user_id != member.fugu_user_id
        );
      }
      this.changeDetectorRef.detectChanges();
    });
    this.roleStatus = this.spaceData.role;
    this.is_owner_admin = this.roleStatus == Role.isOwner || this.roleStatus == Role.isAdmin;
    this.commonService.spaceDataEmitter.subscribe(() => {
      this.spaceData = this.commonService.currentOpenSpace;
    });
    this.fetchUserDetails();
  }
  searchManager(name) {
    const obj = {
      en_user_id: this.user_details.en_user_id,
      search_text: name,
      no_guest_users: true,
      include_current_user: true
    };
    this.commonApiService.searchUsersInGroup(obj).subscribe((response) => {
      this.all_members_search_results = response.data.users.filter(
        (member) => this.spaceData.fugu_user_id != member.fugu_user_id
      );
      this.changeDetectorRef.detectChanges();
    });
  }
  getAllMembers() {
    if (this.all_members_data.length) {
      this.managerDropupOpen = true;
      return;
    }
    const all_members_obj = {
      workspace_id: this.spaceData.workspace_id,
      user_status: 'ENABLED',
      user_type: 'ALL_MEMBERS',
      page_start: 0
    };
    this.service.getAllMembers(all_members_obj).subscribe((res) => {
      this.all_members_data = res.data.all_members;
      this.all_members_search_results = JSON.parse(
        JSON.stringify(this.all_members_data)
      );
      this.all_members_search_results = this.all_members_search_results.filter(
        (member) => this.spaceData.fugu_user_id != member.fugu_user_id
      );
      this.changeDetectorRef.detectChanges();
      this.managerDropupOpen = true;
      this.changeDetectorRef.detectChanges();
    });
  }
  fetchUserDetails() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.edit = false;
    this.editLocation = false;
    this.editHR = false;
    const obj = {
      fugu_user_id: encodeURIComponent(this.spaceData.fugu_user_id),
      workspace_id: this.spaceData.workspace_id
    };
    this.commonApiService.getUserInfo(obj)
      .subscribe(response => {
        if (response.statusCode === 200) {
          this.profileInfo = response.data;
          this.profileForm.setValue({
            full_name: response.data.full_name ? response.data.full_name : response.data.user_name,
            // phone: response.data.contact_number,
            location: response.data.location,
            designation: response.data.designation,
            department: response.data.department
          });
          this.managerData = response.data.manager_data;
          this.managerSearchCtrl.setValue(this.managerData.full_name);
          this.previousManagerData = response.data.manager_data;
          this.changeDetectorRef.detectChanges();
        }
      });
  }


  async onFileSelect(event) {
    this.showCroppingPopup = true;
    const file = event.target.files;
    this.cropObj.file = event.target.files[0];
    this.cropObj.event = event;
    this.cropObj.isAspectRatio = true;
    this.cropObj.src = await this.commonService.getImageUrlToCrop(file);
  }

  closeCropPopupFunc() {
    this.showCroppingPopup = false;
    /** reset the file input so that cropping popup can be shown next time without refresh */
    this.fileInput.nativeElement.value = '';
  }

  saveCroppedImage(file) {
    this.loader.show();
    const formdata: FormData = new FormData();
    if (file) {
      formdata.append('full_name', this.commonService.userDetails.full_name);
      formdata.append('fugu_user_id', this.spaceData.fugu_user_id);
      formdata.append('workspace_id', this.spaceData.workspace_id);
      formdata.append('file', (file));
    }
    this.service.editUserInfo(formdata).subscribe(
      response => {
        this.showCroppingPopup = false;
        try {
          if (response.data) {
            this.fetchUserDetails();
            this.messageService.sendAlert({
              type: 'success',
              msg: response.message,
              timeout: 2000
            });
            const data = this.commonService.currentOpenSpace;
            data['user_image'] = response.data['user_image'];
            this.commonService.currentOpenSpace = data;
            this.spaceData = data;
            this.userDataUpdate.emit(this.spaceData);
            /* emitter to update the profile picture in header immediately */
            this.commonService.updateHeaderEmitter.emit(true);
            this.loader.hide();
            this.changeDetectorRef.detectChanges();
          }
        } catch (e) {
          console.log(e);
        }

      });
    this.fileInput.nativeElement.value = '';
  }
  saveProfile() {
    let obj;
    if (this.is_owner_admin) {
      obj = {
        full_name: this.profileForm.value.full_name.trim(),
        // contact_number: this.profileForm.value.phone.trim() ? this.profileForm.value.phone.trim() : undefined,
        location: this.profileForm.value.location.trim() ? this.profileForm.value.location.trim() : undefined,
        designation: this.profileForm.value.designation.trim()
          ? this.profileForm.value.designation.trim()
          : undefined,
        department: this.profileForm.value.department.trim()
          ? this.profileForm.value.department.trim()
          : undefined,
        fugu_user_id: this.spaceData.fugu_user_id,
        workspace_id: this.spaceData.workspace_id,
        manager_data:
          this.managerSearchCtrl.value && this.managerData.fugu_user_id
            ? this.managerData
            : undefined
      };
    } else {
      obj = {
        full_name: this.profileForm.value.full_name.trim(),
        // contact_number: this.profileForm.value.phone.trim() ? this.profileForm.value.phone.trim() : undefined,
        location: this.profileForm.value.location.trim() ? this.profileForm.value.location.trim() : undefined,
        fugu_user_id: this.spaceData.fugu_user_id,
        workspace_id: this.spaceData.workspace_id
      };
    }
    this.service.editUserInfo(obj)
      .subscribe((response) => {
        if (response.statusCode == 200) {
          this.profileForm.setValue({
            full_name: this.profileForm.value.full_name.trim(),
            // phone: this.profileForm.value.phone.trim(),
            location: this.profileForm.value.location.trim(),
            designation: this.profileForm.value.designation.trim(),
            department: this.profileForm.value.department.trim()
          });
          this.messageService.sendAlert({
            type: 'success',
            msg: response.message,
            timeout: 2000
          });
          this.edit = false;
          this.editLocation = false;
          this.editHR = false;
          this.spaceData = response.data;
          // const data = <any>this.sessionService.get('currentSpace');
          const data = this.commonService.currentOpenSpace;
          data['full_name'] = response.data['full_name'];
          data['location'] = response.data['location'];
          data['contact_number'] = response.data['contact_number'];
          data['designation'] = response.data['designation'];
          data['department'] = response.data['department'];
          // this.sessionService.set('currentSpace', data);
          this.commonService.currentOpenSpace = data;
          this.spaceData = data;
          this.commonService.userDetails.full_name = response.data.full_name;
          this.userDataUpdate.emit(this.spaceData);
        }
      }
      );
  }
  profileOptionsClickOutside(event) {
    if (event && event.value == true && !this.checkClassContains(['image-layer'], event.target.classList)) {
      this.view_photo_options = false;
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
  requestOtp() {
    this.loader.show();
    const obj = {
      contact_number: '+' + this.selected_country_code.dialCode + '-' + this.otpRequestForm.value.phone,
      country_code: this.selected_country_code.countryCode.toUpperCase()
    };
    this.service.phoneOtpRequest(obj).subscribe((response) => {
      this.otp_requested = true;
      this.loader.hide();
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  submitOtp() {
    this.loader.show();
    const obj = {
      otp: this.otpForm.value.otp_1 + this.otpForm.value.otp_2 + this.otpForm.value.otp_3
        + this.otpForm.value.otp_4 + this.otpForm.value.otp_5 + this.otpForm.value.otp_6
    };
    this.service.otpSubmitRequest(obj).subscribe((response) => {
      this.phoneChangePopup = false;
      this.otpRequestForm.reset();
      this.otpForm.reset();
      this.otp_requested = false;
      this.phoneChangePopup = false;
      this.profileInfo.contact_number = response.data.contact_number;
      this.loader.hide();
      this.messageService.sendAlert({
        type: 'success',
        msg: response.message,
        timeout: 2000
      });
      this.changeDetectorRef.detectChanges();
    });
  }

  onOTPpaste(e, lastBox) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!/^[0-9]*$/.test(text)) {
      return false;
    }
    const otp = text.slice('');
    if (otp.length) {
      this.otpForm.setValue({
        otp_1: otp[0],
        otp_2: otp[1],
        otp_3: otp[2],
        otp_4: otp[3],
        otp_5: otp[4],
        otp_6: otp[5],
      });
      lastBox.focus();
    }
  }

  removeUserProfilePhoto() {
    const obj = {
      remove_profile_image: true,
      workspace_id: this.spaceData.workspace_id,
      fugu_user_id: this.spaceData.fugu_user_id
    };
    this.service.deleteUserInfo(obj)
      .subscribe((response) => {
          this.profileInfo.user_image = '';
          this.profileInfo.user_image_url = '';
          this.showDeleteConfirmationPopup = false;
          // const data = <any>this.sessionService.get('currentSpace');
          const data = this.commonService.currentOpenSpace;
          this.spaceData = data;
          data['user_image'] = '';
          this.userDataUpdate.emit(this.spaceData);
          this.commonService.updateHeaderEmitter.emit(true);
          this.changeDetectorRef.detectChanges();
    });
  }

  allowNumberInput(evt) {
    if ((evt.which < 48 || evt.which > 57) && evt.which != 13) {
      evt.preventDefault();
    }
  }
  nextFocus(event, nextEl, prevEl) {
    const key = event.keyCode;
    if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105) || key === 39) {
      // for moving forward
      nextEl.focus();
    } else if (key === 8 || key === 46 || key === 37) {
      // for moving backwards
      prevEl.focus();
    }
  }
  onInputNameClick() {
    this.edit = true;
    this.editLocation = false;
    this.editHR = false;
    document.getElementById('name-input').focus();
  }
  onInputLocationClick() {
    this.editLocation = true;
    this.edit = false;
    this.editHR = false;
    document.getElementById('input-location').focus();
  }
  onInputHRClick() {
    this.editHR = true;
    this.editLocation = false;
    this.edit = false;
    document.getElementById('input-designation').focus();
  }

  managerDropupClickOutside(event) {
    if (
      event &&
      event.value == true &&
      !this.checkClassContains(
        ['manager-input', 'manager-card'],
        event.target.classList
      )
    ) {
      this.managerDropupOpen = false;
    }
  }

  public onManagerBoxKeyDownEvent(event: KeyboardEvent) {
    if (!this.managerDropupOpen) {
      return;
    }
    if (event.keyCode == 38) {
      this.searchUpArrow();
    } else if (event.keyCode == 40) {
      this.searchDownArrow();
    } else if (event.keyCode == 13) {
      const el = document.getElementById('manager-card' + this.active_index);
      if (el) {
        el.click();
      }
      this.managerScrollContainer.nativeElement.scrollTop = 0;
    }
  }

  private searchDownArrow() {
    if (this.active_index != this.all_members_search_results.length - 1) {
      this.active_index++;
      // scroll the div
      const elHeight = 59;
      const scrollTop = this.managerScrollContainer.nativeElement.scrollTop;
      const viewport =
        scrollTop + this.managerScrollContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.managerScrollContainer.nativeElement.scrollTop += 59;
      }
    }
  }

  private searchUpArrow() {
    if (this.active_index != 0) {
      this.active_index--;
      const elHeight = 59;
      const scrollTop = this.managerScrollContainer.nativeElement.scrollTop;
      const viewport =
        scrollTop + this.managerScrollContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.active_index;
      if (elOffset < scrollTop || elOffset + elHeight > viewport) {
        this.managerScrollContainer.nativeElement.scrollTop -= 59;
      }
    }
  }

  onManagerSelected(user) {
    this.managerData = {
      full_name: user.full_name,
      fugu_user_id: user.fugu_user_id
    };
    this.managerDropupOpen = false;
    this.managerSearchCtrl.setValue(user.full_name);
  }
  openPhotoOptions(e) {
    this.view_photo_options = true;
    const rect = e.target.getBoundingClientRect();
    let left = e.clientX - rect.left;
    const top = e.clientY - rect.top;
    /**
     * check if menu is overflowing out of screen, then calculate how much much is overflowing and reduce that
     * amount from left, extra buffer giving for margin from screen.
     */
    if (e.clientX + 153 > document.body.clientWidth) {
      left -= (e.clientX + 160) - document.body.clientWidth;
    }
    const rootStyle = document.getElementsByTagName('html')[0].style;
    rootStyle.setProperty('--profile-options-left', left + 'px');
    rootStyle.setProperty('--profile-options-top', top + 'px');
  }
  viewEnlargedImage() {
    if (!this.profileInfo.user_image && !this.profileInfo.user_image_url) {
      return;
    }
    const profile_image_cont = document.getElementById('user-profile-image');
    const profile_image_cont_bounds = profile_image_cont.getBoundingClientRect();
    this.animationHeightX =  profile_image_cont_bounds['x'] + (profile_image_cont_bounds['width'] / 2)  - (window.innerWidth / 2) + 'px';
    this.animationHeightY = profile_image_cont_bounds['y'] + (profile_image_cont_bounds['height'] / 2) - (window.innerHeight / 2)  + 'px';
    this.view_profile_enlarged = true;
  }
}
