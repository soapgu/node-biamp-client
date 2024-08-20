const BiampBlock = require('./biampBlock');

class CommonBlock extends BiampBlock {
    constructor(){
        super('');
    }

    /**
     * 
     * @param {string} instanceTag 
     * @param {string} action 
     * @param {string} attribute 
     * @param {string} reponseType 
     * @param  {...any} args 
     * @returns 
     */
    buildCommand(instanceTag,action,attribute,reponseType,...args){
        this.instanceTag = instanceTag;
        return super.buildCommand(action,attribute,reponseType,...args);
    }
}
module.exports = CommonBlock;