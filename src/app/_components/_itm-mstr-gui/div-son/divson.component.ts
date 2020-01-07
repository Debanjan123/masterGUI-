import {
    Component,
    ViewChildren
}  from '@angular/core';

import {
    Role
} from '../../../_domains/common/index';

import {
    ListboxModule,
    SelectItem,
    LazyLoadEvent,
    DataTable
} from 'primeng/primeng';

import {
    Subject
} from 'rxjs/Rx';

import {
    ISubscription
} from 'rxjs/Subscription';


import {
    DivSon,
    DivSonId,
    EditDivSon,
    ErrorMessage,
    FieldMetadata
} from '../../../_domains/common/index';

import {
    WebServiceComm,
    LocalStorageService,
    AlertMessageService,
    WaitSpinnerService,
    CommonValidation,
    ItmMasterUserRolesService,
    CommonUtils
} from '../../../_services/common/index';

@Component({
    templateUrl: './divson.component.html'
})
export class DivSonComponent {

    componentTitle: string = 'Hazard';
    private selectedHazard: string[];
    private isNewDivSon = false;
    private priceFormula = []
    private emptyDivSonData = {
        'div': '',
        'son': '',
        'sourceName': '',
        'priceFormula': '',
        'priceVariable': '',
        'formulaMarkupPct': '',
        'discPct': '',
        'createTime': '',
        'updateTime': '',
        'createId': '',
        'updateId': '',
        '_links': {
            'self': {
                'href': ''
            },
            'divSon': {
                'href': ''
            },
            'buyerAuth': {
                'href': ''
            }
        }
    };
    private emptyBuyerAuthData = {
        "id": '',
        "name": ''
    };
    private jsonObj = {};
    private divSonData = [];
    private buyerAuthData = [];
    private rowindex;
    private fieldStatus = FieldMetadata.getFieldStatus();
    private divSon = new DivSon();
    private editdivSon = new EditDivSon();
    private id = new DivSonId();
    private addmsgs = [];
    private successMsgs = [];
    private msgs = [];
    private warnMsgs = [];
    private edit;
    private addNew;
    private divSonExistanceInDB = false;
    private totalRecords;
    private isPaginator;
    private componentTitleForDivSon = 'Div Son';
    private divSuggestions: any[];
    private sonSuggestions: any[];
    private pendingRequest: ISubscription;
    private searchDiv = '';
    private searchSon = '';
    private validateDivSon = new Subject();
    private postSearchIndicator = false;
    private offsetValue = 8;
    private isBothFieldSearch: boolean;

    @ViewChildren("divselectelm") divSelectElm;
    @ViewChildren("plsselectelm") plsSelectElm;


    //@ViewChildren("hazardCdElm") hazardCdElm;

    constructor(private _webServiceComm: WebServiceComm,
        private _waitSpinnerService: WaitSpinnerService,
        private _commonValidation: CommonValidation,
        private _alertMessageService: AlertMessageService) {
        this._commonValidation.subcriberObj.subscribe(resp => {
            var object = JSON.parse(JSON.stringify(resp));
            if (object.origin === "validateBuyerNo") {
                this.validateBuyerNoCallback(object);
            }
        });

        this.validateDivSon.subscribe(resp => {
            var object = JSON.parse(JSON.stringify(resp));
            if (object.origin === 'add') {
                this.postAddLookup(object);
            }
            if (object.origin === 'search') {
                this.postSearchLookup(object);

            }
        });
    }
    ngOnInit() {
        try {
            this.priceFormula = LocalStorageService.PRICE_FORMULA;
            //   this.getDivSon(0,this.offsetValue);
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }
    }



    onSearchDivKeyUp(event) {
        let inputDiv = this.searchDiv;
        inputDiv = inputDiv.replace(/(\s+|\.)/g, '');
        this.searchDiv = this._commonValidation.formatNumeric(inputDiv);
        if (CommonUtils.hasText(inputDiv)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES005, this.msgs);
            this.fieldStatus['mainDiv'].cssClass = "";
        }
    }





    onSearchSonKeyUp(event) {
        if (this.searchSon !== undefined) {
            let inputPls = this.searchSon;
            inputPls = inputPls.replace(/(\s+|\.)/g, '');
            this.searchSon = this._commonValidation.formatNumeric(inputPls);
            if (CommonUtils.hasText(inputPls)) {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES006, this.msgs);
                this.fieldStatus['mainPls'].cssClass = "";
            }
        }
    }


    _onSearch() {
        if (CommonUtils.hasNoText("" + this.searchDiv) && CommonUtils.hasNoText("" + this.searchSon)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES060, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES059, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES064, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES027, this.msgs);
            this.getDivSon(0, this.offsetValue);
        }

        if (CommonUtils.hasText("" + this.searchDiv) && CommonUtils.hasText("" + this.searchSon)
            && this.searchDiv !== undefined && this.searchSon !== undefined) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES059, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES060, this.msgs);
            let div = (this.searchDiv).replace(/\s+/g, '');
            let son = (this.searchSon).replace(/\s+/g, '');
            if (!!div && !!son) {
                this._waitSpinnerService.showWait();
                this.callLookup('search', div, son);
                this._waitSpinnerService.hideWait();
            }

        } else if (CommonUtils.hasText("" + this.searchDiv) || CommonUtils.hasText("" + this.searchSon)) {
            this._waitSpinnerService.showWait();
            this.divOrSonSearch(0);
        }

    }

    divOrSonSearch(rowIndex: number) {
        this._waitSpinnerService.showWait();
        let divSonUri;
        let div;
        let son;
        let pageNo = (rowIndex + this.offsetValue) / this.offsetValue;
        if (CommonUtils.hasText("" + this.searchDiv) && this.searchDiv !== undefined) {
            div = (this.searchDiv).replace(/\s+/g, '');
            divSonUri = '/v1/data/item-master-data/api/search/divSon/div/' + div + '?page=' + pageNo + '&size=' + this.offsetValue;
        } else if (CommonUtils.hasText("" + this.searchSon) && this.searchSon !== undefined) {
            son = (this.searchSon).replace(/\s+/g, '');
            divSonUri = '/v1/data/item-master-data/api/search/divSon/son/' + son + '?page=' + pageNo + '&size=' + this.offsetValue;
        }
        this._webServiceComm.httpGet(divSonUri).subscribe(resp => {
            this.postSearchIndicator = true;
            this.divSonData = [];
            this.totalRecords = resp.totalElements;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES060, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES059, this.msgs);
            if (this.totalRecords === 0 && !!div) {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES027, this.msgs);
            } else if (this.totalRecords === 0 && !!son) {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES064, this.msgs);
            }
            for (let ii = 0; ii < resp.content.length; ii++) {
                this.msgs = [];
                var jsonstr = JSON.stringify(this.emptyDivSonData);
                this.jsonObj = JSON.parse(jsonstr);
                this.jsonObj["div"] = resp.content[ii].id.div;
                this.jsonObj["son"] = resp.content[ii].id.son;
                this.jsonObj["authBuyerId"] = resp.content[ii].authBuyerId;
                this.jsonObj["sourceName"] = resp.content[ii].sourceName;
                this.jsonObj["priceFormula"] = resp.content[ii].priceFormula;
                this.jsonObj["priceVariable"] = resp.content[ii].priceVariable;
                this.jsonObj["markupPrct"] = resp.content[ii].formulaMarkupPct;
                this.jsonObj["discPct"] = resp.content[ii].discPct;
                this.jsonObj["createTime"] = resp.content[ii].createTime;
                this.jsonObj["updateTime"] = resp.content[ii].updateTime;
                this.jsonObj["createId"] = resp.content[ii].createId;
                this.jsonObj["updateId"] = resp.content[ii].updateId;
                this.divSonData.push(this.jsonObj);
            }
           
        }, err => {
            this._waitSpinnerService.hideWait();
        }, () => {
            this._waitSpinnerService.hideWait();
        });
    }

    callLookup(src, div, son) {
        let divPlsUri = "/v1/data/item-master-data/divSon/" + div + "_" + son;
        this._webServiceComm.httpGet(divPlsUri).subscribe(res => {
            this.validateDivSon.next(this.buildValidationResponse('record found', src, res));
        }, err => {
            if (err.status === 404) {
                this.validateDivSon.next(this.buildValidationResponse('record not found', src, err));
            } else {
                this.validateDivSon.next(this.buildValidationResponse('other error', src, err));
            }
        }, () => {
        });
    }

    private buildValidationResponse(msg?: string, origin?: string, res?: string) {
        let response: { [key: string]: any } = {};
        response.origin = origin;
        response.msg = msg;
        response.res = res;
        return response;
    }

    postAddLookup(res) {
        if (res.msg === 'record found') {
            this.fieldStatus['addDivPls'].loading = false;
            this.fieldStatus['addDivPls'].valid = false;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES053, this.addmsgs);
        }
        if (res.msg === 'record not found') {
            this.fieldStatus['addDivPls'].loading = false;
            this.fieldStatus['addDivPls'].valid = true;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES053, this.addmsgs);
        }
        if (res.msg === 'other error') {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.addmsgs);
            this.validateDivSon.next(false);
        }
        this.toggleSubmitButton();
    }

    postSearchLookup(resp) {
        if (resp.msg === 'record found') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES059, this.msgs);
            this.divSon = new DivSon();
            this.divSon.div = resp.res.id.div;
            this.divSon.son = resp.res.id.son;
            this.divSon.sourceName = resp.res.sourceName;
            this.divSon.authBuyerId = resp.res.authBuyerId;
            this.divSon.priceFormula = resp.res.priceFormula;
            this.divSon.priceVariable = resp.res.priceVariable;
            this.divSon.markupPrct = resp.res.formulaMarkupPct;
            this.divSon.discPct = resp.res.discPct;
            this.divSon.createTime = resp.res.createTime;
            this.divSon.updateTime = resp.res.updateTime;
            this.divSon.createId = resp.res.createId;
            this.divSon.updateId = resp.res.updateId;
            this.divSonData = [];
            this.divSonData.push(this.divSon);
            this.totalRecords = 1;
            this._waitSpinnerService.hideWait();
        }
        if (resp.msg === 'record not found') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES060, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES064, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES027, this.msgs);
            this.divSonData = [];
            this.totalRecords = 1;
        }
        if (resp.msg === 'other error') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES059, this.msgs);
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this.getDivSon(this.rowindex, this.offsetValue);
        }
    }



    getDivSon(rowIndex: number, offset: number) {
        this.divSonData = [];
        let pageNo = 0;
        if (rowIndex != 0) {
            pageNo = rowIndex / this.offsetValue;
        }
        this._waitSpinnerService.showWait();
        let uri = '/v1/data/item-master-data/divSon?page=' + pageNo + '&size=' + this.offsetValue;
        try {
            this._webServiceComm.httpGet(uri).subscribe(resp => {
                this.postSearchIndicator = true;
                if (resp && resp._embedded.divSon.length > 0) {
                    this.totalRecords = resp.page.totalElements;
                    if (this.totalRecords > this.offsetValue) {
                        this.isPaginator = true;
                    } else {
                        this.isPaginator = false;

                    }
                    for (let ii = 0; ii < resp._embedded.divSon.length; ii++) {
                        var jsonstr = JSON.stringify(this.emptyDivSonData);
                        this.jsonObj = JSON.parse(jsonstr);
                        this.jsonObj["div"] = resp._embedded.divSon[ii].id.div;
                        this.jsonObj["son"] = resp._embedded.divSon[ii].id.son;
                        this.jsonObj["authBuyerId"] = resp._embedded.divSon[ii].authBuyerId;
                        this.jsonObj["sourceName"] = resp._embedded.divSon[ii].sourceName;
                        this.jsonObj["priceFormula"] = resp._embedded.divSon[ii].priceFormula;
                        this.jsonObj["priceVariable"] = resp._embedded.divSon[ii].priceVariable;
                        this.jsonObj["markupPrct"] = resp._embedded.divSon[ii].formulaMarkupPct;
                        this.jsonObj["discPct"] = resp._embedded.divSon[ii].discPct;
                        this.jsonObj["createTime"] = resp._embedded.divSon[ii].createTime;
                        this.jsonObj["updateTime"] = resp._embedded.divSon[ii].updateTime;
                        this.jsonObj["createId"] = resp._embedded.divSon[ii].createId;
                        this.jsonObj["updateId"] = resp._embedded.divSon[ii].updateId;
                        this.divSonData.push(this.jsonObj);
                    }
                }
                this._waitSpinnerService.hideWait();
            }, err => {
                if (CommonUtils.hasText('' + err.status)) {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                } else {
                    var errorJson = JSON.parse(err._body);
                    for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                        let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                        if (errorMessage.getType() === "ERROR") {
                            this.msgs.push({ severity: 'error', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                        } else {
                            this.warnMsgs.push({ severity: 'warn', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                        }
                    }
                }
                this._waitSpinnerService.hideWait();
            }, () => {
            });
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }
    }

    onNewDivSon() {
        this.resetAllErrorMsgs();
        this.editdivSon = new EditDivSon();
        this.id = new DivSonId();
        this.editdivSon.id = this.id;
        this.isNewDivSon = true;
        this.addNew = true;
        this.edit = false;
    }

    divSonSave() {
        if (this.revisitValidation()) {
            if (!this.hasUiErrors([ErrorMessage.ES999])) {
                if (this.edit) {
                    this.editdivSon.updateId = localStorage.getItem('loggedinid');
                    this.editdivSon.updateTime = Date.now();
                    this.divSonExistanceInDB = false;
                    this.saveDivSonToDataBase();
                }
                if (this.addNew) {
                    this.editdivSon.createId = localStorage.getItem('loggedinid');
                    this.editdivSon.updateId = localStorage.getItem('loggedinid');
                    this.editdivSon.createTime = Date.now();
                    this.editdivSon.updateTime = Date.now();
                    this._waitSpinnerService.showWait();
                    let uri = '/v1/data/item-master-data/divSon/' + this.editdivSon.id.div + '_' + this.editdivSon.id.son
                    this._webServiceComm.httpGet(uri).subscribe(resp => {
                        if (CommonUtils.hasText('' + resp.id)) {
                            this.isNewDivSon = true;
                            this._alertMessageService.addErrorMessage(ErrorMessage.ES053, this.addmsgs);
                        }
                        this.toggleSubmitButton();
                    }, err => {
                        this.divSonExistanceInDB = false;
                        this.saveDivSonToDataBase();
                        //this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.addmsgs);
                        this._waitSpinnerService.hideWait();
                    }, () => {
                        this._waitSpinnerService.hideWait();
                    });
                }
            }
        }
    }

    saveDivSonToDataBase() {
        if (!this.divSonExistanceInDB) {
            this._waitSpinnerService.showWait();
            this.divSonExistanceInDB = false;
            let uri = '/v1/data/item-master-data/api/sync/divSon';
            try {
                this._webServiceComm.httpPost(uri, this.editdivSon).subscribe(resp => {
                    this._waitSpinnerService.hideWait();
                    if (this.edit) {
                        this.successMsgs.push({ severity: 'success', summary: 'Div Son successfully updated' });
                        this.isNewDivSon = false;
                        this.edit === false;
                        this.loadDataTablePostEdit();
                    }
                    if (this.addNew) {
                        this.successMsgs.push({ severity: 'success', summary: 'Div Son successfully added' });
                        this.isNewDivSon = false;
                        this.addNew = false;
                        this.getDivSon(this.rowindex, this.offsetValue);
                    }
               
            }, err => {
                    if (CommonUtils.hasText('' + err.status)) {
                        this.isNewDivSon = false;
                        this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                    } else {
                        var errorJson = JSON.parse(err._body);
                        for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                            let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                            if (errorMessage.getType() === "ERROR") {
                                this.msgs.push({ severity: 'error', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                            } else {
                                this.warnMsgs.push({ severity: 'warn', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                            }
                        }
                    }
                    this._waitSpinnerService.hideWait();
                }, () => { });
            } catch (error) {
                this._waitSpinnerService.hideWait();
                this.msgs.push({ severity: 'error', summary: error });
            }
        }
    }

     loadDataTablePostEdit() {
        if (CommonUtils.hasText("" + this.searchDiv) && CommonUtils.hasText("" + this.searchSon)
            && this.searchDiv !== undefined && this.searchSon !== undefined) {
            this.isBothFieldSearch = true;
            let div = (this.searchDiv).replace(/\s+/g, '');
            let son = (this.searchSon).replace(/\s+/g, '');
            this.callLookup('search', div, son);
        }else {
            this.isBothFieldSearch = false;
        }
        if (!this.isBothFieldSearch) {
             this.isBothFieldSearch = false;
            if (CommonUtils.hasText("" + this.searchDiv) || CommonUtils.hasText("" + this.searchSon)) {
                    this._waitSpinnerService.showWait();
                    this.divOrSonSearch(this.rowindex);
            }
            if (CommonUtils.hasNoText(this.searchDiv) && CommonUtils.hasNoText(this.searchSon)) {
                    this.getDivSon(this.rowindex, this.offsetValue);
            }
        }
    }

    _onEnterKey(event) {
        event.first = 0;
        event.rows = this.offsetValue;
        this.loadLazy(event);
    }

    loadLazy(event: LazyLoadEvent) {
        this.rowindex = event.first;
        if (CommonUtils.hasText("" + this.searchDiv) && CommonUtils.hasText("" + this.searchSon)
            && this.searchDiv !== undefined && this.searchSon !== undefined) {
            this.isBothFieldSearch = true;
            let div = (this.searchDiv).replace(/\s+/g, '');
            let son = (this.searchSon).replace(/\s+/g, '');
            this.callLookup('search', div, son);
        }else {
            this.isBothFieldSearch = false;
        }
        if (!this.isBothFieldSearch) {
             this.isBothFieldSearch = false;
            if (CommonUtils.hasText("" + this.searchDiv) || CommonUtils.hasText("" + this.searchSon)) {
                    this._waitSpinnerService.showWait();
                    this.divOrSonSearch(event.first);
            }
            if (CommonUtils.hasNoText(this.searchDiv) && CommonUtils.hasNoText(this.searchSon)) {
                    this.getDivSon(event.first, event.rows);
            }
        }

    }


    revisitValidation(): boolean {
        if (CommonUtils.hasText("" + this.editdivSon.id.div) && CommonUtils.hasText("" + this.editdivSon.id.son)
            && CommonUtils.hasText("" + this.editdivSon.sourceName) && CommonUtils.hasText("" + this.editdivSon.authBuyerId)
            && CommonUtils.hasText("" + this.editdivSon.priceFormula) && CommonUtils.hasText("" + this.editdivSon.priceVariable)
            && CommonUtils.hasText("" + this.editdivSon.formulaMarkupPct) && CommonUtils.hasText("" + this.editdivSon.discPct)) {
            return true;
        } else {
            return false;
        }
    }


    onDivKeyUp() {
        let div = this.editdivSon.id.div;
        div = div.replace(/(\s+|\.)/g, '');
        this.editdivSon.id.div = this._commonValidation.formatNumeric("" + div);
    }

    onBlurDiv() {
        if (this.editdivSon.id.div.length === 2) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES037, this.addmsgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES053, this.addmsgs);
        } else {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES037, this.addmsgs);
        }
        this.toggleSubmitButton();
    }

    onBlurSon() {
        if (this.editdivSon.id.son.length === 3 || this.editdivSon.id.son.length === 4) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES027, this.addmsgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES053, this.addmsgs);
        } else {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES027, this.addmsgs);
        }
        this.toggleSubmitButton();
    }



    onSonKeyUp() {
        let son = this.editdivSon.id.son;
        son = son.replace(/(\s+|\.)/g, '');
        this.editdivSon.id.son = this._commonValidation.formatNumeric("" + son);
    }


    checkSourceName() {
        this.toggleSubmitButton();
    }

    onPriceFormulaLookup() {
        this.fieldStatus['divSon']['dialogBox-visible-priceFormula'] = true;
    }

    onPriceFormulaSelect(event) {
        this.editdivSon.priceFormula = event.data.Code;
        this.fieldStatus['divSon']['dialogBox-visible-priceFormula'] = false;
    }

    onByerAuthLookup() {
        this.fieldStatus['divSon']['dialogBox-visible-buyerAuth'] = true;
        let uri = "/v1/data/item-master-data/buyerAuth/?size=100"
        this._waitSpinnerService.showWait();
        this._webServiceComm.httpGet(uri).subscribe(resp => {
            if (resp && resp._embedded.buyerAuth.length > 0) {
                for (let ii = 0; ii < resp._embedded.buyerAuth.length; ii++) {
                    var jsonstr = JSON.stringify(this.emptyBuyerAuthData);
                    this.jsonObj = JSON.parse(jsonstr);
                    this.jsonObj["id"] = resp._embedded.buyerAuth[ii].authBuyerId;
                    this.jsonObj["name"] = resp._embedded.buyerAuth[ii].authBuyerName;
                    this.buyerAuthData.push(this.jsonObj);
                }
            }
        }, err => {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES004, this.addmsgs);
            // Remove ES004 error automatically
            setTimeout(() => {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES004, this.addmsgs);
                this.toggleSubmitButton()
            }, 3000);
            this._waitSpinnerService.hideWait();
        }, () => {
            this.fieldStatus['divSon']['dialogBox-visible-buyerAuth'] = true;
            this._waitSpinnerService.hideWait();
        });
    }

    onBuyerAuthSelect(event) {
        this.editdivSon.authBuyerId = event.data.id;
        this.fieldStatus['divSon']['dialogBox-visible-buyerAuth'] = false;
    }

    validateBuyerNo() {
        this.fieldStatus['buyerAuth'].cssClass = "";
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES026, this.addmsgs);
        if ((this.editdivSon.authBuyerId).replace(/\s+/g, '').length > 0) {
            let byerAuth = (this.editdivSon.authBuyerId).replace(/\s+/g, '');
            if (!!byerAuth) {
                if (byerAuth.length === 1) {
                    byerAuth = this.editdivSon.authBuyerId = "0" + byerAuth;
                }
                this.fieldStatus['buyerAuth'].cssClass = "loading";
                this._commonValidation.validateBuyerNo(byerAuth, this.addmsgs);
            } else {
                this.fieldStatus['buyerAuth'].cssClass = "";
            }
        }
        this.toggleSubmitButton();
    }
    validateBuyerNoCallback(callBackResponse: any) {
        this.fieldStatus['buyerAuth'].cssClass = callBackResponse.err;
        if (callBackResponse.err === 'red-border') {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES026, this.addmsgs);
        }
        this.toggleSubmitButton();
    }

    onPriceVariableKeyUp(event) {
        this.editdivSon.priceVariable = '' + this.editdivSon.priceVariable;
        this.editdivSon.priceVariable = this._commonValidation.formatNumeric(this.editdivSon.priceVariable);
    }

    checkPriceVariableFormat() {
        let result = this._commonValidation.formatPriceFields(this.editdivSon.priceVariable, 'divSon.PriceVariable', ErrorMessage.ES057, this.addmsgs);
        this.editdivSon.priceVariable = result.price;
        this.fieldStatus['divSon'].priceVariableValid = result.valid;
        this.toggleSubmitButton();
    }

    onMarkPrctKeyUp(event) {
        this.editdivSon.formulaMarkupPct = '' + this.editdivSon.formulaMarkupPct;
        this.editdivSon.formulaMarkupPct = this._commonValidation.formatNumeric(this.editdivSon.formulaMarkupPct);
    }

    checkMarkPrctFormat() {
        let result = this._commonValidation.formatPriceFields(this.editdivSon.formulaMarkupPct, 'divSon', ErrorMessage.ES056, this.addmsgs);
        this.editdivSon.formulaMarkupPct = result.price;
        this.fieldStatus['divSon'].markUpValid = result.valid;
        this.toggleSubmitButton();
    }

    checkDistPctFormat() {
        this.editdivSon.discPct = '' + this.editdivSon.discPct;
        this.fieldStatus['divSon'].distCountValid = true;
        let result = this._commonValidation.checkDiscFormat(this.editdivSon.discPct, this.addmsgs);
        this.editdivSon.discPct = result.discountPercent;
        this.fieldStatus['divSon'].distCountValid = result.valid;
        this.toggleSubmitButton();
    }

    onDistPctKeyUp(event) {
        this.editdivSon.discPct = '' + this.editdivSon.discPct;
        this.editdivSon.discPct = this._commonValidation.formatNumeric(this.editdivSon.discPct);
    }



    /* Start - Toggle button control */
    private toggleDivSonMandatory() {
        if (CommonUtils.hasText("" + this.editdivSon.id.div) && CommonUtils.hasText("" + this.editdivSon.id.son)
            && CommonUtils.hasText("" + this.editdivSon.sourceName) && CommonUtils.hasText("" + this.editdivSon.authBuyerId)
            && CommonUtils.hasText("" + this.editdivSon.priceFormula) && CommonUtils.hasText("" + this.editdivSon.priceVariable)
            && CommonUtils.hasText("" + this.editdivSon.formulaMarkupPct) && CommonUtils.hasText("" + this.editdivSon.discPct)) {
            this.fieldStatus['divSon']['mandatory'] = true;
        } else {
            this.fieldStatus['divSon']['mandatory'] = false;
        }
    }

    private toggleSubmitButton() {
        this.toggleDivSonMandatory();
        if (!this.fieldStatus['divSon']['mandatory']) {
            this.fieldStatus['divSon']['saveEnabled'] = false;
        } else {
            if (this.hasUiErrors([])) {
                this.fieldStatus['divSon']['saveEnabled'] = false;
            } else {
                this.fieldStatus['divSon']['saveEnabled'] = true;
                this.addmsgs = [];
            }
        }
    }

    clearData() {
        this.editdivSon.id.div = "";
        this.editdivSon.id.son = "";
        this.editdivSon.sourceName = '';
        this.editdivSon.authBuyerId = '';
        this.editdivSon.priceFormula = '';
        this.editdivSon.priceVariable = '';
        this.editdivSon.formulaMarkupPct = '';
        this.editdivSon.discPct = '';
        this.editdivSon.createTime = 0;
        this.editdivSon.updateTime = 0;
        this.editdivSon.createId = '';
        this.editdivSon.updateId = '';
    }

    private hasUiErrors(ignoreErrorMessages?: any[]) {
        for (let message of this.addmsgs) {
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
    // /* End - Toggle button control */


    onRowSelect(event) {
        this.resetAllErrorMsgs();
        this.id.div = event.data.div;
        this.id.son = event.data.son;
        this.editdivSon.id = this.id;
        this.editdivSon.priceFormula = event.data.priceFormula;
        this.editdivSon.sourceName = event.data.sourceName;
        this.editdivSon.authBuyerId = event.data.authBuyerId;
        this.editdivSon.priceVariable = event.data.priceVariable;
        this.editdivSon.formulaMarkupPct = event.data.markupPrct;
        this.editdivSon.discPct = event.data.discPct;
        this.editdivSon.createTime = event.data.createTime;
        this.editdivSon.updateTime = event.data.updateTime;
        this.editdivSon.createId = event.data.createId;
        this.editdivSon.updateId = event.data.updateId;
        this.isNewDivSon = true;
        this.edit = true;
        this.addNew = false;
        this.fieldStatus['divSon']['saveEnabled'] = true;
    }

    resetAllErrorMsgs() {
        this.msgs = [];
        this.addmsgs = [];
        this.fieldStatus['buyerAuth'].cssClass = "";
        this.fieldStatus['divSon'].distCountValid = true;
        this.fieldStatus['divSon'].markUpValid = true;
        this.fieldStatus['divSon'].priceVariableValid = true;
    }

    onClearSearchData() {
        this.searchDiv = undefined;
        this.searchSon = undefined;
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES059, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES060, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES064, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES064, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES037, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES027, this.msgs);
        this.divSon = new DivSon();
        this.getDivSon(this.rowindex, this.offsetValue);
    }

}