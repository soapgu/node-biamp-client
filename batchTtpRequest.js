const TtpRequest = require('./ttpRequest');
const logger = require('./logger').child({ category: '', module: 'BatchTtpRequest' });

class BatchTtpRequest extends TtpRequest {
    
    /**
     * @type {[TtpRequest]}
     */
    #requests

    /**
     * @type {number}
     */
    #current

    /**
     * @param {[TtpRequest]} requests 
     */
    constructor( requests ){
        super('none','undefined');
        this.#requests = requests;
        this.#current = 0;
        //logger.info(`constructor sub request count:${this.#requests.length}`);
    }

    /**
     * @overload
     * 获取发送字符串
     */
    get sendString(){
        return this.#requests.map( request => request.sendString ).join('');
    }

    /**
     * @overload
     * 检查命令是否已经收到
     * @param {string} response 
     */
    checkCommandReceived( response ){
        return this.#requests[this.#current].checkCommandReceived(response);
    }

    /**
     * @overload
     * 解析返回
     * @param {string} response 
     * @returns {boolean} -是否终结
     */
    parseValue( response ){
        this.#requests[this.#current].parseValue(response);
        if(this.#current === this.#requests.length-1){
            logger.info("BatchTtpRequest finish");
            this.finished = true;
            //TODO
            this.success = true;
            this.result = this.#requests.map( t=>t.result );
        } else {
            this.#current ++;
        }
        return this.finished;
    }
}

module.exports = BatchTtpRequest;