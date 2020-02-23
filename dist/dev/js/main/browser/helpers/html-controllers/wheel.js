"use strict";

exports.__esModule = true;
exports.bindWheel = bindWheel;

function bindWheel(container, eventHandler, options) {
  function _eventHandler(event) {
    event.delta = event.wheelDelta || -event.detail;
    event.offsetXContainer = event.offsetX;
    event.offsetYContainer = event.offsetY;
    var target = event.target;

    while (target != null && target !== container) {
      event.offsetXContainer += target.offsetLeft;
      event.offsetYContainer += target.offsetTop;
      target = target.parentElement;
    }

    return eventHandler.call(this, event);
  } // IE9, Chrome, Safari, Opera


  container.addEventListener('mousewheel', _eventHandler, options); // Firefox

  container.addEventListener('DOMMouseScroll', _eventHandler, options);
  return function () {
    // IE9, Chrome, Safari, Opera
    container.removeEventListener('mousewheel', _eventHandler, options); // Firefox

    container.removeEventListener('DOMMouseScroll', _eventHandler, options);
  };
}