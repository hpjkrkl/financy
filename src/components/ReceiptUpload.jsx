import { useState, useRef } from 'react';
import { Upload, X, Camera, RefreshCw, RotateCw } from 'lucide-react';

export default function ReceiptUpload({ onScan, onCancel }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [rotation, setRotation] = useState(0);
    const fileInputRef = useRef(null);

    const rotateDataUrl = (dataUrl, degrees) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const radians = (degrees * Math.PI) / 180;
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Unable to rotate image.'));
                    return;
                }

                const width = img.width;
                const height = img.height;
                const swapSides = Math.abs(degrees) % 180 === 90;
                canvas.width = swapSides ? height : width;
                canvas.height = swapSides ? width : height;

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(radians);
                ctx.drawImage(img, -width / 2, -height / 2);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => reject(new Error('Unable to rotate image.'));
            img.src = dataUrl;
        });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Image file is too large. Please select a file under 10MB');
            return;
        }

        setError(null);
        setSelectedFile(file);
        setRotation(0);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleScan = async () => {
        if (!previewUrl) return;

        setIsScanning(true);
        setError(null);

        try {
            const imageBase64 = previewUrl.split(',')[1];
            await onScan(imageBase64, previewUrl);
        } catch (err) {
            setError(err?.message || 'Failed to scan receipt. Please try again or enter details manually.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleRetake = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        setRotation(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRotate = async () => {
        if (!previewUrl || isScanning) return;
        setError(null);
        try {
            const nextRotation = (rotation + 90) % 360;
            const rotated = await rotateDataUrl(previewUrl, 90);
            setPreviewUrl(rotated);
            setRotation(nextRotation);
        } catch (err) {
            setError(err?.message || 'Unable to rotate image.');
        }
    };

    return (
        <div className="space-y-6">
            {!previewUrl ? (
                <div className="border-2 border-dashed border-sand/30 rounded-lg p-12 text-center hover:border-sand/50 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="receipt-upload"
                    />
                    
                    <label
                        htmlFor="receipt-upload"
                        className="cursor-pointer block"
                    >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-ink-light" />
                        <p className="text-ink mb-2">Upload receipt image</p>
                        <p className="text-sm text-ink-light">
                            Click to browse or drag and drop
                        </p>
                        <p className="text-xs text-ink-light mt-2">
                            Supports: JPG, PNG, HEIC (max 10MB)
                        </p>
                    </label>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="border border-sand/30 rounded-lg p-4">
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Receipt preview"
                                className="w-full max-h-96 object-contain rounded-lg"
                            />
                            <button
                                onClick={handleRetake}
                                className="absolute top-2 right-2 p-2 bg-paper/90 rounded-full hover:bg-paper transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                            >
                                <X className="w-4 h-4 text-ink" />
                            </button>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-ink-light">
                                {selectedFile?.name}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleRotate}
                                    disabled={isScanning}
                                    className="flex items-center gap-2 text-sm text-ink-light hover:text-ink transition-colors active:opacity-60 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                                >
                                    <RotateCw className="w-4 h-4" />
                                    Rotate
                                </button>
                                <button
                                    onClick={handleRetake}
                                    className="flex items-center gap-2 text-sm text-ink-light hover:text-ink transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleScan}
                            disabled={isScanning}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-ink text-paper rounded-lg hover:bg-ink/90 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            {isScanning ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4" />
                                    Scan Receipt
                                </>
                            )}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={isScanning}
                            className="px-6 py-3 border border-sand/30 rounded-lg hover:border-sand/50 transition-colors active:scale-[0.98] active:bg-stone/10 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            Cancel
                        </button>
                    </div>

                    {isScanning && (
                        <div className="text-center py-4">
                            <p className="text-sm text-ink-light mb-2">
                                Analyzing receipt with local OCR...
                            </p>
                            <p className="text-xs text-ink-light">
                                This may take a few seconds
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
