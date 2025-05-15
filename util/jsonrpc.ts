// apcsa moment
import { v4 } from "uuid"
interface JsonRPCInterface {
    cbMethod:string
    payloadData:any;
    id:string;
    generateId():string
    getMethod():string
    getParams():any
    setMethod(method: string):JsonRPCHandler
    setPayload(d: any):JsonRPCHandler
}
export class JsonRPCHandler implements JsonRPCInterface  {
    private cbMethod:string;
    private payloadData:any;
    private id:string;
    public constructor() {
    this.id = generateId()
    }
    private generateId():string {
        return v4()
    }

    public getMethod():string {
        return this.cbMethod;
    }

    public getParams():any {
        return this.payloadData
    }

    public setMethod(method: string):JsonRPCHandler {
        this.cbMethod = method;
        return this;
    }
    public setPayload(d: any):JsonRPCHandler {
        this.payloadData = d
        return this;
    }
}
