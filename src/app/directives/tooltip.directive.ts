import { Directive, OnDestroy, Input, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }
  @Input() tooltipTitle = '';
  @Input() tooltipBgColor = '#373637';
  @Input() tooltipTextColor = '#fff';
  @Input() tooltipPosition = 'top';
  tooltip_el;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.tooltip_el = document.createElement('span');
    this.tooltip_el.classList.add('custom-tooltip');
    this.tooltip_el.style.color = this.tooltipTextColor;
    this.tooltip_el.style.backgroundColor = this.tooltipBgColor;
    this.tooltip_el.textContent = this.tooltipTitle;
    switch (this.tooltipPosition) {
      case 'bottom':
        this.tooltip_el.style.top = `${this.el.nativeElement.clientHeight}px`;
        this.tooltip_el.style.right = '0px';
        break;
      case 'top':
        this.tooltip_el.style.bottom = `${this.el.nativeElement.clientHeight}px`;
        this.tooltip_el.style.left = '0px';
        break;
      case 'left':
        this.tooltip_el.style.right = `${this.el.nativeElement.clientWidth}px`;
        break;
      case 'right':
        this.tooltip_el.style.left = `${this.el.nativeElement.clientWidth}px`;;
        break;
    }
    this.renderer.appendChild(this.el.nativeElement, this.tooltip_el);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.removeChild(this.el.nativeElement, this.tooltip_el);
  }

  @HostListener('click')
  onMouseClick(): void {
    this.renderer.removeChild(this.el.nativeElement, this.tooltip_el);
  }

  ngOnDestroy(): void {
    // hide tooltip
  }
}
