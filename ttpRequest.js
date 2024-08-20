const value_left = '"value":';
const BiampBlock = require('./biampBlock')

class TtpRequest{

    /**
     * @type {string}
     */
    #command

    /**
     * 
     * @param {string} command 
     * @param {string} responType 
     */
    constructor( command,responType ){
        this.#command = command;
        this.responType = responType;
        this.finished = false;
        this.success = false;
        this.err = '';
    }

    /**
     * 获取发送字符串
     */
    get sendString(){
        return this.#command + '\n';
    }

    /**
     * 检查命令是否已经收到
     * @param {string} response 
     */
    checkCommandReceived( response ){
        return this.#command === response;
    }

    /**
     * 解析返回
     * @param {string} response 
     * @returns {boolean}
     */
    parseValue( response ){
        //console.log( response );
        this.finished = true;
        this.success = response.startsWith('+OK');
        if( this.responType !== BiampBlock.undefined ){
            let valueStr = response.substring( response.indexOf(value_left) + value_left.length );
            switch( this.responType ){
                case BiampBlock.number:
                    this.result = Number(valueStr);
                    break;
                case BiampBlock.boolean:
                    this.result = valueStr === 'true';
                    break;
                case BiampBlock.string:
                    this.result = valueStr.slice(1, -1);
            }
        }
        return this.finished;
        
    }
}

module.exports = TtpRequest;