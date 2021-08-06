import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
  animateChild,
  query
} from '@angular/animations';

export const flyInOut = [
  trigger('flyInOut', [
    state('in', style({ transform: 'translateX(0)' })),
    transition('void => *', [
      style({ transform: 'translateX(100%)' }),
      animate(80)
    ]),
    transition('* => void', [
      animate(80, style({ transform: 'translateX(100%)' }))
    ])
  ])
];

export const flyInOutLeft = [
  trigger('flyInOutLeft', [
    state('in', style({ transform: 'translateX(0)' })),
    transition('void => *', [
      style({ transform: 'translateX(-100%)' }),
      animate(80)
    ]),
    transition('* => void', [
      animate(80, style({ transform: 'translateX(-100%)' }))
    ])
  ])
];

export const scaleInOut = [
  trigger('scaleInOut', [
    transition(':enter', [
      style({ transform: 'scale(0)', opacity: 0 }),
      animate('0.3s 0.16s cubic-bezier(0.23, 1, 0.32, 1)', style({ transform: 'scale(1)', opacity: 1 }))
    ]),
    transition(':leave', [
      style({ transform: 'scale(1)', opacity: 1 }),
      animate('0.2s 0.16s ease-out', style({ transform: 'scale(0)', opacity: 0 }))
    ])
  ])
];

export const fadeIn = [
  trigger('fadeIn', [
    transition('void => *', [
      style({ opacity: 0 }),
      animate(200, style({ opacity: 1 }))
    ]),
    transition('* => void', [
      style({ opacity: 1 }),
      animate(200, style({ opacity: 0 }))
    ])
  ])
];
export const messageModalAnimation = [
  trigger('messageModalAnimation', [
    transition('* => void', [
      query('@*', [animateChild()], {optional: true})
    ])
  ]),
];

export const barFadeInOut = [
  trigger('barFadeInOut', [
    state('in', style({opacity: 1})),
    transition(':enter', [
      style({opacity: 0}),
      animate(300 )
    ]),
    transition(':leave',
      animate(300, style({opacity: 0})))
  ])
];

export const profileImageEnlarge = [
  trigger('parentAnimate', [
    transition(':enter, :leave', [
      query('@*', [animateChild()])
    ])
  ]),
  trigger('imageZoom', [
    transition(':enter', [
      style({ borderRadius: '50%', width: '{{imageStartWidth}}', height: '{{imageStartHeight}}',
        transform: 'translate({{animationHeightX}}, {{animationHeightY}}) scaleY(1) scaleX(1)' }),
      animate('500ms cubic-bezier(0.1, 0.82, 0.25, 1)', style({
        width: '384px', height: '384px', borderRadius: '0%', transform: 'translate(0px) scaleY(1) scaleX(1)' }))
    ]),
    transition(':leave', [
      style({ width: '384px', height: '384px', borderRadius: '0%',
      transform: 'translate(0px) scaleY(1) scaleX(1)' }),
      // animate('550ms cubic-bezier(.20,.50,.83,.67)',  keyframes([
      //   style({borderRadius: '0', offset: 0}),
      //   style({borderRadius: '10%',  width: '{{imageStartWidth}}', height: '{{imageStartHeight}}',
      //   transform: 'translate({{animationHeightX}}, {{animationHeightY}}) scaleY(1) scaleX(1)',
      //   offset: 0.5}),
      //   style({borderRadius: '25%',
      //   transform: 'translate({{animationHeightX}}, {{animationHeightY}}) scaleY(1) scaleX(1)',
      //   offset: 0.75}),
      //   style({
      //     borderRadius: '50%',
      //     transform: 'translate({{animationHeightX}}, {{animationHeightY}}) scaleY(1) scaleX(1)',
      //     offset: 1.0
      //   })
      // ])),
    ]),
  ])
];
