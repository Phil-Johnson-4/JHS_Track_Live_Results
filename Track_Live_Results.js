//I need you to add stuff in here please?


const service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
const characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');

await characteristic.startNotifications();

/* THIS WAS OLDER CODE BEFORE I KNEW HOW TO INTERCEPT THE DATA COMING FROM THE DISTO E7500i
characteristic.addEventListener('characteristicvaluechanged', event => {
    const decoder = new TextDecoder('utf-8');
    const value = decoder.decode(event.target.value.buffer);
    document.getElementById('measurement').innerText = value;
});*/

characteristic.addEventListener('characteristicvaluechanged', event => {
    const dataView = event.target.value;
    const value = dataView.getFloat32(0, true); // true = little-endian
    document.getElementById('measurement').innerText = value.toFixed(2) + ' m';
});


async function connectDISTO() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'DISTO' }],
            optionalServices: ['0000fff0-0000-1000-8000-00805f9b34fb'] // measurement service
        });

        const server = await device.gatt.connect();

        //const service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
        //const characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');

    //TESTING OUT SOME DIFFERENT CODES HERE? ORIGINALS ARE UP ABOVE
        const service = await server.getPrimaryService('3ab10100-f831-4395-b29d-570977d5bf94');
        const characteristic = await service.getCharacteristic('3ab10100-f831-4395-b29d-570977d5bf94');




        
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', event => {
            const dataView = event.target.value;
            const value = dataView.getFloat32(0, true); // little-endian Float32
            document.getElementById('measurement').innerText = value.toFixed(2) + ' m';
        });

        document.getElementById('measurement').innerText = "Connected. Waiting for data...";
    } catch (error) {
        console.error(error);
        document.getElementById('measurement').innerText = "Connection failed.";
    }
}

// Attach event listener to button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('connectBtn').addEventListener('click', connectDISTO);
});







