const OCR_PROMPT = `Extract the following information from this receipt image and return ONLY a valid JSON object with this exact structure:
{
  "merchant": "merchant name",
  "amount": "total amount as number",
  "date": "date in YYYY-MM-DD format",
  "category": "one of: medical, lifestyle, sports, education, or other"
}

Rules:
- Extract the merchant/store name from the receipt header
- Find the total amount/grand total/tax amount
- Extract the date (convert to YYYY-MM-DD format)
- Infer category based on merchant name and items (medical/healthcare, lifestyle/shopping, sports/fitness, education/schools, or other)
- Return ONLY the JSON object, no extra text
- If any field cannot be determined, set it to null
- Amount must be a number, not a string`;

class ReceiptOCRService {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || 'http://localhost:11434';
        this.model = config.model || 'moondream';
        this.timeout = config.timeout || 120000;
    }

    async extractReceiptData(imageBase64, options = {}) {
        const { baseUrl = this.baseUrl, model = this.model } = options;
        const timeoutMs = typeof options.timeout === 'number' ? options.timeout : this.timeout;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, timeoutMs);

            const response = await fetch(`${baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    prompt: OCR_PROMPT,
                    images: [imageBase64],
                    stream: false,
                    options: {
                        temperature: 0.1,
                        top_p: 0.9,
                        num_predict: 500
                    }
                }),
                signal: controller.signal
            }).finally(() => {
                clearTimeout(timeoutId);
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || `Ollama API error: ${response.status} ${response.statusText}`,
                    { cause: errorData }
                );
            }

            const data = await response.json();
            
            if (!data.response) {
                throw new Error('No response from Ollama', { cause: data });
            }

            const extractedData = this.parseResponse(data.response);
            return {
                ...extractedData,
                confidence: this.estimateConfidence(data.response)
            };

        } catch (error) {
            if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
                const timeoutError = new Error(
                    'Scan timed out. Ollama may be warming up — please try again.'
                );
                timeoutError.cause = error;
                throw timeoutError;
            }
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                const connectionError = new Error(
                    'Cannot connect to Ollama. Please ensure Ollama is running locally at ' + baseUrl
                );
                connectionError.cause = error;
                throw connectionError;
            }

            throw error;
        }
    }

    parseResponse(responseText) {
        try {
            const cleanText = responseText
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .trim();

            const parsed = JSON.parse(cleanText);

            return {
                merchant: parsed.merchant || null,
                amount: parsed.amount ? parseFloat(parsed.amount) : null,
                date: parsed.date || null,
                category: parsed.category || 'other',
                rawResponse: responseText
            };
        } catch (error) {
            console.error('Failed to parse OCR response:', error);
            return this.extractDataWithFallback(responseText);
        }
    }

    extractDataWithFallback(responseText) {
        const fallbackData = {
            merchant: null,
            amount: null,
            date: null,
            category: 'other',
            rawResponse: responseText
        };

        const amountMatch = responseText.match(/amount["\s:]+(\d+\.?\d*)/i);
        if (amountMatch) {
            fallbackData.amount = parseFloat(amountMatch[1]);
        }

        const merchantMatch = responseText.match(/merchant["\s:]+([^,}\n]+)/i);
        if (merchantMatch) {
            fallbackData.merchant = merchantMatch[1].trim().replace(/"/g, '');
        }

        const dateMatch = responseText.match(/date["\s:]+(\d{4}-\d{2}-\d{2})/i);
        if (dateMatch) {
            fallbackData.date = dateMatch[1];
        }

        const categoryMatch = responseText.match(/category["\s:]+(medical|lifestyle|sports|education|other)/i);
        if (categoryMatch) {
            fallbackData.category = categoryMatch[1].toLowerCase();
        }

        return fallbackData;
    }

    estimateConfidence(responseText) {
        let confidence = 0.5;

        if (responseText.includes('null')) {
            confidence -= 0.2;
        }

        const hasMerchant = /merchant["\s:]+[^,}\n]+/i.test(responseText);
        const hasAmount = /amount["\s:]+\d+\.?\d*/i.test(responseText);
        const hasDate = /date["\s:]+\d{4}-\d{2}-\d{2}/i.test(responseText);
        const hasCategory = /category["\s:]+(medical|lifestyle|sports|education|other)/i.test(responseText);

        const filledFields = [hasMerchant, hasAmount, hasDate, hasCategory].filter(Boolean).length;
        confidence += (filledFields * 0.1);

        if (responseText.includes('```json') && responseText.includes('```')) {
            confidence += 0.1;
        }

        return Math.min(Math.max(confidence, 0), 1);
    }

    async checkOllamaConnection(options = {}) {
        const { baseUrl = this.baseUrl } = options;

        try {
            const response = await fetch(`${baseUrl}/api/tags`, {
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`Ollama API returned ${response.status}`);
            }

            const data = await response.json();
            
            const hasMoondream = data.models?.some(
                model => model.name.includes('moondream')
            );

            return {
                connected: true,
                hasMoondream,
                models: data.models?.map(m => m.name) || []
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
                hasMoondream: false
            };
        }
    }

    async pullMoondreamModel(options = {}) {
        const { baseUrl = this.baseUrl } = options;

        try {
            const response = await fetch(`${baseUrl}/api/pull`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'moondream',
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to pull moondream: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to download moondream model: ${error.message}`, { cause: error });
        }
    }
}

export default ReceiptOCRService;
