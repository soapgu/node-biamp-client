const TtpRequest = require('./ttpRequest');

class BiampBlock{
    /**
     * 构造
     * @param {string} instanceTag 
     */
    constructor(instanceTag){
        this.instanceTag = instanceTag;
    }

    static get get() {
        return 'get';
    }

    static get set() {
        return 'set';
    }

    /**
     * @param {string} action
     * @param {string} attribute
     * @param {string} reponseType
     * @returns {TtpRequest}
     */
    buildCommand(action,attribute,reponseType,...args){
        let tail = '';
        if( args.length > 0 ){
            tail = ` ${args.join(' ')} `;   
        }
        let command = `${this.instanceTag} ${action} ${attribute}${tail}`;
        return new TtpRequest( command, reponseType);
    }
}

module.exports = BiampBlock;