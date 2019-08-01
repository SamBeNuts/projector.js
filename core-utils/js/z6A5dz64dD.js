/*
 * Transition : fade
 *
 * Author : Samuel Lager (sambenuts)
 */

var z6A5dz64dD = {
    opt_to_check: ['duration'],
    init: function(slide_out, slide_in, background_out, background_in, options, reverse, styleAfter){
        slide_in.style.opacity = '0';
        background_in.style.opacity = '0';
        background_in.style.zIndex = '1';
        background_out.style.zIndex = '0';
        styleAfter.push([slide_in, 'opacity', '1']);
        return [true, {}];
    },
    step: function(slide_out, slide_in, background_out, background_in, options, reverse, currentTime, beginningTime, args){
        let val = Projector.Anime.doEasing('easeInOutQuad', currentTime, beginningTime, options.duration, 0, 1);
        slide_in.style.opacity = val.toString();
        background_in.style.opacity = val.toString();
        if (slide_out !== null) slide_out.style.opacity = (1 - val).toString();
    }
};