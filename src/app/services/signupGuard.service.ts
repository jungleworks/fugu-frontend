import { Injectable } from '@angular/core';
import {Router, CanActivate} from '@angular/router';


@Injectable()
export class SignupGuardService implements CanActivate {

  constructor(private router: Router) { }

  canActivate() {
    return this.checkLogin();
  }

  checkLogin() {
     return true;
  }
}
