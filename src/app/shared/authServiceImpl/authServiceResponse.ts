import {Authorization} from './authorization';

export class AuthServResponse {

    iss:string;
    iat:string;
    sub:string;
    auth : Authorization;
    exp: string;
}