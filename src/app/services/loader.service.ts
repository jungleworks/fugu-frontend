import { Injectable } from '@angular/core';

@Injectable()
export class LoaderService {
  active = false;
  constructor() {
  }

  hide() {
    document.getElementById('global_loader').style.display = 'none';
    this.active = false;
  }
  show() {
    document.getElementById('global_loader').style.display = 'block';
    this.active = true;
  }
  showRedirect() {
    document.getElementById('redirecting').style.display = 'block';
  }
  isActive() {
   return this.active;
  }

}
