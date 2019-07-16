const EventEmitter = require('events');
const Logstash = require('logstash-client');
const slogger = require('node-slogger');

class DelayLogstash extends EventEmitter {
	constructor({type, host,  port, delayTime, maxSize=10, maxQueueSize=1000}) {
		super();
		if (!type || !host || !port) {
			throw new Error('参数错误');
		}
		this.queue = [],
		this.delayTime = delayTime;
		this.type = type;
		this.host = host;
		this.port = port;
		this.maxQueueSize = maxQueueSize;
		this.maxSize = maxSize;
		this._logstashInit();
		this._delaySend();
	}
	_logstashInit() {
		if(this.maxQueueSize) {
			this.logstash = new Logstash({
				type: this.type,
				host: this.host,
				port: this.port,
				maxQueueSize: this.maxQueueSize
			});
		} else {
			this.logstash = new Logstash({
				type: this.type,
				host: this.host,
				port: this.port
			});
		}
	}
	_delaySend(){
		const _this = this;
		setInterval(function(){
			if(_this.queue.length) {
				const data = _this.queue.slice();
				_this.logstash.send(data, function(err){
					if(err) {
						slogger.error('elk 发送数据失败',err);
						_this.emit(DelayLogstash.EVENT_SEND_ERROR, err);
					}
					
				});
				_this.queue = [];
			}
		}, _this.delayTime);
	}
	pushQueue(data) {
		const _this = this;
		if(Array.isArray(data)) {
			_this.queue = _this.queue.concat(data);
		} else {
			_this.queue.push(data); 
		}
		if(_this.queue.length >= _this.maxSize) {
			const data = _this.queue.slice();
			_this.logstash.send(data, function(err){
				if(err) {
					slogger.error('elk 发送数据失败',err);
					_this.emit(DelayLogstash.EVENT_SEND_ERROR, err);
				}
				
			});
			_this.queue = [];
		}
	}
}
DelayLogstash.EVENT_SEND_ERROR = 'eventSendError';

module.exports = DelayLogstash;