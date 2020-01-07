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
    DataTable,
    ConfirmationService
} from 'primeng/primeng';

import {
    Subject
} from 'rxjs/Rx';

import {
    HsCalendar,
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
    templateUrl: './hsCalendar.component.html'
})
export class HsCalendarComponent {

    componentTitle: string = 'HsCalendar';
    private selectedHsCalendar: Array<{ label: number, value: number }>;
    private selectCalCd: any[] = [
        { label: 'Effective Date', value: 'EFF' },
        { label: 'End-Of-Cycle date', value: 'EOC' }
    ];
    private selectCalendar: string;
    private selectedCd: string = 'EFF';
    private isNewHsCalendar = false;
    private isEditHsCalendar = false;
    private componentIdUri = '/v1/data/item-master-data/hsCalendar?size=10';
    private componentId;
    private emptyHsCalendarData = {
        'hsCalendarId': '',
        'hsCalDate': '',
        'hsCalendarDateTypeCode': '',
        'calCode': '',
        'updateId': '',
        'updateTime': '',
        'createId': '',
        'createTime': '',
        '_links': {
            'self': {
                'href': ''
            },
            'hsCalendar': {
                'href': ''
            }
        }
    };
    private jsonObj = {};
    private hsCalendarData = [];
    private userLdap;
    private userId;
    private fieldStatus = FieldMetadata.getFieldStatus();
    private hsCalendar = new HsCalendar();
    private isEditActive: boolean;
    private isEditUsed: boolean;
    private isAddActive: boolean = false;
    private isAddUsed: boolean = false;
    private addmsgs = [];
    private successMsgs = [];
    private msgs = [];
    private warnMsgs = [];
    private validateSub = new Subject();
    private pageNo = 0;
    private totalRecords = 0;
    private addNewCalDate: Date;
    private editCalDate: Date;
    private prevCalDate: Date;
    private prevSelectedCd: string;
    private todayDate: Date = new Date();
    private yearRange: string = new Date().getFullYear() + ':' + (new Date().getFullYear() + 5);
    private isDialog = false;

    @ViewChildren("HsCalendarCdElm") HsCalendarCdElm;
    @ViewChildren("calendarDatatable") CalendarDatatable: DataTable;

    constructor(private _webServiceComm: WebServiceComm,
        private _waitSpinnerService: WaitSpinnerService,
        private _commonValidation: CommonValidation,
        private _alertMessageService: AlertMessageService,
        private confirmationService: ConfirmationService) {
    }
    ngOnInit() {
        try {
            this.fetchCalendarList();
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }
    }

    fetchCalendarList() {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._waitSpinnerService.showWait();
        this.selectedHsCalendar = [];
        let uri = '/v1/data/item-master-data/api/search/findAllUniqueCalDate?size=5';
        try {
            this._webServiceComm.httpGet(uri).subscribe(response => {
                for (let i = 0, len = response.length; i < len; i++) {
                    this.selectedHsCalendar.push({ label: response[i], value: response[i] });
                }
                if (response.indexOf((new Date()).getFullYear()) !== -1) {
                    this.selectCalendar = '' + (new Date()).getFullYear();
                } else {
                    this.selectCalendar = '' + this.selectedHsCalendar[0].value;
                }
                this.getHsCalendar();
            }, err => {
                if (err.status == 500) {
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

    selectCalToDelete(cal: HsCalendar) {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to DELETE ' + cal.hsCalDate + ' ' + cal.hsCalendarDateTypeCode + ' record?',
            accept: () => {
                this.deleteCalRecord(cal.hsCalendarId);
            }
        });
    }

    deleteCalRecord(calId) {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        this._waitSpinnerService.showWait();
        let uri = '/v1/data/item-master-data/hsCalendar/' + calId
        try {
            this._webServiceComm.httpDelete(uri).subscribe(resp => {
                this._waitSpinnerService.hideWait();
                this.successMsgs.push({ severity: 'success', summary: 'HsCalendar Code successfully Deleted' });
                this.getHsCalendar();
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
            }, () => { });
        } catch (error) {
            this._waitSpinnerService.hideWait();
            this.msgs.push({ severity: 'error', summary: error });
        }
    }
    onNewHsCalendar() {
        this.addNewCalDate = new Date();
        this.hsCalendar = new HsCalendar();
        this.addmsgs = [];
        this.isNewHsCalendar = true;
    }

    newHsCalendarSave() {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        if (this.revisitValidation()) {
            if (this.isNewHsCalendar) {
                this.createAddRequestObj();
            }
            this._waitSpinnerService.showWait();
            let uri = '/v1/data/item-master-data/hsCalendar'
            try {
                this._webServiceComm.httpPost(uri, this.hsCalendar).subscribe(resp => {
                    this._waitSpinnerService.hideWait();
                    this.isNewHsCalendar = false;
                    this.successMsgs.push({ severity: 'success', summary: 'HsCalendar successfully added' });
                    this.hsCalendar = new HsCalendar();
                    this.fetchCalendarList();
                }, err => {
                    if (CommonUtils.hasText('' + err.status)) {
                        this.isNewHsCalendar = false;
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

    revisitValidation(): boolean {
        if (CommonUtils.hasText('' + this.addNewCalDate.getDate)) {
            this.fieldStatus['hsCalendarCalDate'].valid = false;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES047, this.addmsgs);
            return true;
        } else {
            this.fieldStatus['hsCalendarCalDate'].valid = false;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES047, this.addmsgs);
            return false;
        }
    }

    createAddRequestObj() {
        var month = (this.addNewCalDate.getMonth() + 1).toString().length === 1 ? '0' + (this.addNewCalDate.getMonth() + 1) : (this.addNewCalDate.getMonth() + 1)
        var date = this.addNewCalDate.getDate().toString().length === 1 ? '0' + this.addNewCalDate.getDate() : this.addNewCalDate.getDate();
        this.hsCalendar.hsCalDate = this.addNewCalDate.getFullYear() + '-' + month + '-' + date;
        this.hsCalendar.hsCalendarDateTypeCode = this.selectedCd;
        this.hsCalendar.createId = localStorage.getItem('loggedinid');
        this.hsCalendar.updateId = localStorage.getItem('loggedinid');
        this.hsCalendar.createTime = Date.now();
        this.hsCalendar.updateTime = Date.now();
    }

    editHsCalendar() {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        if (this.revisitEditValidation()) {
            if (this.isEditHsCalendar) {
                this.createEditRequestObj();
            }
            this._waitSpinnerService.showWait();
            let uri = '/v1/data/item-master-data/hsCalendar'
            try {
                this._webServiceComm.httpPost(uri, this.hsCalendar).subscribe(resp => {
                    this._waitSpinnerService.hideWait();
                    this.isEditHsCalendar = false;
                    this.successMsgs.push({ severity: 'success', summary: 'HsCalendar successfully modified' });
                    this.hsCalendar = new HsCalendar();
                    this.fetchCalendarList();
                }, err => {
                    if (CommonUtils.hasText('' + err.status)) {
                        this.isEditHsCalendar = false;
                        this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                    }
                    else {
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

    revisitEditValidation(): boolean {
        if (this.prevCalDate === this.editCalDate && this.prevSelectedCd === this.selectedCd) {
            return false;
        } else {
            return true;
        }
    }
    onClickSave() {
        if (this.isEditHsCalendar) {
            this.createEditRequestObj();
            if (this.revisitEditValidation())
                this.validateCalDtCalCd('EDIT');
        }
        if (this.isNewHsCalendar) {
            this.createAddRequestObj();
            this.validateCalDtCalCd('ADD');
        }
    }

    validateCalDtCalCd(flow) {
        var isAbsent;
        this._waitSpinnerService.showWait();
        let uri = '/v1/data/item-master-data/hsCalendar/search/findByHsCalDateAndHsCalendarDateTypeCode?hsCalDate=' + this.hsCalendar.hsCalDate + '&hsCalendarDateTypeCode=' + this.hsCalendar.hsCalendarDateTypeCode;
        try {
            this._webServiceComm.httpGet(uri).subscribe(resp => {
                this._waitSpinnerService.hideWait();
                if (CommonUtils.hasText('' + resp.hsCalendarId)) {
                    isAbsent = false;
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES048, this.addmsgs);
                }
            }, err => {
                if (CommonUtils.hasText('' + err.status)) {
                    if (JSON.stringify(err).indexOf('Resource not found')) {
                        isAbsent = true;
                        this._alertMessageService.removeErrorMessage(ErrorMessage.ES048, this.addmsgs);
                        if (flow.indexOf('ADD') !== -1) {
                            this.newHsCalendarSave();
                        } else {
                            this.editHsCalendar();
                        }
                    } else {
                        isAbsent = false;
                        this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                    }
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
            }, () => { });
        } catch (error) {
            this._waitSpinnerService.hideWait();
            this.msgs.push({ severity: 'error', summary: error });
        }
    }

    createEditRequestObj() {
        var month = (this.editCalDate.getMonth() + 1).toString().length === 1 ? '0' + (this.editCalDate.getMonth() + 1) : (this.editCalDate.getMonth() + 1)
        var date = this.editCalDate.getDate().toString().length === 1 ? '0' + this.editCalDate.getDate() : this.editCalDate.getDate();
        this.hsCalendar.hsCalDate = this.editCalDate.getFullYear() + '-' + month + '-' + date;
        this.hsCalendar.hsCalendarDateTypeCode = this.selectedCd;
        this.hsCalendar.updateId = localStorage.getItem('loggedinid');
        this.hsCalendar.updateTime = Date.now();
    }
    onYearDropDownChange() {
        this.pageNo = 0;
        this.hsCalendarData = [];
        this.getHsCalendar();
    }
    getHsCalendar() {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        if (this.selectCalendar !== undefined) {
            this._waitSpinnerService.showWait();
            this.hsCalendarData = [];
            let uri = '/v1/data/item-master-data/hsCalendar/search/findByHsCalYear?year=' + this.selectCalendar + '&sort=hsCalDate,desc&page=' + this.pageNo + '&size=10';
            try {
                this._webServiceComm.httpGet(uri).subscribe(resp => {
                    var calData = JSON.parse(JSON.stringify(this.emptyHsCalendarData));
                    for (let i = 0, len = resp._embedded.hsCalendar.length; i < len; i++) {
                        calData = resp._embedded.hsCalendar[i];
                        if (calData.hsCalendarDateTypeCode === 'EOC') {
                            calData.calCode = 'End-Of-Cycle date';
                        } else {
                            calData.calCode = 'Effective date';
                        }
                        this.hsCalendarData.push(calData);
                    }
                    this.pageNo = resp.page.number;
                    this.totalRecords = +resp.page.totalElements;
                    this._waitSpinnerService.hideWait();
                }, err => {
                    if (err.status == 500) {
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
        } else {
            return;
        }
    }

    loadCalendarLazy(event) {
        if (event.first === 0) {
            this.pageNo = 0;
            this.getHsCalendar();
        } else if (event.first == 10) {
            this.pageNo = 1;
            this.getHsCalendar();
        } else if (event.first == 20) {
            this.pageNo = 2;
            this.getHsCalendar();
        }
    }
    onRowSelect(event) {
        this.isDialog = false;
        this.prevCalDate = new Date();
        this.prevSelectedCd = '';
        this.hsCalendar.hsCalDate = event.data.hsCalDate;
        this.editCalDate = new Date();
        this.editCalDate.setFullYear(+this.hsCalendar.hsCalDate.substring(0, 4));
        this.editCalDate.setMonth((this.hsCalendar.hsCalDate.substring(5, 7)).charAt(0) === '0' ? +this.hsCalendar.hsCalDate.substring(6, 7) - 1 : +this.hsCalendar.hsCalDate.substring(5, 7) - 1);
        this.editCalDate.setDate((this.hsCalendar.hsCalDate.substring(9)).charAt(0) === '0' ? +this.hsCalendar.hsCalDate.substring(9) : +this.hsCalendar.hsCalDate.substring(8));
        if (this.editCalDate >= new Date()) {
            this.hsCalendar.hsCalendarId = event.data.hsCalendarId;
            this.hsCalendar.hsCalendarDateTypeCode = event.data.hsCalendarDateTypeCode;
            this.hsCalendar.createTime = event.data.createTime;
            this.hsCalendar.updateTime = event.data.updateTime;
            this.hsCalendar.createId = event.data.createId;
            this.hsCalendar.updateId = event.data.updateId;
            this.selectedCd = '' + this.hsCalendar.hsCalendarDateTypeCode;
            this.prevCalDate = this.editCalDate;
            this.prevSelectedCd = this.selectedCd;
            this.addmsgs = [];
            this.isEditHsCalendar = true;
        } else {
            this.isDialog = true;
        }
    }


    hideEditDialog() {
        this.isEditHsCalendar = false;
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
        this.hsCalendar = new HsCalendar();
        this.addmsgs = [];
        this.isEditHsCalendar = false;
        this.isNewHsCalendar = false;
    }

    clickOk() { this.isDialog = false; }
}