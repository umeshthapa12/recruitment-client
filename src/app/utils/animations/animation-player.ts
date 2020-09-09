import { animate, AnimationAnimateMetadata, AnimationBuilder, AnimationPlayer, keyframes, style } from '@angular/animations';
import { Injectable } from '@angular/core';

interface AnimationRepo {
    /**
     * Name of the animation. Gets animation fn by key
     */
    key: string;

    /**
     * Defined animation Fn
     */
    fn: AnimationAnimateMetadata;
}

interface AnimationKeyMap {
    /* attention */
    swing?: 'swing';
    bounce?: 'bounce';
    flash?: 'flash';
    shake?: 'shake';
    pulse?: 'pulse';
    rubberBand?: 'rubberBand';
    tada?: 'tada';
    wobble?: 'wobble';
    jello?: 'jello';
    heartBeat?: 'heartBeat';

    /* bounce entries */
    bounceIn: 'bounceIn';
    bounceInDown: 'bounceInDown';
    bounceInLeft: 'bounceInLeft';
    bounceInRight: 'bounceInRight';
    bounceInUp: 'bounceInUp';
}

/**
 * Predefined animations
 */
@Injectable({ providedIn: 'root' })
export class PredefinedAnimations {

    /**
    * Animation Fn repo
    */
    animationFn: AnimationRepo[];

    private prop = <K extends keyof AnimationKeyMap>(key: K) => key;

    constructor() {
        this.animationFn =
            [
                {
                    key: this.prop('swing'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'rotate3d(0, 0, 1, 17deg)', offset: 0.20 }),
                        style({ transform: 'rotate3d(0, 0, 1, -12deg)', offset: 0.40 }),
                        style({ transform: 'rotate3d(0, 0, 1, 6deg)', offset: 0.60 }),
                        style({ transform: 'rotate3d(0, 0, 1, -6deg)', offset: 0.80 }),
                        style({ transform: 'rotate3d(0, 0, 1, 0deg)', offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('bounce'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'translate3d(0, 0, 0)', offset: 0, 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)' }),
                        style({ transform: 'translate3d(0, 0, 0)', offset: 0.15, 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)' }),
                        style({ transform: 'translate3d(0, -30px, 0)', offset: 0.40, 'animation-timing-function': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)' }),
                        style({ transform: 'translate3d(0, 0, 0)', offset: 0.55, 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)' }),
                        style({ transform: 'translate3d(0, -15px, 0)', offset: 0.70, 'animation-timing-function': ' cubic-bezier(0.755, 0.05, 0.855, 0.06)' }),
                        style({ transform: 'translate3d(0, 0, 0)', offset: 0.90, 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)' }),
                        style({ transform: 'translate3d(0, -4px, 0)', offset: 0.95 }),
                        style({ transform: 'translate3d(0, 0, 0)', offset: 1, 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)' }),
                    ]))
                },
                {
                    key: this.prop('flash'),
                    fn: animate('{{duration}}', keyframes([
                        style({ opacity: 1, offset: 0 }),
                        style({ opacity: 0, offset: 0.25 }),
                        style({ opacity: 1, offset: 0.50 }),
                        style({ opacity: 0, offset: 0.75 }),
                        style({ opacity: 1, offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('shake'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'translate3d(0, 0, 0)', offset: 0 }),
                        style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.10 }),
                        style({ transform: 'translate3d(10px, 0, 0)', offset: 0.20 }),
                        style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.30 }),
                        style({ transform: 'translate3d(10px, 0, 0)', offset: 0.40 }),
                        style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.50 }),
                        style({ transform: 'translate3d(10px, 0, 0)', offset: 0.60 }),
                        style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.70 }),
                        style({ transform: 'translate3d(10px, 0, 0)', offset: 0.80 }),
                        style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.90 }),
                        style({ transform: 'translate3d(0, 0, 0)', offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('pulse'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'scale3d(1, 1, 1)', offset: 0 }),
                        style({ transform: 'scale3d(1.1, 1.1, 1.1)', offset: 0.50 }),
                        style({ transform: 'scale3d(1, 1, 1)', offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('rubberBand'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'scale3d(1, 1, 1)', offset: 0 }),
                        style({ transform: 'scale3d(1.25, 0.75, 1)', offset: 0.30 }),
                        style({ transform: 'scale3d(0.75, 1.25, 1)', offset: 0.40 }),
                        style({ transform: 'scale3d(1.15, 0.85, 1)', offset: 0.50 }),
                        style({ transform: 'scale3d(0.95, 1.05, 1)', offset: 0.50 }),
                        style({ transform: 'scale3d(1.05, 0.95, 1)', offset: 0.50 }),
                        style({ transform: 'scale3d(1, 1, 1)', offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('tada'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'scale3d(1, 1, 1)', offset: 0 }),
                        style({ transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)', offset: 0.10 }),
                        style({ transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)', offset: 0.20 }),
                        style({ transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)', offset: 0.30 }),
                        style({ transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)', offset: 0.40 }),
                        style({ transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)', offset: 0.50 }),
                        style({ transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)', offset: 0.60 }),
                        style({ transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)', offset: 0.70 }),
                        style({ transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)', offset: 0.80 }),
                        style({ transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)', offset: 0.90 }),
                        style({ transform: 'scale3d(1, 1, 1)', offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('wobble'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'translate3d(0, 0, 0)', offset: 0 }),
                        style({ transform: 'translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg)', offset: 0.15 }),
                        style({ transform: 'translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg)', offset: 0.30 }),
                        style({ transform: 'translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg)', offset: 0.45 }),
                        style({ transform: 'translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg)', offset: 0.60 }),
                        style({ transform: 'translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg)', offset: 0.70 }),
                        style({ transform: 'translate3d(0, 0, 0)', offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('jello'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'translate3d(0, 0, 0)', offset: 0 }),
                        style({ transform: 'translate3d(0, 0, 0)', offset: 0.11 }),
                        style({ transform: 'skewX(-12.5deg) skewY(-12.5deg)', offset: 0.22 }),
                        style({ transform: 'skewX(6.25deg) skewY(6.25deg)', offset: 0.33 }),
                        style({ transform: 'skewX(-3.125deg) skewY(-3.125deg)', offset: 0.44 }),
                        style({ transform: 'skewX(1.5625deg) skewY(1.5625deg)', offset: 0.55 }),
                        style({ transform: 'skewX(-0.78125deg) skewY(-0.78125deg)', offset: 0.66 }),
                        style({ transform: 'skewX(0.390625deg) skewY(0.390625deg)', offset: 0.77 }),
                        style({ transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)', offset: 0.77 }),
                        style({ transform: 'translate3d(0, 0, 0)', offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('heartBeat'),
                    fn: animate('{{duration}}', keyframes([
                        style({ transform: 'scale(1)', offset: 0 }),
                        style({ transform: 'scale(1.3)', offset: 0.14 }),
                        style({ transform: 'scale(1)', offset: 0.28 }),
                        style({ transform: 'scale(1.3)', offset: 0.42 }),
                        style({ transform: 'scale(1)', offset: 0.70 }),
                        style({ transform: 'scale(1)', offset: 1 }),
                    ]))
                },
                {
                    key: this.prop('bounceIn'),
                    fn: animate('{{duration}}', keyframes([
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 0, transform: 'scale3d(0.3, 0.3, 0.3)', offset: 0 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'scale3d(1.1, 1.1, 1.1)', offset: 0.20 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'scale3d(0.9, 0.9, 0.9)', offset: 0.40 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'scale3d(1.03, 1.03, 1.03)', offset: 0.60 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'scale3d(0.97, 0.97, 0.97)', offset: 0.80 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 1, transform: 'scale3d(1, 1, 1)', offset: 1 }),

                    ]))
                },
                {
                    key: this.prop('bounceInDown'),
                    fn: animate('{{duration}}', keyframes([
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 0, transform: 'translate3d(0, -3000px, 0)', offset: 0 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 1, transform: 'translate3d(0, 25px, 0)', offset: 0.60 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, -10px, 0)', offset: 0.75 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, 5px, 0)', offset: 0.90 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, 0, 0)', offset: 1 }),

                    ]))
                },
                {
                    key: this.prop('bounceInLeft'),
                    fn: animate('{{duration}}', keyframes([
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 0, transform: 'translate3d(0, -3000px, 0)', offset: 0 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 1, transform: 'translate3d(0, 25px, 0)', offset: 0.60 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, -10px, 0)', offset: 0.75 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, 5px, 0)', offset: 0.90 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, 0, 0)', offset: 1 }),

                    ]))
                },
                {
                    key: this.prop('bounceInRight'),
                    fn: animate('{{duration}}', keyframes([
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 0, transform: 'translate3d(3000px, 0, 0)', offset: 0 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 1, transform: 'translate3d(-25px, 0, 0)', offset: 0.60 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(-25px, 0, 0)', offset: 0.75 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(-5px, 0, 0)', offset: 0.90 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, 0, 0)', offset: 1 }),

                    ]))
                },
                {
                    key: this.prop('bounceInUp'),
                    fn: animate('{{duration}}', keyframes([
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 0, transform: 'translate3d(0, 3000px, 0)', offset: 0 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', 'opacity': 1, transform: 'translate3d(0, -20px, 0)', offset: 0.60 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, 10px, 0)', offset: 0.75 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, -5px, 0)', offset: 0.90 }),
                        style({ 'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)', transform: 'translate3d(0, 0, 0)', offset: 1 }),

                    ]))
                },
            ];
    }



}

/**
 * Custom animation player
 */
@Injectable({ providedIn: 'root' })
export class CustomAnimationPlayer {

    private player: AnimationPlayer;

    constructor(
        private pa: PredefinedAnimations,
        private animationBuilder: AnimationBuilder,
    ) { }

    /**
     * Animate an element using pre-defined animation fn
     * @param name name of animation fn
     * @param el an html element
     * @param duration  Sets a duration for an animation action. A number and optional time unit, such as "1s" or "10ms"
     *        for one second and 10 milliseconds, respectively.The default unit is milliseconds. Default value is 800ms.
     */
    animate<K extends keyof AnimationKeyMap>(name: K, el: HTMLElement, duration: number | string = 800) {

        if (!el || !name) throw Error(`Either ${typeof (name)} or ${typeof (el)} missing.`);

        // destroy existing animation before starting new
        if (this.player) this.player.destroy();
        // get defined animation fn using key
        const a = this.pa.animationFn.find(_ => _.key === name);

        // build and assign to the player
        this.player = this.animationBuilder
            .build([a ? a.fn : null])
            .create(el, { params: { 'duration': typeof (duration) === 'number' ? `${duration}ms` : duration } });

        // play
        this.player.play();
    }
}
