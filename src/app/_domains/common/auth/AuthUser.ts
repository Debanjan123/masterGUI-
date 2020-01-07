export class AuthUser{
    private userId:string = '';
    private password:string;
    
    constructor(userId: string, password: string){
        this.userId = userId;
        this.password = password;
    }
}