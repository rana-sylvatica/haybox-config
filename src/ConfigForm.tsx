import { useState } from 'react';
import { Config, GameModeId, GameModeConfig, HayBoxDevice } from 'haybox-webserial';
import GameModeEditor from './GameModeEditor';

interface ConfigFormProps {
    config: Config;
    onConfigChange: (config: Config) => void;
    device: HayBoxDevice;
}

const ConfigForm = ({ config, onConfigChange, device }: ConfigFormProps) => {
    const [editingMode, setEditingMode] = useState<GameModeConfig | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveError, setSaveError] = useState('');

    const createNewGameMode = () => {
        const newMode = new GameModeConfig({
            modeId: GameModeId.MODE_UNSPECIFIED,
            name: "New Mode",
            buttonRemapping: [],
            socdPairs: [],
            activationBinding: [],
            customModeConfig: 0,
            keyboardModeConfig: 0,
            rgbConfig: 0
        });
        setEditingMode(newMode);
    };

    const saveToController = async () => {
        if (!device) return;

        setIsSaving(true);
        setSaveStatus('idle');
        setSaveError('');

        try {
            const protoConfig = new Config({
                ...config // This will copy all fields from the existing config
            });

            const success = await device.setConfig(protoConfig);
            
            if (success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                throw new Error('Failed to save configuration');
            }
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setSaveError(error instanceof Error ? error.message : 'Failed to save configuration');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGameModeUpdate = (updatedMode: GameModeConfig) => {
        const newConfigs = [...(config.gameModeConfigs || [])];
        const index = newConfigs.findIndex(mode => 
            mode.name === editingMode?.name && 
            mode.modeId === editingMode?.modeId
        );
        
        if (index >= 0) {
            newConfigs[index] = updatedMode;
        } else {
            newConfigs.push(updatedMode);
        }
        
        onConfigChange(new Config({
            ...config,
            gameModeConfigs: newConfigs
        }));
        setEditingMode(null);
    };

    return (
        <div className="space-y-6">
            {/* Status Messages */}
            {(saveStatus === 'success' || saveStatus === 'error') && (
                <div className={`p-4 rounded-md ${
                    saveStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {saveStatus === 'success' ? (
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <h3 className={`text-sm font-medium ${
                                saveStatus === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {saveStatus === 'success' 
                                    ? 'Configuration saved successfully!' 
                                    : saveError || 'Failed to save configuration'}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Modes Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Game Modes</h3>
                
                {/* Game Mode List */}
                <div className="space-y-4">
                    {config.gameModeConfigs?.map((mode, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="font-medium">
                                        {(mode.name || GameModeId[mode.modeId] || `Mode ${index + 1}`) + ': '}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {mode.buttonRemapping?.length || 0} remapped buttons
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setEditingMode(mode)}
                                        className="px-3 py-1 text-blue-600 hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this mode?')) {
                                                const newConfigs = config.gameModeConfigs?.filter((m, i) => i !== index) || [];
                                                onConfigChange(new Config({
                                                    ...config,
                                                    gameModeConfigs: newConfigs,
                                                }));
                                            }
                                        }}
                                        className="px-3 py-1 text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600 hover:border-gray-400 hover:text-gray-700"
                        onClick={createNewGameMode}
                    >
                        Add Game Mode
                    </button>
                </div>

                {/* Game Mode Editor Modal */}
                {editingMode && (
                    <GameModeEditor
                        mode={editingMode}
                        onSave={handleGameModeUpdate}
                        onClose={() => setEditingMode(null)}
                    />
                )}
            </div>

            {/* Save Button */}
            <div className="sticky bottom-0 bg-white border-t shadow-lg p-4 mt-8">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        {isSaving ? 'Saving...' : 
                         saveStatus === 'success' ? 'Last save: Successful' :
                         saveStatus === 'error' ? 'Last save: Failed' : 
                         'Ready to save'}
                    </div>
                    <button
                        onClick={saveToController}
                        disabled={isSaving}
                        className={`inline-flex items-center px-4 py-2 rounded-md font-medium ${
                            isSaving
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save to Controller'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigForm;