export default function handler1(data) {
    console.log('Handler 1 processing data:', data.toString());
    // 수신한 데이터를 대문자로 변환
    const processedData = data.toString().toUpperCase();
    return Buffer.from(processedData);
}
