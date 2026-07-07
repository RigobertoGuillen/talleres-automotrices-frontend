/**
 * ============================================================
 * PRINCIPIO SOLID — SRP (Single Responsibility Principle)
 * ============================================================
 * Este archivo tiene UNA sola responsabilidad:
 * validar datos de clientes con formatos de Honduras.
 *
 * No hace llamadas al API, no maneja estado, no renderiza UI.
 * Cualquier cambio en las reglas de validación solo afecta
 * a este archivo.
 * ============================================================
 */

/**
 * Valida el número de teléfono hondureño.
 * Formatos aceptados: 9999-9999 o 99999999 (8 dígitos)
 * Operadoras HN: Claro (3xxx, 9xxx), Tigo (8xxx), Honduras Tel (2xxx)
 * @param {string} telefono
 * @returns {{ valid: boolean, message: string }}
 */
export function validarTelefonoHN(telefono) {
  if (!telefono || !telefono.trim()) {
    return { valid: false, message: "El teléfono es obligatorio." };
  }

  // Eliminar espacios y guiones para validar solo dígitos
  const limpio = telefono.replace(/[\s-]/g, "");

  if (!/^\d{8}$/.test(limpio)) {
    return {
      valid: false,
      message: "El teléfono debe tener 8 dígitos (ej. 9999-9999).",
    };
  }

  // Verificar que empiece con prefijo válido de Honduras
  const prefijo = parseInt(limpio[0]);
  if (![2, 3, 8, 9].includes(prefijo)) {
    return {
      valid: false,
      message: "Prefijo inválido. Los teléfonos hondureños inician con 2, 3, 8 o 9.",
    };
  }

  return { valid: true, message: "" };
}

/**
 * Formatea el teléfono al formato estándar hondureño: XXXX-XXXX
 * @param {string} telefono
 * @returns {string}
 */
export function formatearTelefonoHN(telefono) {
  const limpio = telefono.replace(/[\s-]/g, "");
  if (limpio.length === 8) {
    return `${limpio.slice(0, 4)}-${limpio.slice(4)}`;
  }
  return telefono;
}

/**
 * Valida la identidad hondureña (DNI).
 * Formato: 13 dígitos numéricos (ej. 0801199900001)
 * Estructura: DDMMAAAANNNNNN (fecha de nacimiento + correlativo)
 * @param {string} identidad
 * @returns {{ valid: boolean, message: string }}
 */
export function validarIdentidadHN(identidad) {
  if (!identidad || !identidad.trim()) {
    return { valid: false, message: "La identidad es obligatoria." };
  }

  const limpio = identidad.replace(/[\s-]/g, "");

  if (!/^\d{13}$/.test(limpio)) {
    return {
      valid: false,
      message: "La identidad debe tener exactamente 13 dígitos numéricos.",
    };
  }

  return { valid: true, message: "" };
}

/**
 * Valida el nombre completo del cliente.
 * Debe tener al menos 2 palabras (nombre y apellido).
 * @param {string} nombre
 * @returns {{ valid: boolean, message: string }}
 */
export function validarNombreCliente(nombre) {
  if (!nombre || !nombre.trim()) {
    return { valid: false, message: "El nombre es obligatorio." };
  }

  if (nombre.trim().length < 3) {
    return { valid: false, message: "El nombre debe tener al menos 3 caracteres." };
  }

  if (nombre.trim().split(/\s+/).length < 2) {
    return { valid: false, message: "Ingresa nombre y apellido completos." };
  }

  return { valid: true, message: "" };
}

/**
 * Valida el correo electrónico (opcional en clientes).
 * @param {string} correo
 * @returns {{ valid: boolean, message: string }}
 */
export function validarCorreo(correo) {
  if (!correo || !correo.trim()) {
    return { valid: true, message: "" }; // correo es opcional
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
    return { valid: false, message: "Ingresa un correo electrónico válido." };
  }

  return { valid: true, message: "" };
}

/**
 * Valida todos los campos del formulario de cliente.
 * SRP: esta función coordina las validaciones individuales
 * pero cada una tiene su propia función dedicada.
 * @param {{ nombre, telefono, correo, direccion }} form
 * @returns {{ valid: boolean, errors: object }}
 */
export function validarFormCliente(form) {
  const errors = {};

  const vNombre = validarNombreCliente(form.nombre);
  if (!vNombre.valid) errors.nombre = vNombre.message;

  const vTel = validarTelefonoHN(form.telefono);
  if (!vTel.valid) errors.telefono = vTel.message;

  const vCorreo = validarCorreo(form.correo);
  if (!vCorreo.valid) errors.correo = vCorreo.message;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}