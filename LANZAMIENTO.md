# 🚀 GUÍA DE LANZAMIENTO — Guía Montilla

**Cuando vuelvas de la calle, sigue estos pasos en orden.**  
Tiempo total: ~25 minutos. Después la web funciona sola.

---

## ✅ Qué ya está hecho (no tienes que hacerlo)

| Hecho | Detalle |
|---|---|
| **51 negocios** | Bodegas, restaurantes, hoteles, servicios, qué hacer |
| **62 páginas** | Home, categorías, ficha de cada negocio, eventos, rutas |
| **Fotos locales** | Guardadas en `public/images/` — ya no dependen de internet |
| **SEO** | Sitemap, meta tags, Open Graph, Schema.org, breadcrumbs |
| **Pipeline automático** | Eventos cada mañana vía GitHub Actions |
| **Formularios** | Preparados (solo falta tu clave gratis, paso 2) |

---

## PASO 1 — Probar en tu PC (2 min)

Abre PowerShell:

```powershell
cd C:\Users\Gallegos\Projects\guia-montilla
npm run dev
```

Abre **http://localhost:4321** y comprueba:
- [ ] Se ven las fotos del hero y de los negocios
- [ ] `/bodegas/` tiene banner y listado con miniaturas
- [ ] `/negocio/bodegas-alvear/` tiene foto grande

---

## PASO 2 — Activar formularios (5 min) ⭐ IMPORTANTE

Así te llegan las consultas **a tu email** cuando alguien rellena un formulario.

### 2.1 Crear cuenta gratis
1. Entra en **https://web3forms.com**
2. Regístrate con tu email (Gmail vale)
3. Te dan una **Access Key** (empieza por algo tipo `a1b2c3d4-...`)

### 2.2 Pegar la clave en el proyecto
1. Copia el archivo de ejemplo:
   ```powershell
   cd C:\Users\Gallegos\Projects\guia-montilla
   copy .env.example .env
   ```
2. Abre `.env` con el Bloc de notas
3. Pega tu clave:
   ```
   PUBLIC_WEB3FORMS_KEY=tu-clave-aqui
   ```
4. Reinicia `npm run dev`
5. Ve a `/para-negocios/` → rellena el formulario de prueba → **te debe llegar un email**

### ¿Cómo te llegan los formularios?

| Formulario | Dónde está | Qué recibes |
|---|---|---|
| Consulta de negocio | Cada ficha `/negocio/...` | Email con nombre, teléfono, mensaje |
| Quiero destacar | `/para-negocios/` | Email de negocio interesado en pagar |

**Todo va al email que registraste en Web3Forms.** Revisa también spam la primera vez.

---

## PASO 3 — Subir a GitHub (5 min)

### 3.1 Crear repositorio
1. Entra en **https://github.com/new**
2. Nombre: `guia-montilla`
3. Público → Create repository

### 3.2 Subir el código
```powershell
cd C:\Users\Gallegos\Projects\guia-montilla
git add .
git commit -m "Guía Montilla lista para publicar"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/guia-montilla.git
git push -u origin main
```
*(Cambia `TU_USUARIO` por tu usuario de GitHub)*

### 3.3 Añadir secretos en GitHub (formularios + build)
1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret:**
   - Name: `PUBLIC_WEB3FORMS_KEY` → Value: tu clave de Web3Forms
3. Opcional pero recomendado:
   - Name: `SITE_URL` → Value: `https://TU_USUARIO.github.io/guia-montilla`

---

## PASO 4 — Publicar la web (3 min)

1. Repo → **Settings** → **Pages**
2. **Source:** GitHub Actions
3. **Actions** → **Actualizar y publicar** → **Run workflow**
4. Espera 2–3 minutos

**Tu web estará en:**  
`https://TU_USUARIO.github.io/guia-montilla/`

### Actualizar robots.txt (1 min)
Abre `public/robots.txt` y cambia `TU_USUARIO` por tu usuario real. Luego:
```powershell
git add public/robots.txt
git commit -m "Fix robots.txt URL"
git push
```

---

## PASO 5 — Google (10 min, opcional pero recomendado)

Para que salgas cuando busquen «bodegas montilla», «fontanero montilla»…

1. **https://search.google.com/search-console**
2. Añade tu URL: `https://TU_USUARIO.github.io/guia-montilla/`
3. Verifica (método HTML tag o DNS)
4. **Sitemaps** → Añadir: `sitemap-index.xml`
5. En 1–4 semanas empieza a indexar

---

## PASO 6 — Dominio propio (opcional, ~10€/año)

Si quieres `guiamontilla.es` en vez de github.io:

1. Compra dominio en Nominalia, Dinahosting, etc.
2. En GitHub → Settings → Pages → Custom domain → `guiamontilla.es`
3. En tu registrador, apunta DNS a GitHub Pages
4. Cambia en `astro.config.mjs` y `.env`:
   ```
   SITE_URL=https://guiamontilla.es
   BASE_PATH=/
   ```

---

## 🤖 Qué pasa solo cada día

```
6:00 AM → GitHub Actions ejecuta pipeline
       → Recoge eventos de Montilla Digital
       → Actualiza data/events.json
       → Reconstruye y publica la web
```

**Tú no haces nada.** Cero.

---

## 💰 Cómo ganar dinero

1. **Destacados (29€/mes):** Llama/WhatsApp a 10 negocios de la web:
   > *«Hola, sois en Guía Montilla. Aparecéis gratis. Si queréis salir primero cuando busquen [vuestra categoría] en Montilla, son 29€/mes.»*

2. Empieza por: Don Gonzalo, Bolero, Hostal Bellido, Alvear, fontanería…

3. Cuando paguen, edita `data/businesses.json` → `"featured": true`

---

## 📁 Estructura del proyecto

```
guia-montilla/
├── data/
│   businesses.json    ← 51 negocios (edita aquí para añadir más)
│   events.json        ← Auto-actualizado por pipeline
│   categories.json
├── public/images/     ← FOTOS (cambia por fotos reales de Montilla)
├── src/pages/         ← Páginas web
├── scripts/pipeline.mjs ← Automatización eventos
└── .env               ← TU clave de formularios (no subir a GitHub)
```

### Añadir un negocio manualmente
Edita `data/businesses.json`, copia un bloque existente, cambia los datos, ejecuta:
```powershell
npm run prepare-data
npm run build
```

### Cambiar fotos por fotos reales
1. Guarda fotos en `public/images/negocios/nombre.jpg`
2. En `businesses.json` añade: `"image": "/images/negocios/nombre.jpg"`

---

## ❓ Problemas frecuentes

| Problema | Solución |
|---|---|
| No se ven fotos | Usa `npm run dev` y recarga Ctrl+F5. Fotos están en `/public/images/` |
| Formulario no envía | Falta `PUBLIC_WEB3FORMS_KEY` en `.env` (local) o GitHub Secrets (online) |
| Web 404 en GitHub | Activa Pages → Source: GitHub Actions → Run workflow |
| No llegan emails | Revisa spam. Verifica clave en web3forms.com dashboard |

---

## 📋 Checklist rápido al volver

- [ ] `npm run dev` → fotos OK
- [ ] Clave Web3Forms en `.env`
- [ ] Probar formulario → email recibido
- [ ] Subir a GitHub
- [ ] Secret `PUBLIC_WEB3FORMS_KEY` en GitHub
- [ ] Activar Pages + Run workflow
- [ ] Abrir tu URL pública
- [ ] (Opcional) Google Search Console

---

**Proyecto:** `C:\Users\Gallegos\Projects\guia-montilla`  
**Cuando termines el paso 4, ya tienes una web pública funcionando.** 🍷
