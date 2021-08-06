import { Injectable } from '@angular/core';

@Injectable()
export class CountryService {
  countries;
  dialCodeMap;

  constructor() {
    this.countries = [
      {
        'dialCode': '93',
        'countryCode': 'af',
        'country': 'AFGHANISTAN'
      },
      {
        'dialCode': '355',
        'countryCode': 'al',
        'country': 'ALBANIA'
      },
      {
        'dialCode': '213',
        'countryCode': 'dz',
        'country': 'ALGERIA'
      },
      {
        'dialCode': '1684',
        'countryCode': 'as',
        'country': 'AMERICAN SAMOA'
      },
      {
        'dialCode': '376',
        'countryCode': 'ad',
        'country': 'ANDORRA'
      },
      {
        'dialCode': '244',
        'countryCode': 'ao',
        'country': 'ANGOLA'
      },
      {
        'dialCode': '1264',
        'countryCode': 'ai',
        'country': 'ANGUILLA'
      },
      {
        'dialCode': '1268',
        'countryCode': 'ag',
        'country': 'ANTIGUA AND BARBUDA'
      },
      {
        'dialCode': '54',
        'countryCode': 'ar',
        'country': 'ARGENTINA'
      },
      {
        'dialCode': '374',
        'countryCode': 'am',
        'country': 'ARMENIA'
      },
      {
        'dialCode': '297',
        'countryCode': 'aw',
        'country': 'ARUBA'
      },
      {
        'dialCode': '61',
        'countryCode': 'au',
        'country': 'AUSTRALIA'
      },
      {
        'dialCode': '43',
        'countryCode': 'at',
        'country': 'AUSTRIA'
      },
      {
        'dialCode': '994',
        'countryCode': 'az',
        'country': 'AZERBAIJAN'
      },
      {
        'dialCode': '1242',
        'countryCode': 'bs',
        'country': 'BAHAMAS'
      },
      {
        'dialCode': '973',
        'countryCode': 'bh',
        'country': 'BAHRAIN'
      },
      {
        'dialCode': '880',
        'countryCode': 'bd',
        'country': 'BANGLADESH'
      },
      {
        'dialCode': '1246',
        'countryCode': 'bb',
        'country': 'BARBADOS'
      },
      {
        'dialCode': '375',
        'countryCode': 'by',
        'country': 'BELARUS'
      },
      {
        'dialCode': '32',
        'countryCode': 'be',
        'country': 'BELGIUM'
      },
      {
        'dialCode': '501',
        'countryCode': 'bz',
        'country': 'BELIZE'
      },
      {
        'dialCode': '229',
        'countryCode': 'bj',
        'country': 'BENIN'
      },
      {
        'dialCode': '1441',
        'countryCode': 'bm',
        'country': 'BERMUDA'
      },
      {
        'dialCode': '975',
        'countryCode': 'bt',
        'country': 'BHUTAN'
      },
      {
        'dialCode': '591',
        'countryCode': 'bo',
        'country': 'BOLIVIA'
      },
      {
        'dialCode': '387',
        'countryCode': 'ba',
        'country': 'BOSNIA AND HERZEGOWINA'
      },
      {
        'dialCode': '267',
        'countryCode': 'bw',
        'country': 'BOTSWANA'
      },
      {
        'dialCode': '55',
        'countryCode': 'br',
        'country': 'BRAZIL'
      },
      {
        'dialCode': '246',
        'countryCode': 'io',
        'country': 'BRITISH INDIAN OCEAN TERRITORY'
      },
      {
        'dialCode': '1284',
        'countryCode': 'vg',
        'country': 'VIRGIN ISLANDS (BRITISH)'
      },
      {
        'dialCode': '673',
        'countryCode': 'bn',
        'country': 'BRUNEI DARUSSALAM'
      },
      {
        'dialCode': '359',
        'countryCode': 'bg',
        'country': 'BULGARIA'
      },
      {
        'dialCode': '226',
        'countryCode': 'bf',
        'country': 'BURKINA FASO'
      },
      {
        'dialCode': '257',
        'countryCode': 'bi',
        'country': 'BURUNDI'
      },
      {
        'dialCode': '855',
        'countryCode': 'kh',
        'country': 'CAMBODIA'
      },
      {
        'dialCode': '237',
        'countryCode': 'cm',
        'country': 'CAMEROON'
      },
      {
        'dialCode': '1',
        'countryCode': 'ca',
        'country': 'CANADA'
      },
      {
        'dialCode': '238',
        'countryCode': 'cv',
        'country': 'CAPE VERDE'
      },
      {
        'dialCode': '599',
        'countryCode': 'bq',
        'country': 'CARIBBEAN NETHERLANDS'
      },
      {
        'dialCode': '1345',
        'countryCode': 'ky',
        'country': 'CAYMAN ISLANDS'
      },
      {
        'dialCode': '236',
        'countryCode': 'cf',
        'country': 'CENTRAL AFRICAN REPUBLIC'
      },
      {
        'dialCode': '235',
        'countryCode': 'td',
        'country': 'CHAD'
      },
      {
        'dialCode': '56',
        'countryCode': 'cl',
        'country': 'CHILE'
      },
      {
        'dialCode': '86',
        'countryCode': 'cn',
        'country': 'CHINA'
      },
      {
        'dialCode': '61',
        'countryCode': 'cx',
        'country': 'CHRISTMAS ISLAND'
      },
      {
        'dialCode': '61',
        'countryCode': 'cc',
        'country': 'COCOS ISLANDS'
      },
      {
        'dialCode': '57',
        'countryCode': 'co',
        'country': 'COLOMBIA'
      },
      {
        'dialCode': '269',
        'countryCode': 'km',
        'country': 'COMOROS'
      },
      {
        'dialCode': '243',
        'countryCode': 'cd',
        'country': 'CONGO'
      },
      {
        'dialCode': '242',
        'countryCode': 'cg',
        'country': 'CONGO REPUBLIC'
      },
      {
        'dialCode': '682',
        'countryCode': 'ck',
        'country': 'COOK ISLANDS'
      },
      {
        'dialCode': '506',
        'countryCode': 'cr',
        'country': 'COSTA RICA'
      },
      {
        'dialCode': '225',
        'countryCode': 'ci',
        'country': 'COTE DIVOIRE'
      },
      {
        'dialCode': '385',
        'countryCode': 'hr',
        'country': 'CROATIA '
      },
      {
        'dialCode': '53',
        'countryCode': 'cu',
        'country': 'CUBA'
      },
      {
        'dialCode': '599',
        'countryCode': 'cw',
        'country': 'CURACAO'
      },
      {
        'dialCode': '357',
        'countryCode': 'cy',
        'country': 'CYPRUS'
      },
      {
        'dialCode': '420',
        'countryCode': 'cz',
        'country': 'CZECH REPUBLIC'
      },
      {
        'dialCode': '45',
        'countryCode': 'dk',
        'country': 'DENMARK'
      },
      {
        'dialCode': '253',
        'countryCode': 'dj',
        'country': 'DJIBOUTI'
      },
      {
        'dialCode': '1767',
        'countryCode': 'dm',
        'country': 'DOMINICA'
      },
      {
        'dialCode': '1',
        'countryCode': 'do',
        'country': 'DOMINICAN REPUBLIC'
      },
      {
        'dialCode': '593',
        'countryCode': 'ec',
        'country': 'ECUADOR'
      },
      {
        'dialCode': '20',
        'countryCode': 'eg',
        'country': 'EGYPT'
      },
      {
        'dialCode': '503',
        'countryCode': 'sv',
        'country': 'EL SALVADOR'
      },
      {
        'dialCode': '240',
        'countryCode': 'gq',
        'country': 'EQUATORIAL GUINEA'
      },
      {
        'dialCode': '291',
        'countryCode': 'er',
        'country': 'ERITREA'
      },
      {
        'dialCode': '372',
        'countryCode': 'ee',
        'country': 'ESTONIA'
      },
      {
        'dialCode': '251',
        'countryCode': 'et',
        'country': 'ETHIOPIA'
      },
      {
        'dialCode': '500',
        'countryCode': 'fk',
        'country': 'FALKLAND ISLANDS (MALVINAS)'
      },
      {
        'dialCode': '298',
        'countryCode': 'fo',
        'country': 'FAROE ISLANDS'
      },
      {
        'dialCode': '679',
        'countryCode': 'fj',
        'country': 'FIJI'
      },
      {
        'dialCode': '358',
        'countryCode': 'fi',
        'country': 'FINLAND'
      },
      {
        'dialCode': '33',
        'countryCode': 'fr',
        'country': 'FRANCE'
      },
      {
        'dialCode': '594',
        'countryCode': 'gf',
        'country': 'FRENCH GUIANA'
      },
      {
        'dialCode': '689',
        'countryCode': 'pf',
        'country': 'FRENCH POLYNESIA'
      },
      {
        'dialCode': '241',
        'countryCode': 'ga',
        'country': 'GABON'
      },
      {
        'dialCode': '220',
        'countryCode': 'gm',
        'country': 'GAMBIA'
      },
      {
        'dialCode': '995',
        'countryCode': 'ge',
        'country': 'GEORGIA'
      },
      {
        'dialCode': '49',
        'countryCode': 'de',
        'country': 'GERMANY'
      },
      {
        'dialCode': '233',
        'countryCode': 'gh',
        'country': 'GHANA'
      },
      {
        'dialCode': '350',
        'countryCode': 'gi',
        'country': 'GIBRALTAR'
      },
      {
        'dialCode': '30',
        'countryCode': 'gr',
        'country': 'GREECE'
      },
      {
        'dialCode': '299',
        'countryCode': 'gl',
        'country': 'GREENLAND'
      },
      {
        'dialCode': '1473',
        'countryCode': 'gd',
        'country': 'GRENADA'
      },
      {
        'dialCode': '590',
        'countryCode': 'gp',
        'country': 'GUADELOUPE'
      },
      {
        'dialCode': '1671',
        'countryCode': 'gu',
        'country': 'GUAM'
      },
      {
        'dialCode': '502',
        'countryCode': 'gt',
        'country': 'GUATEMALA'
      },
      {
        'dialCode': '44',
        'countryCode': 'gg',
        'country': 'GUERNSEY'
      },
      {
        'dialCode': '224',
        'countryCode': 'gn',
        'country': 'GUINEA'
      },
      {
        'dialCode': '245',
        'countryCode': 'gw',
        'country': 'GUINEA-BISSAU'
      },
      {
        'dialCode': '592',
        'countryCode': 'gy',
        'country': 'GUYANA'
      },
      {
        'dialCode': '509',
        'countryCode': 'ht',
        'country': 'HAITI'
      },
      {
        'dialCode': '504',
        'countryCode': 'hn',
        'country': 'HONDURAS'
      },
      {
        'dialCode': '852',
        'countryCode': 'hk',
        'country': 'HONG KONG'
      },
      {
        'dialCode': '36',
        'countryCode': 'hu',
        'country': 'HUNGARY'
      },
      {
        'dialCode': '354',
        'countryCode': 'is',
        'country': 'ICELAND'
      },
      {
        'dialCode': '91',
        'countryCode': 'in',
        'country': 'INDIA'
      },
      {
        'dialCode': '62',
        'countryCode': 'id',
        'country': 'INDONESIA'
      },
      {
        'dialCode': '98',
        'countryCode': 'ir',
        'country': 'IRAN '
      },
      {
        'dialCode': '964',
        'countryCode': 'iq',
        'country': 'IRAQ'
      },
      {
        'dialCode': '353',
        'countryCode': 'ie',
        'country': 'IRELAND'
      },
      {
        'dialCode': '44',
        'countryCode': 'im',
        'country': 'ISLA DE MAN'
      },
      {
        'dialCode': '972',
        'countryCode': 'il',
        'country': 'ISRAEL'
      },
      {
        'dialCode': '39',
        'countryCode': 'it',
        'country': 'ITALY'
      },
      {
        'dialCode': '1876',
        'countryCode': 'jm',
        'country': 'JAMAICA'
      },
      {
        'dialCode': '81',
        'countryCode': 'jp',
        'country': 'JAPAN'
      },
      {
        'dialCode': '44',
        'countryCode': 'je',
        'country': 'JERSEY'
      },
      {
        'dialCode': '962',
        'countryCode': 'jo',
        'country': 'JORDAN'
      },
      {
        'dialCode': '7',
        'countryCode': 'kz',
        'country': 'KAZAKHSTAN'
      },
      {
        'dialCode': '254',
        'countryCode': 'ke',
        'country': 'KENYA'
      },
      {
        'dialCode': '686',
        'countryCode': 'ki',
        'country': 'KIRIBATI'
      },
      {
        'dialCode': '383',
        'countryCode': 'xk',
        'country': 'KOSOVO'
      },
      {
        'dialCode': '965',
        'countryCode': 'kw',
        'country': 'KUWAIT'
      },
      {
        'dialCode': '996',
        'countryCode': 'kg',
        'country': 'KYRGYZSTAN'
      },
      {
        'dialCode': '856',
        'countryCode': 'la',
        'country': 'LAO'
      },
      {
        'dialCode': '371',
        'countryCode': 'lv',
        'country': 'LATVIA'
      },
      {
        'dialCode': '961',
        'countryCode': 'lb',
        'country': 'LEBANON'
      },
      {
        'dialCode': '266',
        'countryCode': 'ls',
        'country': 'LESOTHO'
      },
      {
        'dialCode': '231',
        'countryCode': 'lr',
        'country': 'LIBERIA'
      },
      {
        'dialCode': '218',
        'countryCode': 'ly',
        'country': 'LIBYAN ARAB JAMAHIRIYA'
      },
      {
        'dialCode': '423',
        'countryCode': 'li',
        'country': 'LIECHTENSTEIN'
      },
      {
        'dialCode': '370',
        'countryCode': 'lt',
        'country': 'LITHUANIA'
      },
      {
        'dialCode': '352',
        'countryCode': 'lu',
        'country': 'LUXEMBOURG'
      },
      {
        'dialCode': '853',
        'countryCode': 'mo',
        'country': 'MACAU'
      },
      {
        'dialCode': '389',
        'countryCode': 'mk',
        'country': 'MACEDONIA'
      },
      {
        'dialCode': '261',
        'countryCode': 'mg',
        'country': 'MADAGASCAR'
      },
      {
        'dialCode': '265',
        'countryCode': 'mw',
        'country': 'MALAWI'
      },
      {
        'dialCode': '60',
        'countryCode': 'my',
        'country': 'MALAYSIA'
      },
      {
        'dialCode': '960',
        'countryCode': 'mv',
        'country': 'MALDIVES'
      },
      {
        'dialCode': '223',
        'countryCode': 'ml',
        'country': 'MALI'
      },
      {
        'dialCode': '356',
        'countryCode': 'mt',
        'country': 'MALTA'
      },
      {
        'dialCode': '692',
        'countryCode': 'mh',
        'country': 'MARSHALL ISLANDS'
      },
      {
        'dialCode': '596',
        'countryCode': 'mq',
        'country': 'MARTINIQUE'
      },
      {
        'dialCode': '222',
        'countryCode': 'mr',
        'country': 'MAURITANIA'
      },
      {
        'dialCode': '230',
        'countryCode': 'mu',
        'country': 'MAURITIUS'
      },
      {
        'dialCode': '262',
        'countryCode': 'yt',
        'country': 'MAYOTTE'
      },
      {
        'dialCode': '52',
        'countryCode': 'mx',
        'country': 'MEXICO'
      },
      {
        'dialCode': '691',
        'countryCode': 'fm',
        'country': 'MICRONESIA'
      },
      {
        'dialCode': '373',
        'countryCode': 'md',
        'country': 'MOLDOVA'
      },
      {
        'dialCode': '377',
        'countryCode': 'mc',
        'country': 'MONACO'
      },
      {
        'dialCode': '976',
        'countryCode': 'mn',
        'country': 'MONGOLIA'
      },
      {
        'dialCode': '382',
        'countryCode': 'me',
        'country': 'MONTENEGRO'
      },
      {
        'dialCode': '1664',
        'countryCode': 'ms',
        'country': 'MONTSERRAT'
      },
      {
        'dialCode': '212',
        'countryCode': 'ma',
        'country': 'MOROCCO'
      },
      {
        'dialCode': '258',
        'countryCode': 'mz',
        'country': 'MOZAMBIQUE'
      },
      {
        'dialCode': '95',
        'countryCode': 'mm',
        'country': 'MYANMAR'
      },
      {
        'dialCode': '264',
        'countryCode': 'na',
        'country': 'NAMIBIA'
      },
      {
        'dialCode': '674',
        'countryCode': 'nr',
        'country': 'NAURU'
      },
      {
        'dialCode': '977',
        'countryCode': 'np',
        'country': 'NEPAL'
      },
      {
        'dialCode': '31',
        'countryCode': 'nl',
        'country': 'NETHERLANDS'
      },
      {
        'dialCode': '687',
        'countryCode': 'nc',
        'country': 'NEW CALEDONIA'
      },
      {
        'dialCode': '64',
        'countryCode': 'nz',
        'country': 'NEW ZEALAND'
      },
      {
        'dialCode': '505',
        'countryCode': 'ni',
        'country': 'NICARAGUA'
      },
      {
        'dialCode': '227',
        'countryCode': 'ne',
        'country': 'NIGER'
      },
      {
        'dialCode': '234',
        'countryCode': 'ng',
        'country': 'NIGERIA'
      },
      {
        'dialCode': '683',
        'countryCode': 'nu',
        'country': 'NIUE'
      },
      {
        'dialCode': '672',
        'countryCode': 'nf',
        'country': 'NORFOLK ISLAND'
      },
      {
        'dialCode': '850',
        'countryCode': 'kp',
        'country': 'KOREA NORTH '
      },
      {
        'dialCode': '1670',
        'countryCode': 'mp',
        'country': 'NORTHERN MARIANA ISLANDS'
      },
      {
        'dialCode': '47',
        'countryCode': 'no',
        'country': 'NORWAY'
      },
      {
        'dialCode': '968',
        'countryCode': 'om',
        'country': 'OMAN'
      },
      {
        'dialCode': '92',
        'countryCode': 'pk',
        'country': 'PAKISTAN'
      },
      {
        'dialCode': '680',
        'countryCode': 'pw',
        'country': 'PALAU'
      },
      {
        'dialCode': '970',
        'countryCode': 'ps',
        'country': 'PALESTINA'
      },
      {
        'dialCode': '507',
        'countryCode': 'pa',
        'country': 'PANAMA'
      },
      {
        'dialCode': '675',
        'countryCode': 'pg',
        'country': 'PAPUA NEW GUINEA'
      },
      {
        'dialCode': '595',
        'countryCode': 'py',
        'country': 'PARAGUAY'
      },
      {
        'dialCode': '51',
        'countryCode': 'pe',
        'country': 'PERU'
      },
      {
        'dialCode': '63',
        'countryCode': 'ph',
        'country': 'PHILIPPINES'
      },
      {
        'dialCode': '48',
        'countryCode': 'pl',
        'country': 'POLAND'
      },
      {
        'dialCode': '351',
        'countryCode': 'pt',
        'country': 'PORTUGAL'
      },
      {
        'dialCode': '1',
        'countryCode': 'pr',
        'country': 'PUERTO RICO'
      },
      {
        'dialCode': '974',
        'countryCode': 'qa',
        'country': 'QATAR'
      },
      {
        'dialCode': '262',
        'countryCode': 're',
        'country': 'REUNION'
      },
      {
        'dialCode': '40',
        'countryCode': 'ro',
        'country': 'ROMANIA'
      },
      {
        'dialCode': '7',
        'countryCode': 'ru',
        'country': 'RUSSIAN FEDERATION'
      },
      {
        'dialCode': '250',
        'countryCode': 'rw',
        'country': 'RWANDA'
      },
      {
        'dialCode': '590',
        'countryCode': 'bl',
        'country': 'SAN BARTOLOMÉ'
      },
      {
        'dialCode': '290',
        'countryCode': 'sh',
        'country': 'SAINT HELENA'
      },
      {
        'dialCode': '1869',
        'countryCode': 'kn',
        'country': 'SAINT KITTS AND NEVIS'
      },
      {
        'dialCode': '1758',
        'countryCode': 'lc',
        'country': 'SAINT LUCIA'
      },
      {
        'dialCode': '590',
        'countryCode': 'mf',
        'country': 'Saint Martin (Saint-Martin (partie française))'
      },
      {
        'dialCode': '508',
        'countryCode': 'pm',
        'country': 'SAINT PIERRE AND MIQUELON'
      },
      {
        'dialCode': '1784',
        'countryCode': 'vc',
        'country': 'SAINT VINCENT AND THE GRENADINES'
      },
      {
        'dialCode': '685',
        'countryCode': 'ws',
        'country': 'SAMOA'
      },
      {
        'dialCode': '378',
        'countryCode': 'sm',
        'country': 'SAN MARINO'
      },
      {
        'dialCode': '239',
        'countryCode': 'st',
        'country': 'SAO TOME AND PRINCIPE'
      },
      {
        'dialCode': '966',
        'countryCode': 'sa',
        'country': 'SAUDI ARABIA'
      },
      {
        'dialCode': '221',
        'countryCode': 'sn',
        'country': 'SENEGAL'
      },
      {
        'dialCode': '381',
        'countryCode': 'rs',
        'country': 'SERBIA'
      },
      {
        'dialCode': '248',
        'countryCode': 'sc',
        'country': 'SEYCHELLES'
      },
      {
        'dialCode': '232',
        'countryCode': 'sl',
        'country': 'SIERRA LEONE'
      },
      {
        'dialCode': '65',
        'countryCode': 'sg',
        'country': 'SINGAPORE'
      },
      {
        'dialCode': '1721',
        'countryCode': 'sx',
        'country': 'SINT MAARTEN'
      },
      {
        'dialCode': '421',
        'countryCode': 'sk',
        'country': 'SLOVAKIA'
      },
      {
        'dialCode': '386',
        'countryCode': 'si',
        'country': 'SLOVENIA'
      },
      {
        'dialCode': '677',
        'countryCode': 'sb',
        'country': 'SOLOMON ISLANDS'
      },
      {
        'dialCode': '252',
        'countryCode': 'so',
        'country': 'SOMALIA'
      },
      {
        'dialCode': '27',
        'countryCode': 'za',
        'country': 'SOUTH AFRICA'
      },
      {
        'dialCode': '82',
        'countryCode': 'kr',
        'country': 'KOREA SOUTH'
      },
      {
        'dialCode': '211',
        'countryCode': 'ss',
        'country': 'SOUTH SUDAN'
      },
      {
        'dialCode': '34',
        'countryCode': 'es',
        'country': 'SPAIN'
      },
      {
        'dialCode': '94',
        'countryCode': 'lk',
        'country': 'SRI LANKA'
      },
      {
        'dialCode': '249',
        'countryCode': 'sd',
        'country': 'SUDAN'
      },
      {
        'dialCode': '597',
        'countryCode': 'sr',
        'country': 'SURINAME'
      },
      {
        'dialCode': '47',
        'countryCode': 'sj',
        'country': 'SVALBARD AND JAN MAYEN ISLANDS'
      },
      {
        'dialCode': '268',
        'countryCode': 'sz',
        'country': 'SWAZILAND'
      },
      {
        'dialCode': '46',
        'countryCode': 'se',
        'country': 'SWEDEN'
      },
      {
        'dialCode': '41',
        'countryCode': 'ch',
        'country': 'SWITZERLAND'
      },
      {
        'dialCode': '963',
        'countryCode': 'sy',
        'country': 'SYRIAN ARAB REPUBLIC'
      },
      {
        'dialCode': '886',
        'countryCode': 'tw',
        'country': 'TAIWAN'
      },
      {
        'dialCode': '992',
        'countryCode': 'tj',
        'country': 'TAJIKISTAN'
      },
      {
        'dialCode': '255',
        'countryCode': 'tz',
        'country': 'TANZANIA'
      },
      {
        'dialCode': '66',
        'countryCode': 'th',
        'country': 'THAILAND'
      },
      {
        'dialCode': '670',
        'countryCode': 'tl',
        'country': 'TIMOR-LESTE'
      },
      {
        'dialCode': '228',
        'countryCode': 'tg',
        'country': 'TOGO'
      },
      {
        'dialCode': '690',
        'countryCode': 'tk',
        'country': 'TOKELAU'
      },
      {
        'dialCode': '676',
        'countryCode': 'to',
        'country': 'TONGA'
      },
      {
        'dialCode': '1868',
        'countryCode': 'tt',
        'country': 'TRINIDAD AND TOBAGO'
      },
      {
        'dialCode': '216',
        'countryCode': 'tn',
        'country': 'TUNISIA'
      },
      {
        'dialCode': '90',
        'countryCode': 'tr',
        'country': 'TURKEY'
      },
      {
        'dialCode': '993',
        'countryCode': 'tm',
        'country': 'TURKMENISTAN'
      },
      {
        'dialCode': '1649',
        'countryCode': 'tc',
        'country': 'TURKS AND CAICOS ISLANDS'
      },
      {
        'dialCode': '688',
        'countryCode': 'tv',
        'country': 'TUVALU'
      },
      {
        'dialCode': '1340',
        'countryCode': 'vi',
        'country': 'VIRGIN ISLANDS (U.S.)'
      },
      {
        'dialCode': '256',
        'countryCode': 'ug',
        'country': 'UGANDA'
      },
      {
        'dialCode': '380',
        'countryCode': 'ua',
        'country': 'UKRAINE'
      },
      {
        'dialCode': '971',
        'countryCode': 'ae',
        'country': 'UNITED ARAB EMIRATES'
      },
      {
        'dialCode': '44',
        'countryCode': 'gb',
        'country': 'UNITED KINGDOM'
      },
      {
        'dialCode': '1',
        'countryCode': 'us',
        'country': 'UNITED STATES'
      },
      {
        'dialCode': '598',
        'countryCode': 'uy',
        'country': 'URUGUAY'
      },
      {
        'dialCode': '998',
        'countryCode': 'uz',
        'country': 'UZBEKISTAN'
      },
      {
        'dialCode': '678',
        'countryCode': 'vu',
        'country': 'VANUATU'
      },
      {
        'dialCode': '39',
        'countryCode': 'va',
        'country': 'VATICAN CITY STATE'
      },
      {
        'dialCode': '58',
        'countryCode': 've',
        'country': 'VENEZUELA'
      },
      {
        'dialCode': '84',
        'countryCode': 'vn',
        'country': 'VIET NAM'
      },
      {
        'dialCode': '681',
        'countryCode': 'wf',
        'country': 'WALLIS AND FUTUNA ISLANDS'
      },
      {
        'dialCode': '212',
        'countryCode': 'eh',
        'country': 'WESTERN SAHARA'
      },
      {
        'dialCode': '967',
        'countryCode': 'ye',
        'country': 'YEMEN'
      },
      {
        'dialCode': '260',
        'countryCode': 'zm',
        'country': 'ZAMBIA'
      },
      {
        'dialCode': '263',
        'countryCode': 'zw',
        'country': 'ZIMBABWE '
      },
      {
        'dialCode': '358',
        'countryCode': 'ax',
        'country': 'AALAND ISLANDS'
      }
    ];
    this.dialCodeMap = {
      '074': 'BV',
      '352': 'AX',
      '672': 'AQ',
      '972': 'IL',
      '93': 'AF',
      '355': 'AL',
      '213': 'DZ',
      '376': 'AD',
      '244': 'AO',
      '54': 'AR',
      '374': 'AM',
      '297': 'AW',
      '61': 'AU',
      '43': 'AT',
      '994': 'AZ',
      '973': 'BH',
      '880': 'BD',
      '375': 'BY',
      '32': 'BE',
      '501': 'BZ',
      '229': 'BJ',
      '975': 'BT',
      '387': 'BA',
      '267': 'BW',
      '55': 'BR',
      '246': 'IO',
      '359': 'BG',
      '226': 'BF',
      '257': 'BI',
      '855': 'KH',
      '237': 'CM',
      '238': 'CV',
      '345': 'KY',
      '236': 'CF',
      '235': 'TD',
      '56': 'CL',
      '86': 'CN',
      '57': 'CO',
      '269': 'KM',
      '242': 'CG',
      '682': 'CK',
      '506': 'CR',
      '385': 'HR',
      '53': 'CU',
      '537': 'CY',
      '420': 'CZ',
      '45': 'DK',
      '253': 'DJ',
      '593': 'EC',
      '20': 'EG',
      '503': 'SV',
      '240': 'GQ',
      '291': 'ER',
      '372': 'EE',
      '251': 'ET',
      '298': 'FO',
      '679': 'FJ',
      '358': 'FI',
      '33': 'FR',
      '594': 'GF',
      '689': 'PF',
      '241': 'GA',
      '220': 'GM',
      '995': 'GE',
      '49': 'DE',
      '233': 'GH',
      '350': 'GI',
      '30': 'GR',
      '299': 'GL',
      '590': 'GP',
      '502': 'GT',
      '224': 'GN',
      '245': 'GW',
      '595': 'GY',
      '509': 'HT',
      '504': 'HN',
      '36': 'HU',
      '354': 'IS',
      '91': 'IN',
      '62': 'ID',
      '964': 'IQ',
      '353': 'IE',
      '39': 'IT',
      '81': 'JP',
      '962': 'JO',
      '77': 'KZ',
      '254': 'KE',
      '686': 'KI',
      '965': 'KW',
      '996': 'KG',
      '371': 'LV',
      '961': 'LB',
      '266': 'LS',
      '231': 'LR',
      '423': 'LI',
      '370': 'LT',
      '261': 'MG',
      '265': 'MW',
      '60': 'MY',
      '960': 'MV',
      '223': 'ML',
      '356': 'MT',
      '692': 'MH',
      '596': 'MQ',
      '222': 'MR',
      '230': 'MU',
      '262': 'YT',
      '52': 'MX',
      '377': 'MC',
      '976': 'MN',
      '382': 'ME',
      '212': 'MA',
      '95': 'MM',
      '264': 'NA',
      '674': 'NR',
      '977': 'NP',
      '31': 'NL',
      '599': 'AN',
      '687': 'NC',
      '64': 'NZ',
      '505': 'NI',
      '227': 'NE',
      '234': 'NG',
      '683': 'NU',
      '47': 'NO',
      '968': 'OM',
      '92': 'PK',
      '680': 'PW',
      '507': 'PA',
      '675': 'PG',
      '51': 'PE',
      '63': 'PH',
      '48': 'PL',
      '351': 'PT',
      '974': 'QA',
      '40': 'RO',
      '250': 'RW',
      '685': 'WS',
      '378': 'SM',
      '966': 'SA',
      '221': 'SN',
      '381': 'RS',
      '248': 'SC',
      '232': 'SL',
      '65': 'SG',
      '421': 'SK',
      '386': 'SI',
      '677': 'SB',
      '27': 'ZA',
      '500': 'GS',
      '34': 'ES',
      '94': 'LK',
      '249': 'SD',
      '597': 'SR',
      '268': 'SZ',
      '46': 'SE',
      '41': 'CH',
      '992': 'TJ',
      '66': 'TH',
      '228': 'TG',
      '690': 'TK',
      '676': 'TO',
      '216': 'TN',
      '90': 'TR',
      '993': 'TM',
      '688': 'TV',
      '256': 'UG',
      '380': 'UA',
      '971': 'AE',
      '44': 'GB',
      '598': 'UY',
      '998': 'UZ',
      '678': 'VU',
      '681': 'WF',
      '967': 'YE',
      '260': 'ZM',
      '263': 'ZW',
      '591': 'BO',
      '673': 'BN',
      '243': 'CD',
      '225': 'CI',
      '379': 'VA',
      '852': 'HK',
      '98': 'IR',
      '850': 'KP',
      '82': 'KR',
      '856': 'LA',
      '218': 'LY',
      '853': 'MO',
      '389': 'MK',
      '691': 'FM',
      '373': 'MD',
      '258': 'MZ',
      '970': 'PS',
      '872': 'PN',
      '7': 'RU',
      '290': 'SH',
      '508': 'PM',
      '239': 'ST',
      '252': 'SO',
      '963': 'SY',
      '886': 'TW',
      '255': 'TZ',
      '670': 'TL',
      '58': 'VE',
      '84': 'VN',
      '1': 'VG'
    };
  }
  getCountries() {
    return this.countries;
  }


}
