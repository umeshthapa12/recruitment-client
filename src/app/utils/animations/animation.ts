import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const fadeInOutStagger = trigger('fadeInOutStagger', [
    transition('* <=> *', [
        query(':leave', [
            stagger('100ms', [
                animate('0.1s cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0, height: '0' }))
            ]),

        ], { optional: true, }),
        query(':enter', [
            style({ opacity: 0, transform: 'translate(0, -10px)' }),
            stagger('100ms', [
                animate('0.2s cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'translate(0, 0)', height: '*' })),
            ])
        ], { optional: true }),
    ])
]);


export const collectionInOut = trigger('collectionInOut', [
    transition('* <=> *', [
        query(':leave', [
            stagger('10ms', [
                animate('0.1s cubic-bezier(.9,.62,.47,.67)', style({ opacity: 0, transform: 'translate(0, 20px)', overflow: 'hidden' }))
            ]),

        ], { optional: true }),
        query(':enter', [
            style({ opacity: 0, transform: 'translate(0, 20px) rotateX(45deg)', overflow: 'hidden' }),
            stagger('25ms', [
                animate('0.3s cubic-bezier(.9,.62,.47,.67)',
                    style({
                        opacity: 1,
                        transform: 'translate(0, 0) rotateX(0deg)',
                        overflow: 'hidden',
                    })),
            ])
        ], { optional: true, limit: 50 }),
    ])
]);


export const fadeIn = trigger('fadeIn', [
    transition('* <=> *', [
        query(':leave', [
            stagger('100ms', [
                animate('0.2s cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 0, height: '0', transform: 'translate(0, 10px)' }))
            ]),
        ], { optional: true }),
        query(':enter', [
            style({ opacity: 0, transform: 'translate(0, -10px)' }),
            stagger('200ms', [
                animate('0.3s cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'translate(0, 0)', height: '*' })),
            ])
        ], { optional: true }),
    ])
]);

export const animateHeight = trigger('animateHeight', [
    transition('* <=> *', [
        query(':enter', [
            style({ opacity: 0, height: '1px' })
        ], { optional: true }),
        query(':leave', [
            stagger('800ms', [
                animate('0.5s cubic-bezier(.41,.59,.3,.89)',
                    style({ opacity: 0, height: '0' })
                )
            ]),
        ], { optional: true }),
        query(':enter', [
            style({ opacity: 0, height: '0px' }),
            stagger('800ms', [
                animate('0.5s cubic-bezier(.41,.59,.3,.89)', style({ opacity: 1, height: '*' })),
            ])
        ], { optional: true }),
    ])
]);

export const fadeInUpEnterOnly = trigger('fadeInUpEnterOnly', [
    transition(':enter', [
        style({ transform: 'translateY(2px)', opacity: 0 }),
        animate('.3s', style({ transform: 'translateY(0)', opacity: 1 }))
    ]),
]);



export const fadeInOutDown = trigger('fadeInOutDown', [

    transition('* => *', [
        query(':enter', [
            style({
                opacity: 0,
                width: '100%',
                position: 'absolute',
                display: 'inline-block',
                transform: 'translateY(15px)',

            }),
        ], { optional: true }),

        query(':leave', [
            style({
                opacity: 1,
                transform: 'translateY(0)',
                width: '100%',
            }),
            animate('0.3s ease-out', style({
                opacity: 0,
                position: 'absolute',
                display: 'inline-block',
                transform: 'translateY(15px)',

            }
            ))
        ], { optional: true }),

        query(':enter', [
            style({
                opacity: 0,
                display: 'inline-block',
                transform: 'translateY(15px)',
            }),
            animate('0.3s ease-in', style({
                width: '100%',
                opacity: 1,
                transform: 'translateY(0)',

            }))
        ], { optional: true })
    ])
]);

export const fadeInX = trigger('fadeInX', [
    transition('* <=> *', [
        query(':enter', [
            style({ opacity: 0, width: '1px' })

        ], { optional: true }),
        query(':leave', [
            stagger('200ms', [
                animate('0.2s cubic-bezier(.41,.59,.3,.89)',
                    style({ opacity: 0, width: '0' })
                )
            ]),
        ], { optional: true }),
        query(':enter', [
            style({ opacity: 0, width: '0px' }),
            stagger('300ms', [
                animate('0.3s cubic-bezier(.41,.59,.3,.89)', style({ opacity: 1, width: '*' })),
            ])
        ], { optional: true }),
    ])
]);
