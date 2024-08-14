# node-biamp-client

## Quick Start

1. install package
```
npm install @shgbit/biamp-client

```
2. add require

```javascript
const biampClient = require('@shgbit/biamp-client');

const { DeviceBlock } = biampClient;
```
3. use biampClient

```javascript
const client = new biampClient('172.16.13.52','main');
    console.log("<<<<<<< begin connect biamp >>>>>>>");
    let connect = await client.makeConnect();
    console.log(`<<<<<<< end connect biamp,result${connect} >>>>>>>`);
    if( connect ){
        console.log("<<<<<<< begin get serial number >>>>>>>");
        let sn = await client.sendTTPSimple( DeviceBlock.getSerialNumber());
        console.log(`serial number is ${sn}`);
    }
```

## Batch TTP performence improvement

for example：I need to query MatrixMixer is 16 ✖️ 10 all CrosspointLevelState.
so I use 160 ttp command to excute.
```javascript
/**
 * 
 * @param {BiampClient} client 
 * @param {MatrixMixerBlock} mixer 
 * @param {number} inputNum 
 * @param {number} outputNum 
 */
async function normalQueryCrosspointLevelState(client,mixer,inputNum,outputNum){
    const start = process.hrtime.bigint();
    for( let i=1;i<= inputNum;i++ ){
        for( let j=1;j <= outputNum;j++ ){
            let state = await client.sendTTPSimple( mixer.getCrosspointLevelState( i ,j ) );
            console.log(`input:${i} output:${j} queryMixerState result:${state}`);
        }
    }
    const end = process.hrtime.bigint();
    const elapsedTime = end - start;
    const elapsedMilliseconds = Number(elapsedTime) / 1_000_000;
    console.log(`normal query CrosspointLevelState timming: ${elapsedMilliseconds} ms`);
}
```
result
```
nput:1 output:1 queryMixerState result:true
input:1 output:2 queryMixerState result:true
input:1 output:3 queryMixerState result:true
input:1 output:4 queryMixerState result:true
input:1 output:5 queryMixerState result:true
input:1 output:6 queryMixerState result:true
input:1 output:7 queryMixerState result:true
input:1 output:8 queryMixerState result:true
input:1 output:9 queryMixerState result:true
input:1 output:10 queryMixerState result:true
input:2 output:1 queryMixerState result:true
input:2 output:2 queryMixerState result:false
input:2 output:3 queryMixerState result:true
...
...
normal query CrosspointLevelState timming: 4649.550167 ms
```
### timming is 4649.550167 ms

so I combine these ttp command send togeter.

```javascript
/**
 * 
 * @param {BiampClient} client 
 * @param {MatrixMixerBlock} mixer 
 * @param {number} inputNum 
 * @param {number} outputNum 
 */
async function batchQueryCrosspointLevelState(client,mixer,inputNum,outputNum) {
    const start = process.hrtime.bigint();
    let requests = [];
    for( let i=1;i<= inputNum;i++ ){
        for( let j=1;j <= outputNum;j++ ){
            let request = mixer.getCrosspointLevelState( i ,j );
            requests.push( request );
        }
    }
    console.log(`client request count:${requests.length}`);
    let results =  await client.sendTTPSimple(...requests);
    console.log(results)
    const end = process.hrtime.bigint();
    const elapsedTime = end - start;
    const elapsedMilliseconds = Number(elapsedTime) / 1_000_000;
    console.log(`batch query CrosspointLevelState timming: ${elapsedMilliseconds} ms`);
}
```
result
```
client request count:160
info:BatchTtpRequest BatchTtpRequest finish
[
  true,  true, true,  true, true,  true,  true,  true,  true,
  true,  true, false, true, true,  true,  true,  true,  true,
  true,  true, true,  true, true,  true,  true,  true,  true,
  true,  true, true,  true, true,  true,  true,  true,  true,
  true,  true, true,  true, true,  true,  true,  true,  true,
  true,  true, true,  true, true,  true,  true,  true,  true,
  true,  true, true,  true, false, false, true,  true,  true,
  true,  true, true,  true, true,  false, false, true,  true,
  true,  true, true,  true, true,  true,  false, false, true,
  true,  true, true,  true, true,  true,  true,  false, false,
  true,  true, true,  true, true,  true,  true,  true,  false,
  false,
  ... 60 more items
]
batch query CrosspointLevelState timming: 3266.358083 ms
```

### timming is 3266.358083 ms

### less than expected:(，A little bit of acceleration is better than nothing

## Related Links

### Biamp-Client-Demo

just a demo to use
* [biamp-client-demo](https://github.com/soapgu/biamp-client-demo)

### Biamp Website

* [biamp index page](https://www.biamp.com/)
* [Tesira Text Protocol Version 4.2（PDF）](https://downloads.biamp.com/assets/docs/default-source/control/tesira_text_protocol_v4-2_jan22.pdf?sfvrsn=100c2497_46&_ga=2.24195130.1095003483.1712903552-465111178.1712546032)
* [Tesira Text Protocol](https://support.biamp.com/Tesira/Control/Tesira_Text_Protocol)
* [Tesira command string calculator](https://support.biamp.com/Tesira/Control/Tesira_command_string_calculator)