import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable()
export class JoinService {

  constructor( private api: ApiService, private http: HttpClient ) { }

  invitePublicUser(data) {
    const obj = {
      'url': 'workspace/publicInvite',
      'body': data,
      'type': 9 // <--- new type created to pass nothing
    };
    return this.api.postOc(obj);
  }

}

