import net from 'net';
import { HEADER_SIZE, LENGTH_OFFSET, HANDLER_ID_OFFSET, MAX_MESSAGE_LENGTH } from './constants.js';

// 서버에 연결할 호스트와 포트
const HOST = 'localhost';
const PORT = 5555;

// 유틸리티 함수: 메시지 길이와 핸들러 ID를 버퍼로 변환 (Big Endian)
const writeHeader = (length, handlerId) => {
  const buffer = Buffer.alloc(HEADER_SIZE);
  buffer.writeUInt32BE(length, LENGTH_OFFSET);
  buffer.writeUInt16BE(handlerId, HANDLER_ID_OFFSET);
  return buffer;
};

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log('Connected to server');

  // 정상 메시지 보내기
  const normalMessages = [
    { handlerId: 10, message: 'Hello from handler 1' },
    { handlerId: 11, message: 'Hello from handler 2' },
  ];
  normalMessages.forEach(({ handlerId, message }) => {
    const messageBuffer = Buffer.from(message);
    const headerBuffer = writeHeader(messageBuffer.length, handlerId);
    const packet = Buffer.concat([headerBuffer, messageBuffer]);
    client.write(packet);
  });

  // 1024바이트를 넘는 메시지 보내기
  const longMessage = 'A'.repeat(MAX_MESSAGE_LENGTH + 1);
  const longMessageBuffer = Buffer.from(longMessage);
  const longHeaderBuffer = writeHeader(longMessageBuffer.length, 10);
  const longPacket = Buffer.concat([longHeaderBuffer, longMessageBuffer]);
  client.write(longPacket);

  // 존재하지 않는 핸들러 ID를 보내기
  const invalidHandlerIdMessage = 'Hello from invalid handler';
  const invalidHandlerBuffer = Buffer.from(invalidHandlerIdMessage);
  const invalidHandlerHeaderBuffer = writeHeader(invalidHandlerBuffer.length, 99); // 99는 존재하지 않는 핸들러 ID
  const invalidHandlerPacket = Buffer.concat([invalidHandlerHeaderBuffer, invalidHandlerBuffer]);
  client.write(invalidHandlerPacket);
});

client.on('data', (data) => {
  let buffer = Buffer.alloc(0);
  buffer = Buffer.concat([buffer, data]);

  while (buffer.length >= HEADER_SIZE) {
    const length = buffer.readUInt32BE(LENGTH_OFFSET);
    const handlerId = buffer.readUInt16BE(HANDLER_ID_OFFSET);
    if (buffer.length >= HEADER_SIZE + length) {
      const message = buffer.slice(HEADER_SIZE, HEADER_SIZE + length);
      console.log(`Received from server (Handler ${handlerId}):`, message.toString());
      buffer = buffer.slice(HEADER_SIZE + length);
    } else {
      break;
    }
  }
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error('Client error:', err);
});
