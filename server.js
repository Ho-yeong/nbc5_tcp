import net from 'net';
import handlers from './handlers/index.js';
import { HEADER_SIZE, MAX_MESSAGE_LENGTH } from './constants.js';
import { readHeader, writeHeader } from './utils.js';

const PORT = 5555;

const server = net.createServer((socket) => {
  console.log('Client connected');

  let buffer = Buffer.alloc(0);

  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length >= HEADER_SIZE) {
      const { length, handlerId } = readHeader(buffer);

      if (length > MAX_MESSAGE_LENGTH) {
        console.error(`Error: Message length ${length} exceeds maximum of ${MAX_MESSAGE_LENGTH}`);
        socket.write('Error: Message too long');
        socket.end();
        break;
      }

      if (!handlers[handlerId]) {
        console.error(`Error: No handler found for ID ${handlerId}`);
        socket.write(`Error: Invalid handler ID ${handlerId}`);
        socket.end();
        break;
      }

      if (buffer.length >= HEADER_SIZE + length) {
        const message = buffer.slice(HEADER_SIZE, HEADER_SIZE + length);
        console.log(`Received from client (Handler ${handlerId}):`, message.toString());

        // 핸들러 호출
        const handler = handlers[handlerId];
        const response = handler(message);
        const responsePacket = Buffer.concat([writeHeader(response.length, handlerId), response]);
        socket.write(responsePacket);

        // 처리한 메시지를 버퍼에서 제거
        buffer = buffer.slice(HEADER_SIZE + length);
      } else {
        break;
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
