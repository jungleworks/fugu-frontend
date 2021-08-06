import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { messageModalAnimation } from '../../animations/animations';
import { CommonService } from '../../services/common.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { MessageService } from '../../services/message.service';
@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
  animations: [
    messageModalAnimation
  ]
})
export class ImageCropperComponent implements OnInit {
  @ViewChild('cropImageEl', { static: true }) cropImageEl;

  @Output()
  closeCropPopup: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  sendCroppedImage: EventEmitter<any> = new EventEmitter<any>();

  /* information sent from other component */
  @Input() cropObj;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  loaderCrop: boolean = true;
  fileType;
  aspectRatio;
  resizeToWidth;

  constructor(private commonService: CommonService, private messageService: MessageService) { }

  ngOnInit() {
    this.initCropImage();
  }

  initCropImage() {
    /* When you choose a file from the file input, it will call this function. 
    That event is then passed to the image cropper through imageChangedEvent which 
    will load the image into the cropper.*/
    this.imageChangedEvent = this.cropObj.file;
    this.aspectRatio = this.cropObj.ratio ? this.cropObj.ratio : 1 / 1;
    this.resizeToWidth = this.cropObj.resizeToWidth ? this.cropObj.resizeToWidth : 740;
    /* format of the image */
    this.fileType = this.cropObj.file.type.split('/')[1];
  }

  imageCropped(event: ImageCroppedEvent) {
    /* Everytime you release the mouse, the imageCropped event 
    will be triggerd with the cropped image as a Base64 string in its payload. */
    this.croppedImage = event.base64;
  }

  loadImageFailed() {
    /* Emits when a wrong file type was selected (only png, gif and jpg are allowed) */
    this.messageService.sendAlert({
      type: 'success',
      msg: 'Please select the right format',
      timeout: 2000
    });
  }

  cropperReady() {
    /* Emits when the cropper is ready to be interacted */
    this.loaderCrop = false;
  }

  cropImage() {
    try {
      /* if converting base64 */
      let file = this.commonService.dataURLtoFile(this.croppedImage, this.cropObj.file.name);
      /* if converting a blob */
      // let file = this.commonService.blobtoFile(this.croppedImage, this.cropObj.file.name);
      file['src'] = this.croppedImage;
      this.sendCroppedImage.emit(file);
    } catch (e) {
      alert(e);
    } 
  }

  // imageLoaded() {
  //   setTimeout(() => {
  //     if (this.cropObj.isPreview) {
  //       this.cropper = {
  //         x1: 100,
  //         y1: 100,
  //         x2: 520,
  //         y2: 300
  //       }
  //     }
  //   });
  // }

}
