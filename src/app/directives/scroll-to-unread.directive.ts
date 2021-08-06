import {Directive, EventEmitter, Input, Output} from '@angular/core';

@Directive({
  selector: '[appScrollToUnread]'
})
export class ScrollToUnreadDirective {

  @Input() unread_bar_id;
  @Input()
  set scrollEnabled(bool) {
    if (bool) {
      try {
        if (this.unread_bar_id != 'scrollToDiv') {
          this.scrollElementHighlight();
        } else {
          this.scrollToUnread();
        }
        this.scrollEnabledEmit.emit(false);
      } catch (e) {
        this.scrollEnabledEmit.emit(false);
      }
    }
  }
  @Output()
  scrollEnabledEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  afterScrollEmit: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  scrollElementHighlight() {
    const el = document.getElementById(this.unread_bar_id);
    const bubble = <HTMLElement>el.querySelector('.message-content');
    const temp_bubble_color = bubble.style.backgroundColor;
    const temp_bg_color = el.style.backgroundColor;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      el.style.transition = 'all 1s ease-in-out';
      el.style.backgroundColor = '#fff6d1';
      bubble.style.transition = 'all 1s ease-in-out';
      bubble.style.backgroundColor = '#fff6d1';
    }, 700);
    setTimeout(() => {
      el.style.backgroundColor = temp_bg_color;
      bubble.style.backgroundColor = temp_bubble_color;
    }, 2000);
    setTimeout(() => {
      this.afterScrollEmit.emit(true);
    });
    // if (el && el.offsetTop < 60) {
    //   this.scrollContainerRef.scrollTop = this.scrollContainerRef.scrollHeight
    //     - Math.abs(el.offsetTop) - this.chatWindowRef.scrollHeight - 20;
    // }
  }
  scrollToUnread() {
    const el = document.getElementById(this.unread_bar_id);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
