# DR.IANKA · Orientación Médica Virtual

DR.IANKA es un asistente médico virtual interactivo que permite a los usuarios realizar una pre-evaluación rápida de sus síntomas mediante una interfaz conversacional amigable y moderna. El objetivo es brindar recomendaciones preliminares instantáneas y canalizar el caso hacia una teleconsulta médica si es necesario.

## Instalación

Este proyecto está construido exclusivamente con tecnologías web nativas (HTML5, CSS3 y JavaScript vanilla), por lo que no requiere de dependencias externas complejas ni compiladores.

Para ejecutar el proyecto localmente:

1. Clona o descarga este repositorio en tu máquina local.
2. Inicia un servidor web local en la carpeta raíz del proyecto. Si utilizas Visual Studio Code, puedes usar la extensión **Live Server**, o bien ejecutar desde tu terminal:
   ```bash
   # Si tienes Python instalado
   python -m http.server 8000
   
   # O si usas Node.js (con serve)
   npx serve .
   ```
3. Abre tu navegador y accede a la dirección local (por ejemplo, `http://localhost:8000` o `http://localhost:3000`).

## Uso

1. **Pantalla de Inicio (`index.html`)**: Haz clic en **Consultar ahora** para comenzar.
2. **Paso 1 - Datos Básicos**: Ingresa tu nombre (opcional), edad y sexo, luego presiona **Continuar al chat**.
3. **Paso 2 - Chatbot de Síntomas**:
   - Interactúa con **DR.IANKA** escribiendo tus síntomas en lenguaje natural (ej. *"tengo fiebre y tos"*) o haciendo clic directamente sobre las sugerencias en formato de chips.
   - Si no presentas más molestias, puedes indicarlo mediante el botón de sugerencia especial **Ya no tengo más síntomas** o respondiendo *"no"*.
   - Indica los días que llevas enfermo (ej. *"hace 3 días"*).
4. **Resultados e Indicaciones**:
   - El chatbot procesará localmente tu información y te indicará si tu caso califica como **Caso Leve** o si requiere **Atención Requerida**.
   - Haz clic en **Ver diagnóstico completo** para ir a la vista de análisis (`carga.html`) y luego a las recomendaciones detalladas en la pantalla de diagnóstico (`diagnostico.html`).
   - Puedes agendar una cita médica de inmediato seleccionando **Hablar con un médico**.

## Estructura del Proyecto

Las carpetas y archivos están ordenados de la siguiente manera:

```
plantillas/
├── css/
│   ├── base.css          # Estilos compartidos (reset, body, card, botones, custom alert)
│   ├── index.css         # Estilos específicos de la pantalla de inicio
│   ├── formulario.css    # Estilos del formulario y burbujas de conversación del Chatbot
│   ├── carga.css         # Animaciones de progreso y dots de carga
│   ├── diagnostico.css   # Presentación visual del diagnóstico y recomendaciones
│   ├── teleconsulta.css  # Chips de selección de horario
│   └── confirmacion.css  # Pantalla final de éxito
├── js/
│   ├── formulario.js     # Lógica conversacional del chatbot, keywords y análisis de gravedad
│   ├── diagnostico.js    # Carga de datos de sesión y recomendaciones dinámicas
│   └── teleconsulta.js   # Interacción con la agenda de horarios de consulta
├── index.html            # Landing / Inicio
├── formulario.html       # Interfaz del usuario y chatbot conversacional
├── carga.html            # Animación de transición de análisis
├── diagnostico.html      # Reporte detallado del estado del paciente
├── teleconsulta.html     # Reservación de citas médicas
└── confirmacion.html     # Mensaje final de registro exitoso
```
