import { IEndpointContract, EndpointContractRoleType } from "../contract/EndpointContract";
import { ContractServer } from "./ContractServer";
import { IContractServerResponse, ContractServerResponse } from "./ContractServerResponse";
import { ContractServerResponseFunctionType, ContractServerRequest, IContractServerRequestArgument } from "./ContractServerRequest"

import * as http from "http";
import { parse as urlparse } from "url";
import * as body from "raw-body";

/**
 * http protocol implementation of the ContractServer
 */
export class HttpContractServer extends ContractServer {

    server: http.Server;

    /**
     * start listening for incoming requests
     * @param port number to indicate portnumber
     */
    public async listen(port: number): Promise<any> {
        return new Promise<void>((resolve, reject) => this.server.listen(port, resolve));
    }

    /**
     * create a function to respond to a http request with a IContractServerResponse
     * @param response http.ServerResponse response object
     */
    private createResponseFunction(response: http.ServerResponse): ContractServerResponseFunctionType {
        return (res: IContractServerResponse) => new Promise<void>((resolve, reject) => {
            response.writeHead(res.code, { "Content-Type": "application/json" });
            response.end(JSON.stringify(res));
        });
    }

    /**
     * extract all arguments from a http request components using
     * the following hierachy: query - header - body
     * @param queries query arguments from the request
     * @param headers header arguments from the request
     * @param body optional body arguments from the request
     */
    private extractArgumentsFromRequest(queries: any, headers: any, body: any = {}) {

        // function that pushes a element into an array only if its key is not present yet
        function pushNoShadow<T extends { key: string }>(list: T[], key: string, value: T) {
            if (!(list.filter((t) => t.key == key).length > 0)) {
                list.push(value);
            }
        };

        // prepare the arguments array
        const args: IContractServerRequestArgument[] = [];

        // pushNoShadow query arguments
        Object.keys(queries).map<IContractServerRequestArgument>(
            (v) => ({ key: v, value: queries[v] })).forEach((v) => pushNoShadow(args, v.key, v));

        // pushNoShadow header arguments
        Object.keys(headers).map<IContractServerRequestArgument>(
            (v) => ({ key: v, value: headers[v] })).forEach((v) => pushNoShadow(args, v.key, v));

        // pushNoShadow body arguments
        Object.keys(body).map<IContractServerRequestArgument>(
            (v) => ({ key: v, value: body[v] })).forEach((v) => pushNoShadow(args, v.key, v));

        return args;
    }

    constructor(contracts: IEndpointContract[]) {
        super(contracts);

        this.server = http.createServer((request, response) => {

            const { headers, method, url } = request;

            // parse the url to extract query parameter and url pathname
            const URL = urlparse(url as string, true);
            if (URL.pathname === undefined) {
                URL.pathname = "/";
            }

            // create the function to respond to the client
            const respond = this.createResponseFunction(response);

            // detect target role of the request
            let role: EndpointContractRoleType | "void" = "void";
            if (URL.pathname === "/api/create" && method === "POST") {
                role = "create";
            } else if (URL.pathname === "/api/read" && method === "GET") {
                role = "read";
            } else if (URL.pathname === "/api/update" && method === "PUT") {
                role = "update";
            } else if (URL.pathname === "/api/delete" && method === "DELETE") {
                role = "delete";
            } else if (URL.pathname === "/api/ping" && method === "GET") {
                role = "ping";
            } else {
                return respond(ContractServerResponse.NotFoundError());
            }

            Promise.resolve({})
                // recieve the body from the request if necessary    
                .then(() => method === "POST" || method === "PUT" ? body(request) : Promise.resolve({}))
                // parse the arguments from the url, headers and body (if resolved with content)
                .then((content) => this.extractArgumentsFromRequest(URL.query, headers, content))
                // invoke the contracts function (if contract was found -> level 2 routing)
                .then((args) => this.mapRequest(new ContractServerRequest(role as EndpointContractRoleType, args)))
                // send the result back to the client
                .then((res) => respond(res));
        });
    }
}