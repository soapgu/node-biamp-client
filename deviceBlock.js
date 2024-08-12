const BiampBlock = require('./biampBlock');

class DeviceBlock extends BiampBlock { 
    /**
     * 构造函数
     */
    constructor(){
        super('DEVICE')
    }

    /**
     * @returns {TtpRequest}
     */
    getSerialNumber(){
       return super.buildCommand( BiampBlock.get, 'serialNumber','string'); 
    }
}
module.exports = new DeviceBlock();