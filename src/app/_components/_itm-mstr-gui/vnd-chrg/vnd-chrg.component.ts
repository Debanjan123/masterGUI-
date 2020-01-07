import {
    Component,
    ViewChildren
}  from '@angular/core';

import {
    DatePipe
} from '@angular/common';

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

import {
    DBMatch,
    Report,
    VendorChrgReport,
    VendorChrgUpload,
    VendorChrg,
    Upload,
    FieldMetadata,
    ErrorMessage,
    FullExtract
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
    GrowlModule
} from 'primeng/primeng';

import {
    ReportResponse
} from '../../../shared/dbMatch/reportResponse';

import {
    Router
} from '@angular/router';

@Component({
    templateUrl: './vnd-chrg.component.html'
})
export class VendorChargeComponent {

    componentTitleForVenChrg: string = 'Vendor Charge';
    private successMsgs = [];
    private msgs = [];
    private reportUri = '/v1/data/item-master-data/api/search/vendor-charges-extract/report?size=100'
    private _headers = new Headers({ 'Content-Type': 'application/json' });
    private _options = new RequestOptions({ headers: this._headers });
    private pendingRequest: ISubscription;
    private waitDivSearchSpinner: boolean = false;
    private waitPlsSearchSpinner: boolean = false;
    private reportDataDetails = [];
    private fullExtractDetails = [];
    private report: Report[] = [];
    private downLoadFiles = [];
    private isPaginator = false;
    private isFilter = false;
    private divSuggestions: any[];
    private plsSuggestions: any[];
    private selectedDiv;
    private selectedPls;
    private fromDiv;
    private toDiv;
    private fromPls;
    private toPls;
    private fromPart;
    private toPart;
    private limit;
    private fileReportYear;
    private rangeReportYear;
    //private reportYear: SelectItem[];
    private reportYear: any[] = [
        { Report_Years: 'CURRENT' },
        { Report_Years: 'CURRENT-1' },
        { Report_Years: 'CURRENT-2' },
        { Report_Years: 'CURRENT-3' },
    ];
    private jobStatus: SelectItem[];
    private jobType: SelectItem[];
    private dispalyRange;
    private displayFile;
    private isDisplayButton;
    private isreportByTypeCd = true;
    private values = [];
    private fromPartNo;
    private toPartNo;
    private jobScheduleDate;
    private fileSheduleDate;
    private LogedInUser;
    private isError: boolean = false;
    private isFileExist: boolean = false;
    private filesToUpload: File;
    private isOutputDisabled: boolean;
    private isErrorDisabled: boolean;
    private isRetryDisabled: boolean;
    private combinePart = '';
    private inputFileName = '';
    private jobTypeValue = '';
    private jobstatus = '';
    private inputFileNameLink = '';
    private itemMatchReportIdDispay = '';
    private onRetry = false;
    private retrySheduleDate;
    private messageSuccess = true;
    private fileLimit;
    private isSubmit = false;
    private isPlsError = false;
    private minDate = new Date();
    private defaultFromFocus = true;
    private defaultToFocus = true;
    private plsInconsistent = false;
    private partInconsistent = false;
    private isPartGreater = false;
    private fieldStatus = FieldMetadata.getFieldStatus();
    private reportYearDialogVisisble = false;
    private fullExtract = new FullExtract();
    private nextExtractDate = '';

    @ViewChildren("divfromselectelm") divfromselectelm;
    @ViewChildren('selectedFile') selectedTextFile;
    @ViewChildren("plsfromselectelm") plsfromselectelm;
    @ViewChildren("focusFromPart") focusFromPart;
    @ViewChildren("divtoselectelm") divtoselectelm;
    @ViewChildren("plstoselectelm") plstoselectelm;
    @ViewChildren("focusToPart") focusToPart;

    constructor(private _http: Http,
        private _router: Router,
        private _localStorageService: LocalStorageService,
        private _alertMessageService: AlertMessageService,
        private _waitSpinnerService: WaitSpinnerService,
        private confirmationService: ConfirmationService,
        private _webServiceComm: WebServiceComm,
        private _commonValidation: CommonValidation
    ) { }

    ngOnInit() {
        this.msgs = [];
        this.fromDiv = '';
        this.fromPls = '';
        this.fromPart = '';
        this.fromPartNo = '';
        this.toDiv = '';
        this.toPls = '';
        this.toPart = '';
        this.toPartNo = '';
        this.fileLimit = '';
        this.limit = '';
        this.onRetry = false;
        this.rangeReportYear = 'CURRENT';
        this.fileReportYear = 'CURRENT';
        this.LogedInUser = localStorage.getItem('loggedinid');
        this.jobStatus = [];
        this.jobStatus.push({ label: 'N', value: 'New' });
        this.jobStatus.push({ label: 'C', value: 'Cancelled' });
        this.jobStatus.push({ label: 'D', value: 'Dummy' });
        this.jobStatus.push({ label: 'F', value: 'Failed' });
        this.jobStatus.push({ label: 'R', value: 'Retry' });
        this.jobStatus.push({ label: 'P', value: 'Processed' });
        this.jobType = [];
        this.jobType.push({ label: 'F', value: 'File' });
        this.jobType.push({ label: 'R', value: 'Range' });
        this._getJobScheduleHistory();
        this._getFullExtractReport();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.divfromselectelm.first.el.nativeElement.children[0].children[0].select();
        }, 1);
    }

    refrashJobScheduleHistory() {
        this._getJobScheduleHistory();
    }

    private _getJobScheduleHistory() {
        this._waitSpinnerService.showWait();
        this._webServiceComm.httpGet(this.reportUri).subscribe(resp => {
            if (resp && resp.content && resp.content.length > 0) {
                this.reportDataDetails = resp.content;
                for (var i = 0; i < this.reportDataDetails.length; i++) {
                    this.report[i] = this.reportDataDetails[i];
                    if (this.reportDataDetails && typeof this.reportDataDetails[i].toPart == 'undefined') {
                        this.reportDataDetails[i].toPart = "";
                    }

                    if (this.reportDataDetails[i].reportByTypeCd == this.jobType[1].label) {

                    } else {
                        this.inputFileName = this.reportDataDetails[i].inputFileName;
                    }
                }
                if (resp.content.length > 10) {
                    this.isPaginator = true;
                }
            }
        }, err => {
            this.reportDataDetails = [];
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
        }, () => {
            this._waitSpinnerService.hideWait();
        });

    }

    private _getFullExtractReport() {
        this._waitSpinnerService.showWait();
        let fullReportUri = '/api/vendor-charges-extract/full-extract-reports ';
        this._webServiceComm.httpGet(fullReportUri).subscribe(resp => {
            if (resp.vendorExtractFileList && resp.vendorExtractFileList.length > 0) {
                for (let ii = 0; ii < resp.vendorExtractFileList.length; ii++) {
                    this.fullExtract.reportYear = resp.vendorExtractFileList[ii].reportYear;
                    this.fullExtract.fileName = resp.vendorExtractFileList[ii].fileName;
                    this.fullExtract.lastModifiedTs = resp.vendorExtractFileList[ii].lastModifiedTs;
                    this.fullExtract.fileSizeInKb = resp.vendorExtractFileList[ii].fileSizeInKb;
                    this.fullExtract.downloadUrl = resp.vendorExtractFileList[ii].downloadUrl;
                    this.fullExtractDetails.push(this.fullExtract);
                    this.fullExtract = new FullExtract();
                }
                if (resp.length > 10) {
                    this.isPaginator = true;
                }

            }
            if (resp.nextExtractDate != undefined) {
                this.nextExtractDate = resp.nextExtractDate;
            }
        }, err => {
            this.fullExtractDetails = [];
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
        }, () => {
            this._waitSpinnerService.hideWait();
        });

    }

    downloadExtract(item) {
        if (item !== undefined) {
            window.open(item);
            this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'Output File successfully downloaded.' });
        }
    }

    inputClick(item) {
        this.msgs = [];
        if (item && typeof item.inputFileName != 'undefined') {
            let linkUri = '/api/vendor-charges-extract/report/link/' + item.vendorChargesReportId;
            this._waitSpinnerService.showWait();
            this._webServiceComm.httpGet(linkUri).subscribe(res => {
                if (res.inputFileLink) {
                    this.inputFileNameLink = res.inputFileLink;
                    window.open(res.inputFileLink);
                    this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'Input File successfully downloaded.' });
                }
            }, err => {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                this._waitSpinnerService.hideWait();
            }, () => {
                this._waitSpinnerService.hideWait();
            });
        }
    }

    onLimitKeyUp(event) {
        if (event.keyCode == 48 || event.keyCode == 49 || event.keyCode == 50
            || event.keyCode == 51 || event.keyCode == 52 || event.keyCode == 53 || event.keyCode == 54
            || event.keyCode == 55 || event.keyCode == 56 || event.keyCode == 57) {

        } else {
            this.limit = '';
            this.fileLimit = '';
        }

        if (this.fileLimit > 200000 || this.limit > 200000) {
            this.msgs = [];
            this.isError = true;
            this.msgs.push({ severity: 'error', summary: 'Error Message', detail: 'Limit should not be more than 200,000' });
            return;
        }
    }

    onFromDivKeyUp(event) {
        let inputDiv = this.fromDiv;
        inputDiv = inputDiv.replace(/(\s+|\.)/g, '');
        this.fromDiv = this._commonValidation.formatNumeric(inputDiv);
    }

    onBlurFromDiv(event) {
        if (this.fromDiv && !!this.fromDiv) {
            while (this.fromDiv.length < 2) {
                this.fromDiv = '0' + this.fromDiv;
            }
        }
    }

    onToDivKeyUp(event) {
        let inputDiv = this.toDiv;
        inputDiv = inputDiv.replace(/(\s+|\.)/g, '');
        this.toDiv = this._commonValidation.formatNumeric(inputDiv);
    }

    onBlurToDiv(event) {
        if (this.toDiv && !!this.toDiv) {
            while (this.toDiv.length < 2) {
                this.toDiv = '0' + this.toDiv;
            }
        }
    }

    onFromPlsKeyUp(event) {
        let inputPls = this.fromPls;
        inputPls = inputPls.replace(/(\s+|\.)/g, '');
        this.fromPls = this._commonValidation.formatNumeric(inputPls);
    }

    onBlurFromPls(event) {
        if (this.fromPls && !!this.fromPls) {
            while (this.fromPls.length < 3) {
                this.fromPls = '0' + this.fromPls;
            }
        }
    }

    onToPlsKeyUp(event) {
        let inputPls = this.toPls;
        inputPls = inputPls.replace(/(\s+|\.)/g, '');
        this.toPls = this._commonValidation.formatNumeric(inputPls);
    }

    onBlurToPls(event) {
        if (this.toPls && !!this.toPls) {
            while (this.toPls.length < 3) {
                this.toPls = '0' + this.toPls;
            }
        }
    }

    addFromPart(event) {
        let partNo = '' + this.fromPart;
        while (!CommonUtils.matchesPattern(partNo, '[A-Za-z0-9./-]+') && partNo !== '') {
            partNo = partNo.slice(0, -1);
        }
        this.fromPart = partNo;
        if (CommonUtils.hasText(partNo)) {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES007, this.msgs);
            this.fieldStatus['fromPartNo'].valid = true;
        }
    }

    addToPart(event) {
        let partNo = '' + this.toPart;
        while (!CommonUtils.matchesPattern(partNo, '[A-Za-z0-9./-]+') && partNo !== '') {
            partNo = partNo.slice(0, -1);
        }
        this.toPart = partNo;
    }

    _cleanPart() {
        this.fromDiv = "";
        this.fromPart = "";
        this.fromPls = "";
        this.toDiv = "";
        this.toPls = "";
        this.toPart = "";
        this.limit = "";
        this.jobScheduleDate = "";
        this.fileLimit = "";
        this.fileSheduleDate = "";
        this.isFileExist = false;
        this.rangeReportYear = 'CURRENT';
        this.fileReportYear = 'CURRENT';
    }

    _onRangeSubmit() {
        this.resetData();
        let reqObj = new VendorChrg();
        //let ESTStr = this._localStorageService.calcualteTimeToEST();
        let ESTStr = Date.now();
        reqObj.reportYear = this.checkReportYearValue(this.rangeReportYear);

        if (this.jobScheduleDate === null || this.jobScheduleDate === undefined || this.jobScheduleDate === "") {
            reqObj.scheduledTs = ESTStr;
        } else {
            reqObj.scheduledTs = this._getDateStr(this.jobScheduleDate);
        }

        if (this.limit === null || this.limit === undefined || this.limit === "") {
            reqObj.reportLimit = "200000";
        } else if (this.limit > 200000) {
            this.isError = true;
            this.msgs.push({ severity: 'error', summary: 'Error Message', detail: 'Limit should not be more than 200,000' });
            return;
        } else {
            reqObj.reportLimit = this.limit;
        }

        this.validateFromPart();
        this.validateToPart();

        if (this.hasUiErrors()) {
            return;
        }

        this.toPartNo = this.toDiv + this.toPls + this.toPart;
        this.fromPartNo = this.fromDiv + this.fromPls + this.fromPart;

        reqObj.reportByTypeCd = "R";
        reqObj.fromPart = this.fromPartNo;
        reqObj.toPart = this.toPartNo;
        reqObj.status = "N";
        reqObj.createdBy = this.LogedInUser;
        reqObj.createdTs = ESTStr;
        reqObj.updatedBy = this.LogedInUser;
        reqObj.updatedTs = ESTStr;
        let uri = '/v1/data/item-master-data/vendor-charges-report';
        this._waitSpinnerService.showWait();
        this.isSubmit = true;
        this._webServiceComm.httpPost(uri, reqObj).subscribe(resp => {
            this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'The Range submitted successfully' });
            this._getJobScheduleHistory();
            this._cleanPart();
        }, err => {
            this._cleanPart();
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this.isSubmit = false;
            this._waitSpinnerService.hideWait();
        }, () => {
            this.isSubmit = false;
            this._waitSpinnerService.hideWait();
        });
    }

    resetData() {
        this.msgs = [];
        this.isError = false;
        this.fieldStatus['fromDiv'].cssClass = "";
        this.fieldStatus['fromPls'].cssClass = "";
        this.fieldStatus['fromPartNo'].valid = true;
        this.fieldStatus['toDiv'].cssClass = "";
        this.fieldStatus['toPls'].cssClass = "";
        this.fieldStatus['toPartNo'].valid = true;
    }

    validateFromPart(): boolean {
        let valid: boolean = true;
        if (CommonUtils.hasText(this.fromPart)) {
            if (CommonUtils.hasNoText(this.fromPls)) {
                valid = false;
                this.fieldStatus['fromPls'].cssClass = "red-border";
                this._alertMessageService.addErrorMessage(ErrorMessage.ES006, this.msgs);
            }
            if (CommonUtils.hasNoText(this.fromDiv)) {
                valid = false;
                this.fieldStatus['fromDiv'].cssClass = "red-border";
                this._alertMessageService.addErrorMessage(ErrorMessage.ES005, this.msgs);
            }
        } else if (CommonUtils.hasNoText(this.fromDiv)) {
            valid = false;
            this.fieldStatus['fromDiv'].cssClass = "red-border";
            this._alertMessageService.addErrorMessage(ErrorMessage.ES005, this.msgs);
        }
        return valid;
    }

    validateToPart(): boolean {
        let valid: boolean = true;
        if (CommonUtils.hasText(this.toPart)) {
            if (CommonUtils.hasNoText(this.toPls)) {
                valid = false;
                this.fieldStatus['toPls'].cssClass = "red-border";
                this._alertMessageService.addErrorMessage(ErrorMessage.ES006, this.msgs);
            }
            if (CommonUtils.hasNoText(this.toDiv)) {
                valid = false;
                this.fieldStatus['toDiv'].cssClass = "red-border";
                this._alertMessageService.addErrorMessage(ErrorMessage.ES005, this.msgs);
            }
        } else if (CommonUtils.hasText(this.toPls)) {
            if (CommonUtils.hasNoText(this.toDiv)) {
                valid = false;
                this.fieldStatus['toDiv'].cssClass = "red-border";
                this._alertMessageService.addErrorMessage(ErrorMessage.ES005, this.msgs);
            }
        }
        return valid;
    }

    private _getDateStr(date: Date): string {
        let month = LocalStorageService.leftPad(('' + (date.getMonth() + 1)), 2);
        let day = LocalStorageService.leftPad(('' + date.getDate()), 2);
        let hour = LocalStorageService.leftPad(('' + date.getHours()), 2);
        let min = LocalStorageService.leftPad(('' + date.getMinutes()), 2);
        let sec = LocalStorageService.leftPad(('' + date.getSeconds()), 2);
        let dateStr = '' + date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
        return dateStr;
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
        if (!ignoreErrorMessages) {
            return false;
        }
        for (let ignoreError of ignoreErrorMessages) {
            if (ignoreError.code === errorCode) {
                return true;
            }
        }
        return false;
    }

    private _getUploadHeaderOptions(): RequestOptions {
        let userId = localStorage.getItem('loggedinid');
        let _headers = new Headers();
        let reportHeaders = new Headers(_headers);
        let token = localStorage.getItem('token');
        reportHeaders.append('userId', userId);
        reportHeaders.append('Authorization', token);
        reportHeaders.append('accept', "application/json");
        reportHeaders.append('clientId', "ItemMasterGUI");
        return new RequestOptions({ headers: reportHeaders });
    }

    retry(item) {
        this.msgs = [];
        let reqObj = new VendorChrgReport();
        reqObj = item;
        this._localStorageService.addItem("vendorChrgItem", JSON.stringify(reqObj));
        if (item.scheduledTs < this._getDateStr(new Date())) {
            this.onRetry = true;
        }
    }

    resubmit() {
        var retrievedObject = JSON.parse(this._localStorageService.getItem("vendorChrgItem"));
        retrievedObject.status = "R";
        if (this.retrySheduleDate === null || this.retrySheduleDate === undefined) {
            //let ESTStr = this._localStorageService.calcualteTimeToEST();
            let ESTStr = Date.now();
            retrievedObject.scheduledTs = ESTStr;
        } else {
            retrievedObject.scheduledTs = this._getDateStr(this.retrySheduleDate);
        }
        retrievedObject.updatedTs = this._getDateStr(new Date());
        let uri = '/v1/data/item-master-data/vendor-charges-report';
        this._waitSpinnerService.showWait();
        this._webServiceComm.httpPost(uri, retrievedObject).subscribe(resp => {
            this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'The record Resubmitted successfully' });
            this._getJobScheduleHistory();
            this.onRetry = false;
            this._waitSpinnerService.hideWait();
        }, err => {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
        }, () => {
            this._waitSpinnerService.hideWait();
        });
    }

    downloadOutput(item) {
        this.msgs = [];
        if (item && typeof item.vendorChargesReportId != 'undefined') {
            let linkUri = '/api/vendor-charges-extract/report/link/' + item.vendorChargesReportId;
            this._webServiceComm.httpGet(linkUri).subscribe(res => {
                if (res.outputReportLink) {
                    window.open(res.outputReportLink);
                    this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'Output File successfully downloaded.' });
                }
            }, err => {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            }, () => {

            });
        }
    }

    downloadReport(item) {
        this.msgs = [];
        if (item && typeof item.vendorChargesReportId != 'undefined') {
            let linkUri = '/api/vendor-charges-extract/report/link/' + item.vendorChargesReportId;
            this._webServiceComm.httpGet(linkUri).subscribe(res => {
                if (res.rejectionReportLink) {
                    window.open(res.rejectionReportLink);
                    this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'Error File successfully downloaded.' });
                }
            }, err => {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            }, () => {

            });
        }
    }

    cancel(item: VendorChrgReport) {
        this.msgs = [];
        this.confirmationService.confirm({
            message: 'Are you sure, you want to perform CANCEL for ' + 'REQ' + ("000000" + item.vendorChargesReportId).slice(-6) + '?',
            accept: () => {
                let reqObj = new VendorChrgReport();
                reqObj = item;
                reqObj.status = "C";
                let uri = '/v1/data/item-master-data/vendor-charges-report';
                this._waitSpinnerService.showWait();
                this._webServiceComm.httpPost(uri, reqObj).subscribe(resp => {
                    this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'The record cancelled successfully' });
                    this._getJobScheduleHistory();
                }, err => {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                    this._waitSpinnerService.hideWait();
                }, () => {
                    this._waitSpinnerService.hideWait();
                });
            }
        });
    }

    fileChangeEvent(fileInput: any) {
        this.msgs = [];
        this.isFileExist = true;
        this.filesToUpload = <File>fileInput.target.files;
        let file: File = this.filesToUpload[0];
        if (!file) {
            this.isFileExist = false;
            return false;
        }
        if (file && file.type != "text/plain") {
            this.msgs.push({ severity: 'error', summary: 'Error Message', detail: 'File type should be TEXT !!! ' });
            this.isFileExist = false;
        }
        var fileSize = file.size;
        if (! this._commonValidation.validateFileSize(fileSize)) {
            // this.msgs.push({ severity: 'error', summary: 'Error Message', detail: ErrorMessage.ES051 });
            this._alertMessageService.addErrorMessage(ErrorMessage.ES051, this.msgs);
            return false;
        }
    }

    upload() {
        this.msgs = [];
        this._waitSpinnerService.showWait();
        var uploadResponse = new VendorChrgUpload();
        let formData: FormData = new FormData();
        formData.append('file', this.filesToUpload[0], this.filesToUpload[0].name);
        let uri = '/api/vendor-charges-extract/report/file/upload'
        this._http.post(this._webServiceComm._resolveUrl(uri), formData, this._getUploadHeaderOptions())
            .map(res => res.json())
            .catch(error => Observable.throw(error))
            .subscribe(
            data => {
                uploadResponse.inputFileName = data.inputFileName;
                uploadResponse.systemInputFileName = data.systemInputFileName;
                uploadResponse.status = "N";
                uploadResponse.createdBy = data.createdBy;
                uploadResponse.createdTs = data.createdTs;
                uploadResponse.updatedBy = data.updatedBy;
                uploadResponse.updatedTs = data.updatedTs;
                uploadResponse.reportByTypeCd = data.reportByTypeCd;
                uploadResponse.vendorChargesReportId = data.vendorChargesReportId;
                uploadResponse.reportYear = this.checkReportYearValue(this.fileReportYear);
                this.fileUpload(uploadResponse);
                this._waitSpinnerService.hideWait();
            },
            error => {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                this._waitSpinnerService.hideWait();
            }
            )
    }

    private fileUpload(retrievedObject) {
        if (this.fileSheduleDate === null || this.fileSheduleDate === undefined || this.fileSheduleDate === "") {
            //let ESTStr = this._localStorageService.calcualteTimeToEST();
            let ESTStr = Date.now();
            retrievedObject.scheduledTs = ESTStr;
        } else {
            retrievedObject.scheduledTs = this._getDateStr(this.fileSheduleDate);
        }
        if (this.fileLimit === null || this.fileLimit === undefined || this.fileLimit === "") {
            retrievedObject.reportLimit = "200000";
        } else if (this.fileLimit > 200000) {
            this.isError = true;
            this.msgs.push({ severity: 'error', summary: 'Error Message', detail: 'Limit should not be more than 200,000' });
            return;
        } else {
            retrievedObject.reportLimit = this.fileLimit;
        }

        let uploaddatauri = '/api/vendor-charges-extract/report/file/uploadData'
        this._webServiceComm.httpPost(uploaddatauri, retrievedObject).subscribe(resp => {
            if (resp) {
                this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'File successfully uploaded' });
                this._getJobScheduleHistory();
            }
        }, err => {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
        }, () => {
            this._cleanPart();
        });
    }
    onReportYearLookup() {
        this.reportYearDialogVisisble = true;
    }

    onReportYearSelect(event) {
        this.rangeReportYear = event.data.Report_Years;
        this.fileReportYear = event.data.Report_Years;
        this.reportYearDialogVisisble = false;
    }

    checkReportYearValue(reportYear): string {
        if (reportYear === null || this.rangeReportYear === undefined) {
            return "0";
        } else {
            if (reportYear === 'CURRENT') {
                return "0";
            } else if (reportYear === 'CURRENT-1') {
                return "-1";
            } else if (reportYear === 'CURRENT-2') {
                return "-2";
            } else if (reportYear === 'CURRENT-3') {
                return "-3";
            }

        }
    }


}