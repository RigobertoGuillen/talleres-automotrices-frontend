/**
 * ============================================================
 * PATRÓN DE DISEÑO: FACADE (Fachada)
 * ============================================================
 * Propósito:
 *   Proporciona una interfaz simplificada a un conjunto de
 *   subsistemas complejos. Los componentes React nunca llaman
 *   directamente al API ni a los validadores — todo pasa
 *   por esta fachada.
 *
 * Subsistemas que oculta:
 *   1. clienteApiService   — llamadas HTTP al backend
 *   2. clienteValidators   — validaciones de formulario
 *   3. Lógica de paginación — cálculos de páginas
 *   4. Formateo de datos   — normalización de teléfonos
 *
 * Participantes:
 *   - ClienteFacade (esta clase): interfaz simplificada
 *   - clienteApiService: subsistema de HTTP
 *   - clienteValidators: subsistema de validación
 *
 * Beneficio:
 *   Los componentes React solo conocen ClienteFacade.
 *   Si mañana cambia el API o las reglas de validación,
 *   solo se modifica el subsistema correspondiente,
 *   sin tocar ningún componente de UI.
 * ============================================================
 */

import {
  apiGetClientes,
  apiSearchClientes,
  apiCreateCliente,
  apiUpdateCliente,
  apiDeleteCliente,
  apiGetHistorial,
} from "../../../services/clientesService";

import {
  validarFormCliente,
  formatearTelefonoHN,
} from "../../clientes/validators/ClienteValidators";

/** Número de clientes por página — HU paginación */
const CLIENTES_POR_PAGINA = 15;

/**
 * ClienteFacade — fachada principal del módulo de clientes.
 * Expone métodos de alto nivel que los componentes React usan
 * sin necesidad de conocer los detalles de implementación.
 */
export class ClienteFacade {
  /**
   * Obtiene todos los clientes y calcula la paginación.
   * Oculta la llamada al API y la lógica de paginación.
   *
   * @param {string} query — término de búsqueda (opcional)
   * @param {string} filtro — filtro adicional (opcional)
   * @returns {{ clientes: array, total: number, paginas: number }}
   */
  static async obtenerClientes(query = "", filtro = "") {
    let clientes;

    if (query.trim()) {
      // Usa el endpoint de búsqueda del backend
      clientes = await apiSearchClientes(query.trim());
    } else {
      clientes = await apiGetClientes();
    }

    // Filtros client-side complementarios
    if (filtro === "con-correo") {
      clientes = clientes.filter((c) => !!c.correo);
    } else if (filtro === "sin-correo") {
      clientes = clientes.filter((c) => !c.correo);
    } else if (filtro === "reciente") {
      const now = new Date();
      clientes = clientes.filter((c) => {
        const d = new Date(c.fecha_registro);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }

    return {
      clientes,
      total: clientes.length,
      paginas: Math.ceil(clientes.length / CLIENTES_POR_PAGINA),
    };
  }

  /**
   * Obtiene la página solicitada de la lista de clientes.
   * Oculta la lógica de paginación (slice, offset, etc.)
   *
   * @param {array} clientes — lista completa
   * @param {number} pagina — página actual (1-based)
   * @returns {array} — clientes de esa página
   */
  static paginar(clientes, pagina) {
    const inicio = (pagina - 1) * CLIENTES_POR_PAGINA;
    return clientes.slice(inicio, inicio + CLIENTES_POR_PAGINA);
  }

  /**
   * Valida y crea un cliente.
   * Oculta la validación, el formateo del teléfono y la llamada HTTP.
   *
   * @param {object} form — datos del formulario
   * @returns {{ success: boolean, data?: object, errors?: object }}
   */
  static async crearCliente(form) {
    // FACADE oculta la validación
    const { valid, errors } = validarFormCliente(form);
    if (!valid) return { success: false, errors };

    // FACADE oculta el formateo del teléfono
    const payload = {
      nombre: form.nombre.trim(),
      telefono: formatearTelefonoHN(form.telefono.trim()),
      correo: form.correo.trim() || null,
      direccion: form.direccion.trim() || null,
    };

    // FACADE oculta la llamada HTTP
    const data = await apiCreateCliente(payload);
    return { success: true, data };
  }

  /**
   * Valida y actualiza un cliente.
   * Oculta la validación, el formateo y la llamada HTTP.
   *
   * @param {number} id
   * @param {object} form
   * @returns {{ success: boolean, data?: object, errors?: object }}
   */
  static async actualizarCliente(id, form) {
    // FACADE oculta la validación
    const { valid, errors } = validarFormCliente(form);
    if (!valid) return { success: false, errors };

    // FACADE oculta el formateo
    const payload = {
      nombre: form.nombre.trim(),
      telefono: formatearTelefonoHN(form.telefono.trim()),
      correo: form.correo.trim() || null,
      direccion: form.direccion.trim() || null,
    };

    // FACADE oculta la llamada HTTP
    const data = await apiUpdateCliente(id, payload);
    return { success: true, data };
  }

  /**
   * Elimina un cliente.
   * Oculta la llamada HTTP y el manejo del error de órdenes activas.
   *
   * @param {number} id
   * @returns {{ success: boolean, message?: string }}
   */
  static async eliminarCliente(id) {
    await apiDeleteCliente(id);
    return { success: true };
  }

  /**
   * Obtiene el historial de servicios de un cliente.
   * Oculta la estructura de respuesta del backend.
   *
   * @param {number} id
   * @param {{ fecha_inicio?: string, fecha_fin?: string }} filtros
   * @returns {{ cliente: object, historial: array }}
   */
  static async obtenerHistorial(id, filtros = {}) {
    return apiGetHistorial(id, filtros);
  }
}

export const PAGINA_SIZE = CLIENTES_POR_PAGINA;