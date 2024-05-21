import net from 'net';
import handlers from './handlers/index.js';
import { HEADER_SIZE, MAX_MESSAGE_LENGTH } from './constants.js';
import { readHeader, writeHeader } from './utils.js';

const PORT = 5555;

const server = net.createServer((socket) => {
  console.log('Client connected');
  let socketClosed = false;

  let buffer = Buffer.alloc(0);

  socket.on('data', (data) => {
    try {
      let buffer = Buffer.from(data);

      // 메시지 길이와 핸들러 ID 읽기
      const { length, handlerId } = readHeader(buffer);

      // 메시지 길이 확인
      if (length > MAX_MESSAGE_LENGTH) {
        console.error(`Error: Message length ${length} exceeds maximum of ${MAX_MESSAGE_LENGTH}`);
        if (!socketClosed) {
          socket.write('Error: Message too long');
          socketClosed = true;
          socket.end();
        }
        return;
      }

      // 핸들러 ID 확인
      if (!handlers[handlerId]) {
        console.error(`Error: No handler found for ID ${handlerId}`);
        if (!socketClosed) {
          socket.write(`Error: Invalid handler ID ${handlerId}`);
          socketClosed = true;
          socket.end();
        }
        return;
      }

      // 메시지 추출
      const message = buffer.slice(HEADER_SIZE, HEADER_SIZE + length);
      console.log(`Received from client (Handler ${handlerId}):`, message.toString());

      // 핸들러 호출 및 응답 생성
      const handler = handlers[handlerId];
      const responseMessage = handler(message);

      // 응답 메시지 생성 및 전송
      const responsePacket = Buffer.concat([
        writeHeader(responseMessage.length, handlerId),
        responseMessage,
      ]);
      if (!socketClosed) {
        socket.write(responsePacket);
      }
    } catch (error) {
      console.error('Error processing data:', error);
      if (!socketClosed) {
        socket.write('Error processing data');
        socketClosed = true;
        socket.end();
      }
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Echo server listening on port ${PORT}`);
  console.log(server.address());
});
