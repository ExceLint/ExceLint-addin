import { mount } from 'enzyme';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-dom/test-utils';
export function findNodes(wrapper, className) {
    return wrapper.find(className).filterWhere(function (node) { return typeof node.type() === 'string'; });
}
export function expectNodes(wrapper, className, n) {
    expect(findNodes(wrapper, className).length).toEqual(n);
}
export function expectOne(wrapper, className) {
    expectNodes(wrapper, className, 1);
}
export function expectMissing(wrapper, className) {
    expectNodes(wrapper, className, 0);
}
/** @deprecated Use fake timers and `jest.runAllTimers()` instead */
export function delay(millisecond) {
    return new Promise(function (resolve) { return setTimeout(resolve, millisecond); });
}
/**
 * Mounts the element attached to a child of document.body. This is primarily for tests involving
 * event handlers (which don't work right unless the element is attached).
 */
export function mountAttached(element) {
    var parent = document.createElement('div');
    document.body.appendChild(parent);
    return mount(element, { attachTo: parent });
}
export function renderIntoDocument(element) {
    var component = ReactTestUtils.renderIntoDocument(element);
    var renderedDOM = ReactDOM.findDOMNode(component);
    return renderedDOM;
}
export function mockEvent(targetValue) {
    if (targetValue === void 0) { targetValue = ''; }
    var target = { value: targetValue };
    return { target: target };
}
/**
 * Hack for forcing Jest to run pending promises
 * https://github.com/facebook/jest/issues/2157#issuecomment-279171856
 */
export function flushPromises() {
    return new Promise(function (resolve) { return setImmediate(resolve); });
}
//# sourceMappingURL=testUtilities.js.map