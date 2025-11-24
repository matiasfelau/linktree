import { STREAM_URLS, CAMERA_IP } from "./config.js";
import { getNetworkType, isMobileNetwork, getBatteryLevel, isLowBattery, pingCamera } from "./utils.js";

export class VideoPlayer {
    constructor(videoElement) {
        this.video = videoElement;
        this.hls = null;
        this.index = 0;
        this.cameraIP = CAMERA_IP;
        this.isOnline = false;
        
        this.liveIndicator = document.getElementById('liveIndicator');
        this.offlineMessage = document.getElementById('offlineMessage');
        
        // Configurar event listeners para cambios de red y batería
        this.setupNetworkListeners();
    }

    setupNetworkListeners() {
        // Detectar cambios en la conexión de red
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                console.log('🔄 Cambio de red detectado');
                this.optimizeResources();
            });
        }

        // Detectar cambios en la batería
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                battery.addEventListener('levelchange', () => {
                    console.log('🔋 Cambio de nivel de batería detectado');
                    this.optimizeResources();
                });
                battery.addEventListener('chargingchange', () => {
                    console.log('🔌 Estado de carga cambió');
                    this.optimizeResources();
                });
            }).catch(err => {
                console.log('Battery API no disponible');
            });
        }
    }

    updateOnlineStatus() {
        if (this.isOnline) {
            this.liveIndicator.classList.remove('offline');
            this.offlineMessage.classList.remove('show');
            this.video.style.opacity = '1';
        } else {
            this.liveIndicator.classList.add('offline');
            this.offlineMessage.classList.add('show');
            this.video.style.opacity = '0.3';
        }
    }

    async optimizeResources() {
        if (!this.hls) return;
        
        const isMobile = isMobileNetwork();
        const battery = await getBatteryLevel();
        const lowBattery = isLowBattery(battery);
        
        // Aplicar optimizaciones según prioridad: batería baja > red móvil > normal
        if (lowBattery) {
            // Batería baja tiene máxima prioridad
            if (this.hls.config.maxBufferLength !== 5) {
                this.hls.config.maxBufferLength = 5;
                this.hls.config.maxMaxBufferLength = 10;
                console.log('🔋 Batería baja: buffer reducido al mínimo');
            }
        } else if (isMobile) {
            // Red móvil (4G/5G)
            if (this.hls.config.maxBufferLength !== 10) {
                this.hls.config.maxBufferLength = 10;
                this.hls.config.maxMaxBufferLength = 20;
                console.log('📱 Red móvil detectada: buffer reducido');
            }
        } else {
            // Condiciones normales (WiFi + batería normal)
            if (this.hls.config.maxBufferLength !== 30) {
                this.hls.config.maxBufferLength = 30;
                this.hls.config.maxMaxBufferLength = 60;
                console.log('✅ Condiciones óptimas: buffer estándar');
            }
        }
    }

    async loadVideo(i) {
        this.index = i;
        const url = STREAM_URLS[i];

        // Verificar disponibilidad del stream antes de cargar
        const streamAvailable = await pingCamera(url);
        
        if (!streamAvailable) {
            console.log('❌ Stream no disponible:', url);
            this.isOnline = false;
            this.updateOnlineStatus();
            return;
        }
        
        console.log('✅ Stream disponible, cargando:', url);
        this.isOnline = true;
        this.updateOnlineStatus();

        // Destruir instancia previa
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
            this.video.src = "";
        }

        // Cargar según soporte
        if (Hls.isSupported()) {
            this.hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                enableWorker: true,
                lowLatencyMode: false
            });
            
            this.hls.loadSource(url);
            this.hls.attachMedia(this.video);
            
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.video.play();
                // Optimizar solo una vez al cargar
                this.optimizeResources();
            });
            
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('Error fatal en HLS:', data);
                    this.isOnline = false;
                    this.updateOnlineStatus();
                }
            });
        } else if (this.video.canPlayType("application/vnd.apple.mpegurl")) {
            this.video.src = url;
            this.video.addEventListener("loadedmetadata", () => this.video.play());
        }
    }

    next() {
        this.index = (this.index + 1) % STREAM_URLS.length;
        this.loadVideo(this.index);
    }

    previous() {
        this.index = (this.index - 1 + STREAM_URLS.length) % STREAM_URLS.length;
        this.loadVideo(this.index);
    }

    destroy() {
        // Destruir HLS
        if (this.hls) {
            this.hls.destroy();
        }
    }
}
