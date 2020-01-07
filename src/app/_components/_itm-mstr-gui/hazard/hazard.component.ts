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
    Hazard,
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
    templateUrl: './hazard.component.html'
})
export class HazardComponent {

    componentTitle: string = 'Hazard';
    private selectedHazard: string[];
    private isNewHazard = false;
    private componentIdUri = '/v1/data/item-master-data/hazard?size=10';
    private componentId;
    private emptyHazardData = {
        'hazardCd': '',
        'description': '',
        'activeStatus': '',
        'usedFlag': '',
        'createTime': '',
        'updateTime': '',
        'createId': '',
        'updateId': '',
        '_links': {
            'self': {
                'href': ''
            },
            'hazard': {
                'href': ''
            }
        }
    };
    private jsonObj = {};
    private hazardData = [];
    private userLdap;
    private userId;
    private fieldStatus = FieldMetadata.getFieldStatus();
    private hazard = new Hazard();
    private isEditActive: boolean;
    private isEditUsed: boolean;
    private isAddActive: boolean = false;
    private isAddUsed: boolean = false;
    private isEditHazard;
    private addmsgs = [];
    private successMsgs = [];
    private msgs = [];
    private warnMsgs = [];
    private validateSub = new Subject();

    @ViewChildren("hazardCdElm") hazardCdElm;

    constructor(private _webServiceComm: WebServiceComm,
        private _waitSpinnerService: WaitSpinnerService,
        private _commonValidation: CommonValidation,
        private _alertMessageService: AlertMessageService) {
        this.validateSub.subscribe(resp => {
            if (resp === false) {
                this.toggleSubmitButton();
            }
            if (resp === true) {
                this.toggleSubmitButton();
            }
        }
        )
    }
    ngOnInit() {
        try {
            this.getHazardCode();
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }
    }

    onNewHazard() {
        this.hazard = new Hazard();
        this.addmsgs = [];
        this.fieldStatus['hazardScrCd'].valid = true;
        this.fieldStatus['hazardScrDesc'].valid = true;
        this.fieldStatus['hazardScr']['mandatory'] = false;
        this.fieldStatus['hazardScr']['saveEnabled'] = false;
        this.isNewHazard = true;
    }

    newHazardSave() {
        if (this.revisitValidation()) {
            if (!this.hasUiErrors([ErrorMessage.ES999])) {
                if (this.isEditHazard) {
                    this.createEditRequestObj();
                }
                if (this.isNewHazard) {
                    this.createAddRequestObj();
                }
                this._waitSpinnerService.showWait();
                let uri = '/v1/data/item-master-data/api/sync/hazard'
                try {
                    this._webServiceComm.httpPost(uri, this.hazard).subscribe(resp => {
                        this._waitSpinnerService.hideWait();
                        if (this.isEditHazard) {
                            this.isEditHazard = false;
                            this.successMsgs.push({ severity: 'success', summary: 'Hazard Code successfully updated' });
                        }
                        if (this.isNewHazard) {
                            this.isNewHazard = false;
                            this.successMsgs.push({ severity: 'success', summary: 'Hazard Code successfully added' });
                        }
                        this.hazard = new Hazard();
                        this.getHazardCode();
                    }, err => {
                        if (CommonUtils.hasText('' + err.status)) {
                            this.isNewHazard = false;
                            this.isEditHazard = false;
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
    }

    revisitValidation(): boolean {
        if (CommonUtils.hasText("" + this.hazard.hazardCd) && CommonUtils.hasText("" + this.hazard.description)) {
            return true;
        } else {
            return false;
        }
    }

    createAddRequestObj() {
        this.hazard.activeStatus = this.isAddActive ? 'A' : 'I';
        this.hazard.usedFlag = this.isAddUsed ? 'Y' : 'N';
        this.hazard.createId = localStorage.getItem('loggedinid');
        this.hazard.updateId = localStorage.getItem('loggedinid');
        this.hazard.createTime = Date.now();
        this.hazard.updateTime = Date.now();
    }
    createEditRequestObj() {
        this.hazard.activeStatus = this.isEditActive ? 'A' : 'I';
        this.hazard.usedFlag = this.isEditUsed ? 'Y' : 'N';
        this.hazard.updateId = localStorage.getItem('loggedinid');
        this.hazard.updateTime = Date.now();
    }

    onHazardKeyUp() {
        let hazardCd = this.hazard.hazardCd;
        hazardCd = hazardCd.replace(/(\s+|\.)/g, '');
        this.hazard.hazardCd = this._commonValidation.formatNumeric("" + hazardCd);
    }
    validateHazardCode() {
        if (CommonUtils.hasText("" + this.hazard.hazardCd)) {
            this._waitSpinnerService.showWait();
            this.fieldStatus['hazardScrCd'].loading = false;
            this.fieldStatus['hazardScrCd'].valid = true;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES045, this.addmsgs);
            let hazardCd = (this.hazard.hazardCd).replace(/\s+/g, '');
            if (!!hazardCd) {
                let HrzdCdUri = "/v1/data/item-master-data/hazard/" + hazardCd;
                this._webServiceComm.httpGet(HrzdCdUri).subscribe(res => {
                    this._waitSpinnerService.hideWait();
                    this.fieldStatus['hazardScrCd'].loading = false;
                    this.fieldStatus['hazardScrCd'].valid = false;
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES044, this.addmsgs);
                    this.validateSub.next(false);
                }, err => {
                    this._waitSpinnerService.hideWait();
                    if (err.status === 404) {
                        this.fieldStatus['hazardScrCd'].loading = false;
                        this.fieldStatus['hazardScrCd'].valid = true;
                        this._alertMessageService.removeErrorMessage(ErrorMessage.ES044, this.addmsgs);
                        this.validateSub.next(true);
                    } else {
                        this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.addmsgs);
                        this.validateSub.next(false);
                    }
                }, () => {
                    this._waitSpinnerService.hideWait();
                });
            }
        }
        if (CommonUtils.hasNoText("" + this.hazard.hazardCd)) {
            this.fieldStatus['hazardScrCd'].loading = false;
            this.fieldStatus['hazardScrCd'].valid = false;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES045, this.addmsgs);
        }
        this.toggleSubmitButton();
    }

    onDescKeyUp() {
        if (CommonUtils.hasNoText("" + this.hazard.description)) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES046, this.addmsgs);
            this.fieldStatus['hazardScrDesc'].valid = false;
        } else {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES046, this.addmsgs);
            this.fieldStatus['hazardScrDesc'].valid = true;
        }
        this.toggleSubmitButton();
    }

    getHazardCode() {
        this._waitSpinnerService.showWait();
        this.hazardData = [];
        let uri = '/v1/data/item-master-data/hazard?size=100';
        try {
            this._webServiceComm.httpGet(uri).subscribe(resp => {
                this._waitSpinnerService.hideWait();
                for (let ii = 0; ii < resp._embedded.hazard.length; ii++) {
                    var jsonstr = JSON.stringify(this.emptyHazardData);
                    this.jsonObj = JSON.parse(jsonstr);
                    this.jsonObj["hazardCd"] = resp._embedded.hazard[ii].hazardCd;
                    this.jsonObj["description"] = resp._embedded.hazard[ii].description;
                    this.jsonObj["activeStatus"] = this.getActiveStatus(resp._embedded.hazard[ii].activeStatus);
                    this.jsonObj["usedFlag"] = this.getUsedFlag(resp._embedded.hazard[ii].usedFlag);
                    this.jsonObj["createTime"] = resp._embedded.hazard[ii].createTime;
                    this.jsonObj["updateTime"] = resp._embedded.hazard[ii].updateTime;
                    this.jsonObj["createId"] = resp._embedded.hazard[ii].createId;
                    this.jsonObj["updateId"] = resp._embedded.hazard[ii].updateId;
                    this.hazardData.push(this.jsonObj);
                }
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

    onRowSelect(event) {
        this.hazard.hazardCd = event.data.hazardCd;
        this.hazard.description = event.data.description;
        this.isEditActive = event.data.activeStatus === 'YES' ? true : false;
        this.isEditUsed = event.data.usedFlag === 'YES' ? true : false;
        this.hazard.activeStatus = this.isEditActive === true ? 'A' : 'I';
        this.hazard.usedFlag = this.isEditUsed === true ? 'Y' : 'N';
        this.hazard.createTime = event.data.createTime;
        this.hazard.updateTime = event.data.updateTime;
        this.hazard.createId = event.data.createId;
        this.hazard.updateId = event.data.updateId;
        this.fieldStatus['hazardScrDesc'].valid = true;
        this.addmsgs = [];
        this.isEditHazard = true;
    }

    onChangeSwitch() {
        this.toggleSubmitButton();
    }
    hideEditDialog() {
        this.isEditHazard = false;
    }
    getActiveStatus(active): string {
        if (active === 'I') {
            return "NO";
        }
        if (active === 'A') {
            return "YES";
        }
    }

    getUsedFlag(used): string {
        if (used === 'N') {
            return "NO";
        }
        if (used === 'Y') {
            return "YES";
        }
    }

    clearData() {
        this.hazard = new Hazard();
        this.isAddActive = false;
        this.isAddUsed = false;
        this.fieldStatus['hazardScrCd'].valid = true;
        this.fieldStatus['hazardScrDesc'].valid = true;
        this.addmsgs = [];
    }

    /* Start - Toggle button control */
    private toggleHazardMandatory() {
        if (CommonUtils.hasText("" + this.hazard.hazardCd) && CommonUtils.hasText("" + this.hazard.description)) {
            this.fieldStatus['hazardScr']['mandatory'] = true;
        } else {
            this.fieldStatus['hazardScr']['mandatory'] = false;
        }
    }
    private toggleSubmitButton() {
        this.toggleHazardMandatory();
        if (!this.fieldStatus['hazardScr']['mandatory']) {
            if (this.hasUiErrors([])) {
                this.fieldStatus['hazardScr']['saveEnabled'] = false;
            }
        } else {
            if (this.hasUiErrors([])) {
                this.fieldStatus['hazardScr']['saveEnabled'] = false;
            } else {
                this.fieldStatus['hazardScr']['saveEnabled'] = true;
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