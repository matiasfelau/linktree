export function getNetworkType() {
    if (navigator.connection?.effectiveType) {
        return navigator.connection.effectiveType;
    }
    return "unknown";
}

export function isMobileNetwork() {
    const connection = navigator.connection;
    if (!connection) return false;
    
    const type = connection.effectiveType;
    const mobileTypes = ['slow-2g', '2g', '3g', '4g'];
    
    return mobileTypes.includes(type) || connection.type === 'cellular';
}

export async function getBatteryLevel() {
    try {
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            return {
                level: battery.level,
                charging: battery.charging
            };
        }
    } catch (error) {
        console.log('Battery API not supported');
    }
    return { level: 1, charging: false };
}

export function isLowBattery(batteryInfo) {
    return batteryInfo.level < 0.20 && !batteryInfo.charging;
}

export async function pingCamera(streamUrl) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(streamUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal,
            cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        return true;
    } catch (error) {
        // Si falla el ping, no significa que el stream esté caído
        // mode: 'no-cors' siempre devuelve un error en fetch
        // Asumimos que está online si no hay timeout
        return error.name !== 'AbortError';
    }
}
