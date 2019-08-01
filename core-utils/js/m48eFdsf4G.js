/*
 * Transition : rotate3D
 *
 * Author : Samuel Lager (sambenuts)
 */

var m48eFdsf4G = {
    opt_to_check: ['duration', 'direction'],
    init: function(slide_out, slide_in, background_out, background_in, options, reverse, styleAfter){
        let m = 1;
        if (reverse) m = -1;
        let options_direction = {
            'fromTop': ['rotateX', -1],
            'fromRight': ['rotateY', 1],
            'fromBottom': ['rotateX', 1],
            'fromLeft': ['rotateY', -1],
        };
        let dir = options_direction[options.direction];
        slide_in.style.opacity = '0';
        background_in.style.opacity = '0';
        slide_in.style.transform = dir[0] + '(' + dir[1]*m*180 + 'deg)';
        background_in.style.transform = dir[0] + '(' + dir[1]*m*180 + 'deg)';
        styleAfter.push([slide_in, 'transform', dir[0] + '(0deg)']);
        return [true, {m : m, dir: dir, zIndex: true}];
    },
    step: function(slide_out, slide_in, background_out, background_in, options, reverse, currentTime, beginningTime, args){
        let val = Projector.Anime.doEasing('easeInOutQuad', currentTime, beginningTime, options.duration, 0, 180);
        slide_in.style.transform = args.dir[0] + '(' + args.dir[1]*args.m*(180-val) + 'deg)';
        background_in.style.transform = args.dir[0] + '(' + args.dir[1]*args.m*(180-val) + 'deg)';
        if (slide_out !== null) {
            slide_out.style.transform = args.dir[0] + '(' + -args.dir[1]*args.m*val + 'deg)';
            background_out.style.transform = args.dir[0] + '(' + -args.dir[1]*args.m*val + 'deg)';
        }
        if (args.zIndex && val >= 90){
            args.zIndex = false;
            slide_in.style.opacity = '';
            background_in.style.opacity = '';
            slide_out.style.opacity = '0';
            background_out.style.opacity = '0';
        }
    }
};