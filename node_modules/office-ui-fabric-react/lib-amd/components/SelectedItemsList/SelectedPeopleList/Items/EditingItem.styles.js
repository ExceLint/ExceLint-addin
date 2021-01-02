define(["require", "exports", "@uifabric/styling"], function (require, exports, styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalClassNames = {
        root: 'ms-EditingItem',
        input: 'ms-EditingItem-input',
    };
    exports.getStyles = function (prop) {
        var theme = styling_1.getTheme();
        if (!theme) {
            throw new Error('theme is undefined or null in Editing item getStyles function.');
        }
        var semanticColors = theme.semanticColors;
        var classNames = styling_1.getGlobalClassNames(GlobalClassNames, theme);
        return {
            root: [
                classNames.root,
                {
                    margin: '4px',
                },
            ],
            input: [
                classNames.input,
                {
                    border: '0px',
                    outline: 'none',
                    width: '100%',
                    backgroundColor: semanticColors.inputBackground,
                    color: semanticColors.inputText,
                    selectors: {
                        '::-ms-clear': {
                            display: 'none',
                        },
                    },
                },
            ],
        };
    };
});
//# sourceMappingURL=EditingItem.styles.js.map