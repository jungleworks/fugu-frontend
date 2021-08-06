import { Injectable } from '@angular/core';


@Injectable()
export class EmojiPickerService {
  emojis = [
    {
      'heading': 'frequently_used',
      'icon': '1f553',
      'emojis': [
        {
          'name': 'thumbs up sign',
          'unicode': '1f44d'
        },
        {
          'name': 'face with tears of joy',
          'unicode': '1f602'
        },
        {
          'name': 'smiling face with open mouth and smiling eyes',
          'unicode': '1f604'
        },
        {
          'name': 'heavy black heart',
          'unicode': '2764'
        },
        {
          'name': 'smiling face with sunglasses',
          'unicode': '1f60e'
        },
        {
          'name': 'slightly smiling face',
          'unicode': '1f642'
        },
        {
          'name': 'party popper',
          'unicode': '1f389'
        },
        {
          'name': 'pile of poo',
          'unicode': '1f4a9'
        },
        {
          'name': 'angry face',
          'unicode': '1f620'
        }
      ]
    },
    {
      'heading': 'people',
      'icon': '1f642',
      'emojis': [
        {
          'name': 'grinning face',
          'unicode': '1f600'
        },
        {
          'name': 'grinning face with smiling eyes',
          'unicode': '1f601'
        },
        {
          'name': 'face with tears of joy',
          'unicode': '1f602'
        },
        {
          'name': 'rolling on the floor laughing',
          'unicode': '1f923'
        },
        {
          'name': 'smiling face with open mouth',
          'unicode': '1f603'
        },
        {
          'name': 'smiling face with open mouth and smiling eyes',
          'unicode': '1f604'
        },
        {
          'name': 'smiling face with open mouth and cold sweat',
          'unicode': '1f605'
        },
        {
          'name': 'smiling face with open mouth and tightly-closed eyes',
          'unicode': '1f606'
        },
        {
          'name': 'winking face',
          'unicode': '1f609'
        },
        {
          'name': 'smiling face with smiling eyes',
          'unicode': '1f60a'
        },
        {
          'name': 'face savouring delicious food',
          'unicode': '1f60b'
        },
        {
          'name': 'smiling face with sunglasses',
          'unicode': '1f60e'
        },
        {
          'name': 'smiling face with heart-shaped eyes',
          'unicode': '1f60d'
        },
        {
          'name': 'face throwing a kiss',
          'unicode': '1f618'
        },
        {
          'name': 'kissing face',
          'unicode': '1f617'
        },
        {
          'name': 'kissing face with smiling eyes',
          'unicode': '1f619'
        },
        {
          'name': 'kissing face with closed eyes',
          'unicode': '1f61a'
        },
        {
          'name': 'white smiling face',
          'unicode': '263a'
        },
        {
          'name': 'slightly smiling face',
          'unicode': '1f642'
        },
        {
          'name': 'hugging face',
          'unicode': '1f917'
        },
        {
          'name': 'thinking face',
          'unicode': '1f914'
        },
        {
          'name': 'neutral face',
          'unicode': '1f610'
        },
        {
          'name': 'expressionless face',
          'unicode': '1f611'
        },
        {
          'name': 'face without mouth',
          'unicode': '1f636'
        },
        {
          'name': 'face with rolling eyes',
          'unicode': '1f644'
        },
        {
          'name': 'smirking face',
          'unicode': '1f60f'
        },
        {
          'name': 'persevering face',
          'unicode': '1f623'
        },
        {
          'name': 'disappointed but relieved face',
          'unicode': '1f625'
        },
        {
          'name': 'face with open mouth',
          'unicode': '1f62e'
        },
        {
          'name': 'zipper-mouth face',
          'unicode': '1f910'
        },
        {
          'name': 'hushed face',
          'unicode': '1f62f'
        },
        {
          'name': 'sleepy face',
          'unicode': '1f62a'
        },
        {
          'name': 'tired face',
          'unicode': '1f62b'
        },
        {
          'name': 'sleeping face',
          'unicode': '1f634'
        },
        {
          'name': 'relieved face',
          'unicode': '1f60c'
        },
        {
          'name': 'nerd face',
          'unicode': '1f913'
        },
        {
          'name': 'face with stuck-out tongue',
          'unicode': '1f61b'
        },
        {
          'name': 'face with stuck-out tongue and winking eye',
          'unicode': '1f61c'
        },
        {
          'name': 'face with stuck-out tongue and tightly-closed eyes',
          'unicode': '1f61d'
        },
        {
          'name': 'drooling face',
          'unicode': '1f924'
        },
        {
          'name': 'unamused face',
          'unicode': '1f612'
        },
        {
          'name': 'face with cold sweat',
          'unicode': '1f613'
        },
        {
          'name': 'pensive face',
          'unicode': '1f614'
        },
        {
          'name': 'confused face',
          'unicode': '1f615'
        },
        {
          'name': 'upside-down face',
          'unicode': '1f643'
        },
        {
          'name': 'money-mouth face',
          'unicode': '1f911'
        },
        {
          'name': 'astonished face',
          'unicode': '1f632'
        },
        {
          'name': 'white frowning face',
          'unicode': '2639'
        },
        {
          'name': 'slightly frowning face',
          'unicode': '1f641'
        },
        {
          'name': 'confounded face',
          'unicode': '1f616'
        },
        {
          'name': 'disappointed face',
          'unicode': '1f61e'
        },
        {
          'name': 'worried face',
          'unicode': '1f61f'
        },
        {
          'name': 'face with look of triumph',
          'unicode': '1f624'
        },
        {
          'name': 'crying face',
          'unicode': '1f622'
        },
        {
          'name': 'loudly crying face',
          'unicode': '1f62d'
        },
        {
          'name': 'frowning face with open mouth',
          'unicode': '1f626'
        },
        {
          'name': 'anguished face',
          'unicode': '1f627'
        },
        {
          'name': 'fearful face',
          'unicode': '1f628'
        },
        {
          'name': 'weary face',
          'unicode': '1f629'
        },
        {
          'name': 'grimacing face',
          'unicode': '1f62c'
        },
        {
          'name': 'face with open mouth and cold sweat',
          'unicode': '1f630'
        },
        {
          'name': 'face screaming in fear',
          'unicode': '1f631'
        },
        {
          'name': 'flushed face',
          'unicode': '1f633'
        },
        {
          'name': 'dizzy face',
          'unicode': '1f635'
        },
        {
          'name': 'pouting face',
          'unicode': '1f621'
        },
        {
          'name': 'angry face',
          'unicode': '1f620'
        },
        {
          'name': 'smiling face with halo',
          'unicode': '1f607'
        },
        {
          'name': 'face with cowboy hat',
          'unicode': '1f920'
        },
        {
          'name': 'clown face',
          'unicode': '1f921'
        },
        {
          'name': 'lying face',
          'unicode': '1f925'
        },
        {
          'name': 'face with medical mask',
          'unicode': '1f637'
        },
        {
          'name': 'face with thermometer',
          'unicode': '1f912'
        },
        {
          'name': 'face with head-bandage',
          'unicode': '1f915'
        },
        {
          'name': 'nauseated face',
          'unicode': '1f922'
        },
        {
          'name': 'sneezing face',
          'unicode': '1f927'
        },
        {
          'name': 'smiling face with horns',
          'unicode': '1f608'
        },
        {
          'name': 'imp',
          'unicode': '1f47f'
        },
        {
          'name': 'japanese ogre',
          'unicode': '1f479'
        },
        {
          'name': 'japanese goblin',
          'unicode': '1f47a'
        },
        {
          'name': 'skull',
          'unicode': '1f480'
        },
        {
          'name': 'ghost',
          'unicode': '1f47b'
        },
        {
          'name': 'extraterrestrial alien',
          'unicode': '1f47d'
        },
        {
          'name': 'robot face',
          'unicode': '1f916'
        },
        {
          'name': 'pile of poo',
          'unicode': '1f4a9'
        },
        {
          'name': 'smiling cat face with open mouth',
          'unicode': '1f63a'
        },
        {
          'name': 'grinning cat face with smiling eyes',
          'unicode': '1f638'
        },
        {
          'name': 'cat face with tears of joy',
          'unicode': '1f639'
        },
        {
          'name': 'smiling cat face with heart-shaped eyes',
          'unicode': '1f63b'
        },
        {
          'name': 'cat face with wry smile',
          'unicode': '1f63c'
        },
        {
          'name': 'kissing cat face with closed eyes',
          'unicode': '1f63d'
        },
        {
          'name': 'weary cat face',
          'unicode': '1f640'
        },
        {
          'name': 'crying cat face',
          'unicode': '1f63f'
        },
        {
          'name': 'pouting cat face',
          'unicode': '1f63e'
        },
        {
          'name': 'boy',
          'unicode': '1f466'
        },
        {
          'name': 'girl',
          'unicode': '1f467'
        },
        {
          'name': 'man',
          'unicode': '1f468'
        },
        {
          'name': 'woman',
          'unicode': '1f469'
        },
        {
          'name': 'older man',
          'unicode': '1f474'
        },
        {
          'name': 'older woman',
          'unicode': '1f475'
        },
        {
          'name': 'baby',
          'unicode': '1f476'
        },
        {
          'name': 'baby angel',
          'unicode': '1f47c'
        },
        {
          'name': 'police officer',
          'unicode': '1f46e'
        },
        {
          'name': 'sleuth or spy',
          'unicode': '1f575'
        },
        {
          'name': 'guardsman',
          'unicode': '1f482'
        },
        {
          'name': 'construction worker',
          'unicode': '1f477'
        },
        {
          'name': 'man with turban',
          'unicode': '1f473'
        },
        {
          'name': 'person with blond hair',
          'unicode': '1f471'
        },
        {
          'name': 'father christmas',
          'unicode': '1f385'
        },
        {
          'name': 'mother christmas',
          'unicode': '1f936'
        },
        {
          'name': 'princess',
          'unicode': '1f478'
        },
        {
          'name': 'prince',
          'unicode': '1f934'
        },
        {
          'name': 'bride with veil',
          'unicode': '1f470'
        },
        {
          'name': 'man in tuxedo',
          'unicode': '1f935'
        },
        {
          'name': 'pregnant woman',
          'unicode': '1f930'
        },
        {
          'name': 'man with gua pi mao',
          'unicode': '1f472'
        },
        {
          'name': 'person frowning',
          'unicode': '1f64d'
        },
        {
          'name': 'person with pouting face',
          'unicode': '1f64e'
        },
        {
          'name': 'face with no good gesture',
          'unicode': '1f645'
        },
        {
          'name': 'face with ok gesture',
          'unicode': '1f646'
        },
        {
          'name': 'information desk person',
          'unicode': '1f481'
        },
        {
          'name': 'happy person raising one hand',
          'unicode': '1f64b'
        },
        {
          'name': 'person bowing deeply',
          'unicode': '1f647'
        },
        {
          'name': 'face palm',
          'unicode': '1f926'
        },
        {
          'name': 'shrug',
          'unicode': '1f937'
        },
        {
          'name': 'face massage',
          'unicode': '1f486'
        },
        {
          'name': 'haircut',
          'unicode': '1f487'
        },
        {
          'name': 'pedestrian',
          'unicode': '1f6b6'
        },
        {
          'name': 'runner',
          'unicode': '1f3c3'
        },
        {
          'name': 'dancer',
          'unicode': '1f483'
        },
        {
          'name': 'man dancing',
          'unicode': '1f57a'
        },
        {
          'name': 'woman with bunny ears',
          'unicode': '1f46f'
        },
        {
          'name': 'speaking head in silhouette',
          'unicode': '1f5e3'
        },
        {
          'name': 'bust in silhouette',
          'unicode': '1f464'
        },
        {
          'name': 'busts in silhouette',
          'unicode': '1f465'
        },
        {
          'name': 'man and woman holding hands',
          'unicode': '1f46b'
        },
        {
          'name': 'two men holding hands',
          'unicode': '1f46c'
        },
        {
          'name': 'two women holding hands',
          'unicode': '1f46d'
        },
        {
          'name': 'kiss',
          'unicode': '1f48f'
        },
        {
          'name': 'couple with heart',
          'unicode': '1f491'
        },
        {
          'name': 'family',
          'unicode': '1f46a'
        },
        {
          'name': 'flexed biceps',
          'unicode': '1f4aa'
        },
        {
          'name': 'selfie',
          'unicode': '1f933'
        },
        {
          'name': 'white left pointing backhand index',
          'unicode': '1f448'
        },
        {
          'name': 'white right pointing backhand index',
          'unicode': '1f449'
        },
        {
          'name': 'white up pointing index',
          'unicode': '261d'
        },
        {
          'name': 'white up pointing backhand index',
          'unicode': '1f446'
        },
        {
          'name': 'reversed hand with middle finger extended',
          'unicode': '1f595'
        },
        {
          'name': 'white down pointing backhand index',
          'unicode': '1f447'
        },
        {
          'name': 'victory hand',
          'unicode': '270c'
        },
        {
          'name': 'hand with first and index finger crossed',
          'unicode': '1f91e'
        },
        {
          'name': 'raised hand with part between middle and ring fingers',
          'unicode': '1f596'
        },
        {
          'name': 'sign of the horns',
          'unicode': '1f918'
        },
        {
          'name': 'call me hand',
          'unicode': '1f919'
        },
        {
          'name': 'raised hand with fingers splayed',
          'unicode': '1f590'
        },
        {
          'name': 'raised hand',
          'unicode': '270b'
        },
        {
          'name': 'ok hand sign',
          'unicode': '1f44c'
        },
        {
          'name': 'thumbs up sign',
          'unicode': '1f44d'
        },
        {
          'name': 'thumbs down sign',
          'unicode': '1f44e'
        },
        {
          'name': 'raised fist',
          'unicode': '270a'
        },
        {
          'name': 'fisted hand sign',
          'unicode': '1f44a'
        },
        {
          'name': 'left-facing fist',
          'unicode': '1f91b'
        },
        {
          'name': 'right-facing fist',
          'unicode': '1f91c'
        },
        {
          'name': 'raised back of hand',
          'unicode': '1f91a'
        },
        {
          'name': 'waving hand sign',
          'unicode': '1f44b'
        },
        {
          'name': 'clapping hands sign',
          'unicode': '1f44f'
        },
        {
          'name': 'writing hand',
          'unicode': '270d'
        },
        {
          'name': 'open hands sign',
          'unicode': '1f450'
        },
        {
          'name': 'person raising both hands in celebration',
          'unicode': '1f64c'
        },
        {
          'name': 'person with folded hands',
          'unicode': '1f64f'
        },
        {
          'name': 'handshake',
          'unicode': '1f91d'
        },
        {
          'name': 'nail polish',
          'unicode': '1f485'
        },
        {
          'name': 'ear',
          'unicode': '1f442'
        },
        {
          'name': 'nose',
          'unicode': '1f443'
        },
        {
          'name': 'footprints',
          'unicode': '1f463'
        },
        {
          'name': 'eyes',
          'unicode': '1f440'
        },
        {
          'name': 'eye',
          'unicode': '1f441'
        },
        {
          'name': 'tongue',
          'unicode': '1f445'
        },
        {
          'name': 'mouth',
          'unicode': '1f444'
        },
        {
          'name': 'kiss mark',
          'unicode': '1f48b'
        },
        {
          'name': 'sleeping symbol',
          'unicode': '1f4a4'
        },
        {
          'name': 'eyeglasses',
          'unicode': '1f453'
        },
        {
          'name': 'dark sunglasses',
          'unicode': '1f576'
        },
        {
          'name': 'necktie',
          'unicode': '1f454'
        },
        {
          'name': 't-shirt',
          'unicode': '1f455'
        },
        {
          'name': 'jeans',
          'unicode': '1f456'
        },
        {
          'name': 'dress',
          'unicode': '1f457'
        },
        {
          'name': 'kimono',
          'unicode': '1f458'
        },
        {
          'name': 'bikini',
          'unicode': '1f459'
        },
        {
          'name': 'womans clothes',
          'unicode': '1f45a'
        },
        {
          'name': 'purse',
          'unicode': '1f45b'
        },
        {
          'name': 'handbag',
          'unicode': '1f45c'
        },
        {
          'name': 'pouch',
          'unicode': '1f45d'
        },
        {
          'name': 'school satchel',
          'unicode': '1f392'
        },
        {
          'name': 'mans shoe',
          'unicode': '1f45e'
        },
        {
          'name': 'athletic shoe',
          'unicode': '1f45f'
        },
        {
          'name': 'high-heeled shoe',
          'unicode': '1f460'
        },
        {
          'name': 'womans sandal',
          'unicode': '1f461'
        },
        {
          'name': 'womans boots',
          'unicode': '1f462'
        },
        {
          'name': 'crown',
          'unicode': '1f451'
        },
        {
          'name': 'womans hat',
          'unicode': '1f452'
        },
        {
          'name': 'top hat',
          'unicode': '1f3a9'
        },
        {
          'name': 'graduation cap',
          'unicode': '1f393'
        },
        {
          'name': 'helmet with white cross',
          'unicode': '26d1'
        },
        {
          'name': 'lipstick',
          'unicode': '1f484'
        },
        {
          'name': 'ring',
          'unicode': '1f48d'
        },
        {
          'name': 'closed umbrella',
          'unicode': '1f302'
        },
        {
          'name': 'briefcase',
          'unicode': '1f4bc'
        }
      ]
    },
    {
      'heading': 'objects',
      'icon': '1f4a1',
      'emojis': [
        {
          'name': 'skull and crossbones',
          'unicode': '2620'
        },
        {
          'name': 'love letter',
          'unicode': '1f48c'
        },
        {
          'name': 'bomb',
          'unicode': '1f4a3'
        },
        {
          'name': 'hole',
          'unicode': '1f573'
        },
        {
          'name': 'shopping bags',
          'unicode': '1f6cd'
        },
        {
          'name': 'prayer beads',
          'unicode': '1f4ff'
        },
        {
          'name': 'gem stone',
          'unicode': '1f48e'
        },
        {
          'name': 'hocho',
          'unicode': '1f52a'
        },
        {
          'name': 'amphora',
          'unicode': '1f3fa'
        },
        {
          'name': 'world map',
          'unicode': '1f5fa'
        },
        {
          'name': 'barber pole',
          'unicode': '1f488'
        },
        {
          'name': 'frame with picture',
          'unicode': '1f5bc'
        },
        {
          'name': 'bellhop bell',
          'unicode': '1f6ce'
        },
        {
          'name': 'door',
          'unicode': '1f6aa'
        },
        {
          'name': 'sleeping accommodation',
          'unicode': '1f6cc'
        },
        {
          'name': 'bed',
          'unicode': '1f6cf'
        },
        {
          'name': 'couch and lamp',
          'unicode': '1f6cb'
        },
        {
          'name': 'toilet',
          'unicode': '1f6bd'
        },
        {
          'name': 'shower',
          'unicode': '1f6bf'
        },
        {
          'name': 'bathtub',
          'unicode': '1f6c1'
        },
        {
          'name': 'hourglass',
          'unicode': '231b'
        },
        {
          'name': 'hourglass with flowing sand',
          'unicode': '23f3'
        },
        {
          'name': 'watch',
          'unicode': '231a'
        },
        {
          'name': 'alarm clock',
          'unicode': '23f0'
        },
        {
          'name': 'stopwatch',
          'unicode': '23f1'
        },
        {
          'name': 'timer clock',
          'unicode': '23f2'
        },
        {
          'name': 'mantlepiece clock',
          'unicode': '1f570'
        },
        {
          'name': 'thermometer',
          'unicode': '1f321'
        },
        {
          'name': 'umbrella on ground',
          'unicode': '26f1'
        },
        {
          'name': 'balloon',
          'unicode': '1f388'
        },
        {
          'name': 'party popper',
          'unicode': '1f389'
        },
        {
          'name': 'confetti ball',
          'unicode': '1f38a'
        },
        {
          'name': 'japanese dolls',
          'unicode': '1f38e'
        },
        {
          'name': 'carp streamer',
          'unicode': '1f38f'
        },
        {
          'name': 'wind chime',
          'unicode': '1f390'
        },
        {
          'name': 'ribbon',
          'unicode': '1f380'
        },
        {
          'name': 'wrapped present',
          'unicode': '1f381'
        },
        {
          'name': 'joystick',
          'unicode': '1f579'
        },
        {
          'name': 'postal horn',
          'unicode': '1f4ef'
        },
        {
          'name': 'studio microphone',
          'unicode': '1f399'
        },
        {
          'name': 'level slider',
          'unicode': '1f39a'
        },
        {
          'name': 'control knobs',
          'unicode': '1f39b'
        },
        {
          'name': 'radio',
          'unicode': '1f4fb'
        },
        {
          'name': 'mobile phone',
          'unicode': '1f4f1'
        },
        {
          'name': 'mobile phone with rightwards arrow at left',
          'unicode': '1f4f2'
        },
        {
          'name': 'black telephone',
          'unicode': '260e'
        },
        {
          'name': 'telephone receiver',
          'unicode': '1f4de'
        },
        {
          'name': 'pager',
          'unicode': '1f4df'
        },
        {
          'name': 'fax machine',
          'unicode': '1f4e0'
        },
        {
          'name': 'battery',
          'unicode': '1f50b'
        },
        {
          'name': 'electric plug',
          'unicode': '1f50c'
        },
        {
          'name': 'personal computer',
          'unicode': '1f4bb'
        },
        {
          'name': 'desktop computer',
          'unicode': '1f5a5'
        },
        {
          'name': 'printer',
          'unicode': '1f5a8'
        },
        {
          'name': 'keyboard',
          'unicode': '2328'
        },
        {
          'name': 'three button mouse',
          'unicode': '1f5b1'
        },
        {
          'name': 'trackball',
          'unicode': '1f5b2'
        },
        {
          'name': 'minidisc',
          'unicode': '1f4bd'
        },
        {
          'name': 'floppy disk',
          'unicode': '1f4be'
        },
        {
          'name': 'optical disc',
          'unicode': '1f4bf'
        },
        {
          'name': 'dvd',
          'unicode': '1f4c0'
        },
        {
          'name': 'movie camera',
          'unicode': '1f3a5'
        },
        {
          'name': 'film frames',
          'unicode': '1f39e'
        },
        {
          'name': 'film projector',
          'unicode': '1f4fd'
        },
        {
          'name': 'television',
          'unicode': '1f4fa'
        },
        {
          'name': 'camera',
          'unicode': '1f4f7'
        },
        {
          'name': 'camera with flash',
          'unicode': '1f4f8'
        },
        {
          'name': 'video camera',
          'unicode': '1f4f9'
        },
        {
          'name': 'videocassette',
          'unicode': '1f4fc'
        },
        {
          'name': 'left-pointing magnifying glass',
          'unicode': '1f50d'
        },
        {
          'name': 'right-pointing magnifying glass',
          'unicode': '1f50e'
        },
        {
          'name': 'microscope',
          'unicode': '1f52c'
        },
        {
          'name': 'telescope',
          'unicode': '1f52d'
        },
        {
          'name': 'satellite antenna',
          'unicode': '1f4e1'
        },
        {
          'name': 'candle',
          'unicode': '1f56f'
        },
        {
          'name': 'electric light bulb',
          'unicode': '1f4a1'
        },
        {
          'name': 'electric torch',
          'unicode': '1f526'
        },
        {
          'name': 'izakaya lantern',
          'unicode': '1f3ee'
        },
        {
          'name': 'notebook with decorative cover',
          'unicode': '1f4d4'
        },
        {
          'name': 'closed book',
          'unicode': '1f4d5'
        },
        {
          'name': 'open book',
          'unicode': '1f4d6'
        },
        {
          'name': 'green book',
          'unicode': '1f4d7'
        },
        {
          'name': 'blue book',
          'unicode': '1f4d8'
        },
        {
          'name': 'orange book',
          'unicode': '1f4d9'
        },
        {
          'name': 'books',
          'unicode': '1f4da'
        },
        {
          'name': 'notebook',
          'unicode': '1f4d3'
        },
        {
          'name': 'ledger',
          'unicode': '1f4d2'
        },
        {
          'name': 'page with curl',
          'unicode': '1f4c3'
        },
        {
          'name': 'scroll',
          'unicode': '1f4dc'
        },
        {
          'name': 'page facing up',
          'unicode': '1f4c4'
        },
        {
          'name': 'newspaper',
          'unicode': '1f4f0'
        },
        {
          'name': 'rolled-up newspaper',
          'unicode': '1f5de'
        },
        {
          'name': 'bookmark tabs',
          'unicode': '1f4d1'
        },
        {
          'name': 'bookmark',
          'unicode': '1f516'
        },
        {
          'name': 'label',
          'unicode': '1f3f7'
        },
        {
          'name': 'money bag',
          'unicode': '1f4b0'
        },
        {
          'name': 'banknote with yen sign',
          'unicode': '1f4b4'
        },
        {
          'name': 'banknote with dollar sign',
          'unicode': '1f4b5'
        },
        {
          'name': 'banknote with euro sign',
          'unicode': '1f4b6'
        },
        {
          'name': 'banknote with pound sign',
          'unicode': '1f4b7'
        },
        {
          'name': 'money with wings',
          'unicode': '1f4b8'
        },
        {
          'name': 'credit card',
          'unicode': '1f4b3'
        },
        {
          'name': 'envelope',
          'unicode': '2709'
        },
        {
          'name': 'e-mail symbol',
          'unicode': '1f4e7'
        },
        {
          'name': 'incoming envelope',
          'unicode': '1f4e8'
        },
        {
          'name': 'envelope with downwards arrow above',
          'unicode': '1f4e9'
        },
        {
          'name': 'outbox tray',
          'unicode': '1f4e4'
        },
        {
          'name': 'inbox tray',
          'unicode': '1f4e5'
        },
        {
          'name': 'package',
          'unicode': '1f4e6'
        },
        {
          'name': 'closed mailbox with raised flag',
          'unicode': '1f4eb'
        },
        {
          'name': 'closed mailbox with lowered flag',
          'unicode': '1f4ea'
        },
        {
          'name': 'open mailbox with raised flag',
          'unicode': '1f4ec'
        },
        {
          'name': 'open mailbox with lowered flag',
          'unicode': '1f4ed'
        },
        {
          'name': 'postbox',
          'unicode': '1f4ee'
        },
        {
          'name': 'ballot box with ballot',
          'unicode': '1f5f3'
        },
        {
          'name': 'pencil',
          'unicode': '270f'
        },
        {
          'name': 'black nib',
          'unicode': '2712'
        },
        {
          'name': 'lower left fountain pen',
          'unicode': '1f58b'
        },
        {
          'name': 'lower left ballpoint pen',
          'unicode': '1f58a'
        },
        {
          'name': 'lower left paintbrush',
          'unicode': '1f58c'
        },
        {
          'name': 'lower left crayon',
          'unicode': '1f58d'
        },
        {
          'name': 'memo',
          'unicode': '1f4dd'
        },
        {
          'name': 'file folder',
          'unicode': '1f4c1'
        },
        {
          'name': 'open file folder',
          'unicode': '1f4c2'
        },
        {
          'name': 'card index dividers',
          'unicode': '1f5c2'
        },
        {
          'name': 'calendar',
          'unicode': '1f4c5'
        },
        {
          'name': 'tear-off calendar',
          'unicode': '1f4c6'
        },
        {
          'name': 'spiral note pad',
          'unicode': '1f5d2'
        },
        {
          'name': 'spiral calendar pad',
          'unicode': '1f5d3'
        },
        {
          'name': 'card index',
          'unicode': '1f4c7'
        },
        {
          'name': 'chart with upwards trend',
          'unicode': '1f4c8'
        },
        {
          'name': 'chart with downwards trend',
          'unicode': '1f4c9'
        },
        {
          'name': 'bar chart',
          'unicode': '1f4ca'
        },
        {
          'name': 'clipboard',
          'unicode': '1f4cb'
        },
        {
          'name': 'pushpin',
          'unicode': '1f4cc'
        },
        {
          'name': 'round pushpin',
          'unicode': '1f4cd'
        },
        {
          'name': 'paperclip',
          'unicode': '1f4ce'
        },
        {
          'name': 'linked paperclips',
          'unicode': '1f587'
        },
        {
          'name': 'straight ruler',
          'unicode': '1f4cf'
        },
        {
          'name': 'triangular ruler',
          'unicode': '1f4d0'
        },
        {
          'name': 'black scissors',
          'unicode': '2702'
        },
        {
          'name': 'card file box',
          'unicode': '1f5c3'
        },
        {
          'name': 'file cabinet',
          'unicode': '1f5c4'
        },
        {
          'name': 'wastebasket',
          'unicode': '1f5d1'
        },
        {
          'name': 'lock',
          'unicode': '1f512'
        },
        {
          'name': 'open lock',
          'unicode': '1f513'
        },
        {
          'name': 'lock with ink pen',
          'unicode': '1f50f'
        },
        {
          'name': 'closed lock with key',
          'unicode': '1f510'
        },
        {
          'name': 'key',
          'unicode': '1f511'
        },
        {
          'name': 'old key',
          'unicode': '1f5dd'
        },
        {
          'name': 'hammer',
          'unicode': '1f528'
        },
        {
          'name': 'pick',
          'unicode': '26cf'
        },
        {
          'name': 'hammer and pick',
          'unicode': '2692'
        },
        {
          'name': 'hammer and wrench',
          'unicode': '1f6e0'
        },
        {
          'name': 'dagger knife',
          'unicode': '1f5e1'
        },
        {
          'name': 'crossed swords',
          'unicode': '2694'
        },
        {
          'name': 'pistol',
          'unicode': '1f52b'
        },
        {
          'name': 'shield',
          'unicode': '1f6e1'
        },
        {
          'name': 'wrench',
          'unicode': '1f527'
        },
        {
          'name': 'nut and bolt',
          'unicode': '1f529'
        },
        {
          'name': 'gear',
          'unicode': '2699'
        },
        {
          'name': 'compression',
          'unicode': '1f5dc'
        },
        {
          'name': 'alembic',
          'unicode': '2697'
        },
        {
          'name': 'scales',
          'unicode': '2696'
        },
        {
          'name': 'link symbol',
          'unicode': '1f517'
        },
        {
          'name': 'chains',
          'unicode': '26d3'
        },
        {
          'name': 'syringe',
          'unicode': '1f489'
        },
        {
          'name': 'pill',
          'unicode': '1f48a'
        },
        {
          'name': 'smoking symbol',
          'unicode': '1f6ac'
        },
        {
          'name': 'coffin',
          'unicode': '26b0'
        },
        {
          'name': 'funeral urn',
          'unicode': '26b1'
        },
        {
          'name': 'moyai',
          'unicode': '1f5ff'
        },
        {
          'name': 'oil drum',
          'unicode': '1f6e2'
        },
        {
          'name': 'crystal ball',
          'unicode': '1f52e'
        },
        {
          'name': 'shopping trolley',
          'unicode': '1f6d2'
        },
        {
          'name': 'triangular flag on post',
          'unicode': '1f6a9'
        },
        {
          'name': 'crossed flags',
          'unicode': '1f38c'
        },
        {
          'name': 'waving black flag',
          'unicode': '1f3f4'
        },
        {
          'name': 'waving white flag',
          'unicode': '1f3f3'
        },
        {
          'name': 'rainbow_flag',
          'unicode': '1f308'
        }
      ]
    },
    {
      'heading': 'activity',
      'icon': '1f3c8',
      'emojis': [
        {
          'name': 'alien monster',
          'unicode': '1f47e'
        },
        {
          'name': 'man in business suit levitating',
          'unicode': '1f574'
        },
        {
          'name': 'fencer',
          'unicode': '1f93a'
        },
        {
          'name': 'horse racing',
          'unicode': '1f3c7'
        },
        {
          'name': 'skier',
          'unicode': '26f7'
        },
        {
          'name': 'snowboarder',
          'unicode': '1f3c2'
        },
        {
          'name': 'golfer',
          'unicode': '1f3cc'
        },
        {
          'name': 'surfer',
          'unicode': '1f3c4'
        },
        {
          'name': 'rowboat',
          'unicode': '1f6a3'
        },
        {
          'name': 'swimmer',
          'unicode': '1f3ca'
        },
        {
          'name': 'person with ball',
          'unicode': '26f9'
        },
        {
          'name': 'weight lifter',
          'unicode': '1f3cb'
        },
        {
          'name': 'bicyclist',
          'unicode': '1f6b4'
        },
        {
          'name': 'mountain bicyclist',
          'unicode': '1f6b5'
        },
        {
          'name': 'person doing cartwheel',
          'unicode': '1f938'
        },
        {
          'name': 'wrestlers',
          'unicode': '1f93c'
        },
        {
          'name': 'water polo',
          'unicode': '1f93d'
        },
        {
          'name': 'handball',
          'unicode': '1f93e'
        },
        {
          'name': 'juggling',
          'unicode': '1f939'
        },
        {
          'name': 'circus tent',
          'unicode': '1f3aa'
        },
        {
          'name': 'performing arts',
          'unicode': '1f3ad'
        },
        {
          'name': 'artist palette',
          'unicode': '1f3a8'
        },
        {
          'name': 'slot machine',
          'unicode': '1f3b0'
        },
        {
          'name': 'bath',
          'unicode': '1f6c0'
        },
        {
          'name': 'reminder ribbon',
          'unicode': '1f397'
        },
        {
          'name': 'admission tickets',
          'unicode': '1f39f'
        },
        {
          'name': 'ticket',
          'unicode': '1f3ab'
        },
        {
          'name': 'military medal',
          'unicode': '1f396'
        },
        {
          'name': 'trophy',
          'unicode': '1f3c6'
        },
        {
          'name': 'sports medal',
          'unicode': '1f3c5'
        },
        {
          'name': 'first place medal',
          'unicode': '1f947'
        },
        {
          'name': 'second place medal',
          'unicode': '1f948'
        },
        {
          'name': 'third place medal',
          'unicode': '1f949'
        },
        {
          'name': 'soccer ball',
          'unicode': '26bd'
        },
        {
          'name': 'baseball',
          'unicode': '26be'
        },
        {
          'name': 'basketball and hoop',
          'unicode': '1f3c0'
        },
        {
          'name': 'volleyball',
          'unicode': '1f3d0'
        },
        {
          'name': 'american football',
          'unicode': '1f3c8'
        },
        {
          'name': 'rugby football',
          'unicode': '1f3c9'
        },
        {
          'name': 'tennis racquet and ball',
          'unicode': '1f3be'
        },
        {
          'name': 'billiards',
          'unicode': '1f3b1'
        },
        {
          'name': 'bowling',
          'unicode': '1f3b3'
        },
        {
          'name': 'cricket bat and ball',
          'unicode': '1f3cf'
        },
        {
          'name': 'field hockey stick and ball',
          'unicode': '1f3d1'
        },
        {
          'name': 'ice hockey stick and puck',
          'unicode': '1f3d2'
        },
        {
          'name': 'table tennis paddle and ball',
          'unicode': '1f3d3'
        },
        {
          'name': 'badminton racquet',
          'unicode': '1f3f8'
        },
        {
          'name': 'boxing glove',
          'unicode': '1f94a'
        },
        {
          'name': 'martial arts uniform',
          'unicode': '1f94b'
        },
        {
          'name': 'goal net',
          'unicode': '1f945'
        },
        {
          'name': 'direct hit',
          'unicode': '1f3af'
        },
        {
          'name': 'flag in hole',
          'unicode': '26f3'
        },
        {
          'name': 'ice skate',
          'unicode': '26f8'
        },
        {
          'name': 'fishing pole and fish',
          'unicode': '1f3a3'
        },
        {
          'name': 'running shirt with sash',
          'unicode': '1f3bd'
        },
        {
          'name': 'ski and ski boot',
          'unicode': '1f3bf'
        },
        {
          'name': 'video game',
          'unicode': '1f3ae'
        },
        {
          'name': 'game die',
          'unicode': '1f3b2'
        },
        {
          'name': 'musical score',
          'unicode': '1f3bc'
        },
        {
          'name': 'microphone',
          'unicode': '1f3a4'
        },
        {
          'name': 'headphone',
          'unicode': '1f3a7'
        },
        {
          'name': 'saxophone',
          'unicode': '1f3b7'
        },
        {
          'name': 'guitar',
          'unicode': '1f3b8'
        },
        {
          'name': 'musical keyboard',
          'unicode': '1f3b9'
        },
        {
          'name': 'trumpet',
          'unicode': '1f3ba'
        },
        {
          'name': 'violin',
          'unicode': '1f3bb'
        },
        {
          'name': 'drum with drumsticks',
          'unicode': '1f941'
        },
        {
          'name': 'clapper board',
          'unicode': '1f3ac'
        },
        {
          'name': 'bow and arrow',
          'unicode': '1f3f9'
        }
      ]
    },
    {
      'heading': 'nature',
      'icon': '1f33f',
      'emojis': [
        {
          'name': 'see-no-evil monkey',
          'unicode': '1f648'
        },
        {
          'name': 'hear-no-evil monkey',
          'unicode': '1f649'
        },
        {
          'name': 'speak-no-evil monkey',
          'unicode': '1f64a'
        },
        {
          'name': 'splashing sweat symbol',
          'unicode': '1f4a6'
        },
        {
          'name': 'dash symbol',
          'unicode': '1f4a8'
        },
        {
          'name': 'monkey face',
          'unicode': '1f435'
        },
        {
          'name': 'monkey',
          'unicode': '1f412'
        },
        {
          'name': 'gorilla',
          'unicode': '1f98d'
        },
        {
          'name': 'dog face',
          'unicode': '1f436'
        },
        {
          'name': 'dog',
          'unicode': '1f415'
        },
        {
          'name': 'poodle',
          'unicode': '1f429'
        },
        {
          'name': 'wolf face',
          'unicode': '1f43a'
        },
        {
          'name': 'fox face',
          'unicode': '1f98a'
        },
        {
          'name': 'cat face',
          'unicode': '1f431'
        },
        {
          'name': 'cat',
          'unicode': '1f408'
        },
        {
          'name': 'lion face',
          'unicode': '1f981'
        },
        {
          'name': 'tiger face',
          'unicode': '1f42f'
        },
        {
          'name': 'tiger',
          'unicode': '1f405'
        },
        {
          'name': 'leopard',
          'unicode': '1f406'
        },
        {
          'name': 'horse face',
          'unicode': '1f434'
        },
        {
          'name': 'horse',
          'unicode': '1f40e'
        },
        {
          'name': 'deer',
          'unicode': '1f98c'
        },
        {
          'name': 'unicorn face',
          'unicode': '1f984'
        },
        {
          'name': 'cow face',
          'unicode': '1f42e'
        },
        {
          'name': 'ox',
          'unicode': '1f402'
        },
        {
          'name': 'water buffalo',
          'unicode': '1f403'
        },
        {
          'name': 'cow',
          'unicode': '1f404'
        },
        {
          'name': 'pig face',
          'unicode': '1f437'
        },
        {
          'name': 'pig',
          'unicode': '1f416'
        },
        {
          'name': 'boar',
          'unicode': '1f417'
        },
        {
          'name': 'pig nose',
          'unicode': '1f43d'
        },
        {
          'name': 'ram',
          'unicode': '1f40f'
        },
        {
          'name': 'sheep',
          'unicode': '1f411'
        },
        {
          'name': 'goat',
          'unicode': '1f410'
        },
        {
          'name': 'dromedary camel',
          'unicode': '1f42a'
        },
        {
          'name': 'bactrian camel',
          'unicode': '1f42b'
        },
        {
          'name': 'elephant',
          'unicode': '1f418'
        },
        {
          'name': 'rhinoceros',
          'unicode': '1f98f'
        },
        {
          'name': 'mouse face',
          'unicode': '1f42d'
        },
        {
          'name': 'mouse',
          'unicode': '1f401'
        },
        {
          'name': 'rat',
          'unicode': '1f400'
        },
        {
          'name': 'hamster face',
          'unicode': '1f439'
        },
        {
          'name': 'rabbit face',
          'unicode': '1f430'
        },
        {
          'name': 'rabbit',
          'unicode': '1f407'
        },
        {
          'name': 'chipmunk',
          'unicode': '1f43f'
        },
        {
          'name': 'bat',
          'unicode': '1f987'
        },
        {
          'name': 'bear face',
          'unicode': '1f43b'
        },
        {
          'name': 'koala',
          'unicode': '1f428'
        },
        {
          'name': 'panda face',
          'unicode': '1f43c'
        },
        {
          'name': 'paw prints',
          'unicode': '1f43e'
        },
        {
          'name': 'turkey',
          'unicode': '1f983'
        },
        {
          'name': 'chicken',
          'unicode': '1f414'
        },
        {
          'name': 'rooster',
          'unicode': '1f413'
        },
        {
          'name': 'hatching chick',
          'unicode': '1f423'
        },
        {
          'name': 'baby chick',
          'unicode': '1f424'
        },
        {
          'name': 'front-facing baby chick',
          'unicode': '1f425'
        },
        {
          'name': 'bird',
          'unicode': '1f426'
        },
        {
          'name': 'penguin',
          'unicode': '1f427'
        },
        {
          'name': 'dove of peace',
          'unicode': '1f54a'
        },
        {
          'name': 'eagle',
          'unicode': '1f985'
        },
        {
          'name': 'duck',
          'unicode': '1f986'
        },
        {
          'name': 'owl',
          'unicode': '1f989'
        },
        {
          'name': 'frog face',
          'unicode': '1f438'
        },
        {
          'name': 'crocodile',
          'unicode': '1f40a'
        },
        {
          'name': 'turtle',
          'unicode': '1f422'
        },
        {
          'name': 'lizard',
          'unicode': '1f98e'
        },
        {
          'name': 'snake',
          'unicode': '1f40d'
        },
        {
          'name': 'dragon face',
          'unicode': '1f432'
        },
        {
          'name': 'dragon',
          'unicode': '1f409'
        },
        {
          'name': 'spouting whale',
          'unicode': '1f433'
        },
        {
          'name': 'whale',
          'unicode': '1f40b'
        },
        {
          'name': 'dolphin',
          'unicode': '1f42c'
        },
        {
          'name': 'fish',
          'unicode': '1f41f'
        },
        {
          'name': 'tropical fish',
          'unicode': '1f420'
        },
        {
          'name': 'blowfish',
          'unicode': '1f421'
        },
        {
          'name': 'shark',
          'unicode': '1f988'
        },
        {
          'name': 'octopus',
          'unicode': '1f419'
        },
        {
          'name': 'spiral shell',
          'unicode': '1f41a'
        },
        {
          'name': 'crab',
          'unicode': '1f980'
        },
        {
          'name': 'shrimp',
          'unicode': '1f990'
        },
        {
          'name': 'squid',
          'unicode': '1f991'
        },
        {
          'name': 'butterfly',
          'unicode': '1f98b'
        },
        {
          'name': 'snail',
          'unicode': '1f40c'
        },
        {
          'name': 'bug',
          'unicode': '1f41b'
        },
        {
          'name': 'ant',
          'unicode': '1f41c'
        },
        {
          'name': 'honeybee',
          'unicode': '1f41d'
        },
        {
          'name': 'lady beetle',
          'unicode': '1f41e'
        },
        {
          'name': 'spider',
          'unicode': '1f577'
        },
        {
          'name': 'spider web',
          'unicode': '1f578'
        },
        {
          'name': 'scorpion',
          'unicode': '1f982'
        },
        {
          'name': 'bouquet',
          'unicode': '1f490'
        },
        {
          'name': 'cherry blossom',
          'unicode': '1f338'
        },
        {
          'name': 'rosette',
          'unicode': '1f3f5'
        },
        {
          'name': 'rose',
          'unicode': '1f339'
        },
        {
          'name': 'wilted flower',
          'unicode': '1f940'
        },
        {
          'name': 'hibiscus',
          'unicode': '1f33a'
        },
        {
          'name': 'sunflower',
          'unicode': '1f33b'
        },
        {
          'name': 'blossom',
          'unicode': '1f33c'
        },
        {
          'name': 'tulip',
          'unicode': '1f337'
        },
        {
          'name': 'seedling',
          'unicode': '1f331'
        },
        {
          'name': 'evergreen tree',
          'unicode': '1f332'
        },
        {
          'name': 'deciduous tree',
          'unicode': '1f333'
        },
        {
          'name': 'palm tree',
          'unicode': '1f334'
        },
        {
          'name': 'cactus',
          'unicode': '1f335'
        },
        {
          'name': 'ear of rice',
          'unicode': '1f33e'
        },
        {
          'name': 'herb',
          'unicode': '1f33f'
        },
        {
          'name': 'shamrock',
          'unicode': '2618'
        },
        {
          'name': 'four leaf clover',
          'unicode': '1f340'
        },
        {
          'name': 'maple leaf',
          'unicode': '1f341'
        },
        {
          'name': 'fallen leaf',
          'unicode': '1f342'
        },
        {
          'name': 'leaf fluttering in wind',
          'unicode': '1f343'
        },
        {
          'name': 'mushroom',
          'unicode': '1f344'
        },
        {
          'name': 'chestnut',
          'unicode': '1f330'
        },
        {
          'name': 'earth globe europe-africa',
          'unicode': '1f30d'
        },
        {
          'name': 'earth globe americas',
          'unicode': '1f30e'
        },
        {
          'name': 'earth globe asia-australia',
          'unicode': '1f30f'
        },
        {
          'name': 'new moon symbol',
          'unicode': '1f311'
        },
        {
          'name': 'waxing crescent moon symbol',
          'unicode': '1f312'
        },
        {
          'name': 'first quarter moon symbol',
          'unicode': '1f313'
        },
        {
          'name': 'waxing gibbous moon symbol',
          'unicode': '1f314'
        },
        {
          'name': 'full moon symbol',
          'unicode': '1f315'
        },
        {
          'name': 'waning gibbous moon symbol',
          'unicode': '1f316'
        },
        {
          'name': 'last quarter moon symbol',
          'unicode': '1f317'
        },
        {
          'name': 'waning crescent moon symbol',
          'unicode': '1f318'
        },
        {
          'name': 'crescent moon',
          'unicode': '1f319'
        },
        {
          'name': 'new moon with face',
          'unicode': '1f31a'
        },
        {
          'name': 'first quarter moon with face',
          'unicode': '1f31b'
        },
        {
          'name': 'last quarter moon with face',
          'unicode': '1f31c'
        },
        {
          'name': 'black sun with rays',
          'unicode': '2600'
        },
        {
          'name': 'full moon with face',
          'unicode': '1f31d'
        },
        {
          'name': 'sun with face',
          'unicode': '1f31e'
        },
        {
          'name': 'white medium star',
          'unicode': '2b50'
        },
        {
          'name': 'glowing star',
          'unicode': '1f31f'
        },
        {
          'name': 'cloud',
          'unicode': '2601'
        },
        {
          'name': 'sun behind cloud',
          'unicode': '26c5'
        },
        {
          'name': 'thunder cloud and rain',
          'unicode': '26c8'
        },
        {
          'name': 'white sun with small cloud',
          'unicode': '1f324'
        },
        {
          'name': 'white sun behind cloud',
          'unicode': '1f325'
        },
        {
          'name': 'white sun behind cloud with rain',
          'unicode': '1f326'
        },
        {
          'name': 'cloud with rain',
          'unicode': '1f327'
        },
        {
          'name': 'cloud with snow',
          'unicode': '1f328'
        },
        {
          'name': 'cloud with lightning',
          'unicode': '1f329'
        },
        {
          'name': 'cloud with tornado',
          'unicode': '1f32a'
        },
        {
          'name': 'fog',
          'unicode': '1f32b'
        },
        {
          'name': 'wind blowing face',
          'unicode': '1f32c'
        },
        {
          'name': 'umbrella',
          'unicode': '2602'
        },
        {
          'name': 'umbrella with rain drops',
          'unicode': '2614'
        },
        {
          'name': 'high voltage sign',
          'unicode': '26a1'
        },
        {
          'name': 'snowflake',
          'unicode': '2744'
        },
        {
          'name': 'snowman',
          'unicode': '2603'
        },
        {
          'name': 'snowman without snow',
          'unicode': '26c4'
        },
        {
          'name': 'comet',
          'unicode': '2604'
        },
        {
          'name': 'fire',
          'unicode': '1f525'
        },
        {
          'name': 'droplet',
          'unicode': '1f4a7'
        },
        {
          'name': 'water wave',
          'unicode': '1f30a'
        },
        {
          'name': 'jack-o-lantern',
          'unicode': '1f383'
        },
        {
          'name': 'christmas tree',
          'unicode': '1f384'
        },
        {
          'name': 'sparkles',
          'unicode': '2728'
        },
        {
          'name': 'tanabata tree',
          'unicode': '1f38b'
        },
        {
          'name': 'pine decoration',
          'unicode': '1f38d'
        }
      ]
    },
    {
      'heading': 'travel',
      'icon': '2708',
      'emojis': [
        {
          'name': 'racing car',
          'unicode': '1f3ce'
        },
        {
          'name': 'racing motorcycle',
          'unicode': '1f3cd'
        },
        {
          'name': 'silhouette of japan',
          'unicode': '1f5fe'
        },
        {
          'name': 'snow capped mountain',
          'unicode': '1f3d4'
        },
        {
          'name': 'mountain',
          'unicode': '26f0'
        },
        {
          'name': 'volcano',
          'unicode': '1f30b'
        },
        {
          'name': 'mount fuji',
          'unicode': '1f5fb'
        },
        {
          'name': 'camping',
          'unicode': '1f3d5'
        },
        {
          'name': 'beach with umbrella',
          'unicode': '1f3d6'
        },
        {
          'name': 'desert',
          'unicode': '1f3dc'
        },
        {
          'name': 'desert island',
          'unicode': '1f3dd'
        },
        {
          'name': 'national park',
          'unicode': '1f3de'
        },
        {
          'name': 'stadium',
          'unicode': '1f3df'
        },
        {
          'name': 'classical building',
          'unicode': '1f3db'
        },
        {
          'name': 'building construction',
          'unicode': '1f3d7'
        },
        {
          'name': 'house buildings',
          'unicode': '1f3d8'
        },
        {
          'name': 'cityscape',
          'unicode': '1f3d9'
        },
        {
          'name': 'derelict house building',
          'unicode': '1f3da'
        },
        {
          'name': 'house building',
          'unicode': '1f3e0'
        },
        {
          'name': 'house with garden',
          'unicode': '1f3e1'
        },
        {
          'name': 'office building',
          'unicode': '1f3e2'
        },
        {
          'name': 'japanese post office',
          'unicode': '1f3e3'
        },
        {
          'name': 'european post office',
          'unicode': '1f3e4'
        },
        {
          'name': 'hospital',
          'unicode': '1f3e5'
        },
        {
          'name': 'bank',
          'unicode': '1f3e6'
        },
        {
          'name': 'hotel',
          'unicode': '1f3e8'
        },
        {
          'name': 'love hotel',
          'unicode': '1f3e9'
        },
        {
          'name': 'convenience store',
          'unicode': '1f3ea'
        },
        {
          'name': 'school',
          'unicode': '1f3eb'
        },
        {
          'name': 'department store',
          'unicode': '1f3ec'
        },
        {
          'name': 'factory',
          'unicode': '1f3ed'
        },
        {
          'name': 'japanese castle',
          'unicode': '1f3ef'
        },
        {
          'name': 'european castle',
          'unicode': '1f3f0'
        },
        {
          'name': 'wedding',
          'unicode': '1f492'
        },
        {
          'name': 'tokyo tower',
          'unicode': '1f5fc'
        },
        {
          'name': 'statue of liberty',
          'unicode': '1f5fd'
        },
        {
          'name': 'church',
          'unicode': '26ea'
        },
        {
          'name': 'mosque',
          'unicode': '1f54c'
        },
        {
          'name': 'synagogue',
          'unicode': '1f54d'
        },
        {
          'name': 'shinto shrine',
          'unicode': '26e9'
        },
        {
          'name': 'kaaba',
          'unicode': '1f54b'
        },
        {
          'name': 'fountain',
          'unicode': '26f2'
        },
        {
          'name': 'tent',
          'unicode': '26fa'
        },
        {
          'name': 'foggy',
          'unicode': '1f301'
        },
        {
          'name': 'night with stars',
          'unicode': '1f303'
        },
        {
          'name': 'sunrise over mountains',
          'unicode': '1f304'
        },
        {
          'name': 'sunrise',
          'unicode': '1f305'
        },
        {
          'name': 'cityscape at dusk',
          'unicode': '1f306'
        },
        {
          'name': 'sunset over buildings',
          'unicode': '1f307'
        },
        {
          'name': 'bridge at night',
          'unicode': '1f309'
        },
        {
          'name': 'milky way',
          'unicode': '1f30c'
        },
        {
          'name': 'carousel horse',
          'unicode': '1f3a0'
        },
        {
          'name': 'ferris wheel',
          'unicode': '1f3a1'
        },
        {
          'name': 'roller coaster',
          'unicode': '1f3a2'
        },
        {
          'name': 'steam locomotive',
          'unicode': '1f682'
        },
        {
          'name': 'railway car',
          'unicode': '1f683'
        },
        {
          'name': 'high-speed train',
          'unicode': '1f684'
        },
        {
          'name': 'high-speed train with bullet nose',
          'unicode': '1f685'
        },
        {
          'name': 'train',
          'unicode': '1f686'
        },
        {
          'name': 'metro',
          'unicode': '1f687'
        },
        {
          'name': 'light rail',
          'unicode': '1f688'
        },
        {
          'name': 'station',
          'unicode': '1f689'
        },
        {
          'name': 'tram',
          'unicode': '1f68a'
        },
        {
          'name': 'monorail',
          'unicode': '1f69d'
        },
        {
          'name': 'mountain railway',
          'unicode': '1f69e'
        },
        {
          'name': 'tram car',
          'unicode': '1f68b'
        },
        {
          'name': 'bus',
          'unicode': '1f68c'
        },
        {
          'name': 'oncoming bus',
          'unicode': '1f68d'
        },
        {
          'name': 'trolleybus',
          'unicode': '1f68e'
        },
        {
          'name': 'minibus',
          'unicode': '1f690'
        },
        {
          'name': 'ambulance',
          'unicode': '1f691'
        },
        {
          'name': 'fire engine',
          'unicode': '1f692'
        },
        {
          'name': 'police car',
          'unicode': '1f693'
        },
        {
          'name': 'oncoming police car',
          'unicode': '1f694'
        },
        {
          'name': 'taxi',
          'unicode': '1f695'
        },
        {
          'name': 'oncoming taxi',
          'unicode': '1f696'
        },
        {
          'name': 'automobile',
          'unicode': '1f697'
        },
        {
          'name': 'oncoming automobile',
          'unicode': '1f698'
        },
        {
          'name': 'recreational vehicle',
          'unicode': '1f699'
        },
        {
          'name': 'delivery truck',
          'unicode': '1f69a'
        },
        {
          'name': 'articulated lorry',
          'unicode': '1f69b'
        },
        {
          'name': 'tractor',
          'unicode': '1f69c'
        },
        {
          'name': 'bicycle',
          'unicode': '1f6b2'
        },
        {
          'name': 'scooter',
          'unicode': '1f6f4'
        },
        {
          'name': 'motor scooter',
          'unicode': '1f6f5'
        },
        {
          'name': 'bus stop',
          'unicode': '1f68f'
        },
        {
          'name': 'motorway',
          'unicode': '1f6e3'
        },
        {
          'name': 'railway track',
          'unicode': '1f6e4'
        },
        {
          'name': 'fuel pump',
          'unicode': '26fd'
        },
        {
          'name': 'police cars revolving light',
          'unicode': '1f6a8'
        },
        {
          'name': 'horizontal traffic light',
          'unicode': '1f6a5'
        },
        {
          'name': 'vertical traffic light',
          'unicode': '1f6a6'
        },
        {
          'name': 'construction sign',
          'unicode': '1f6a7'
        },
        {
          'name': 'anchor',
          'unicode': '2693'
        },
        {
          'name': 'sailboat',
          'unicode': '26f5'
        },
        {
          'name': 'canoe',
          'unicode': '1f6f6'
        },
        {
          'name': 'speedboat',
          'unicode': '1f6a4'
        },
        {
          'name': 'passenger ship',
          'unicode': '1f6f3'
        },
        {
          'name': 'ferry',
          'unicode': '26f4'
        },
        {
          'name': 'motorboat',
          'unicode': '1f6e5'
        },
        {
          'name': 'ship',
          'unicode': '1f6a2'
        },
        {
          'name': 'airplane',
          'unicode': '2708'
        },
        {
          'name': 'small airplane',
          'unicode': '1f6e9'
        },
        {
          'name': 'airplane departure',
          'unicode': '1f6eb'
        },
        {
          'name': 'airplane arriving',
          'unicode': '1f6ec'
        },
        {
          'name': 'seat',
          'unicode': '1f4ba'
        },
        {
          'name': 'helicopter',
          'unicode': '1f681'
        },
        {
          'name': 'suspension railway',
          'unicode': '1f69f'
        },
        {
          'name': 'mountain cableway',
          'unicode': '1f6a0'
        },
        {
          'name': 'aerial tramway',
          'unicode': '1f6a1'
        },
        {
          'name': 'rocket',
          'unicode': '1f680'
        },
        {
          'name': 'satellite',
          'unicode': '1f6f0'
        },
        {
          'name': 'shooting star',
          'unicode': '1f320'
        },
        {
          'name': 'rainbow',
          'unicode': '1f308'
        },
        {
          'name': 'fireworks',
          'unicode': '1f386'
        },
        {
          'name': 'firework sparkler',
          'unicode': '1f387'
        },
        {
          'name': 'moon viewing ceremony',
          'unicode': '1f391'
        },
        {
          'name': 'chequered flag',
          'unicode': '1f3c1'
        }
      ]
    },
    {
      'heading': 'symbols',
      'icon': '2764',
      'emojis': [
        {
          'name': 'heart with arrow',
          'unicode': '1f498'
        },
        {
          'name': 'heavy black heart',
          'unicode': '2764'
        },
        {
          'name': 'beating heart',
          'unicode': '1f493'
        },
        {
          'name': 'broken heart',
          'unicode': '1f494'
        },
        {
          'name': 'two hearts',
          'unicode': '1f495'
        },
        {
          'name': 'sparkling heart',
          'unicode': '1f496'
        },
        {
          'name': 'growing heart',
          'unicode': '1f497'
        },
        {
          'name': 'blue heart',
          'unicode': '1f499'
        },
        {
          'name': 'green heart',
          'unicode': '1f49a'
        },
        {
          'name': 'yellow heart',
          'unicode': '1f49b'
        },
        {
          'name': 'purple heart',
          'unicode': '1f49c'
        },
        {
          'name': 'black heart',
          'unicode': '1f5a4'
        },
        {
          'name': 'heart with ribbon',
          'unicode': '1f49d'
        },
        {
          'name': 'revolving hearts',
          'unicode': '1f49e'
        },
        {
          'name': 'heart decoration',
          'unicode': '1f49f'
        },
        {
          'name': 'heavy heart exclamation mark ornament',
          'unicode': '2763'
        },
        {
          'name': 'anger symbol',
          'unicode': '1f4a2'
        },
        {
          'name': 'collision symbol',
          'unicode': '1f4a5'
        },
        {
          'name': 'dizzy symbol',
          'unicode': '1f4ab'
        },
        {
          'name': 'speech balloon',
          'unicode': '1f4ac'
        },
        {
          'name': 'left speech bubble',
          'unicode': '1f5e8'
        },
        {
          'name': 'right anger bubble',
          'unicode': '1f5ef'
        },
        {
          'name': 'thought balloon',
          'unicode': '1f4ad'
        },
        {
          'name': 'white flower',
          'unicode': '1f4ae'
        },
        {
          'name': 'globe with meridians',
          'unicode': '1f310'
        },
        {
          'name': 'hot springs',
          'unicode': '2668'
        },
        {
          'name': 'octagonal sign',
          'unicode': '1f6d1'
        },
        {
          'name': 'cyclone',
          'unicode': '1f300'
        },
        {
          'name': 'black spade suit',
          'unicode': '2660'
        },
        {
          'name': 'black heart suit',
          'unicode': '2665'
        },
        {
          'name': 'black diamond suit',
          'unicode': '2666'
        },
        {
          'name': 'black club suit',
          'unicode': '2663'
        },
        {
          'name': 'playing card black joker',
          'unicode': '1f0cf'
        },
        {
          'name': 'mahjong tile red dragon',
          'unicode': '1f004'
        },
        {
          'name': 'flower playing cards',
          'unicode': '1f3b4'
        },
        {
          'name': 'speaker with cancellation stroke',
          'unicode': '1f507'
        },
        {
          'name': 'speaker',
          'unicode': '1f508'
        },
        {
          'name': 'speaker with one sound wave',
          'unicode': '1f509'
        },
        {
          'name': 'speaker with three sound waves',
          'unicode': '1f50a'
        },
        {
          'name': 'public address loudspeaker',
          'unicode': '1f4e2'
        },
        {
          'name': 'cheering megaphone',
          'unicode': '1f4e3'
        },
        {
          'name': 'bell',
          'unicode': '1f514'
        },
        {
          'name': 'bell with cancellation stroke',
          'unicode': '1f515'
        },
        {
          'name': 'musical note',
          'unicode': '1f3b5'
        },
        {
          'name': 'multiple musical notes',
          'unicode': '1f3b6'
        },
        {
          'name': 'chart with upwards trend and yen sign',
          'unicode': '1f4b9'
        },
        {
          'name': 'currency exchange',
          'unicode': '1f4b1'
        },
        {
          'name': 'heavy dollar sign',
          'unicode': '1f4b2'
        },
        {
          'name': 'automated teller machine',
          'unicode': '1f3e7'
        },
        {
          'name': 'put litter in its place symbol',
          'unicode': '1f6ae'
        },
        {
          'name': 'potable water symbol',
          'unicode': '1f6b0'
        },
        {
          'name': 'wheelchair symbol',
          'unicode': '267f'
        },
        {
          'name': 'mens symbol',
          'unicode': '1f6b9'
        },
        {
          'name': 'womens symbol',
          'unicode': '1f6ba'
        },
        {
          'name': 'restroom',
          'unicode': '1f6bb'
        },
        {
          'name': 'baby symbol',
          'unicode': '1f6bc'
        },
        {
          'name': 'water closet',
          'unicode': '1f6be'
        },
        {
          'name': 'passport control',
          'unicode': '1f6c2'
        },
        {
          'name': 'customs',
          'unicode': '1f6c3'
        },
        {
          'name': 'baggage claim',
          'unicode': '1f6c4'
        },
        {
          'name': 'left luggage',
          'unicode': '1f6c5'
        },
        {
          'name': 'warning sign',
          'unicode': '26a0'
        },
        {
          'name': 'children crossing',
          'unicode': '1f6b8'
        },
        {
          'name': 'no entry',
          'unicode': '26d4'
        },
        {
          'name': 'no entry sign',
          'unicode': '1f6ab'
        },
        {
          'name': 'no bicycles',
          'unicode': '1f6b3'
        },
        {
          'name': 'no smoking symbol',
          'unicode': '1f6ad'
        },
        {
          'name': 'do not litter symbol',
          'unicode': '1f6af'
        },
        {
          'name': 'non-potable water symbol',
          'unicode': '1f6b1'
        },
        {
          'name': 'no pedestrians',
          'unicode': '1f6b7'
        },
        {
          'name': 'no mobile phones',
          'unicode': '1f4f5'
        },
        {
          'name': 'no one under eighteen symbol',
          'unicode': '1f51e'
        },
        {
          'name': 'radioactive sign',
          'unicode': '2622'
        },
        {
          'name': 'biohazard sign',
          'unicode': '2623'
        }
      ]
    },
    {
      'heading': 'food',
      'icon': '1f354',
      'emojis': [
        {
          'name': 'grapes',
          'unicode': '1f347'
        },
        {
          'name': 'melon',
          'unicode': '1f348'
        },
        {
          'name': 'watermelon',
          'unicode': '1f349'
        },
        {
          'name': 'tangerine',
          'unicode': '1f34a'
        },
        {
          'name': 'lemon',
          'unicode': '1f34b'
        },
        {
          'name': 'banana',
          'unicode': '1f34c'
        },
        {
          'name': 'pineapple',
          'unicode': '1f34d'
        },
        {
          'name': 'red apple',
          'unicode': '1f34e'
        },
        {
          'name': 'green apple',
          'unicode': '1f34f'
        },
        {
          'name': 'pear',
          'unicode': '1f350'
        },
        {
          'name': 'peach',
          'unicode': '1f351'
        },
        {
          'name': 'cherries',
          'unicode': '1f352'
        },
        {
          'name': 'strawberry',
          'unicode': '1f353'
        },
        {
          'name': 'kiwifruit',
          'unicode': '1f95d'
        },
        {
          'name': 'tomato',
          'unicode': '1f345'
        },
        {
          'name': 'avocado',
          'unicode': '1f951'
        },
        {
          'name': 'aubergine',
          'unicode': '1f346'
        },
        {
          'name': 'potato',
          'unicode': '1f954'
        },
        {
          'name': 'carrot',
          'unicode': '1f955'
        },
        {
          'name': 'ear of maize',
          'unicode': '1f33d'
        },
        {
          'name': 'hot pepper',
          'unicode': '1f336'
        },
        {
          'name': 'cucumber',
          'unicode': '1f952'
        },
        {
          'name': 'peanuts',
          'unicode': '1f95c'
        },
        {
          'name': 'bread',
          'unicode': '1f35e'
        },
        {
          'name': 'croissant',
          'unicode': '1f950'
        },
        {
          'name': 'baguette bread',
          'unicode': '1f956'
        },
        {
          'name': 'pancakes',
          'unicode': '1f95e'
        },
        {
          'name': 'cheese wedge',
          'unicode': '1f9c0'
        },
        {
          'name': 'meat on bone',
          'unicode': '1f356'
        },
        {
          'name': 'poultry leg',
          'unicode': '1f357'
        },
        {
          'name': 'bacon',
          'unicode': '1f953'
        },
        {
          'name': 'hamburger',
          'unicode': '1f354'
        },
        {
          'name': 'french fries',
          'unicode': '1f35f'
        },
        {
          'name': 'slice of pizza',
          'unicode': '1f355'
        },
        {
          'name': 'hot dog',
          'unicode': '1f32d'
        },
        {
          'name': 'taco',
          'unicode': '1f32e'
        },
        {
          'name': 'burrito',
          'unicode': '1f32f'
        },
        {
          'name': 'stuffed flatbread',
          'unicode': '1f959'
        },
        {
          'name': 'egg',
          'unicode': '1f95a'
        },
        {
          'name': 'cooking',
          'unicode': '1f373'
        },
        {
          'name': 'shallow pan of food',
          'unicode': '1f958'
        },
        {
          'name': 'pot of food',
          'unicode': '1f372'
        },
        {
          'name': 'green salad',
          'unicode': '1f957'
        },
        {
          'name': 'popcorn',
          'unicode': '1f37f'
        },
        {
          'name': 'bento box',
          'unicode': '1f371'
        },
        {
          'name': 'rice cracker',
          'unicode': '1f358'
        },
        {
          'name': 'rice ball',
          'unicode': '1f359'
        },
        {
          'name': 'cooked rice',
          'unicode': '1f35a'
        },
        {
          'name': 'curry and rice',
          'unicode': '1f35b'
        },
        {
          'name': 'steaming bowl',
          'unicode': '1f35c'
        },
        {
          'name': 'spaghetti',
          'unicode': '1f35d'
        },
        {
          'name': 'roasted sweet potato',
          'unicode': '1f360'
        },
        {
          'name': 'oden',
          'unicode': '1f362'
        },
        {
          'name': 'sushi',
          'unicode': '1f363'
        },
        {
          'name': 'fried shrimp',
          'unicode': '1f364'
        },
        {
          'name': 'fish cake with swirl design',
          'unicode': '1f365'
        },
        {
          'name': 'dango',
          'unicode': '1f361'
        },
        {
          'name': 'soft ice cream',
          'unicode': '1f366'
        },
        {
          'name': 'shaved ice',
          'unicode': '1f367'
        },
        {
          'name': 'ice cream',
          'unicode': '1f368'
        },
        {
          'name': 'doughnut',
          'unicode': '1f369'
        },
        {
          'name': 'cookie',
          'unicode': '1f36a'
        },
        {
          'name': 'birthday cake',
          'unicode': '1f382'
        },
        {
          'name': 'shortcake',
          'unicode': '1f370'
        },
        {
          'name': 'chocolate bar',
          'unicode': '1f36b'
        },
        {
          'name': 'candy',
          'unicode': '1f36c'
        },
        {
          'name': 'lollipop',
          'unicode': '1f36d'
        },
        {
          'name': 'custard',
          'unicode': '1f36e'
        },
        {
          'name': 'honey pot',
          'unicode': '1f36f'
        },
        {
          'name': 'baby bottle',
          'unicode': '1f37c'
        },
        {
          'name': 'glass of milk',
          'unicode': '1f95b'
        },
        {
          'name': 'hot beverage',
          'unicode': '2615'
        },
        {
          'name': 'teacup without handle',
          'unicode': '1f375'
        },
        {
          'name': 'sake bottle and cup',
          'unicode': '1f376'
        },
        {
          'name': 'bottle with popping cork',
          'unicode': '1f37e'
        },
        {
          'name': 'wine glass',
          'unicode': '1f377'
        },
        {
          'name': 'cocktail glass',
          'unicode': '1f378'
        },
        {
          'name': 'tropical drink',
          'unicode': '1f379'
        },
        {
          'name': 'beer mug',
          'unicode': '1f37a'
        },
        {
          'name': 'clinking beer mugs',
          'unicode': '1f37b'
        },
        {
          'name': 'clinking glasses',
          'unicode': '1f942'
        },
        {
          'name': 'tumbler glass',
          'unicode': '1f943'
        },
        {
          'name': 'fork and knife with plate',
          'unicode': '1f37d'
        },
        {
          'name': 'fork and knife',
          'unicode': '1f374'
        },
        {
          'name': 'spoon',
          'unicode': '1f944'
        }
      ]
    }
  ];
}
