import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { messageModalAnimation } from '../../animations/animations';
import { BroadcastMessageType, MessageType } from '../../enums/app.enums';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CommonService } from '../../services/common.service';
import { SessionService } from '../../services/session.service';
import { BroadcastMessageService } from './broadcast-message.service';
import { MessageService } from '../../services/message.service';
import { LayoutService } from '../layout/layout.service';
import { CommonApiService } from '../../services/common-api.service';
import { LoaderService } from '../../services/loader.service';

const parser = new DOMParser();
@Component({
  selector: 'app-broadcast-message',
  templateUrl: './broadcast-message.component.html',
  styleUrls: ['./broadcast-message.component.scss'],
  animations: [
    messageModalAnimation
  ]
})
export class BroadcastMessageComponent implements OnInit {
  @Output()
  closeBroadcastPopup: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;

  broadcastSearchCtrl;
  broadcastText;
  user_details;
  spaceData;
  fugu_config;
  broadcastMessage = 'ALL';
  files;
  leaveBroadcast;
  search_results = [];
  selected_members = {};
  showEmojiPicker;
  input_id;
  broadcastTypeArray = [
    {
      name: 'Send to all',
      value: 'ALL'
    },
    {
      name: 'Except these users',
      value: 'EXCEPT'
    },
    {
      name: 'Only these users',
      value: 'ONLY'
    }
  ];
  broadcastMessageTypeEnum = BroadcastMessageType;
  constructor(private cdRef: ChangeDetectorRef, public commonService: CommonService,
    private sessionService: SessionService, private broadcastService: BroadcastMessageService,
    private messageService: MessageService, private layoutService: LayoutService , public commonApiService: CommonApiService,
    private loaderService: LoaderService) { }

  ngOnInit() {
    this.user_details = this.commonService.userDetailDict[window.location.pathname.split('/')[1]];
    // this.spaceData = this.sessionService.get('currentSpace');
    this.spaceData = this.commonService.currentOpenSpace;
    this.fugu_config = this.sessionService.get('loginData/v1')['fugu_config'];
    this.broadcastSearchCtrl = new FormControl();
    this.broadcastSearchCtrl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(data => {
        if (data && data.length > 1) {
          this.searchUsersInInvite(data);
        } else {
          this.search_results = this.searchUsers(data || '');
        }
        this.cdRef.detectChanges();
      });
    this.input_id = document.getElementById('input_id_broadcast');
  }

  searchUsersInInvite(search_text) {
    const obj = {
      en_user_id: this.user_details.en_user_id,
      search_text: search_text,
      user_role: this.spaceData.role,
      include_all_users: true
    };
    this.commonApiService.search(obj)
      .subscribe(response => {
          this.search_results = [];
          this.search_results = response.data.users;
          this.search_results = this.search_results.filter((item) => {
            // return (item.user_id != this.user_details.user_id && !this.selected_members[item.user_id]);
            return (!this.selected_members[item.user_id]);
          });
          this.cdRef.detectChanges();
      });
  }

  searchUsers(name: string) {
    return this.search_results.filter(member =>
      member.full_name.toLowerCase().includes(name.toLowerCase()) && !this.selected_members[member.user_id]);
  }


  addMember(member) {
    if (!this.selected_members[member.user_id]) {
      this.selected_members[member.user_id] = member;
      this.selected_members = { ...this.selected_members };
      this.broadcastSearchCtrl.reset();
    }
  }

  removeMember(member) {
    delete this.selected_members[member];
    this.selected_members = { ...this.selected_members };
    this.search_results = this.searchUsers('');
  }

  async broadcastToBot(message_type, file?, mime_type?) {
    this.loaderService.show();
    let message = this.input_id.innerHTML;
    const parsedString = parser.parseFromString(message, 'text/html');
    for (const image of Array.from(parsedString.images)) {
      if (image.getAttribute('data-is-emoji')) {
        message = message.replace(image.outerHTML, image.getAttribute('data-plain-text'));
      }
    }
    const user_ids = Object.keys(this.selected_members).map(item => {
      return parseInt(item);
    });
    const formData: FormData = new FormData();
    if (file) {
      /* only senmd these keys in case of images */
      if ( message_type === MessageType.Media_Message) {
      const img_obj = await this.getImageHeightWidth(file);
        formData.append('image_height', img_obj['image_height']);
        formData.append('image_width', img_obj['image_width']);
      }
      formData.append('file_type', mime_type);
      formData.append('file', file, file.name);
      // replace , in file name to _ to avoid multiple content disposition issue
      const name = file.name.replace(/\,/g, '_');
      formData.append('file_name', name);
      formData.append('file_size', this.commonService.calculateFileSize(file.size));
    }
    formData.append('message_type', message_type);
    formData.append('en_user_id', this.user_details.en_user_id);
    if (this.broadcastMessage != 'ALL') {
      formData.append('user_ids', JSON.stringify(user_ids));
    }
    formData.append('broadcast_user_type', this.broadcastMessage);
    if (message) {
      formData.append('message', message);
    }
    this.broadcastService.sendBroadcastMessage(formData).subscribe(res => {
      this.closeBroadcastPopup.emit();
      this.loaderService.hide();
      this.messageService.sendAlert({
        type: 'success',
        msg: res.message,
        timeout: 2000
      });
    });
  }

  getImageHeightWidth(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const image: any = new Image();
        image.src = e.target['result'];
        image.onload = () => {
          resolve({
            image_width: image.width,
            image_height: image.height
          });
        };
      };
    });
  }

  fileUpload(event, is_drop = false) {
    event.preventDefault();
    event.stopPropagation();
    if (is_drop) {
      this.files = event.dataTransfer.files;
    } else {
      this.files = event.target.files;
    }
    if (!this.files.length) {
      return;
    }

    this.cdRef.detectChanges();
  }

  removeAttachment() {
    this.files = '';
    this.fileInput.nativeElement.value = '';
  }

  onAttchmentClick(fileControl) {
    fileControl.click();
  }

  async prepareFileForUpload() {
    if (!Object.keys(this.selected_members).length && this.broadcastMessage != 'ALL') {
      this.messageService.sendAlert({
        type: 'danger',
        msg: 'Select at least 1 user',
        timeout: 2000
      });
      return;
    }
    if (this.files) {
      const file = this.files[0];
      if (file.size > this.fugu_config.max_upload_file_size) {
        this.messageService.sendAlert({
          type: 'danger',
          msg: `File size should be smaller than ${(this.fugu_config.max_upload_file_size / 1024 / 1024).toFixed(0)} mb.`,
          timeout: 2000
        });
        return;
      }
      const mime_type = file['type'] || 'file/file';
      let message_type;
      let tiny_file;
      const mimeTypeParent = mime_type.split('/');
      if (mimeTypeParent[0] == 'image' && !['vnd.adobe.photoshop', 'psd', 'tiff', 'svg', 'svg+xml', 'gif'].includes(mimeTypeParent[1])) {
        message_type = MessageType.Media_Message;
        try {
          tiny_file = await this.layoutService.compressImages(file);;
          this.broadcastToBot(message_type, tiny_file, mime_type);
        } catch {
          // Handle the error
          this.broadcastToBot(MessageType.File_Message, file, mime_type);
        }
      } else if (mimeTypeParent[0] == 'video') {
        message_type = MessageType.Video_Message;
        this.broadcastToBot(message_type, file, mime_type);
      } else {
        message_type = MessageType.File_Message;
        this.broadcastToBot(message_type, file, mime_type);
      }
    } else {
      this.broadcastToBot(MessageType.Text_Message);
    }
  }

  clearValues() {
    this.search_results = [];
    this.selected_members = {};
    this.broadcastSearchCtrl.reset();
  }

  emojiClickEvent(emojiObj) {
    const emojiHex = String.fromCodePoint(parseInt('0x' + emojiObj.unicode, 16));
    const parsedImg = parser.parseFromString(emojiObj.image, 'text/html').images[0];
    parsedImg.setAttribute('data-plain-text', emojiHex);
    parsedImg.setAttribute('data-is-emoji', 'true');
    this.pasteHtml(parsedImg.outerHTML);
  }

  pasteHtml(html) {
    let range, sel;
    sel = window.getSelection();
    /**
      *  matching if the selection is same as the content editable
      */
    if ((sel.anchorNode && sel.anchorNode.id == this.input_id.id) ||
      (sel.anchorNode && sel.anchorNode.parentNode && sel.anchorNode.parentNode.id == this.input_id.id)) {


      range = sel.getRangeAt(0);
      range.deleteContents();

      const el = document.createElement('div');
      el.innerHTML = html;
      let frag = document.createDocumentFragment(),
        node, lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      this.input_id.innerHTML = this.input_id.innerHTML + html;
      this.focusContentEditable();
    }
  }

  focusContentEditable() {
    const selection = window.getSelection();
    const range = document.createRange();
    selection.removeAllRanges();
    range.selectNodeContents(this.input_id);
    range.collapse(false);
    selection.addRange(range);
    this.input_id.focus();
  }

  emojiPickerClickOutside(event) {
    if (event && event.value == true && !this.checkClassContains(['emoji-trigger'], event.target.classList)) {
      this.showEmojiPicker = false;
    }
  }

  checkClassContains(array, list) {
    let flag = true;
    for (let i = 0; i < array.length; i++) {
      flag = list.contains(array[i]);
      if (flag) {
        return flag;
      }
    }
    return false;
  }
  pasteEvent(e: ClipboardEvent) {
    e.preventDefault();
    let text = e.clipboardData.getData('text/plain').trim();
    text = text.replace(/&/g, '&amp;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/</g, '&lt;');
    text = text.replace(/"/g, '&quot;');
    text = text.replace(/'/g, '&#039;');
    document.execCommand('insertHTML', false, text);
  }

  clearPlaceholder() {
    const parsedImg = parser.parseFromString(this.input_id.innerHTML, 'text/html').images;
    if (this.input_id.innerText.trim().length == 0 && !parsedImg.length) {
      this.input_id.innerHTML = '';
    }
  }

  onInputEvent(event) {
    this.clearPlaceholder();
  }

  keydownEvent(event) {
    if (event.keyCode == 13 && !event.shiftKey) {
      event.preventDefault();
    }
  }

  leaveBroadcastPopup() {
    if (this.input_id.innerHTML || this.files) {
      this.leaveBroadcast = true;
    } else {
      this.leaveBroadcast = false;
      this.closeBroadcastPopup.emit();
    }
  }
}
