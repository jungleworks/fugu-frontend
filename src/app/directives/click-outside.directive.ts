import {Directive, OnInit, OnDestroy, Output, EventEmitter, ElementRef, Input} from '@angular/core';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {delay, tap} from 'rxjs/operators';

@Directive({
  selector: '[click-outside]'
})

export class ClickOutside implements OnInit, OnDestroy {
  private listening: boolean;
  private globalClick: Subscription;
  @Output('clickOutside') clickOutside: EventEmitter<Object>;

  constructor(private _elRef: ElementRef) {
    this.listening = false;
    this.clickOutside = new EventEmitter();
  }

  ngOnInit() {
    this.globalClick = fromEvent(document, 'click')
      .pipe(delay(1),
        tap(() => {
        this.listening = true;
      })).subscribe((event: MouseEvent) => {
        this.onGlobalClick(event);
      });
  }

  ngOnDestroy() {
    if (this.globalClick) {
      this.globalClick.unsubscribe();
    }
  }

  onGlobalClick(event: MouseEvent) {
    if (this._elRef.nativeElement.offsetParent !== null) {
      if (event instanceof MouseEvent && this.listening === true) {
        if (this.isDescendant(this._elRef.nativeElement, event.target) === true) {
          this.clickOutside.emit({
            target: (event.target || null),
            value: false
          });
        } else {
          this.clickOutside.emit({
            target: (event.target || null),
            value: true
          });
        }
      }
    }
  }

  isDescendant(parent, child) {
    let node = child;
    while (node !== null) {
      if (node === parent && this._elRef.nativeElement.offsetParent !== null) {
        return true;
      } else {
        node = node.parentNode;
      }
    }
    return false;
  }
}
