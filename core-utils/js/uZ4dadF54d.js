/*
 * Animation : fade
 *
 * Author : Samuel Lager (sambenuts)
 */

var uZ4dadF54d = {
    opt_to_check: ['duration'],
    init: function(object, options, reverse, styleAfter){
        if (!reverse) object.style.opacity = '0';
        else object.style.opacity = '1';
        if (!reverse) styleAfter.push([object, 'opacity', '1']);
        else styleAfter.push([object, 'opacity', '0']);
        return [true, {}];
    },
    step: function(object, options, reverse, currentTime, beginningTime, args){
        let val = Projector.Anime.doEasing('easeInOutQuad', currentTime, beginningTime, options.duration, 0, 1);
        if (!reverse) object.style.opacity = val.toString();
        else object.style.opacity = (1 - val).toString();
    }
};