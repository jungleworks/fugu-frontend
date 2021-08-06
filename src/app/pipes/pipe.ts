import { ChatTypes } from "./../enums/app.enums";
import { Pipe, PipeTransform } from "@angular/core";
import { CommonService } from "../services/common.service";
import { MessageStateTypes, Role } from "../enums/app.enums";
import {
  DomSanitizer,
  SafeHtml,
  SafeStyle,
  SafeScript,
  SafeUrl,
  SafeResourceUrl
} from "@angular/platform-browser";

declare const twemoji: any;
declare const moment: any;

@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
  transform(value: any, args: any[] = null): any {
    if (!value) {
      return [];
    }
    return Object.keys(value);
  }
}

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const newVal = value.sort((a: any, b: any) => {
      const date1 = new Date(a.last_updated_at || a.date_time);
      const date2 = new Date(b.last_updated_at || b.date_time);

      if (date1 < date2) {
        return 1;
      } else if (date1 > date2) {
        return -1;
      } else {
        return 0;
      }
    });

    return newVal;
  }
}
@Pipe({
  name: "UTCLocal"
})
export class UTCLocalPipe implements PipeTransform {
  transform(value: any, selectedTimeZone?: any): any {
    let startTime;
    if (selectedTimeZone >= 0) {
      startTime = moment(value, "kk:mm")
        .add(selectedTimeZone, "minutes")
        .format("kk:mm");
    } else {
      startTime = moment(value, "kk:mm")
        .subtract(selectedTimeZone, "minutes")
        .format("kk:mm");
    }

    return startTime;
  }
}
@Pipe({
  name: "orderByKeyVal"
})
export class OrderByKeyValPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let newVal = value.sort((a: any, b: any) => {
      const date1 = new Date(a.value.last_updated_at || a.value.date_time);
      const date2 = new Date(b.value.last_updated_at || b.value.date_time);

      /*  if a is pinned or b is pinned but not both
  a is pin then -1 as it is small, b is pin then 1 as a is large and unpinned,
  if both equal compare by time as usual and also for non pin cases*/
      if (
        (a.value.is_pinned || b.value.is_pinned) &&
        !(a.value.is_pinned && b.value.is_pinned)
      ) {
        return a.value.is_pinned ? -1 : 1;
      } else {
        return date1 > date2 ? -1 : 1;
      }
    });
    return newVal;
  }
}

@Pipe({
  name: 'url_phone'
})
export class UrlPhonePipe implements PipeTransform {

  transform(text: string, args?: string): any {
    try {
      if (typeof text !== 'string') {
        return text;
      }
      // const urlRegex = /(https?:\/\/[^\s]+)/g;
      /**
       * code to remove href anchor
       */
      let temp_text = text.toString();
      const hrefRemover = (text.match(/<a[^>]*>([^<]+)<\/a>/g) || []).filter(x => x.includes('href="http'));
      for (const item of hrefRemover) {
        temp_text = temp_text.replace(item, '');
      }
      const urlRegex = /(((https?\:\/\/)|(www\.))(\S([^<\n\s])+))/g;
      const url_arr: Array<any> = temp_text.match(urlRegex);
      if (url_arr) {
        url_arr.forEach((element, index) => {
          text = text.replace(element, (url) => {
            // return '<a href="' + url + '">' + url + '</a>';
            return '$a_' + index;
          });
        });

      }
      // go for phone number checks
      //text = this.phoneNumber(text);
      if (url_arr) {
        url_arr.forEach((element, index) => {
          let href = element;
          element = element.replace('&nbsp;', '').replace('&nbsp', '');
          if (href.indexOf('http') < 0 && href.indexOf('https') < 0) {
            href = href.replace('www', 'http://www');
          }
          const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
          href = href.replace(regex, '').replace('&nbsp;', '').replace('&nbsp', '');
          const s = '$a_' + index;
          const re = new RegExp(s, 'g');
          text = text.replace(s, (url) => {
            return `<a target="_blank" href="${href}" class="link-color" rel="noopener">${element}</a>`;
          });
        });
      }
      return text.replace(/\n/g, '<br/>');
    } catch (e) {
      return text;
    }
  }

  phoneNumber(text: string): string {
    try {
      if (typeof text !== 'string') {
        return text;
      }
      // var exp = /(\+?(?:(?:9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]
      // \d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|
      // 3[9643210]|2[70]|7|1)|\((?:9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3
      // [875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\))[0-9. -]{4,14})(?:\b|x\d+)/ig;
      // var exp = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/ig;
      // var exp = /\+?[1-9]{1}[0-9]{9,14}/g
      const exp = /([+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}/g;
      return text.replace(exp, '<a href=\'tel:$&\'>$&</a>');
    } catch (e) {
      return text;
    }
  }
}

@Pipe({
  name: 'tagged_user'
})
export class TaggedUserPipe implements PipeTransform {

  transform(text: string, args?: string): any {
    try {
      if (typeof text !== 'string') {
        return text;
      }
      return text.replace(/<span style="color:#007BFF;"/ig, '<span color="#007bff"');

    } catch (e) {
      return text;
    }
  }
}

@Pipe({ name: 'time_converter' })
export class TimeConverterPipe implements PipeTransform {
  constructor() { }
  transform(value, type, time?) {
    /**
     * time param for the last seen shown in one to one chats
     */
    const today = moment();
    const yesterday = moment().subtract(1, 'day');
    const week = moment().subtract(7, 'day');
    switch (type) {
      case 'chat':
        if (moment(value).format('YYYY-MM-DD') == today.format('YYYY-MM-DD')) {
          if (time == 'timestamp') {
            return `today at ${moment(value).format('h:mm A')}`;
          } else {
            return 'Today';
          }
        } else if (moment(value).format('YYYY-MM-DD') == yesterday.format('YYYY-MM-DD')) {
          if (time == 'timestamp') {
            return `yesterday at ${moment(value).format('h:mm A')}`;
          } else {
            return 'Yesterday';
          }
        } else if (moment(value).isAfter(week)) {
          /**
           * for time in last week like wednesday, thursday
           */
          if (time == 'timestamp') {
            return `${moment(value).format('dddd')} at ${moment(value).format('h:mm A')}`;
          } else {
            return moment(value).format('dddd');
          }
        } else {
          /**
           * for time before last week
           */
          if (time == 'timestamp') {
            return moment(value).format('D MMM, YYYY');
          } else {
            return moment(value).format('D/M/YYYY');
          }
        }
      case 'conversations':
        if (moment(value).format('YYYY-MM-DD') == today.format('YYYY-MM-DD')) {
          return moment(value).format('h:mm A');
        } else if (moment(value).format('YYYY-MM-DD') == yesterday.format('YYYY-MM-DD')) {
          return 'Yesterday';
        } else if (moment(value).isAfter(week)) {
          return moment(value).format('dddd');
        } else {
          return moment(value).format('D/M/YYYY');
        }
      case 'search_messages':
        if (moment(value).format('YYYY-MM-DD') == today.format('YYYY-MM-DD')) {
          return 'Today';
        } else if (moment(value).format('YYYY-MM-DD') == yesterday.format('YYYY-MM-DD')) {
          return 'Yesterday';
        } else if (moment(value).isAfter(week)) {
          return moment(value).format('dddd');
        } else {
          return moment(value).format('MMM Do');
        }
      case 'default':
    }
  }
}
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  constructor() { }
  transform(value) {
    const val = Number(value);
    let string = '';
    const h = Math.floor(val / 3600);
    const m = Math.floor(val % 3600 / 60);
    const s = Math.floor(val % 3600 % 60);
    if (h) {
      string = ('0' + h).slice(-2) + ':';
    }
    string += ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    return string;
  }
}
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(public sanitizer: DomSanitizer) { }
   transform(value: any, type: any): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
			case 'html': return this.sanitizer.bypassSecurityTrustHtml(value);
			case 'style': return this.sanitizer.bypassSecurityTrustStyle(value);
			case 'script': return this.sanitizer.bypassSecurityTrustScript(value);
			case 'url': return this.sanitizer.bypassSecurityTrustUrl(value);
			case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
			default: throw new Error(`Invalid safe type specified: ${type}`);
		}
  }
}
@Pipe({ name: 'extractHTML' })
export class ExtractHTMLPipe implements PipeTransform {
  constructor() { }
  transform(value) {
    const span = document.createElement('span');
    span.innerHTML = value;
    let str = span.innerText;
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#039;');
    return str;
  }
}
@Pipe({ name: 'emoji' })
export class EmojiPipe implements PipeTransform {
  constructor(private commonService: CommonService) { }
  transform(value, className, is_chat, class_check) {
    if (!value) {
      return false;
    }
    let is_only_emoji;
    if (is_chat) {
      is_only_emoji = this.commonService.checkSingleEmoji(value);
    }
    let parsed_string = twemoji.parse(value, {
      folder: 'emojis',
      base: 'https://files.fugu.chat/',
      ext: '.svg',
      className: className
    });
    try {
      if (is_only_emoji && value) {
        const parsed_emoji_length = parsed_string.match(/<img/g).length || [].length;
        if (parsed_emoji_length < 3) {
          parsed_string = parsed_string.replace(/class="emoji"/g, 'class="big-emoji"');
          if (class_check) {
            return true;
          }
        }
      }
    } catch (e) { }
    if (!class_check) {
      return parsed_string;
    } else {
      return false;
    }
  }
}

@Pipe({ name: 'checkUser' })
export class CheckUserPipe implements PipeTransform {
  constructor() { }
  transform(value, user_id) {
    return value.includes(user_id.toString());
  }
}

@Pipe({ name: 'sortReactions' })
export class SortReactionsPipe implements PipeTransform {
  constructor() { }
  transform(array, user_id) {
    /**
     * sorting the array based on count
     */
    const sorted_array = array.sort(function (a, b) {
      const count1 = a.total_count,
        count2 = b.total_count;
      return count2 - count1;
    });
    /**
     * swapping the third emoji with current user's emoji if it exists.
     */
    for (let i = 0; i < sorted_array.length; i++) {
      if (sorted_array[i].users.includes(user_id.toString()) && i > 2) {
        const temp = sorted_array[i];
        const temp2 = sorted_array[2];
        sorted_array[2] = temp;
        sorted_array[i] = temp2;
        return sorted_array;
      }
    }
    return sorted_array;
  }
}
@Pipe({ name: 'imageDimension' })
export class ImageDimension implements PipeTransform {
  constructor() { }
  transform(messageItem) {
    const minWidth = 230;
    const maxHeight = 230;
    const maxWidth = 230;
    const minHeigth = 138;
    const width = messageItem.image_width;
    const height = messageItem.image_height;
    let newWidth;
    let newHeight;
    let obj = {};
    if (messageItem.image_height && messageItem.image_width) {
      try {
        const isGIF = messageItem.thumbnail_url.includes('.gif');
        if (isGIF) {
          // gif
          const aspectRatio = messageItem.image_width / messageItem.image_height;
          if (messageItem.image_width > messageItem.image_height) {
            if (messageItem.image_width > minWidth) {
              newWidth = minWidth;
            } else {
              newWidth = messageItem.image_width;
            }
            newHeight = newWidth / aspectRatio;
          } else {
            if (messageItem.image_height > maxHeight) {
              newHeight = minWidth;
            } else {
              newHeight = messageItem.image_width;
            }
            newWidth = newHeight * aspectRatio;
          }
          obj = {
            'height': `${newHeight}px`,
            'width': `${newWidth}px`,
          };
        } else {
          // image
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          newHeight = height * ratio;
          newWidth = width * ratio;
          obj = {
            'height': `${newHeight}px`,
            'width': `${newWidth}px`,
          };
        }
      } catch (error) {
        obj = {
          'height': `${maxHeight}px`,
          'width': `${minWidth}px`,
        };
      }
    } else {
      // older images
      obj = {
        'height': `${maxHeight}px`,
        'width': `${minWidth}px`,
      };
    }
    // obj['background-image'] = `url(${messageItem.thumbnail_url})`;
    return obj;
  }
}
@Pipe({ name: 'checkGif' })
export class CheckGif implements PipeTransform {
  constructor() { }
  transform(url) {
    try {
      if (url.includes('.gif')) {
        return { 'object-fit': 'fill' };
      } else {
        return { 'object-fit': 'cover' };
      }
    } catch (error) {
      return { 'object-fit': 'cover' };
    }
  }
}

@Pipe({
  name: "shortName"
})
export class ShortNamePipe implements PipeTransform {
  transform(fullName: string): any {
    return fullName.split(" ")[0]
  }
}


@Pipe({ name: 'parseInt' })
export class ParseIntPipe implements PipeTransform {
  constructor() { }
  transform(value) {
    return parseInt(value);
  }
}
@Pipe({ name: 'randomColor' })
export class RandomColorPipe implements PipeTransform {
  arrayOfColors = {
    0: '#26A69A',
    1: '#4CAF50',
    2: '#5C6BC0',
    3: '#7E57C2',
    4: '#EF5350',
    5: '#9E9D24',
    6: '#FBC02D',
    7: '#A1887F',
    8: '#E040FB',
    9: '#EC407A'
  };

  constructor() { }
  transform(user_id) {
    return this.arrayOfColors[user_id % 10];
  }
}

/**
 * Pipe to highlight searched text when searching for messages
 */
@Pipe({ name: 'highlightText' })
export class HighlightTextPipe implements PipeTransform {
  constructor() { }
  transform(value, string) {
    /**
     * function used in replace to maintain case of string being replaced. replace the searched text with html
     * and give styling ot html.
     * @type {RegExp}
     */
    value = this.htmlToAscii(value);
    let array = [];
    if (string) {
      array = string.split(' ');
    }
    array.map((word) => {
      /**
       * special characters escaping
       */
      if (word == '') {
        return;
      }
      word = word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const replace_string = new RegExp(`\\b${word}\\b`, 'gi');
      value = value.replace(replace_string, (str) => {
        return `<span class="highlight">${str}</span>`;
      });
    });
    return value;
  }
  htmlToAscii(value) {
    let str = value;
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#039;');
    return str;
  }
}
/**
 * Pipe to club search results from same channel
 */
@Pipe({ name: 'clubSearchResults' })
export class ClubSearchResultsPipe implements PipeTransform {
  constructor() { }
  transform(array) {
    /**
     * structure
     * dict = {
     *          date: {
     *                  channel_id : Array
     *                }
     *        }
     */
    let newArray = [];
    const dict = {};
    array.map((item) => {
      /**
       * if entry for date doesn't exist in dictionary, add one and don't do it for thread as we don't club threads
       */
      if (!dict[this.convertDate(item.date_time)] && !item.thread_muid) {
        dict[this.convertDate(item.date_time)] = {};
      }
      /**
       * create entry for channel id on that date as there can be multiple channels on same date
       */
      if (!item.thread_muid && !dict[this.convertDate(item.date_time)][item.channel_id]) {
        dict[this.convertDate(item.date_time)][item.channel_id] = {
          label: item.label || item.full_name || item.user_name,
          date_time: item.date_time,
          clubbed_messages: []
        };
      }
      /**
       * if thread push into array directly as we don't club that.
       */
      if (!item.thread_muid) {
        dict[this.convertDate(item.date_time)][item.channel_id].clubbed_messages.push(item);
      } else {
        /**
         * otherwise push into clubbed messages key in dictionary's channel_id
         */
        newArray.push({
          label: item.label || item.full_name || item.user_name,
          date_time: item.date_time,
          is_thread: true,
          clubbed_messages: [item]
        });
      }
    });
    /**
     * fetch channel_id array via Object.values and concat with newArray and at last send it for sorting by date via pipe in html.
     */
    for (const i in dict) {
      newArray = [...newArray, ...Object.values(dict[i])];
    }
    return newArray;
  }
  convertDate(val) {
    return moment(val).format('YYYY-MM-DD');
  }
}
/**
 * Sort data based on key passed
 */
@Pipe({ name: 'sortData' })
export class SortDataPipe implements PipeTransform {
  constructor() { }
  transform(array, key) {
    /**
     * reverse to sort by descending order.
     */
    return (array.sort((a, b) => a[key] - b[key])).reverse();
  }
}
@Pipe({ name: 'sortDateObject' })
export class SortDateObjectPipe implements PipeTransform {
  constructor() { }
  transform(array, key) {
    const arr = Object.values(key);
    const value = arr.sort((a: any, b: any) => {
      const date1 = new Date(b['date_time']);
      const date2 = new Date(a['date_time']);
      if (date1 > date2) {
        return 1;
      } else if (date1 < date2) {
        return -1;
      } else {
        return 0;
      }
    });
    return value;
  }
}
@Pipe({ name: 'objectLength' })
export class ObjectLengthPipe implements PipeTransform {
  constructor() { }
  transform(obj) {
    return Object.keys(obj).length;
  }
}

@Pipe({ name: 'sortVotes' })
export class SortVotesPipe implements PipeTransform {
  constructor() { }
  transform(array, user_id) {
    /**
     * sorting the array based on count
     */
    const sorted_array = array.sort(function (a, b) {
      const count1 = a.poll_count,
      count2 = b.poll_count;
      return count2 - count1;
    });
    /**
     * swapping the third vote with current user's vote if it exists.
     */
    for (let i = 0; i < sorted_array.length; i++) {
      if (sorted_array[i].users) {
        for (let j = 0; j < sorted_array[i].users.length; j++) {
          if (sorted_array[i].users[j].user_id == user_id.toString() && i > 2) {
            const temp = sorted_array[i];
            const temp2 = sorted_array[2];
            sorted_array[2] = temp;
            sorted_array[i] = temp2;
            return sorted_array;
          }
        }
      }
    }
    return sorted_array;
  }
}

@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  constructor(private commonService: CommonService) {}
  transform(value) {
    if (!value) {
      return '';
    }
    // const urlRegex = /(((https?\:\/\/)|(www\.))(\S([^<\n\s])+))/g;
    // const url_arr: Array<any> = value.match(urlRegex);
    // if (url_arr && url_arr.length > 0) {
    //   return value;
    // } else {
    //   return this.commonService.convertMarkdownText(value);
    // }
    return this.commonService.convertMarkdownText(value);
  }
}

@Pipe({ name: 'edited' })
export class EditedTextPipe implements PipeTransform {
  transform(value, messageState) {
    if (messageState == MessageStateTypes.MESSAGE_EDITED) {
      return value + '&nbsp;<span class="edited-text">(edited)</span>';
    } else {
      return value;
    }
  }
}

@Pipe({ name: 'convertToHours' })
export class ConvertToHoursPipe implements PipeTransform {
  transform(seconds, fraction_digits) {
    return (seconds / 60 / 60).toFixed(fraction_digits);
  }
}

@Pipe({name: 'sortGroupMembers'})
export class SortGroupMembers implements PipeTransform {
  constructor(private commonService: CommonService) {}
  transform(value, chatType) {
    if ([ChatTypes.PRIVATE, ChatTypes.PUBLIC].includes(chatType)) {
      const admins = [];
      const users = [];
      const me = [];
      value.map(el => {
        if (el.user_id == this.commonService.userDetails.user_id) {
          me.push(el);
        } else if (el.role == Role.isAdmin) {
          admins.push(el);
        } else {
          users.push(el);
        }
      });
      return [...me, ...admins, ...users];
    } else if ([ChatTypes.GENERAL, ChatTypes.DEFAULT_CHANNELS].includes(chatType)) {
      for (let i = 0; i < value.length; i++) {
        const element = value[i];
        if (element.user_id == this.commonService.userDetails.user_id) {
          value.splice(i, 1);
          value.unshift(element);
          break;
        }
      }
      return value;
    }
    return value;
  }
}

@Pipe({name: 'innerText'})
export class InnerTextPipe implements PipeTransform {
  constructor() {}
  transform(value) {
    const span = document.createElement('span');
    span.innerHTML = value;
    value = span.innerText;
    return value;
  }
}

@Pipe({
  name: 'orderBySort'
})
export class OrderSortByPipe implements PipeTransform {
  transform(array: any): any {
    return array.sort();
  }
}

@Pipe({
  name: 'prependConvnText'
})
export class PrependConvTextPipe implements PipeTransform {
  constructor(private commonService: CommonService) { }
  transform(obj: any, chatType: any): any {
    if (obj.last_sent_by_id == this.commonService.userDetails.user_id) {
      return 'You: ';
    } else {
      if ([ChatTypes.ONE_TO_ONE, ChatTypes.BOT].includes(chatType)) {
        return '';
      } else {
        return obj.last_sent_by_full_name ? obj.last_sent_by_full_name.split(' ')[0] + ': ' : '';
      }
    }
  }
}
