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
    DataTable
} from 'primeng/primeng';

import {
    Subject
} from 'rxjs/Rx';

import {
    ISubscription
} from 'rxjs/Subscription';

import {
    BuyerAuth,
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
    templateUrl: './buyerAuth.component.html'
})
export class BuyerAuthComponent {

    private selectedBuyerAuth: string[];
    private isNewBuyerAuth = false;
    private emptyBuyerAuthData = {
        "authBuyerId": "",
        "authBuyerName": "",
        "createId": "",
        "updateId": "",
        "updateTime": + "",
        "createTime": + ""
    }
    private emptyEBuyerAuthData = {
        "authBuyerId": "",
        "authBuyerName": "",
        "createId": "",
        "updateId": "",
        "updateTime": + "",
        "createTime": ""
    }
    private pageNo = 0;
    private jsonObj = {};
    private BuyerAuthData = [];
    private fieldStatus = FieldMetadata.getFieldStatus();
    private buyerAuth = new BuyerAuth();
    private isEditActive: boolean;
    private isEditUsed: boolean;
    private isAddActive: boolean = false;
    private isAddUsed: boolean = false;
    private isEditBuyerAuth;
    private addmsgs = [];
    private successMsgs = [];
    private authBuyerIdLookup = '';
    private msgs = [];
    private warnMsgs = [];
    private validateSub = new Subject();
    private isMinPriceExempt: boolean = false;
    private totalRecords = 0;
    private componentTitleForBuyerAuth = 'Buyer Information'
    private pendingRequest: ISubscription;
    private noOfRecordsPerPage = 10;
    private authBuyerNameEdit = '';
    private isSearch: boolean = false;

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

    ngOnInit() {
        try {
            this.fieldStatus['mainDiv'].disable = false;
            this.fieldStatus['mainPls'].disable = false;
            //this.getBuyerAuthCode();
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }
    }

    onNewBuyerAuth() {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES065, this.msgs);
        this.buyerAuth = new BuyerAuth();
        this.addmsgs = [];
        this.fieldStatus['addBuyerAuth'].valid = true;
        this.isNewBuyerAuth = true;
    }

    onBuyerAuthKeyUp() {
        let authBuyerId = (this.buyerAuth.authBuyerId).replace(/\s+/g, '');
        this.buyerAuth.authBuyerId = this._commonValidation.formatNumeric(authBuyerId);
        if (this.buyerAuth.authBuyerId.length === 2) {
            this.fieldStatus['addBuyerAuth'].loading = true;
            this.validateBuyerAuthCode();
        } else {
            this.fieldStatus['BuyerAuthScr']['saveEnabled'] = false;
        }
    }

    onSearchBuyerAuthKeyUp() {
        let authBuyerId = (this.authBuyerIdLookup).replace(/\s+/g, '');
        this.authBuyerIdLookup = this._commonValidation.formatNumeric(authBuyerId);
    }

    onBuyerNameKeyUp() {
        let authBuyerName = this.buyerAuth.authBuyerName;
        if (CommonUtils.hasText(authBuyerName)) {
            if (CommonUtils.hasText(this.buyerAuth.authBuyerId)) {
                this.toggleSubmitButton();
            }
        } else {
            this.fieldStatus['BuyerAuthScr']['saveEnabled'] = false;
        }
    }
    newBuyerAuthSave() {
        if (this.revisitValidation()) {
            var req;
            if (this.isEditBuyerAuth) {
                if (CommonUtils.hasText(this.authBuyerNameEdit)) {
                    var editReq = this.createEditRequestObj();
                    req = JSON.parse(editReq);
                }
            }
            if (this.isNewBuyerAuth) {
                var addReq = this.createAddRequestObj();
                req = JSON.parse(addReq);
            }
            if (req !== undefined && req !== '') {
                this._waitSpinnerService.showWait();
                let uri = '/v1/data/item-master-data/api/sync/buyerAuth'
                try {
                    this._webServiceComm.httpPost(uri, req).subscribe(resp => {
                        this._waitSpinnerService.hideWait();
                        if (this.isEditBuyerAuth) {
                            this.isEditBuyerAuth = false;
                            this.successMsgs.push({ severity: 'success', summary: 'Buyer Auth successfully updated' });
                        }
                        if (this.isNewBuyerAuth) {
                            this.isNewBuyerAuth = false;
                            this.successMsgs.push({ severity: 'success', summary: 'Buyer Auth successfully added' });
                            this.authBuyerIdLookup = '';
                            this.buyerAuth = new BuyerAuth();
                            this.getBuyerAuthCode();
                        }
                        if (CommonUtils.hasText("" + this.authBuyerIdLookup)) {
                            this._alertMessageService.removeErrorMessage(ErrorMessage.ES063, this.msgs);
                            this._alertMessageService.removeErrorMessage(ErrorMessage.ES062, this.msgs);
                            let buyerId = (this.authBuyerIdLookup).replace(/\s+/g, '');
                            if (!!buyerId) {
                                this.isSearch = true;
                                this._waitSpinnerService.showWait();
                                this.callLookup('search', buyerId);
                            }
                        } else {
                            this.authBuyerIdLookup = '';
                            this.buyerAuth = new BuyerAuth();
                            this.getBuyerAuthCode();
                        }
                    }, err => {
                        if (CommonUtils.hasText('' + err.status)) {
                            this.isNewBuyerAuth = false;
                            this.isEditBuyerAuth = false;
                            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                            // this.getBuyerAuthCode();
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
                        this.authBuyerNameEdit = '';
                        this.fieldStatus['BuyerAuthScr']['saveEnabled'] = false;
                    });
                } catch (error) {
                    this._waitSpinnerService.hideWait();
                    this.msgs.push({ severity: 'error', summary: error });
                }
            }
        }
    }

    revisitValidation(): boolean {
        return true;
    }

    createAddRequestObj(): string {
        this.buyerAuth.createId = localStorage.getItem('loggedinid');
        this.buyerAuth.updateId = localStorage.getItem('loggedinid');
        this.buyerAuth.createTime = Date.now();
        this.buyerAuth.updateTime = Date.now();
        var jsonObj = this.emptyBuyerAuthData;
        jsonObj["authBuyerId"] = this.buyerAuth.authBuyerId;
        jsonObj["authBuyerName"] = this.buyerAuth.authBuyerName;
        jsonObj["createId"] = '' + this.buyerAuth.createId;
        jsonObj["createTime"] = +this.buyerAuth.createTime;
        jsonObj["updateId"] = '' + this.buyerAuth.updateId;
        jsonObj["updateTime"] = + this.buyerAuth.updateTime;
        return JSON.stringify(jsonObj);
    }
    createEditRequestObj(): string {
        this.buyerAuth.updateId = localStorage.getItem('loggedinid');
        this.buyerAuth.updateTime = Date.now();
        var jsonObj = this.emptyBuyerAuthData;
        jsonObj["authBuyerId"] = this.buyerAuth.authBuyerId;
        jsonObj["authBuyerName"] = this.authBuyerNameEdit;
        jsonObj["createId"] = '' + this.buyerAuth.createId;
        jsonObj["createTime"] = this.buyerAuth.createTime;
        jsonObj["updateId"] = '' + this.buyerAuth.updateId;
        jsonObj["updateTime"] = + this.buyerAuth.updateTime;
        return JSON.stringify(jsonObj);
    }


    validateBuyerAuthCode() {
        if (CommonUtils.hasText("" + this.buyerAuth.authBuyerId)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES061, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES065, this.msgs);
            let buyerId = (this.buyerAuth.authBuyerId).replace(/\s+/g, '');
            if (!!buyerId) {
                this._waitSpinnerService.showWait();
                this.callLookup('add', buyerId);
            }
        }
    }

    postAddLookup(res) {
        if (res.msg === 'record found') {
            this.fieldStatus['addBuyerAuth'].loading = false;
            this.fieldStatus['addBuyerAuth'].valid = false;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES061, this.addmsgs);
        }
        if (res.msg === 'record not found') {
            this.fieldStatus['addBuyerAuth'].loading = false;
            this.fieldStatus['addBuyerAuth'].valid = true;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES061, this.addmsgs);
        }
        if (res.msg === 'other error') {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.addmsgs);
            this.validateSub.next(false);
        }
        this._waitSpinnerService.hideWait();
        this.toggleSubmitButton();
    }

    _onEnterKey(event) {
        this.loadBuyerAuthLazy(event);
    }

    loadBuyerAuthLazy(event) {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES061, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES062, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        if (CommonUtils.hasNoText(this.authBuyerIdLookup)) {
            if (event.first === 0) {
                this.pageNo = 0;
                this.getBuyerAuthCode();
            } else {
                this.pageNo = event.first / this.noOfRecordsPerPage;
                this.getBuyerAuthCode();
            }
        }
        if (CommonUtils.hasText("" + this.authBuyerIdLookup)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES063, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES062, this.msgs);
            let buyerId = (this.authBuyerIdLookup).replace(/\s+/g, '');
            if (!!buyerId) {
                this.isSearch = true;
                this._waitSpinnerService.showWait();
                this.callLookup('search', buyerId);
            }
        }
    }

    getBuyerAuthCode() {
        this.isSearch = false;
        this._waitSpinnerService.showWait();
        this.BuyerAuthData = [];
        let uri = '/v1/data/item-master-data/buyerAuth?page=' + this.pageNo + '&size=' + this.noOfRecordsPerPage;
        try {
            this._webServiceComm.httpGet(uri).subscribe(resp => {
                this._waitSpinnerService.hideWait();
                for (let ii = 0; ii < resp._embedded.buyerAuth.length; ii++) {
                    this.buyerAuth = new BuyerAuth();
                    this.buyerAuth.authBuyerId = resp._embedded.buyerAuth[ii].authBuyerId;
                    this.buyerAuth.authBuyerName = resp._embedded.buyerAuth[ii].authBuyerName;
                    this.buyerAuth.createId = resp._embedded.buyerAuth[ii].createId;
                    this.buyerAuth.updateId = resp._embedded.buyerAuth[ii].updateId;
                    this.buyerAuth.createTime = resp._embedded.buyerAuth[ii].createTime;
                    this.buyerAuth.updateTime = resp._embedded.buyerAuth[ii].updateTime;
                    this.BuyerAuthData.push(this.buyerAuth);
                }
                this.pageNo = resp.page.number;
                this.totalRecords = +resp.page.totalElements;
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
                this.buyerAuth = new BuyerAuth();
            });
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }

    }

    onRowSelect(event) {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES061, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES062, this.msgs);
        this.buyerAuth.authBuyerId = event.data.authBuyerId;
        this.buyerAuth.authBuyerName = event.data.authBuyerName;
        this.buyerAuth.createTime = event.data.createTime;
        this.buyerAuth.updateTime = event.data.updateTime;
        this.buyerAuth.createId = event.data.createId;
        this.buyerAuth.updateId = event.data.updateId;
        this.authBuyerNameEdit = this.buyerAuth.authBuyerName;
        this.addmsgs = [];
        this.isEditBuyerAuth = true;
    }

    hideEditDialog() {
        this.isEditBuyerAuth = false;
    }

    clearData() {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES061, this.addmsgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.addmsgs);
        this.buyerAuth = new BuyerAuth();
        this.fieldStatus['addBuyerAuth'].valid = true;
        this.fieldStatus['BuyerAuthScr']['mandatory'] = true;
        this.addmsgs = [];
    }


    /* Starting the search functionality */
    _onSearch() {
        if (CommonUtils.hasText("" + this.authBuyerIdLookup)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES063, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES062, this.msgs);
            let buyerId = (this.authBuyerIdLookup).replace(/\s+/g, '');
            if (!!buyerId) {
                this.isSearch = true;
                this._waitSpinnerService.showWait();
                this.callLookup('search', buyerId);
            }
        }
        if (CommonUtils.hasNoText("" + this.authBuyerIdLookup)) {
            this.pageNo = 0;
            this.getBuyerAuthCode();
        }
    }
    postSearchLookup(resp) {
        if (resp.msg === 'record found') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES062, this.msgs);
            this.buyerAuth = new BuyerAuth();
            this.buyerAuth.authBuyerId = resp.res.authBuyerId;
            this.buyerAuth.authBuyerName = resp.res.authBuyerName;
            this.buyerAuth.createId = resp.res.createId;
            this.buyerAuth.updateId = resp.res.updateId;
            this.buyerAuth.createTime = resp.res.createTime;
            this.buyerAuth.updateTime = resp.res.updateTime;
            this.BuyerAuthData = [];
            this.BuyerAuthData.push(this.buyerAuth);
            this.totalRecords = 1;
            this._waitSpinnerService.hideWait();
        }
        if (resp.msg === 'record not found') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
            this.BuyerAuthData = [];
            this.totalRecords = 1;
            // this._alertMessageService.addErrorMessage(ErrorMessage.ES062, this.msgs);
            // this.getBuyerAuthCode();
            // this.authBuyerIdLookup = '';
            this._waitSpinnerService.hideWait();
            this.pageNo = 0;
        }
        if (resp.msg === 'other error') {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES062, this.msgs);
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this.authBuyerIdLookup = '';
            this.pageNo = 0;
            this.getBuyerAuthCode();
        }
    }
    onRefresh() {
        this.authBuyerIdLookup = '';
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES062, this.msgs);
        this.buyerAuth = new BuyerAuth();
        this.BuyerAuthData = [];
    }
    /**search functionality completed */

    callLookup(src, authBuyer) {
        let buyerAuthUri = "/v1/data/item-master-data/buyerAuth/" + authBuyer;
        this._webServiceComm.httpGet(buyerAuthUri).subscribe(res => {
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
    private toggleBuyerMandatory() {
        if (CommonUtils.hasText("" + this.buyerAuth.authBuyerId) && CommonUtils.hasText("" + this.buyerAuth.authBuyerName)) {
            this.fieldStatus['BuyerAuthScr']['mandatory'] = true;
        } else {
            this.fieldStatus['BuyerAuthScr']['mandatory'] = false;
        }
    }
    private toggleSubmitButton() {
        this.toggleBuyerMandatory();
        if (!this.fieldStatus['BuyerAuthScr']['mandatory']) {
            if (this.hasUiErrors([])) {
                this.fieldStatus['BuyerAuthScr']['saveEnabled'] = false;
            }
        } else {
            if (this.hasUiErrors([])) {
                this.fieldStatus['BuyerAuthScr']['saveEnabled'] = false;
            } else {
                this.fieldStatus['BuyerAuthScr']['saveEnabled'] = true;
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