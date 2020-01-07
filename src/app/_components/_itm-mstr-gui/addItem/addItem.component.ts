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
    ItemSearch,
    ItemSummary,
    Miscellaneous,
    Price,
    OrderInfo,
    Substitution,
    ErrorMessage,
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
    Router
} from '@angular/router';


@Component({
    selector: 'addItem',
    templateUrl: './addItem.component.html'
})
export class AddItemComponent {

    componentTitleForAddNew: string = 'Add Item';
    private successMsgs = [];
    isCertified: boolean;
    isMrkdFrDeletion: boolean = false;
    isSubstituted: boolean = false;
    isReinstated: boolean = false;
    isZeroCost: boolean;
    isNext: boolean;
    hidden: boolean = true;
    private subsHistoryDetails = [];
    private subshHstory: SubstitutionHistory[] = [];
    private item: Item;
    private itemSearch: ItemSearch;
    private itemSummaryAdd: ItemSummary;
    private miscellaneous: Miscellaneous;
    private orderInfo: OrderInfo;
    private priceAdd: Price;
    private substitutionAdd: Substitution;
    private warnMsgs = [];
    private msgs = [];
    private subMessages = [];
    private message = [];
    private _headers = new Headers({ 'Content-Type': 'application/json' });
    private _options = new RequestOptions({ headers: this._headers });
    private pendingRequest: ISubscription;
    private isFilter = false;
    private divSuggestions: any[];
    private plsSuggestions: any[];
    private selectedDiv;
    private selectedPls;
    private fromDiv;
    private fromPls;
    private fromPart;
    private values = [];
    private fromPartNo;
    private LogedInUser;
    private messageSuccess = true;
    private isSubmit = false;
    private isPlsError = false;
    private minDate = new Date();
    private data;
    private historySubData;
    private historyPriceData;
    private isConfirmDialogVisible = false;
    private isSubmitToDBDisable = false;
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
    private addItemToDb: string = '/v1/data/item-master-data/api/add/item';
    private isAddNewMode = false;
    private alphaCode = [];
    private hazardCode = [];
    private mainExemptedFromMinPriceDisplay = null;
    private isSubItemsMandatory = false;
    private subedItem = new SubstitutionHistory();
    private selectedSubedItem: SubstitutionHistory;
    private isAddNewSub = false;
    private previousNextSubItem = new SubstitutionHistory();
    private subedSubWayCd: SelectItem[];;
    route: string;
    private isSaveOnAddSubDisabled = false;
    private fieldStatus = FieldMetadata.getFieldStatus();
    private sonDisabled = true;

    @ViewChildren("divselectelm") divSelectElm;
    @ViewChildren("plsselectelm") plsSelectElm;
    @ViewChildren("focusFromPart") focusFromPart;
    @ViewChildren('selectedFile') selectedTextFile;
    @ViewChildren("subdivselectelm") subdivselectelm;
    @ViewChildren("subplsSelectElm") subplsSelectElm;
    @ViewChildren("descselectelm") descselectelm;

    constructor(private _http: Http,
        private location: Location,
        private _router: Router,
        private _localStorageService: LocalStorageService,
        private _alertMessageService: AlertMessageService,
        private _waitSpinnerService: WaitSpinnerService,
        private confirmationService: ConfirmationService,
        private _commonValidation: CommonValidation,
        private _webServiceComm: WebServiceComm,
        private http: Http
    ) {
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
        this._waitSpinnerService.hideWait();
        if (localStorage.getItem('newPartToAdd') !== null) {
            this.fromDiv = localStorage.getItem('newPartToAdd').substring(0, 2);
            this.fromPls = localStorage.getItem('newPartToAdd').substring(2, 5);
            this.fromPart = localStorage.getItem('newPartToAdd').substring(5);
            this.isAddNewMode = true;
            localStorage.setItem("mainItem", localStorage.getItem("newPartToAdd"));
            localStorage.removeItem('newPartToAdd');
        }
        this.itemSearch = new ItemSearch();
        this.itemSummaryAdd = new ItemSummary();
        this.orderInfo = new OrderInfo();
        this.miscellaneous = new Miscellaneous();
        this.priceAdd = new Price();
        this.substitutionAdd = new Substitution();
        this.msgs = [];
        this.fromPartNo = '';
        this.LogedInUser = localStorage.getItem('loggedinid');
        this.historySubData = {
            "substitutionDetails": [this.emptySubHistoryData]
        };
        this.historySubData.substitutionDetails[0].label = 'Next';
        this.historyPriceData = {
            "_embedded": {}
        };

        this.alphaCode = LocalStorageService.ALPHACODE;
        this.subedSubWayCd = [];
        this.subedSubWayCd.push({ label: '1', value: '1' });
        this.subedSubWayCd.push({ label: '2', value: '2' });
        if (localStorage.getItem('cloneItemNo') !== null && localStorage.getItem('maintenanceData') !== null) {
            this.fromDiv = localStorage.getItem('cloneItemNo').substring(0, 2);
            this.fromPls = localStorage.getItem('cloneItemNo').substring(2, 5);
            this.fromPart = localStorage.getItem('cloneItemNo').substring(5);
            localStorage.removeItem('cloneItemNo');
            let maintenanceData = localStorage.getItem('maintenanceData');
            this.componentTitleForAddNew = "Clone";
            this.mapJsonToDomain(JSON.parse(maintenanceData));
        }

    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.descselectelm.first.nativeElement.select();
        }, 1);
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
        } else {
            this.fieldStatus['mainDiv'].cssClass = "red-border";
            this._alertMessageService.addErrorMessage(ErrorMessage.ES005, this.msgs);
        }
        this.toggleSubmitButton();
    }

    onBlurDiv(event) {
        if (this.fromDiv && !!this.fromDiv) {
            while (this.fromDiv.length < 2) {
                this.fromDiv = '0' + this.fromDiv;
            }
        }
        // Validate SON as DIV may have been changed 
        this.validateDivSon();
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
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES006, this.msgs);
            this.fieldStatus['mainPls'].cssClass = "";
        } else {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES006, this.msgs);
            this.fieldStatus['mainPls'].cssClass = "red-border";
        }
        this.toggleSubmitButton();
    }

    onBlurPls(event) {
        if (this.fromPls && !!this.fromPls) {
            while (this.fromPls.length < 3) {
                this.fromPls = '0' + this.fromPls;
            }
        }
    }
    /* End - Handling for PLS */

    /* Start - Handling for Part Number */
    addFromPart(event) {
        let partNo = '' + this.fromPart;
        while (!CommonUtils.matchesPattern(partNo, '[A-Za-z0-9./-]+') && partNo !== '') {
            partNo = partNo.slice(0, -1);
        }
        this.fromPart = partNo;
        if (CommonUtils.hasText(partNo)) {
            this.fieldStatus['mainPartNo'].valid = true;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES007, this.msgs);
        } else {
            this.fieldStatus['mainPartNo'].valid = false;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES007, this.msgs);
        }
        this.toggleSubmitButton();
    }
    /* End - Handling for Part Number */

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

    /* Start - Handling for Alpha Code */
    onAlphaCodeLookup() {
        this.fieldStatus['alphaCode']['dialogBox-visible'] = true;
    }

    onAlphaCodeSelect(event) {
        this.item.mainAlphaCd = event.data.Code;
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

    /* Start - Handling for Hazard Code */
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
    /* End - Handling for Hazard Code */

    /* Start - Handling for Sell Price */
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
    /* End - Handling for Sell Price */

    /* Start - Handling for List Price */
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
    /* End - Handling for List Price */

    /* Start - Handling for Exchange Price */
    checkExchangePriceFormat() {
        let result = this._commonValidation.formatPrice(this.item.mainExchangePrice, 'exchangePrice', ErrorMessage.ES022, this.msgs);
        this.item.mainExchangePrice = result.price;
        this.fieldStatus['exchangePrice'].valid = result.valid;
        this.toggleSubmitButton();        
    }

    onExchangePriceKeyUp(event) {
        this.item.mainExchangePrice = this._commonValidation.formatNumeric(this.item.mainExchangePrice);
    }
    /* End - Handling for Exchange Price */

    /* Start - Handling for Cost Price */
    checkCostPriceFormat() {
        let result = this._commonValidation.formatPrice(this.item.mainCostPrice, 'cost', ErrorMessage.ES020, this.msgs);
        this.item.mainCostPrice = result.price;
        this.fieldStatus['cost'].valid = result.valid;
        this.toggleSubmitButton();        
    }

    onCostPriceKeyUp(event) {
        this.item.mainCostPrice = this._commonValidation.formatNumeric(this.item.mainCostPrice);
    }
    /* End - Handling for Cost Price */

    /* Start - Handling for Discount Percentage */
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

    /* End - Handling for Discount Percentage */

    /* Start - Handling for Item description */
    onMinimumPriceExemptionChange() {
        this.item.mainExemptedFromMinPrice = 
            CommonUtils.getMinimumExemptionPriceFlag(this.mainExemptedFromMinPriceDisplay);
    }
    /* End - Handling for Item description */

    /* Start - Handling for Item description */
    validateItemDescription() {
        let result = this._commonValidation.validateItemDescription(this.item.mainDesc, this.msgs);
        this.fieldStatus['itemDescription'].valid = result.valid;
        this.toggleSubmitButton();
    }
    /* End - Handling for Item description */

    /* Start - Handling for Comments */
    validateComments() {
        let result = this._commonValidation.validateComments(this.item.mainComments, this.item.mainAlphaCd, this.msgs);
        this.fieldStatus['comments'].valid = result.valid;
        this.item.mainComments = result.comments;
        this.toggleSubmitButton();
    }
    /* End - Handling for Comments */

    /* Start - Handling for Related Model # */
   relatedModelValidation() {
        this.fieldStatus['relatedModelNo'].valid = true; 
        let relatedModelNo = '' + this.item.miscRelatedModelNum;
        relatedModelNo = relatedModelNo.replace(/\s+/g, '');
        let result = this._commonValidation.validateRelatedModelNo(this.item.miscRelatedModelNum, this.msgs);
        this.fieldStatus['relatedModelNo'].valid = result.valid;
        this.item.miscRelatedModelNum = result.relatedModelNo;
        this.toggleSubmitButton();
    }
    /* End - Handling for Related Model # */

    /* Start - Handling for Buyer Auth No */
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
    /* End - Handling for Buyer Auth No */

    /* Start - Handling for Next Substitute DIV */
    onSubDivKeyUp(event) {
        let subDiv = this.subedItem.div.replace(/(\s+|\.)/g, '');
        while (isNaN(+subDiv) && subDiv != '') {
            subDiv = subDiv.slice(0, -1);
        }
        this.subedItem.div = subDiv;
        this.toggleAddSubSaveButton();
    }
    /* End - Handling for Next Substitute DIV */

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

    onSubPlsKeyUp(event) {
        let subPls = this.subedItem.pls.replace(/(\s+|\.)/g, '');
        while (isNaN(+subPls) && subPls != '') {
            subPls = subPls.slice(0, -1);
        }
        this.subedItem.pls = subPls;
        this.toggleAddSubSaveButton();
    }
    /* End - Handling for Next Substitute PLS */

    /* Start - Handling for Next Substitute Part No */
    onSubPartKeyUp(event) {
        let subPart = this.subedItem.part.replace(/\s+/g, '');
        while (!CommonUtils.matchesPattern(subPart, '[A-Za-z0-9./-]+') && subPart !== '') {
            subPart = subPart.slice(0, -1);
        }
        this.subedItem.part = subPart;
        this.toggleAddSubSaveButton();
    }

    subPartValidation(event) {
        this._commonValidation.subPartValidation(event, this.subedItem.part, this.subMessages);
        this.toggleAddSubSaveButton();
    }
    /* End - Handling for Next Substitute Part No */

    /* Start - Handling for Substitute Item No*/
    private checkValidSubItem(subItem) {
        this._waitSpinnerService.showWait();
        this._commonValidation.checkValidSubItem(subItem, this.subMessages);
    }

    private checkValidSubItemCallback(callBackResponse: any) {
        if (this.historySubData.substitutionDetails[this.findSelectedSubIndex()] !== undefined) {
            if (callBackResponse.response !== undefined) {
                let alphaCd = '';
                this._waitSpinnerService.hideWait();
                this.historySubData.substitutionDetails[this.findSelectedSubIndex()].subItemDesc = callBackResponse.response.itemSummary.description;
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
        this.toggleAddSubSaveButton();
    }
    /* End - Handling for Substitute Item No*/

    /* Start - Handling for Next Substitute Way Code */
    onSubWayCdKeyUp(event) {
        if (this.subedItem.subWayCd !== "1" && this.subedItem.subWayCd !== "2") {
            this.subedItem.subWayCd = '';
        }
        this.toggleAddSubSaveButton();
    }
    /* End - Handling for Next Substitute Way Code */

    /* Start - Handling for Next Substitute Buyer No */
    onSubBuyerNoKeyUp(event) {
        let subBuyerNo = this.subedItem.buyerNo.replace(/\s+|\./g, '');
        while (isNaN(+subBuyerNo) && subBuyerNo != '') {
            subBuyerNo = subBuyerNo.slice(0, -1);
        }
        this.subedItem.buyerNo = subBuyerNo;
        this.toggleAddSubSaveButton();
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
                this.toggleAddSubSaveButton();
            }
        }
    }

    validateSubBuyerNoCallback(callBackResponse: any) {
        this.fieldStatus['subBuyerId'].loading = false;
        if (!callBackResponse.valid) {
            this.fieldStatus['subBuyerId'].valid = false;            
        }else{
            this.fieldStatus['subBuyerId'].valid = true;
        }
        this.toggleAddSubSaveButton();
    }
    /* End - Handling for Next Substitute Buyer No */

    /* Start - Handling for Add Next Substitute actions */
    onRowSelect(event) {
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
                this.fieldStatus['nextSubstitute']['mandatory'] = true;
            }
            this.subMessages = [];
            this.isSaveOnAddSubDisabled = true;
            this.fieldStatus['subBuyerId'].valid = true;
            this.toggleAddSubSaveButton();
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
            this.fieldStatus['nextSubstitute']['dialogBox-visible'] = false;
            this.subMessages = [];
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
        this.toggleAddSubSaveButton();
    }
    /* End - Handling for Add Next Substitute actions */

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

    toggleAddSubSaveButton() {
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
    /* End - Toggle Add Substitute button control */

    /* Start - Handling for "Add New Part" */
    _addNewItem() {
        this.msgs = [];
        this._waitSpinnerService.showWait();
        // Disable submit button after it is clicked to prevent duplicate submission
        this.isSubmitToDBDisable = true;
        try {
            this._webServiceComm.httpPut(this.addItemToDb, this.buildAddItemRequest()).subscribe(resp => {
                localStorage.setItem('addedItemNoSuccess', 'Success');
                localStorage.setItem('addedItemNo', this.itemSearch.itemNo as string);
                localStorage.setItem('addedItemNoRespjson', JSON.stringify(resp));
                this._router.navigate(['web-app', 'not-auth']).then(() => { this._router.navigate(['web-app', 'enquiry']) });
            }, err => {
                if (err.status === 400) {
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
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                }
                this._waitSpinnerService.hideWait();
                this.toggleSubmitButton();
            }, () => {
                // Is this required because after request is successfully processed,
                // screen will be rendered to inquiry screen so spinner should be ON
                this._waitSpinnerService.hideWait();
                this.toggleSubmitButton();
            });
        } catch (error) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
            this.isSubmitToDBDisable = false;
        }
    }

    private buildAddItemRequest() {
        this.itemSummaryAdd.certReqFlag = 'N';
        this.itemSummaryAdd.description = this.item.mainDesc;
        this.itemSummaryAdd.genericName = this.item.mainSicCd;
        this.itemSummaryAdd.hazardCd = this.item.mainHazardCd;
        this.itemSummaryAdd.partDeleteFlag = 'N';
        this.itemSummaryAdd.certReqFlag = 'N';
        this.itemSummaryAdd.reinstate = 'N';
        this.itemSummaryAdd.son = this.item.mainSon;
        this.itemSummaryAdd.upc = this.item.miscUpc;
        this.priceAdd.authBuyerId = this.item.mainBuyerNo;
        this.priceAdd.availCd = CommonUtils.getShortAvailCd(this.item.mainAlphaCd);
        this.priceAdd.cost = +this.item.mainCostPrice;
        this.priceAdd.sellPrice = +this.item.mainSellPrice;
        this.priceAdd.listPrice = +this.item.mainListPrice;
        this.priceAdd.exchangePrice = +this.item.mainExchangePrice;
        this.priceAdd.discPct = +this.item.mainDiscPercent;
        this.priceAdd.minPriceExemptFlag = this.item.mainExemptedFromMinPrice;
        this.priceAdd.zeroCostFlag = this.isZeroCost === true ? 'Y' : 'N';
        this.substitutionAdd.authBuyerId = this.subedItem.buyerNo;
        this.substitutionAdd.subItemNo = this.subedItem.div + this.subedItem.pls + this.subedItem.part;
        this.substitutionAdd.subWayCd = this.subedItem.subWayCd;
        this.miscellaneous.specialCd = this.item.miscSpecialCd;
        this.itemSearch.itemNo = this.fromDiv + this.fromPls + this.fromPart;
        this.itemSearch.buyerNotes = this.item.mainBuyerNotes;
        this.itemSearch.comments = this.item.mainComments;
        this.itemSearch.relatedModelNo = this.item.miscRelatedModelNum;
        this.itemSearch.itemSummary = this.itemSummaryAdd;
        this.itemSearch.miscellaneous = this.miscellaneous;
        this.itemSearch.orderInformation = this.orderInfo;
        this.itemSearch.price = this.priceAdd;
        this.itemSearch.substitution = this.substitutionAdd;
        return this.itemSearch;
    }
    /* End - Handling for "Add New Part" */

    /* Start - Handling for "Cloning" */
    mapJsonToDomain(maintenanceData) {
        this.item.mainDiv = maintenanceData.itemNo.substring(0, 2);
        this.item.mainPls = maintenanceData.itemNo.substring(2, 5);
        this.item.mainPart = maintenanceData.itemNo.substring(5);
        this.item.mainDesc = maintenanceData.itemSummary.description;
        this.item.mainSon = maintenanceData.itemSummary.son;
        this.item.mainHazardCd = maintenanceData.itemSummary.hazardCd;
        this.item.mainMarkedForDeletion = maintenanceData.itemSummary.partDeleteFlag;
        this.item.mainReinstate = 'N';
        this.item.userFieldsPreferredSon = maintenanceData.itemSummary.son;
        this.item.userFieldsDateModified = maintenanceData.itemSummary.dateModified;
        this.item.userFieldsTimeModified = maintenanceData.itemSummary.timeModified;
        this.item.userFieldsModifierId = maintenanceData.itemSummary.lawsonSignonId;
        this.item.userFieldsMarkedForDeletion = maintenanceData.itemSummary.partDeleteFlag;
        this.item.miscUpc = maintenanceData.itemSummary.upc;

        if (maintenanceData.price) {
            let price = maintenanceData.price.nextPrice ?
                maintenanceData.price.nextPrice : maintenanceData.price.currentPrice;
            this.item.mainBuyerNo = price.authBuyerId;
            this.item.mainCostPrice = price.cost.toFixed(2);
            this.item.mainSellPrice = price.sellPrice.toFixed(2);
            this.item.mainListPrice = price.listPrice.toFixed(2);
            this.item.mainDiscPercent = price.discPct.toFixed(2);
            this.item.mainExchangePrice = price.exchangePrice.toFixed(2);
            this.item.mainExemptedFromMinPrice = price.minPriceExemptFlag;
            if ((CommonUtils.safeTrim(price.availCd) === '') && price.cost === 0) {
                this.item.mainZeroCost = 'Y';
            } else {
                this.item.mainZeroCost = 'N';
            }
            this.item.mainAlphaCd = CommonUtils.getLongAvailCd(price.availCd);

            if ((price.availCd).replace(/\s+/g, '') !== '') {
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

        if (maintenanceData.miscellaneous) {
            this.item.miscSpecialCd = maintenanceData.miscellaneous.specialCd;
        }
        if (maintenanceData.relatedModelNumber) {
            this.item.miscRelatedModelNum = maintenanceData.relatedModelNumber.relatedModelNo;
        }
        if (maintenanceData.buyerNote) {
            this.item.mainBuyerNotes = maintenanceData.buyerNote.buyerNotes;
        }
        if (maintenanceData.comments) {
            this.item.mainComments = maintenanceData.comments.commentText;
        }

        this.isZeroCost = this.item.mainZeroCost === "Y" ? true : false;
        this.isNext = this.item.mainNext === "Y" ? true : false;
    }
    /* End - Handling for "Cloning" */

    /* Start - Handling for "Back to Inquiry Screen" */
    _backToSearch(event) {
        this.isConfirmDialogVisible = true;
    }

    _backToSearchYes() {
        localStorage.setItem("mainItem", this.fromDiv + this.fromPls + this.fromPart);
        this.item = new Item();
        this.isConfirmDialogVisible = false;

        this._waitSpinnerService.showWait();
        if (this.isAddNewMode) {
            this._router.navigate(['web-app', 'not-auth']).then(() => { this._router.navigate(['web-app', 'enquiry']) });
        } else {
            localStorage.setItem('cloneToEnquiry', 'cloneToEnquiry');
            this._router.navigate(['web-app', 'not-auth']).then(() => { this._router.navigate(['web-app', 'enquiry']) });
        }
        this._waitSpinnerService.hideWait();
    }

    _backToSearchNo() {
        localStorage.setItem("mainItem", this.fromDiv + this.fromPls + this.fromPart);
        this.isConfirmDialogVisible = false;
    }
    /* End - Handling for "Back to Inquiry Screen" */

    /* Start - Toggle button control */
    private toggleSubmitButton() {
        if (this.hasUiErrors([ErrorMessage.ES999])) {
            this.isSubmitToDBDisable = true;
        } else {
            this.isSubmitToDBDisable = false;
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

    private isErrorIgnorable(errorCode: string, ignoreErrorMessages?: any[]) {
        for (let ignoreError of ignoreErrorMessages) {
            if (ignoreError.code === errorCode) {
                return true;
            }
        }
        return false;
    }
    /* End - Toggle button control */
}