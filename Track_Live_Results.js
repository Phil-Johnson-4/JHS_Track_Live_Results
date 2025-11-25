// Leica DISTO E7500i BLE Integration

// UUIDs for Leica DISTO
const SERVICE_UUID = '3ab10100-f831-4395-b29d-570977d5bf94';
const CHARACTERISTIC_UUID = '3ab10101-f831-4395-b29d-570977d5bf94';

const connectBtn = document.getElementById('connectBtn');
const measurementDisplay = document.getElementById('measurement');
const statusText = document.getElementById('statusText');

let device;
let server;
let service;
let characteristic;

async function connectDISTO() {
    try {
        updateStatus('Connecting...', false);

        // Request Bluetooth Device
        device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'DISTO' }],
            optionalServices: [SERVICE_UUID]
        });

        device.addEventListener('gattserverdisconnected', onDisconnected);

        // Connect to GATT Server
        server = await device.gatt.connect();

        // Get Service
        service = await server.getPrimaryService(SERVICE_UUID);

        // Get Characteristic
        characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        // Start Notifications
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleMeasurementUpdate);

        updateStatus('Connected', true);
        connectBtn.style.display = 'none'; // Hide button after connection

    } catch (error) {
        console.error('Connection Error:', error);
        updateStatus('Connection Failed', false);
        alert('Failed to connect: ' + error.message);
    }
}

function handleMeasurementUpdate(event) {
    const dataView = event.target.value;

    // Leica DISTO sends data as 32-bit Float (Little Endian)
    // The characteristic we found (3ab10101...) is typically the distance.
    // Let's verify the data length to be safe.
    if (dataView.byteLength >= 4) {
        const value = dataView.getFloat32(0, true); // true = little-endian
        updateMeasurement(value);
    } else {
        console.warn('Received data with unexpected length:', dataView.byteLength);
    }
}

function updateMeasurement(value) {
    // Format to 3 decimal places for precision
    measurementDisplay.innerText = value.toFixed(3);

    // Add a small animation effect
    measurementDisplay.style.transform = 'scale(1.1)';
    setTimeout(() => {
        measurementDisplay.style.transform = 'scale(1)';
    }, 100);
}

function onDisconnected(event) {
    const device = event.target;
    console.log(`Device ${device.name} is disconnected.`);
    updateStatus('Disconnected', false);
    connectBtn.style.display = 'inline-flex';
    measurementDisplay.innerText = '--';
}

function updateStatus(text, isConnected) {
    statusText.innerText = text;
    if (isConnected) {
        statusText.classList.add('connected');
    } else {
        statusText.classList.remove('connected');
    }
}

// Attach event listener
document.addEventListener('DOMContentLoaded', () => {
    connectBtn.addEventListener('click', connectDISTO);
});
