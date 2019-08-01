(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Projector = factory();
    }
}(this, function() {
    'use strict';

    let Projector;

    let version = '1.0.0';

    let selector = {
        body: document.querySelector('body'),
        slides: document.querySelector('.slides')
    };

    let settings = {
        autoplay: false,
        autoplayTiming: 4000,
        animations: true,
        controls: true,
        cursorVisible: 'auto', //false / true / 'auto': not visible if inactive
        cursorVisibleTiming: 4000,
        defaultBackground: {},
        defaultTransition: 'none',
        defaultTransitionOptions: {},
        heightSlide: 1080,
        history: false,
        loop: false,
        mouseWheel: true,
        progress: true,
        resizeSlides: true,
        selectionEnabled: true,
        speakerWindow: false,
        widthSlide: 1920
    };

    let slidesAttributes = {
        animationActive: {},
        animationIndex: 0,
        animationTimeline: [],
        autoplayId: null,
        cursorVisibleTimingId: null,
        animationTimerActive: {},
        initialized: false,
        loaded: false,
        nbSlide: 0,
        menu: false,
        pause: false,
        scale: 1,
        selection: false,
        slideActive: -1,
        transitionActive: null,
        userAgent: null
    };

    let trad = {
        en: {
            pause: '<b>PAUSE</b><br>Press <span class="keybind">P</span> to continue',
            end: '<b>END</b><br>Press <span class="keybind">P</span> to restrart',
            stop_presenting: 'STOP PRESENTING',
            options_title: 'Options',
            fullscreen_option: 'Fullscreen',
            fullscreen_option_info: 'Shortcut : F'
        },
        fr: {
            pause: '<b>PAUSE</b><br>Presser <span class="keybind">P</span> pour continuer',
            end: '<b>END</b><br>Presser <span class="keybind">R</span> pour revoir',
            stop_presenting: 'ARRÊTER LA PRÉSENTATION',
            options_title: 'Options',
            fullscreen_option: 'Plein écran',
            resize_option: 'Adapter à l\'écran',
            resize_option_info: 'Adapte la taille de la diapositive à l\'écran tout en conservant le ratio',
            loop_option: 'Lire en boucle',
            loop_option_info: 'Après la dernière diapositive reviens à la première',
            autoplay_option: 'Lecture automatique',
            autoplay_option_info: 'Passe à la diapositive suivante automatiquement',
            mousewheel_option: 'Contrôler avec la molette',
            mousewheel_option_info: 'Permet de contrôler le diaporama avec la molette de la souris',
            cursor_option: 'Cacher le curseur',
            cursor_option_info: 'Désactive le curseur de la souris',
            selection_option: 'Autoriser la sélection',
            selection_option_info: 'Désactive le clic gauche de la souris pour passer à la diapositive suivante',
            progress_option: 'Barre de progression',
            controls_option: 'Afficher les contrôles',
            shortcuts_title: 'Raccourcis',
            shortcut_fullscreen: '<b>F</b> : Plein écran',
            shortcut_menu: '<b>M</b> : Menu',
            shortcut_previous: '<b>Flèche gauche/bas</b> : Diapositive précédente',
            shortcut_next: '<b>Flèche droite/haut</b>, <b>Clique gauche</b>, <b>Espace</b> : Dispositive suivante',
            shortcut_pause: '<b>P</b> : Pause',
            shortcut_restart: '<b>R</b> : Recommencer'
        }
    };

    function start(obj) {
        if (slidesAttributes.initialized) return;
        slidesAttributes.initialized = true;
        console.info('v' + version);
        pushObject(settings, obj);

        //Slides attributes
        slidesAttributes.userAgent = navigator.userAgent;
        slidesAttributes.nbSlide = selector.slides.children.length;

        //UI elements
        selector.loading = createUIElement(selector.body, 'div', 'loading', null,
            '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>', true);

        selector.end = createUIElement(selector.body, 'div', 'end', {
            end: false
        }, '<p data-trad="end"></p>', true);

        selector.backgrounds = createUIElement(selector.body, 'div', 'backgrounds', null, '', true);

        selector.upperLayer = createUIElement(selector.body, 'div', 'upper_layer', {
            cursor: settings.cursorVisible && settings.cursorVisible !== 'auto',
            selection: settings.selectionEnabled
        }, '', false);

        selector.progress = createUIElement(selector.body, 'div', 'progress', {
            progress: settings.progress
        }, '', false);

        selector.controls = createUIElement(selector.body, 'div', 'controls', {
            controls: settings.controls
        }, '<img src="core-utils/media/projector_controls_icon.png" onclick="Projector.previous()">' +
            '<img src="core-utils/media/projector_controls_icon.png" onclick="Projector.next()">', false);

        selector.pause = createUIElement(selector.body, 'div', 'pause', {
            pause: slidesAttributes.pause
        }, '<p data-trad="pause"></p>', false);

        selector.menu = createUIElement(selector.body, 'div', 'menu', {
            menu: slidesAttributes.menu
        }, '<div class="top_logo">' +
            '    <a href="https://www.impart.com"><img src="core-utils/media/logo_negative.png"></a>' +
            '</div>' +
            '<div class="content">' +
            '    <div class="content_part">' +
            '        <p class="title" data-trad="options_title"></p>' +
            '    </div>' +
            '    <div class="content_part">' +
            '        <p class="title" data-trad="shortcuts_title"></p>' +
            '        <p class="shortcut" data-trad="shortcut_fullscreen"></p>' +
            '        <p class="shortcut" data-trad="shortcut_menu"></p>' +
            '        <p class="shortcut" data-trad="shortcut_previous"></p>' +
            '        <p class="shortcut" data-trad="shortcut_next"></p>' +
            '        <p class="shortcut" data-trad="shortcut_pause"></p>' +
            '        <p class="shortcut" data-trad="shortcut_restart"></p>' +
            '    </div>' +
            '</div>' +
            '<div class="bottom_stop" onclick="window.close();">' +
            '    <p data-trad="stop_presenting"></p>' +
            '</div>' +
            '<div class="open_close_btn" onclick="Projector.toggleMenu()">' +
            '   <img src="core-utils/media/projector_controls_icon.png">' +
            '</div>', false);
        createOptionMenu('fullscreen', toggleFullscreen, false, isFullscreen());
        createOptionMenu('controls', toggleControls,false, settings.controls);
        createOptionMenu('mousewheel', toggleMouseWheel,true, settings.mouseWheel);
        //createOptionCursorMenu('cursor', toggleCursorVisible);
        createOptionMenu('selection', toggleSelection,true, settings.selectionEnabled);
        createOptionMenu('progress', toggleProgress,false, settings.progress);
        createOptionMenu('loop', toggleLoop,true, settings.loop);
        createOptionMenu('autoplay', toggleAutoplay,true, settings.autoplay);
        createOptionMenu('resize', toggleResize,true, settings.resizeSlides);

        //Events
        window.addEventListener('resize', resizeSlides, false);

        window.addEventListener('hashchange', goHash, false);

        document.addEventListener("keydown", function(key) {
            if (key.code === "Escape" || key.code === "F11")
                key.preventDefault();
        }, false);

        document.addEventListener("keyup", function(key) {
            if (key.code === "KeyP")
                togglePause();
            else if (key.code === "Semicolon")
                toggleMenu();
            else if (key.code === "KeyR")
                go(0, 0);
            else if (key.code === "Escape" || key.code === "F11" || key.code === "KeyF")
                toggleFullscreen();
            else if ((key.code === "ArrowLeft" || key.code === "ArrowDown" || key.code === "Backspace") &&
                !slidesAttributes.pause)
                previous();
            else if ((key.code === "ArrowRight" || key.code === "ArrowUp" || key.code === "Space" || key.code === "Enter") &&
                !slidesAttributes.pause)
                next();
        }, false);

        selector.upperLayer.addEventListener("mouseup", function(key){
            if ((key.button === 0 || key.button === 1) && !slidesAttributes.pause && !settings.selectionEnabled)
                next();
        },false);

        document.addEventListener("wheel", function(key){
            if (settings.mouseWheel && !slidesAttributes.pause && !slidesAttributes.menu){
                if (key.deltaY > 0) previous();
                else if (key.deltaY < 0) next();
            }
        },false);

        //Setup
        selector.slides.style.width = settings.widthSlide + "px";
        selector.slides.style.height = settings.heightSlide + "px";
        selector.backgrounds.style.width = settings.widthSlide + "px";
        selector.backgrounds.style.height = settings.heightSlide + "px";
        populateTrad();
        initBackgrounds();
        populateTransitions();
        initAnimations();
        setupPostMessage();
        scrollPrevention();
        cursorVisible();
        updateControls();
        updateProgress();
        resizeSlides();
        createNotPremiumEnd();

        //Loading end
        slidesAttributes.loaded = true;
        window.addEventListener("load", function(){
            setTimeout(loaded, 100);
        },false);
    }

    function loaded(){
        selector.body.removeChild(selector.loading);
        delete selector.loading;
        slidesAttributes.started = true;
        autoplay();
        goHash();
    }

    function resizeSlides() {
        if (settings.resizeSlides){
            slidesAttributes.scale = Math.min(
                window.innerHeight/settings.heightSlide,
                window.innerWidth/settings.widthSlide
            );
            selector.slides.style.transform = 'translate(-50%, -50%) scale(' + slidesAttributes.scale + ')';
            selector.backgrounds.style.transform = 'translate(-50%, -50%) scale(' + slidesAttributes.scale + ')';
        }else{
            slidesAttributes.scale = 1;
            selector.slides.style.transform = 'translate(-50%, -50%)';
            selector.backgrounds.style.transform = 'translate(-50%, -50%)';
        }
    }

    function createUIElement(parent, tag, name, data, innerHTML, atEnd){
        let el = document.createElement(tag);
        el.classList.add(name);
        for(let d in data) el.dataset[d] = data[d];
        el.innerHTML = innerHTML;
        if (!atEnd) parent.appendChild(el);
        else parent.insertBefore(el, selector.slides);
        return el;
    }

    /*function createOptionMenu(id, onclick, info, checked){
        let innerHTML = '<div class="checkbox';
        if(checked) innerHTML += ' checked';
        innerHTML += '" id="' + id + '" onclick="' + onclick + '">' +
            '    <span data-trad="' + id + '_option"></span>' +
            '    <div></div>' +
            '</div>';
        if(info) innerHTML += '<p class="info" data-trad="' + id + '_option_info"></p>';
        createUIElement(selector.menu.children[1].children[0], 'div', 'option', null, innerHTML, false);
    }*/

    function createOptionMenu(id, onclick, info, checked){
        let div = document.createElement('div');
        div.classList.add('option');
        div.appendChild(createCheckbox(id, onclick, checked));
        if (info) {
            let p = document.createElement('p');
            p.classList.add('info');
            p.dataset.trad = id + '_option_info';
            div.appendChild(p);
        }
        selector.menu.children[1].children[0].appendChild(div);
    }

    function createCheckbox(id, onclick, checked){
        let div = document.createElement('div');
        div.classList.add('checkbox');
        if (checked) div.classList.add('checked');
        div.id = id;
        div.addEventListener('click', onclick, false);
        let span = document.createElement('span');
        span.dataset.trad = id + '_option';
        div.appendChild(span);
        div.appendChild(document.createElement('div'));
        return div;
    }

    /*function createSelect(id, onclick, options, option_selected){
        let div = document.createElement('div');
        div.classList.add('select');
        div.id = id;
        div.addEventListener('click', function(e){
          if (e.target.nodeName === "P") e.currentTarget.querySelector('.option_select span').innerHTML = e.target.innerHTML;
            e.currentTarget.classList.toggle('active');
        }, false);
        let span = document.createElement('span');
        span.dataset.trad = id + '_option';
        div.appendChild(span);
        let div1 = document.createElement('div');
        div1.classList.add('option_select');
        span = document.createElement('span');
        span.dataset.trad = id + '_option_' + options[option_selected];
        div1.appendChild(span);
        div1.appendChild(document.createElement('div'));
        div.appendChild(div1);
        div1 = document.createElement('div');
        div1.classList.add('options');
        for (let option in options){
            span = document.createElement('p');
            span.dataset.trad = id + '_option_' + options[option];
            div1.appendChild(span);
        }
        div.appendChild(div1);
        return div;
    }

    function createOptionCursorMenu(id, onclick){
        let options = {
            true: "Toujours visible",
            false: "Jamais visible",
            "auto": "Visible si actif"
        };
        let div = document.createElement('div');
        div.classList.add('option');
        div.appendChild(createSelect(id, onclick, options, settings.cursorVisible));
        selector.menu.children[1].children[0].appendChild(div);
    }*/

    function populateTrad(){
        document.querySelectorAll('[data-trad]').forEach(function(el){
            let t = trad[document.documentElement.lang][el.dataset.trad];
            if (t !== undefined) el.innerHTML = t;
            else el.innerHTML = trad.en[el.dataset.trad];
        });
    }

    function initBackgrounds(){
        let slides = selector.slides.children;
        let backgrounds = selector.backgrounds;
        if(settings.defaultBackground.type !== undefined){
            for(let i = 0; i < slidesAttributes.nbSlide; i++){
                if (slides[i].dataset.background === undefined) slides[i].dataset.background = JSON.stringify(settings.defaultBackground);
            }
        }
        for (let i = 0; i < slides.length; i++){
            let div = document.createElement('div');
            div.classList.add('background');
            if(slides[i].dataset.background !== undefined){
                let bg = JSON.parse(slides[i].dataset.background);
                if (bg.type === 'color'){
                    let color = document.createElement('div');
                    color.style.position = 'absolute';
                    color.style.top = '0';
                    color.style.left = '0';
                    color.style.width = '100%';
                    color.style.height = '100%';
                    color.style.backgroundColor = bg.value;
                    div.appendChild(color);
                }else if (bg.type === 'image'){
                    let image = document.createElement('div');
                    image.style.position = 'absolute';
                    image.style.top = '0';
                    image.style.left = '0';
                    image.style.width = '100%';
                    image.style.height = '100%';
                    image.style.backgroundImage = 'url("' + bg.src + '")';
                    image.style.backgroundSize = bg.size;
                    image.style.backgroundPosition = bg.position;
                    image.style.backgroundRepeat = bg.repeat;
                    div.appendChild(image);
                }
            }
            backgrounds.appendChild(div);
        }
    }

    function populateTransitions(){
        if(settings.defaultTransition !== 'none'){
            for(let i = 0; i < slidesAttributes.nbSlide; i++){
                let s = selector.slides.children[i].dataset;
                if (s.transition === undefined){
                    s.transition = settings.defaultTransition;
                    s.transitionOptions = JSON.stringify(settings.defaultTransitionOptions);
                }
            }
        }
    }

    function initAnimations(){
        let slides = selector.slides.children;
        for (let i = 0; i < slides.length; i++){
            if (slides[i].dataset.animation !== undefined){
                let timeline = slides[i].dataset.animation.split('|');
                timeline.forEach(function(v, i, a){
                    a[i] = JSON.parse(v);
                });
                slidesAttributes.animationTimeline.push(timeline);
            }
            else slidesAttributes.animationTimeline.push([]);
        }
        document.querySelectorAll('.anim').forEach(function(el){
            el.dataset.style = el.style.cssText;
        });
    }

    function updateAnimations(next){
        if (slidesAttributes.slideActive >= 0 && slidesAttributes.slideActive < slidesAttributes.nbSlide) {
            if(next){
                selector.slides.children[slidesAttributes.slideActive].querySelectorAll('.anim').forEach(function(el){
                    el.style.cssText = el.dataset.style;
                });
                slidesAttributes.animationIndex = 0;
            }
            else doDefaultAnimation(slidesAttributes.animationTimeline[slidesAttributes.slideActive].length);
        }
    }

    function setupPostMessage() {
        window.addEventListener('message', function (event) {
            let data = event.data;
            if(typeof data === 'string' && data.charAt(0) === '{' && data.charAt(data.length - 1) === '}') {
                data = JSON.parse( data );
                if(data.method && typeof Projector[data.method] === 'function') {
                    Projector[data.method].apply(Projector, data.args);
                }
            }
        }, false);
    }

    function scrollPrevention() {
        setInterval( function() {
            if( selector.body.scrollTop !== 0 || selector.body.scrollLeft !== 0 ) {
                selector.body.scrollTop = 0;
                selector.body.scrollLeft = 0;
            }
        }, 1000 );
    }

    function togglePause(){
        slidesAttributes.pause = !slidesAttributes.pause;
        selector.pause.dataset.pause = (!deserializeString(selector.pause.dataset.pause)).toString();
    }

    function toggleMenu(){
        slidesAttributes.menu = !slidesAttributes.menu;
        selector.menu.dataset.menu = (!deserializeString(selector.menu.dataset.menu)).toString();
    }

    function toggleFullscreen() {
        toggleChecked(document.querySelector('#fullscreen'));
        if (!isFullscreen()) {
            if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
            else if (document.documentElement.msRequestFullscreen) document.documentElement.msRequestFullscreen();
            else if (document.documentElement.mozRequestFullScreen) document.documentElement.mozRequestFullScreen();
            else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    }

    function isFullscreen(){
        return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    }

    function toggleControls(el){
        settings.controls = !settings.controls;
        selector.controls.dataset.controls = (!deserializeString(selector.controls.dataset.controls)).toString();
        toggleChecked(el.currentTarget);
    }

    function toggleMouseWheel(el){
        settings.mouseWheel = !settings.mouseWheel;
        toggleChecked(el.currentTarget);
    }

    /*function toggleCursorVisible(value){
        settings.cursorVisible = value;
        cursorVisible();
    }*/

    function cursorVisible(){
        if (settings.cursorVisible === 'auto'){
            document.addEventListener('mousemove', cursorVisibleTiming, false);
            document.addEventListener('mousedown', cursorVisibleTiming, false);
        }else{
            selector.upperLayer.dataset.cursor = settings.cursorVisible;
            selector.upperLayer.dataset.selection = settings.selectionEnabled;
            document.removeEventListener('mousemove', cursorVisibleTiming, false);
            document.removeEventListener('mousedown', cursorVisibleTiming, false);
        }
    }

    function cursorVisibleTiming(){
        selector.upperLayer.dataset.cursor = 'true';
        selector.upperLayer.dataset.selection = settings.selectionEnabled;
        clearTimeout(slidesAttributes.cursorVisibleTimingId);
        slidesAttributes.cursorVisibleTimingId = setTimeout(function () {
            selector.upperLayer.dataset.cursor = 'false';
            selector.upperLayer.dataset.selection = 'false';
        }, settings.cursorVisibleTiming);
    }

    function toggleSelection(el){
        settings.selectionEnabled = !settings.selectionEnabled;
        selector.upperLayer.dataset.selection = (!deserializeString(selector.upperLayer.dataset.selection)).toString();
        toggleChecked(el.currentTarget);
    }

    function toggleProgress(el){
        settings.progress = !settings.progress;
        selector.progress.dataset.progress = (!deserializeString(selector.progress.dataset.progress)).toString();
        toggleChecked(el.currentTarget);
    }

    function toggleLoop(el){
        settings.loop = !settings.loop;
        toggleChecked(el.currentTarget);
    }

    function toggleAutoplay(el){
        settings.autoplay = !settings.autoplay;
        toggleChecked(el.currentTarget);
        autoplay();
    }

    function autoplay(){
        if (settings.autoplay){
            slidesAttributes.autoplayId = window.setInterval(next, settings.autoplayTiming);
        }else{
            window.clearInterval(slidesAttributes.autoplayId);
            slidesAttributes.autoplayId = null;
        }
    }

    function toggleResize(el){
        settings.resizeSlides = !settings.resizeSlides;
        toggleChecked(el.currentTarget);
        resizeSlides();
    }

    function createNotPremiumEnd(){
        let img = document.createElement("img");
        img.src = "core-utils/media/logo_negative.png";
        img.style.position = "absolute";
        img.style.bottom = "20px";
        img.style.left = "50%";
        img.style.marginLeft = "-100px";
        img.style.width = "200px";
        img.style.height = "auto";
        selector.end.appendChild(img);
    }

    function updateControls() {
        if (slidesAttributes.slideActive <= 0){
            selector.controls.firstElementChild.classList.add('disabled');
            selector.controls.lastElementChild.classList.remove('disabled');
        } else if (slidesAttributes.slideActive === slidesAttributes.nbSlide){
            selector.controls.firstElementChild.classList.remove('disabled');
            selector.controls.lastElementChild.classList.add('disabled');
        }
        else {
            selector.controls.firstElementChild.classList.remove('disabled');
            selector.controls.lastElementChild.classList.remove('disabled');
        }
    }

    function updateProgress() {
        selector.progress.style.transform = 'scaleX(' + slidesAttributes.slideActive / slidesAttributes.nbSlide + ')';
    }

    function previous(){
        if (slidesAttributes.slideActive > 0) {
            if (slidesAttributes.transitionActive !== null) cancelTransition(false);
            else if (Object.keys(slidesAttributes.animationActive).length !== 0 ||
                Object.keys(slidesAttributes.animationTimerActive).length !== 0) cancelAnimation(false);
            else if (slidesAttributes.animationIndex > 0) animation(false);
            else transition(false);
        }
    }

    function next(){
        if (slidesAttributes.slideActive < slidesAttributes.nbSlide) {
            if (slidesAttributes.transitionActive !== null) cancelTransition(true);
            else if (Object.keys(slidesAttributes.animationActive).length !== 0 ||
                Object.keys(slidesAttributes.animationTimerActive).length !== 0) cancelAnimation(true);
            else if (slidesAttributes.slideActive !== -1 && slidesAttributes.animationIndex < slidesAttributes.animationTimeline[slidesAttributes.slideActive].length) animation(true);
            else transition(true);
        } else if(settings.autoplay) toggleAutoplay(document.querySelector('#autoplay'));
    }

    function go(s, a){
        if (s >= 0 && s < slidesAttributes.nbSlide){
            let updateAnim = false;
            if (s !== slidesAttributes.slideActive){
                if (slidesAttributes.slideActive !== -1 && slidesAttributes.slideActive !== slidesAttributes.nbSlide){
                    selector.slides.children[slidesAttributes.slideActive].style.display = 'none';
                    selector.backgrounds.children[slidesAttributes.slideActive].style.display = 'none';
                }
                else if (slidesAttributes.slideActive === slidesAttributes.nbSlide) selector.end.dataset.end = 'false';
                slidesAttributes.slideActive = s;
                selector.slides.children[slidesAttributes.slideActive].style.display = 'block';
                selector.backgrounds.children[slidesAttributes.slideActive].style.display = 'block';
                if (settings.autoplay) { //restart
                    toggleAutoplay(document.querySelector('#autoplay')); //stop
                    toggleAutoplay(document.querySelector('#autoplay')); //start
                }
                updateAnimations(true);
                updateAnim = true;
                updateControls();
                updateProgress();
            }
            if (a !== 0){
                if (!updateAnim) updateAnimations(true);
                doDefaultAnimation(a);
                checkNextAnimation(a, true, true);
            }
        }
    }

    function goHash(){
        let hash = new URL(document.location).hash;
        if(hash === '') next();
        else {
            let s;
            if (hash.indexOf('-') !== -1) s = parseInt(hash.substring(1, hash.indexOf('-')));
            else s = parseInt(hash.substring(1));
            if (isNaN(s) || s < 0) s = 0;
            else if (s >= slidesAttributes.nbSlide) s = slidesAttributes.nbSlide - 1;
            let a = parseInt(hash.substring(hash.indexOf('-') + 1));
            if (isNaN(a) || a < 0) a = 0;
            else if (a >= slidesAttributes.animationTimeline[s].length) a = slidesAttributes.animationTimeline[s].length;
            go(s, a);
        }
    }

    function cancelTransition(next){
        cancelAnimationFrame(slidesAttributes.transitionActive[0]);
        if (slidesAttributes.transitionActive[1] !== null) {
            slidesAttributes.transitionActive[1].style.cssText = '';
            slidesAttributes.transitionActive[3].style.cssText = '';
        }
        slidesAttributes.transitionActive[2].style.cssText = '';
        slidesAttributes.transitionActive[4].style.cssText = '';
        if (next === slidesAttributes.transitionActive[5]) {
            if (!next) slidesAttributes.slideActive--;
            else slidesAttributes.slideActive++;
            updateAnimations(next);
            updateControls();
            updateProgress();
        }
        slidesAttributes.transitionActive = null;
        selector.slides.children[slidesAttributes.slideActive].style.display = 'block';
        selector.backgrounds.children[slidesAttributes.slideActive].style.display = 'block';
        if (next) checkNextAnimation(0, true, true);
    }
    
    function transition(next){
        if (slidesAttributes.slideActive === slidesAttributes.nbSlide - 1 && next && !settings.loop) {
            selector.slides.children[slidesAttributes.slideActive].style.display = 'none';
            selector.backgrounds.children[slidesAttributes.slideActive].style.display = 'none';
            selector.end.dataset.end = 'true';
            slidesAttributes.slideActive++;
            updateAnimations(next);
            updateControls();
            updateProgress();
            return;
        }
        if (slidesAttributes.slideActive === slidesAttributes.nbSlide && !next) {
            selector.slides.children[slidesAttributes.slideActive - 1].style.display = 'block';
            selector.backgrounds.children[slidesAttributes.slideActive - 1].style.display = 'block';
            selector.end.dataset.end = 'false';
            slidesAttributes.slideActive--;
            updateAnimations(next);
            updateControls();
            updateProgress();
            return;
        }

        let p, n, transitionName;

        if (slidesAttributes.slideActive === -1) {
            p = -1;
            n = 0;
            slidesAttributes.slideActive = n;
        }
        else if (next) {
            p = slidesAttributes.slideActive;
            if (slidesAttributes.slideActive !== slidesAttributes.nbSlide - 1) n = slidesAttributes.slideActive + 1;
            else n = 0;
            slidesAttributes.slideActive = n;
        }
        else {
            p = slidesAttributes.slideActive - 1;
            n = slidesAttributes.slideActive;
            slidesAttributes.slideActive = p;
        }
        let bg_p = p, bg_n = n;
        if (p !== -1) {
            p = selector.slides.children[p];
            bg_p = selector.backgrounds.children[bg_p];
        }
        n = selector.slides.children[n];
        bg_n = selector.backgrounds.children[bg_n];
        transitionName = n.dataset.transition;
        if (transitionName !== undefined){
            if (p === -1) {
                p = null;
                bg_p = null;
            }
            doTransition(p, n, bg_p, bg_n, transitionName, JSON.parse(n.dataset.transitionOptions), !next);
        } else doDefaultTransition(p, n, bg_p, bg_n, next);
        updateAnimations(next);
        updateControls();
        updateProgress();
    }

    function doDefaultTransition(p, n, bg_p, bg_n, next){
        if (next) {
            if (p !== -1 && p !== null) {
                p.style.display = 'none';
                bg_p.style.display = 'none';
            }
            n.style.display = 'block';
            bg_n.style.display = 'block';
        } else {
            p.style.display = 'block';
            bg_p.style.display = 'block';
            n.style.display = 'none';
            bg_n.style.display = 'none';
        }
    }

    function doTransition(p, n, bg_p, bg_n, transitionName, transitionOptions, reverse){
        if (!checkAnimeOptions(window[transitionName].opt_to_check, transitionOptions)){
            doDefaultTransition(p, n, bg_p, bg_n, !reverse);
            return;
        }
        if (reverse){
            let temp = p;
            p = n;
            n = temp;
            temp = bg_p;
            bg_p = bg_n;
            bg_n = temp;
        }
        let styleAfter = [];
        let init = window[transitionName].init(p, n, bg_p, bg_n, transitionOptions, reverse, styleAfter);
        n.style.display = 'block';
        bg_n.style.display = 'block';
        if (!init[0]){
            doDefaultTransition(p, n, bg_p, bg_n, true);
            return;
        }
        let beginningTime = performance.now();
        let id;
        function step(currentTime){
            window[transitionName].step(p, n, bg_p, bg_n, transitionOptions, reverse, currentTime, beginningTime, init[1]);
            slidesAttributes.transitionActive = null;
            if (!isAnimeFinish(styleAfter)){
                id = requestAnimationFrame(step);
                slidesAttributes.transitionActive = [id, p, n, bg_p, bg_n, reverse];
            } else {
                if (p !== null){
                    p.style.cssText = '';
                    bg_p.style.cssText = '';
                }
                if (!reverse) checkNextAnimation(0, true, true);
            }
        }
        id = requestAnimationFrame(step);
        slidesAttributes.transitionActive = [id, p, n, bg_p, bg_n, reverse];
    }

    function cancelAnimation(next){
        let findIndex = false, index;
        for (let el in slidesAttributes.animationTimerActive){
            clearTimeout(el);
            if (!findIndex){
                index = findAnimationIndex(slidesAttributes.animationTimerActive[el], next);
                findIndex = true;
            }
        }
        slidesAttributes.animationTimerActive = {};
        for (let el in slidesAttributes.animationActive){
            cancelAnimationFrame(slidesAttributes.animationActive[el][0]);
            slidesAttributes.animationActive[el][2].style.cssText = slidesAttributes.animationActive[el][2].dataset.style;
            if (!findIndex){
                index = findAnimationIndex(slidesAttributes.animationActive[el][1], next);
                findIndex = true;
            }
        }
        slidesAttributes.animationActive = {};
        doDefaultAnimation(index);
    }
    
    function animation(next){
        if (!next) slidesAttributes.animationIndex--;
        let anim = slidesAttributes.animationTimeline[slidesAttributes.slideActive][slidesAttributes.animationIndex];
        if (next) slidesAttributes.animationIndex++;
        if (anim !== undefined) {
            doAnimation(slidesAttributes.animationIndex, anim.targetId, anim.animation, anim.options, !next, anim.delay);
            checkNextAnimation(slidesAttributes.animationIndex, next, false);
        } else if (!next && slidesAttributes.animationIndex === -1 && slidesAttributes.slideActive > 0) transition(false);
    }

    function checkNextAnimation(index, next, end){
        if (index < slidesAttributes.animationTimeline[slidesAttributes.slideActive].length){
            let anim = slidesAttributes.animationTimeline[slidesAttributes.slideActive][index];
            if (anim.trigger === "sync" && !end) animation(next);
            else if (anim.trigger === "after" && end) animation(next);
        }
    }

    function findAnimationIndex(index, next){
        let anim = slidesAttributes.animationTimeline[slidesAttributes.slideActive];
        let i = 1;
        if (!next) i = -1;
        while (index >= 0 && index < anim.length && anim[index].trigger !== "click") index += i;
        return index;
    }

    function doDefaultAnimation(index){
        if(index === -1) {
            go(slidesAttributes.slideActive - 1, slidesAttributes.animationTimeline[slidesAttributes.slideActive - 1].length);
        }else{
            let anim = slidesAttributes.animationTimeline[slidesAttributes.slideActive];
            for (let i = 0; i < index; i++){
                let a = anim[i];
                let styleAfter = [];
                let obj = document.querySelector('[data-object-id="' + a.targetId + '"]');
                window[a.animation].init(obj, a.options, false, styleAfter);
                for(let j = 0; j < styleAfter.length; j++){
                    styleAfter[j][0].style[styleAfter[j][1]] = styleAfter[j][2];
                }
                obj.style.visibility = 'visible';
            }
            slidesAttributes.animationIndex = index;
        }
    }

    function doAnimation(index, objectId, animationName, animationOptions, reverse, delay){
        if (!checkAnimeOptions(window[animationName].opt_to_check, animationOptions)) return;
        let styleAfter = [];
        let object = document.querySelector('[data-object-id="' + objectId + '"]');
        let init = window[animationName].init(object, animationOptions, reverse, styleAfter);
        object.style.visibility = 'visible';
        if (!init[0]) return;
        let beginningTime = performance.now();
        let id, idTimer;
        let delay_after = 0;
        if(!next){
            delay_after = delay;
            delay = 0;
        }
        function step(currentTime){
            window[animationName].step(object, animationOptions, reverse, currentTime, beginningTime, init[1]);
            delete slidesAttributes.animationActive[id];
            if (!isAnimeFinish(styleAfter)){
                id = requestAnimationFrame(step);
                slidesAttributes.animationActive[id] = [id, index, object, reverse];
            } else{
                idTimer = setTimeout(function(){
                    checkNextAnimation(index, !reverse, true);
                    delete slidesAttributes.animationTimerActive[idTimer];
                }, delay_after);
                slidesAttributes.animationTimerActive[idTimer] = index;
            }
        }
        idTimer = setTimeout(function(){
            id = requestAnimationFrame(step);
            slidesAttributes.animationActive[id] = [id, index, object, reverse];
            delete slidesAttributes.animationTimerActive[idTimer];
        }, delay);
        slidesAttributes.animationTimerActive[idTimer] = index;
    }

    function isAnimeFinish(styleAfter){
        for(let i = 0; i < styleAfter.length; i++){
            if(styleAfter[i][0] !== null && styleAfter[i][0].style[styleAfter[i][1]] !== styleAfter[i][2]) return false;
        }
        return true;
    }

    function checkAnimeOptions(opt_to_check, opt_send){
        for(let i = 0; i < opt_to_check.length; i++){
            if (opt_send[opt_to_check[i]] === undefined) return false;
        }
        return true;
    }

    function toggleChecked(el){
        el.classList.toggle('checked');
    }

    function pushObject(obj1, obj2) {
        for(let el in obj2) obj1[el] = obj2[el];
    }

    function deserializeString(str) {
        if(typeof str === 'string'){
            if(str === 'null') return null;
            else if(str === 'true') return true;
            else if(str === 'false') return false;
            else if(str.match(/^-?\d*\.\d*$/)) return parseFloat(str);
            else if(str.match(/^-?\d*$/)) return parseInt(str);
        }
        return str;
    }

    let Anime = {
        doEasing: function(easing, c, b, d, f, t){ //c: current (time), b: beginning (time), d: duration, f: from (value), t: to (value)
            if (c-b < 0) c = b;
            else if (c-b > d*1.02) return t;
            let val = (t-f) * Anime.easing[easing]((c-b)/d) + f;
            if (val > t && c-b > d*0.98) return t;
            else return val;
        },
        easing: { //t: [0,1]
            linear: function(t){
                return t;
            },
            easeInQuad: function(t){
                return t*t;
            },
            easeOutQuad: function(t){
                return 1 - Anime.easing.easeInQuad(1-t);
            },
            easeInOutQuad: function(t){
                if (t < 0.5) return 2*Anime.easing.easeInQuad(t);
                else return 1 - 2*Anime.easing.easeInQuad(1-t);
            }
        }
    };

    Projector = {
        start: start,
        previous: previous,
        next: next,
        go: go,
        toggleFullscreen: toggleFullscreen,
        togglePause: togglePause,
        toggleMenu: toggleMenu,
        toggleControls: toggleControls,
        toggleMouseWheel: toggleMouseWheel,
        //toggleCursorVisible: toggleCursorVisible,
        toggleSelection: toggleSelection,
        toggleProgress: toggleProgress,
        toggleLoop: toggleLoop,
        toggleAutoplay: toggleAutoplay,
        toggleResize: toggleResize,
        Anime: Anime,
        settings: settings,
        selector: selector,
        slidesAttributes: slidesAttributes
    };

    return Projector;
}));