import { Component, OnInit, ViewChild, Input, ElementRef, EventEmitter, Output } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'
import { CommonService } from '../../services/common.service';


let canvasEl: any;
let myImgElement: any;
let canvas;
@Component({
  selector: 'app-canvas-draw',
  templateUrl: './canvas-draw.component.html',
  styleUrls: ['./canvas-draw.component.scss']
})
export class CanvasDrawComponent implements OnInit {

  // a reference to the canvas element from our template
  @ViewChild('canvas', { static: true }) public canvas: ElementRef;

  @Input() public canvasObj;

  @Output()
  closeDrawPopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  sendEditImageUrl: EventEmitter<any> = new EventEmitter<any>();

  private cx: CanvasRenderingContext2D;


  constructor(public commonService: CommonService) { }

  ngOnInit() {
    this.getCanvasImage();
  }


  getCanvasImage() {
    canvas = document.createElement("canvas");
    canvas.id = 'canvasID'
    /* dynamic width and height of canvas */
    if (this.canvasObj.width == this.canvasObj.height) {
      /* square image */
      canvas.width = 400;
      canvas.height = 400;
    } else if (this.canvasObj.width < 1000) {
      canvas.width = this.canvasObj.width;
      canvas.height = this.canvasObj.height;
    } else {
      canvas.width = 650;
      canvas.height = 400;
    }
    let el = document.getElementById('parent-canvas');
    el.appendChild(canvas);
  }


  public ngAfterViewInit() {



    // get the context
    canvasEl = document.getElementById('canvasID');
    this.cx = canvasEl.getContext('2d');
    // this.cx.scale(1, 1);

    let myImg = new Image();
    myImg.onload = this.drawImageScaled.bind(null, myImg, this.cx);
    myImg.src = this.canvasObj.src;
    // set some default properties about the line
    this.cx.lineWidth = 6;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    // we'll implement this method to start capturing mouse events
    this.captureEvents(canvasEl);
  }

  drawImageScaled(img, ctx) {
    let canvasEl = ctx.canvas;
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  watchColorPicker(event) {
    /* called everytime color is changed from the picker */
    this.cx.strokeStyle = event.target.value;
  }


  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event    
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point    
              pairwise()
            )
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };

        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(
    prevPos: { x: number, y: number },
    currentPos: { x: number, y: number }
  ) {
    // incase the context is not set
    if (!this.cx) { return; }

    // start our drawing path
    this.cx.beginPath();

    // we're drawing lines so we need a previous position
    if (prevPos) {
      // sets the start point
      this.cx.moveTo(prevPos.x, prevPos.y); // from

      // draws a line from the start pos until the current position
      this.cx.lineTo(currentPos.x, currentPos.y);

      // strokes the current path with the styles we set earlier
      this.cx.stroke();
    }
  }

  getImageUrl() {
    let imageUrl = canvasEl.toDataURL("image/png");
    this.sendEditImageUrl.emit(imageUrl);
    this.closeDrawPopup.emit();
  }

  clearDrawing() {
    this.cx.setTransform(1, 0, 0, 1, 0, 0);
    /* clear everything */
    this.cx.clearRect(0, 0, this.cx.canvas.width, this.cx.canvas.height);
    /* add the image again */
    this.cx.drawImage(myImgElement, 0, 0, myImgElement.width, myImgElement.height);
  }

}
