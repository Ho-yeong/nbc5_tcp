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
  const buffer = Buffer.alloc(HEADER_SIZE);
  buffer.writeUInt32BE(length, LENGTH_OFFSET);
  buffer.writeUInt16BE(handlerId, HANDLER_ID_OFFSET);
  return buffer;
};
