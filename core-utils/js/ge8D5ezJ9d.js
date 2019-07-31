/*
 * Transition : slide
 *
 * Author : Samuel Lager (sambenuts)
 */

var ge8D5ezJ9d = {
    opt_to_check: ['duration', 'direction'],
    init: function(slide_out, slide_in, background_out, background_in, options, reverse, styleAfter){
        let m = 1;
        if (reverse) m = -1;
        let options_direction = {
            'fromTop': ['translateY', 1],
            'fromRight': ['translateX', -1],
            'fromBottom': ['translateY', -1],
            'fromLeft': ['translateX', 1],
        };
        let dir = options_direction[options.direction];
        slide_in.style.transform = dir[0] + '(' + dir[1]*m*100 + '%)';
        background_in.style.transform = dir[0] + '(' + dir[1]*m*100 + '%)';
        styleAfter.push([slide_in, 'transform', dir[0] + '(0%)']);
        return [true, {m : m, dir: dir}];
    },
    step: function(slide_out, slide_in, background_out, background_in, options, reverse, currentTime, beginningTime, args){
        let val = Projector.Anime.doEasing('easeInOutQuad', currentTime, beginningTime, options.duration, 0, 100);
        slide_in.style.transform = args.dir[0] + '(' + args.dir[1]*args.m*(val-100) + '%)';
        background_in.style.transform = args.dir[0] + '(' + args.dir[1]*args.m*(val-100) + '%)';
        if (slide_out !== null) {
            slide_out.style.transform = args.dir[0] + '(' + args.dir[1]*args.m*val + '%)';
            background_out.style.transform = args.dir[0] + '(' + args.dir[1]*args.m*val + '%)';
        }
    }
};