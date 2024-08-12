const value_left = '"value":';

class TtpRequest{

    /**
     * 
     * @param {string} command 
     * @param {string} responType 
     */
    constructor( command,responType ){
        this.command = command;
        this.responType = responType;
        this.finished = false;
        this.success = false;
        this.err = '';
    }

    /**
     * 解析返回
     * @param {string} response 
     */
    parseValue( response ){
        //console.log( response );
        this.finished = true;
        this.success = response.startsWith('+OK');
        if( this.responType !== 'undefined' ){
            let valueStr = response.substring( response.indexOf(value_left) + value_left.length );
            switch( this.responType ){
                case 'number':
                    this.result = Number(valueStr);
                    break;
                case 'boolean':
                    this.result = valueStr === 'true';
                    break;
                case 'string':
                    this.result = valueStr.slice(1, -1);
            }
        }
        
    }
}

module.exports = TtpRequest;