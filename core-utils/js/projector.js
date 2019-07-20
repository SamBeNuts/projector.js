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
        defaultBackground: 'none',
        defaultBackgroundOptions: {},
        defaultTransition: 'none',
        defaultTransitionOptions: {},
        heightSlide: 1080,
        history: false,
        keyboard: true,
        loop: false,
        mouseWheel: true,
        progress: true,
        resizeSlides: true,
        selectionEnabled: true,
        selectionLayout: false,
        speakerWindow: false,
        widthSlide: 1920
    };

    let slidesAttributes = {
        autoplayId: null,
        cursorVisibleTimingId: null,
        initialized: false,
        loaded: false,
        nbSlide: 0,
        scale: 1,
        slideActive: -1,
        userAgent: null
    };

    let trad = {
        en: {
            pause: '<b>PAUSE</b><br>Press <span class="keybind_white">P</span> to continue',
            end: '<b>END</b><br>Press <span class="keybind_white">P</span> to restrart',
            stop_presenting: 'STOP PRESENTING',
            options_title: 'Options',
            fullscreen_option: 'Fullscreen',
            fullscreen_option_info: 'Shortcut : F'
        },
        fr: {
            pause: '<b>PAUSE</b><br>Presser <span class="keybind_white">P</span> pour continuer',
            end: '<b>END</b><br>Presser <span class="keybind_white">R</span> pour revoir',
            stop_presenting: 'ARRÊTER LA PRÉSENTATION',
            options_title: 'Options',
            fullscreen_option: 'Plein écran',
            resize_option: 'Adapter à l\'écran',
            resize_option_info: 'Adapte la taille de la diapositive à l\'écran tout en conservant le ratio',
            loop_option: 'Lire en boucle',
            loop_option_info: 'Après la dernière diapositive reviens à la première',
            keyboard_option: 'Contrôler avec le clavier',
            keyboard_option_info: 'Voir les raccourcis pour plus de détails',
            autoplay_option: 'Lecture automatique',
            autoplay_option_info: 'Passe à la diapositive suivante automatiquement (n\'active pas les animations)',
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
            shortcut_next: '<b>Espace</b>, <b>Flèche droite/haut</b>, <b>Clique gauche</b> : Dispositive suivante',
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
        }, '<img src="core-utils/media/projector_controls_icon.png" onclick="previousSlide()">' +
            '<img src="core-utils/media/projector_controls_icon.png" onclick="nextSlide()">', false);

        selector.pause = createUIElement(selector.body, 'div', 'pause', {
            pause: false
        }, '<p data-trad="pause"></p>', false);

        selector.menu = createUIElement(selector.body, 'div', 'menu', {
            menu: true
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
            '</div>', false);
        createOptionMenu('fullscreen', 'Projector.checkboxClick(this, Projector.toggleFullscreen, []);',
            false, isFullscreen());
        createOptionMenu('controls', 'Projector.checkboxClick(this, Projector.toggleData, [selector.controls, \'controls\']);',
            false, settings.controls);
        createOptionMenu('keyboard', 'Projector.checkboxClick(this, Projector.toggleData, [selector.slides, \'keyboard\']);',
            true, settings.keyboard);
        createOptionMenu('mousewheel', 'Projector.checkboxClick(this, Projector.toggleData, [selector.slides, \'mousewheel\']);',
            true, settings.mouseWheel);
        createOptionMenu('cursor', 'Projector.checkboxClick(this, Projector.toggleData, [selector.upper_layer, \'nocursor\']);',
            true, settings.cursorVisible);
        createOptionMenu('selection', 'Projector.checkboxClick(this, Projector.toggleData, [selector.upper_layer, \'selection\']);',
            true, settings.selectionEnabled);
        createOptionMenu('progress', 'Projector.checkboxClick(this, Projector.toggleData, [selector.progress, \'progress\']);',
            false, settings.progress);
        createOptionMenu('loop', 'Projector.checkboxClick(this, Projector.toggleData, [selector.slides, \'loop\']);',
            true, settings.loop);
        createOptionMenu('resize', 'Projector.checkboxClick(this, Projector.toggleData, [selector.slides, \'resize\']);Projector.slidesResize();',
            true, settings.resizeSlides);

        //Events
        window.addEventListener('resize', resizeSlides, false);

        document.addEventListener("keydown", function(key) {
            if (key.code === "F5" || key.code === "Escape" || key.code === "F11")
                key.preventDefault();
        }, false);

        document.addEventListener("keyup", function(key) {
            if (key.code === "KeyP")
                toggleData(selector.pause, "pause");
            else if (key.code === "Semicolon")
                toggleData(selector.menu, "menu");
            else if (key.code === "KeyR")
                goSlide(0);
            else if (key.code === "Escape" || key.code === "F5" || key.code === "F11" || key.code === "KeyF")
                checkboxClick(document.querySelector("#fullscreen div"), toggleFullscreen, []);
            else if ((key.code === "ArrowLeft" || key.code === "ArrowDown" || key.code === "Backspace") &&
                selector.pause.dataset.pause === "false" && selector.slides.dataset.keyboard === "true")
                previousSlide();
            else if ((key.code === "ArrowRight" || key.code === "ArrowUp" || key.code === "Space" || key.code === "Enter") &&
                selector.pause.dataset.pause === "false" && selector.slides.dataset.keyboard === "true")
                nextSlide();
        }, false);

        selector.upperLayer.addEventListener("mouseup", function(key){
            if ((key.button === 0 || key.button === 1) && selector.pause.dataset.pause === "false" &&
                selector.upper_layer.dataset.selection === "false")
                nextSlide();
        },false);

        document.addEventListener("wheel", function(key){
            if (selector.slides.dataset.mousewheel === "true" && selector.pause.dataset.pause === "false" &&
                selector.menu.dataset.menu === "false"){
                if (key.deltaY > 0) previousSlide();
                else if (key.deltaY < 0) nextSlide();
            }
        },false);

        //Setup
        selector.slides.style.width = settings.widthSlide + "px";
        selector.slides.style.height = settings.heightSlide + "px";
        populateTrad();
        setupPostMessage();
        scrollPrevention();
        cursorVisible();
        createNotPremiumEnd();
        autoplay();

        //Loading end
        selector.body.removeChild(selector.loading);
        delete selector.loading;
        slidesAttributes.started = true;
    }

    function resizeSlides() {
        if (selector.slides.dataset.resize === 'true'){
            slidesAttributes.scale = Math.min(
                window.innerHeight/selector.slides.dataset.height,
                window.innerWidth/selector.slides.dataset.width
            );
            selector.slides.style.transform = 'translate(-50%, -50%) scale(' + slidesAttributes.scale + ')';
        }else{
            slidesAttributes.scale = 1;
            selector.slides.style.transform = 'translate(-50%, -50%)';
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

    function createOptionMenu(id, onclick, info, checked){
        let innerHTML = '<div class="checkbox';
        if(checked) innerHTML += ' checked';
        innerHTML += '" id="' + id + '">' +
            '    <div onclick="' + onclick + '"></div>' +
            '    <span data-trad="' + id + '_option"></span>' +
            '</div>';
        if(info) innerHTML += '<p class="info" data-trad="' + id + '_option_info"></p>';
        createUIElement(selector.menu.children[1].children[0], 'div', 'option', null, innerHTML, false);
    }

    function populateTrad(){
        document.querySelectorAll('[data-trad]').forEach(function(el){
            el.innerHTML = trad[document.documentElement.lang][el.dataset.trad];
        });
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

    function autoplay(){
        if (settings.autoplay){
            slidesAttributes.autoplayId = window.setInterval(nextSlide, settings.autoplayTiming);
        }else{
            window.clearInterval(slidesAttributes.autoplayId);
            slidesAttributes.autoplayId = null;
        }
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

    function toggleFullscreen() {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    function isFullscreen(){
        return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    }

    function updateProgress() {
        selector.progress.style.width = slidesAttributes.slideActive / slidesAttributes.nbSlide * 100 + "%";
    }

    function previousSlide(){

    }

    function nextSlide(){

    }

    function goSlide(){

    }

    function toggleChecboxAndData(el, attr){
        document.querySelector("#" + attr).classList.toggle("checked");
        toggleData(el, attr);
    }

    function toggleData(el, attr){
        el.dataset[attr] = (!deserializeString(el.dataset[attr])).toString();
    }

    function checkboxClick(el, func, parameters){
        el.parentElement.classList.toggle('checked');
        if (func !== null) func.apply(window, parameters);
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

    Projector = {
        start: start,
        resizeSlides: resizeSlides,
        toggleFullscreen: toggleFullscreen,
        toggleData: toggleData,
        checkboxClick: checkboxClick,
        settings: settings,
        selector: selector
    };

    return Projector;
}));