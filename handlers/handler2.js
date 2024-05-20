export default function handler2(data) {
    console.log('Handler 2 processing data:', data.toString());
    // 수신한 데이터를 역순으로 변환
    const processedData = data.toString().split('').reverse().join('');
    return Buffer.from(processedData);
}
