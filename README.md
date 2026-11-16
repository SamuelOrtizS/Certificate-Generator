# 📜 IEEE ComSoc — Generador de Certificados en Lote

Aplicación web para la generación masiva de certificados en formato **PDF A4 Horizontal (Landscape)** a partir de una plantilla base (imagen o PDF), con definición visual e interactiva de un **área segura**, soporte de tipografías dinámicas (fuente por defecto **Allura** de Google Fonts), entrada de nombres manual o por **CSV**, y exportación directa a carpeta local o empaquetado en archivo **ZIP**.

---

## 🌟 Características Principales

- **📄 Plantilla Flexible:** Carga plantillas en formato de imagen (`.jpg`, `.jpeg`, `.png`, `.webp`) o documentos `.pdf`. Cuenta con un botón para precargar una plantilla de ejemplo.
- **🎯 Área Segura Interactiva:** Selecciona y ajusta el área donde irá el nombre del participante arrastrando y redimensionando con 8 controles de ajuste sobre la previsualización en tiempo real.
- **🖋️ Tipografías Dinámicas:**
  - Fuente predeterminada: **Allura** (caligráfica elegante de Google Fonts).
  - Incluye selector con múltiples fuentes (*Great Vibes, Alex Brush, Dancing Script, Parisienne, Pinyon Script, Sacramento, Montserrat, Playfair Display*).
  - Admite carga de fuentes personalizadas (`.ttf` o `.otf`).
  - Auto-ajuste de escala para que los nombres extensos no se desborden del área segura.
  - Selector de color de texto con muestras rápidas (blanco por defecto para fondos oscuros, negro, dorado, azul IEEE).
- **👥 Carga de Nombres en Lote:**
  - Campo de texto para pegar o escribir múltiples nombres separados por salto de línea (`Enter`).
  - Carga masiva mediante archivo **CSV**, extrayendo automáticamente los valores de la **primera columna**.
- **📁 Salida y Nomenclatura:**
  - Entrada de **Nombre del Certificado** (ej. `CertificadoOrganizador`).
  - Selección de **Directorio de Salida** local mediante la API nativa de acceso al sistema de archivos (*File System Access API*).
  - Crea automáticamente una carpeta con el nombre del certificado y guarda los archivos siguiendo el formato:
    ```
    {NombreDelCertificado}{NombreEscrito}.pdf
    ```
    *Ejemplo: `CertificadoOrganizadorCristhian Alejandro Moreno Delgado.pdf`*
  - Opción de descarga completa en un archivo **ZIP** estructurado.
- **📐 Formato Estándar:** Salida vectorial exacta en tamaño **A4 Horizontal (841.89 × 595.28 puntos)** con la tipografía embebida (`fontkit`).

---

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) v18.0.0 o superior
- Gestor de paquetes `npm` (incluido con Node.js) o `pnpm`
- Navegador web moderno (Google Chrome, Microsoft Edge, Brave o navegadores basados en Chromium para la selección de carpetas locales)

---

## 💻 Instalación y Uso en Local

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd "Certificate Generator"
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

Abre tu navegador en la URL indicada en la consola:
```
http://127.0.0.1:5173/
```

### 4. Compilar para Producción
Para generar los archivos optimizados en la carpeta `dist/`:
```bash
npm run build
```

Para previsualizar la compilación de producción:
```bash
npm run preview
```

---

## 📖 Guía Paso a Paso de Uso

1. **Cargar la Plantilla:**
   - Arrastra o selecciona tu plantilla en formato imagen (`.jpg`, `.png`, `.webp`) o `.pdf`.
   - Si deseas probar la aplicación de inmediato, haz clic en **"Cargar plantilla de muestra (ComSoc)"**.
2. **Definir el Área Segura:**
   - En el recuadro interactivo verás una caja punteada azul con un nombre de muestra.
   - Arrastra la caja hacia la posición deseada (por ejemplo, sobre la línea debajo de *"Otorgado a"*).
   - Usa los tiradores en las esquinas y bordes para cambiar el tamaño.
   - Puedes usar el botón **"Centrar"** para alinearla perfectamente en el centro horizontal.
3. **Personalizar la Tipografía:**
   - Selecciona la fuente deseada (por defecto **Allura**).
   - Ajusta el tamaño en puntos (`pt`), el color (blanco `#FFFFFF` sugerido para plantillas oscuras) y la alineación.
   - La opción **"Auto-ajustar a caja"** reduce proporcionalmente el tamaño de fuente si un nombre excede el ancho disponible.
4. **Ingresar los Participantes:**
   - **Opción manual:** Escribe o pega los nombres en el área de texto (un nombre por línea pulsando `Enter`).
   - **Opción CSV:** Haz clic en **"Seleccionar archivo CSV"** para importar un archivo `.csv`. Los nombres se leerán de la primera columna.
5. **Configurar Salida y Generar:**
   - En **Nombre del Certificado**, ingresa el prefijo deseado (ej. `CertificadoOrganizador`).
   - Haz clic en **"Elegir Directorio de Salida"** para seleccionar una carpeta en tu computador donde se guardará la carpeta generada.
   - Haz clic en **"Generar Todos los Certificados PDF"**.
   - Verás la barra de progreso en tiempo real y, al finalizar, podrás descargar también el archivo `.zip` si lo prefieres.

---

## 🌐 Despliegue en GitHub Pages

Este proyecto ya incluye el flujo de trabajo automatizado con **GitHub Actions** en `.github/workflows/deploy.yml`.

### Pasos para Activar GitHub Pages en tu Repositorio:

1. **Subir los cambios a GitHub:**
   ```bash
   git add .
   git commit -m "feat: generador de certificados comsoc con soporte github pages"
   git push origin main
   ```

2. **Habilitar GitHub Actions en el Repositorio:**
   - Ve a tu repositorio en GitHub.
   - Entra a **Settings** (Configuración) > **Pages**.
   - En la sección **Build and deployment** > **Source**, selecciona:
     ```
     GitHub Actions
     ```
   - ¡Listo! En cada `push` a la rama `main`, la acción compilará y publicará la aplicación automáticamente en:
     ```
     https://<TU_USUARIO>.github.io/<NOMBRE_DEL_REPOSITORIO>/
     ```

---

## 🛠️ Tecnologías Utilizadas

| Herramienta | Versión | Propósito |
|---|---|---|
| **React** | 18.x | Interfaz reactiva de usuario |
| **TypeScript** | 5.x | Tipado estático y robustez de código |
| **Vite** | 6.x | Bundler ultra-rápido para desarrollo y producción |
| **Tailwind CSS** | 3.4.x | Estilos modernos y responsivos |
| **pdf-lib** | 1.17.x | Creación y manipulación de PDFs en el navegador |
| **@pdf-lib/fontkit** | 1.1.x | Embebido de tipografías TTF/OTF en PDFs |
| **pdfjs-dist** | 4.x | Renderizado de plantillas PDF a canvas/imagen |
| **PapaParse** | 5.5.x | Parseo eficiente y confiable de archivos CSV |
| **JSZip & FileSaver** | 3.10.x / 2.0.x | Empaquetado y descarga masiva en archivo ZIP |
| **Lucide React** | 0.475.x | Iconos limpios e intuitivos |
| **React Hot Toast** | 2.5.x | Notificaciones y retroalimentación visual |

---

## 📂 Estructura del Proyecto

```
Certificate Generator/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Flujo de trabajo de GitHub Actions para Pages
├── public/
│   └── sample-template.jpg     # Plantilla base oficial de muestra
├── src/
│   ├── components/
│   │   ├── ConfigSection.tsx       # Configuración de salida y generación
│   │   ├── FontSettingsSection.tsx # Ajustes de tipografía, tamaño y color
│   │   ├── GenerationModal.tsx     # Modal con progreso y descarga
│   │   ├── Header.tsx              # Encabezado institucional ComSoc
│   │   ├── NamesInputSection.tsx   # Entrada de nombres (textarea y CSV)
│   │   ├── SafeAreaCanvas.tsx      # Canvas interactivo para área segura
│   │   └── TemplateSection.tsx     # Subida y preview de plantilla
│   ├── services/
│   │   ├── csvService.ts           # Lectura de CSV primera columna
│   │   ├── exportService.ts        # Escritura a disco (FSA API) y ZIP
│   │   ├── fontService.ts          # Gestión de fuentes Google Fonts y TTF
│   │   ├── pdfGenerator.ts         # Generador vectorial A4 horizontal
│   │   └── templateService.ts      # Conversión de PDF/imagen a canvas
│   ├── types/
│   │   └── index.ts                # Definiciones de tipos TypeScript
│   ├── App.tsx                     # Componente principal
│   ├── index.css                   # Estilos globales y Tailwind
│   └── main.tsx                    # Punto de entrada React
├── .gitignore
├── index.html
├── package.json
├── PLAN.md                         # Plan de arquitectura inicial
├── README.md                       # Documentación del proyecto
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 Licencia

Desarrollado para el **IEEE Communications Society (ComSoc)**. Uso académico y libre bajo licencia MIT.
