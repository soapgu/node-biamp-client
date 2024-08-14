# node-biamp-client

## Quick Start

1. install package
```
npm install @shgbit/biamp-client

```
2. add require

```javascrit
const biampClient = require('@shgbit/biamp-client');

const { DeviceBlock } = biampClient;
```
3. use biampClient

```javascrit
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



