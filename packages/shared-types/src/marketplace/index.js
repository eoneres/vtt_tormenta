"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrmLevel = exports.MarketplaceItemStatus = exports.MarketplaceItemType = void 0;
var MarketplaceItemType;
(function (MarketplaceItemType) {
    MarketplaceItemType["ADVENTURE"] = "ADVENTURE";
    MarketplaceItemType["MAP"] = "MAP";
    MarketplaceItemType["TOKEN_SET"] = "TOKEN_SET";
    MarketplaceItemType["SYSTEM"] = "SYSTEM";
    MarketplaceItemType["AUTOMATION_MODULE"] = "AUTOMATION_MODULE";
    MarketplaceItemType["SOUNDTRACK"] = "SOUNDTRACK";
})(MarketplaceItemType || (exports.MarketplaceItemType = MarketplaceItemType = {}));
var MarketplaceItemStatus;
(function (MarketplaceItemStatus) {
    MarketplaceItemStatus["DRAFT"] = "DRAFT";
    MarketplaceItemStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    MarketplaceItemStatus["PUBLISHED"] = "PUBLISHED";
    MarketplaceItemStatus["SUSPENDED"] = "SUSPENDED";
})(MarketplaceItemStatus || (exports.MarketplaceItemStatus = MarketplaceItemStatus = {}));
var DrmLevel;
(function (DrmLevel) {
    DrmLevel["NONE"] = "NONE";
    DrmLevel["ACCOUNT_BOUND"] = "ACCOUNT_BOUND";
    DrmLevel["PLATFORM_BOUND"] = "PLATFORM_BOUND";
})(DrmLevel || (exports.DrmLevel = DrmLevel = {}));
//# sourceMappingURL=index.js.map