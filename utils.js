// 버퍼로부터 메시지 길이와 핸들러 ID를 읽음 (Big Endian)
import { HANDLER_ID_OFFSET, HEADER_SIZE, LENGTH_OFFSET } from './constants.js';

export const readHeader = (buffer) => {
  return {
    length: buffer.readUInt32BE(LENGTH_OFFSET),
    handlerId: buffer.readUInt16BE(HANDLER_ID_OFFSET),
  };
};

// 메시지 길이와 핸들러 ID를 버퍼로 변환 (Big Endian)
export const writeHeader = (length, handlerId) => {
  const buffer = Buffer.alloc(HEADER_SIZE); // HEADER_SIZE 는 6바이트
  buffer.writeUInt32BE(length, LENGTH_OFFSET); // 메시지 길이를 빅엔디안 방식으로 기록 (4바이트)
  buffer.writeUInt16BE(handlerId, HANDLER_ID_OFFSET); // 핸들러 ID를 빅엔디안 방식으로 기록 (2바이트)
  return buffer;
};
