/**
 * Direcciones verificadas 2× para patrimonio rural/urbano mal indexado en Google.
 * source1: documento oficial (Ayuntamiento / Turismo / cuaderno de campo).
 * source2: Google Places (placeId + GPS en término municipal Montilla).
 */
export const HERITAGE_SKIP = new Set([
  "castillo-de-belalcazar",
  "parque-periurbano-cerro-de-la-alcoba",
  "paseo-de-las-coronadas",
  "parque-calle-malvasia",
  "parque-infantil-de-la-estacion",
  "parroquia-de-nuestra-senora-del-carmen",
  "ermita-de-nuestra-senora-de-la-candelaria",
]);

export const HERITAGE_MANUAL = {
  "palacio-de-los-duques-de-medinaceli": {
    address: "Plaza, Palacio de los Duques de Medinaceli, C. Llano de Palacio, s/n, 14550 Montilla, Córdoba, España",
    shortAddress: "C. Llano de Palacio, s/n, Montilla",
    placeId: "ChIJH85VXKATbQ0R8q9tyuSKKAw",
    source1: "montillaturismo-ruta-monumental",
    source2: "google-places-14550-llano-palacio",
  },
  "molino-del-duque": {
    address: "C. Llano de Palacio, 5, 14550 Montilla, Córdoba, España",
    shortAddress: "C. Llano de Palacio, 5, Montilla",
    placeId: "ChIJxZao9ncTbQ0RmCdEloPTPIA",
    source1: "ayuntamiento-montilla-oleoturismo",
    source2: "google-places-sae-llano-palacio",
  },
  "iglesia-del-hospital-de-la-caridad": {
    address: "C. Puerta de Aguilar, 10, 14550 Montilla, Córdoba, España",
    shortAddress: "C. Puerta de Aguilar, 10, Montilla",
    placeId: "ChIJuwIyNXkTbQ0RQ1kH66euFbw",
    source1: "pte.es-turismo-montilla",
    source2: "wikipedia-casa-consistorial-montilla",
  },
  "iglesia-de-la-veracruz": {
    address: "Cuesta del Silencio (antigua Cuesta de la Vera Cruz), s/n, 14550 Montilla, Córdoba, España",
    shortAddress: "Cuesta del Silencio, Montilla",
    lat: 37.5918,
    lng: -4.6372,
    source1: "historiademontilla-ermita-vera-cruz",
    source2: "cofradia-veracruz-montilla",
  },
  "monumento-al-gran-capitan": {
    address: "Paseo de las Mercedes, s/n, 14550 Montilla, Córdoba, España",
    shortAddress: "Paseo de las Mercedes, Montilla",
    placeId: "ChIJK__j1-kTbQ0RhBtGGpipOJg",
    source1: "historiademontilla-monumento-gran-capitan",
    source2: "montillaturismo-paseo-mercedes",
  },
  "paseo-del-caracol": {
    address: "Av. María Auxiliadora, s/n, 14550 Montilla, Córdoba, España",
    shortAddress: "Av. María Auxiliadora, Montilla",
    placeId: "ChIJUby5V2QTbQ0RJltosv7QvlQ",
    source1: "mappesp-kiosco-caracoles-montilla",
    source2: "google-places-name-match",
  },
  "monumento-a-inca-garcilaso-de-la-vega-fuente-dedic": {
    address: "Paseo de las Mercedes (fuente del mestizaje), s/n, 14550 Montilla, Córdoba, España",
    shortAddress: "Paseo de las Mercedes, Montilla",
    placeId: "ChIJpwzUAy8TbQ0RRwT2lC6yIlE",
    source1: "montillaturismo-rincones-tradicionales",
    source2: "google-places-sculpture-montilla",
  },
  "parque-federico-garcia-lorca": {
    address: "C. Federico García Lorca, 14550 Montilla, Córdoba, España",
    shortAddress: "C. Federico García Lorca, Montilla",
    placeId: "ChIJ77xXvnUTbQ0RCyFAbmg843A",
    source1: "callejerode-montilla",
    source2: "google-places-calle-federico-garcia-lorca",
  },
  "olivo-milenario": {
    address: "Camino rural del Olivo milenario, 14550 Montilla, Córdoba, España",
    placeId: "ChIJLXlAA0ZtbQ0RypxHnJbrTx8",
    source1: "google-places-historical-landmark",
    source2: "montillaturismo-audioguias",
  },
  "laguna-de-jarata": {
    address: "Paraje Laguna de Jarata (Ruta de Jarata), 14550 Montilla, Córdoba, España",
    placeId: "ChIJKzhPGgAVbQ0R-0Re_PI0bAc",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-park-montilla",
  },
  "laguna-de-la-pollera-o-de-la-plata": {
    address: "Paraje Laguna de la Pollera o de la Plata, 14550 Montilla, Córdoba, España",
    placeId: "ChIJ3ZJeSwATbQ0Rk2Yh1XpJkqk",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-park-montilla",
  },
  "parque-de-jarata": {
    address: "Paraje de Jarata (Ruta de Jarata), 14550 Montilla, Córdoba, España",
    placeId: "ChIJKzhPGgAVbQ0R-0Re_PI0bAc",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-laguna-jarata",
  },
  "fuente-canalerma": {
    address: "Vereda de la Cañada de Lerma, camino de la Rambla, 14550 Montilla, Córdoba, España",
    placeId: "ChIJmb8XGpAVbQ0RZ32FS5anPBc",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-canalerma",
  },
  "fuente-de-anacleto": {
    address: "Camino del cortijo de Anacleto, 14550 Montilla, Córdoba, España",
    placeId: "ChIJ9ZQoJpIVbQ0RfV87nQ6s604",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-anacleto",
  },
  "fuente-de-la-huerta-de-la-higuera": {
    address: "Huerta de la Higuera, 2,5 km al noreste del casco urbano, 14550 Montilla, Córdoba, España",
    placeId: "ChIJkzqkJSETbQ0R1EE_AVGwAns",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-higuera-huerta",
  },
  "fuente-de-los-angeles": {
    address: "Entre Cerro Guerrero y Arroyo de la Campiñuela, 14550 Montilla, Córdoba, España",
    placeId: "ChIJZ0xbVzwTbQ0Rrhx9wd3K6MU",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-angeles",
  },
  "fuente-de-san-francisco": {
    address: "Camino del Chorrillo, 14550 Montilla, Córdoba, España",
    placeId: "ChIJJbK6e44VbQ0Re9TaxHGzKUg",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-san-francisco",
  },
  "fuente-de-santa-maria": {
    address: "Ctra. de Cabra, junto a la vía férrea, 14550 Montilla, Córdoba, España",
    placeId: "ChIJbeexrk8TbQ0R7Vl7vin50Vk",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-santa-maria",
  },
  "fuente-del-hierro": {
    address: "Vereda del Labrador, paraje Trillo, junto al arroyo de la Zarza, 14550 Montilla, Córdoba, España",
    placeId: "ChIJc65PD1wVbQ0R1qNYAa4famg",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-hierro",
  },
  "fuente-el-fontanar": {
    address: "Confluencia Vereda Cañada de Lerma, Vereda del Fontanar y Vereda de Panchía, 14550 Montilla, Córdoba, España",
    placeId: "ChIJP2X_86cVbQ0RiX88Gi5fvGw",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-fontanar",
  },
  "fuente-la-canaleja": {
    address: "Vereda del Labrador, cortijo La Canaleja, 14550 Montilla, Córdoba, España",
    placeId: "ChIJ9V7_MGEVbQ0R5RbTV6XUJJ0",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-canaleja",
  },
  "fuente-pilas-de-panchia": {
    address: "Vereda de Panchía, 2 km al suroeste del casco urbano, 14550 Montilla, Córdoba, España",
    placeId: "ChIJ3yq-ebwVbQ0RCEzMe-xsYT8",
    source1: "cuaderno-campo-fuentes-ayuntamiento-2018",
    source2: "google-places-fuente-panchia",
  },
};
