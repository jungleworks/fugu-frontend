import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, Validators, FormControl} from '@angular/forms';
import {CommonService} from '../../../../../services/common.service';
import { MatAutocomplete } from '@angular/material/autocomplete';
import {AttendaceBotService} from '../../attendace-bot.service';
import {SessionService} from '../../../../../services/session.service';
import {MessageService} from '../../../../../services/message.service';
import { debounceTime } from 'rxjs/operators';
import { messageModalAnimation } from '../../../../../animations/animations';
import { chipsType, AttendanceRoles } from '../../../../../enums/app.enums';
import { environment } from '../../../../../../environments/environment';

declare const moment: any;
declare const google: any;
let service;
let map;
let sessionToken;
let currentLocation;

const roles_copy = {
  admin_roles: [],
  hr_roles: []
};
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    messageModalAnimation
  ]
})
export class SettingsComponent implements OnInit, OnDestroy {

  basicSettingsForm;
  sessionDatesForm;
  reportDatesForm;
  weekdays = [
    {
      name: 'Sunday',
      id: 0,
      selected: false
    },
    {
      name: 'Monday',
      id: 1,
      selected: false
    },
    {
      name: 'Tuesday',
      id: 2,
      selected: false
    },
    {
      name: 'Wednesday',
      id: 3,
      selected: false
    },
    {
      name: 'Thursday',
      id: 4,
      selected: false
    },
    {
      name: 'Friday',
      id: 5,
      selected: false
    },
    {
      name: 'Saturday',
      id: 6,
      selected: false
    },
  ];
  showTimePicker = {
    startTime: false,
    punchInReminder: false,
    punchOutReminder: false,
    autoPunchOut: false
  };
  userData;
  all_users_data = [];
  roles_data = {
    admin_roles: [],
    hr_roles: []
  };
  get_settings_subscription;
  polygon_overlay = [];
  drawingManager;
  placeAutoCompleteCtrl;
  permissions_data = {
    punch_in: 'NONE',
    punch_out: 'NONE',
    keep_user_data: true,
    polygon_coordinates: []
  };
  predictionsPlaces = [];
  polygon_coordinates_arr = [];
  updatePermissionPopup;
  chipsTypeEnum = chipsType;
  currentDate;
  @ViewChild('adminInput') adminInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(private cdRef: ChangeDetectorRef, private fb: FormBuilder, private sessionService: SessionService,
              private commonService: CommonService, private service: AttendaceBotService, private messageService: MessageService) { }

  ngOnInit() {
    const user_details = this.sessionService.get('user_details_dict')
    this.userData = user_details[window.location.pathname.split('/')[1]];
    this.userData.role = localStorage.getItem('attendance_role');
    this.getAllUsers();
    this.initForms();
    if (this.userData.role != AttendanceRoles.MANAGER && this.userData.role != AttendanceRoles.USER) {
      this.getBusinessSettings();
    }
    this.placeAutoCompleteCtrl = new FormControl();
    this.currentDate = new Date();
  }

  displaySuggestions(predictions, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: status,
        timeout: 2000
      });
      return;
    }
   this.predictionsPlaces = predictions.filter(places =>
      places.place_id
   );
   this.cdRef.detectChanges();
  }

  generateSessionToken() {
    sessionToken = new google.maps.places.AutocompleteSessionToken();
   }

  async initMap() {
    service = new google.maps.places.AutocompleteService();
    this.placeAutoCompleteCtrl.valueChanges
    .pipe(debounceTime(500))
    .subscribe( async (data) => {
      if (data) {
        try {
        if (!currentLocation) {
          await this.getCurrentPosition();
         }
        } catch {

        } finally {
          if (!sessionToken) {
            this.generateSessionToken();
          }
          service.getQueryPredictions({ input: data, sessionToken: sessionToken,
             location: new google.maps.LatLng(currentLocation.lat, currentLocation.lng), radius: 50000}, this.displaySuggestions.bind(this));
        }

      } else {
        this.predictionsPlaces = [];
        this.cdRef.detectChanges();
      }
    });
     map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 28.539927, lng: 77.9718664},
      zoom: 8
    });
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon']
      }
    });
    this.drawingManager.setMap(map);

    if (this.permissions_data.polygon_coordinates) {

      this.permissions_data.polygon_coordinates.map((item, index) => {
        const converted_polygon = item.map((cord) => {
          return {
            lat: cord.x,
            lng: cord.y
          };
        });
        // Construct the polygon.
        if (this.permissions_data.polygon_coordinates.length - 1 == index) {
          map.setCenter(converted_polygon[0]);
        }
        const polygonShape = new google.maps.Polygon({
          paths: converted_polygon,
        });
        polygonShape.setMap(map);
        this.polygon_coordinates_arr.push(`(${this.convertPolygonCoords(converted_polygon)})`);
        this.polygon_overlay.push(polygonShape);
      });

      this.drawingManager.setDrawingMode(null);
      map.setZoom(15);
      this.cdRef.detectChanges();
    } else {
      /**
       * Fetching user's current location and centering map around it
       */
      try {
        await this.getCurrentPosition();
        map.setCenter(currentLocation);
        map.setZoom(14);
      } catch {

      }
    }

    /**
     * on drawing a polygon this listener is fired
     */
    google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
      this.polygon_overlay.push(polygon);
      let polygon_coordinates = '';
      polygon.getPath().forEach((coord, index) => {
        polygon_coordinates += coord.lat().toString() + ' ';
        polygon_coordinates += coord.lng().toString() + ',';
      });
      polygon_coordinates += polygon_coordinates.split(',')[0];
      this.polygon_coordinates_arr.push(`(${polygon_coordinates})`);
      this.drawingManager.setDrawingMode(null);
    });
  }

  getCurrentPosition() : Promise<any>  {
    currentLocation = {
      lat: null,
      lng: null
    };
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( (position) => {
          currentLocation.lat = position.coords.latitude;
          currentLocation.lng = position.coords.longitude;
          resolve(currentLocation);
        },  (error) => {
          reject('Could not fetch location');
        });
      }
    });
  }

  openSelectedPlace(place) {
    const request = {
      placeId: place.place_id,
      fields: ['geometry'],
      sessionToken: sessionToken
    };
    const placeService = new google.maps.places.PlacesService(map);
    placeService.getDetails(request, this.getPlace.bind(this));
  }

  getPlace(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      const location = {
        lat: null,
        lng: null
      };
      location.lat = place.geometry.location.lat();
      location.lng = place.geometry.location.lng();
      map.setCenter(location);
      map.setZoom(17);
      this.createMarker(place);
      sessionToken = null;
      this.predictionsPlaces = [];
      this.placeAutoCompleteCtrl.reset();
      this.cdRef.detectChanges();
    }
  }

  createMarker(place) {
    const marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
  }

  clearPolygon() {
    this.polygon_coordinates_arr = [];
    this.polygon_overlay.map((poly) => {
      poly.setMap(null);
    });
    this.drawingManager.setOptions({
      drawingControl: true
    });
    this.polygon_overlay = [];
  }

  getScript(source) {
    let script = <any>document.createElement('script');
    const prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    script.onload = script.onreadystatechange = ( _, isAbort ) => {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
        script.onload = script.onreadystatechange = null;
        script = undefined;

        if (!isAbort) { this.initMap(); }
      }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
  }

  getAllUsers() {
    const obj = {
      en_user_id: this.userData.en_user_id,
      user_count: 'ALL_USERS'
    };
    this.service.getAllMembers(obj).subscribe(res => {
      this.all_users_data = res.data.all_users_details;
      this.all_users_data = this.all_users_data.slice();
    });
  }

  initForms() {
    this.basicSettingsForm = this.fb.group({
      work_start_time: ['', [Validators.required]],
      work_hours: ['', [Validators.required]],
      lunch_duration: ['', [Validators.required]],
      punch_in_reminder_time: ['', [Validators.required]],
      punch_out_reminder_time: ['', [Validators.required]],
      auto_punch_out: ['', [Validators.required]]
    });
    this.sessionDatesForm = this.fb.group({
      session_start: ['', [Validators.required]],
      session_end: ['', [Validators.required]]
    });

    this.reportDatesForm = this.fb.group({
      report_start: ['', [Validators.required]],
      report_end: ['', [Validators.required]],
      is_deactivated:  ['', []],
    });

  }
  getBusinessSettings() {
    const obj = {
      en_user_id: this.userData.en_user_id
    };
    this.get_settings_subscription = this.service.getBusinessSettings(obj)
      .subscribe((res) => {
        this.roles_data.admin_roles = res.data.admin_roles || [];
        this.roles_data.hr_roles = res.data.hr_roles || [];
        roles_copy.admin_roles = [...res.data.admin_roles] || [];
        roles_copy.hr_roles = [...res.data.hr_roles] || [];
        this.sessionDatesForm.setValue({
          session_start: moment(res.data.session_start).format('DD MMMM'),
          session_end: moment(res.data.session_end).format('DD MMMM'),
        });
        this.basicSettingsForm.patchValue({
          work_start_time: res.data.work_start_time ? this.service.setStartTimeDateObject(res.data.work_start_time) : '',
          work_hours: res.data.work_hours ? parseFloat((res.data.work_hours / 60).toFixed(1)) : '',
          punch_in_reminder_time: res.data.punch_in_reminder_time,
          punch_out_reminder_time: res.data.punch_in_reminder_time,
          lunch_duration: res.data.lunch_duration,
          auto_punch_out: res.data.auto_punch_out,
        });
        if (res.data.work_days) {
          res.data.work_days.map((day) => {
            this.weekdays[day].selected = true;
          });
        }
        this.permissions_data.punch_in = res.data.config.punch_in_permission;
        this.permissions_data.punch_out = res.data.config.punch_out_permission;
        this.permissions_data.polygon_coordinates = res.data.business_area;
        /**
         * load maps via js so that we don't have to put it in index.html
         */
        if (!window['google'] || !google.maps) {
          this.getScript('https://maps.googleapis.com/maps/api/js?' +
          `key=${environment.GOOGLE_MAPS_KEY}&libraries=drawing,places`);
        } else {
          this.initMap();
        }
        this.cdRef.detectChanges();
      });
  }
  onSessionDateChange(event, type) {
    const d = event.value;
    if (type == 'start') {
      this.sessionDatesForm.controls.session_start.setValue(moment(d).format('DD MMMM'));
    } else if (type == 'end') {
      this.sessionDatesForm.controls.session_end.setValue(moment(d).format('DD MMMM'));
    }
  }
  onReportDateChange(event, type) {
    const d = event.value;
    if (type == 'start') {
      this.reportDatesForm.controls.report_start.setValue(moment(d).format('YYYY-MM-DD'));
    } else if (type == 'end') {
      this.reportDatesForm.controls.report_end.setValue(moment(d).format('YYYY-MM-DD'));
    }
  }
  startTimeChange(data, type) {
    data.formControl.setValue(data.time);
    this.showTimePicker[type] = false;
  }
  onWeekdayChange(day) {
    day.selected = !day.selected;
  }
  openTimePicker(type) {
    for (const key in this.showTimePicker) {
      if (this.showTimePicker.hasOwnProperty(key)) {
        this.showTimePicker[key] = false;
      }
    }
    this.showTimePicker[type] = true;
  }
  onTimePickerClickOutside(event, type) {
    if (event && event.value == true && !this.commonService.checkClassContains(['time-picker-input'], event.target.classList)) {
      this.showTimePicker[type] = false;
    }
  }
  updateSessionDates() {
    const obj = {
      session_start: moment(this.sessionDatesForm.controls.session_start.value).format('YYYY-MM-DD'),
      session_end: moment(this.sessionDatesForm.controls.session_end.value).format('YYYY-MM-DD')
    };
    this.updateSettingsApi(obj);
  }
  updateWorkingWeek() {
    const week = [];
    this.weekdays.forEach((item) => {
      if (item.selected) {
        week.push(item.id);
      }
    });
    const obj = {
      work_days: week
    };
    this.updateSettingsApi(obj);
  }
  updateShiftHours() {
    if (!this.basicSettingsForm.valid) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Please fill all fields',
        timeout: 2000
      });
      return;
    }
    const obj = {
      work_start_time: this.service.returnStartTimeDateObject(this.basicSettingsForm.get('work_start_time').value),
      work_hours: parseInt((this.basicSettingsForm.get('work_hours').value * 60).toFixed(0)),
      lunch_duration: this.basicSettingsForm.get('lunch_duration').value,
      punch_in_reminder_time: this.basicSettingsForm.get('punch_in_reminder_time').value,
      punch_out_reminder_time: this.basicSettingsForm.get('punch_out_reminder_time').value,
      auto_punch_out: this.basicSettingsForm.get('auto_punch_out').value
    };
    this.updateSettingsApi(obj);
  }
  updateRoles() {
    const admin_remove_array = [];
    const roles_data_obj = {};
    const hr_remove_array = [];
    const roles_data_obj_hr = {};

    this.roles_data.admin_roles.map((role) => {
      roles_data_obj[role.user_id] = true;
    });

    roles_copy.admin_roles.map((role) => {
      if (!roles_data_obj[role.user_id]) {
        admin_remove_array.push(role.user_id);
      }
    });

    this.roles_data.hr_roles.map((role) => {
      roles_data_obj_hr[role.user_id] = true;
    });

    roles_copy.hr_roles.map((role) => {
      if (!roles_data_obj_hr[role.user_id]) {
        hr_remove_array.push(role.user_id);
      }
    });

    const obj = {
      admin_ids_remove: admin_remove_array,
      hr_ids_remove: hr_remove_array,
      admin_roles: this.roles_data.admin_roles,
      hr_roles: this.roles_data.hr_roles
    };
    // obj = this.roles_data;
    this.updateSettingsApi(obj);
  }
  updatePermissions() {
    const obj = {
      keep_user_data: this.permissions_data.keep_user_data
    };
    if (['BOTH', 'LOCATION'].includes(this.permissions_data.punch_in) ||
    ['BOTH', 'LOCATION'].includes(this.permissions_data.punch_out)) {
      if (!this.polygon_coordinates_arr.length) {
        this.messageService.sendAlert({
          type: 'danger',
          msg: 'Please select a polygon.',
          timeout: 2000
        });
        return;
      }
      obj['business_area'] = this.polygon_coordinates_arr;
    }
    obj['config'] = {
      punch_in_permission: this.permissions_data.punch_in,
      punch_out_permission: this.permissions_data.punch_out
    };
    this.updateSettingsApi(obj);
    this.updatePermissionPopup = false;
  }
  updateSettingsApi(obj) {
    obj = Object.assign(obj,  {en_user_id: this.userData.en_user_id});
    this.service.updateBusinessSettings(obj)
      .subscribe((res) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
      });
  }
  adminSelectedResults(data) {
    this.roles_data.admin_roles = data;
  }
  HRSelectedResults(data) {
    this.roles_data.hr_roles = data;
  }
  convertPolygonCoords(data) {
    let polygon_string = '';
    data.map((item, index) => {
      polygon_string += item.lat + ' ' + item.lng;
      if (index != data.length - 1) {
        polygon_string += ',';
      }
    });
    return polygon_string;
  }

  fetchAttendanceReport() {
    if(!this.reportDatesForm.valid) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Please fill start date and end date',
        timeout: 2000
      });
      return ;
    }
    const startDate = moment(this.reportDatesForm.controls.report_start.value, "YYYY-MM-DD");
    const endDate =  moment(this.reportDatesForm.controls.report_end.value, "YYYY-MM-DD");
    const difference = endDate.diff(startDate, 'days');

    if(difference > 62) {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Date range cannot be more than 60 days',
        timeout: 3000
      });
      return ;
    }

    const obj = {
      en_user_id: this.userData.en_user_id,
      start_date: moment(this.reportDatesForm.controls.report_start.value).format('YYYY-MM-DD'),
      end_date: moment(this.reportDatesForm.controls.report_end.value).format('YYYY-MM-DD'),
      include_deactivated_users: this.reportDatesForm.controls.is_deactivated.value ? this.reportDatesForm.controls.is_deactivated.value : undefined
    };
     this.service.fetchAttendanceReport(obj).subscribe(
       (response) => {
        this.messageService.sendAlert({
          type: 'success',
          msg: response.message,
          timeout: 2000
        });
       });
  }

  ngOnDestroy(): void {
    if (this.get_settings_subscription) {
      this.get_settings_subscription.unsubscribe();
    }
  }
}
