// Protección contra DevTools y F12
// Este archivo protege el código fuente y datos sensibles

class DevToolsProtection {
  private isDevToolsOpen = false;
  private threshold = 160;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Solo activar protección en producción
    if (process.env.NODE_ENV === 'production') {
      this.init();
    }
  }

  private init() {
    // Método 1: Detectar DevTools por dimensiones de la ventana
    // DESACTIVADO - Puede causar falsos positivos
    // this.detectDevTools();

    // Método 2: Deshabilitar click derecho
    this.disableRightClick();

    // Método 3: Deshabilitar atajos de teclado
    this.disableKeyboardShortcuts();

    // Método 4: Detectar debugger
    // DESACTIVADO - Puede causar falsos positivos
    // this.preventDebugger();

    // Método 5: Limpiar console.log en producción
    this.disableConsole();

    // Método 6: Proteger código fuente
    this.protectSourceCode();

    // Método 7: Detectar herramientas de inspección
    // DESACTIVADO - Puede causar falsos positivos
    // this.detectInspectionTools();
  }

  // Detectar si DevTools está abierto
  private detectDevTools() {
    const check = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > this.threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > this.threshold;
      const devToolsDetected = widthThreshold || heightThreshold;

      if (devToolsDetected && !this.isDevToolsOpen) {
        this.isDevToolsOpen = true;
        this.onDevToolsOpen();
      } else if (!devToolsDetected && this.isDevToolsOpen) {
        this.isDevToolsOpen = false;
      }
    };

    // Revisar cada 500ms
    this.checkInterval = setInterval(check, 500);

    // Revisar al cambiar tamaño de ventana
    window.addEventListener('resize', check);
  }

  // Acción cuando se detecta DevTools abierto
  private onDevToolsOpen() {
    // Opción 1: Redirigir a página en blanco (AGRESIVO - descomentarlo si quieres)
    // window.location.href = 'about:blank';

    // Opción 2: Mostrar advertencia y ofuscar contenido (RECOMENDADO)
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: #000;
        color: #fff;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1>⚠️ Acceso Denegado</h1>
          <p style="font-size: 18px; margin-top: 20px;">
            Las herramientas de desarrollo están deshabilitadas en este sitio.
          </p>
          <p style="font-size: 14px; color: #888; margin-top: 10px;">
            Por favor, cierra las DevTools para continuar.
          </p>
          <button
            onclick="window.location.reload()"
            style="
              margin-top: 30px;
              padding: 15px 30px;
              font-size: 16px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
            "
          >
            Recargar Página
          </button>
        </div>
      </div>
    `;

    // Opción 3: Solo mostrar alerta (SUAVE)
    // alert('⚠️ Por favor cierra las herramientas de desarrollo.');
  }

  // Deshabilitar click derecho
  private disableRightClick() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Deshabilitar atajos de teclado comunes
  private disableKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Abrir DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J (Consola)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C (Inspeccionar elemento)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (Ver código fuente)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl+S (Guardar página)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+I (Mac DevTools)
      if (e.metaKey && e.altKey && e.key === 'i') {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+J (Mac Console)
      if (e.metaKey && e.altKey && e.key === 'j') {
        e.preventDefault();
        return false;
      }

      // Cmd+Option+C (Mac Inspect)
      if (e.metaKey && e.altKey && e.key === 'c') {
        e.preventDefault();
        return false;
      }
    });
  }

  // Prevenir uso de debugger
  private preventDebugger() {
    setInterval(() => {
      // Este código detecta si hay un debugger activo
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      // debugger; // Comentado para no molestar en desarrollo
      const end = performance.now();

      // Si toma más de 100ms, probablemente hay un debugger
      if (end - start > 100) {
        this.onDevToolsOpen();
      }
    }, 1000);
  }

  // Deshabilitar console en producción
  private disableConsole() {
    if (process.env.NODE_ENV === 'production') {
      // Sobrescribir todos los métodos de console
      const noop = () => {};

      window.console = {
        ...window.console,
        log: noop,
        debug: noop,
        info: noop,
        warn: noop,
        error: noop,
        trace: noop,
        table: noop,
        dir: noop,
        dirxml: noop,
        group: noop,
        groupCollapsed: noop,
        groupEnd: noop,
        clear: noop,
        count: noop,
        countReset: noop,
        assert: noop,
        profile: noop,
        profileEnd: noop,
        time: noop,
        timeLog: noop,
        timeEnd: noop,
        timeStamp: noop,
        context: noop,
        memory: undefined as any,
      };
    }
  }

  // Proteger código fuente
  private protectSourceCode() {
    // Deshabilitar selección de texto (opcional - puede ser molesto para usuarios)
    // document.body.style.userSelect = 'none';
    // document.body.style.webkitUserSelect = 'none';
    // document.body.style.msUserSelect = 'none';

    // Prevenir arrastrar y soltar
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });

    // Prevenir copiar (opcional - puede ser molesto)
    // document.addEventListener('copy', (e) => {
    //   e.preventDefault();
    //   return false;
    // });
  }

  // Detectar herramientas de inspección avanzadas
  private detectInspectionTools() {
    // Detectar Firebug
    if (window.console && (window.console as any).firebug) {
      this.onDevToolsOpen();
    }

    // Detectar si window.console ha sido modificado
    const consoleCheck = /./;
    consoleCheck.toString = function() {
      this.onDevToolsOpen();
      return '';
    }.bind(this);

    // Esto solo se ejecuta si la consola está abierta
    setTimeout(() => {
      console.log(consoleCheck);
    }, 100);
  }

  // Método para destruir la protección (útil para testing)
  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Crear instancia singleton
const devToolsProtection = new DevToolsProtection();

export default devToolsProtection;
