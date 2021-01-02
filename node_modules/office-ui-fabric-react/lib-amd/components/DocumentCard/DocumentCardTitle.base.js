define(["require", "exports", "tslib", "react", "../../Utilities", "@uifabric/utilities"], function (require, exports, tslib_1, React, Utilities_1, utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var TRUNCATION_VERTICAL_OVERFLOW_THRESHOLD = 5;
    /**
     * {@docCategory DocumentCard}
     */
    var DocumentCardTitleBase = /** @class */ (function (_super) {
        tslib_1.__extends(DocumentCardTitleBase, _super);
        function DocumentCardTitleBase(props) {
            var _this = _super.call(this, props) || this;
            _this._titleElement = React.createRef();
            _this._measureTitleElement = React.createRef();
            // Truncate logic here way can't handle the case that chars with different widths are mixed very well.
            // Let _shrinkTitle take care of that.
            _this._truncateTitle = function () {
                if (!_this.state.needMeasurement) {
                    return;
                }
                _this._async.requestAnimationFrame(_this._truncateWhenInAnimation);
            };
            _this._truncateWhenInAnimation = function () {
                var originalTitle = _this.props.title;
                var element = _this._measureTitleElement.current;
                if (element) {
                    var style = getComputedStyle(element);
                    if (style.width && style.lineHeight && style.height) {
                        var clientWidth = element.clientWidth, scrollWidth = element.scrollWidth;
                        var lines = Math.floor((parseInt(style.height, 10) + TRUNCATION_VERTICAL_OVERFLOW_THRESHOLD) / parseInt(style.lineHeight, 10));
                        // Use overflow to predict truncated length.
                        // Take an example.The text is: A text with A very long text that need to be truncated.ppt
                        // if container is like
                        // |A text with A very| long text that need to be truncated.ppt
                        // The scroll width is 58, (take two | out of length)
                        // The client width is 18
                        // the overflow rate is scrollWidth/clientWidth which should be close to length(overflowText)/length(visualText)
                        // And the length of remaining text should be truncated is (original Length)/(58/18) -3 = 15.
                        // So that the logic can predict truncated text well.
                        // first piece will be `A text `, * second piece will be `ated.ppt`
                        // |A text ...ated.ppt|
                        var overFlowRate = scrollWidth / (parseInt(style.width, 10) * lines);
                        if (overFlowRate > 1) {
                            var truncatedLength = originalTitle.length / overFlowRate - 3 /** Saved for separator */;
                            return _this.setState({
                                truncatedTitleFirstPiece: originalTitle.slice(0, truncatedLength / 2),
                                truncatedTitleSecondPiece: originalTitle.slice(originalTitle.length - truncatedLength / 2),
                                clientWidth: clientWidth,
                                needMeasurement: false,
                            });
                        }
                    }
                }
                return _this.setState({ needMeasurement: false });
            };
            _this._shrinkTitle = function () {
                var _a = _this.state, truncatedTitleFirstPiece = _a.truncatedTitleFirstPiece, truncatedTitleSecondPiece = _a.truncatedTitleSecondPiece;
                if (truncatedTitleFirstPiece && truncatedTitleSecondPiece) {
                    var titleElement = _this._titleElement.current;
                    if (!titleElement) {
                        return;
                    }
                    if (titleElement.scrollHeight > titleElement.clientHeight + TRUNCATION_VERTICAL_OVERFLOW_THRESHOLD ||
                        titleElement.scrollWidth > titleElement.clientWidth) {
                        _this.setState({
                            truncatedTitleFirstPiece: truncatedTitleFirstPiece.slice(0, truncatedTitleFirstPiece.length - 1),
                            truncatedTitleSecondPiece: truncatedTitleSecondPiece.slice(1),
                        });
                    }
                }
            };
            utilities_1.initializeComponentRef(_this);
            _this._async = new Utilities_1.Async(_this);
            _this._events = new Utilities_1.EventGroup(_this);
            _this.state = {
                truncatedTitleFirstPiece: '',
                truncatedTitleSecondPiece: '',
                previousTitle: props.title,
                needMeasurement: !!props.shouldTruncate,
            };
            return _this;
        }
        DocumentCardTitleBase.prototype.componentDidUpdate = function () {
            if (this.props.title !== this.state.previousTitle) {
                this.setState({
                    truncatedTitleFirstPiece: undefined,
                    truncatedTitleSecondPiece: undefined,
                    clientWidth: undefined,
                    previousTitle: this.props.title,
                    needMeasurement: !!this.props.shouldTruncate,
                });
            }
            this._events.off(window, 'resize', this._updateTruncation);
            if (this.props.shouldTruncate) {
                this._truncateTitle();
                requestAnimationFrame(this._shrinkTitle);
                this._events.on(window, 'resize', this._updateTruncation);
            }
        };
        DocumentCardTitleBase.prototype.componentDidMount = function () {
            if (this.props.shouldTruncate) {
                this._truncateTitle();
                this._events.on(window, 'resize', this._updateTruncation);
            }
        };
        DocumentCardTitleBase.prototype.componentWillUnmount = function () {
            this._events.dispose();
            this._async.dispose();
        };
        DocumentCardTitleBase.prototype.render = function () {
            var _a = this.props, title = _a.title, shouldTruncate = _a.shouldTruncate, showAsSecondaryTitle = _a.showAsSecondaryTitle, styles = _a.styles, theme = _a.theme, className = _a.className;
            var _b = this.state, truncatedTitleFirstPiece = _b.truncatedTitleFirstPiece, truncatedTitleSecondPiece = _b.truncatedTitleSecondPiece, needMeasurement = _b.needMeasurement;
            this._classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                showAsSecondaryTitle: showAsSecondaryTitle,
            });
            var documentCardTitle;
            if (needMeasurement) {
                documentCardTitle = (React.createElement("div", { className: this._classNames.root, ref: this._measureTitleElement, title: title, style: { whiteSpace: 'nowrap' } }, title));
            }
            else if (shouldTruncate && truncatedTitleFirstPiece && truncatedTitleSecondPiece) {
                documentCardTitle = (React.createElement("div", { className: this._classNames.root, ref: this._titleElement, title: title },
                    truncatedTitleFirstPiece,
                    "\u2026",
                    truncatedTitleSecondPiece));
            }
            else {
                documentCardTitle = (React.createElement("div", { className: this._classNames.root, ref: this._titleElement, title: title }, title));
            }
            return documentCardTitle;
        };
        DocumentCardTitleBase.prototype._updateTruncation = function () {
            var _this = this;
            this._async.requestAnimationFrame(function () {
                // Only update truncation if the title's size has changed since the last time we truncated
                if (_this._titleElement.current) {
                    var clientWidth = _this._titleElement.current.clientWidth;
                    // Throttle truncation so that it doesn't happen during a window resize
                    clearTimeout(_this._titleTruncationTimer);
                    if (_this.state.clientWidth !== clientWidth) {
                        _this._titleTruncationTimer = _this._async.setTimeout(function () {
                            return _this.setState({
                                truncatedTitleFirstPiece: undefined,
                                truncatedTitleSecondPiece: undefined,
                                needMeasurement: true,
                            });
                        }, 250);
                    }
                }
            });
        };
        return DocumentCardTitleBase;
    }(React.Component));
    exports.DocumentCardTitleBase = DocumentCardTitleBase;
});
//# sourceMappingURL=DocumentCardTitle.base.js.map