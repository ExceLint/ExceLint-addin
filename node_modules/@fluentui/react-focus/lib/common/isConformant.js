import { isConformant as baseIsConformant } from '@fluentui/react-conformance';
export function isConformant(testInfo) {
    var defaultOptions = {
        disabledTests: ['has-docblock', 'kebab-aria-attributes'],
        componentPath: module.parent.filename.replace('.test', ''),
    };
    baseIsConformant(defaultOptions, testInfo);
}
//# sourceMappingURL=isConformant.js.map