import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {SettingsPermissionsService} from './settings-permissions.service';
import {SessionService} from '../../services/session.service';
import {MessageService} from '../../services/message.service';
import {CommonService} from '../../services/common.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {LayoutService} from '../layout/layout.service';
import { Role } from '../../enums/app.enums';
import {debounceTime, takeWhile} from 'rxjs/operators';
import { messageModalAnimation } from '../../animations/animations';
import { CommonApiService } from '../../services/common-api.service';

interface DoNotDisturb {
  is_checked: boolean;
  slot_start: string;
  slot_end: string;
}
interface ChannelDetails {
  channel_id: number;
  chat_type: number;
  channel_image: string;
  label: string;
  custom_label: string;
  members_info: any;
}


let stopMembersHit = false;
let stopGuestsHit = false;
let page_size_count;


@Component({
  selector: 'app-settings-permissions',
  templateUrl: './settings-permissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./settings-permissions.component.scss'],
  animations: [
    messageModalAnimation
  ]
})

export class SettingsPermissionsComponent implements OnInit {
  @ViewChild('settings1', { static: true }) settings1: TemplateRef<any>;
  @ViewChild('settings2', { static: true }) settings2: TemplateRef<any>;
  @ViewChild('settings3', { static: true }) settings3: TemplateRef<any>;
  @ViewChild('settings4', { static: true }) settings4: TemplateRef<any>;
  @ViewChild('settings5', { static: true }) settings5: TemplateRef<any>;
  @ViewChild('settings6', { static: true }) settings6: TemplateRef<any>;
  @ViewChild('settings7', { static: true }) settings7: TemplateRef<any>;
  @ViewChild('settings8', { static: true }) settings8: TemplateRef<any>;
  @ViewChild('settings9', { static: true }) settings9: TemplateRef<any>;
  @ViewChild('settings10', { static: true }) settings10: TemplateRef<any>;
  @ViewChild('settings11', { static: true }) settings11: TemplateRef<any>;
  @ViewChild('permissions1', { static: true }) permissions1: TemplateRef<any>;
  @ViewChild('permissions2', { static: true }) permissions2: TemplateRef<any>;
  @ViewChild('permissions3', { static: true }) permissions3: TemplateRef<any>;
  @ViewChild('permissions4', { static: true }) permissions4: TemplateRef<any>;
  @ViewChild('permissions5', { static: true }) permissions5: TemplateRef<any>;
  @ViewChild('permissions6', { static: true }) permissions6: TemplateRef<any>;
  @ViewChild('permissions7', { static: true }) permissions7: TemplateRef<any>;
  @ViewChild('permissions8', { static: true }) permissions8: TemplateRef<any>;
  @ViewChild('permissions9', { static: true }) permissions9: TemplateRef<any>;
  @ViewChild('defaultChannels') defaultChannelsInput;
  @ViewChild('publicChannelsSearchbox') publicChannelsSearchbox;
  @ViewChild('defaultManagerSearchbox') defaultManagerSearchbox;
  @ViewChild('ownerAutocomplete') ownerAutocompleteContainer;
  @ViewChild('settingsAndPermissionsTab', { static: true }) settingsAndPermissionsTab: TemplateRef<any>;
  @ViewChild('members', { static: true }) members: TemplateRef<any>;
  @ViewChild('guests', { static: true }) guests: TemplateRef<any>;

  @Output()
    closeSettings: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('settings_option') selected_tab;
  @Input('currentChannelId') currentChannelId;
  @Input()
  set is_settings_open_header(data) {
    /**
     * scroll to the workspace name section when clicked from the header add image option
     */
    if (data) {
      setTimeout(() => {
        let element = document.getElementById('collapse_5');
        element.scrollIntoView();
      }, 200);
    }
  }
  @ViewChild('membersContainer') set membersContainer(usersContent: ElementRef) {
    if (usersContent) {
      this.usersEl = usersContent;
      if (this.allMembers && this.allMembers.length && this.totalCountMembers > this.allMembers.length &&
        (this.searchCtrl.value == '' || this.searchCtrl.value == null)) {
        document.getElementById('members-container').addEventListener('scroll', (event) => {
          if (this.totalCountMembers > this.allMembers.length && this.bodyScrollDone) {
            this.checkPaginationOfUsers();
          } else {
            event.preventDefault();
          }
        });
      }
    }
  }
  @ViewChild('guestContainer') set guestContainer(usersContentGuest: ElementRef) {
    if (usersContentGuest) {
      this.guestEl = usersContentGuest;
      if (this.allGuestMembers && this.allGuestMembers.length && this.totalCountMembers > this.allGuestMembers.length &&
        (this.searchGuestsCtrl.value == '' || this.searchGuestsCtrl.value == null)) {
        document.getElementById('guest-container').addEventListener('scroll', (event) => {
          if (this.totalCountMembers > this.allGuestMembers.length && this.bodyScrollDone) {
            this.checkPaginationOfGuests();
          } else {
            event.preventDefault();
          }
        });
      }
    }
  }
  @ViewChild('settingsContainer') set settingsContainer(settingsContainer: ElementRef) {
    this.containerEl = settingsContainer;
    document.getElementById('settings-container').addEventListener('scroll', (event) => {
      if ((this.containerEl.nativeElement.scrollTop + this.containerEl.nativeElement.clientHeight) >= this.containerEl.nativeElement.scrollHeight) {
        this.bodyScrollDone = true;
      } else {
        this.bodyScrollDone = false;
      }
      this.cdRef.detectChanges();
    });
  }
  @ViewChild('fileInput') fileInput: ElementRef;

  inviteContactObj;
  allMembers;
  showPaymentPopup = false;
  allGuestMembers;
  totalCountMembers;
  bodyScrollDone = false;
  containerEl;
  usersEl;
  guestEl;
  searchCtrl;
  searchGuestsCtrl;
  ownerSearchCtrl;
  roleEnum = Role;
  searchPublicChannel;
  searchManagers;
  transferOwnershipForm;
  temp_new_owner = {};
  spaceData;
  config_data_copy;
  members_list;
  changeSpaceNameForm;
  changeSpacePopup;
  members_option = 'activated';
  guest_option = 'activated';
  deleteGuestPopup = false;
  page_start = 0;
  isMemberFetched = false;
  isGuestFetched = false;
  deactivatedMembers;
  activatedMembers;
  deactivatedGuests;
  activatedGuests;
  guest_settings = {
    members: [],
    channels: [],
    guest_id: '',
    lock_id: ''
  };
  tabs_array = [
    {
      name: 'Settings',
      key: 'settings_options',
      value: 'settingsAndPermissionsTab'
    },
    {
      name: 'Permissions',
      key: 'permissions_options',
      value: 'settingsAndPermissionsTab'
    },
    {
      name: 'Members',
      key: 'members',
      value: 'members'
    },
    // {
    //   name: 'Guests',
    //   key: 'guests',
    //   value: 'guests'
    // }
  ];
  options = {
    settings_options: [
      {
        name: 'Workspace Signup Mode',
        template: 'settings1',
        expanded: false
      },
      {
        name: 'Default Manager',
        template: 'settings2',
        expanded: false
      },
      {
        name: 'Default Channels',
        template: 'settings3',
        expanded: false
      },
      {
        name: 'Message Deletion',
        template: 'settings4',
        expanded: false
      },
      {
        name: 'Edit Message',
        template: 'settings5',
        expanded: false
      },
      {
        name: 'Workspace Icon',
        template: 'settings6',
        no_close_btn: true,
        expanded: true
      },
      {
        name: 'Workspace Name',
        template: 'settings7',
        hidden: false,
        role: Role.isOwner,
        no_close_btn: true,
        expanded: true
      },
      {
        name: 'Email Display',
        template: 'settings8',
        expanded: false
      },
      {
        name: 'Phone Display',
        template: 'settings9',
        expanded: false
      }
    ],
    permissions_options: [
      {
        name: 'Messaging',
        template: 'permissions1',
        hidden: true,
        expanded: false
      },
      {
        name: 'Invitations',
        template: 'permissions2',
        expanded: false
      },
      {
        name: 'Channel Management',
        template: 'permissions3',
        hidden: true,
        expanded: false
      },
      {
        name: 'Delete and Edit Message',
        template: 'permissions4',
        expanded: false
      },
      {
        name: 'Create one to one chat',
        template: 'permissions5',
        expanded: false
      },
      {
        name: 'Create group',
        template: 'permissions6',
        expanded: false
      },
      {
        name: 'Create Space',
        template: 'permissions7',
        expanded: false
      }
    ]
  };
  do_not_disturb_obj: DoNotDisturb = {
    is_checked: false,
    slot_start: '00:00',
    slot_end: '00:00'
  };
  all_members = {
    activated: [],
    deactivated: []
  };
  all_guests = {
    activated: [],
    deactivated: []
  };
  add_email_domains;
  config_object = {
    all_roles: {},
    default_channels_array : [],
    hide_email: false,
    hide_contact_number: false,
    delete_message: false,
    edit_message: false,
    delete_message_duration: 0,
    edit_message_duration: 0,
    any_user_can_invite: false,
    signup_mode: 0,
    free_invite: 1,
    per_user_invite_price: 25,
    delete_message_role: ['ADMIN', 'OWNER', 'USER', 'GUEST'],
    edit_message_role: ['ADMIN', 'OWNER', 'USER', 'GUEST'],
    enable_one_to_one_chat: ['ADMIN', 'OWNER', 'USER', 'GUEST'],
    enable_create_group: ['ADMIN', 'OWNER', 'USER', 'GUEST'],
    livestream_permission: ['ADMIN', 'OWNER', 'USER', 'GUEST'],
    create_meet_permission: ['ADMIN', 'OWNER', 'USER', 'GUEST'],
    create_workspace_permission: ['ADMIN', 'OWNER', 'USER', 'GUEST'],
  };
  default_channels_array: ChannelDetails[] = [];
  public_channels_array: ChannelDetails[] = [];
  publicChannelToDisplay: ChannelDetails[] = [];
  newPublicChannel = [];
  newDefaultChannel = [];
  indexVariableObj = {
    publicChannelActiveIndex: 0,
    defaultManagerActiveIndex: 0
  };
  search_results = [];
  time_slots = [
    {
      slot_name: '12:00 AM',
      value: '00:00'
    },
    {
      slot_name: '12:30 AM',
      value: '00:30'
    },
    {
      slot_name: '01:00 AM',
      value: '01:00'
    },
    {
      slot_name: '01:30 AM',
      value: '01:30'
    },
    {
      slot_name: '02:00 AM',
      value: '02:00'
    },
    {
      slot_name: '02:30 AM',
      value: '02:30'
    },
    {
      slot_name: '03:00 AM',
      value: '03:00'
    },
    {
      slot_name: '03:30 AM',
      value: '03:30'
    },
    {
      slot_name: '04:00 AM',
      value: '04:00'
    },
    {
      slot_name: '04:30 AM',
      value: '04:30'
    },
    {
      slot_name: '05:00 AM',
      value: '05:00'
    },
    {
      slot_name: '05:30 AM',
      value: '00:00'
    },
    {
      slot_name: '06:00 AM',
      value: '06:00'
    },
    {
      slot_name: '06:30 AM',
      value: '06:30'
    },
    {
      slot_name: '07:00 AM',
      value: '07:00'
    },
    {
      slot_name: '07:30 AM',
      value: '07:30'
    },
    {
      slot_name: '08:00 AM',
      value: '08:00'
    },
    {
      slot_name: '08:30 AM',
      value: '08:30'
    },
    {
      slot_name: '09:00 AM',
      value: '09:00'
    },
    {
      slot_name: '09:30 AM',
      value: '09:30'
    },
    {
      slot_name: '10:00 AM',
      value: '10:00'
    },
    {
      slot_name: '10:30 AM',
      value: '10:30'
    },
    {
      slot_name: '11:00 AM',
      value: '11:00'
    },
    {
      slot_name: '11:30 AM',
      value: '11:30'
    },
    {
      slot_name: '12:00 PM',
      value: '12:00'
    },
    {
      slot_name: '12:30 PM',
      value: '12:30'
    },
    {
      slot_name: '01:00 PM',
      value: '13:00'
    },
    {
      slot_name: '01:30 PM',
      value: '13:30'
    },
    {
      slot_name: '02:00 PM',
      value: '14:00'
    },
    {
      slot_name: '02:30 PM',
      value: '14:30'
    },
    {
      slot_name: '03:00 PM',
      value: '15:00'
    },
    {
      slot_name: '03:30 PM',
      value: '15:30'
    },
    {
      slot_name: '04:00 PM',
      value: '16:00'
    },
    {
      slot_name: '04:30 PM',
      value: '16:30'
    },
    {
      slot_name: '05:00 PM',
      value: '17:00'
    },
    {
      slot_name: '05:30 PM',
      value: '17:30'
    },
    {
      slot_name: '06:00 PM',
      value: '18:00'
    },
    {
      slot_name: '06:30 PM',
      value: '18:30'
    },
    {
      slot_name: '07:00 PM',
      value: '19:00'
    },
    {
      slot_name: '07:30 PM',
      value: '19:30'
    },
    {
      slot_name: '08:00 PM',
      value: '20:00'
    },
    {
      slot_name: '08:30 PM',
      value: '20:30'
    },
    {
      slot_name: '09:00 PM',
      value: '21:00'
    },
    {
      slot_name: '09:30 PM',
      value: '21:30'
    },
    {
      slot_name: '10:00 PM',
      value: '22:00'
    },
    {
      slot_name: '10:30 PM',
      value: '22:30'
    },
    {
      slot_name: '11:00 PM',
      value: '23:00'
    },
    {
      slot_name: '11:30 PM',
      value: '23:30'
    }
  ];
  filtered_owner_results = [];
  owner_autocomplete_index = 0;
  user_details;
  selected_members = null;
  transferOwnershipPopup;
  invitedGuestMembers = [];
  showEditFieldsPopup;
  showGuestPopup = false;
  showMembersAndChannels = false;
  showCroppingPopup: boolean = false;
  cropObj :any = {};

  constructor(private service: SettingsPermissionsService, private sessionService: SessionService,
              private messageService: MessageService, public commonService: CommonService,
              public commonApiService: CommonApiService,
              private cdRef: ChangeDetectorRef, private formBuilder: FormBuilder, private layoutService: LayoutService) {
                // this.spaceData = this.sessionService.get('currentSpace');
                this.spaceData = this.commonService.currentOpenSpace;
              }

  ngOnInit() {
    this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    if (this.spaceData.role == 'OWNER' && this.spaceData.config.livestream_permission && this.spaceData.config.livestream_permission.includes(this.spaceData.role)) {
      this.options.permissions_options.push(      {
        name: 'Start Livestream',
        template: 'permissions8',
        expanded: false
      })
    }
    if (this.spaceData.role == 'OWNER' && this.spaceData.config.create_meet_permission && this.spaceData.config.create_meet_permission.includes(this.spaceData.role)) {
      this.options.permissions_options.push(      {
        name: 'Start Meet Calls',
        template: 'permissions9',
        expanded: false
      })
    }

    if (this.spaceData.role == 'OWNER' && this.commonService.inviteBilling) {
      this.options.settings_options.push(      {
        name: 'Payment Information',
        template: 'settings10',
        expanded: false
      })
    }
    /**
     * Only push guest in the workspace if it is allowed
     */
    if (this.spaceData.config['is_guest_allowed'] == 1) {
      this.tabs_array.push(
        {
          name: 'Guests',
          key: 'guests',
          value: 'guests'
        }
      );
    }
    this.searchCtrl = new FormControl();
    this.searchGuestsCtrl = new FormControl();
    this.ownerSearchCtrl = new FormControl();
    this.searchPublicChannel = new FormControl();
    this.searchManagers = new FormControl();
    this.transferOwnershipForm = this.formBuilder.group({
      'password': ['', [Validators.required]]
    });

    this.changeSpaceNameForm = this.formBuilder.group({
      'space_name': ['', [Validators.required]],
      // 'space_password': ['', [Validators.required]]
    });
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data && data.length > 1) {
          this.isMemberFetched = true;
          this.members_list = this.searchUsers(data);
          this.cdRef.detectChanges();
        } else {
          this.isMemberFetched = false;
          this.members_list = JSON.parse(JSON.stringify(this.all_members[this.members_option]));
        }
        this.cdRef.detectChanges();
      });
    this.searchGuestsCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data) {
          this.isGuestFetched = true;
          this.invitedGuestMembers = this.searchGuestUsers(data);
        } else {
          this.isGuestFetched = false;
          this.invitedGuestMembers = JSON.parse(JSON.stringify(this.all_guests[this.guest_option]));
        }
        this.cdRef.detectChanges();
      });
    this.searchPublicChannel.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data) {
          this.publicChannelToDisplay = this.public_channels_array.filter(item =>
            item.label.toLowerCase().startsWith(data.toLowerCase()));
        } else {
          this.publicChannelToDisplay = this.public_channels_array.slice();
        }
        this.cdRef.detectChanges();
      });

      this.searchManagers.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data && data.length > 1) {
          this.searchUsersInInvite(data);
        } else {
          this.search_results = [];
        }
        this.cdRef.detectChanges();
      });
    // this.options.settings_options[6]['hidden'] = this.spaceData.role != 'OWNER';
    this.getConfiguration();
    this.getPublicDomains();
    this.getAllMembers();
    this.getPublicAndDefaultChannels();
  }


  searchUsersInInvite(search_text) {
    const obj = {
      en_user_id: this.user_details.en_user_id,
      search_text: search_text,
      user_role: this.spaceData.role,
      include_all_users: true
    };
    this.commonApiService.search(obj)
      .subscribe(response => {
          this.search_results = [];
          this.search_results = response.data.users;
          if (this.selected_members) {
            this.search_results = this.search_results.filter(member =>
              this.selected_members['user_id'] != member.user_id);
          }
          this.cdRef.detectChanges();
      });
  }

  /**
   *  get configurations of keys from backend
   */
  getConfiguration() {
    const obj = {
      workspace_id: this.spaceData.workspace_id
    };
    this.service.getConfiguration(obj).subscribe((res) => {
      /**
       * convert seconds to minutes
       */
      this.selected_members = {
        full_name: res.data['default_manager_full_name'],
        user_id: res.data['default_manager_fugu_user_id']
      };
      if (res.data['delete_message_duration'] != 0) {
        res.data['delete_message_duration'] = (res.data['delete_message_duration'] / 60).toFixed(1);
      }
      if (res.data['edit_message_duration'] != 0) {
        res.data['edit_message_duration'] = (res.data['edit_message_duration'] / 60).toFixed(1);
      }
      // tslint:disable-next-line:forin
      for (const i in res.data) {
        try {
          res.data[i] = JSON.parse(res.data[i]);
        } catch (e) {
          res.data[i] = res.data[i];
        }
        /**
         * convert 1 and 0 to true and false for ng-model
         */
        if (res.data[i] == 1 && i != 'delete_message_duration' && i != 'edit_message_duration' && i != 'signup_mode' && i != 'enable_create_group' && i != 'enable_one_to_one_chat' && i != 'livestream_permission' && i != 'create_meet_permission') {
          res.data[i] = true;
        } else if (
                 res.data[i] == 0 &&
                 i != "delete_message_duration" &&
                 i != "edit_message_duration" &&
                 i != "signup_mode" &&
                 i != "enable_create_group" &&
                 i != "enable_one_to_one_chat" &&
                 i != "livestream_permission" &&
                 i != "create_meet_permission" &&
                 i != "create_workspace_permission"
               ) {
                 res.data[i] = false;
               }
      }
      this.config_object = res.data;
      this.config_data_copy = JSON.parse(JSON.stringify(res.data));
    });
  }

  /**
   * get all open domains for signup
   */
  getPublicDomains() {
    const obj = {
      workspace_id: this.spaceData.workspace_id
    };
    this.service.getPublicEmailDomain(obj).subscribe((res) => {
      this.add_email_domains = res.data.public_email_domains.map((item) => {
        return item.email_domain;
      });
      this.add_email_domains = this.add_email_domains.join();
    });
  }

  setTotalCount() {
    if (this.selected_tab == 2) {
      this.totalCountMembers = this.activatedMembers;
    } else {
      this.totalCountMembers = this.activatedGuests;
    }
  }

  /**
   * get all members with their status and roles and divide them into 2 arrays of activated and deactivated.
   */
  getAllMembers() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_type: this.members_option == 'activated' ? 'ALL_MEMBERS' : 'DEACTIVATED_MEMBERS',
      invitation_type: 'GUEST',
      all_members: true,
      user_status: this.members_option == 'activated' ? 'ENABLED' : undefined,
      page_start: this.page_start
    };
    this.all_members.activated = [];
    this.all_members.deactivated = [];
    let c_user, owner;
    this.service.getAllMembers(obj).subscribe((res) => {
      if (res.data.deactivatedMemberCount) {
        this.deactivatedMembers = res.data.deactivatedMemberCount;
      }
      if (res.data.user_count) {
        this.activatedMembers = res.data.user_count;
      }
         if (res.data.totalDeactivatedGuestUsers) {
          this.deactivatedGuests = res.data.totalDeactivatedGuestUsers;
        }
        if (res.data.guest_user_count) {
          this.activatedGuests = res.data.guest_user_count;
        }
      if (this.members_option == 'deactivated') {
        this.totalCountMembers = res.data.deactivatedMemberCount;
      } else {
        this.totalCountMembers = res.data.user_count;
      }
      if (res.data.get_all_member_page_size) {
        page_size_count = res.data.get_all_member_page_size;
      }
      this.allMembers = res.data.all_members;
      if (!res.data.all_members.length) {
        this.isMemberFetched = true;
      }
      if (!res.data.guest_users.length) {
        this.isGuestFetched = true;
      }
      this.allGuestMembers = res.data.guest_users;
      if (this.guest_option == 'activated') {
        this.all_guests.activated = this.allGuestMembers;
      }

      for (const item of res.data.all_members) {
        item.open = false;
        if (item.fugu_user_id == this.commonService.userDetails.user_id) {
          c_user = item;
        } else if (item.role == 'OWNER') {
          owner = item;
        } else {
          if (this.members_option == 'activated') {
            if (item.role == 'ADMIN') {
              this.all_members.activated.unshift(item);
            } else {
              this.all_members.activated.push(item);
            }
          } else {
            if (item.role == 'ADMIN') {
              this.all_members.deactivated.unshift(item);
            } else {
              this.all_members.deactivated.push(item);
            }
          }
        }
      }
      if (owner) {
        this.all_members.activated.unshift(owner);
      }
      if (c_user) {
        this.all_members.activated.unshift(c_user);
      }
      this.members_list = this.all_members[this.members_option];
      this.invitedGuestMembers = this.all_guests[this.guest_option];
      this.cdRef.detectChanges();
    });
  }

  getAllGuests() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_type: this.guest_option == 'activated' ? 'GUEST_USERS' : 'GUEST_DEACTIVATED_USERS',
      invitation_type: 'GUEST',
      page_start: this.page_start
    };
    this.service.getAllMembers(obj).subscribe((res) => {
      this.allGuestMembers = res.data.guest_users;
      if (!res.data.guest_users.length) {
        this.isGuestFetched = true;
      }
      if (this.guest_option == 'activated') {
        this.all_guests.activated = this.allGuestMembers;
        this.totalCountMembers = res.data.guest_user_count;
      } else {
        this.all_guests.deactivated = this.allGuestMembers;
        this.totalCountMembers = res.data.totalDeactivatedGuestUsers;
      }
    });
    this.invitedGuestMembers = this.all_guests[this.guest_option];
  }

  addDefaultChannel() {
    this.config_object.default_channels_array.push(this.defaultChannelsInput.nativeElement.value);
  }

  /**
   * edit configuration of keys by matching initial values
   */
  editConfiguration() {
    const obj = {
      workspace_id: this.spaceData.workspace_id
    };
    this.cdRef.detectChanges();
    for (const i in this.config_data_copy) {
      if (this.config_object[i] != this.config_data_copy[i]) {
        /**
         * convert true false back to 1 and 0
         */
        if (i != 'free_invite' && i != 'per_user_invite_price' && i != 'delete_message_duration' && i != 'signup_mode' && i != 'delete_message_role' && i != 'edit_message_duration'
        && i != 'edit_message_role' && i != 'enable_create_group' && i != 'enable_one_to_one_chat' && i != 'create_workspace_permission' && i != 'livestream_permission' && i != 'create_meet_permission') {
          obj[i] = this.config_object[i] ? '1' : '0';
        } else {
          /**
           * split roles by ','
           */
          if (i == 'delete_message_role') {
            obj[i] = JSON.stringify(this.config_object[i].toString().split(','));
          } else if (i == 'edit_message_role') {
            obj[i] = JSON.stringify(this.config_object[i].toString().split(','));
          } else if (i == 'delete_message_duration') {
            /**
             * convert minutes to seconds
             */
            obj[i] = JSON.stringify(this.config_object[i] * 60);
          } else if (i == 'enable_one_to_one_chat') {
            obj[i] = JSON.stringify(this.config_object[i].toString().split(','));
            if (obj[i] == '[""]') {
              obj[i] = '[]';
            }
          } else if (i == 'enable_create_group') {
            obj[i] = JSON.stringify(this.config_object[i].toString().split(','));
            if (obj[i] == '[""]') {
              obj[i] = '[]';
            }

          } else if (
                   i == "livestream_permission" ||
                   i == "create_meet_permission" ||
                   i == "create_workspace_permission"
                 ) {
                   obj[i] = JSON.stringify(
                     this.config_object[i].toString().split(",")
                   );
                   if (obj[i] == '[""]') {
                     obj[i] = "[]";
                   }
                 } else if (i == "edit_message_duration") {
                   obj[i] = JSON.stringify(this.config_object[i] * 60);
                 } else {
                   obj[i] = JSON.stringify(this.config_object[i]);
                 }
        }
      }
    }
    if (Object.keys(obj).length == 1) {
      return;
    }

    this.service.editConfiguration(obj)
      .subscribe((res) => {
        this.config_data_copy = JSON.parse(JSON.stringify(this.config_object));
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
        for (const i in obj) {
          if (i != 'workspace_id') {
            this.spaceData.config[i] = obj[i];
          }
        }
        // this.sessionService.set('currentSpace', this.spaceData);
        this.commonService.currentOpenSpace = this.spaceData;
        // emitter to change localstorage
        this.commonService.spaceDataEmit();
      });
  }
  editPublicDomains() {
    let arr = this.add_email_domains;
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      add_email_domains: arr ? this.add_email_domains.split(',') : []
    };
    this.service.editPublicEmailDomain(obj).
      subscribe((res) => {
      this.config_data_copy.signup_mode = 1;
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
    });
  }

  /**
   * change user role to admin owner and user
   * @param role - role to be changed to
   * @param data - data of user whose role is to be changed
   */
  changeUserRole(role, data, index?) {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      role: role,
      fugu_user_id: data.fugu_user_id,
      password: role == 'OWNER' ? this.transferOwnershipForm.value.password : undefined
    };
    this.service.manageUserRole(obj)
    .subscribe((res) => {
      //hide actions dropdown in guest
      if (data.showGuestActions) {
        data.showGuestActions = false;
      }

      if (typeof index != 'undefined') {
        this.invitedGuestMembers.splice(index, 1);
      }

        /**
         * if role is changed to owner then convert current owner to admin
         */
        if (role == 'OWNER') {
          for (let i = 0; i < this.all_members['activated'].length; i++) {
            if (this.all_members['activated'][i].role == 'OWNER') {
              this.all_members['activated'][i].role = 'ADMIN';
              this.spaceData.role = 'ADMIN';
              // this.sessionService.set('currentSpace', this.spaceData);
              this.commonService.currentOpenSpace = this.spaceData;
              break;
            }
          }
          // this.options.settings_options[6]['hidden'] = this.spaceData.role != 'OWNER';
        }
        data.role = role;
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
        // emitter to change localstorage
        this.commonService.spaceDataEmit();
        this.transferOwnershipPopup = false;
        this.cdRef.detectChanges();
      });
  }

  /**
   * activate and deactivate a user
   * @param status - status (enabled or disabled)
   * @param data - data of user
   */
  changeUserStatus(status, data, indexGuest?, isGuest?) {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      fugu_user_id: data.fugu_user_id,
      status: status
    };
    this.service.editUserInfo(obj)
      .subscribe((res) => {
        //hide actions dropdown in guest
        if (data.showGuestActions) {
          data.showGuestActions = false;
        }
        data.deleteGuestPopup = false;
        if (typeof indexGuest != 'undefined' && isGuest) {
          this.invitedGuestMembers.splice(indexGuest, 1);
          if (status == 'ENABLED') {
            this.all_guests['activated'].push(data);
            this.activatedGuests = this.activatedGuests + 1;
            this.deactivatedGuests = this.deactivatedGuests - 1;
          } else {
            this.all_guests['deactivated'].push(data);
            this.activatedGuests = this.activatedGuests - 1;
            this.deactivatedGuests = this.deactivatedGuests + 1;
          }
        }

        /**
         * shift user from activated to deactivated array and vice versa
         */
        let index;
        if (!isGuest) {
          if (status == 'ENABLED') {
            for (let i = 0; i < this.all_members['deactivated'].length; i++) {
              if (this.all_members['deactivated'][i].fugu_user_id == data.fugu_user_id) {
                index = i;
                break;
              }
            }
            const temp = this.all_members['deactivated'].splice(index, 1);
            temp[0].status = status;
            temp[0].open = false;
            this.activatedMembers = this.activatedMembers + 1;
            this.deactivatedMembers = this.deactivatedMembers - 1;
            this.all_members['activated'] = this.all_members['activated'].concat(temp);
            this.searchCtrl.reset();
          } else {
            for (let i = 0; i < this.all_members['activated'].length; i++) {
              if (this.all_members['activated'][i].fugu_user_id == data.fugu_user_id) {
                index = i;
                break;
              }
            }
            const temp = this.all_members['activated'].splice(index, 1);
            temp[0].status = status;
            temp[0].open = false;
            this.activatedMembers = this.activatedMembers - 1;
            this.deactivatedMembers = this.deactivatedMembers + 1;
            this.all_members['deactivated'] = this.all_members['deactivated'].concat(temp);
            this.searchCtrl.reset();
          }
        }
        this.messageService.sendAlert({
          type: 'success',
          msg: res.message,
          timeout: 2000
        });
        this.cdRef.detectChanges();
      }, error => {
        if (error.error.statusCode === 402) {
          this.showPaymentPopup = true;
          this.cdRef.detectChanges();
        }
      });
  }

  /**
   * filter users based on search string
   * @param {string} name
   * @returns {any}
   */
  searchUsers(name: string, type?) {
    if (this.totalCountMembers > this.allMembers.length && name.length > 1) {
      const obj = {
        en_user_id: this.user_details.en_user_id,
        search_text: name,
        user_status: this.members_option == 'deactivated' ? 'DEACTIVATED_MEMBERS' : type,
        accepted_members: this.members_option == 'activated' ? true : undefined,
        no_guest_users: true
      };
      this.commonApiService.searchUsersInGroup(obj)
        .subscribe(response => {
          this.members_list = response.data.users;
          this.cdRef.detectChanges();
      });
      this.cdRef.detectChanges();
      return this.members_list;
    } else {
      return this.all_members[type || this.members_option].filter(state =>
        state.full_name.toLowerCase().includes(name.toLowerCase()));
    }
  }

  searchGuestUsers(name: string) {
    if (this.totalCountMembers > this.allGuestMembers.length && name.length > 1) {
      const obj = {
        en_user_id: this.user_details.en_user_id,
        search_text: name,
        user_type: 'SEARCH_GUESTS',
        user_status: this.guest_option == 'deactivated' ? 'DEACTIVATED_MEMBERS' : undefined
      };
      this.commonApiService.searchUsersInGroup(obj)
        .subscribe(response => {
          this.invitedGuestMembers = response.data.users;
          this.cdRef.detectChanges();
        });
      this.cdRef.detectChanges();
      return this.invitedGuestMembers;
    } else {
      return this.all_guests[this.guest_option].filter(state =>
        (state.full_name.toLowerCase().includes(name.toLowerCase())) ||
         (state.email && state.email.toLowerCase().includes(name.toLowerCase())) ||
        (state.contact_number && state.contact_number.includes(name))
      );
    }
  }

  /**
   * change members list based on which one is clicked
   */
  changeMembersList() {
    this.page_start = 0;
    this.members_list = [];
    this.searchCtrl.reset();
    this.members_option == 'activated' ?
      this.members_option = 'deactivated' : this.members_option = 'activated';
    this.getAllMembers();
    this.cdRef.detectChanges();
  }

  /**
   * change guest list based on which one is clicked
   */
  changeGuestList() {
    this.page_start = 0;
    this.invitedGuestMembers = [];
    this.searchGuestsCtrl.reset();
    this.guest_option == 'activated' ?
      this.guest_option = 'deactivated' : this.guest_option = 'activated';
    this.getAllGuests();
    this.cdRef.detectChanges();
  }
  closeExpandedPanels() {
    // tslint:disable-next-line:forin
    for (const tab in this.options) {
      for (const item of this.options[tab]) {
        item.expanded = false;
      }
    }
  }
  /**
   * Add or remove a given channel to default channel
   * @param {string} type Specifies whether to 'remove' or 'add' default channel
   * @param {ChannelDetails} channel Channel to add or remove
   */
  changeDefaultChannel(type: string, channel: ChannelDetails) {
    if (type === 'add') {
      // delelte selected channel from public_Channels_array
      for (let i = 0; i < this.public_channels_array.length; i++) {
        if (this.public_channels_array[i].channel_id == channel.channel_id) {
          this.public_channels_array.splice(i, 1);
          break;
        }
      }
      this.searchPublicChannel.reset();
      this.default_channels_array.push(channel);
      if (this.newPublicChannel.includes(channel.channel_id)) {
        for (let i = 0; i < this.newPublicChannel.length; i++) {
          if (this.newPublicChannel[i] == channel.channel_id) {
            this.newPublicChannel.splice(i, 1);
            break;
          }
        }
      } else {
        this.newDefaultChannel.push(channel.channel_id);
      }
    } else if ( type == 'remove') {
      for (let i = 0; i < this.default_channels_array.length; i++) {
        if (this.default_channels_array[i].channel_id == channel.channel_id) {
          this.default_channels_array.splice(i, 1);
          break;
        }
      }
      this.public_channels_array.push(channel);
      if (this.newDefaultChannel.includes(channel.channel_id)) {
        for (let i = 0; i < this.newDefaultChannel.length; i++) {
          if (this.newDefaultChannel[i] == channel.channel_id) {
            this.newDefaultChannel.splice(i, 1);
            break;
          }
        }
      } else {
        this.newPublicChannel.push(channel.channel_id);
      }
    }
  }
  saveDefaultChannels() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      channel_ids_to_add: this.newDefaultChannel.length ?  this.newDefaultChannel : undefined,
      channel_ids_to_remove: this.newPublicChannel.length ? this.newPublicChannel : undefined
    };
    this.service.changeGroupStatus(obj)
    .subscribe(res => {
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
      if (this.newDefaultChannel.length) {
        this.newDefaultChannel.map(item => {
          if (this.commonService.conversations[item]) {
            this.commonService.conversations[item].chat_type = 5;
          }
          if (item == this.currentChannelId) {
            this.layoutService.chatTypeEmitter.emit(5);
          }
        });
      }
      if (this.newPublicChannel.length) {
        this.newPublicChannel.map(item => {
          if (this.commonService.conversations[item]) {
            this.commonService.conversations[item].chat_type = 4;
          }
          if (item == this.currentChannelId) {
            this.layoutService.chatTypeEmitter.emit(4);
          }
        });
      }
      this.newDefaultChannel = [];
      this.newPublicChannel = [];
      this.cdRef.detectChanges();
    });
  }

  saveDefaultManager() {
    if (!this.selected_members) {
      this.messageService.sendAlert({
        type: 'error',
        msg: 'Select at least 1 user',
        timeout: 2000
      });
      return;
    }
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      default_manager_fugu_user_id: this.selected_members['user_id']
    };
    this.service.editWorkspace(obj).subscribe((res) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
    });
  }

  addMember(member) {
      this.selected_members = member;
      this.searchManagers.reset();
  }

  removeMember() {
    this.selected_members = null;
    this.search_results = [];
  }

  onPublicChannelKeyevent(event, element, indexkey, elementLength) {
    if (event.keyCode == 38) {
      if (this.indexVariableObj[indexkey] != 0) {
        this.indexVariableObj[indexkey]--;
        const elHeight = 62;
        const scrollTop = element.nativeElement.scrollTop;
        const viewport = scrollTop + element.nativeElement.offsetHeight;
        const elOffset = elHeight * this.indexVariableObj[indexkey];
        if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
          element.nativeElement.scrollTop -= elHeight;
        }
      }
    } else if (event.keyCode == 40) {
      if (this.indexVariableObj[indexkey] != elementLength.length - 1) {
        this.indexVariableObj[indexkey]++;
        // scroll the div
        const elHeight = 63;
        const scrollTop = element.nativeElement.scrollTop;
        const viewport = scrollTop + element.nativeElement.offsetHeight;
        const elOffset = elHeight * this.indexVariableObj[indexkey];
        if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
         element.nativeElement.scrollTop += elHeight;
        }
      }
    } else if (event.keyCode == 13) {
      const el = document.getElementById('public-channel-' + this.indexVariableObj[indexkey]);
      if (el) {
        el.click();
      }
    }
  }
  getPublicAndDefaultChannels() {
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id
    };
    this.service.getGroups(obj)
      .subscribe(response => {
        response.data.joined_channels.map(item => {
          if (item.chat_type == 6) {
            this.default_channels_array.push(item);
          } else if (item. chat_type == 4) {
            this.public_channels_array.push(item);
          }
        });
        response.data.open_channels.map(item => {
          this.public_channels_array.push(item);
        });
        this.publicChannelToDisplay = this.public_channels_array.slice();
        this.cdRef.detectChanges();
    });
  }
  ownerSearchKeyEvent(event) {
    if (event.keyCode == 38) {
      this.autoCompleteUpArrow();
    } else if (event.keyCode == 40) {
      this.autoCompleteDownArrow();
    } else if (event.keyCode == 13) {
      this.ownerAutocompleteContainer.nativeElement.scrollTop = 0;
      document.getElementById('owner_autocomplete' + this.owner_autocomplete_index).click();
    } else {
      this.temp_new_owner = null;
      this.ownerSearchMember(this.ownerSearchCtrl.value);
      this.cdRef.detectChanges();
    }
  }
  autoCompleteUpArrow() {
    if (this.owner_autocomplete_index != 0) {
      this.owner_autocomplete_index--;
      const elHeight = 50;
      const scrollTop = this.ownerAutocompleteContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.ownerAutocompleteContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.owner_autocomplete_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.ownerAutocompleteContainer.nativeElement.scrollTop -= 50;
      }
    }
  }
  autoCompleteDownArrow() {
    if (this.owner_autocomplete_index != this.filtered_owner_results.length - 1) {
      this.owner_autocomplete_index++;
      // scroll the div
      const elHeight = 50;
      const scrollTop = this.ownerAutocompleteContainer.nativeElement.scrollTop;
      const viewport = scrollTop + this.ownerAutocompleteContainer.nativeElement.offsetHeight;
      const elOffset = elHeight * this.owner_autocomplete_index;
      if (elOffset < scrollTop || (elOffset + elHeight) > viewport) {
        this.ownerAutocompleteContainer.nativeElement.scrollTop += 50;
      }
    }
  }
  ownerSearchMember(data) {
    if (data) {
      this.filtered_owner_results = this.searchUsers(data, 'activated');
    } else {
      this.members_list = this.all_members['activated'].slice();
    }
  }
  autocompleteClickOutside(event) {
    if (event && event['value'] === true && !this.checkClassContains(['form-control'],
      event.target.classList)) {
      this.filtered_owner_results = [];
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
  editSpaceName() {
    const obj = {
      workspace_name: this.changeSpaceNameForm.value.space_name.trim(),
      workspace_id: this.spaceData.workspace_id,
      // password: this.changeSpaceNameForm.value.space_password
    };
    this.service.editWorkspace(obj).subscribe((res) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
      this.spaceData.workspace_name = this.changeSpaceNameForm.value.space_name.trim();
      // this.sessionService.set('currentSpace', this.spaceData);
      this.commonService.currentOpenSpace = this.spaceData;
      this.changeSpacePopup = false;
      this.commonService.spaceDataEmit();
      this.cdRef.detectChanges();
    });
  }


  async onImageFileSelect(event) {
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

  editWorkspaceIcon(event) {
    const file = event;
    if (file) {
      const size = file.size / 1024;
      if (size > 1024) {
        this.messageService.sendAlert({
          type: 'success',
          msg: 'Image size must be less than 1 MB',
          timeout: 3000
        });
        return;
      }
      const mime_type = file['type'];
      const reader = new FileReader();
      reader.readAsDataURL(file);
          const formData: FormData = new FormData();
          formData.append('file_type', mime_type);
          formData.append('file', file, file.name);
          const name = file.name.replace(/\,/g, '_');
          formData.append('file_name', name);
          formData.append('app_secret_key',  this.commonService.currentOpenSpace['fugu_secret_key']);
          this.service.uploadFile(formData)
            .subscribe(
              response => {
                const obj = {
                  workspace_image_url: response.data.image_url,
                  workspace_thumbnail_url: response.data.thumbnail_url,
                  workspace_id: this.spaceData.workspace_id
                };
                this.service.editWorkspace(obj).subscribe((res) => {
                  this.showCroppingPopup = false;
                  this.messageService.sendAlert({
                    type: 'success',
                    msg: res.message,
                    timeout: 2000
                  });
                  this.spaceData.workspace_image = {};
                  this.spaceData.workspace_image['workspace_image_url'] = response.data.image_url;
                  this.spaceData.workspace_image['workspace_thumbnail_url'] = response.data.thumbnail_url;
                  this.commonService.currentOpenSpace = this.spaceData;
                  this.commonService.spaceDataEmit();
                  this.cdRef.detectChanges();
                });
              });
        };
  }
  removeWorkspaceIcon() {
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      remove_workspace_image: true
    };
    this.service.editWorkspace(obj).subscribe((res) => {
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
      this.spaceData.workspace_image = null;
      // this.sessionService.set('currentSpace', this.spaceData);
      this.commonService.currentOpenSpace = this.spaceData;
      this.commonService.spaceDataEmit();
      this.cdRef.detectChanges();
    });
  }
  openChangeSpaceModal() {
    this.changeSpacePopup = true;
    this.changeSpaceNameForm.reset();
    this.changeSpaceNameForm.patchValue({
      space_name: this.spaceData.workspace_name
    });
  }

  openGuestPopup() {
    this.showGuestPopup = true;
  }

guestOptionsClickOutside(event, member) {
  if (event && event.value == true && !this.checkClassContains(['three-dots'], event.target.classList)) {
    member.showGuestActions = false;
    }
  }

viewGuestSettings(guest_id) {
  this.showEditFieldsPopup = true;
  const obj = {
    en_user_id: this.user_details.en_user_id,
    guest_id: guest_id,
    get_invited_by: true //to get the user id to show the lock icon on
  };
  this.service.getGuestdata(obj)
    .subscribe(response => {
      this.guest_settings = {
        members: response.data.users,
        channels: response.data.channels,
        guest_id: guest_id,
        lock_id: response.data.invited_by
      };
    this.cdRef.detectChanges();
    });
}

  checkPaginationOfUsers() {
    if (!this.isMemberFetched && (this.usersEl.nativeElement.scrollTop +
      this.usersEl.nativeElement.clientHeight)
      / this.usersEl.nativeElement.scrollHeight >= 0.98) {
      if (!stopMembersHit) {
        this.page_start = this.page_start + page_size_count;
        this.hitForNextMembers();
      }
    }
  }
  checkPaginationOfGuests() {
    if (!this.isGuestFetched && (this.guestEl.nativeElement.scrollTop +
      this.guestEl.nativeElement.clientHeight)
      / this.guestEl.nativeElement.scrollHeight >= 0.98) {
      if (!stopGuestsHit) {
        this.page_start = this.page_start + page_size_count;
        this.hitForNextGuest();
      }
    }
  }

  hitForNextMembers() {
    stopMembersHit = true;
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      user_type: this.members_option == 'activated' ? 'ALL_MEMBERS' : 'DEACTIVATED_MEMBERS',
      invitation_type: 'GUEST',
      all_members: true,
      user_status: this.members_option == 'activated' ? 'ENABLED' : undefined,
      page_start: this.page_start
    };
    this.service.getAllMembers(obj).subscribe((res) => {
      stopMembersHit = false;
      const allMembersPagination = res.data.all_members;
      if (!res.data.all_members.length) {
        this.isMemberFetched = true;
      } else {
        if (this.members_option == 'activated') {
          this.all_members.activated = [...this.all_members.activated, ...allMembersPagination];
        } else {
          this.all_members.deactivated = [...this.all_members.deactivated, ...allMembersPagination];
        }
      }
      this.members_list = this.all_members[this.members_option];
      this.cdRef.detectChanges();
    });
  }

  hitForNextGuest() {
    stopGuestsHit = true;
    const obj = {
      workspace_id: this.spaceData.workspace_id,
      invitation_type: 'GUEST',
      user_type: this.guest_option == 'activated' ? 'GUEST_USERS' : 'GUEST_DEACTIVATED_USERS',
      page_start: this.page_start
    };
    this.service.getAllMembers(obj).subscribe((res) => {
      stopGuestsHit = false;
      let allMembersPagination;
      allMembersPagination = res.data.guest_users;
      if (!allMembersPagination.length) {
        this.isGuestFetched = true;
      } else {
        if (this.guest_option == 'activated') {
          this.all_guests.activated = [...this.all_guests.activated, ...allMembersPagination];
        } else {
          this.all_guests.deactivated = [...this.all_guests.deactivated, ...allMembersPagination];
        }
      }
      this.invitedGuestMembers = this.all_guests[this.guest_option];
      this.cdRef.detectChanges();
    });
  }

  showSelectMembersandChannels(guestData) {
    this.showEditFieldsPopup = true;
    this.showGuestPopup = false;
    this.inviteContactObj = guestData;
  }

}
