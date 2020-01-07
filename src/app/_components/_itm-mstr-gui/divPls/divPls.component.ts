import {
    Component,
    ViewChildren
}  from '@angular/core';

import {
    Role
} from '../../../_domains/common/index';

import {
    ListboxModule,
    SelectItem
} from 'primeng/primeng';

import {DataTable} from 'primeng/components/datatable/datatable';

import {
    Subject
} from 'rxjs/Rx';

import {
    ISubscription
} from 'rxjs/Subscription';

import {
    DivPls,
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
    templateUrl: './divPls.component.html'
})
export class DivPlsComponent {

    componentTitle: string = 'Div - Pls';
    private selectedDivPls: string[];
    private isNewDivPls = false;
    private componentIdUri = '/v1/data/item-master-data/divpls?size=10';
    private componentId;
    private emptyDivPlsData = {
        "id": {
            "div": "",
            "pls": ""
        },
        "minPriceExemptFlag": "",
        "createTime": +"",
        "updateTime": +"",
        "createId": "",
        "updateId": ""
    };
    private emptyEDivPlsData = {
        "id": {
            "div": "",
            "pls": ""
        },
        "minPriceExemptFlag": "",
        "createTime": "",
        "updateTime": +"",
        "createId": "",
        "updateId": ""
    };
    private pageNo = 0;
    private jsonObj = {};
    private DivPlsData = [];
    private fieldStatus = FieldMetadata.getFieldStatus();
    private divPls = new DivPls();
    private isEditActive: boolean;
    private isEditUsed: boolean;
    private isAddActive: boolean = false;
    private isAddUsed: boolean = false;
    private isEditDivPls;
    private addmsgs = [];
    private successMsgs = [];
    private msgs = [];
    private warnMsgs = [];
    private validateSub = new Subject();
    private isMinPriceExempt: boolean = false;
    private totalRecords = 0;
    private componentTitleForDivPls = 'Div Pls'
    private pendingRequest: ISubscription;
    private divSuggestions: any[];
    private plsSuggestions: any[];
    private fromDiv = '';
    private fromPls = '';
    private noOfRecordsPerPage = 12;
    private isSearch: boolean;
    private isBothFieldSearch: boolean;
    private rowIndex;

    constructor(private _webServiceComm: WebServiceComm,
        private _waitSpinnerService: WaitSpinnerService,
        private _commonValidation: CommonValidation,
        private _alertMessageService: AlertMessageService) {
        this.validateSub.subscribe(resp => {
            var object = JSON.parse(JSON.stringify(resp));
            if (object.origin === 'add') {
                this.postAddLookup(object);
            }
            if (object.origin === 'search') {
                this.postSearchLookup(object);
            }
        }
        )
    }

    @ViewChildren("divselectelm") divSelectElm;
    @ViewChildren("plsselectelm") plsSelectElm;
    @ViewChildren("focusSearch") focusSearch;
    @ViewChildren("divPlsDatatable") dataTableComponent: DataTable;


    ngOnInit() {
        try {
            this.fieldStatus['mainDiv'].disable = false;
            this.fieldStatus['mainPls'].disable = false;
            //this.getDivPlsCode(0);
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }
    }

    onNewDivPls() {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES052, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES054, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
        this.fromDiv = '';
        this.fromPls = '';
        this.divPls = new DivPls();
        this.addmsgs = [];
        this.fieldStatus['addDivPls'].valid = true;
        this.isNewDivPls = true;
    }

    newDivPlsSave() {
        if (this.revisitValidation()) {
            var req;
            if (this.isEditDivPls) {
                var editReq = this.createEditRequestObj();
                req = JSON.parse(editReq);
            }
            if (this.isNewDivPls) {
                var addReq = this.createAddRequestObj();
                req = JSON.parse(addReq);
            }
            this._waitSpinnerService.showWait();
            let uri = '/v1/data/item-master-data/api/sync/divPls'
            try {
                this._webServiceComm.httpPost(uri, req).subscribe(resp => {
                    this._waitSpinnerService.hideWait();
                    if (this.isEditDivPls) {
                        this.isEditDivPls = false;
                        this.successMsgs.push({ severity: 'success', summary: 'DivPls Code successfully updated' });
                    }
                    if (this.isNewDivPls) {
                        this.isNewDivPls = false;
                        this.successMsgs.push({ severity: 'success', summary: 'DivPls Code successfully added' });
                    }
                    this.divPls = new DivPls();
                    this.isMinPriceExempt = false;
                    this.loadDataTablePostEdit();
                }, err => {
                    if (CommonUtils.hasText('' + err.status)) {
                        this.isNewDivPls = false;
                        this.isEditDivPls = false;
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
                }, () => { this.fieldStatus['DivPlsScr']['saveEnabled'] = false; });
            } catch (error) {
                this._waitSpinnerService.hideWait();
                this.msgs.push({ severity: 'error', summary: error });
            }
        }
    }

    loadDataTablePostEdit() {
        if (CommonUtils.hasText("" + this.fromDiv) && CommonUtils.hasText("" + this.fromPls)
            && this.fromDiv !== undefined && this.fromPls !== undefined) {
            this._waitSpinnerService.showWait();
            this.isBothFieldSearch = true;
            let div = (this.fromDiv).replace(/\s+/g, '');
            let pls = (this.fromPls).replace(/\s+/g, '');
            this.callLookup('search', div, pls);
        } else {
            this.isBothFieldSearch = false;
        }
        if (!this.isBothFieldSearch) {
            this.isBothFieldSearch = false;
            if (CommonUtils.hasText("" + this.fromDiv) || CommonUtils.hasText("" + this.fromPls)) {
                this._waitSpinnerService.showWait();
                this.divOrPlsSearch(this.rowIndex);
            }
            if (CommonUtils.hasNoText(this.fromDiv) && CommonUtils.hasNoText(this.fromPls)) {
                this.getDivPlsCode(this.rowIndex);
            }
        }
    }

    revisitValidation(): boolean {
        if (this.divPls.div.length === 2 && this.divPls.pls.length === 3) {
            return true;
        } else {
            return false;
        }
    }

    createAddRequestObj(): string {
        this.divPls.createId = localStorage.getItem('loggedinid');
        this.divPls.updateId = localStorage.getItem('loggedinid');
        this.divPls.createTime = Date.now();
        this.divPls.updateTime = Date.now();
        var jsonObj = this.emptyDivPlsData;
        jsonObj["id"]["div"] = '' + this.divPls.div;
        jsonObj["id"]["pls"] = '' + this.divPls.pls;
        jsonObj["minPriceExemptFlag"] = this.isMinPriceExempt === false ? 'N' : 'Y';
        jsonObj["createId"] = '' + this.divPls.createId;
        jsonObj["createTime"] = +this.divPls.createTime;
        jsonObj["updateId"] = '' + this.divPls.updateId;
        jsonObj["updateTime"] = + this.divPls.updateTime;
        return JSON.stringify(jsonObj);
    }
    createEditRequestObj(): string {
        this.divPls.updateId = localStorage.getItem('loggedinid');
        this.divPls.updateTime = Date.now();
        var jsonObj = this.emptyEDivPlsData;
        jsonObj["id"]["div"] = '' + this.divPls.div;
        jsonObj["id"]["pls"] = '' + this.divPls.pls;
        jsonObj["minPriceExemptFlag"] = this.isMinPriceExempt === false ? 'N' : 'Y';
        jsonObj["createId"] = '' + this.divPls.createId;
        jsonObj["createTime"] = '' + this.divPls.createTime;
        jsonObj["updateId"] = '' + this.divPls.updateId;
        jsonObj["updateTime"] = + this.divPls.updateTime;
        return JSON.stringify(jsonObj);
    }

    onDivKeyUp() {
        let div = (this.divPls.div).replace(/\s+/g, '');
        this.divPls.div = this._commonValidation.formatNumeric(div);
        if (this.divPls.div.length === 2) {
            if (this.divPls.pls.length === 3) {
                this.fieldStatus['addDivPls'].loading = true;
                this.validateDivPlsCode();
            }
        } else {
            this.fieldStatus['DivPlsScr']['saveEnabled'] = false;
        }
    }

    onPlsKeyUp() {
        let pls = (this.divPls.pls).replace(/\s+/g, '');
        this.divPls.pls = this._commonValidation.formatNumeric(pls);
        if (this.divPls.pls.length === 3) {
            if (this.divPls.div.length === 2) {
                this.fieldStatus['addDivPls'].loading = true;
                this.validateDivPlsCode();
            }
        } else {
            this.fieldStatus['DivPlsScr']['saveEnabled'] = false;
        }
    }
    validateDivPlsCode() {
        if (CommonUtils.hasText("" + this.divPls.div) && CommonUtils.hasText("" + this.divPls.pls)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES052, this.addmsgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES054, this.addmsgs);
            let div = (this.divPls.div).replace(/\s+/g, '');
            let pls = (this.divPls.pls).replace(/\s+/g, '');
            if (!!div && !!pls) {
                this.callLookup('add', div, pls);
            }
        }
        if (CommonUtils.hasNoText("" + this.divPls.div) || CommonUtils.hasNoText("" + this.divPls.pls)) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES054, this.addmsgs);
        }
    }

    postAddLookup(res) {
        if (res.msg === 'record found') {
            this.fieldStatus['addDivPls'].loading = false;
            this.fieldStatus['addDivPls'].valid = false;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES052, this.addmsgs);
        }
        if (res.msg === 'record not found') {
            this.fieldStatus['addDivPls'].loading = false;
            this.fieldStatus['addDivPls'].valid = true;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES052, this.addmsgs);
        }
        if (res.msg === 'other error') {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.addmsgs);
            this.validateSub.next(false);
        }
        this.toggleSubmitButton();
    }

    _onEnterKey(event) {
        event.first = 0;
        this.loadDivPlsLazy(event);
    }

    loadDivPlsLazy(event) {
        this.rowIndex = event.first;
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES052, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES054, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
        if (CommonUtils.hasText("" + this.fromDiv) && CommonUtils.hasText("" + this.fromPls)
            && this.fromDiv !== undefined && this.fromPls !== undefined) {
            this._waitSpinnerService.showWait();
            this.isBothFieldSearch = true;
            let div = (this.fromDiv).replace(/\s+/g, '');
            let pls = (this.fromPls).replace(/\s+/g, '');
            this.callLookup('search', div, pls);
        } else {
            this.isBothFieldSearch = false;
        }
        if (!this.isBothFieldSearch) {
            this.isBothFieldSearch = false;
            if (CommonUtils.hasText("" + this.fromDiv) || CommonUtils.hasText("" + this.fromPls)) {
                this._waitSpinnerService.showWait();
                this.divOrPlsSearch(event.first);
            }
            if (CommonUtils.hasNoText(this.fromDiv) && CommonUtils.hasNoText(this.fromPls)) {
                this.getDivPlsCode(event.first);
            }
        }
    }

    getDivPlsCode(rowIndex: number) {
        let pageNo = 0;
        this.isSearch = false;
        if (rowIndex != 0) {
            pageNo = rowIndex / this.noOfRecordsPerPage;
        }
        this._waitSpinnerService.showWait();
        this.DivPlsData = [];
        let uri = '/v1/data/item-master-data/divPls?page=' + pageNo + '&size=' + this.noOfRecordsPerPage;
        try {
            this._webServiceComm.httpGet(uri).subscribe(resp => {
                this._waitSpinnerService.hideWait();
                for (let ii = 0; ii < resp._embedded.divPls.length; ii++) {
                    this.divPls = new DivPls();
                    this.divPls.div = resp._embedded.divPls[ii].id.div;
                    this.divPls.pls = resp._embedded.divPls[ii].id.pls;
                    this.divPls.minPriceExemptFlag = resp._embedded.divPls[ii].minPriceExemptFlag === 'Y' ? 'Yes' : 'No';
                    this.divPls.createId = resp._embedded.divPls[ii].createId;
                    this.divPls.updateId = resp._embedded.divPls[ii].updateId;
                    this.divPls.createTime = resp._embedded.divPls[ii].createTime;
                    this.divPls.updateTime = resp._embedded.divPls[ii].updateTime;
                    this.DivPlsData.push(this.divPls);
                    this.pageNo = resp.page.number;
                    this.totalRecords = +resp.page.totalElements;
                }
                this.divPls = new DivPls();
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
                this.divPls = new DivPls();
            });
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }

    }

    onRowSelect(event) {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES052, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES054, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
        this.divPls.div = event.data.div;
        this.divPls.pls = event.data.pls;
        this.divPls.createTime = event.data.createTime;
        this.divPls.updateTime = event.data.updateTime;
        this.divPls.createId = event.data.createId;
        this.divPls.updateId = event.data.updateId;
        this.isMinPriceExempt = event.data.minPriceExemptFlag === 'No' ? false : true;
        this.addmsgs = [];
        this.isEditDivPls = true;
    }

    hideEditDialog() {
        this.isEditDivPls = false;
    }

    clearData() {
        this.divPls = new DivPls();
        this.isAddActive = false;
        this.isAddUsed = false;
        this.fieldStatus['addDivPls'].valid = true;
        this.fieldStatus['DivPlsScr']['mandatory'] = true;
        this.isMinPriceExempt = false;
        this.addmsgs = [];
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

    onSearchDivKeyUp(event) {
        let inputDiv = this.fromDiv;
        inputDiv = inputDiv.replace(/(\s+|\.)/g, '');
        this.fromDiv = this._commonValidation.formatNumeric(inputDiv);
        if (CommonUtils.hasText(inputDiv)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES005, this.msgs);
            this.fieldStatus['mainDiv'].cssClass = "";
        }
    }


    onBlurDiv(event) {
        if (this.fromDiv && !!this.fromDiv) {
            while (this.fromDiv.length < 2) {
                this.fromDiv = '0' + this.fromDiv;
            }
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

    onSearchPlsKeyUp(event) {
        if (this.fromPls !== undefined) {
            let inputPls = this.fromPls;
            inputPls = inputPls.replace(/(\s+|\.)/g, '');
            this.fromPls = this._commonValidation.formatNumeric(inputPls);
            if (CommonUtils.hasText(inputPls)) {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES006, this.msgs);
                this.fieldStatus['mainPls'].cssClass = "";
            }
        }
    }

    onBlurPls(event) {
        if (this.fromPls && !!this.fromPls) {
            while (this.fromPls.length < 3) {
                this.fromPls = '0' + this.fromPls;
            }
        }
    }

    /* Starting the search functionality */
    _onSearch() {
        if (CommonUtils.hasNoText("" + this.fromDiv) && CommonUtils.hasNoText("" + this.fromPls)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES054, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
            this.getDivPlsCode(0);
            return;
        }

        if (CommonUtils.hasText("" + this.fromDiv) && CommonUtils.hasText("" + this.fromPls)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES054, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
            let div = (this.fromDiv).replace(/\s+/g, '');
            let pls = (this.fromPls).replace(/\s+/g, '');
            if (!!div && !!pls) {
                this._waitSpinnerService.showWait();
                this.callLookup('search', div, pls);
            }
            return;
        }
    }
    divOrPlsSearch(rowIndex: number) {
        let page = 1;
        let divPlsUri;
        let div;
        let pls;
        this.isSearch = true;
        if (rowIndex != 0) {
            page = (rowIndex / this.noOfRecordsPerPage) + 1;
        }
        if (CommonUtils.hasText("" + this.fromDiv) && this.fromDiv !== undefined) {
            div = (this.fromDiv).replace(/\s+/g, '');
            divPlsUri = '/v1/data/item-master-data/api/search/divPls/div/' + div + '?page=' + page + '&size=' + this.noOfRecordsPerPage;
        } else if (CommonUtils.hasText("" + this.fromPls) && this.fromPls !== undefined) {
            pls = (this.fromPls).replace(/\s+/g, '');
            divPlsUri = '/v1/data/item-master-data/api/search/divPls/pls/' + pls + '?page=' + page + '&size=' + this.noOfRecordsPerPage;
        }
        this._waitSpinnerService.showWait();
        this._webServiceComm.httpGet(divPlsUri).subscribe(resp => {
            this.DivPlsData = [];
            this.totalRecords = resp.totalElements;
            this.pageNo = resp.totalPages;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            if (this.totalRecords === 0 && !!div) {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
               // this._alertMessageService.addErrorMessage(ErrorMessage.ES064, this.msgs);
            } else if (this.totalRecords === 0 && !!pls) {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES064, this.msgs);
                //this._alertMessageService.addErrorMessage(ErrorMessage.ES055, this.msgs);
            }
            for (let ii = 0; ii < resp.content.length; ii++) {
                this.msgs = [];
                this.divPls = new DivPls();
                this.divPls.div = resp.content[ii].id.div;
                this.divPls.pls = resp.content[ii].id.pls;
                this.divPls.minPriceExemptFlag = resp.content[ii].minPriceExemptFlag === 'Y' ? 'Yes' : 'No';
                this.divPls.createId = resp.content[ii].createId;
                this.divPls.updateId = resp.content[ii].updateId;
                this.divPls.createTime = resp.content[ii].createTime;
                this.divPls.updateTime = resp.content[ii].updateTime;
                this.DivPlsData.push(this.divPls);
            }
            this.divPls = new DivPls();
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
            this.getDivPlsCode(0);
        }, () => {
            this._waitSpinnerService.hideWait();
        });
    }
    postSearchLookup(resp) {
        this._waitSpinnerService.hideWait();
        if (resp.msg === 'record found') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
            this.divPls = new DivPls();
            this.divPls.div = resp.res.id.div;
            this.divPls.pls = resp.res.id.pls;
            this.divPls.minPriceExemptFlag = resp.res.minPriceExemptFlag === 'N' ? 'No' : 'Yes';
            this.divPls.createId = resp.res.createId;
            this.divPls.updateId = resp.res.updateId;
            this.divPls.createTime = resp.res.createTime;
            this.divPls.updateTime = resp.res.updateTime;
            this.DivPlsData = [];
            this.DivPlsData.push(this.divPls);
            this.totalRecords = 1;
            this._waitSpinnerService.hideWait();
        }
        if (resp.msg === 'record not found') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this.DivPlsData = [];
            this.totalRecords = 1;
            //this._alertMessageService.addErrorMessage(ErrorMessage.ES055, this.msgs);
            //this.getDivPlsCode();
            // this.fromDiv = '';
            //  this.fromPls = '';
        }
        if (resp.msg === 'other error') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this.fromDiv = '';
            this.fromPls = '';
            this.getDivPlsCode(0);
        }
    }
    onRefresh() {
        this.fromDiv = '';
        this.fromPls = '';
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES055, this.msgs);
        this.divPls = new DivPls();
    }
    /**search functionality completed */

    callLookup(src, div, pls) {
        this.isSearch = false;
        let divPlsUri = "/v1/data/item-master-data/divPls/" + div + "_" + pls;
        this._webServiceComm.httpGet(divPlsUri).subscribe(res => {
            this.validateSub.next(this.buildValidationResponse('record found', src, res));
        }, err => {
            if (err.status === 404) {
                this.validateSub.next(this.buildValidationResponse('record not found', src, err));
            } else {
                this.validateSub.next(this.buildValidationResponse('other error', src, err));
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
    /* Start - Toggle button control */
    private toggleHazardMandatory() {
        if (CommonUtils.hasText("" + this.divPls.div) && CommonUtils.hasText("" + this.divPls.pls)) {
            this.fieldStatus['DivPlsScr']['mandatory'] = true;
        } else {
            this.fieldStatus['DivPlsScr']['mandatory'] = false;
        }
    }
    private toggleSubmitButton() {
        this.toggleHazardMandatory();
        if (!this.fieldStatus['DivPlsScr']['mandatory']) {
            if (this.hasUiErrors([])) {
                this.fieldStatus['DivPlsScr']['saveEnabled'] = false;
            }
        } else {
            if (this.hasUiErrors([])) {
                this.fieldStatus['DivPlsScr']['saveEnabled'] = false;
            } else {
                this.fieldStatus['DivPlsScr']['saveEnabled'] = true;
                this.addmsgs = [];
            }
        }
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
    /* End - Toggle button control */
}