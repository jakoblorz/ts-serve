import { ServiceEndpoint } from "../../lib/ServiceEndpoint";
import { ClientGenerator } from "../ClientGenerator";

export class JavascriptRequestGenerator extends ClientGenerator {

    public identifier: string = "javascript/request";

    constructor(endpoints: ServiceEndpoint.IServiceEndpoint<any>[]) {
        super(endpoints, {
            string: "string",
            number: "number"
        });
    }
}