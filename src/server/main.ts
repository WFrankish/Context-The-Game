import * as net from './net.js';
import * as chat from './chat.js';

const channel = net.createChannel('chat', new chat.Handler);
