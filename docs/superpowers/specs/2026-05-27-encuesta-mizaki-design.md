# Encuesta de Calidad MIZAKI — Documento de Diseño

**Fecha:** 2026-05-27  
**Proyecto:** Sitio web de encuesta de satisfacción para clientes de MIZAKI  
**Enfoque elegido:** Opción A — HTML/CSS/JS + Google Apps Script + GitHub Pages

---

## 1. Objetivo

Crear un sitio web con la identidad visual de MIZAKI donde los clientes respondan una encuesta de calidad de 9 preguntas. Las respuestas se guardan automáticamente en Google Sheets y son consultables desde un panel de administración integrado.

---

## 2. Alcance

### Incluye
- Página pública de encuesta con branding MIZAKI
- Página de agradecimiento post-envío
- Panel de administración con contraseña
- Integración con Google Apps Script → Google Sheets
- Hosting gratuito en GitHub Pages

### No incluye
- Autenticación avanzada (OAuth, roles)
- Notificaciones por correo al recibir respuestas
- Exportación de datos desde el panel
- Versión multilenguaje

---

## 3. Preguntas de la encuesta

| # | Tipo | Pregunta |
|---|------|----------|
| 0 | Selector | Sucursal: La Campiña / Ibero / Plaza Norte |
| 1 | Opción única | ¿Cuántas veces nos has visitado? (Primera vez / De 2 a 5 veces / Más de 5 veces) |
| 2 | Estrellas 1–5 | Tiempo de espera |
| 3 | Estrellas 1–5 | Atención del personal |
| 4 | Estrellas 1–5 | Ambiente (música, iluminación, temperatura) |
| 5 | Estrellas 1–5 | Sabor y calidad de los alimentos |
| 6 | Estrellas 1–5 | Tamaño de la porción |
| 7 | Estrellas 1–5 | Precios de los alimentos |
| 8 | Botones 1–10 | ¿Qué tan probable es que recomiendes MIZAKI a tus conocidos? |
| 9 | Texto libre | Sugerencias y comentarios (opcional) |

---

## 4. Arquitectura

### Archivos del proyecto

```
encuesta-mizaki/
├── index.html          → Encuesta pública
├── gracias.html        → Pantalla de confirmación post-envío
├── admin.html          → Panel de resultados (contraseña requerida)
├── assets/
│   ├── logo.png        → Logo MIZAKI (fondo blanco)
│   ├── logo-dark.png   → Logo MIZAKI (para fondo negro)
│   └── style.css       → Estilos globales
└── README.md
```

### Flujo de datos

```
Cliente llena encuesta
        ↓
fetch() POST → Google Apps Script Web App
        ↓
Apps Script escribe fila en Google Sheets
        ↓
Cliente ve gracias.html
        ↓
Equipo MIZAKI entra a admin.html con contraseña
        ↓
admin.html hace GET → Apps Script → lee Google Sheets
        ↓
Muestra gráficas y tabla de respuestas
```

### Google Apps Script

- Desplegado como Web App pública (ejecuta como propietario)
- Endpoint único con dos acciones via parámetro:
  - `?action=submit` — recibe POST, guarda fila en Sheets
  - `?action=getData` — recibe GET con contraseña, devuelve JSON con todas las respuestas
- La hoja de Google Sheets tiene columnas: Timestamp, Sucursal, Visitas, Espera, Personal, Ambiente, Sabor, Porcion, Precios, NPS, Comentario

---

## 5. Diseño Visual

### Paleta
| Token | Valor |
|-------|-------|
| Fondo | `#000000` |
| Texto principal | `#FFFFFF` |
| Acento / interactivo | `#F3033E` |
| Superficie de tarjeta | `#111111` |
| Borde sutil | `#222222` |

### Tipografía
- Encabezados: **Red Hat Display** (Google Fonts)
- Cuerpo: **Optima** (fallback: Georgia, serif)

### Identidad
- Logo MIZAKI visible en el header de encuesta y panel admin
- El logo se coloca sobre un bloque de fondo blanco (`#FFFFFF`) en el header para mantener legibilidad (ya que el logo tiene texto negro)
- Tagline: "Restaurante Fusión Japonesa"

### Componentes de interacción
- **Estrellas (P2–P7):** 5 estrellas SVG, hover y selección en `#F3033E`, vacías en `#333333`
- **Selector de sucursal:** Botones tipo pill, seleccionado con fondo `#F3033E`
- **NPS (P8):** 10 botones numerados, seleccionado en `#F3033E`
- **Opciones de visitas (P1):** Radio buttons estilizados
- **Botón Enviar:** Fondo `#F3033E`, texto blanco, full-width en mobile

### Responsivo
- Mobile-first, funciona correctamente en pantallas desde 360px
- La encuesta está pensada para llenarse desde el celular del cliente en el restaurante

---

## 6. Panel de Administración (`admin.html`)

### Acceso
- Al cargar la página aparece `prompt()` solicitando contraseña
- La contraseña se define como constante en el JS del archivo
- Si es incorrecta, redirige a `index.html`

### Vista Resumen
- Total de respuestas y respuestas de la semana actual
- Filtro por sucursal (selector: Todas / La Campiña / Ibero / Plaza Norte)
- Gráfica de barras horizontales: promedio de cada criterio (P2–P7) — Chart.js
- Gráfica de dona: distribución de frecuencia de visitas (P1) — Chart.js
- NPS promedio destacado como número grande
- Sección de últimos comentarios (P9) — los 10 más recientes

### Vista Detalle
- Tabla paginada con todas las respuestas individuales
- Columnas: Fecha, Sucursal, Visitas, Espera, Personal, Ambiente, Sabor, Porción, Precios, NPS, Comentario
- Al hacer clic en una fila se expande para leer el comentario completo
- Ordenable por fecha (más reciente primero por defecto)

---

## 7. Hosting

- **Plataforma:** GitHub Pages
- **URL inicial:** `https://<usuario>.github.io/encuesta-mizaki`
- **Costo:** $0
- **Dominio personalizado:** Pueden conectar su propio dominio (`encuesta.mizaki.com.mx`) después agregando un archivo `CNAME` en el repositorio

---

## 8. Criterios de éxito

- [ ] Un cliente puede llenar y enviar la encuesta en menos de 2 minutos desde su celular
- [ ] Cada envío aparece como nueva fila en Google Sheets en menos de 5 segundos
- [ ] El panel admin carga y muestra datos correctamente con contraseña válida
- [ ] El sitio se ve correctamente en Chrome/Safari mobile y desktop
- [ ] El diseño es consistente con la identidad visual de MIZAKI

---

## 9. Fuera de alcance (futuras iteraciones)

- Envío de email de confirmación al cliente
- Notificación al equipo MIZAKI por cada respuesta
- Dashboard más avanzado con tendencias por fecha
- QR code único por sucursal
- Exportar respuestas a PDF/Excel desde el panel
