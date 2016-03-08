/**
 * Created by Jacky on 2015/2/26.
 */
(function (window, document) {
    var document = window.document,
        navigator = window.navigator,
        location = window.location;
    var id_reg = /^#\S+/i,
        class_reg = /^\.\S+/i,
        tag_reg = /^[^\.#]\S+/i,
        child_reg = /^(\S+)\s+(\S+)/i,
        trimLeft = /^\s+/,
        trimRight = /\s+$/;
    var getElementsByClassName = function (searchClass, node, tag) {
        if (document.getElementsByClassName) {
            var nodes = (node || document).getElementsByClassName(searchClass), result = [];
            for (var i = 0; node = nodes[i++];) {
                if (tag && tag !== "*" && node.tagName === tag.toUpperCase()) {
                    result.push(node)
                } else if (!tag || tag === "*") {
                    result.push(node);
                }
            }
            return result
        } else {
            node = node || document;
            tag = tag || "*";
            var classes = searchClass.split(" "),
                elements = (tag === "*" && node.all) ? node.all : node.getElementsByTagName(tag),
                patterns = [],
                current,
                match;
            var i = classes.length;
            while (--i >= 0) {
                patterns.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
            }
            var j = elements.length;
            while (--j >= 0) {
                current = elements[j];
                match = false;
                for (var k = 0, kl = patterns.length; k < kl; k++) {
                    match = patterns[k].test(current.className);
                    if (!match)  break;
                }
                if (match)  result.push(current);
            }
            return result;
        }
    };
    var _isDisplay = function(_this){
        var _dis = _this['display'];
        var _opa = parseInt(_this['opacity'],10);
        if(_dis != 'none'){
            if(_opa > 0){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    };
    var mQuery = function (selector) {
        if(Object.prototype.toString.call(selector) === '[object String]'){
            return new mQuery.fn.init(selector);
        } else if(typeof selector == 'object'){
            return new mQuery.extend([selector],mQuery.fn);
        }

    };
    mQuery.fn = mQuery.prototype = {
        constructor: mQuery,
        _query: null,
        _findStack: [],
        init: function (selector) {
            var that = this;
            that.context = null;
            that.resultEle = [];
            mQuery._query = null;
            mQuery._findStack = [];
            return that.find(selector);
        },
        find: function (selector) {
            var _find = function (selector, context, that) {
                if (selector.match(child_reg)) {
                    var p_selector = RegExp.$1;
                    var c_selector = RegExp.$2;
                    var p_ele, c_ele;
                    if (id_reg.test(p_selector)) {
                        p_ele = document.getElementById(p_selector.replace(/^#/i, ''));
                    } else if (class_reg.test(p_selector)) {
                        p_ele = getElementsByClassName(p_selector.replace(/^./i, ''), context);
                    } else {
                        p_ele = context.getElementsByTagName(p_selector);
                    }
                    if (id_reg.test(c_selector)) {
                        c_ele = document.getElementById(c_selector.replace(/^#/i, ''));
                        if(c_ele){
                            that.resultEle.push(c_ele);
                        }
                    } else if (class_reg.test(c_selector)) {
                        c_ele = getElementsByClassName(c_selector.replace(/^./i, ''), p_ele);
                        for (var i = 0; i < c_ele.length; i++) {
                            that.resultEle.push(c_ele[i]);
                        }
                    } else {
                        c_ele = context.getElementsByTagName(c_selector);
                        for (var j = 0; j < c_ele.length; j++) {
                            that.resultEle.push(c_ele[j]);
                        }
                    }
                } else {
                    var _ele;
                    if (id_reg.test(selector)) {
                        _ele = document.getElementById(selector.replace(/^#/i, ''));
                        if(_ele){
                            that.resultEle.push(_ele);
                        }
                    } else if (class_reg.test(selector)) {
                        _ele = getElementsByClassName(selector.replace(/^./i, ''), context);
                        for (var i = 0; i < _ele.length; i++) {
                            that.resultEle.push(_ele[i]);
                        }
                    } else {
                        if(selector == 'document'){
                            that.resultEle.push(document);
                        } else{
                            _ele = context.getElementsByTagName(selector);
                            for (var j = 0; j < _ele.length; j++) {
                                that.resultEle.push(_ele[j]);
                            }
                        }

                    }
                }
            };
            var that = this;
            that.resultEle = [];
            var _context = that.length >0 ? that : document;
            if (Object.prototype.toString.call(_context) === '[object Array]') {
                for (var k=0; k< _context.length; k++) {
                    _find(selector, _context[k], that);
                }
            } else {
                _find(selector, document, that);
            }
            mQuery.extend(that.resultEle, mQuery.fn);
            mQuery._findStack.push(that.resultEle);
            return that.resultEle;
        },
        eq : function(_index){
            var _tempNodeList = [];
            for(var i=0; i<this.length; i++){
                _tempNodeList.push(this[i]);
            }
            if(_index < 0 || _index > _tempNodeList.length-1){
                return [];
            } else{
                return mQuery.extend([_tempNodeList[_index]], mQuery.fn);
            }
        },
        end : function(){
            mQuery._query = null;
            if(mQuery._findStack && mQuery._findStack.length > 0){
                var _currentQuery = null;
                if(mQuery._findStack.length == 1){
                    _currentQuery = mQuery._findStack.pop();
                    return _currentQuery;
                }else{
                    mQuery._findStack.pop();
                    _currentQuery = mQuery._findStack.pop();
                    return  _currentQuery;
                }
            }
            return mQuery.extend([], mQuery.fn);
        },
        attr : function(_attrKey,_attrVal){
            var that = this;
            var _setAttribute = function(o,k,v){
                if(o && typeof o === 'object' && k && typeof k === 'string'){
                    k == 'class' ? o.className = v  : o.setAttribute(k ,v) ;
                }
            };
            var _getAttribute = function(o,k){
                if(o && typeof o === 'object' && k && typeof k === 'string'){
                    return k == 'class' ? o.className  : o.getAttribute(k) ;
                }
                return '';
            };
            if(Object.prototype.toString.call(_attrKey) === '[object Object]'){
                that.each(function(_index){
                    var _this = this;
                    for(var k in _attrKey){
                        _setAttribute(_this,k,_attrKey[k]);
                    }
                });
                return that;
            }else if(Object.prototype.toString.call(_attrKey) === '[object String]'){
                if(typeof _attrVal !== 'undefined') {
                    if(Object.prototype.toString.call(_attrVal) === '[object String]') {
                        that.each(function (_index) {
                            var _this = this;
                            _setAttribute(_this, _attrKey, _attrVal);
                        });
                    }
                    return that;
                } else{
                    var _result = [];
                    that.each(function(_index){
                        var _this= this;
                        var _r = _getAttribute(_this, _attrKey);
                        if(_r && _r != 'undefined' && _r != 'null'){
                            _result.push(_r);
                        }
                    });
                    if(_result.length == 0){
                        return '';
                    }
                    if(_result.length == 1){
                        return _result[0];
                    }
                    return _result;
                }
            }
        },
        removeAttr : function(_attrKey){
            var that = this;
            var _removeAttribute = function(o,k){
                if(o && typeof o === 'object' && k && typeof k === 'string'){
                    k == 'class' ? o.removeAttribute('className')  : o.removeAttribute(k) ;
                }
            };
            if(Object.prototype.toString.call(_attrKey) === '[object Array]'){
                that.each(function(){
                    var _this = this;
                    for(var i=0; i<_attrKey.length; i++){
                        _removeAttribute(_this,_attrKey[i]);
                    }
                });
            } else if(Object.prototype.toString.call(_attrKey) === '[object String]'){
                that.each(function(){
                    var _this = this;
                    _removeAttribute(_this,_attrKey);
                });
            }
            return that;
        },
        each : function(_execute){
            var that = this;
            var _tempList = [];
            for(var i=0; i<that.length; i++){
                _tempList.push(that[i]);
                if(_execute && Object.prototype.toString.call(_execute) === '[object Function]'){
                    _execute.call(_tempList[i],i);
                }
            }
            return that;
        },
        css : function(key, value){
            var that = this;
            var getStyle = function(ele){
                if(window.getComputedStyle){
                    return window.getComputedStyle( ele, null );
                } else if ( document.documentElement.currentStyle ) {
                    return ele.currentStyle;
                }
            };
            if(Object.prototype.toString.call(key) === '[object Object]'){
                that.each(function(_index){
                    var _this = this;
                    for(var k in key){
                        _this.style[k] = key[k];
                    }
                });
                return that;
            }
            if(Object.prototype.toString.call(key) === '[object String]'){
                if(typeof value !== 'undefined'){
                    that.each(function(_index){
                        var _this = this;
                        _this.style[key] = value;
                    });
                    return that;
                }else{
                    var _result = [];
                    that.each(function(_index){
                        var _this = this;
                        var _r = getStyle(_this)[key];
                        if(_r){
                            _result.push(_r);
                        }
                    });
                    if(_result.length == 0){
                        return '';
                    }
                    if(_result.length == 1){
                        return _result[0];
                    }
                    return _result;
                }
            }
            return that;
        },
        hasClass : function(class_name){
            var that = this;
            var result = false;
            that.each(function (_index) {
                var _this = this;
                var _cur_class = _this.className;
                if (mQuery.trim(_cur_class) === class_name) {
                    result = true;
                }
                if(_cur_class.indexOf(' ' + class_name) > -1 || _cur_class.indexOf(class_name + ' ') > -1){
                    result = true;
                }
            });
            return result;
        },
        addClass : function(class_name){
            var that = this;
            that.each(function(_index){
                var _this = this;
                var _cur_class = mQuery.trim(_this.className);
                if(!_cur_class) {
                    _this.className = class_name;
                }else {
                    if(_cur_class != class_name){
                        if(_cur_class.indexOf(' ') > -1){
                            if(_cur_class.indexOf(class_name) <= -1){
                                _this.className = _cur_class.toString().replace(trimRight,'') + ' ' + class_name;
                            }
                        }else{
                            _this.className = _cur_class.toString().replace(trimRight,'') + ' ' + class_name;
                        }
                    }
                }
            });
            return that;
        },
        removeClass : function(class_name){
            var that = this;
            that.each(function(_index){
                var _this = this;
                var _cur_class = mQuery.trim(_this.className);
                if(_cur_class){
                    if (mQuery.trim(_cur_class) === class_name) {
                        _this.className = '';
                    }else if(_cur_class.indexOf(' ') > -1){
                        var _c_arr = _cur_class.split(' ');
                        var _tem_arr = [];
                        for(var i=0; i<_c_arr.length; i++){
                            if(_c_arr[i] && _c_arr[i] != class_name){
                                _tem_arr.push(_c_arr[i]);
                            }
                        }
                        _this.className = _tem_arr.join(' ');
                    }
                }
            });
            return that;
        },
        html : function(_str){
            var that = this;
            if(typeof _str == 'undefined'){
                var _html = '';
                that.each(function(_index){
                    var _this = this;
                    _html += _this.innerHTML;
                });
                return _html;
            }else{
                that.each(function(_index){
                    var _this = this;
                    _this.innerHTML = _str;
                });
                return that;
            }
        },
        val : function(_str){
            var that = this;
            if(typeof _str == 'undefined'){
                var _value = '';
                that.each(function(_index){
                    var _this = this;
                    _value = _this.value;
                });
                return _value;
            }else{
                that.each(function(){
                    var _this = this;
                    _this.value = _str;
                });
                return that;
            }
        },
        append : function(_str){
            var that = this;
            if(typeof _str == 'undefined'){
                var _html = '';
                that.each(function(_index){
                    var _this = this;
                    _html += _this.innerHTML;
                });
                return _html;
            }else{
                that.each(function(_index){
                    var _this = this;
                    var frag = document.createDocumentFragment();
                    var temp = document.createElement('div');
                    temp.innerHTML = _str;
                    var childrens = temp.children;
                    var eleArr = [];
                    for(var x=0; x<childrens.length; x++){
                        eleArr.push(childrens[x]);
                    }
                    var size = eleArr.length;
                    for(var i=0; i<size; i++){
                        frag.appendChild(eleArr[i]);
                    }
                    _this.appendChild(frag);
                });
                return that;
            }
        },
        show : function(_time,_callback){
            var that = this;
            that.each(function () {
                var _this = this;
                var _dis = _isDisplay(_this);
                if (!_dis) {
                    var opa = _this.style['opacity'] = 0;
                    _this.style['display'] = 'block';
                    if (_time && _time > 0) {
                        var off = 1 / _time;
                        var _timer = null;
                        _timer = setInterval(function () {
                            opa += off;
                            if (opa >= 1) {
                                _this.style['opacity'] = 1;
                                clearInterval(_timer);
                                _timer = null;
                                _callback && _callback();
                            } else {
                                _this.style['opacity'] = opa;
                            }
                        }, 1);
                    } else {
                        _this.style['opacity'] = 1;
                        _callback && _callback();
                    }
                } else {
                    _this.style['opacity'] = 1;
                    _callback && _callback();
                }
            });
        },
        hide : function(_time,_callback){
            var that = this;
            that.each(function () {
                var _this = this;
                var _dis = _isDisplay(_this);
                if (_dis) {
                    var opa = _this.style['opacity'] = 1;
                    if (_time && _time > 0) {
                        var off = 1 / _time;
                        var _timer = null;
                        _timer = setInterval(function () {
                            opa -= off;
                            if (opa <= 0) {
                                _this.style['opacity'] = 0;
                                _this.style['display'] = 'none';
                                clearInterval(_timer);
                                _timer = null;
                                _callback && _callback();
                            } else {
                                _this.style['opacity'] = opa;
                            }
                        }, 1);
                    } else {
                        _this.style['opacity'] = 0;
                        _this.style['display'] = 'none';
                        _callback && _callback();
                    }
                } else {
                    _this.style['opacity'] = 0;
                    _this.style['display'] = 'none';
                    _callback && _callback();
                }
            });
        },
        fadeIn : function(_time, _callback){
            var that = this;
            that.each(function(){
                var _this = this;
                var _dis = _isDisplay(_this);
                if(!_dis) {
                    var opa = _this.style['opacity'] = 0;
                    _this.style['display'] = 'block';
                    if (_time && _time > 0) {
                        var off = 1 / _time;
                        var _timer = null;
                        _timer = setInterval(function () {
                            opa += off;
                            if (opa >= 1) {
                                _this.style['opacity'] = 1;
                                clearInterval(_timer);
                                _timer = null;
                                _callback && _callback();
                            } else {
                                _this.style['opacity'] = opa;
                            }
                        }, 1);
                    } else {
                        _this.style['opacity'] = 1;
                        _callback && _callback();
                    }
                }else{
                    _this.style['opacity'] = 1;
                    _callback && _callback();
                }
            });
            return that;
        },
        fadeOut : function(_time, _callback){
            var that = this;
            that.each(function(){
                var _this = this;
                var _dis = _isDisplay(_this);
                if(_dis){
                    var opa = _this.style['opacity'] = 1;
                    if(_time && _time > 0){
                        var off = 1/_time;
                        var _timer = null;
                        _timer = setInterval(function(){
                            opa -= off;
                            if(opa <= 0){
                                _this.style['opacity'] = 0;
                                _this.style['display'] = 'none';
                                clearInterval(_timer);
                                _timer = null;
                                _callback && _callback();
                            }else{
                                _this.style['opacity'] = opa;
                            }
                        },1);
                    }else{
                        _this.style['opacity'] = 0;
                        _this.style['display'] = 'none';
                        _callback && _callback();
                    }
                }else{
                    _this.style['opacity'] = 0;
                    _this.style['display'] = 'none';
                    _callback && _callback();
                }
            });
            return that;
        },
        bind: function (type, eventFunc, useCapture) {
            var that = this;
            if(!useCapture){
                useCapture = false;
            }
            if (document.addEventListener) {
                that.each(function(){
                    this.addEventListener(type, eventFunc, useCapture);
                });
            } else {
                that.each(function(){
                    this.attachEvent('on' + type, eventFunc);
                });
            }
        },
        unbind : function(type, eventFunc, useCapture){
            var that = this;
            if(!useCapture){
                useCapture = false;
            }
            if (document.removeEventListener) {
                that.each(function(){
                    this.removeEventListener(type, eventFunc, useCapture);
                });
            } else {
                that.each(function(){
                    this.detachEvent('on' + type, eventFunc);
                });
            }
        }
    };
    mQuery.extend = function () {
        function deepExtend(destination, source) {
            for (var key in source) {
                var value = source[key];
                if (value instanceof Array) {
                    destination[key] = arguments.callee.call(destination[key] || [], value);
                } else if (value instanceof Object) {
                    destination[key] = arguments.callee.call(destination[key] || {}, value);
                } else {
                    if (destination == source[key]) {
                        continue;
                    }
                    destination[key] = source[key];
                }
            }
            return destination;
        }

        var argumentsLen = arguments.length;
        if (argumentsLen === 1) {
            var source = arguments[0];
            for (var key in source) {
                if (destination == source[key]) {
                    continue;
                }
                mQuery[key] = source[key];
            }
        } else {
            var firstItem = arguments[0];
            var isBoolean = typeof firstItem === "boolean";
            var destination = isBoolean ? arguments[1] : firstItem;
            var startNum = isBoolean ? 2 : 1;
            var sourceArr = Array.prototype.slice.call(arguments, startNum);
            for (var i = 0, len = sourceArr.length; i < len; i++) {
                var source = sourceArr[i];
                if (isBoolean) {
                    deepExtend(destination, source);
                } else {
                    for (var key in source) {
                        if (destination == source[key]) {
                            continue;
                        }
                        destination[key] = source[key];
                    }
                }
            }
            return destination;
        }
    };
    mQuery.trim = function(str){
        if(!str){
            return '';
        }
        return str.toString().replace(trimLeft,'').replace(trimRight,'');
    };
    mQuery.ajax = function (_options) {
        var createXMLHttpRequest = function () {
            if (window.ActiveXObject) {
                var aVersions = ["MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp"];
                for (var i = 0; i < aVersions.length; i++) {
                    try {
                        return new ActiveXObject(aVersions[i]);
                    } catch (oError) {
                        continue;
                    }
                }
            } else if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            }
            throw new Error("XMLHttp object could not be created.");
        };
        var timeRequest = function(timeout, timeoutCall){
            this.timer = null;
            this.timeout = timeout || 5000;
            this.timeoutFlag = false;
            this.destroyFlag = false;
            var that = this;
            clearTimeout(this.timer);
            this.timer = setTimeout(function(){
                that.timeoutFlag = true;
                if(!that.destroyFlag){
                    timeoutCall && timeoutCall();
                } else{
                    that.destroy();
                }
            },this.timeout);
            this.destroy = function(){
                that.destroyFlag = true;
                clearTimeout(that.timer);
                that.timer = null;
            }
        };
        var timer = null;
        if(_options.dataType.toLowerCase() == 'jsonp'){
            if(_options.time){
                timer = new timeRequest(_options.time,_options.timeout);
            }
            var jsonp_str = 'jsonp_' + (+new Date());
            //eval(jsonp_str + ' = ' + _options.success + ';');
            if(_options.url.match(/(\?|\&)callback=/)){
                jsonp_str = _options.url.replace(/^\S+(\?|\&)callback=([^&\s]+)\&?\S*$/,'$2');
            }else{
                if(_options.url.indexOf('?') >= 0){
                    _options.url += '&callback=' + jsonp_str;
                } else{
                    _options.url += '?callback=' + jsonp_str;
                }
            }
            window[jsonp_str]  = function(res){
                if(timer){
                    if(!timer.timeoutFlag){
                        _options.success(res);
                        timer.destroy();
                    }
                }else{
                    _options.success(res);
                }
            };
            for(var i in _options.data) {
                _options.url += '&' + i + '=' + _options.data[i];
            }
            var doc_head = document.getElementsByTagName("head")[0];
            var script = document.createElement("script");
            script.setAttribute("type","text/javascript");
            script.setAttribute("language","javascript");
            script.setAttribute("src",_options.url);
            script.onload = script.onreadystatechange = function () {
                if (typeof this.readyState == 'undefined') {  // for chrome,firefox
                    doc_head.removeChild(script);
                    script = null;
                    window[jsonp_str] = undefined;
                } else if (this.readyState == 'loaded' || this.readyState == 'complete') { // for ie
                    doc_head.removeChild(script);
                    script = null;
                    window[jsonp_str] = undefined;
                }
            };
            doc_head.appendChild(script);
        }else{
            if(_options.time){
                timer = new timeRequest(_options.time,_options.timeout);
            }
            var _xmlHttp = createXMLHttpRequest();
            _xmlHttp.open(_options.method, _options.url, true);
            if (_options.method.toUpperCase() == "POST") {
                _xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            } else{
                _xmlHttp.setRequestHeader("cache-control", "no-cache");
                if(_options.url.indexOf('?') >= 0){
                    for(var i in _options.data) {
                        _options.url += '&' + i + '=' + _options.data[i];
                    }
                }else{
                    _options.url += '?_=_';
                    for(var i in _options.data) {
                        _options.url += '&' + i + '=' + _options.data[i];
                    }
                }
            }
            _xmlHttp.onreadystatechange = function () {
                if (_xmlHttp.readyState == 4 && _xmlHttp.status == 200) {
                    var response = null;
                    switch (_options.dataType.toLowerCase()) {
                        case "json":
                            response = JSON.parse(_xmlHttp.responseText);
                            break;
                        case "xml":
                            response = _xmlHttp.responseXML;
                            break;
                        case "html":
                            response = _xmlHttp.responseText;
                            break;
                        default:
                            response = _xmlHttp.responseText;
                            break;
                    }
                    if (typeof (_options.success) != 'undefined') {
                        if(timer){
                            if(!timer.timeoutFlag){
                                _options.success(response);
                                timer.destroy();
                            }
                        }else{
                            _options.success(response);
                        }
                    }
                }else if (_xmlHttp.readyState == 4) {
                    var codes = ['500', '501', '502', '503', '504', '505', '404'];
                    if (codes.join(',').indexOf(_xmlHttp.status.toString()) >= 0 && typeof (_options.error) != 'undefined') {
                        _options.error(_xmlHttp.status, _xmlHttp.responseText);
                        if(timer){
                            if(!timer.timeoutFlag){
                                _options.error(_xmlHttp.status, _xmlHttp.responseText);
                                timer.destroy();
                            }
                        }else{
                            _options.error(_xmlHttp.status, _xmlHttp.responseText);
                        }
                    }
                }
            };
            var query = [], data;
            for (var key in _options.data) {
                query[query.length] = encodeURI(key) + "=" + encodeURIComponent(_options.data[key]);
            }
            data = query.join('&');
            //开始发送数据
            _xmlHttp.send(data);
        }
    };
    mQuery.get = function (_url, _data, _dataType, callback) {
        mQuery.ajax({
            url: _url,
            data: _data,
            dataType: _dataType,
            method: "GET",
            success: callback
        });
    };
    mQuery.post = function (_url, _data, _dataType, callback) {
        mQuery.ajax({
            url: _url,
            data: _data,
            method: "POST",
            dataType: _dataType,
            success: callback
        });
    };
    mQuery.getJSON = function(_url, _data, callback, _dataType){
        if(!_dataType){
            _dataType = 'json';
        }
        mQuery.get(_url, _data, _dataType, callback);
    };
    mQuery.fn.init.prototype = mQuery.fn;
    window.mQuery = window.m$ = window.$ = mQuery;
})(window, document);

