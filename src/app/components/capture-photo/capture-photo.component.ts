import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {ChatService} from '../chat/chat.service';
import {MessageService} from '../../services/message.service';
import { scaleInOut } from '../../animations/animations';

const canvas = document.createElement('canvas');

@Component({
  selector: 'app-capture-photo',
  templateUrl: './capture-photo.component.html',
  styleUrls: ['./capture-photo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    scaleInOut
  ]
})
export class CapturePhotoComponent implements OnInit, OnDestroy {

  @Input() input_data;
  video_div_el;
  screenshot_img;
  show_loader = false;
  @Output() closeWebCamPopup: EventEmitter<boolean> = new EventEmitter();
  @Output() output_data: EventEmitter<object> = new EventEmitter();

  /**
   * Listen to escape key and close popup
   * @param event
   */
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        this.closeWebCamPopup.emit(true);
        break;
      case 'Enter':
        event.stopPropagation();
        event.preventDefault();
    }
  }
  constructor(private cdRef: ChangeDetectorRef,
              private chatService: ChatService, private messageService: MessageService) { }

  ngOnInit() {
    this.screenshot_img = document.getElementById('screenshot-img');
    this.video_div_el = document.getElementById('webcam-div');
    this.video_div_el.srcObject = this.input_data.stream;
    this.cdRef.detectChanges();
  }

  /**
   * when clicked on capture button we capture the video frame and draw it on canvas.
   */
  capturePhoto() {
    canvas.width = this.video_div_el.videoWidth;
    canvas.height = this.video_div_el.videoHeight;
    const canvasContext = canvas.getContext('2d');

    canvasContext.translate(canvas.width, 0);
    canvasContext.scale(-1, 1);
    canvasContext.drawImage(this.video_div_el, 0, 0);
    // Other browsers will fall back to image/png
    this.screenshot_img.src = canvas.toDataURL('image/jpeg');
    this.screenshot_img.style.display = 'block';
    this.closeStream();
  }
  ngOnDestroy(): void {
    this.closeStream();
  }

  /**
   * Close user's camera and remove video src
   */
  closeStream() {
    this.video_div_el.style.display = 'none';
    if (this.input_data.stream) {
      const track = this.input_data.stream.getTracks()[0];
      track.stop();
      this.video_div_el.removeAttribute('src');
      this.video_div_el.removeAttribute('srcObject');
    }
  }

  /**
   * Re take photo on clicking retake button
   */
  retakePhoto() {
    navigator.mediaDevices.getUserMedia({video: true})
      .then((stream) => {
        this.screenshot_img.style.display = 'none';
        this.screenshot_img.removeAttribute('src');
        this.input_data.stream = stream;
        this.video_div_el.srcObject = this.input_data.stream;
        this.video_div_el.style.display = 'block';
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * on clicking send we convert data url to file and pass to chat component.
   */
  async sendImage() {
    const blobBin = atob(this.screenshot_img.src.split(',')[1]);
    const array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
    let location;
    /**
     * for location permission
     */
    if (this.input_data.extras && ['LOCATION', 'BOTH'].includes(this.input_data.extras.permission)) {
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Fetching your location.',
        timeout: 3000
      });
      this.show_loader = true;
      location = await this.chatService.getGeoLocation();
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Location fetched successfully.',
        timeout: 3000
      });
      this.show_loader = false;
    }
    this.output_data.emit({
      file: file,
      location: location,
      extras: this.input_data.extras
    });
  }
}
