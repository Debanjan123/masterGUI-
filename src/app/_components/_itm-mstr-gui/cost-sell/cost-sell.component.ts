import {
    Component,
    ViewChildren
} from '@angular/core';

import {
    DatePipe
} from '@angular/common';

import {
    WebServiceComm,
    LocalStorageService,
    AlertMessageService,
    WaitSpinnerService,
    CommonUtils,
    CommonValidation
} from '../../../_services/common/index';

import {
    Content
} from '../../../shared/dbMatch/content';

import {
    Report,
    FieldMetadata,
    ErrorMessage,
    CostSellUpload
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
    templateUrl: './cost-sell.component.html'
})

export class CostSellComponent {

    componentTitle: string = 'Cost Sell';
    private successMsgs = [];
    private msgs = [];
    private reportUri = '/v1/data/item-master-data/api/search/cost-sell-extract/report?size=100'
    private _headers = new Headers({ 'Content-Type': 'application/json' });
    private _options = new RequestOptions({ headers: this._headers });
    private pendingRequest: ISubscription;
    private reportDataDetails = [];
    private report: Report[] = [];
    private downLoadFiles = [];
    private isPaginator = false;
    private isFilter = false;
    private jobStatus: SelectItem[];
    private fileTypes: SelectItem[];
    private displayFile;
    private isDisplayButton;
    private jobScheduleDate;
    private fileSheduleDate;
    private LogedInUser;
    private isError: boolean = false;
    private isFileExist: boolean = false;
    private filesToUpload: File;
    private isOutputDisabled: boolean;
    private isErrorDisabled: boolean;
    private isRetryDisabled: boolean;
    private inputFileName = '';
    private filetypeVal = '';
    private jobStatusVal = '';
    private inputFileNameLink = '';
    private itemMatchReportIdDispay = '';
    private onRetry = false;
    private retrySheduleDate;
    private messageSuccess = true;
    private isSubmit = false;
    private minDate = new Date();
    
    @ViewChildren('selectedFile') selectedTextFile;

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
        this.onRetry = false;
        this.LogedInUser = localStorage.getItem('loggedinid');
        this.jobStatus = [];
        this.jobStatus.push({ label: 'N', value: 'New' });
        this.jobStatus.push({ label: 'C', value: 'Cancelled' });
        this.jobStatus.push({ label: 'D', value: 'Dummy' });
        this.jobStatus.push({ label: 'F', value: 'Failed' });
        this.jobStatus.push({ label: 'R', value: 'Retry' });
        this.jobStatus.push({ label: 'P', value: 'Processed' });
        // this.jobStatus.push({ label: 'I', value: 'Invalid File' });
        this.fileTypes = [];
        this.fileTypes.push({ label: 'Select File Type' , value: null},
            { label: 'View Receipts' , value: 'VR'}, 
            { label: 'Credit Returns' , value: 'CR'},
            { label: 'DOMS View' , value: 'DV'},
            { label: 'Trans View' , value: 'TV'}
        );
        this._getJobScheduleHistory();
    }

    ngAfterViewInit() {
        
    }

    refreshJobScheduleHistory() {
        this.msgs = [];
        this._getJobScheduleHistory();
    }

    private _getJobScheduleHistory() {
        this._waitSpinnerService.showWait();
        this._webServiceComm.httpGet(this.reportUri).subscribe(resp => {
            if (resp && resp.content && resp.content.length > 0) {
                this.reportDataDetails = resp.content;
                for (var i = 0; i < this.reportDataDetails.length; i++) {
                    this.report[i] = this.reportDataDetails[i];
                    this.inputFileName = this.reportDataDetails[i].inputFileName;
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

    fileChangeEvent(fileInput: any) {
        this.msgs = [];
        this.isFileExist = true;
        this.filesToUpload = <File>fileInput.target.files;
        let file: File = this.filesToUpload[0];
        if (!file) {
            this.isFileExist = false;
            return false;
        }
        this.validateFile(file);
    }

    validateFile(file: any) {
        var fileName = file.name;
        var extn = fileName.substring(fileName.lastIndexOf(".") + 1);
        if (! (extn=='xls' || extn=='xlsx') ) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES066, this.msgs);
            this.isFileExist = false;
            return false;
        }
        if(fileName.length > 60) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES068, this.msgs);
            this.isFileExist = false;
            return false;
        }
        if (! this._commonValidation.validateFileSize(file.size)) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES051, this.msgs);
            this.isFileExist = false;
            return false;
        }
    }

    clearUpload() {
        this.msgs = [];
    }

    upload() {
        this.msgs = [];
        if (this.filetypeVal==null || this.filetypeVal=='') {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES067, this.msgs);
            this.isFileExist = false;
            return;
        }
        this._waitSpinnerService.showWait();
        var uploadResponse = new CostSellUpload();
        let formData: FormData = new FormData();
        formData.append('file', this.filesToUpload[0], this.filesToUpload[0].name);
        formData.append('fileType', this.filetypeVal);
        let uri = '/api/cost-sell/report/file/upload'
        this._http.post(this._webServiceComm._resolveUrl(uri), formData, CommonUtils._getUploadHeaderOptions())
            .map(res => res.json())
            .catch(error => Observable.throw(error))
            .subscribe(
            data => {
                uploadResponse.inputFileName = data.inputFileName;
                uploadResponse.systemInputFileName = data.systemInputFileName;
                uploadResponse.inputFileType = data.inputFileType;
                uploadResponse.status = "N";
                uploadResponse.createdBy = data.createdBy;
                uploadResponse.createdTimestamp = data.createdTimestamp;
                uploadResponse.updatedBy = data.updatedBy;
                uploadResponse.updatedTimestamp = data.updatedTimestamp;
                uploadResponse.costSellProcessId = data.costSellProcessId;
                this.fileUpload(uploadResponse);
                this._waitSpinnerService.hideWait();
            },
            error => {
                this._waitSpinnerService.hideWait();
                this.filetypeVal = null;
            }
            );
    }

    private fileUpload(retrievedObject) {
        if (this.fileSheduleDate === null || this.fileSheduleDate === undefined || this.fileSheduleDate === "") {
            let ESTStr = Date.now();
            retrievedObject.scheduledTimestamp = ESTStr;
        } else {
            retrievedObject.scheduledTimestamp = CommonUtils._getDateStr(this.fileSheduleDate);
        }
        
        let uploaddatauri = '/api/cost-sell/report/file/uploadData'
        this._waitSpinnerService.showWait();
        this._webServiceComm.httpPost(uploaddatauri, retrievedObject).subscribe(resp => {
            if (resp) {
                this.filetypeVal = null;
                this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'File successfully uploaded' });
                this._getJobScheduleHistory();
            }
        }, err => {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
        }, () => {
            this._cleanPart();
            this._waitSpinnerService.hideWait();
        });
    }

    _cleanPart() {
        this.jobScheduleDate = "";
        this.fileSheduleDate = "";
        this.isFileExist = false;
    }

    downloadOutput(item) {
        this.msgs = [];
        if (item && typeof item.costSellProcessId != 'undefined') {
            let linkUri = '/api/cost-sell/report/link/' + item.costSellProcessId;
            this._waitSpinnerService.showWait();
            this._webServiceComm.httpGet(linkUri).subscribe(res => {
                if (res.outputReportLink) {
                    window.open(res.outputReportLink);
                    this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'Output File successfully downloaded.' });
                }
            }, err => {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                this._waitSpinnerService.hideWait();
            }, () => {
                this._waitSpinnerService.hideWait();
            });
        }
    }

    downloadErrorReport(item) {
        this.msgs = [];
        if (item && typeof item.costSellProcessId != 'undefined') {
            let linkUri = '/api/cost-sell/report/link/' + item.costSellProcessId;
            this._waitSpinnerService.showWait();
            this._webServiceComm.httpGet(linkUri).subscribe(res => {
                if (res.rejectionReportLink) {
                    window.open(res.rejectionReportLink);
                    this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'Error File successfully downloaded.' });
                }
            }, err => {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                this._waitSpinnerService.hideWait();
            }, () => {
                this._waitSpinnerService.hideWait();
            });
        }
    }

    retry(item) {
        this.msgs = [];
        let reqObj = new Report();
        reqObj = item;
        this._localStorageService.addItem("item", JSON.stringify(reqObj));
        this.onRetry = true;
    }

    cancel(item) {
        this.msgs = [];
        this.confirmationService.confirm({
            message: 'Are you sure, you want to perform CANCEL for ' + 'REQ' + ("000000" + item.costSellProcessId).slice(-6) + '?',
            accept: () => {
                let reqObj = new Report();
                reqObj = item;
                reqObj.status = "C";
                let uri = '/api/cost-sell/cost-sell-report';
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

    resubmit() {
        var retrievedObject = JSON.parse(this._localStorageService.getItem("item"));
        retrievedObject.status = "R";
        if (this.retrySheduleDate === null || this.retrySheduleDate === undefined) {
            let ESTStr = Date.now();
            retrievedObject.scheduledTimestamp = ESTStr;
        } else {
            retrievedObject.scheduledTimestamp = CommonUtils._getDateStr(this.retrySheduleDate);
        }
        retrievedObject.updatedTimestamp = Date.now();
        let uri = '/api/cost-sell/cost-sell-report';
        this._waitSpinnerService.showWait();
        this._webServiceComm.httpPost(uri, retrievedObject).subscribe(resp => {
            this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'The record Resubmitted successfully' });
            this._getJobScheduleHistory();
            this.onRetry = false;
        }, err => {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
        }, () => {
            this._waitSpinnerService.hideWait();
        });
    }

}