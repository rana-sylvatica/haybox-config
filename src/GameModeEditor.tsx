import { useState } from 'react';
import { Button, GameModeId, GameModeConfig, ButtonRemap, SocdPair } from 'haybox-webserial';

interface GameModeEditorProps {
    mode: GameModeConfig;
    onSave: (updatedMode: GameModeConfig) => void;
    onClose: () => void;
}

const GameModeEditor = ({ mode, onSave, onClose }: GameModeEditorProps) => {
    const [editedMode, setEditedMode] = useState<GameModeConfig>(new GameModeConfig(mode));

    const updateMode = (updates: Partial<GameModeConfig>) => {
        // Create a new GameModeConfig with the updates
        setEditedMode(new GameModeConfig({
            ...editedMode,
            ...updates
        }));
    };

    const addRemapping = () => {
        const newRemap = new ButtonRemap({
            physicalButton: Button.BTN_UNSPECIFIED,
            activates: Button.BTN_UNSPECIFIED
        });

        const newRemappings = [...(editedMode.buttonRemapping || []), newRemap];
        
        updateMode({
            buttonRemapping: newRemappings
        });
    };

    const updateRemapping = (index: number, field: keyof ButtonRemap, value: number) => {
        const newRemapping = [...(editedMode.buttonRemapping || [])];
        newRemapping[index] = new ButtonRemap({
            ...newRemapping[index],
            [field]: value
        });
        
        updateMode({
            buttonRemapping: newRemapping
        });
    };

    const removeRemapping = (index: number) => {
        const newRemapping = [...(editedMode.buttonRemapping || [])];
        newRemapping.splice(index, 1);
        updateMode({
            buttonRemapping: newRemapping
        });
    };

    // Create array of button options for dropdowns
    const buttonOptions = Object.entries(Button)
        .map(([key, value]) => ({ 
            label: key.replace('BTN_', '').replace('_', ' '), 
            value 
        }))
        .filter(option => typeof option.value === 'number');

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Edit Game Mode: {editedMode.name || GameModeId[editedMode.modeId]}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    {/* Basic Settings */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Mode Name
                            </label>
                            <input
                                type="text"
                                value={editedMode.name || ''}
                                onChange={(e) => updateMode({ name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Button Remapping Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Button Remapping
                            </h3>
                            <button
                                onClick={addRemapping}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                            >
                                Add Mapping
                            </button>
                        </div>

                        <div className="space-y-4">
                            {editedMode.buttonRemapping?.map((remap, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Physical Button
                                        </label>
                                        <select
                                            value={remap.physicalButton}
                                            onChange={(e) => updateRemapping(index, 'physicalButton', parseInt(e.target.value))}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {buttonOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex-none pt-6">
                                        <span className="text-gray-500">maps to</span>
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Activates
                                        </label>
                                        <select
                                            value={remap.activates}
                                            onChange={(e) => updateRemapping(index, 'activates', parseInt(e.target.value))}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {buttonOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => removeRemapping(index)}
                                        className="flex-none mt-6 text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            {(!editedMode.buttonRemapping || editedMode.buttonRemapping.length === 0) && (
                                <div className="text-center py-4 text-gray-500">
                                    No button remapping configured. Click "Add Mapping" to start.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(editedMode)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameModeEditor;