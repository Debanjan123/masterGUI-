import {
    LocalStorageService
} from '../../_services/common/index';

import {
    Headers,
    RequestOptions
} from '@angular/http';

export class CommonUtils {

/*constructor(private _localStorageService: LocalStorageService)
{}*/

    public static hasText(value : string) {
        if (!value || value.trim() === '') {
            return false;
        }
        return true;
    }

    public static hasNoText(value : string) {
        return !this.hasText(value);
    }

    public static matchesPattern(value : string, pattern : string) {
       let regExpMatchArray = value.match(pattern);
       if (regExpMatchArray && regExpMatchArray.length == 1) {
           return regExpMatchArray.pop() === regExpMatchArray.input;
       }
       return false;
    }

    public static getShortAvailCd(longAvailCd : string) {
        if (longAvailCd === 'B/L') {
            return 'B';
        } else if (longAvailCd === 'F/L') {
            return 'F';
        } else if (longAvailCd === 'N/C') {
            return 'C';
        } else if (longAvailCd === 'NLA') {
            return 'U';
        } else if (longAvailCd === 'NPI') {
            return 'M';
        } else if (longAvailCd === 'NSP') {
            return 'S';
        } else if (longAvailCd === 'R/L') {
            return 'R';
        } else if (longAvailCd === ' ') {
            return ' ';
        } else { 
            return undefined;
        }
    }

    public static getLongAvailCd(shortAvailCd : string) {
        if (shortAvailCd === 'B') {
            return 'B/L';
        } else if (shortAvailCd === 'F') {
            return 'F/L';
        } else if (shortAvailCd === 'C') {
            return 'N/C';
        } else if (shortAvailCd === 'U') {
            return 'NLA';
        } else if (shortAvailCd === 'M') {
            return 'NPI';
        } else if (shortAvailCd === 'S') {
            return 'NSP';
        } else if (shortAvailCd === 'R') {
            return 'R/L';
        } else if (shortAvailCd === ' ') {
            return ' ';
        } else { 
            return undefined;
        }
    }

    public static safeTrim(value : string, defaultValue ?: string) {
        return value ? value.trim() : ((defaultValue) ? defaultValue : value);
    }

    public static getMinimumExemptionPriceFlag(minimumExemptionPrice : boolean) {
        if (minimumExemptionPrice == true) {
            return "Y";
        } else if (minimumExemptionPrice == false) {
            return "N";
        } else {
            return "";
        }
    }

    public static _getDateStr(date: Date): string {
        let month = LocalStorageService.leftPad(('' + (date.getMonth() + 1)), 2);
        let day = LocalStorageService.leftPad(('' + date.getDate()), 2);
        let hour = LocalStorageService.leftPad(('' + date.getHours()), 2);
        let min = LocalStorageService.leftPad(('' + date.getMinutes()), 2);
        let sec = LocalStorageService.leftPad(('' + date.getSeconds()), 2);
        let dateStr = '' + date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
        return dateStr;
    }

    public static _getUploadHeaderOptions(): RequestOptions {
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
}