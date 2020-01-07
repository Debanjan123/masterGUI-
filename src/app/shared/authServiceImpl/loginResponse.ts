
import {UserDetails} from './userDetails';
export class LoginResponse {

    CorrelationId : string;
    ResponseCode : string;
    ResponseMessage : string;
    token : string;
    tokenLife:string;
    userDetails:UserDetails;
    messages: string[];

}