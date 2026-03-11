import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { X, Check, Edit2 } from 'lucide-react';

export default function ReceiptReview({ extractedData, imageUrl, onSave, onCancel }) {
    const computeTaxYear = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const match = dateStr.match(/^(\d{4})-\d{2}-\d{2}$/);
        if (!match) return null;
        const year = Number(match[1]);
        if (!Number.isFinite(year)) return null;
        return year + 1;
    };

    const [formData, setFormData] = useState({
        merchant: extractedData.merchant || '',
        amount: extractedData.amount || '',
        date: extractedData.date || '',
        taxYear: computeTaxYear(extractedData.date),
        category: extractedData.category || 'other',
        confidence: extractedData.confidence || 0
    });

    const saveImageToDisk = async (imageDataUrl, filename) => {
        try {
            const base64Data = imageDataUrl.split(',')[1];
            const filePath = await invoke('save_receipt_image', {
                imageBase64: base64Data,
                filename: filename
            });
            return filePath;
        } catch (error) {
            console.error('Failed to save image:', error);
            return null;
        }
    };

    const handleFieldEdit = (field, value) => {
        if (field === 'date') {
            const computedTaxYear = computeTaxYear(value);
            setFormData(prev => ({ ...prev, date: value, taxYear: computedTaxYear ?? prev.taxYear }));
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const timestamp = Date.now();
        const filename = `receipt_${timestamp}.png`;
        const filePath = await saveImageToDisk(imageUrl, filename);

        const receipt = {
            imageUrl,
            imagePath: filePath || null,
            rawExtractedData: extractedData,
            finalMerchant: formData.merchant,
            finalAmount: parseFloat(formData.amount) || 0,
            finalDate: formData.date,
            taxYear: formData.taxYear || null,
            finalCategory: formData.category,
            ocrConfidence: formData.confidence,
            isVerified: false
        };
        onSave(receipt);
    };

    const TAX_RELIEF_CATEGORIES = [
        { id: 'medical', name: 'Medical' },
        { id: 'lifestyle', name: 'Lifestyle' },
        { id: 'sports', name: 'Sports' },
        { id: 'education', name: 'Education' },
        { id: 'other', name: 'Other' }
    ];

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-amber-600';
        return 'text-red-600';
    };

    const getConfidenceText = (confidence) => {
        if (confidence >= 0.8) return 'High confidence';
        if (confidence >= 0.6) return 'Medium confidence';
        return 'Low confidence - please verify';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="tracking-widest text-xs uppercase mb-2 text-ink-light">
                        Review & Confirm
                    </p>
                    <h2 className="font-serif text-3xl text-ink">
                        Receipt Details
                    </h2>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-sand/10 rounded-lg transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                    <X className="w-5 h-5 text-ink" />
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-sand/30 rounded-lg overflow-hidden">
                    <img
                        src={imageUrl}
                        alt="Receipt"
                        className="w-full h-auto object-contain"
                    />
                </div>

                <div className="space-y-4">
                    <div className="bg-sand/10 border border-sand/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-medium ${getConfidenceColor(formData.confidence)}`}>
                                {getConfidenceText(formData.confidence)}
                            </span>
                            <span className="text-xs text-ink-light">
                                ({Math.round(formData.confidence * 100)}%)
                            </span>
                        </div>
                        <p className="text-xs text-ink-light">
                            Please verify all details below before saving
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-ink-light uppercase tracking-wider mb-1 block">
                                Merchant
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                type="text"
                                value={formData.merchant}
                                onChange={(e) => handleFieldEdit('merchant', e.target.value)}
                                className="flex-1 px-3 py-2 border border-sand/30 rounded-lg bg-paper text-ink text-sm focus:outline-none focus:border-sand/50"
                            />
                            <div className="p-2">
                                <Edit2 className="w-4 h-4 text-ink-light" />
                            </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-ink-light uppercase tracking-wider mb-1 block">
                                Amount (RM)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => handleFieldEdit('amount', e.target.value)}
                                className="flex-1 px-3 py-2 border border-sand/30 rounded-lg bg-paper text-ink text-sm focus:outline-none focus:border-sand/50"
                            />
                            <div className="p-2">
                                <Edit2 className="w-4 h-4 text-ink-light" />
                            </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-ink-light uppercase tracking-wider mb-1 block">
                                Date
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleFieldEdit('date', e.target.value)}
                                className="flex-1 px-3 py-2 border border-sand/30 rounded-lg bg-paper text-ink text-sm focus:outline-none focus:border-sand/50"
                            />
                            <div className="p-2">
                                <Edit2 className="w-4 h-4 text-ink-light" />
                            </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-ink-light uppercase tracking-wider mb-1 block">
                                Tax Year (YA)
                            </label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={formData.taxYear || ''}
                                    onChange={(e) => handleFieldEdit('taxYear', e.target.value ? Number(e.target.value) : null)}
                                    className="flex-1 px-3 py-2 border border-sand/30 rounded-lg bg-paper text-ink text-sm focus:outline-none focus:border-sand/50"
                                >
                                    <option value="">Unknown</option>
                                    {Array.from({ length: 7 }, (_, i) => (new Date().getFullYear() + 1) - i).map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <div className="p-2">
                                    <Edit2 className="w-4 h-4 text-ink-light" />
                                </div>
                            </div>
                            <p className="text-xs text-ink-light mt-2">
                                Receipt date year + 1 (e.g. 2025 receipt → YA 2026)
                            </p>
                        </div>

                        <div>
                            <label className="text-xs text-ink-light uppercase tracking-wider mb-1 block">
                                Tax Relief Category
                            </label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleFieldEdit('category', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-sand/30 rounded-lg bg-paper text-ink text-sm focus:outline-none focus:border-sand/50"
                                >
                                    {TAX_RELIEF_CATEGORIES.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="p-2">
                                    <Edit2 className="w-4 h-4 text-ink-light" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleSave}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-ink text-paper rounded-lg hover:bg-ink/90 transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            <Check className="w-4 h-4" />
                            Save Receipt
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 border border-sand/30 rounded-lg hover:border-sand/50 transition-colors active:scale-[0.98] active:bg-stone/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
