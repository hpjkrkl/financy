import { useState, useEffect, useCallback, useRef } from 'react';

const isTauri = () => {
    try {
        return window.__TAURI__ !== undefined;
    } catch {
        return false;
    }
};

let storeInstance = null;

async function getStore() {
    if (!isTauri()) return null;
    
    if (storeInstance) return storeInstance;
    
    try {
        const { load } = await import('@tauri-apps/plugin-store');
        storeInstance = await load('kanso-data.json', { autoSave: true });
        return storeInstance;
    } catch (error) {
        console.warn('Failed to load Tauri store, falling back to localStorage:', error);
        return null;
    }
}

export function useTauriStorage(key, initialValue) {
    const [value, setValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(true);
    const isInitialized = useRef(false);
    const isTauriEnvRef = useRef(isTauri());
    const initialValueRef = useRef(initialValue);

    useEffect(() => {
        let isCancelled = false;

        async function loadValue() {
            try {
                if (isTauriEnvRef.current) {
                    const store = await getStore();
                    if (isCancelled || isInitialized.current) return;
                    
                    if (store) {
                        const storedValue = await store.get(key);
                        if (!isCancelled && !isInitialized.current) {
                            setValue(storedValue !== null ? storedValue : initialValueRef.current);
                            setIsLoading(false);
                            isInitialized.current = true;
                        }
                        return;
                    }
                }
                
                if (isCancelled || isInitialized.current) return;

                const item = localStorage.getItem(key);
                if (!isCancelled && !isInitialized.current) {
                    setValue(item ? JSON.parse(item) : initialValueRef.current);
                    setIsLoading(false);
                    isInitialized.current = true;
                }
            } catch (error) {
                if (!isCancelled && !isInitialized.current) {
                    console.warn(`Error loading storage key "${key}":`, error);
                    setValue(initialValueRef.current);
                    setIsLoading(false);
                    isInitialized.current = true;
                }
            }
        }

        loadValue();

        return () => {
            isCancelled = true;
        };
    }, [key]);

    const setStoredValue = useCallback(async (newValue) => {
        try {
            if (isTauriEnvRef.current) {
                const store = await getStore();
                if (store) {
                    await store.set(key, newValue);
                    setValue(newValue);
                    return;
                }
            }
            
            localStorage.setItem(key, JSON.stringify(newValue));
            setValue(newValue);
        } catch (error) {
            console.warn(`Error setting storage key "${key}":`, error);
        }
    }, [key]);

    return [value, setStoredValue, isLoading];
}
