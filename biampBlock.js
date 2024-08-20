const TtpRequest = require('./ttpRequest');

class BiampBlock{
    /**
     * 构造
     * @param {string} instanceTag 
     */
    constructor(instanceTag){
        this.instanceTag = instanceTag;
    }

    /**
     * action get
     */
    static get get() {
        return 'get';
    }

    /**
     * action set
     */
    static get set() {
        return 'set';
    }

    /**
     * reponseType string
     */
    static get string(){
        return 'string';
    }

    /**
     * reponseType boolean
     */
    static get boolean(){
        return 'boolean';
    }

    /**
     * reponseType number
     */
    static get number(){
        return 'number';
    }

    /**
     * reponseType undefined
     */
    static get undefined(){
        return 'undefined';
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