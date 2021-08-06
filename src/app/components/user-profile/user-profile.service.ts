import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../services/api.service';

@Injectable()
export class UserProfileService {
    constructor(private api: ApiService) {
    }
    editUserInfo(data) {
        const obj = {
            'url': 'user/editUserInfo',
            'type': 3,
            'body': data
        };
        return this.api.postOc(obj);
    }
    deleteUserInfo(data) {
        const obj = {
            'url': 'user/editUserInfo',
            'type': 3,
            'body': data
        };
        return this.api.patchFugu(obj);
    }
    phoneOtpRequest(data) {
        const obj = {
            'url': 'user/changeContactNumberRequest',
            'type': 3,
            'body': data
        };
        return this.api.postOc(obj);
    }
    otpSubmitRequest(data) {
        const obj = {
            'url': 'user/changeContactNumber',
            'type': 3,
            'body': data
        };
        return this.api.postOc(obj);
    }
    getAllMembers(data) {

        const obj = {
            'url': 'workspace/getAllMembers',
            'type': 3,
            'body': data
        };
        return this.api.getFugu(obj);
    }
}
