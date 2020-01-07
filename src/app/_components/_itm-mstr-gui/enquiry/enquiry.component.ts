import {
    Component,
    ViewChildren
}  from '@angular/core';

import {
    DatePipe,
    DecimalPipe
}from '@angular/common';

import {
    WebServiceComm,
    LocalStorageService,
    AlertMessageService,
    WaitSpinnerService,
    CommonValidation,
    ItmMasterUserRolesService,
    CommonUtils
} from '../../../_services/common/index';

import {
    Content
} from '../../../shared/dbMatch/content';

import { Location } from '@angular/common';

import {
    PriceHistory,
    SubstitutionHistory,
    Item,
    ItemSummary,
    Miscellaneous,
    Price,
    OrderInfo,
    Substitution,
    ErrorMessage,
    ItemSearch,
    FieldMetadata
} from '../../../_domains/common/index';

import {
    Headers,
    Http,
    Response,
    RequestOptions
} from '@angular/http';

import {
    Observable
} from 'rxjs/Observable';

import {
    ISubscription
} from 'rxjs/Subscription';


import {
    SelectItem,
    ConfirmationService,
    DropdownModule,
    TriStateCheckboxModule,
    GrowlModule
} from 'primeng/primeng';

import {
    ReportResponse
} from '../../../shared/dbMatch/reportResponse';

import {
    Router
} from '@angular/router';


@Component({
    selector: 'enquiry',
    templateUrl: './enquiry.component.html',

})
export class EnquiryComponent {

    componentTitleForEnquiry: string = 'Inquiry';
    isMrkdFrDeletion: boolean;
    isSubstituted: boolean;
    isReinstated: boolean;
    isZeroCost: boolean;
    isNext: boolean;
    hidden: boolean = true;
    private priceHistoryDetails = [];
    private priceHistory: PriceHistory[] = [];
    private subsHistoryDetails = [];
    private subshHstory: SubstitutionHistory[] = [];
    private item: Item;
    private warnMsgs = [];
    private successMsgs = [];
    private msgs = [];
    private _headers = new Headers({ 'Content-Type': 'application/json' });
    private _options = new RequestOptions({ headers: this._headers });
    private pendingRequest: ISubscription;
    private isFilter = false;
    private divSuggestions: any[];
    private plsSuggestions: any[];
    private fromDiv;
    private fromPls;
    private fromPart;
    private fromPartNo;
    private LogedInUser;
    private isError: boolean = false;
    private messageSuccess = true;
    private isSubmit = false;
    private data;
    private historySubData;
    private historyPriceData;
    private isSaveOnEditSubDisabled = false;
    private fieldStatus = FieldMetadata.getFieldStatus();
    private emptyPriceHistoryData = {
        "id": {
            "itemNo": "-",
            "startCycleDate": "-"
        },
        "cost": '-',
        "costEffectiveDate": "-",
        "costCd": "-",
        "sellPrice": '-',
        "sellCd": "-",
        "listPrice": '-',
        "discPct": "-",
        "availCd": "-",
        "exchangePrice": "-",
        "markupPct": "-",
        "minPriceExemptFlag": "-",
        "authBuyerId": "-",
        "createTime": "-",
        "updateTime": "-",
        "createId": "-",
        "updateId": "-",
        "_links": {
            "self": {
                "href": "-"
            },
            "priceHistory": {
                "href": "-"
            }
        },

        "label": ""
    };
    private emptySubHistoryData = {
        "effectiveDate": "-",
        "subItemNo": "-",
        "subItemDesc": "-",
        "subWayCd": "-",
        "authBuyerId": "-",
        "createTime": "-",
        "updateTime": "-",
        "createId": "-",
        "updateId": "-",
        "label": "-",
        "div": "-",
        "pls": "-",
        "part": "-"
    };
    private varPriceObj = {};
    private varSubObj = {};
    private index = 0;
    private pricecHistoryUrl: String = "/v1/data/item-master-data/priceHistory/search/findTop12ByIdItemNoOrderByIdStartCycleDateDesc?itemNo=";
    private subHistoryUrl: String = "/v1/data/item-master-data/api/substitution-history-details?itemNo=";
    private fetchItemDetailsUrl: String = '/v1/data/item-master-data/api/item-details?itemNo=';
    private isSubError = false;
    private isSearchMode = false;
    private isAfterEditMode = false;
    private isAfterEditModeSubmitDisabled = false;
    private isEditLabelMode = false;
    private isAlphaCodeDialogVisible = false;
    private alphaCode = [];
    private hazardCode = [];
    private mainExemptedFromMinPriceDisplay = null;
    private isSubItemsMandatory = false;
    private isBackToEnquiryDialogVisible = false;
    private isSubNextDialogVisible = false;
    private subedItem = new SubstitutionHistory();
    private selectedSubedItem: SubstitutionHistory;
    private isAddNewSub = false;
    private previousNextSubItem = new SubstitutionHistory();
    private subedSubWayCd: SelectItem[];;
    private sonDisabled = true;
    private isConfirmDialogVisible = false;
    private subMessages = [];
    private itemMaintainanceRole;
    private _userRolesService;
    private userRoles;


    private itemSearch: ItemSearch;
    private itemSummaryAdd: ItemSummary;
    private miscellaneous: Miscellaneous;
    private orderInfo: OrderInfo;
    private priceAdd: Price;
    private substitutionAdd: Substitution;
    private nextPreviousSubscription: ISubscription;
    route: string;


    @ViewChildren("divselectelm") divSelectElm;
    @ViewChildren("plsselectelm") plsSelectElm;
    @ViewChildren("focusFromPart") focusFromPart;
    @ViewChildren('selectedFile') selectedTextFile;
    @ViewChildren("subdivselectelm") subdivselectelm;
    @ViewChildren("subplsSelectElm") subplsSelectElm;
    @ViewChildren("alphacdselectelm") alphacdSelectElm;
    @ViewChildren("#isConfirm") isConfirm;

    constructor(private _http: Http,
        private location: Location,
        private _router: Router,
        private _localStorageService: LocalStorageService,
        private _alertMessageService: AlertMessageService,
        private _waitSpinnerService: WaitSpinnerService,
        private confirmationService: ConfirmationService,
        private _webServiceComm: WebServiceComm,
        private _commonValidation: CommonValidation,
        private http: Http
    ) {
        this._userRolesService = new ItmMasterUserRolesService();
        this._commonValidation.subcriberObj.subscribe(resp => {
            var object = JSON.parse(JSON.stringify(resp));
            if (object.origin === "validateHazardCode") {
                this.validateHazardCodeCallback(object);
            }
            if (object.origin === "validateBuyerNo") {
                this.validateBuyerNoCallback(object);
            }
            if (object.origin === "validateDivSon") {
                this.validateDivSonCallBack(object);
            }
            if (object.origin === "validateSubBuyerNo") {
                this.validateSubBuyerNoCallback(object);
            }
        });
        this._commonValidation.subObj.subscribe(resp => {
            var object = JSON.parse(JSON.stringify(resp));
            if (object.origin === "checkValidSubItem") {
                this.checkValidSubItemCallback(object);
            }
        });
    }

    ngOnInit() {
        this.item = new Item();
        this.msgs = [];
        this.fromDiv = '';
        this.fromPls = '';
        this.fromPart = '';
        this.fromPartNo = '';
        this.LogedInUser = localStorage.getItem('loggedinid');
        this.historySubData = { "substitutionDetails": [] };
        this.historyPriceData = {
            "_embedded": {}
        };

        this.alphaCode = LocalStorageService.ALPHACODE;
        this.itemSearch = new ItemSearch();
        this.itemSummaryAdd = new ItemSummary();
        this.orderInfo = new OrderInfo();
        this.miscellaneous = new Miscellaneous();
        this.priceAdd = new Price();
        this.substitutionAdd = new Substitution();

        this.fieldStatus['mainDiv'].disable = false;
        this.fieldStatus['mainPls'].disable = false;
        this.fieldStatus['mainPartNo'].disable = false;

        this.userRoles = localStorage.getItem('userRoles');
        this.itemMaintainanceRole = this._userRolesService.getItemMasterMaintainanceRole(this.userRoles);
        this.determineUserRole('onInquiry');

        if (localStorage.getItem('addedItemNo') !== null && localStorage.getItem('addedItemNoSuccess') === 'Success') {
            this.fromDiv = localStorage.getItem('addedItemNo').substring(0, 2);
            this.fromPls = localStorage.getItem('addedItemNo').substring(2, 5);
            this.fromPart = localStorage.getItem('addedItemNo').substring(5);
            this._onSearch();
            this.addWarningsFromAddServiceCall();
        }

        if (localStorage.getItem('cloneToEnquiry') === 'cloneToEnquiry') {
            this.data = JSON.parse(localStorage.getItem('maintenanceData'));
            this.fromDiv = this.data.itemNo.substring(0, 2);
            this.fromPls = this.data.itemNo.substring(2, 5);
            this.fromPart = this.data.itemNo.substring(5);
            this._onSearch();
            this.fieldStatus['onInquiryAction'].disable = false;
            localStorage.removeItem('cloneToEnquiry');
            localStorage.removeItem('maintenanceData');
        }

        if (localStorage.getItem('backToEnquiry') === 'backToEnquiry') {
            this.data = JSON.parse(localStorage.getItem('maintenanceData'));
            this.fromDiv = this.data.itemNo.substring(0, 2);
            this.fromPls = this.data.itemNo.substring(2, 5);
            this.fromPart = this.data.itemNo.substring(5);
            this.fieldStatus['onInquiryAction'].disable = true;
            this.fieldStatus['onAddAction'].disable = true;
            this._onSearch();
            localStorage.removeItem('backToEnquiry');
            localStorage.removeItem('maintenanceData');
        }

        if (localStorage.getItem('updateSuccess') === 'updateSuccess') {
            this.data = JSON.parse(localStorage.getItem('maintenanceData'));
            this.fromDiv = this.data.itemNo.substring(0, 2);
            this.fromPls = this.data.itemNo.substring(2, 5);
            this.fromPart = this.data.itemNo.substring(5);
            this.fieldStatus['onInquiryAction'].disable = false;
            this._onSearch();
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.divSelectElm.first.el.nativeElement.children[0].children[0].select();
        }, 1);
        setTimeout(() => {
            if (localStorage.getItem('addedItemNo') !== null && localStorage.getItem('addedItemNoSuccess') === 'Success') {
                this.successMsgs.push({ severity: 'success', summary: 'Item successfully added' });
                localStorage.removeItem("addedItemNo");
                localStorage.removeItem("addedItemNoSuccess");
                localStorage.removeItem("addedItemNoRespjson");
            }
            if (localStorage.getItem('updateSuccess') === 'updateSuccess') {
                this.successMsgs.push({ severity: 'success', summary: 'Item successfully updated' });
                localStorage.removeItem("updateSuccess");
                localStorage.removeItem('maintenanceData');
            }

        }, 1000);
    }

    private onKeyUp(event) {
        if (this.fieldStatus['onInquiryAction'].visible || this.isSearchMode) {
            this.fieldStatus['onInquiryAction'].disable = false;
            this.fieldStatus['onAddAction'].disable = false;
            if (event && event.keyCode == 13 && !this.isConfirmDialogVisible) {
                this._onSearch();
            } else {
                this.onClickNo();
            }
        }
    }

    private addWarningsFromAddServiceCall() {
        let addOrCloneResponseStr = localStorage.getItem('addedItemNoRespjson');
        let addOrCloneResponse = JSON.parse(addOrCloneResponseStr);
        if (addOrCloneResponse) {
            for (var i = 0; i < addOrCloneResponse.length; i++) {
                let errorMessage: ErrorMessage = ErrorMessage.buildErrorMessage(addOrCloneResponse[i]);
                this.warnMsgs.push({ severity: 'info', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
            }
        }
    }

    mergePriceTabToHistory() {
        for (var i = 0; i < 10; i++) {
            if (this.historyPriceData._embedded.priceHistory === undefined) {
                var subsString = JSON.stringify(this.emptyPriceHistoryData);
                this.varPriceObj = JSON.parse(subsString);
                this.varPriceObj["label"] = "Hist " + (i + 1);
                this.historyPriceData._embedded.priceHistory.push(this.varPriceObj);
                this.varPriceObj = {};
            }
            else if (i > (this.historyPriceData._embedded.priceHistory.length) - 1) {
                var subsString = JSON.stringify(this.emptyPriceHistoryData);
                this.varPriceObj = JSON.parse(subsString);
                this.varPriceObj["label"] = "Hist " + (i + 1);
                this.historyPriceData._embedded.priceHistory.push(this.varPriceObj);
                this.varPriceObj = {};
            } else {
                this.mapPriceHistoryData(this.historyPriceData._embedded.priceHistory[i])
                this.varPriceObj["label"] = "Hist " + (i + 1);
                this.historyPriceData._embedded.priceHistory[i] = this.varPriceObj;
                this.varPriceObj = {};
            }
        }
        if (this.data.price === undefined) {
            var subsString = JSON.stringify(this.emptyPriceHistoryData);
            this.varPriceObj = JSON.parse(subsString);
            this.varPriceObj["label"] = "Current";
            this.historyPriceData._embedded.priceHistory.unshift(this.varPriceObj);
            this.varPriceObj = {};
            this.varPriceObj = JSON.parse(subsString);
            this.varPriceObj["label"] = "Next";
            this.historyPriceData._embedded.priceHistory.unshift(this.varPriceObj);
            this.varPriceObj = {};
        } else {
            if (this.data.price.currentPrice !== undefined) {
                this.mapPriceHistoryData(this.data.price.currentPrice);
                this.varPriceObj["label"] = "Current";
                this.historyPriceData._embedded.priceHistory.unshift(this.varPriceObj);
                this.varPriceObj = {};
            }
            else {
                this.emptyPriceHistoryData.label = "Current";
                this.historyPriceData._embedded.priceHistory.unshift(this.emptyPriceHistoryData);
            }
            if (this.data.price.nextPrice !== undefined) {
                this.mapPriceHistoryData(this.data.price.nextPrice);
                this.varPriceObj["label"] = "Next";
                this.historyPriceData._embedded.priceHistory.unshift(this.varPriceObj);
                this.varPriceObj = {};
            }
            else {
                this.emptyPriceHistoryData.label = "Next";
                this.historyPriceData._embedded.priceHistory.unshift(this.emptyPriceHistoryData);
            }
        }
    }

    revertNextSubstitutionChanges() {
        var addSubObject = this.historySubData.substitutionDetails[0];
        if (addSubObject["label"] === "Next" && this.data.substitution && this.data.substitution.nextSubstitution !== undefined) {
            var nextSubstituteDb = this.data.substitution.nextSubstitution;
            addSubObject["div"] = nextSubstituteDb.subItemNo.substring(0, 2);
            addSubObject["pls"] = nextSubstituteDb.subItemNo.substring(2, 5);
            addSubObject["part"] = nextSubstituteDb.subItemNo.substring(5);
            addSubObject["effectiveDate"] = nextSubstituteDb.effectiveDate;
            addSubObject["subItemNo"] = nextSubstituteDb.subItemNo;
            addSubObject["subItemDesc"] = nextSubstituteDb.subItemDesc;
            addSubObject["subWayCd"] = nextSubstituteDb.subWayCd;
            addSubObject["authBuyerId"] = nextSubstituteDb.authBuyerId;
            addSubObject["createTime"] = nextSubstituteDb.createTime;
            addSubObject["updateTime"] = nextSubstituteDb.updateTime;
            addSubObject["createId"] = nextSubstituteDb.createId;
            addSubObject["updateId"] = nextSubstituteDb.updateId;
        } else {
            this.historySubData.substitutionDetails[0] = {
                "effectiveDate": "-",
                "subItemNo": "-",
                "subItemDesc": "-",
                "subWayCd": "-",
                "authBuyerId": "-",
                "createTime": "-",
                "updateTime": "-",
                "createId": "-",
                "updateId": "-",
                "label": "-",
                "div": "-",
                "pls": "-",
                "part": "-"
            };
            this.historySubData.substitutionDetails[0]["label"] = "Next";
        }
    }

    mergeSubsTabToHistory() {
        for (var i = 0; i < 12; i++) {
            if (this.historySubData.substitutionDetails === undefined) {
                var subsString = JSON.stringify(this.emptySubHistoryData);
                this.varSubObj = JSON.parse(subsString);
                this.varSubObj["label"] = "Hist " + (i + 1);
                this.historySubData.substitutionDetails = [];
                this.historySubData.substitutionDetails.push(this.varSubObj);
                this.varSubObj = {};
            }
            else if (i > (this.historySubData.substitutionDetails.length) - 1) {
                var subsString = JSON.stringify(this.emptySubHistoryData);
                this.varSubObj = JSON.parse(subsString);
                this.varSubObj["label"] = "Hist " + (i + 1);
                this.historySubData.substitutionDetails.push(this.varSubObj);
                this.varSubObj = {};
            } else {
                this.mapSubHistoryData(this.historySubData.substitutionDetails[i]);
                this.varSubObj["label"] = "Hist " + (i + 1);
                this.historySubData.substitutionDetails[i] = this.varSubObj;
                this.varSubObj = {};
            }
        }
        if (this.data.substitution === undefined) {
            var subsString = JSON.stringify(this.emptySubHistoryData);
            this.varSubObj = JSON.parse(subsString);
            this.varSubObj["label"] = "Current";
            this.historySubData.substitutionDetails.unshift(this.varSubObj);
            this.varSubObj = {};
            this.varSubObj = JSON.parse(subsString);
            this.varSubObj["label"] = "Next";
            this.historySubData.substitutionDetails.unshift(this.varSubObj);
            this.varSubObj = {};
        }
        else {
            if (this.data.substitution.currentSubstitution !== undefined) {
                this.mapSubHistoryData(this.data.substitution.currentSubstitution);
                this.varSubObj["label"] = "Current";
                this.historySubData.substitutionDetails.unshift(this.varSubObj);
                this.varSubObj = {};
            }
            else {
                this.emptySubHistoryData.label = "Current";
                this.historySubData.substitutionDetails.unshift(this.emptySubHistoryData);
            }

            if (this.data.substitution.nextSubstitution !== undefined) {
                this.mapSubHistoryData(this.data.substitution.nextSubstitution);
                this.varSubObj["label"] = "Next";
                this.historySubData.substitutionDetails.unshift(this.varSubObj);
                this.varSubObj = {};
            }
            else {
                this.emptySubHistoryData.label = "Next";
                this.historySubData.substitutionDetails.unshift(this.emptySubHistoryData);
            }
        }
    }

    /* Start - Handling for division */
    divSearch(event) {
        let queryStr = event.query;
        if (queryStr && queryStr.length > 0 && parseInt(queryStr) == 0) {
            this.pendingRequest = null;
        } else if (queryStr && queryStr.length > 0) {
            if (this.pendingRequest) {
                this.pendingRequest.unsubscribe();
            }
            let divSearchUri = '/v1/data/item-master-data/api/search/divLike/' + queryStr;
            this.pendingRequest = this._webServiceComm.httpGet(divSearchUri)
                .subscribe(res => {
                    if (res) {
                        this.divSuggestions = res;
                    }
                }, err => {
                    this.pendingRequest = null;
                }, () => {
                    this.pendingRequest = null;
                });
        } else {
            this.pendingRequest = null;
        }
    }

    onDivKeyUp(event) {
        let inputDiv = this.fromDiv;
        inputDiv = inputDiv.replace(/(\s+|\.)/g, '');
        this.fromDiv = this._commonValidation.formatNumeric(inputDiv);
        if (CommonUtils.hasText(inputDiv)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES005, this.msgs);
            this.fieldStatus['mainDiv'].cssClass = "";
        }
        this.toggleSubmitButton();
    }

    clearItemDetails() {
        this.data = {}
        this.item = new Item();
        this.historySubData = { "substitutionDetails": [] };
        this.historyPriceData = {
            "_embedded": {}
        };
    }

    onBlurDiv(event) {
        if (this.fromDiv && !!this.fromDiv) {
            while (this.fromDiv.length < 2) {
                this.fromDiv = '0' + this.fromDiv;
            }
        }
        // Validate SON as DIV may have been changed 
        if (this.fieldStatus['onInquiryAction'].visible || this.isSearchMode) {
            return;
        } else {
            this.validateDivSon();
        }
    }
    /* End - Handling for division */

    /* Start - Handling for PLS */
    plsSearch(event) {
        let queryStr = event.query;
        if (queryStr && queryStr.length > 0 && parseInt(queryStr) == 0) {
            this.pendingRequest = null;
        } else if (queryStr && queryStr.length > 0) {
            if (this.pendingRequest) {
                this.pendingRequest.unsubscribe();
            }
            let plsSearchUri = '/v1/data/item-master-data/api/search/plsLike/' + this.fromDiv + '/' + queryStr;
            this.pendingRequest = this._webServiceComm.httpGet(plsSearchUri)
                .subscribe(res => {
                    if (res) {
                        this.plsSuggestions = res;
                    }
                }, err => {
                    this.pendingRequest = null;
                }, () => {
                    this.pendingRequest = null;
                });
        } else {
            this.pendingRequest = null;
        }
    }

    onPlsKeyUp(event) {
        let inputPls = this.fromPls;
        inputPls = inputPls.replace(/(\s+|\.)/g, '');
        this.fromPls = this._commonValidation.formatNumeric(inputPls);
        if (CommonUtils.hasText(inputPls)) {
            this.fieldStatus['onInquiryAction'].disable = false;
            this.fieldStatus['onAddAction'].disable = false;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES006, this.msgs);
            this.fieldStatus['mainPls'].cssClass = "";
        }
        this.toggleSubmitButton();
    }

    onBlurPls(event) {
        if (this.fromPls && !!this.fromPls) {
            while (this.fromPls.length < 3) {
                this.fromPls = '0' + this.fromPls;
            }
        }

        if (this.fromPls.length === 3) {
            this.fieldStatus['onInquiryAction'].disable = false;
            this.fieldStatus['onAddAction'].disable = false;
        }
    }
    /* End - Handling for PLS */

    /* Start - Handling for Part Number */
    onPartNoKeyUp(event) {
        let partNo = '' + this.fromPart;
        while (!CommonUtils.matchesPattern(partNo, '[A-Za-z0-9./-]+') && partNo !== '') {
            partNo = partNo.slice(0, -1);
        }
        this.fromPart = partNo;
        if (CommonUtils.hasText(partNo)) {
            this.fieldStatus['mainPartNo'].valid = true;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES007, this.msgs);
        }
        this.onKeyUp(event);
    }
    /* End - Handling for Part Number */

    /* Start - Handling for Item description */
    validateItemDescription() {
        if (CommonUtils.hasNoText(this.item.mainDesc)) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES001, this.msgs);
            this.fieldStatus['itemDescription'].valid = false;
        } else {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES001, this.msgs);
            this.fieldStatus['itemDescription'].valid = true;
        }
        this.toggleSubmitButton();
    }
    /* End - Handling for Item description */

    handleChange(e) {
        this.index = e.index;
        if (this.index === 2 && this.historyPriceData._embedded.priceHistory === undefined) {
            this.getHistoryDetails(this.pricecHistoryUrl, "price");
        } else if (this.index === 3 && this.historySubData.substitutionDetails.length === 0) {
            this.getHistoryDetails(this.subHistoryUrl, "sub");
        }

    }

    getHistoryDetails(url, hist) {
        this.msgs = [];
        if (this.fromPartNo !== undefined) {
            let linkUri = url + this.fromPartNo;
            if (this.index === 2 || this.index === 3) {
                this._waitSpinnerService.showWait();
            }
            try {
                this._webServiceComm.httpGet(linkUri).subscribe(res => {
                    this._waitSpinnerService.hideWait();
                    if (hist === 'price') {
                        this.historyPriceData = res;
                        if (this.historyPriceData._embedded !== undefined) {
                            this.mergePriceTabToHistory();
                        }
                    } else if (hist === 'sub') {
                        this.historySubData = res;
                        if (this.historySubData !== undefined) {
                            this.mergeSubsTabToHistory();
                        }
                    }
                }, err => {
                    if (err.status == 400) {
                        var errorJson = JSON.parse(err._body);
                        for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                            let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                            if (errorMessage.getType() === "ERROR") {
                                this.msgs.push({ severity: 'error', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                            } else {
                                this.warnMsgs.push({ severity: 'warn', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                            }
                        }
                    } else {
                        if (hist === 'price') {
                            this._alertMessageService.addErrorMessage(ErrorMessage.ES038, this.msgs);
                        } else if (hist === 'sub') {
                            this._alertMessageService.addErrorMessage(ErrorMessage.ES039, this.msgs);
                        }
                    }
                    this._waitSpinnerService.hideWait();
                    this.isAfterEditModeSubmitDisabled = true;
                }, () => {
                });
            } catch (error) {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                this._waitSpinnerService.hideWait();
                this.isAfterEditModeSubmitDisabled = true;
            }
        }
    }

    _cleanPart() {
        this.fromDiv = "";
        this.fromPart = "";
        this.fromPls = "";
        this.item = new Item();
    }

    _onSearch() {
        this.msgs = [];
        this.isError = false;
        this.fromPartNo = "";
        this.item = new Item();
        this.data = {};
        this.warnMsgs = [];
        this.isAfterEditModeSubmitDisabled = true;
        this.clearItemDetails();

        if (CommonUtils.hasNoText(this.fromDiv)) {
            this.fieldStatus['mainDiv'].cssClass = "red-border";
            this._alertMessageService.addErrorMessage(ErrorMessage.ES005, this.msgs);
        }

        if (CommonUtils.hasNoText(this.fromPls)) {
            this.fieldStatus['mainPls'].cssClass = "red-border";
            this._alertMessageService.addErrorMessage(ErrorMessage.ES006, this.msgs);
        }

        if (CommonUtils.hasNoText(this.fromPart)) {
            this.fieldStatus['mainPartNo'].valid = false;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES007, this.msgs);
        }

        if (this.msgs.length > 0) {
            this.toggleSubmitButton();
            return;
        }

        this.fromPartNo = this.fromDiv + this.fromPls + this.fromPart;
        this._waitSpinnerService.showWait();
        let uri = this.fetchItemDetailsUrl + this.fromPartNo;
        try {
            this._webServiceComm.httpGet(uri).subscribe(resp => {
                this._waitSpinnerService.hideWait();
                this.isSearchMode = true;
                this.determineUserRole('onSearch');
                this.data = resp;
                this.hidden = false;
                this.isEditLabelMode = false;
                this.mapJsonToDomain(this.data);

                if (this.item.mainExemptedFromMinPrice === "Y") {
                    this.mainExemptedFromMinPriceDisplay = true;
                } else if (this.item.mainExemptedFromMinPrice === "N") {
                    this.mainExemptedFromMinPriceDisplay = false;
                } else {
                    this.mainExemptedFromMinPriceDisplay = null;
                }
                this.getHistoryDetails(this.pricecHistoryUrl, "price");
                this.getHistoryDetails(this.subHistoryUrl, "sub");
            }, err => {
                this._waitSpinnerService.hideWait();
                this.isSubmit = false;
                var errorJson = JSON.parse(err._body);
                if (err.status === 0) {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                    this.isAfterEditModeSubmitDisabled = true;
                } else if (errorJson.messages) {
                    for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                        let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                        if (errorMessage.getCode() === 'E008') {
                            if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleRO(this.userRoles)) {
                                this._alertMessageService.addErrorMessage(ErrorMessage.ES029, this.msgs);
                            } else {
                                this.isConfirmDialogVisible = true;
                            }
                            return;
                        }
                        if (errorMessage.getType() === 'ERROR') {
                            this._alertMessageService.addErrorMessage(errorMessage, this.msgs);
                        } else if (errorMessage.getCode() === 'WARNING') {
                            this._alertMessageService.addErrorMessage(errorMessage, this.warnMsgs);
                        }
                    }
                    this.isAfterEditModeSubmitDisabled = true;
                } else {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                }
            }, () => {
                this.isSubmit = false;
                this.hidden = false;
            });
        } catch (error) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
            this.isAfterEditModeSubmitDisabled = true;
        }
    }

    /* Start - Mapping inquiry response to UI domain */
    mapJsonToDomain(data) {
        this.item.mainDiv = data.itemNo.substring(0, 2);
        this.item.mainPls = data.itemNo.substring(2, 5);
        this.item.mainPart = data.itemNo.substring(5);
        this.item.mainDesc = data.itemSummary.description;
        this.item.mainSon = data.itemSummary.son;
        this.item.mainStockUom = data.itemSummary.stockUom;
        this.item.mainCertification = data.itemSummary.certReqFlag;
        this.item.mainHazardCd = data.itemSummary.hazardCd;
        this.item.mainMarkedForDeletion = data.itemSummary.partDeleteFlag;
        this.isMrkdFrDeletion = this.item.mainMarkedForDeletion == 'Y' ? true : false;
        this.item.mainSicCd = data.itemSummary.genericName;
        this.item.mainDateAdded = data.itemSummary.addedDate;
        this.item.mainReinstate = 'N';
        this.item.userFieldsPreferredSon = data.itemSummary.son;
        this.item.userFieldsDateModified = data.itemSummary.dateModified;
        this.item.userFieldsTimeModified = data.itemSummary.timeModified;
        this.item.userFieldsModifierId = data.itemSummary.lawsonSignonId;
        this.item.userFieldsMarkedForDeletion = data.itemSummary.partDeleteFlag;
        this.item.miscUpc = data.itemSummary.upc;
        this.item.mainSubstituted = data.itemSummary.substituted;
        this.item.mainNext = data.itemSummary.hasNextPrice;
        if (data.price) {
            let price;
            if (data instanceof ItemSearch) {
                price = this.itemSearch.price;
            } else if (data.price.nextPrice || data.price.currentPrice) {
                price = data.price.nextPrice ? data.price.nextPrice : data.price.currentPrice;
                this.item.mainMarkupPercent = price.markupPct.toFixed(1);
            }
            this.item.mainCostSuffix = price.costCd;
            this.item.mainSellSuffix = price.sellCd;
            this.item.mainBuyerNo = price.authBuyerId;
            this.item.mainCostPrice = price.cost.toFixed(2);
            this.item.mainSellPrice = price.sellPrice.toFixed(2);
            this.item.mainListPrice = price.listPrice.toFixed(2);
            this.item.mainDiscPercent = price.discPct.toFixed(1);
            this.item.mainExchangePrice = price.exchangePrice.toFixed(2);
            this.item.mainExemptedFromMinPrice = price.minPriceExemptFlag;
            if ((CommonUtils.safeTrim(price.availCd) === '') && price.cost === 0) {
                this.item.mainZeroCost = 'Y';
            } else {
                this.item.mainZeroCost = 'N';
            }
            this.item.mainAlphaCd = CommonUtils.getLongAvailCd(price.availCd);

            if (CommonUtils.safeTrim(price.availCd) !== '') {
                if (price.cost === 0) {
                    this.item.mainCostPrice = '';
                }
                if (price.sellPrice === 0) {
                    this.item.mainSellPrice = '';
                }
                if (price.listPrice === 0) {
                    this.item.mainListPrice = '';
                }
                if (price.exchangePrice === 0) {
                    this.item.mainExchangePrice = '';
                }
                if (price.markupPct === 0) {
                    this.item.mainMarkupPercent = '';
                }
                if (price.discPct === 0) {
                    this.item.mainDiscPercent = '';
                }
            }
            if (this.item.mainExemptedFromMinPrice === "Y") {
                this.mainExemptedFromMinPriceDisplay = true;
            } else if (this.item.mainExemptedFromMinPrice === "N") {
                this.mainExemptedFromMinPriceDisplay = false;
            } else {
                this.mainExemptedFromMinPriceDisplay = null;
            }
        }

        if (data.orderInformation) {
            this.item.miscFactPackCd = data.orderInformation.factPkCd;
            this.item.miscFactPackUom = data.orderInformation.factPackageUom;
            this.item.miscFactPackQty = data.orderInformation.factPackageQty;
            this.item.miscFactPackWtLb = data.orderInformation.weightLb;
            this.item.miscFactPackWtOz = data.orderInformation.weightOz;
        }

        if (data.miscellaneous) {
            this.item.miscLengthFt = data.miscellaneous.lengthFt;
            this.item.miscLengthIn = data.miscellaneous.lengthIn;
            this.item.miscWidthFt = data.miscellaneous.widthFt;
            this.item.miscWidthIn = data.miscellaneous.widthIn;
            this.item.miscHeightFt = data.miscellaneous.heightFt;
            this.item.miscHeightIn = data.miscellaneous.heightIn;
            this.item.miscWeightLb = data.miscellaneous.weightLb;
            this.item.miscWeightOz = data.miscellaneous.weightOz;
            this.item.miscSeasonalCd = data.miscellaneous.seasonCd;
            this.item.miscImpulseCd = data.miscellaneous.impulseCd;
            this.item.miscPromotionalCd = data.miscellaneous.promoteCd;
            this.item.miscFunctionalCd = data.miscellaneous.functionalCd;
            this.item.miscSpecialCd = data.miscellaneous.specialCd;
            this.item.miscShippableCd = data.miscellaneous.shippableCd;
            this.item.miscNmfcNum = data.miscellaneous.nationalMotorFreightCd;
            this.item.miscNmfcSuff = data.miscellaneous.nationalMotorFreightSuffix;
        }

        if (data instanceof ItemSearch) {
            this.item.miscRelatedModelNum = data.relatedModelNo;
        } else if (data.relatedModelNumber) {
            this.item.miscRelatedModelNum = data.relatedModelNumber.relatedModelNo;
        }

        if (data instanceof ItemSearch) {
            this.item.mainBuyerNotes = data.buyerNotes;
        } else if (data.buyerNote) {
            this.item.mainBuyerNotes = data.buyerNote.buyerNotes;
        }

        if (data instanceof ItemSearch) {
            this.item.mainComments = data.comments;
        } else if (data.comments && data.comments.commentText) {
            this.item.mainComments = data.comments.commentText;
        }

        if (data.price && data.price.nextPrice) {
            this.item.mainEffectiveDate = data.price.nextPrice.costEffectiveDate;
        } else if (this.data.substitution && data.substitution.nextSubstitution) {
            this.item.mainEffectiveDate = data.substitution.nextSubstitution.effectiveDate;
        } else if (data.price && data.price.currentPrice) {
            this.item.mainEffectiveDate = data.price.currentPrice.costEffectiveDate
        } else if (this.data.substitution && data.substitution.currentSubstitution) {
            this.item.mainEffectiveDate = data.substitution.currentSubstitution.effectiveDate;
        }

        this.isZeroCost = this.item.mainZeroCost === "Y" ? true : false;
        this.isNext = this.item.mainNext === "Y" ? true : false;
    }

    resetEditableDataToDefault() {
        this.item.mainDesc = '';
        this.item.mainSon = '';
        this.item.mainHazardCd = '';
        this.item.mainMarkedForDeletion = '';
        this.isMrkdFrDeletion = this.item.mainMarkedForDeletion == 'Y' ? true : false;
        this.item.mainReinstate = 'N';
        this.item.mainMarkupPercent = '';
        this.item.mainBuyerNo = '';
        this.item.mainCostPrice = '';
        this.item.mainSellPrice = '';
        this.item.mainListPrice = '';
        this.item.mainDiscPercent = '';
        this.item.mainExchangePrice = '';
        this.item.mainExemptedFromMinPrice = '';
        this.item.mainAlphaCd = '';
        this.mainExemptedFromMinPriceDisplay = null;
        this.item.miscRelatedModelNum = '';
        this.item.mainBuyerNotes = '';
        this.item.mainComments = '';
        this.isZeroCost = false;
        this.isNext = false;
        this.item.mainZeroCost = 'N';
        this.item.miscSpecialCd = '';
    }

    mapPriceHistoryData(obj) {
        var subsString = JSON.stringify(this.emptyPriceHistoryData);
        var varObj = JSON.parse(subsString);
        varObj["cost"] = obj.cost.toFixed(2);
        varObj["costEffectiveDate"] = obj.costEffectiveDate;
        varObj["costCd"] = obj.costCd;
        varObj["sellPrice"] = obj.sellPrice.toFixed(2);
        varObj["sellCd"] = obj.sellCd;
        varObj["listPrice"] = obj.listPrice.toFixed(2);
        varObj["discPct"] = obj.discPct.toFixed(2);
        varObj["availCd"] = CommonUtils.getLongAvailCd(obj.availCd);
        varObj["exchangePrice"] = obj.exchangePrice.toFixed(2);
        varObj["markupPct"] = obj.markupPct;
        varObj["minPriceExemptFlag"] = obj.minPriceExemptFlag;
        varObj["authBuyerId"] = obj.authBuyerId;
        varObj["createTime"] = obj.createTime;
        varObj["updateTime"] = obj.updateTime;
        varObj["createId"] = obj.createId;
        varObj["updateId"] = obj.updateId;
        this.varPriceObj = varObj;
        varObj = {};
    }

    mapSubHistoryData(obj) {
        var subsString = JSON.stringify(this.emptySubHistoryData);
        var objSub = JSON.parse(subsString);
        objSub["div"] = obj.subItemNo.substring(0, 2);
        objSub["pls"] = obj.subItemNo.substring(2, 5);
        objSub["part"] = obj.subItemNo.substring(5);
        objSub["effectiveDate"] = obj.effectiveDate;
        objSub["subItemNo"] = obj.subItemNo;
        objSub["subItemDesc"] = obj.subItemDesc;
        objSub["subWayCd"] = obj.subWayCd;
        objSub["authBuyerId"] = obj.authBuyerId;
        objSub["createTime"] = obj.createTime;
        objSub["updateTime"] = obj.updateTime;
        objSub["createId"] = obj.createId;
        objSub["updateId"] = obj.updateId;
        this.varSubObj = objSub;
        objSub = {};
    }

    /* End - Mapping inquiry response to UI domain */

    _onEditMode() {
        this.componentTitleForEnquiry = 'Edit';
        this.isSearchMode = false;
        this.fieldStatus['onInquiryAction'].visible = false;
        this.fieldStatus['onAddAction'].visible = false;
        this.isAfterEditMode = true;
        this.isEditLabelMode = true;
        this.fieldStatus['onEditMode'].disable = false;
        this.fieldStatus['mainDiv'].disable = true;
        this.fieldStatus['mainPls'].disable = true;
        this.fieldStatus['mainPartNo'].disable = true;
        this.determineUserRole('onEdit');
        this.setReinstateMode();
        this.toggleSubmitButton();
        this.msgs = [];
    }

    setReinstateMode() {
        if ((this.data.substitution !== undefined && this.data.substitution.nextSubstitution !== undefined) ||
            (this.data.substitution !== undefined && this.data.substitution.currentSubstitution !== undefined && (this.data.price === undefined || this.data.price.nextPrice === undefined))) {
            this.fieldStatus['reinstate'].disable = false;
        } else {
            this.fieldStatus['reinstate'].disable = true;
        }
    }

    _backToSearch() {
        this._waitSpinnerService.showWait();
        this._router.navigate(['web-app', 'not-auth']).then(() => { this._router.navigate(['web-app', 'enquiry']) });
        this._waitSpinnerService.hideWait();
    }

    _onAddNewMode() {
        this.msgs = [];
        this.isError = false;
        if (this.fromDiv === null || this.fromDiv === undefined || this.fromDiv === "") {
            this.isError = true;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES005, this.msgs);
            this.isAfterEditModeSubmitDisabled = true;
            return;
        } else if (this.fromDiv.length < 2) {
            this.isError = true;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES037, this.msgs);
            this.isAfterEditModeSubmitDisabled = true;
            return;
        }

        if (this.fromPls === null || this.fromPls === undefined || this.fromPls === "") {
            this.isError = true;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES006, this.msgs);
            this.isAfterEditModeSubmitDisabled = true;
            return;
        } else if (this.fromPls.length < 3) {
            this.isError = true;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES031, this.msgs);
            this.isAfterEditModeSubmitDisabled = true;
            return;
        }


        if (this.fromPart === null || this.fromPart === undefined || this.fromPart === "") {
            this.isError = true;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES007, this.msgs);
            this.isAfterEditModeSubmitDisabled = true;
            return;
        } else if (this.fromPart.length < 1) {
            this.isError = true;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES007, this.msgs);
            this.isAfterEditModeSubmitDisabled = true;
            return;
        } else {
            for (let i = 0, len = this.fromPart.length; i < len; i++) {
                let code = this.fromPart.charCodeAt(i);
                if (!(code > 44 && code < 58) && // numeric (0-9)./-
                    !(code > 64 && code < 91) && // upper alpha (A-Z)
                    !(code > 96 && code < 123)) {
                    this.msgs = [];
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES032, this.msgs);
                    this.isAfterEditModeSubmitDisabled = true;
                    return;
                }
            }
            this.fromPartNo = this.fromDiv + this.fromPls + this.fromPart;
        }

        if (this.fromPartNo === null || this.fromPartNo === undefined || this.fromPartNo === "") {
            this.isError = true;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES033, this.msgs);
            this.isAfterEditModeSubmitDisabled = true;
            return;
        }
        if (!this.isError) {
            localStorage.setItem('newPartToAdd', this.fromPartNo);
            this.checkItemExists();
        }

    }

    _onCloneMode() {
        this.msgs = [];
        localStorage.setItem('cloneItemNo', this.fromDiv + this.fromPls + this.fromPart as string);
        localStorage.setItem('maintenanceData', JSON.stringify(this.data));
        this._router.navigate(['web-app', 'not-auth']).then(() => { this._router.navigate(['web-app', 'addItem']) });
    }

    /* Start - Handling for Alpha Code */
    onAlphaCodeLookup() {
        this.fieldStatus['alphaCode']['dialogBox-visible'] = true;
    }

    onAlphaCodeSelect(event) {
        this.item.mainAlphaCd = event.data.Code;
        this.isAlphaCodeDialogVisible = false;
        this.fieldStatus['alphaCode']['dialogBox-visible'] = false;
        this.validateAlphaCode();
        this.validateComments();
        this.toggleSubmitButton();
    }

    validateAlphaCode() {
        let result = this._commonValidation.validateAlphaCode(this.item.mainAlphaCd, this.msgs);
        this.fieldStatus['alphaCode'].valid = result.valid;
        this.item.mainAlphaCd = result.alphaCode;
        this.validateComments();
        this.toggleSubmitButton();
    }
    /* End - Handling for Alpha Code */

    /* Start - Handling for Comments */
    validateComments() {
        let result = this._commonValidation.validateComments(this.item.mainComments, this.item.mainAlphaCd, this.msgs);
        this.fieldStatus['comments'].valid = result.valid;
        this.item.mainComments = result.comments;
        this.toggleSubmitButton();
    }
    /* End - Handling for Comments */

    onMinimumPriceExemptionChange() {
        this.item.mainExemptedFromMinPrice =
            CommonUtils.getMinimumExemptionPriceFlag(this.mainExemptedFromMinPriceDisplay);
    }

    private toggleSubmitButton() {
        if (this.hasUiErrors([ErrorMessage.ES999])) {
            this.isAfterEditModeSubmitDisabled = true;
        } else {
            this.isAfterEditModeSubmitDisabled = false;
        }
    }

    private hasUiErrors(ignoreErrorMessages?: any[]) {
        for (let message of this.msgs) {
            // Check if it is UI error code
            if (message.summary && message.summary.substr(0, 2) === 'ES') {
                if (!this.isErrorIgnorable(message.summary, ignoreErrorMessages)) {
                    return true;
                }
            }
        }
        return false;
    }

    /* Start - Handling for pricing fields */
    checkSellPriceFormat() {
        let result = this._commonValidation.formatPrice(this.item.mainSellPrice, 'sellPrice', ErrorMessage.ES019, this.msgs);
        this.item.mainSellPrice = result.price;
        this.fieldStatus['sellPrice'].valid = result.valid;
        this.toggleSubmitButton();
    }

    onSellPriceKeyUp(event) {
        this.item.mainSellPrice = '' + this.item.mainSellPrice;
        this.item.mainSellPrice = this._commonValidation.formatNumeric(this.item.mainSellPrice);
    }

    checkListPriceFormat() {
        let result = this._commonValidation.formatPrice(this.item.mainListPrice, 'listPrice', ErrorMessage.ES021, this.msgs);
        this.item.mainListPrice = result.price;
        this.fieldStatus['listPrice'].valid = result.valid;
        this.toggleSubmitButton();
    }

    onListPriceKeyUp(event) {
        this.item.mainListPrice = '' + this.item.mainListPrice;
        this.item.mainListPrice = this._commonValidation.formatNumeric(this.item.mainListPrice);
    }

    checkExchangePriceFormat() {
        let result = this._commonValidation.formatPrice(this.item.mainExchangePrice, 'exchangePrice', ErrorMessage.ES022, this.msgs);
        this.item.mainExchangePrice = result.price;
        this.fieldStatus['exchangePrice'].valid = result.valid;
        this.toggleSubmitButton();
    }

    onExchangePriceKeyUp(event) {
        this.item.mainExchangePrice = '' + this.item.mainExchangePrice;
        this.item.mainExchangePrice = this._commonValidation.formatNumeric(this.item.mainExchangePrice);
    }

    checkCostPriceFormat() {
        let result = this._commonValidation.formatPrice(this.item.mainCostPrice, 'cost', ErrorMessage.ES020, this.msgs);
        this.item.mainCostPrice = result.price;
        this.fieldStatus['cost'].valid = result.valid;
        this.toggleSubmitButton();
    }

    onCostPriceKeyUp(event) {
        this.item.mainCostPrice = '' + this.item.mainCostPrice;
        this.item.mainCostPrice = this._commonValidation.formatNumeric(this.item.mainCostPrice);
    }

    checkDistPctFormat() {
        this.item.mainDiscPercent = '' + this.item.mainDiscPercent;
        this.fieldStatus['discountPercent'].valid = true;
        let result = this._commonValidation.checkDiscFormat(this.item.mainDiscPercent, this.msgs);
        this.item.mainDiscPercent = result.discountPercent;
        this.fieldStatus['discountPercent'].valid = result.valid;
        this.toggleSubmitButton();
    }

    onDistPctKeyUp(event) {
        this.item.mainDiscPercent = '' + this.item.mainDiscPercent;
        this.item.mainDiscPercent = this._commonValidation.formatNumeric(this.item.mainDiscPercent);
    }
    /* End - Handling for pricing fields */

    validateHazardCodeCallback(callBackResponse: any) {
        this.fieldStatus['hazardCd'].loading = false;
        if (!callBackResponse.valid) {
            this.fieldStatus['hazardCd'].valid = false;
        }
        this.toggleSubmitButton();
    }

    validateHazardCode() {
        this.fieldStatus['hazardCd'].loading = true;
        this.fieldStatus['hazardCd'].valid = true;
        this._commonValidation.validateHazardCode(this.item.mainHazardCd, this.msgs);
    }

    onRowSelect(event) {
        if (!this.isSearchMode && this.isMrkdFrDeletion === false) {
            if (event.data.label === 'Next') {
                this.fieldStatus['nextSubstitute']['dialogBox-visible'] = true;
                if (event.data.div === '-' && event.data.pls === '-' && event.data.part === '-') {
                    this.isAddNewSub = true;
                    this.subedItem.div = '';
                    this.subedItem.pls = '';
                    this.subedItem.part = '';
                    this.subedItem.buyerNo = '';
                    this.subedItem.subWayCd = '';
                } else {
                    this.subedItem.div = event.data.div;
                    this.subedItem.pls = event.data.pls;
                    this.subedItem.part = event.data.part;
                    this.subedItem.buyerNo = event.data.authBuyerId;
                    this.subedItem.subWayCd = event.data.subWayCd;
                    this.previousNextSubItem.div = event.data.div;
                    this.previousNextSubItem.pls = event.data.pls;
                    this.previousNextSubItem.part = event.data.part;
                }
                this.subMessages = [];
                this.fieldStatus['subBuyerId'].valid = true;
                this.toggleEditSubSaveButton();
            } else {
                this.fieldStatus['nextSubstitute']['dialogBox-visible'] = false;
            }
        } else {
            this.fieldStatus['nextSubstitute']['dialogBox-visible'] = false;
        }
    }

    subItemSave() {
        this.subMessages = [];
        if (this.subedItem.div.trim() === '' && this.subedItem.pls.trim() === '' &&
            this.subedItem.part.trim() === '' && this.subedItem.buyerNo.trim() === '' &&
            this.subedItem.subWayCd.trim() === '') {
            this.historySubData.substitutionDetails[this.findSelectedSubIndex()].div = '-';
            this.historySubData.substitutionDetails[this.findSelectedSubIndex()].pls = '-';
            this.historySubData.substitutionDetails[this.findSelectedSubIndex()].part = '-';
            this.historySubData.substitutionDetails[this.findSelectedSubIndex()].authBuyerId = '-';
            this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subWayCd = '-';
            this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subItemNo = '-';
            this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subItemDesc = '-';
            this.isSubNextDialogVisible = false;
            this.subMessages = [];
            this.fieldStatus['nextSubstitute']['dialogBox-visible'] = false;
            this.isSubError = false;
            return;
        }
        if (CommonUtils.hasNoText(this.subedItem.div) && CommonUtils.hasNoText(this.subedItem.pls) &&
            CommonUtils.hasNoText(this.subedItem.part) && CommonUtils.hasNoText(this.subedItem.buyerNo)) {
            this.isSubItemsMandatory = true;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES011, this.subMessages);
            return;
        } else {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES011, this.subMessages);
            this.isSubItemsMandatory = false;
        }
        if (this.fromDiv != this.subedItem.div || this.fromPls != this.subedItem.pls || this.fromPart != this.subedItem.part) {
            if ((this.previousNextSubItem.div != this.subedItem.div) || (this.previousNextSubItem.pls != this.subedItem.pls)
                || (this.previousNextSubItem.part != this.subedItem.part)) {
                this.checkValidSubItem(this.subedItem.div + this.subedItem.pls + this.subedItem.part);
            } else {
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].div = this.subedItem.div;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].pls = this.subedItem.pls;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].part = this.subedItem.part;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].authBuyerId = this.subedItem.buyerNo;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subWayCd = this.subedItem.subWayCd;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subItemNo = this.subedItem.div + this.subedItem.pls + this.subedItem.part;
                this.fieldStatus['nextSubstitute']['dialogBox-visible'] = false;
                this.subMessages = [];
            }
        } else {
            // Item can not be subbed to itself
            this._alertMessageService.addErrorMessage(ErrorMessage.ES010, this.subMessages);
        }
    }

    private findSelectedSubIndex(): number {
        return this.historySubData.substitutionDetails.indexOf(this.selectedSubedItem);
    }

    clearSubedData() {
        this.subedItem = new SubstitutionHistory();
        this.subMessages = [];
        this.fieldStatus['subBuyerId'].valid = true;
        this.toggleEditSubSaveButton();
    }

    onSubDivKeyUp(event) {
        let subDiv = this.subedItem.div.replace(/(\s+|\.)/g, '');
        while (isNaN(+subDiv) && subDiv != '') {
            subDiv = subDiv.slice(0, -1);
        }
        this.subedItem.div = subDiv;
        this.toggleEditSubSaveButton();
    }

    onSubPlsKeyUp(event) {
        let subPls = this.subedItem.pls.replace(/(\s+|\.)/g, '');
        while (isNaN(+subPls) && subPls != '') {
            subPls = subPls.slice(0, -1);
        }
        this.subedItem.pls = subPls;
        this.toggleEditSubSaveButton();
    }
    /* Start - Handling for Next Substitute Part No */
    onSubPartKeyUp(event) {
        let subPart = this.subedItem.part.replace(/\s+/g, '');
        while (!CommonUtils.matchesPattern(subPart, '[A-Za-z0-9./-]+') && subPart !== '') {
            subPart = subPart.slice(0, -1);
        }
        this.subedItem.part = subPart;
        this.toggleEditSubSaveButton();
    }
    subPartValidation(event) {
        this._commonValidation.subPartValidation(event, this.subedItem.part, this.subMessages);
        this.toggleEditSubSaveButton();
    }
    private checkValidSubItem(subItem) {
        this._waitSpinnerService.showWait();
        this.subedItem.subDescription = '';
        this._commonValidation.checkValidSubItem(subItem, this.subMessages);
    }

    private checkValidSubItemCallback(callBackResponse: any) {
        if (this.historySubData.substitutionDetails[this.findSelectedSubIndex()] !== undefined) {
            if (callBackResponse.response !== undefined) {
                this._waitSpinnerService.hideWait();
                this.subedItem.subDescription = callBackResponse.response.itemSummary.description;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subItemDesc = this.subedItem.subDescription;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].div = this.subedItem.div;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].pls = this.subedItem.pls;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].part = this.subedItem.part;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].authBuyerId = this.subedItem.buyerNo;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subWayCd = this.subedItem.subWayCd.trim() == '' ? '1' : this.subedItem.subWayCd;
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subItemNo = this.subedItem.div + this.subedItem.pls + this.subedItem.part;
                if (this.isAddNewSub) {
                    this.historySubData.substitutionDetails[this.findSelectedSubIndex()].createTime = Date.now();
                    this.historySubData.substitutionDetails[this.findSelectedSubIndex()].updateTime = Date.now();
                    this.historySubData.substitutionDetails[this.findSelectedSubIndex()].createId = localStorage.getItem('loggedinid');
                    this.historySubData.substitutionDetails[this.findSelectedSubIndex()].updateId = localStorage.getItem('loggedinid');
                }
                this.fieldStatus['nextSubstitute']['dialogBox-visible'] = callBackResponse.isSubNextDialogVisible;
                this.subMessages = [];
            } else if (callBackResponse.err !== undefined) {

            }
        }
        this.toggleEditSubSaveButton();
    }

    /* Start - Handling for Next Substitute Way Code */
    onSubWayCdKeyUp(event) {
        if (this.subedItem.subWayCd !== "1" && this.subedItem.subWayCd !== "2") {
            this.subedItem.subWayCd = '';
        }
        this.toggleEditSubSaveButton();
    }
    /* End - Handling for Next Substitute Way Code */



    /* Start - Handling for Next Substitute Buyer No */
    onSubBuyerNoKeyUp(event) {
        let subBuyerNo = this.subedItem.buyerNo.replace(/\s+|\./g, '');
        while (isNaN(+subBuyerNo) && subBuyerNo != '') {
            subBuyerNo = subBuyerNo.slice(0, -1);
        }
        this.subedItem.buyerNo = subBuyerNo;
        this.toggleEditSubSaveButton();
    }
    validateSubBuyerNo(event) {
        this.fieldStatus['subBuyerId'].cssClass = "";
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES009, this.subMessages);
        if (+(this.subedItem.buyerNo) >= 0) {
            let byerAuth = (this.subedItem.buyerNo).replace(/\s+/g, '');
            if (!!byerAuth) {
                if (byerAuth.length === 1) {
                    byerAuth = this.subedItem.buyerNo = "0" + byerAuth;
                }
                this.fieldStatus['subBuyerId'].loading = true;
                this._commonValidation.validateSubBuyerNo(byerAuth, this.subMessages);
            } else {
                this.fieldStatus['subBuyerId'].cssClass = "";
                this.toggleEditSubSaveButton();
            }
        }
    }

    validateSubBuyerNoCallback(callBackResponse: any) {
        this.fieldStatus['subBuyerId'].loading = false;
        if (!callBackResponse.valid) {
            this.fieldStatus['subBuyerId'].valid = false;
            this.toggleEditSubSaveButton();
        } else {
            this.fieldStatus['subBuyerId'].valid = true;
        }
        this.toggleEditSubSaveButton();
    }
    /* Start - Handling for Next Substitute PLS */
    checkLeftPadDivPls(event) {
        if (this.fromDiv !== 'undefined' && this.fromDiv.length == 1 && this.fromDiv !== '0') {
            this.fromDiv = '0' + this.fromDiv;
        }
        if (this.fromPls !== 'undefined' && this.fromPls.length < 3 && this.fromPls !== '0' && this.fromPls !== '00') {
            if (this.fromPls.length === 2)
                this.fromPls = '0' + this.fromPls;
            if (this.fromPls.length === 1)
                this.fromPls = '00' + this.fromPls;
        }

        if (this.subedItem.div !== 'undefined' && this.subedItem.div.length == 1 && this.subedItem.div !== '0') {
            this.subedItem.div = '0' + this.subedItem.div;
        }

        if (this.subedItem.pls !== 'undefined' && this.subedItem.pls.length < 3 && this.subedItem.pls !== '0' && this.subedItem.pls !== '00') {
            if (this.subedItem.pls.length === 2) {
                this.subedItem.pls = "0" + this.subedItem.pls;
            }
            if (this.subedItem.pls.length === 1) {
                this.subedItem.pls = "00" + this.subedItem.pls;
            }
        }
    }


    /* Start - Toggle Add Substitute button control */
    toggleSubItemMandatory() {
        if (this.subedItem.div !== '' || this.subedItem.pls !== '' ||
            this.subedItem.part !== '' || this.subedItem.buyerNo !== '' ||
            this.subedItem.subWayCd !== '') {
            this.fieldStatus['nextSubstitute']['mandatory'] = true;
        } else {
            this.fieldStatus['nextSubstitute']['mandatory'] = false;
        }
    }

    toggleEditSubSaveButton() {
        this.toggleSubItemMandatory();
        if (this.fieldStatus['nextSubstitute']['mandatory']) {
            if (this.hasSubUiErrors(this.fieldStatus['subItem'].errorCodes)) {
                this.fieldStatus['nextSubstitute']['saveEnabled'] = false;
            } else if (this.subedItem.div === '' || this.subedItem.pls === '' ||
                this.subedItem.part === '' || this.subedItem.buyerNo === '' ||
                this.subedItem.subWayCd === '') {
                this.fieldStatus['nextSubstitute']['saveEnabled'] = false;
            } else {
                this.fieldStatus['nextSubstitute']['saveEnabled'] = true;
            }
        } else {
            this.fieldStatus['nextSubstitute']['saveEnabled'] = true;
            this.subMessages = [];
        }
    }
    private hasSubUiErrors(ignoreErrorMessages?: any[]) {
        for (let message of this.subMessages) {
            // Check if it is UI error code
            if (message.summary && message.summary.substr(0, 2) === 'ES') {
                if (!this.isErrorIgnorable(message.summary, ignoreErrorMessages)) {
                    return true;
                }
            }
        }
        return false;
    }
    private isErrorIgnorable(errorCode: string, ignoreErrorMessages?: any[]) {
        for (let ignoreError of ignoreErrorMessages) {
            if (ignoreError.code === errorCode) {
                return true;
            }
        }
        return false;
    }
    /* End - Toggle Add Substitute button control */

    getNextItem() {
        if (this.nextPreviousSubscription) {
            return;
        }
        this.loadNextPrevData('/v1/data/item-master-data/api/next/item-details?itemNo=');
    }
    getPreviousItem() {
        if (this.nextPreviousSubscription) {
            return;
        }
        this.loadNextPrevData('/v1/data/item-master-data/api/previous/item-details?itemNo=');
    }

    loadNextPrevData(url) {
        this._waitSpinnerService.showWait();
        this.clearItemDetails();
        let uri = url + this.fromPartNo;
        try {
            this.nextPreviousSubscription = this._webServiceComm.httpGet(uri).subscribe(resp => {
                this.isSearchMode = true;
                this.fieldStatus['onInquiryAction'].visible = true;
                this.fieldStatus['onAddAction'].visible = false;
                this.data = resp;
                this.item = new Item;
                this.hidden = false;
                //this.isEditLabelMode = false;
                if (this.data !== undefined) {
                    if (this.data.itemNo !== undefined) {
                        this.fromDiv = this.data.itemNo.substring(0, 2);
                        this.fromPls = this.data.itemNo.substring(2, 5);
                        this.fromPart = this.data.itemNo.substring(5);
                        this.fromPartNo = this.data.itemNo;
                    }
                }
                this.mapJsonToDomain(this.data);
                this._waitSpinnerService.hideWait();
                if (this.item.mainExemptedFromMinPrice === "Y") {
                    this.mainExemptedFromMinPriceDisplay = true;
                } else if (this.item.mainExemptedFromMinPrice === "N") {
                    this.mainExemptedFromMinPriceDisplay = false;
                } else {
                    this.mainExemptedFromMinPriceDisplay = null;
                }

                this.getHistoryDetails(this.pricecHistoryUrl, "price");
                this.getHistoryDetails(this.subHistoryUrl, "sub");
            }, err => {
                this._waitSpinnerService.hideWait();
                if (err.status === 0) {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                    this.isAfterEditModeSubmitDisabled = true;
                }
                var errorJson = JSON.parse(err._body);
                for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                    if (errorJson.messages[i].startsWith('E')) {
                        if (errorJson.messages[i].startsWith('E008') && uri.includes('previous')) {
                            this._alertMessageService.addErrorMessage(ErrorMessage.ES036, this.msgs);
                        } else if (errorJson.messages[i].startsWith('E008') && uri.includes('next')) {
                            this._alertMessageService.addErrorMessage(ErrorMessage.ES035, this.msgs);
                        } else {
                            this.msgs.push({ severity: 'error', detail: errorJson.messages[i] });
                        }
                    }
                    else if (errorJson.messages[i].startsWith('W'))
                        this.warnMsgs.push({ severity: 'warn', summary: 'Warning Message', detail: errorJson.messages[i] });
                }
                this.isAfterEditModeSubmitDisabled = true;
                this.isSubmit = false;
                this.nextPreviousSubscription = null;
            }, () => {
                this.isSubmit = false;
                this.hidden = false;
                this.nextPreviousSubscription = null;
            });
        } catch (error) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
            this.isAfterEditModeSubmitDisabled = true;
        }
    }

    onBackwardKey(event) {
        if (this.isSearchMode === true)
            this.getPreviousItem();
    }
    onForwardKey(event) {
        if (this.isSearchMode === true)
            this.getNextItem();
    }

    commentValidation() {
        let result = this._commonValidation.validateComments(this.item.mainComments, this.item.mainAlphaCd, this.msgs);
        this.fieldStatus['comments'].valid = result.valid;
        this.item.mainComments = result.comments;
        this.toggleSubmitButton();
    }

    subWayCdValidation(event) {
        if (event.keyCode === 49 || event.keyCode === 50 || event.keyCode === 97 || event.keyCode === 98) {
        } else {
            this.subedItem.subWayCd = '';
        }
    }


    subItemClear() {
        this.subedItem.div = '';
        this.subedItem.pls = '';
        this.subedItem.part = '';
        this.subedItem.subDescription = '';
        this.subedItem.buyerNo = '';
        this.subedItem.subWayCd = '';
    }

    relatedModelValidation() {
        this.fieldStatus['relatedModelNo'].valid = true;
        let relatedModelNo = '' + this.item.miscRelatedModelNum;
        relatedModelNo = relatedModelNo.replace(/\s+/g, '');
        let result = this._commonValidation.validateRelatedModelNo(this.item.miscRelatedModelNum, this.msgs);
        this.fieldStatus['relatedModelNo'].valid = result.valid;
        this.item.miscRelatedModelNum = result.relatedModelNo;
        this.toggleSubmitButton();
    }

    /* Start - Handling for SON validation */
    validateDivSon() {
        let son = (this.item.mainSon).replace(/\s+/g, '');
        this.fieldStatus['son'].cssClass = "";
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES027, this.msgs);
        if (!!son && !!this.fromDiv) {
            this.fieldStatus['son'].cssClass = "loading";
            this._commonValidation.validateDivSon(this.fromDiv, son, this.msgs);
        }

    }
    validateDivSonCallBack(callBackResponse: any) {
        this.fieldStatus['son'].cssClass = "";
        if (!callBackResponse.valid) {
            this.fieldStatus['son'].valid = false;
            this.fieldStatus['son'].cssClass = "red-border";
        }
        this.toggleSubmitButton();
    }
    /* End - Handling for SON validation */

    validateBuyerNo() {
        this.fieldStatus['buyerAuth'].cssClass = "";
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES026, this.msgs);
        if ((this.item.mainBuyerNo).replace(/\s+/g, '').length > 0) {
            let byerAuth = (this.item.mainBuyerNo).replace(/\s+/g, '');
            if (!!byerAuth) {
                if (byerAuth.length === 1) {
                    byerAuth = this.item.mainBuyerNo = "0" + byerAuth;
                }
                this.fieldStatus['buyerAuth'].cssClass = "loading";
                this._commonValidation.validateBuyerNo(byerAuth, this.msgs);
            } else {
                this.fieldStatus['buyerAuth'].cssClass = "";
                this.toggleSubmitButton();
            }
        }
    }
    validateBuyerNoCallback(callBackResponse: any) {
        this.fieldStatus['buyerAuth'].cssClass = callBackResponse.err;
    }


    _backToInquiry() {
        this.isBackToEnquiryDialogVisible = true;
    }

    onBackToEnquiryClickYes() {
        localStorage.setItem('backToEnquiry', 'backToEnquiry');
        localStorage.setItem('maintenanceData', JSON.stringify(this.data));
        this._router.navigate(['web-app', 'not-auth']).then(() => { this._router.navigate(['web-app', 'enquiry']) });
        this.isBackToEnquiryDialogVisible = false;
    }

    _backToSearchNo(event) {
        this.isConfirmDialogVisible = false;
    }


    checkItemExists() {
        this._waitSpinnerService.showWait();
        this.fromPartNo = this.fromDiv + this.fromPls + this.fromPart;
        let uri = this.fetchItemDetailsUrl + this.fromPartNo;
        try {
            this._webServiceComm.httpGet(uri).subscribe(resp => {
                this._waitSpinnerService.hideWait();
                this._alertMessageService.addErrorMessage(ErrorMessage.ES034, this.msgs);
            }, err => {
                var errorJson = JSON.parse(err._body);
                for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                    if (errorJson.messages[i].startsWith('E008')) {
                        if (localStorage.getItem('newPartToAdd')) {
                            this.hidden = true;
                            this._router.navigate(['web-app', 'not-auth']).then(() => { this._router.navigate(['web-app', 'addItem']) });
                        }
                    } else {
                        this._waitSpinnerService.hideWait();
                        this.msgs.push({ severity: 'error', detail: errorJson.messages[i] });
                    }
                }
            }, () => {
            });
        } catch (error) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
            this.isAfterEditModeSubmitDisabled = true;
        }
    }

    onClickYes() {
        this._onAddNewMode();
    }

    onClickNo() {
        this.isConfirmDialogVisible = false;
    }

    onHazardCodeLookup() {
        if (this.hazardCode.length > 0) {
            this.fieldStatus['hazardCd']['dialogBox-visible'] = true;
            return;
        }
        let uri = '/v1/data/item-master-data/hazard?size=1000';
        this._waitSpinnerService.showWait();
        this._webServiceComm.httpGet(uri).subscribe(resp => {
            this.hazardCode = resp._embedded.hazard;
        }, err => {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES004, this.msgs);
            // Remove ES004 error automatically
            setTimeout(() => {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES004, this.msgs);
                this.toggleSubmitButton()
            }, 3000);
            this._waitSpinnerService.hideWait();
        }, () => {
            this.fieldStatus['hazardCd']['dialogBox-visible'] = true;
            this._waitSpinnerService.hideWait();
        });
    }

    onHazardCodeSelect(event) {
        // Make sure that hazard code selected is active
        if (event.data.activeStatus === 'I') {
            return;
        }
        this.item.mainHazardCd = event.data.hazardCd;
        this.fieldStatus['hazardCd']['dialogBox-visible'] = false;
        this.fieldStatus['hazardCd'].valid = true;
        this._alertMessageService.removeErrorMessages(this.fieldStatus['hazardCd'].errorCodes, this.msgs);
        this.toggleSubmitButton();
    }


    _editItem() {
        this.createEditJson();
        this.callEditService();
    }

    createEditJson() {
        this.itemSearch.itemNo = this.fromDiv + this.fromPls + this.fromPart;
        this.itemSearch.comments = this.item.mainComments;
        this.itemSearch.relatedModelNo = this.item.miscRelatedModelNum;
        this.itemSearch.buyerNotes = this.item.mainBuyerNotes;

        this.itemSummaryAdd.description = this.item.mainDesc;
        this.itemSummaryAdd.son = this.item.mainSon;
        this.itemSummaryAdd.genericName = this.item.mainSicCd;
        this.itemSummaryAdd.certReqFlag = this.item.mainCertification;
        this.itemSummaryAdd.hazardCd = this.item.mainHazardCd;
        this.itemSummaryAdd.partDeleteFlag = this.isMrkdFrDeletion === true ? 'Y' : 'N';
        this.itemSummaryAdd.upc = this.item.miscUpc;
        this.itemSummaryAdd.reinstate = this.isReinstated === true ? 'Y' : 'N';

        this.miscellaneous.weightLb = Number(this.item.miscWeightLb);
        this.miscellaneous.weightOz = Number(this.item.miscWeightOz);
        this.miscellaneous.lengthFt = Number(this.item.miscLengthFt);
        this.miscellaneous.lengthIn = Number(this.item.miscLengthIn);
        this.miscellaneous.widthFt = Number(this.item.miscWidthFt);
        this.miscellaneous.widthIn = Number(this.item.miscWidthIn);
        this.miscellaneous.heightFt = Number(this.item.miscHeightFt);
        this.miscellaneous.heightIn = Number(this.item.miscHeightIn);
        this.miscellaneous.specialCd = this.item.miscSpecialCd;
        this.miscellaneous.nationalMotorFreightCd = this.item.miscNmfcNum;
        this.miscellaneous.nationalMotorFreightSuffix = this.item.miscNmfcSuff;
        this.miscellaneous.functionalCd = this.item.miscFunctionalCd;
        this.miscellaneous.shippableCd = this.item.miscShippableCd;
        this.miscellaneous.seasonCd = this.item.miscSeasonalCd;
        this.miscellaneous.impulseCd = this.item.miscImpulseCd;
        this.miscellaneous.promoteCd = this.item.miscPromotionalCd;

        this.orderInfo.factPkCd = this.item.miscFactPackCd;
        this.orderInfo.factPackageUom = this.item.miscFactPackUom;
        this.orderInfo.factPackageQty = Number(this.item.miscFactPackQty);
        this.orderInfo.weightLb = Number(this.item.miscFactPackWtLb);
        this.orderInfo.weightOz = Number(this.item.miscFactPackWtOz);

        this.priceAdd.cost = Number(this.item.mainCostPrice);
        this.priceAdd.zeroCostFlag = this.isZeroCost === true ? 'Y' : 'N';
        this.priceAdd.sellPrice = Number(this.item.mainSellPrice);
        this.priceAdd.listPrice = Number(this.item.mainListPrice);
        this.priceAdd.discPct = Number(this.item.mainDiscPercent);
        this.priceAdd.availCd = CommonUtils.getShortAvailCd(this.item.mainAlphaCd);
        this.priceAdd.exchangePrice = Number(this.item.mainExchangePrice);
        this.priceAdd.minPriceExemptFlag = this.item.mainExemptedFromMinPrice;
        this.priceAdd.authBuyerId = this.item.mainBuyerNo;

        if (JSON.parse(JSON.stringify(this.historySubData.substitutionDetails[0].label)) === 'Next') {
            if (this.historySubData.substitutionDetails[0].subItemNo === '-') {
                this.substitutionAdd.subItemNo = '';
            } else {
                this.substitutionAdd.subItemNo = this.historySubData.substitutionDetails[0].subItemNo;
            }

            if (this.historySubData.substitutionDetails[0].subWayCd === '-') {
                this.substitutionAdd.subWayCd = '';
            } else {
                this.substitutionAdd.subWayCd = this.historySubData.substitutionDetails[0].subWayCd;
            }

            if (this.historySubData.substitutionDetails[0].authBuyerId === '-') {
                this.substitutionAdd.authBuyerId = '';
            } else {
                this.substitutionAdd.authBuyerId = this.historySubData.substitutionDetails[0].authBuyerId;
            }

        }

        this.itemSearch.itemSummary = this.itemSummaryAdd;
        this.itemSearch.miscellaneous = this.miscellaneous;
        this.itemSearch.orderInformation = this.orderInfo;
        this.itemSearch.price = this.priceAdd;
        this.itemSearch.substitution = this.substitutionAdd;
    }


    callEditService() {
        this.msgs = [];
        this.warnMsgs = [];
        if (!this.isError) {
            this._waitSpinnerService.showWait()
            let uri = '/v1/data/item-master-data/api/update/item';
            try {
                this._webServiceComm.httpPost(uri, this.itemSearch).subscribe(resp => {
                    localStorage.setItem('updateSuccess', 'updateSuccess');
                    localStorage.setItem('maintenanceData', JSON.stringify(this.data));
                    this._router.navigate(['web-app', 'not-auth']).then(() => { this._router.navigate(['web-app', 'enquiry']) });

                }, err => {
                    if (err.status === 400) {
                        var errorJson = JSON.parse(err._body);
                        for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                            let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                            if (errorMessage.getType() === "ERROR") {
                                this.msgs.push({ severity: 'error', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                            } else if (errorMessage.getType() === "WARNING") {
                                this.warnMsgs.push({ severity: 'warn', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                            } else {
                                this.msgs.push({ severity: 'error', summary: ErrorMessage.ES999.getCode(), detail: ErrorMessage.ES999.getMessage() });
                            }
                        }
                    } else if (this.isTimeoutError(err)) {
                        this.warnMsgs.push({ severity: 'warn', summary: ErrorMessage.WS001.getCode(), detail: ErrorMessage.WS001.getMessage() });
                    } else {
                        this.msgs.push({ severity: 'error', summary: ErrorMessage.ES999.getCode(), detail: ErrorMessage.ES999.getMessage() });
                    }
                    this._waitSpinnerService.hideWait();
                    this.isAfterEditModeSubmitDisabled = false;
                }, () => {
                });
            } catch (error) {
                this.msgs.push({ severity: 'error', summary: ErrorMessage.ES999.getCode(), detail: ErrorMessage.ES999.getMessage() });
                this._waitSpinnerService.hideWait();
                this.isAfterEditModeSubmitDisabled = false;
            }
        }
    }

    isTimeoutError(err: any) {
        if (err && ((err.status == 500 && err._body && JSON.parse(err._body).message === 'Read timed out') || err.status == 504)) {
            return true;
        }
        return false;
    }

    onMarkFrDeletionChange(event) {
        if (event.checked) {
            this.confirmationService.confirm({
                message: 'If part is marked for deletion, modified data, if any, will be discarded. Do you want to continue?',
                accept: () => {
                    this.fieldStatus['onEditMode'].disable = true;
                    this.fieldStatus['reinstate'].disable = true;
                    this.createEditJson();
                    this.resetEditableDataToDefault();
                    this.mapJsonToDomain(this.data);
                    this.revertNextSubstitutionChanges();
                    this.isMrkdFrDeletion = true;
                    this.isReinstated = false;
                },
                reject: () => {
                    this.isMrkdFrDeletion = false;
                }
            });
        } else {
            this.mapJsonToDomain(this.data);
            this.isMrkdFrDeletion = false;
            this.fieldStatus['onEditMode'].disable = false;
            this.setReinstateMode();
        }
    }


    determineUserRole(action: string) {
        if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleRO(this.userRoles) && action === 'onInquiry') {
            this.fieldStatus['onInquiryAction'].visible = true;
            this.fieldStatus['onInquiryAction'].disable = true;
            this.fieldStatus['onAddAction'].visible = false;
            this.fieldStatus['onEditAction'].visible = false;
            this.fieldStatus['onCloneAction'].visible = false;
            this.fieldStatus['onForwardAndBackwardAction'].visible = false;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleRO(this.userRoles) && action === 'onSearch') {
            this.fieldStatus['onInquiryAction'].visible = true;
            this.fieldStatus['onAddAction'].visible = false;
            this.fieldStatus['onEditAction'].visible = false;
            this.fieldStatus['onForwardAndBackwardAction'].visible = true;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleAdd(this.userRoles) && action === 'onInquiry') {
            this.fieldStatus['onInquiryAction'].visible = true;
            this.fieldStatus['onAddAction'].visible = true;
            this.fieldStatus['onInquiryAction'].disable = true;
            this.fieldStatus['onAddAction'].disable = true;
            this.fieldStatus['onCloneAction'].visible = false;
            this.fieldStatus['onForwardAndBackwardAction'].visible = false;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleAdd(this.userRoles) && action === 'onSearch') {
            this.fieldStatus['onInquiryAction'].visible = true;
            this.fieldStatus['onAddAction'].visible = false;
            this.fieldStatus['onEditAction'].visible = false;
            this.fieldStatus['onCloneAction'].visible = true;
            this.fieldStatus['onForwardAndBackwardAction'].visible = true;
            this.fieldStatus['onInquiryAction'].disable = false;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleEdit(this.userRoles) && action === 'onInquiry') {
            this.fieldStatus['onInquiryAction'].visible = true;
            this.fieldStatus['onAddAction'].visible = true;
            this.fieldStatus['onInquiryAction'].disable = true;
            this.fieldStatus['onAddAction'].disable = true;
            this.fieldStatus['onCloneAction'].visible = false;
            this.fieldStatus['onForwardAndBackwardAction'].visible = false;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleEdit(this.userRoles) && action === 'onSearch') {
            this.fieldStatus['onInquiryAction'].visible = true;
            this.fieldStatus['onAddAction'].visible = false;
            this.fieldStatus['onEditAction'].visible = true;
            this.fieldStatus['onCloneAction'].visible = true;
            this.fieldStatus['onForwardAndBackwardAction'].visible = true;
            this.fieldStatus['onInquiryAction'].disable = false;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleEdit(this.userRoles) && action === 'onEdit') {
            this.fieldStatus['onEditAction'].visible = false;
            this.fieldStatus['onCloneAction'].visible = false;
            this.fieldStatus['onForwardAndBackwardAction'].visible = false;
            this.fieldStatus['markedForDeletion'].disable = true;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleSuper(this.userRoles) && action === 'onInquiry') {
            this.fieldStatus['onInquiryAction'].visible = true;
            this.fieldStatus['onAddAction'].visible = true;
            this.fieldStatus['onInquiryAction'].disable = true;
            this.fieldStatus['onAddAction'].disable = true;
            this.fieldStatus['onCloneAction'].visible = false;
            this.fieldStatus['onForwardAndBackwardAction'].visible = false;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleSuper(this.userRoles) && action === 'onSearch') {
            this.fieldStatus['onInquiryAction'].visible = true;
            this.fieldStatus['onAddAction'].visible = false;
            this.fieldStatus['onEditAction'].visible = true;
            this.fieldStatus['onCloneAction'].visible = true;
            this.fieldStatus['onForwardAndBackwardAction'].visible = true;
            this.fieldStatus['onInquiryAction'].disable = false;
            this.fieldStatus['onInquiryAction'].disable = false;
        } else if (this.itemMaintainanceRole === this._userRolesService.getItemMaintainanceRoleSuper(this.userRoles) && action === 'onEdit') {
            this.fieldStatus['onEditAction'].visible = false;
            this.fieldStatus['onCloneAction'].visible = false;
            this.fieldStatus['onForwardAndBackwardAction'].visible = false;
            this.fieldStatus['markedForDeletion'].disable = false;
        }
    }

}