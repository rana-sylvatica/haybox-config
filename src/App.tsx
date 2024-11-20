import { useState } from 'react';
import { HayBoxDevice, DeviceInfo, Config } from 'haybox-webserial';
import ConfigForm from './ConfigForm';

const App = () => {
    const [device, setDevice] = useState<HayBoxDevice | null>(null);
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
    const [config, setConfig] = useState<Config | null>(null);
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const connectDevice = async () => {
        try {
            setStatus('connecting');
            setErrorMessage('');
            
            // Request user to select a serial port
            const port = await navigator.serial.requestPort();
            const haybox = new HayBoxDevice(port);
            setDevice(haybox);
            
            // Try to get device info to verify connection
            const info = await haybox.getDeviceInfo();
            if (info) {
                setDeviceInfo(info);
                // Also fetch initial config
                const initialConfig = await haybox.getConfig();
                if (initialConfig) {
                    setConfig(initialConfig);
                }
                setStatus('connected');
            } else {
                throw new Error('Could not get device info');
            }
        } catch (error) {
            console.error('Connection failed:', error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Failed to connect to device');
            setDevice(null);
            setDeviceInfo(null);
        }
    };

    const disconnectDevice = () => {
        setDevice(null);
        setDeviceInfo(null);
        setConfig(null);
        setStatus('disconnected');
        setErrorMessage('');
    };

     const handleConfigChange = (newConfig: Config) => {
        setConfig(newConfig);
    };
    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        HayBox Configuration Tool
                    </h1>
                    <p className="text-gray-600">
                        Connect your HayBox device to configure settings
                    </p>
                </div>

                {/* Connection Status Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div 
                                className={`h-3 w-3 rounded-full ${
                                    status === 'connected' ? 'bg-green-500' :
                                    status === 'connecting' ? 'bg-yellow-500' :
                                    status === 'error' ? 'bg-red-500' :
                                    'bg-gray-500'
                                }`}
                            />
                            <span className="font-medium text-gray-900">
                                {status === 'connected' ? 'Device Connected' :
                                 status === 'connecting' ? 'Connecting...' :
                                 status === 'error' ? 'Connection Error' :
                                 'Not Connected'}
                            </span>
                        </div>
                        
                        <button
                            onClick={status === 'connected' ? disconnectDevice : connectDevice}
                            disabled={status === 'connecting'}
                            className={`px-4 py-2 rounded-md font-medium ${
                                status === 'connected'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : status === 'connecting'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                        >
                            {status === 'connected' ? 'Disconnect' : 'Connect Device'}
                        </button>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                            {errorMessage}
                        </div>
                    )}

                    {/* Device Info */}
                    {deviceInfo && (
                        <div className="mt-6 border-t pt-4">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Device Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Firmware Name
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {deviceInfo.firmwareName || 'Unknown'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Firmware Version
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {deviceInfo.firmwareVersion || 'Unknown'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Device Name
                                    </label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {deviceInfo.deviceName || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Configuration Form */}
                {status === 'connected' && device && config && (
            <ConfigForm 
                config={config} 
                onConfigChange={handleConfigChange}
                device={device}
            />
        )}
            </div>
        </div>
    );
};

export default App;  // Added the export