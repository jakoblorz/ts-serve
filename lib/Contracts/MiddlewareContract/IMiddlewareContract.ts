import { INamedArgumentContract } from "../RoutingContract";
import { MiddlewareContractAfterExecFunctionType } from "./MiddlewareContractAfterExecFunctionType";
import { MiddlewareContractBeforeExecFunctionType } from "./MiddlewareContractBeforeExecFunctionType";

export interface IMiddlewareContract extends INamedArgumentContract {
    before: MiddlewareContractBeforeExecFunctionType;
    after?: MiddlewareContractAfterExecFunctionType;
}