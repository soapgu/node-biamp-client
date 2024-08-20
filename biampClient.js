const net = require('node:net');
const logger = require('./logger').child({ category: '', module: 'BiampClient' });
const TtpRequest = require('./ttpRequest');
const DeviceBlock = require('./deviceBlock');
const BatchTtpRequest = require('./batchTtpRequest');

class BiampClient {

    /**
     * 内部执行队列
     */
    #queue

    /**
     * 构造函数
     * @param {string} ip 
     * @param {string} name 
     */
    constructor(ip,name='default'){
        this.ip = ip;
        this.name = name;
        this.#queue = [];
    }

    /**
     * 连接bimap服务器并完成握手和接收欢迎信息
     * @returns {Promise<boolean>}
     */
    makeConnect(){
        return new Promise((resolve, _reject) => {
            logger.info(`${this.name}...connect...`);
            this.client = net.createConnection(23,this.ip,()=>{
                logger.info('connect to biamp server...')
            });

            const echo = (data) => {
                const hexString = data.toString('hex');
                logger.info(`Received: ${hexString}`);
                if( hexString == "fffd18fffd20fffd23fffd27fffd24"){
                    //ff fc 18 ff fc 20 ff fc 23 ff fc 27 ff fc 24
                    this.#sendHexData( "fffc18fffc20fffc23fffc27fffc24" );
                } else if(hexString == "fffb03fffd01fffd22fffd1ffffb05fffd21"){
                    //ff fe 03 ff fc 01 ff fc 22 ff fc 1f ff fe 05 ff fc 21
                    this.#sendHexData("fffe03fffc01fffc22fffc1ffffe05fffc21");
                } else if( hexString == "0d0a" ){
                    this.client.removeListener( 'data',echo );
                    this.client.on('data',welcomeResponse);
                }
            };

            const welcomeResponse = (data) => {
                const responseString = data.toString();
                logger.info(`Received: ${responseString}`);
            
                if( responseString.includes('Welcome') ){
                    this.client.removeAllListeners( 'data' );
                    this.client.removeAllListeners('timeout');
                    this.connect = true;
                    resolve(true);
                }
            };

            const timeoutCallback = () => {
                logger.info('socket timeout');
                this.client.removeAllListeners( 'data' );
                this.client.removeAllListeners('timeout');
                this.connect = false;
                this.client.destroy();
                resolve(false);
            }

            this.client.on('data', echo);
            this.client.setTimeout(10000);
            this.client.on('timeout', timeoutCallback );
            this.client.setKeepAlive(true,1000);
            this.client.on("error",(err) => {
                logger.error( "biampe socket error",err );
            });
            this.client.on("close", ()=>{
                this.connect = false;
                logger.info("biampe socket close");
            })
        });
    }

    /**
     * 设置时钟自动检查连接
     * @param {number} delay 
     */
    keepAlive(delay){
        this.timeId = setTimeout( async ()=>{
            if( this.connect ){
                let serialNumber = await this.querySerialNumber();
                //logger.info(`heartbeat serialNumber:${serialNumber}`);
                if( serialNumber && serialNumber.length > 0 ){
                    logger.info('heartbeat ok');
                    this.keepAlive(delay)
                    return;
                }
            }
            logger.warn(`check offline,begin connect`);
            let result = await this.makeConnect();
            logger.warn(`connect result:${result}`);
            this.keepAlive(delay)
        },delay );
    }

    cancelKeepAlive(){
        if( this.timeId ){
            clearTimeout(this.timeId);
        }
    }

    /**
     * Ttp请求对象
     * @param {...TtpRequest} requests 
     */
    sendTTPPlus( ...requests ){
        let request;
        if( requests.length > 1 ){
            request = new BatchTtpRequest(requests);
        } else {
            request = requests[0];
        }
        //console.log( requests );
        //console.log( request );

        let task = ()=> new Promise((resolve, _reject) => {
            let buffer = "";
            const cmdResponse = (data) =>{
                //const hexString = data.toString('hex');
                //logger.info(`Received: ${hexString}`); 
                const responseString = data.toString();
                logger.debug(`Received: ${responseString}`);
                buffer += responseString;
                if( buffer.includes('\r\n') ){
                    const lines = buffer.split('\r\n')
                    for (let i = 0; i < lines.length - 1; i++) {
                        const line = lines[i];
                        if( request.checkCommandReceived(line) ){
                            logger.debug('cmd received')
                        } else {
                            if( line.startsWith('+OK') || line.startsWith('-ERR') ){
                                let over = request.parseValue(line);
                                if( over ){
                                    this.client.removeListener('data',cmdResponse);
                                    this.client.removeListener('timeout',timeoutCallback);
                                    resolve(request);
                                    break;
                                }
                            }
                        }        
                    }
                    buffer = lines[lines.length - 1];
                }
            };
            const timeoutCallback = ()=>{
                logger.info('ttp command timeout');
                this.client.removeListener('data',cmdResponse);
                this.client.removeListener('timeout',timeoutCallback);
                this.connect = false;
                this.client.destroy();
                request.err = 'timeout';
                resolve(request);
            };
            this.client.setTimeout(1000);
            this.client.on("timeout",timeoutCallback);
            this.client.on("data", cmdResponse )
            logger.debug(`sent data:${request.sendString}` );
            this.client.write( request.sendString, (err)=>{
                if(err){
                    logger.error( "error send ttp" , err);
                } else {
                    logger.debug("sent ok");
                }
            })
        });
        let wrapTask = this.#enqueue(task);
        this.#processQueue();
        return wrapTask;
    }

    /**
     * @param {...TtpRequest} requests 
     */
    async sendTTPSimple(...requests){
        let response = await this.sendTTPPlus(...requests);
        if( response.success ){
            return response.result;
        } else {
            logger.error(`send ttp error ${response.err}`);
        }
    }

    /**
     * 加入发送队列
     * @param {()=> Promise<TtpRequest>} task -任务闭包
     * @returns {Promise<TtpRequest>}
     */
    #enqueue(task) {
        return new Promise((resolve) => {
            this.#queue.push({
                task,
                resolve
            });
        });
    }

    #processQueue() {
        if (this.#queue.length > 0 && !this.#queue[0].processing) {
            //console.log("process task")
            const { task, resolve } = this.#queue[0];
            this.#queue[0].processing = true;
            //console.log(task);
            task()
                .then(result => {
                    this.#queue.shift(); // 移除已完成的任务
                    resolve(result);
                    this.#processQueue(); // 处理下一个任务
                });
        }
    }

    /**
     * 查询序列号
     * @returns {Promise<string>}
     */
    async querySerialNumber()
    {
        let request = DeviceBlock.getSerialNumber();
        let response = await this.sendTTPPlus(request);
        return response.result;
    }

    #sendHexData(hexString) {
        console.log(`send hex:${hexString}`)
        // 将16进制字符串转换为 Buffer 对象
        const buffer = Buffer.from(hexString, 'hex');
        // 将 Buffer 写入 Socket
        this.client.write(buffer, (err) => {
          if (err) {
            console.error('Error writing data:', err);
          } else {
            console.log('Data sent successfully.');
          }
        });      
      }
}

module.exports = BiampClient;