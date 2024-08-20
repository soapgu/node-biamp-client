const BiampBlock = require('./biampBlock');

class MatrixMixerBlock extends BiampBlock{
    
    /**
     * 混音矩阵构造函数
     * @param {string} instanceTag 
     */
    constructor(instanceTag){
        super( instanceTag );
    }

    /**
     * 获取输入通道数量
     * @returns 
     */
    getInputCount(){
        return super.buildCommand(BiampBlock.get,"numInputs",BiampBlock.number);
    }

    /**
     * 获取输出通道数量
     * @returns 
     */
    getOutputCount(){
        return super.buildCommand(BiampBlock.get,"numOutputs",BiampBlock.number);
    }

    /**
     * 获取输入通道名称
     * @param {number} index 
     * @returns 
     */
    getInputLabel(index){
        return super.buildCommand(BiampBlock.get,"inputLabel",BiampBlock.string,index);
    }

    /**
     * 获取输出通道名称
     * @param {number} index 
     * @returns 
     */
    getOutputLabel(index){
        return super.buildCommand(BiampBlock.get,"outputLabel",BiampBlock.string,index);
    }

    /**
     * 获取矩阵状态
     * @param {number} input 
     * @param {number} output 
     * @returns 
     */
    getCrosspointLevelState( input,output ){
        return super.buildCommand(BiampBlock.get,'crosspointLevelState',BiampBlock.boolean,input,output);
    }

    /**
     * 设置矩阵状态
     * @param {number} input 
     * @param {number} output 
     * @param {boolean} value 
     * @returns 
     */
    setCrosspointLevelState( input,output,value ){
        return super.buildCommand(BiampBlock.set,'crosspointLevelState',BiampBlock.undefined,input,output,value);
    }
}

module.exports = MatrixMixerBlock;