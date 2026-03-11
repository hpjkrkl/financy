import { useKanso } from '../context/KansoContext';
import { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronUp, X, Layers, Clock, CheckCircle2, AlertCircle, Folder, Play, Loader2, RefreshCw, Zap, Eye, Power } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';
import ReceiptUpload from './ReceiptUpload';
import ReceiptReview from './ReceiptReview';
import ReceiptOCRService from '../services/receiptOCRService';

export default function ReceiptsPage() {
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [isUploading, setIsUploading] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState(null);
    const [ocrEnabled, setOcrEnabled] = useState(true);

    const ocrService = new ReceiptOCRService();

    const {
        receipts,
        TAX_RELIEF_CATEGORIES,
        taxReliefTotals,
        receiptStats,
        receiptSettings,
        setReceiptSettings,
        handleAddReceipt,
        handleUpdateReceipt,
        handleDeleteReceipt,
        ocrEngineState,
        startOcrEngine
    } = useKanso();

    const activeTaxYear = useMemo(() => {
        return receiptSettings.activeTaxYear ?? receiptSettings.defaultTaxYear;
    }, [receiptSettings.activeTaxYear, receiptSettings.defaultTaxYear]);

    const currentYearReceipts = useMemo(() => {
        return receipts.filter(r => (r.taxYear ?? activeTaxYear) === activeTaxYear);
    }, [receipts, activeTaxYear]);

    const availableTaxYears = useMemo(() => {
        return Array.from(new Set([
            activeTaxYear,
            ...(receipts.map(r => r.taxYear).filter(Boolean)),
            (new Date().getFullYear() + 1)
        ])).sort((a, b) => b - a);
    }, [receipts, activeTaxYear]);

    const collections = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return [
            {
                id: 'all',
                name: 'All Receipts',
                icon: Layers,
                count: currentYearReceipts.length,
                receipts: currentYearReceipts,
                color: '#2C2C2A'
            },
            {
                id: 'unverified',
                name: 'Needs Review',
                icon: AlertCircle,
                count: currentYearReceipts.filter(r => !r.isVerified).length,
                receipts: currentYearReceipts.filter(r => !r.isVerified),
                color: '#D4A574'
            },
            {
                id: 'verified',
                name: 'Verified',
                icon: CheckCircle2,
                count: currentYearReceipts.filter(r => r.isVerified).length,
                receipts: currentYearReceipts.filter(r => r.isVerified),
                color: '#8BA888'
            },
            {
                id: 'recent',
                name: 'Last 30 Days',
                icon: Clock,
                count: currentYearReceipts.filter(r => new Date(r.createdAt) >= thirtyDaysAgo).length,
                receipts: currentYearReceipts.filter(r => new Date(r.createdAt) >= thirtyDaysAgo),
                color: '#A8B4A5'
            },
            {
                id: 'this-month',
                name: 'This Month',
                icon: Clock,
                count: currentYearReceipts.filter(r => new Date(r.createdAt) >= thisMonthStart).length,
                receipts: currentYearReceipts.filter(r => new Date(r.createdAt) >= thisMonthStart),
                color: '#C9B896'
            },
            ...TAX_RELIEF_CATEGORIES.map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: Folder,
                count: currentYearReceipts.filter(r => r.finalCategory === cat.id).length,
                receipts: currentYearReceipts.filter(r => r.finalCategory === cat.id),
                color: cat.color
            }))
        ];
    }, [currentYearReceipts, TAX_RELIEF_CATEGORIES]);

    const activeCollection = collections.find(c => c.id === filterCategory) || collections[0];

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    const handleStartUpload = () => {
        setIsUploading(true);
        setError(null);
    };

    const handleScan = async (imageBase64, imageUrl) => {
        setError(null);
        if (ocrEnabled) {
            const data = await ocrService.extractReceiptData(imageBase64, {
                baseUrl: receiptSettings.ollamaBaseUrl,
                model: receiptSettings.ollamaModel
            });
            setExtractedData(data);
        } else {
            setExtractedData({
                merchant: '',
                amount: '',
                date: '',
                category: 'other',
                confidence: 0
            });
        }
        setPreviewUrl(imageUrl);
        setIsUploading(false);
    };

    const handleCancelUpload = () => {
        setIsUploading(false);
        setExtractedData(null);
        setPreviewUrl(null);
        setError(null);
    };

    const handleSaveReceipt = (receipt) => {
        handleAddReceipt(receipt);
        setExtractedData(null);
        setPreviewUrl(null);
        setError(null);
    };

    const handleCancelReview = () => {
        setExtractedData(null);
        setPreviewUrl(null);
        setError(null);
    };

    const handleViewReceiptImage = async (imagePath) => {
        if (!imagePath) return;
        try {
            await open(imagePath);
        } catch (error) {
            console.error('Failed to open image:', error);
        }
    };

    const getOcrButtonState = () => {
        switch (ocrEngineState.status) {
            case 'idle':
                return {
                    label: 'Start OCR',
                    icon: Play,
                    className: 'text-ink hover:text-ink-light',
                    disabled: false
                };
            case 'starting':
                return {
                    label: 'Starting…',
                    icon: Loader2,
                    className: 'text-ink-light animate-spin',
                    disabled: true
                };
            case 'ready':
                return {
                    label: 'OCR Ready',
                    icon: Zap,
                    className: 'text-sage',
                    disabled: false
                };
            case 'error':
                return {
                    label: 'Retry',
                    icon: RefreshCw,
                    className: 'text-red-600 hover:text-red-700',
                    disabled: false
                };
            default:
                return {
                    label: 'Start OCR',
                    icon: Play,
                    className: 'text-ink hover:text-ink-light',
                    disabled: false
                };
        }
    };

    const ocrButtonState = getOcrButtonState();
    const OcrButtonIcon = ocrButtonState.icon;

    if (isUploading) {
        return (
            <div className="animate-fade-in">
                <button
                    onClick={handleCancelUpload}
                    className="flex items-center gap-2 text-sm text-ink-light hover:text-ink mb-6 transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <ReceiptUpload
                    onScan={handleScan}
                    onCancel={handleCancelUpload}
                />
            </div>
        );
    }

    if (extractedData && previewUrl) {
        return (
            <div className="animate-fade-in">
                <ReceiptReview
                    extractedData={extractedData}
                    imageUrl={previewUrl}
                    onSave={handleSaveReceipt}
                    onCancel={handleCancelReview}
                />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-12">
            <section className="border border-sand/30 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={startOcrEngine}
                            disabled={ocrButtonState.disabled || !ocrEnabled}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper ${
                                ocrEngineState.status === 'ready' 
                                    ? 'border-sage bg-sage/5' 
                                    : 'border-sand/30 hover:border-sand/50'
                            } ${ocrButtonState.disabled || !ocrEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <OcrButtonIcon className={`w-4 h-4 ${ocrButtonState.className}`} />
                            <span className="text-sm font-medium text-ink">{ocrButtonState.label}</span>
                        </button>
                        <button
                            onClick={() => setOcrEnabled(!ocrEnabled)}
                            className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper ${
                                ocrEnabled 
                                    ? 'border-sage bg-sage/5 text-sage' 
                                    : 'border-sand/30 text-ink-light hover:border-sand/50'
                            }`}
                        >
                            <Power className="w-4 h-4" />
                            <span className="text-sm font-medium">{ocrEnabled ? 'OCR On' : 'OCR Off'}</span>
                        </button>
                        <div className="flex-1 min-w-0">
                            {ocrEngineState.status === 'idle' && ocrEnabled && (
                                <p className="text-xs text-ink-light">OCR engine is idle. Start to enable receipt scanning.</p>
                            )}
                            {ocrEngineState.status === 'starting' && ocrEnabled && (
                                <p className="text-xs text-ink-light">
                                    {ocrEngineState.stage === 'checking' && 'Checking Ollama connection…'}
                                    {ocrEngineState.stage === 'loading' && 'Loading OCR model…'}
                                    {ocrEngineState.stage === 'warming' && 'Warming up OCR engine…'}
                                    {ocrEngineState.stage === 'ready' && 'OCR engine is ready!'}
                                </p>
                            )}
                            {ocrEngineState.status === 'ready' && ocrEnabled && (
                                <p className="text-xs text-sage">OCR engine is ready. You can now upload and scan receipts.</p>
                            )}
                            {ocrEngineState.status === 'error' && ocrEnabled && (
                                <p className="text-xs text-red-600">{ocrEngineState.error || 'Failed to start OCR engine'}</p>
                            )}
                            {!ocrEnabled && (
                                <p className="text-xs text-ink-light">OCR is disabled. Receipts will be saved without automatic data extraction.</p>
                            )}
                        </div>
                    </div>
                    {ocrEngineState.status === 'starting' && (
                        <div className="w-32 sm:w-40">
                            <div className="w-full bg-sand/30 rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${ocrEngineState.progress}%`,
                                        backgroundColor: '#8BA888'
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs text-ink-light mt-1 text-right">{ocrEngineState.progress}%</p>
                        </div>
                    )}
                </div>
            </section>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-700 hover:text-red-900 transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700/30 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 sticky top-0 bg-paper/95 backdrop-blur-sm z-10 pb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <p className="tracking-widest text-xs uppercase text-ink-light">
                            Tax Year
                        </p>
                        <select
                            value={activeTaxYear}
                            onChange={(e) => {
                                const nextYear = Number(e.target.value);
                                if (!Number.isFinite(nextYear)) return;
                                setReceiptSettings(prev => ({ ...prev, activeTaxYear: nextYear }));
                                setExpandedCategory(null);
                                setFilterCategory('all');
                            }}
                            className="px-3 py-1.5 border border-sand/30 rounded-md bg-paper text-ink text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            {availableTaxYears.map((year) => (
                                <option key={year} value={year}>YA {year}</option>
                            ))}
                        </select>
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-ink">
                        Receipts
                    </h1>
                </div>
                <button
                    onClick={handleStartUpload}
                    className="flex items-center gap-2 px-5 py-3 bg-ink text-paper hover:bg-ink/90 transition-colors rounded-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Receipt</span>
                </button>
            </div>

            {/* Collections */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl text-ink">Collections</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {collections.slice(0, 6).map((collection) => {
                        const IconComponent = collection.icon;
                        const isActive = filterCategory === collection.id;
                        return (
                            <button
                                key={collection.id}
                                onClick={() => {
                                    setFilterCategory(collection.id);
                                }}
                                className={`p-4 border rounded-lg transition-all duration-200 ${
                                    isActive 
                                        ? 'border-ink bg-ink/5' 
                                        : 'border-sand/30 hover:border-sand/50 hover:bg-stone/5'
                                } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <IconComponent 
                                        className="w-5 h-5" 
                                        style={{ color: isActive ? '#2C2C2A' : collection.color }}
                                    />
                                    <span className={`text-xs font-medium ${isActive ? 'text-ink' : 'text-ink-light'}`}>
                                        {collection.name}
                                    </span>
                                    <span className={`text-lg font-serif ${isActive ? 'text-ink' : 'text-ink-light'}`}>
                                        {collection.count}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-sand/30 rounded-lg p-4">
                    <p className="text-xs text-ink-light mb-2">Total Receipts</p>
                    <p className="font-serif text-2xl text-ink">{receiptStats.totalReceipts}</p>
                </div>
                <div className="border border-sand/30 rounded-lg p-4">
                    <p className="text-xs text-ink-light mb-2">Total Claimed</p>
                    <p className="font-serif text-2xl text-ink">
                        RM{receiptStats.totalClaimed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="border border-sand/30 rounded-lg p-4">
                    <p className="text-xs text-ink-light mb-2">Verified</p>
                    <p className="font-serif text-2xl text-ink">{receiptStats.totalVerified}</p>
                </div>
                <div className="border border-sand/30 rounded-lg p-4">
                    <p className="text-xs text-ink-light mb-2">Unverified</p>
                    <p className="font-serif text-2xl text-ink">{receiptStats.totalUnverified}</p>
                </div>
            </div>

            {/* Tax Relief Progress */}
            <section>
                <h2 className="font-serif text-2xl text-ink mb-6">Tax Relief Progress</h2>
                <div className="space-y-4">
                    {TAX_RELIEF_CATEGORIES.filter(cat => cat.limit !== null).map((category) => {
                        const total = taxReliefTotals[category.id] || 0;
                        const progress = (total / category.limit) * 100;
                        const isOverLimit = total > category.limit;
                        const isNearLimit = total > category.limit * 0.9;

                        return (
                            <div
                                key={category.id}
                                className="border border-sand/30 rounded-lg p-4 cursor-pointer hover:border-sand/50 transition-colors active:bg-stone/10 focus-visible:outline-none"
                                onClick={() => toggleCategory(category.id)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-serif text-lg text-ink">{category.name}</h3>
                                        <p className="text-xs text-ink-light mt-1">
                                            RM{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / RM{category.limit.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {expandedCategory === category.id ? (
                                            <ChevronUp className="w-4 h-4 text-ink-light" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-ink-light" />
                                        )}
                                    </div>
                                </div>

                                <div className="w-full bg-sand/30 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(progress, 100)}%`,
                                            backgroundColor: isOverLimit ? '#dc2626' : isNearLimit ? '#f59e0b' : category.color
                                        }}
                                    ></div>
                                </div>

                                {isNearLimit && !isOverLimit && (
                                    <p className="text-xs text-amber-600 mt-2">
                                        Approaching RM{category.limit.toLocaleString()} {category.name} relief limit
                                    </p>
                                )}

                                {isOverLimit && (
                                    <p className="text-xs text-red-600 mt-2">
                                        Exceeded RM{category.limit.toLocaleString()} {category.name} relief limit
                                    </p>
                                )}

                                {expandedCategory === category.id && (
                                    <div className="mt-4 pt-4 border-t border-sand/30">
                                        <p className="text-xs text-ink-light mb-2">Recent receipts</p>
                                        {currentYearReceipts
                                            .filter(r => r.finalCategory === category.id)
                                            .slice(0, 3)
                                            .map((receipt) => (
                                                <div key={receipt.id} className="flex justify-between items-center text-sm py-2 border-b border-sand/20 last:border-0">
                                                    <span className="text-ink">{receipt.finalMerchant || 'Unknown'}</span>
                                                    <span className="text-ink-light">
                                                        RM{receipt.finalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                    </span>
                                                </div>
                                            ))}
                                        {currentYearReceipts.filter(r => r.finalCategory === category.id).length === 0 && (
                                            <p className="text-sm text-ink-light">No receipts in this category</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Collection View */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="font-serif text-2xl text-ink">{activeCollection.name}</h2>
                        <p className="text-sm text-ink-light mt-1">
                            {activeCollection.count} receipt{activeCollection.count !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                        }}
                        className="px-4 py-2 border border-sand/30 rounded-lg bg-paper text-ink text-sm focus:outline-none focus:border-sand/50"
                    >
                        {collections.map((col) => (
                            <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                    </select>
                </div>

                {activeCollection.receipts.length === 0 ? (
                    <div className="text-center py-12 border border-sand/30 rounded-lg">
                        <p className="text-ink-light mb-2">No receipts found</p>
                        <p className="text-sm text-ink-light">
                            {activeCollection.id === 'all' 
                                ? 'Add your first receipt to start tracking tax deductions'
                                : 'No receipts in this collection'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeCollection.receipts.map((receipt) => {
                            const category = TAX_RELIEF_CATEGORIES.find(c => c.id === receipt.finalCategory);
                            return (
                                <div
                                    key={receipt.id}
                                    className="border border-sand/30 rounded-lg p-4 hover:border-sand/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: category?.color || '#9A8A7A' }}
                                                ></span>
                                                <span className="text-xs text-ink-light">{category?.name || 'Other'}</span>
                                                {!receipt.isVerified && (
                                                    <span className="text-xs text-amber-600">Unverified</span>
                                                )}
                                                {receipt.isVerified && (
                                                    <span className="text-xs text-sage">Verified</span>
                                                )}
                                            </div>
                                            <h3 className="font-serif text-lg text-ink mb-1">
                                                {receipt.finalMerchant || 'Unknown Merchant'}
                                            </h3>
                                            <p className="text-sm text-ink-light">
                                                {receipt.finalDate || 'Unknown Date'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-serif text-lg text-ink">
                                                RM{receipt.finalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                            </p>
                                            <div className="flex flex-col gap-1 mt-1">
                                                {receipt.imagePath && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewReceiptImage(receipt.imagePath);
                                                        }}
                                                        className="flex items-center gap-1 text-xs text-ink-light hover:text-ink transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        View
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateReceipt(receipt.id, { isVerified: !receipt.isVerified });
                                                    }}
                                                    className="text-xs text-ink-light hover:text-ink transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                                                >
                                                    {receipt.isVerified ? 'Mark pending' : 'Mark verified'}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteReceipt(receipt.id);
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-700 transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700/30 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
