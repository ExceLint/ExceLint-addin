define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLayerStyles = function (props) {
        return {
            root: [
                {
                    // Prioritize the Keytips above all other Layers
                    zIndex: Styling_1.ZIndexes.KeytipLayer,
                },
            ],
        };
    };
    exports.getStyles = function (props) {
        return {
            innerContent: [
                {
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    margin: 0,
                    padding: 0,
                    border: 0,
                    overflow: 'hidden',
                    visibility: 'hidden',
                },
            ],
        };
    };
});
//# sourceMappingURL=KeytipLayer.styles.js.map