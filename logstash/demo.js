const {delay_logstash} = require('./index');
const type = 'tcp';
const host = '127.0.0.1';
const port = 15085;
const logstash = new delay_logstash(type, host, port, delayTime);

logstash.pushQueue([{'content': 'test'}]);