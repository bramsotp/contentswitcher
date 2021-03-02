/**
 * Constructor for new contentswitcher object.
 *
 * @param {array} contentSetCodes - Array of contentSet code strings. The first in the list will be selected (made active).
 * @param {*} options - May be undefined, or the string "defer", or an object containing options. In defer mode, the contentswitcher object will return a function to retrieve the value, rather than returning the value itself.
 * If specified as an object, the options argument may contain these properties:
 *   mode: "defer" or undefined. If not "defer", the contentswitcher will default to immediate mode
 *   strict: true, false, or undefined (=false). If true, a javascript error will be thrown when a nonexistent contentSet code or content ID is used. If not true, the undefined value will be returned when a nonexistent contentSet code or content ID is used.
 * @return {*} A contentswitcher instance configured with the given options.
 */
window.contentSwitcherV2 = (function(){
    var extraProperties = {
        version: '2.0.0'
    };

    var constructorFn = function(contentSetCodes, options) {
        var obj = {};
        obj.selected = contentSetCodes[0];
        obj.contentSetCodes = contentSetCodes;
        options = options || {};
        if (typeof(options) === 'string') {
            var mode = options;
            options = {mode: mode};
        }
        obj.mode = options.mode;
        obj.stringsById = {};

        var fnSelectContentSet = function(contentSetCode) {
            obj.selected = contentSetCode;
            // NO VALIDATION YET!
            // need something like: if contentSetCode not in obj.contentSetCodes then throw error
        }

        function ContentErrorMessage(contentSetCode, content) {
            var contentIdText = 'content';
            if (typeof(content) === 'string') {
                contentIdText = 'content ID "' + content + '"';
            }
            else if (typeof(content) === 'object') {
                contentIdText = 'content with codes ' + Object.keys(content).map(x => '"'+x+'"').join(', ')
            }
            return `Content missing for code ${contentSetCode} in ${contentIdText}`;
        }

        var fnGetImmediate = function(getArg) {
            var value = undefined;
            if (typeof(getArg) == "string") {
                // by id
                if (obj.stringsById.hasOwnProperty(getArg) && obj.stringsById[getArg].hasOwnProperty(obj.selected)) {
                    value = obj.stringsById[getArg][obj.selected];
                }
                else if (options.strict) {
                    throw new Error(ContentErrorMessage(obj.selected, getArg));
                }
            }
            else if (typeof(getArg) == "object") {
                // via supplied text
                if (getArg.hasOwnProperty(obj.selected)) {
                    value = getArg[obj.selected];
                }
                else if (options.strict) {
                    throw new Error(ContentErrorMessage(obj.selected, getArg));
                }
            }
            return value;
        };

        var fnGetDefer = function(getArg) {
            var fn = function() {
                return fnGetImmediate(getArg);
            };
            return fn;
        }

        var fnGetByMode = function(getArg) {
            if (obj.mode == "defer") {
                return fnGetDefer(getArg);
            } else {
                return fnGetImmediate(getArg)
            }
        }

        var fnAdd = function(id, values) {
            obj.stringsById[id] = values;
            // NO VALIDATION YET!
        };

        var objPublic = fnGetByMode;
        objPublic.switch = fnSelectContentSet;
        objPublic.defer = fnGetDefer;
        objPublic.get = fnGetImmediate;
        objPublic.add = fnAdd;
        return objPublic;
    };

    Object.assign(constructorFn, extraProperties);
    return constructorFn;
})();