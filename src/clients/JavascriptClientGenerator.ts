import { IRenderableNamespace } from "../interfaces/IRenderableNamespace";
import { IRenderableServiceEndpoint } from "../interfaces/IRenderableServiceEndpoint";

import { ClientGenerator } from "../ClientGenerator";

export class JavascriptClientGenerator extends ClientGenerator {

    constructor() {
        super("javascript_native", {
            boolean: "boolean",
            number: "number",
            string: "string"
        }, JavascriptClientGenerator.addArgumentString);
    }

    public static addArgumentString(endpoints: IRenderableNamespace[]) {
        for (let n = 0; n < endpoints.length; n++){
            for (let e = 0; e < endpoints[n].endpoints.length; e++){
                let endpoint = endpoints[n].endpoints[e];
                let argumentString = "";
                for (let i = 0; i < endpoint.requestArgs.length; i++){
                    argumentString += endpoint.requestArgs[i].key + ", ";
                }

                endpoints[n].endpoints[e] = {
                    callback: endpoint.callback,
                    name: endpoint.name,
                    namespace: endpoint.namespace,
                    request: endpoint.request,
                    requestArgs: endpoint.requestArgs,
                    response: endpoint.response,
                    responseArgs: endpoint.responseArgs,
                    argumentString: argumentString.substring(0, argumentString.length - 2)
                } as IRenderableServiceEndpoint;
            }
        }

        return endpoints;
    }
}