export class EnvVarConfig {

    public static getEnvironmentVariable(value) {
        var environment:string;
        var data = {};
        environment = window.location.hostname;
        
        switch (environment) {
            case'localhost':
                data = {
                    //endPointPlanArea: 'https://planningareas-dev.shs-core.com/HSSOMSRDMMaintService/services',
                   // endPointAuth: 'http://trqaphsbat2.vm.itg.corp.us.shldcorp.com:8089/HSPartItemMasterAppService/v1/auth/token?attributes=cn%2Cgivenname%2Cmail%2Csn%2Ctitle%2Cshcdisplayname',
                    //endPointToken: 'https://hfdvhshasvc1.vm.itg.corp.us.shldcorp.com:12743/HSSOMTokenMaintService/services',
                    environmentType : 'LOCAL',
                    clientCode : 'ItemMasterGUI',
                    clientSecret : 'Kkq21!#1Asd1'
                };
                break;
            case 'www.item-master-dev.s3-website-us-east-1.amazonaws.com':
                data = {
                    // endPointPlanArea: 'https://planningareas-dev.shs-core.com/HSSOMSRDMMaintService/services',
                    // endPointAuth: 'https://hfdvhshasvc1.vm.itg.corp.us.shldcorp.com:12143/HSSOMAuthService/services/auth/token?attributes=mail,title,cn,sn,shcdisplayname',
                    // endPointToken: 'https://hfdvhshasvc1.vm.itg.corp.us.shldcorp.com:12743/HSSOMTokenMaintService/services',
                    environmentType : 'DEV',
                    clientCode : 'ItemMasterGUI',
                    clientSecret : 'Kkq21!#1Asd1'
                };
                break;
             case 'item-master-app-qa.shs-core.com':
                data = {
                    // endPointPlanArea: 'https://planningareas-st.shs-core.com/HSSOMSRDMMaintService/services',
                    // endPointAuth: 'https://hfdvhshasvc1.vm.itg.corp.us.shldcorp.com:12243/HSSOMAuthService/services/auth/token?attributes=mail,title,cn,sn,shcdisplayname',
                    // endPointToken: 'https://hfdvhshasvc1.vm.itg.corp.us.shldcorp.com:12843/HSSOMTokenMaintService/services',
                    environmentType : 'QA',
                    clientCode : 'ItemMasterGUI',
                    clientSecret : 'Kkq21!#1Asd1'
                };
                break;
            //  case 'hsplanningareaadmin.intra.searshc.com':
            //     data = {
            //         endPointPlanArea: 'https://srdmmaintenance-prod.shs-core.com/HSSOMSRDMMaintService/services',
            //         endPointAuth: 'https://hssomauthservice.intra.searshc.com/HSSOMAuthService/services/auth/token?attributes=mail,title,cn,sn,shcdisplayname',
            //         endPointToken: 'https://hstokenmaint.intra.searshc.com/HSSOMTokenMaintService/services',
            //         environmentType : 'PROD',
            //         planAreaServClientCode : 'SrdmMaintSvcClient',
            //         planAreaServClientSecret : 'SrDmMaiNt5vc5eCreT'
            //     };
            //  break;   
        }
        return data[value];
    }

}