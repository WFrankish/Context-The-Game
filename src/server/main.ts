import * as chat from './chat.js';
import * as net from './net.js';

const channel = net.createChannel('chat', new chat.Handler());
