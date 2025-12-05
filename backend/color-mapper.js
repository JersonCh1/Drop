// backend/color-mapper.js
// Mapeo inteligente de códigos de colores a nombres descriptivos

const COLOR_MAPPINGS = {
  // Códigos numéricos simples
  '1': 'Negro',
  '2': 'Transparente',
  '3': 'Azul',
  '4': 'Rosa',
  '5': 'Verde',
  '6': 'Morado',
  '7': 'Rojo',
  '8': 'Gris',
  '9': 'Naranja',
  '10': 'Amarillo',
  '11': 'Blanco',
  '12': 'Verde Menta',
  '13': 'Lavanda',
  '14': 'Coral',
  '15': 'Turquesa',
  '16': 'Azul Marino',
  '17': 'Verde Oliva',
  '18': 'Beige',
  '19': 'Marrón',
  '20': 'Dorado',
  '21': 'Plateado',
  '22': 'Negro Mate',

  // Códigos negativos (versiones mate)
  '-1': 'Transparente Mate',
  '-2': 'Negro Mate',
  '-3': 'Gris Mate',
  '-4': 'Azul Mate',
  '-5': 'Rosa Mate',
  '-6': 'Verde Mate',

  // Códigos alfanuméricos comunes de AliExpress
  'A05470': 'Negro Metalizado',
  'A01113': 'Transparente',
  'A01503': 'Azul Oscuro',
  'A02456': 'Rosa Pastel',
  'A03789': 'Verde Esmeralda',

  // Códigos SKU
  'YSK-touming-A4649': 'Transparente Premium',
  'YSK-hei-A4649': 'Negro Premium',
  'YSK-lan-A4649': 'Azul Premium',

  // Front Glass variants
  '1 Front Glass': 'Negro con Protector Frontal',
  '2 Front Glass': 'Transparente con Protector Frontal',
  '3 Front Glass': 'Azul con Protector Frontal',
  '4 Front Glass': 'Rosa con Protector Frontal',

  // Colores ya descriptivos en inglés (traducir a español)
  'Black': 'Negro',
  'White': 'Blanco',
  'Clear': 'Transparente',
  'Transparent': 'Transparente',
  'Blue': 'Azul',
  'Dark Blue': 'Azul Oscuro',
  'Navy Blue': 'Azul Marino',
  'Light Blue': 'Azul Claro',
  'Sky Blue': 'Azul Cielo',
  'Red': 'Rojo',
  'Wine Red': 'Rojo Vino',
  'Dark Red': 'Rojo Oscuro',
  'Pink': 'Rosa',
  'Rose Pink': 'Rosa',
  'Hot Pink': 'Rosa Intenso',
  'Light Pink': 'Rosa Claro',
  'Green': 'Verde',
  'Dark Green': 'Verde Oscuro',
  'Mint Green': 'Verde Menta',
  'Purple': 'Morado',
  'Dark Purple': 'Morado Oscuro',
  'Lavender': 'Lavanda',
  'Brown': 'Marrón',
  'Dark Brown': 'Marrón Oscuro',
  'Gray': 'Gris',
  'Grey': 'Gris',
  'Space Gray': 'Gris Espacial',
  'Silver': 'Plateado',
  'Silvery': 'Plateado',
  'Gold': 'Dorado',
  'Rose Gold': 'Oro Rosa',
  'Orange': 'Naranja',
  'Yellow': 'Amarillo',
  'Beige': 'Beige',
  'Khaki': 'Caqui',

  // Colores en español (ya correctos)
  'Negro': 'Negro',
  'NEGRO': 'Negro',
  'Blanco': 'Blanco',
  'BLANCO': 'Blanco',
  'Transparente': 'Transparente',
  'Azul': 'Azul',
  'Rojo': 'Rojo',
  'Rosa': 'Rosa',
  'Verde': 'Verde',
  'Morado': 'Morado',
  'Gris': 'Gris',
  'Marrón': 'Marrón',
  'Plateado': 'Plateado',
  'Dorado': 'Dorado'
};

/**
 * Mapear un código de color a un nombre descriptivo
 */
function mapColor(colorCode) {
  if (!colorCode) return null;

  const code = colorCode.trim();

  // Buscar en el mapeo directo
  if (COLOR_MAPPINGS[code]) {
    return COLOR_MAPPINGS[code];
  }

  // Si contiene "Front Glass", extraer el número y mapear
  if (code.includes('Front Glass')) {
    const match = code.match(/^(\d+)\s+Front Glass$/);
    if (match && COLOR_MAPPINGS[match[1]]) {
      return `${COLOR_MAPPINGS[match[1]]} con Protector Frontal`;
    }
  }

  // Si es un código alfanumérico desconocido, intentar inferir
  if (code.match(/^[A-Z]\d+$/)) {
    // Códigos como A05470
    return `Color ${code}`;
  }

  // Si parece un código SKU, simplificar
  if (code.includes('-') && code.length > 10) {
    if (code.toLowerCase().includes('touming')) return 'Transparente';
    if (code.toLowerCase().includes('hei')) return 'Negro';
    if (code.toLowerCase().includes('lan')) return 'Azul';
    return 'Color Especial';
  }

  // Si ya parece descriptivo, capitalizar correctamente
  if (code.length > 3 && !code.match(/^\d+$/) && !code.match(/^-\d+$/)) {
    return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
  }

  // Último recurso: devolver el código original
  return code;
}

/**
 * Mejorar nombre de variante
 */
function improveVariantName(variantName, color, material) {
  // Si el nombre ya es descriptivo, mantenerlo
  if (!variantName.match(/\s-\s\d+$/) && !variantName.match(/^[A-Z0-9-]+$/)) {
    return variantName;
  }

  // Construir nombre mejorado
  const parts = [];

  if (material) {
    parts.push(material);
  }

  if (color) {
    const mappedColor = mapColor(color);
    if (mappedColor && mappedColor !== material) {
      parts.push(mappedColor);
    }
  }

  if (parts.length === 0) {
    return variantName; // Mantener original si no podemos mejorarlo
  }

  return parts.join(' - ');
}

module.exports = {
  COLOR_MAPPINGS,
  mapColor,
  improveVariantName
};
