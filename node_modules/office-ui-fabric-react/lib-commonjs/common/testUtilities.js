"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var enzyme_1 = require("enzyme");
var ReactDOM = require("react-dom");
var ReactTestUtils = require("react-dom/test-utils");
function findNodes(wrapper, className) {
    return wrapper.find(className).filterWhere(function (node) { return typeof node.type() === 'string'; });
}
exports.findNodes = findNodes;
function expectNodes(wrapper, className, n) {
    expect(findNodes(wrapper, className).length).toEqual(n);
}
exports.expectNodes = expectNodes;
function expectOne(wrapper, className) {
    expectNodes(wrapper, className, 1);
}
exports.expectOne = expectOne;
function expectMissing(wrapper, className) {
    expectNodes(wrapper, className, 0);
}
exports.expectMissing = expectMissing;
/** @deprecated Use fake timers and `jest.runAllTimers()` instead */
function delay(millisecond) {
    return new Promise(function (resolve) { return setTimeout(resolve, millisecond); });
}
exports.delay = delay;
/**
 * Mounts the element attached to a child of document.body. This is primarily for tests involving
 * event handlers (which don't work right unless the element is attached).
 */
function mountAttached(element) {
    var parent = document.createElement('div');
    document.body.appendChild(parent);
    return enzyme_1.mount(element, { attachTo: parent });
}
exports.mountAttached = mountAttached;
function renderIntoDocument(element) {
    var component = ReactTestUtils.renderIntoDocument(element);
    var renderedDOM = ReactDOM.findDOMNode(component);
    return renderedDOM;
}
exports.renderIntoDocument = renderIntoDocument;
function mockEvent(targetValue) {
    if (targetValue === void 0) { targetValue = ''; }
    var target = { value: targetValue };
    return { target: target };
}
exports.mockEvent = mockEvent;
/**
 * Hack for forcing Jest to run pending promises
 * https://github.com/facebook/jest/issues/2157#issuecomment-279171856
 */
function flushPromises() {
    return new Promise(function (resolve) { return setImmediate(resolve); });
}
exports.flushPromises = flushPromises;
//# sourceMappingURL=testUtilities.js.map