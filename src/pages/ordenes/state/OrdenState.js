/**
 * ============================================================
 * PATRÓN DE DISEÑO: STATE (Estado)
 * ============================================================
 * Propósito:
 *   Permite que un objeto (OrdenContext) cambie su comportamiento
 *   cuando su estado interno cambia. Cada estado concreto encapsula
 *   las reglas de qué transiciones son válidas, qué acciones están
 *   disponibles y qué descripción tiene ese estado.
 *
 * Problema que resuelve:
 *   Sin este patrón, la lógica de transiciones estaría llena de
 *   if/switch dispersos en múltiples componentes. Con State, cada
 *   estado sabe qué puede y qué no puede hacer.
 *
 * Participantes:
 *   - OrdenState (interfaz/base): define el contrato de cada estado
 *   - Estados concretos: Recibido, Diagnostico, Reparacion,
 *     Completado, Cerrado, Cancelado
 *   - OrdenContext: mantiene una referencia al estado actual y
 *     delega las decisiones a él
 * ============================================================
 */

// ── Clase base (interfaz del patrón State) ───────────────────
/**
 * OrdenState define el contrato que todos los estados concretos
 * deben cumplir. Actúa como la "interfaz" del patrón State.
 * Cada método tiene una implementación por defecto conservadora
 * (sin transiciones, sin acciones) que los estados concretos
 * sobreescriben según sus reglas específicas.
 */
class OrdenState {
  /** @returns {string} Clave del estado en la BD */
  getKey()         { return ""; }

  /** @returns {string} Etiqueta legible para la UI */
  getLabel()       { return ""; }

  /** @returns {string} Descripción del estado actual */
  getDescripcion() { return ""; }

  /** @returns {string} Clase CSS del badge asociado */
  getBadgeClass()  { return "or-badge--recibido"; }

  /**
   * Devuelve los estados a los que se puede transicionar.
   * El patrón State encapsula aquí las reglas de negocio:
   * cada estado concreto conoce sus propias transiciones válidas.
   * @returns {OrdenState[]} Lista de estados destino permitidos
   */
  getTransicionesValidas() { return []; }

  /**
   * Indica si desde este estado se puede asignar un mecánico.
   * @returns {boolean}
   */
  puedeAsignarMecanico()   { return false; }

  /**
   * Indica si desde este estado se puede reasignar el mecánico.
   * @returns {boolean}
   */
  puedeReasignar()         { return false; }

  /**
   * Indica si este estado permite actualizar el progreso.
   * @returns {boolean}
   */
  puedeActualizarEstado()  { return false; }

  /**
   * Solo las órdenes completadas pueden cerrarse (HU-23).
   * @returns {boolean}
   */
  puedeCerrarse()          { return false; }

  /**
   * Las órdenes cerradas quedan disponibles para facturación
   * y no admiten ninguna modificación posterior (HU-23).
   * @returns {boolean}
   */
  esFinal()                { return false; }
}

// ── Estados concretos ────────────────────────────────────────

/**
 * Estado RECIBIDO:
 * Orden recién creada, vehículo recibido en el taller.
 * Puede avanzar a diagnóstico o cancelarse.
 * Un mecánico puede asignarse pero el trabajo aún no inicia.
 */
class EstadoRecibido extends OrdenState {
  getKey()         { return "recibido"; }
  getLabel()       { return "Recibido"; }
  getDescripcion() { return "Vehículo recibido en el taller, pendiente de diagnóstico."; }
  getBadgeClass()  { return "or-badge--recibido"; }

  // Desde Recibido solo se puede ir a Diagnóstico o Cancelar
  getTransicionesValidas() {
    return [new EstadoDiagnostico(), new EstadoCancelado()];
  }

  puedeAsignarMecanico()  { return true;  } // Se puede asignar antes de iniciar
  puedeReasignar()        { return true;  }
  puedeActualizarEstado() { return true;  }
  puedeCerrarse()         { return false; }
  esFinal()               { return false; }
}

/**
 * Estado DIAGNOSTICO:
 * El mecánico está evaluando el problema del vehículo.
 * Puede avanzar a reparación o cancelarse.
 */
class EstadoDiagnostico extends OrdenState {
  getKey()         { return "diagnostico"; }
  getLabel()       { return "En diagnóstico"; }
  getDescripcion() { return "Mecánico evaluando el problema del vehículo."; }
  getBadgeClass()  { return "or-badge--diagnostico"; }

  // Desde Diagnóstico se puede ir a Reparación o Cancelar
  getTransicionesValidas() {
    return [new EstadoReparacion(), new EstadoCancelado()];
  }

  puedeAsignarMecanico()  { return false; } // Ya debería tener mecánico
  puedeReasignar()        { return true;  } // Admin puede reasignar
  puedeActualizarEstado() { return true;  }
  puedeCerrarse()         { return false; }
  esFinal()               { return false; }
}

/**
 * Estado REPARACION:
 * El trabajo de reparación está en curso.
 * Solo puede avanzar a Completado o Cancelado.
 */
class EstadoReparacion extends OrdenState {
  getKey()         { return "reparacion"; }
  getLabel()       { return "En reparación"; }
  getDescripcion() { return "Trabajo de reparación en curso."; }
  getBadgeClass()  { return "or-badge--reparacion"; }

  // Desde Reparación solo se puede ir a Completado o Cancelar
  getTransicionesValidas() {
    return [new EstadoCompletado(), new EstadoCancelado()];
  }

  puedeAsignarMecanico()  { return false; }
  puedeReasignar()        { return true;  } // Admin puede reasignar incluso en curso
  puedeActualizarEstado() { return true;  }
  puedeCerrarse()         { return false; }
  esFinal()               { return false; }
}

/**
 * Estado COMPLETADO:
 * La reparación terminó. Listo para entrega y facturación.
 * Es el ÚNICO estado desde el que se puede CERRAR la orden (HU-23).
 */
class EstadoCompletado extends OrdenState {
  getKey()         { return "completado"; }
  getLabel()       { return "Completado"; }
  getDescripcion() { return "Reparación terminada, listo para entrega al cliente."; }
  getBadgeClass()  { return "or-badge--completado"; }

  // Desde Completado SOLO se puede cerrar — regla de negocio HU-23
  getTransicionesValidas() {
    return [new EstadoCerrado()];
  }

  puedeAsignarMecanico()  { return false; }
  puedeReasignar()        { return false; }
  puedeActualizarEstado() { return true;  } // Para proceder al cierre
  puedeCerrarse()         { return true;  } // Única transición disponible
  esFinal()               { return false; }
}

/**
 * Estado CERRADO:
 * Orden finalizada. Estado terminal.
 * No admite ninguna modificación posterior (HU-23).
 * Queda disponible para el módulo de facturación.
 */
class EstadoCerrado extends OrdenState {
  getKey()         { return "cerrado"; }
  getLabel()       { return "Cerrado"; }
  getDescripcion() { return "Orden cerrada. Disponible para facturación."; }
  getBadgeClass()  { return "or-badge--cerrado"; }

  // Estado terminal: ninguna transición permitida
  getTransicionesValidas() { return []; }

  puedeAsignarMecanico()  { return false; }
  puedeReasignar()        { return false; }
  puedeActualizarEstado() { return false; } // Impide modificaciones (HU-23)
  puedeCerrarse()         { return false; }
  esFinal()               { return true;  } // Estado terminal
}

/**
 * Estado CANCELADO:
 * Orden cancelada. Estado terminal.
 * No puede reactivarse ni modificarse.
 */
class EstadoCancelado extends OrdenState {
  getKey()         { return "cancelado"; }
  getLabel()       { return "Cancelado"; }
  getDescripcion() { return "Orden cancelada. No puede reactivarse."; }
  getBadgeClass()  { return "or-badge--cancelado"; }

  // Estado terminal: ninguna transición permitida
  getTransicionesValidas() { return []; }

  puedeAsignarMecanico()  { return false; }
  puedeReasignar()        { return false; }
  puedeActualizarEstado() { return false; }
  puedeCerrarse()         { return false; }
  esFinal()               { return true;  } // Estado terminal
}

// ── OrdenContext (contexto del patrón State) ─────────────────

/**
 * OrdenContext es el "contexto" del patrón State.
 * Mantiene una referencia al estado actual y delega todas
 * las decisiones de comportamiento al estado concreto.
 *
 * Los componentes React nunca consultan el estado de una orden
 * directamente con strings (if orden.estado === "completado").
 * En cambio, crean un OrdenContext y preguntan al contexto,
 * que internamente delega al estado concreto correspondiente.
 *
 * Uso:
 *   const ctx = new OrdenContext("reparacion");
 *   ctx.puedeActualizarEstado(); // true
 *   ctx.getTransicionesValidas(); // [EstadoCompletado, EstadoCancelado]
 */
export class OrdenContext {
  /**
   * @param {string} estadoKey - Valor del campo `estado` en la BD
   */
  constructor(estadoKey) {
    // El contexto resuelve qué clase de estado corresponde a la clave
    this._estado = OrdenContext._resolver(estadoKey);
  }

  /**
   * Fábrica interna que mapea el string de la BD
   * a la clase de estado concreta correspondiente.
   * @param {string} key
   * @returns {OrdenState}
   */
  static _resolver(key) {
    const mapa = {
      recibido:    new EstadoRecibido(),
      diagnostico: new EstadoDiagnostico(),
      reparacion:  new EstadoReparacion(),
      completado:  new EstadoCompletado(),
      cerrado:     new EstadoCerrado(),
      cancelado:   new EstadoCancelado(),
    };
    // Si la clave no existe, usa Recibido como estado por defecto
    return mapa[key] ?? new EstadoRecibido();
  }

  // ── Delegación al estado concreto ──────────────────────────
  // Todos estos métodos simplemente delegan al estado actual,
  // que es la esencia del patrón State.

  getKey()                 { return this._estado.getKey(); }
  getLabel()               { return this._estado.getLabel(); }
  getDescripcion()         { return this._estado.getDescripcion(); }
  getBadgeClass()          { return this._estado.getBadgeClass(); }
  getTransicionesValidas() { return this._estado.getTransicionesValidas(); }
  puedeAsignarMecanico()   { return this._estado.puedeAsignarMecanico(); }
  puedeReasignar()         { return this._estado.puedeReasignar(); }
  puedeActualizarEstado()  { return this._estado.puedeActualizarEstado(); }
  puedeCerrarse()          { return this._estado.puedeCerrarse(); }
  esFinal()                { return this._estado.esFinal(); }
}

/**
 * Helper para crear un OrdenContext desde un objeto de orden.
 * Uso: const ctx = crearContextoOrden(orden);
 * @param {{ estado: string }} orden
 * @returns {OrdenContext}
 */
export function crearContextoOrden(orden) {
  return new OrdenContext(orden?.estado ?? "recibido");
}