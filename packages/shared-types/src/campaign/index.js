"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableState = exports.CampaignStatus = void 0;
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["ACTIVE"] = "ACTIVE";
    CampaignStatus["PAUSED"] = "PAUSED";
    CampaignStatus["COMPLETED"] = "COMPLETED";
    CampaignStatus["ARCHIVED"] = "ARCHIVED";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var TableState;
(function (TableState) {
    TableState["IDLE"] = "IDLE";
    TableState["IN_SESSION"] = "IN_SESSION";
    TableState["PAUSED"] = "PAUSED";
})(TableState || (exports.TableState = TableState = {}));
//# sourceMappingURL=index.js.map