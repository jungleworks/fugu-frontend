import {LayoutService} from './../layout/layout.service';
import {SocketioService} from './../../services/socketio.service';
import {MessageService} from './../../services/message.service';
import {environment} from '../../../environments/environment';
import {ChatService} from './../chat/chat.service';
import {trigger, state, transition, style, animate} from '@angular/animations';
import {SessionService} from './../../services/session.service';
import {ChatTypes, UserType, MessageType} from './../../enums/app.enums';
import {
  Component, OnInit, Input, ChangeDetectionStrategy, ViewChild,
  AfterViewInit, Output, EventEmitter, ElementRef, HostListener, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef
} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {IContentEditableData, Message} from '../../interfaces/app.interfaces';
import {CommonApiService} from '../../services/common-api.service';
import { LoaderService } from '../../services/loader.service';

interface IInputObject {
  current_el: any;
  collection: any;
  trigger: string;
  commandEvent: boolean;
  hasTrailingSpace: boolean;
  inputEvent: boolean;
}

const parser = new DOMParser();
const tagged_user_map = {};

@Component({
  selector: 'app-contenteditable-input',
  templateUrl: './contenteditable-input.component.html',
  styleUrls: ['./contenteditable-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('taggingAnimation', [
      state('in', style({transform: 'translateY(0)'})),
      transition('void => *', [
        style({transform: 'translateY(100%)'}),
        animate('75ms ease-in')
      ]),
      transition('* => void', [
        animate('75ms ease-out', style({transform: 'translateY(100%)'}))
      ])
    ])
  ]
})
export class ContenteditableInputComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  contentData = <IContentEditableData>{};
  UserTypeEnum = UserType;
  @ViewChild('fileInput') fileInput: ElementRef;
  @Input() input_id: string;
  @Input() activeChannelId;
  isMeetClicked: boolean = false;

  @Input()
  set contentEditableData(data: IContentEditableData) {
    if (typeof data != 'undefined') {
      this.contentData = data;
    }
  }

  @Input()
  set editMessageEvent(data) {
    if (data && Object.keys(data).length) {
      this.editMsgObj = data;
      let selectedMsg;
      if (data.thread_muid && this.contentData.is_thread) {
        this.previewEditMessageOnInput(data);
        selectedMsg = document.getElementById(data.thread_muid);
      } else if (!data.thread_muid && !this.contentData.is_thread) {
        this.previewEditMessageOnInput(data);
        selectedMsg = document.getElementById(data.muid);
      }
      // remove other highlighted msg if present
      const highlightedMessage = document.getElementsByClassName('highlight');
      if (highlightedMessage && highlightedMessage.length) {
        for (let i = 0; i < highlightedMessage.length; i++) {
          const element = highlightedMessage[i];
          element.classList.remove('highlight');
        }
      }
      if (selectedMsg) {
        selectedMsg.parentElement.classList.add('highlight');
      }
    }
  }

  @Output() publishMessage = new EventEmitter<object>();
  @Output() publishPollMessage = new EventEmitter<object>();
  @Output() publishGif = new EventEmitter<object>();
  @Output() editMessage = new EventEmitter<object>();
  @Output() fileUpload = new EventEmitter<object>();
  @Output() typingEvent = new EventEmitter();
  @Output() imagePreviewEnter = new EventEmitter();
  @ViewChild('mentionList') mentionListRef;
  public ChatTypeEnum = ChatTypes;
  editMsgObj = <Message>{};
  input_object = <IInputObject>{};
  dropup_open = false;
  poll_popup_open = false;
  triggerInfo = [{
    trigger: '@',
    commandEvent: false,
    requireLeadingSpace: true
  }];
  taggingMenuOpen = false;
  msgEditMode = false;
  spaceData: any;
  mentionData = {};
  keys_object = {
    9: 'TAB',
    8: 'DELETE',
    13: 'ENTER',
    27: 'ESCAPE',
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN'
  };
  showEmojiPicker = false;
  $input;
  showGifPopup = false;
  isOnline = true;

  @HostListener('window:offline', [])
  onWindowOffline() {
    this.isOnline = false;
  }

  @HostListener('window:online', [])
  onWindowOnline() {
    this.isOnline = true;
  }

  constructor(public commonService: CommonService, private sessionService: SessionService, public commonApiService: CommonApiService,
              private socketService: SocketioService, private layoutService: LayoutService,private cdRef: ChangeDetectorRef,
              private loader: LoaderService,private chatService: ChatService, private messageService: MessageService, private elementRef: ElementRef) {
  }

  userData: any;

  ngOnInit() {
    this.spaceData = this.commonService.currentOpenSpace;

    const user_details = this.sessionService.get('user_details_dict');
    this.userData = user_details[window.location.pathname.split('/')[1]];
    this.updateUserList();

  }

  updateUserList() {
    this.commonService.NewAddedUserUpdatedData.subscribe(res => {
      let tempArr: any = [];

      // {
      //   full_name: 'Everyone',
      //     user_id: -1,
      //   user_image: 'assets/img/channel-placeholder.png',
      //   is_everybody: true
      // }

      res.members.forEach((val) => {
        // if (this.userData.user_id != val.user_id) {
        tempArr.push(val);
        // }
      });

      let newArr: any = [];
      newArr.push({
        full_name: 'Everyone',
        user_id: -1,
        user_image: 'assets/img/channel-placeholder.png',
        is_everybody: true
      });
      tempArr.forEach((val) => {
        newArr.push(val);
      });

      let selectIndex = 0;

      this.contentData.trigger_info.forEach((value, index) => {

        if (value.trigger === '@') {
          if (value.chat_type !== 3) {
            if (this.contentData.trigger_info[selectIndex].data_array.length < value.data_array.length) {
              value.data_array = newArr;
              selectIndex = index;
            }

          }
        }
      });

      // {
      //   full_name: 'Everyone',
      //     user_id: -1,
      //   user_image: 'assets/img/channel-placeholder.png',
      //   is_everybody: true
      // }
      // let lastVal = tempArr.pop();
      // let newArr: any = [];
      // newArr.push({
      //   full_name: 'Everyone',
      //   user_id: -1,
      //   user_image: 'assets/img/channel-placeholder.png',
      //   is_everybody: true
      // });
      // tempArr.forEach((val)=>{
      //   newArr.push(val)
      // })
      this.contentData.trigger_info[selectIndex + 1].data_array = newArr;
      this.contentData.trigger_info[this.contentData.trigger_info.length - 1].data_array = newArr;
      //
      // this.input_object.collection = this.contentData.trigger_info[this.contentData.trigger_info.length - 1].data_array
      // this.showMenu();

    });
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.contentEditableData.previousValue && changes.contentEditableData.previousValue.trigger_info) {
      //   let tempArr = changes.contentEditableData.currentValue.trigger_info;
      //   let lastVal = tempArr[tempArr.length - 1];
      //   // changes.contentEditableData.currentValue.trigger_info.pop();
      //   if (lastVal) {
      //     if (this.contentData.trigger_info.length > 1)
      //       this.contentData.trigger_info[0] = lastVal;
      //   }
    }
  }

  ngAfterViewInit() {
    this.input_object.current_el = document.getElementById(this.input_id);
    this.$input = document.getElementById(this.input_id);
    if (this.layoutService.unsentMessagesObject[this.contentData.muid] && this.contentData.is_thread) {
      this.setUnsentHTML(this.layoutService.unsentMessagesObject[this.contentData.muid]);
    }
    this.focusContentEditable();
  }

  ngOnDestroy() {
    if (this.contentData.is_thread) {
      this.switchChannelSaveHTML(this.contentData.muid);
    }
  }

  openPollPopup() {
    this.dropup_open = false;
    this.poll_popup_open = true;
  }

  onInputEvent(event) {
    this.input_object.inputEvent = true;
    this.onKeyupEvent(event);
    this.clearPlaceholder();
    if (!this.msgEditMode && !this.contentData.is_thread) {
      this.typingEvent.emit();
    }
  }

  onKeyupEvent(event: KeyboardEvent) {
    if (this.input_object.inputEvent) {
      this.input_object.inputEvent = false;
    }
    this.clearPlaceholder();
    if (!this.$input.innerHTML) {
      return;
    }
    this.updateSelection();

    if (event.keyCode === 27) {
      return;
    }

    if (!this.taggingMenuOpen) {
      const keyCode = this.getKeyCode();

      if (isNaN(keyCode) || !keyCode) {
        return;
      }

      const trigger_obj = this.contentData.trigger_info.find((item) => {
        return item.trigger.charCodeAt(0) === keyCode;
      });

      if (typeof trigger_obj.trigger !== 'undefined') {
        this.triggerChar(event, this, trigger_obj.trigger);
      }
    }

    if (this.input_object.trigger && this.input_object.commandEvent === false || this.taggingMenuOpen && event.keyCode === 8) {
      this.showMenu();
    }
  }

  onKeydownEvent(event: KeyboardEvent) {
    this.clearPlaceholder();
    this.input_object.commandEvent = false;
    /**
     * if the pressed key is one of the special keys required to manipulate the tagging menu, trigger a
     * method which handles all those cases.
     */
    if (this.keys_object[event.keyCode]) {
      this.input_object.commandEvent = true;
      this.triggerKeyCallback(this.keys_object[event.keyCode].toLowerCase(), event);
    }
  }

  /* when content editable is empty, placeholder is not visible beacause of br tags, so this method checks if
   input is empty and manually clears it on keyup,down,press and input event and emoji check added because emoji's
   are images and .text comes out to be empty to prevent empty input on emojis.*/
  clearPlaceholder() {
    const parsedImg = parser.parseFromString(this.$input.innerHTML, 'text/html').images;
    if (this.$input.innerText.trim().length == 0 && !parsedImg.length) {
      this.$input.innerHTML = '';
    }
  }

  /**
   * For handling specific key down like enter,tab, space, up down
   */
  triggerKeyCallback(key, event) {
    switch (key) {
      case 'enter':
        if (this.taggingMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
          this.mentionListRef.enterToSelect();
          this.hideMenu();
        } else if (!event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          if (this.$input.innerHTML || this.isMeetClicked) {
            this.sendMessage();
          }
        }
        break;
      case 'delete':
        if (this.taggingMenuOpen && (this.input_object.current_el.mentionText && this.input_object.current_el.mentionText.length) < 1) {
          this.hideMenu();
        } else if (this.taggingMenuOpen) {
          // this.showMenu();
        }
        break;
      case 'escape':
        if (this.taggingMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
          this.hideMenu();
        }
        break;
      case 'up':
        if (this.taggingMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
          this.mentionListRef.upArrow();
        }
        break;
      case 'down':
        if (this.taggingMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
          this.mentionListRef.downArrow();
        }
        break;
      case 'tab':
        if (this.taggingMenuOpen) {
          this.triggerKeyCallback('enter', event);
        }
        break;
      case 'left':
        if (this.taggingMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      case 'right':
        if (this.taggingMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
        }
        break;
    }
  }

  /**
   * on paste event in contenteditable
   */
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

  updateSelection() {
    const info = this.getTriggerInfo(false, false, true);

    if (info) {
      this.input_object.current_el.selectedPath = info.mentionSelectedPath;
      this.input_object.current_el.mentionText = info.mentionText;
      this.input_object.current_el.selectedOffset = info.mentionSelectedOffset;
    } else {
      this.hideMenu();
    }
  }

  getTriggerInfo(menuAlreadyActive, hasTrailingSpace, requireLeadingSpace) {
    const allowSpaces = this.input_object.collection ? this.input_object.collection.allowSpaces : true;
    let selected = void 0,
      path = void 0,
      offset = void 0;

    const selectionInfo = this.getContentEditableSelectedPath();

    if (selectionInfo) {
      selected = selectionInfo.selected;
      path = selectionInfo.path;
      offset = selectionInfo.offset;
    }

    const effectiveRange = this.getTextPrecedingCurrentSelection();

    if (effectiveRange !== undefined && effectiveRange !== null) {
      let mostRecentTriggerCharPos = -1;
      let triggerChar = void 0;
      if (!this.contentData.trigger_info) {
        this.contentData.trigger_info = [];
      }
      this.contentData.trigger_info.forEach((config) => {
        const c = config.trigger;
        const idx = config.requireLeadingSpace ? this.lastIndexWithLeadingSpace(effectiveRange, c) : effectiveRange.lastIndexOf(c);

        if (idx > mostRecentTriggerCharPos) {
          mostRecentTriggerCharPos = idx;
          triggerChar = c;
          requireLeadingSpace = config.requireLeadingSpace;
        }
      });

      if (mostRecentTriggerCharPos >= 0 && (mostRecentTriggerCharPos === 0 || !requireLeadingSpace || /[\xA0\s]/g.test(effectiveRange.substring(mostRecentTriggerCharPos - 1, mostRecentTriggerCharPos)))) {
        let currentTriggerSnippet = effectiveRange.substring(mostRecentTriggerCharPos + 1, effectiveRange.length);

        triggerChar = effectiveRange.substring(mostRecentTriggerCharPos, mostRecentTriggerCharPos + 1);
        const firstSnippetChar = currentTriggerSnippet.substring(0, 1);
        const leadingSpace = currentTriggerSnippet.length > 0 && (firstSnippetChar === ' ' || firstSnippetChar === '\xA0');
        if (hasTrailingSpace) {
          currentTriggerSnippet = currentTriggerSnippet.trim();
        }

        const regex = allowSpaces ? /[^\S ]/g : /[\xA0\s]/g;

        this.input_object.hasTrailingSpace = regex.test(currentTriggerSnippet);

        if (!leadingSpace && (menuAlreadyActive || !regex.test(currentTriggerSnippet))) {
          return {
            mentionPosition: mostRecentTriggerCharPos,
            mentionText: currentTriggerSnippet,
            mentionSelectedElement: selected,
            mentionSelectedPath: path,
            mentionSelectedOffset: offset,
            mentionTriggerChar: triggerChar
          };
        }
      }
    }
  }

  getContentEditableSelectedPath() {
    const sel = window.getSelection();
    let selected = sel.anchorNode;
    const path = [];
    let offset = void 0;

    if (selected != null) {
      let i = void 0;
      let ce = selected['contentEditable'];
      while (selected !== null && ce !== 'true') {
        i = this.getNodePositionInParent(selected);
        path.push(i);
        selected = selected.parentNode;
        if (selected !== null) {
          ce = selected['contentEditable'];
        }
      }
      path.reverse();

      // getRangeAt may not exist, need alternative
      offset = sel.getRangeAt(0).startOffset;

      return {
        selected: selected,
        path: path,
        offset: offset
      };
    }
  }

  getNodePositionInParent(element) {
    if (element.parentNode === null) {
      return 0;
    }

    for (let i = 0; i < element.parentNode.childNodes.length; i++) {
      const node = element.parentNode.childNodes[i];

      if (node === element) {
        return i;
      }
    }
  }

  getTextPrecedingCurrentSelection() {
    let text = '';

    const selectedElem = window.getSelection().anchorNode;

    if (selectedElem != null) {
      const workingNodeContent = selectedElem.textContent;
      const selectStartOffset = window.getSelection().getRangeAt(0).startOffset;

      if (workingNodeContent && selectStartOffset >= 0) {
        text = workingNodeContent.substring(0, selectStartOffset);
      }
    }

    return text;
  }

  lastIndexWithLeadingSpace(str, char) {
    const reversedStr = str.split('').reverse().join('');
    let index = -1;

    for (let cidx = 0, len = str.length; cidx < len; cidx++) {
      const firstChar = cidx === str.length - 1;
      const leadingSpace = /\s/.test(reversedStr[cidx + 1]);
      const match = char === reversedStr[cidx];

      if (match && (firstChar || leadingSpace)) {
        index = str.length - 1 - cidx;
        break;
      }
    }

    return index;
  }

  getKeyCode() {
    const char = void 0;
    const info = this.getTriggerInfo(false, this.input_object.hasTrailingSpace, true);

    if (info) {
      return info.mentionTriggerChar.charCodeAt(0);
    } else {
      return false;
    }
  }

  triggerChar(e, el, trigger) {
    this.input_object.trigger = trigger;

    const collectionItem = this.contentData.trigger_info.find(function (item) {
      return item.trigger === trigger;
    });

    this.input_object.collection = collectionItem;
    if (this.input_object.inputEvent) {
      this.showMenu();
    }
  }

  showMenu() {
    this.mentionData = this.input_object.collection;
    const parentHeight = document.getElementById(this.input_id + '-parent').clientHeight + 'px';
    this.elementRef.nativeElement.style.setProperty('--app-mention-bottom', parentHeight);
    this.taggingMenuOpen = true;
    if (this.mentionListRef && typeof this.input_object.current_el.mentionText != 'undefined') {
      this.mentionListRef.filterList(this.input_object.current_el.mentionText);
    }
  }

  hideMenu() {
    this.taggingMenuOpen = false;
    this.input_object.current_el = {};
  }

  dropupClickOutside(event) {
    if (event && event['value'] == true) {
      this.dropup_open = false;
    }
  }

  insertMentionIntoInput(data) {
    if (data) {
      tagged_user_map[data.user_id] = data.full_name;
      const content = this.input_object.collection.template(data);
      if (content !== null) {
        this.replaceTriggerText(content, true, true);
      }
      this.hideMenu();
    }
  }

  replaceTriggerText(text, requireLeadingSpace, hasTrailingSpace) {
    const info = this.getTriggerInfo(true, hasTrailingSpace, requireLeadingSpace);
    const _textSuffix = '\xA0';
    text += _textSuffix;
    this.pasteHtml(text, info.mentionPosition, info.mentionPosition + info.mentionText.length + 1);
  }

  pasteHtml(html, startPos?, endPos?) {
    let range, sel;
    sel = window.getSelection();
    if ((sel.anchorNode && sel.anchorNode.id == this.input_id) ||
      (sel.anchorNode && sel.anchorNode.parentNode && sel.anchorNode.parentNode.id == this.input_id)) {
      /**
       * in case of mention we replace typed text with the tag so we use
       *  start and end position to replace it, else we just paste
       *  html in case of emoji
       */
      if (typeof startPos != 'undefined' && typeof endPos != 'undefined') {
        range = document.createRange();
        range.setStart(sel.anchorNode, startPos);
        range.setEnd(sel.anchorNode, endPos);
      } else {
        range = sel.getRangeAt(0);
      }
      range.deleteContents();

      const el = document.createElement('div');
      el.innerHTML = html;
      let frag = document.createDocumentFragment(),
        node, lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      // Preserve the selection
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        // done to prevent wrong offset, as it triggers mention list on empty keys like cmd,alt
        if (typeof startPos != 'undefined' && typeof endPos != 'undefined') {
          range.setEnd(lastNode, lastNode.length);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      this.$input.innerHTML = this.$input.innerHTML + html;
      this.focusContentEditable();
    }
  }

  focusContentEditable() {
    const selection = window.getSelection();
    const range = document.createRange();
    selection.removeAllRanges();
    range.selectNodeContents(this.$input);
    range.collapse(false);
    selection.addRange(range);
    this.$input.focus();
  }

  /**
   * when enter is pressed we parse the message and send it to the server.
   */
  createMessageToSend() {
    const obj = {
      message: this.$input.innerHTML,
      tagged_users: [],
      tagged_all: false,
      is_thread: this.contentData.is_thread
    };
    if (document.getElementById('meetLinkAttached').innerHTML != '' && !this.$input.innerHTML){
      obj.message = document.getElementById('meetLinkAttached').innerHTML;
    } else if (document.getElementById('meetLinkAttached').innerHTML != '') {
      obj.message = document.getElementById('meetLinkAttached').innerHTML + '\n\n' + this.$input.innerHTML;
    }
    this.isMeetClicked = false;
    document.getElementById('meetLinkAttached').innerHTML = '';
    const parsedString = parser.parseFromString(obj.message, 'text/html');
    for (const el of Array.from(parsedString.querySelectorAll('span'))) {
      if (el.classList.contains('bot-tags')) {
        obj.message = obj.message.replace(el.outerHTML, el.innerText);
      }
    }
    for (const image of Array.from(parsedString.images)) {
      if (image.getAttribute('data-is-emoji')) {
        obj.message = obj.message.replace(image.outerHTML, image.getAttribute('data-plain-text'));
      }
    }
    const mentionReplacer = {};
    for (const link of Array.from(parsedString.links)) {
      if (link.dataset.uid) {
        const temp_html = link.outerHTML;
        link.textContent = `@${tagged_user_map[link.dataset.uid] || link.textContent.slice(1)}`;
        mentionReplacer[`{${link.dataset.uid}}_tag`] = link.outerHTML;
        obj.message = obj.message.replace(temp_html, `{${link.dataset.uid}}_tag`);
        if (link.dataset.uid != '-1') {
          obj.tagged_users.push(parseInt(link.dataset.uid));
        } else {
          obj.tagged_all = true;
        }
      }
    }
    /**
     * handling gmail copy paste spaces issue, replacing <div><br></div> with br
     */
    obj.message = obj.message.replace(/(<div>(<br>)+<\/div>)+|(<div>(<br>)+<\/div>)+$/g, '\n');
    obj.message = obj.message.replace(/<div>/gi, '\n').replace(/<\/div>/gi, '');
    ////////////////////////////////
    obj.message = obj.message.replace(/<br>|<br \/>|<br\/>/g, '\n').replace(/&nbsp;/g, ' ').trim();
    /**
     * convert html to ascii to prevent innerhtml from parsing it
     */
    obj.message = obj.message.replace(/&/g, '&amp;');
    obj.message = obj.message.replace(/>/g, '&gt;');
    obj.message = obj.message.replace(/</g, '&lt;');
    obj.message = obj.message.replace(/"/g, '&quot;');
    obj.message = obj.message.replace(/'/g, '&#039;');
    //////////////////////////
    const el = document.createElement('div');
    el.innerHTML = obj.message;
    obj.message = el.innerText;
    for (const item in mentionReplacer) {
      obj.message = obj.message.split(item).join(mentionReplacer[item]);
    }
    this.$input.innerHTML = '';
    return obj;
  }
  onMeetClick() {
    this.dropup_open = false;
    this.loader.show();
    const obj = {
      en_user_id: this.commonService.userDetails.en_user_id,
      is_scheduled: 0,
      timezone: this.getTimezone(),
      summary: 'calling meet',
      description: 'calling meet desc',
      attendees: [this.commonService.usersInChannels]
    };
    obj['domain'] = environment.LOCAL_DOMAIN;
    this.commonApiService.addEvent(obj).subscribe((res) => {
      this.isMeetClicked = true;
      document.getElementById('meetLinkAttached').innerHTML = res.data.hangoutLink;
      this.loader.hide();
      this.cdRef.detectChanges();
      this.$input.focus();
    });
  }
  clearMeet() {
    this.isMeetClicked = false;
    document.getElementById('meetLinkAttached').innerHTML = '';
  }
  getTimezone() {
    const date = new Date();
    let t = date.getTimezoneOffset();
    if (t < 0) {
      t = Math.abs(t);
    } else if (t > 0) {
      t = -Math.abs(t);
    } else if (t == 0) {
      t = 0;
    }
    return t.toString();
  }
  emojiClickEvent(emojiObj) {
    const emojiHex = String.fromCodePoint(parseInt('0x' + emojiObj.unicode, 16));
    const parsedImg = parser.parseFromString(emojiObj.image, 'text/html').images[0];
    parsedImg.setAttribute('data-plain-text', emojiHex);
    parsedImg.setAttribute('data-is-emoji', 'true');
    this.pasteHtml(parsedImg.outerHTML);
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

  onGIFClick() {
    this.dropup_open = false;
    this.showGifPopup = !this.showGifPopup;
  }

  saveEditedMessage() {
    const data = this.createMessageToSend();
    if (!data.message) {
      this.messageService.sendAlert({
        type: 'success',
        msg: 'Message can not be left empty',
        timeout: 2000
      });
      return;
    }
    const obj = {
      muid: this.editMsgObj.muid
    };
    if (this.contentData.is_thread) {
      obj['thread_muid'] = this.editMsgObj.thread_muid;
    }
    this.msgEditMode = false;
    this.editMessage.emit(Object.assign(data, obj));
    this.cancelEditedMode();
  }

  previewEditMessageOnInput(data) {
    const parsedLinks = parser.parseFromString(data.message, 'text/html').links;
    for (const link of Array.from(parsedLinks)) {
      if (link.classList.contains('tagged-agent') && !link.dataset.uid) {
        const temp_html = link.outerHTML;
        const uid = link.href.split('mention://')[1];
        link.setAttribute('data-uid', uid);
        link.setAttribute('contenteditable', 'false');
        data.message = data.message.replace(temp_html, link.outerHTML);
      }
    }
    const obj = this.chatService.parseEmoji(data['message']);
    data.message = obj.parsedString;
    this.msgEditMode = true;
    this.$input.innerHTML = data.message;
    this.focusContentEditable();
  }

  cancelEditedMode() {
    this.$input.innerHTML = '';
    const selectedMsg = document.getElementById(this.editMsgObj.thread_muid ?
      this.editMsgObj.thread_muid : this.editMsgObj.muid);
    if (selectedMsg) {
      selectedMsg.parentElement.classList.remove('highlight');
    }
    this.msgEditMode = false;
    this.editMsgObj = null;
  }

  sendMessage() {
    this.showEmojiPicker = false;
    if (this.msgEditMode) {
      this.saveEditedMessage();
    } else if (this.contentData.image_preview) {
      this.imagePreviewEnter.emit();
    } else {
      const obj = this.createMessageToSend();
      if (!obj.message) {
        return false;
      }
      this.publishMessage.emit(obj);
    }
  }

  onCreatePollEvent(data) {
    this.publishPollMessage.emit(data);
  }

  onGifClickEvent(data) {
    data.is_thread = this.contentData.is_thread;
    data.message_type = MessageType.Media_Message;
    this.publishGif.emit(data);
    this.showGifPopup = false;
  }

  onAttchmentClick(fileControl) {
    this.fileInput.nativeElement.value = '';
    this.dropup_open = false;
    fileControl.click();
  }

  fileUploadEvent(data) {
    this.fileUpload.emit(data);
  }

  setUnsentHTML(html) {
    this.$input.innerHTML = html;
    this.focusContentEditable();
  }

  switchChannelSaveHTML(id) {
    if (!this.msgEditMode) {
      this.layoutService.unsentMessagesObject[id] = this.$input.innerHTML;
    }
    this.$input.innerHTML = '';
    this.msgEditMode = false;
  }

  // private isValidTypingEventKeyPressed(e) {
  //   const keycode = e.keyCode;
  //   return (!(e.metaKey || e.ctrlKey) && ((keycode >= 48 && keycode <= 57) || (keycode >= 65 && keycode <= 90) ||
  //     (keycode >= 96 && keycode <= 105) || (keycode >= 186 && keycode <= 192) ||
  //     (keycode >= 219 && keycode <= 222)));
  // }
  clearInput() {
    this.$input.innerHTML = '';
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    try {
      if (event.key.toLowerCase() == 'e' && event.metaKey == true
        || (event.key.toLowerCase() == 'e' && event.ctrlKey == true)) {
        event.preventDefault();
        this.focusContentEditable();
      }
    } catch (e) {
    }
  }
}
