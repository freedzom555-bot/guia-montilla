# Guía Montilla

> **👉 EMPIEZA AQUÍ:** lee [LANZAMIENTO.md](./LANZAMIENTO.md) — pasos para publicar, formularios y ganar dinero.

Directorio local automatizado de Montilla-Moriles.


- **Directorio local** con 18+ fichas (bodegas, restaurantes, servicios, qué hacer)
- **Landings SEO** por categoría: `/bodegas/`, `/restaurantes/`, `/servicios/`…
- **Ficha de negocio** con Schema.org, contacto y formulario de leads
- **Rutas de enoturismo** predefinidas
- **Eventos** actualizados automáticamente desde Montilla Digital
- **Página para negocios** con planes de monetización (29€/79€)
- **Pipeline diario** vía GitHub Actions + hosting gratis en Pages

## Local

```powershell
cd C:\Users\Gallegos\Projects\guia-montilla
npm install
npm run pipeline
npm run dev
```

Abre http://localhost:4321

## Publicar (gratis)

1. Sube a GitHub
2. Settings → Pages → GitHub Actions
3. Actions → **Actualizar y publicar** → Run workflow

## Monetización

Los negocios locales pagan por:
- **Destacado** (29€/mes) — posición prioritaria
- **Patrocinio** (79€/mes) — portada y rutas

Contacto en `/para-negocios/`

## Añadir negocios

Edita `data/businesses.json` o amplía el pipeline para enriquecer con Gemini.

---

Campiña Sur · Córdoba · Montilla-Moriles
