import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class ScrumBotService {

  reports;

  constructor(private api: ApiService) { }

  getAllMembers(data) {
    const obj = {
      'url': 'workspace/getAllMembers',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }

  sendScrumDetails(data) {
    const obj = {
      'url': 'scrum/insertScrumDetails',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  editScrumDetails(data) {
    const obj = {
      'url': 'scrum/editScrumDetails',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  getGroups(data) {
    const obj = {
      'url': 'chat/getChatGroups',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  getGroupMembers(data) {
    const obj = {
      'url': 'chat/getGroupInfo',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  getScrumDetails(data) {
    const obj = {
      'url': 'scrum/getScrumDetails',
      'type': 3,
      'body': data
    };
    return this.api.getFugu(obj);
  }
  getScrumDetailsErrors(data) {
    const obj = {
      'url': 'scrum/getScrumDetails',
      'type': 3,
      'body': data
    };
    return this.api.getTotalReponse(obj);
  }

  checkUserAvailability(data) {
    const obj = {
      'url': 'scrum/checkUserAvailability',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }

  runScrumNow(data) {
    const obj = {
      'url': 'scrum/cron',
      'type': 3,
      'body': data
    };
    return this.api.postOc(obj);
  }
}
