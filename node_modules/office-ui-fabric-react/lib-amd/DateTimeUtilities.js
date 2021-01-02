define(["require", "exports", "tslib", "@fluentui/date-time-utilities/lib/dateMath/dateMath", "@fluentui/date-time-utilities/lib/dateValues/dateValues", "@fluentui/date-time-utilities/lib/dateValues/timeConstants"], function (require, exports, tslib_1, dateMath_1, dateValues_1, timeConstants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // NOTE: This is not a full re-export because date-time-utilities includes some additional stuff
    // which is exported elsewhere, causes conflicts, or isn't needed.
    tslib_1.__exportStar(dateMath_1, exports);
    tslib_1.__exportStar(dateValues_1, exports);
    tslib_1.__exportStar(timeConstants_1, exports);
});
//# sourceMappingURL=DateTimeUtilities.js.map