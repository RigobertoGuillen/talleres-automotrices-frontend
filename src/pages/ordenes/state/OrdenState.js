/**
 * ============================================================
 * PATRÓN DE DISEÑO: STATE (Estado)
 * ============================================================
 * Estados reales del backend:
 *   recibido → en reparacion → listo → entregado
 *   cualquiera puede cancelarse (excepto entregado)
 * ============================================================
 */

class OrdenState {
  getKey()                 { return ""; }
  getLabel()               { return ""; }
  getDescripcion()         { return ""; }
  getBadgeClass()          { return "or-badge--recibido"; }
  getTransicionesValidas() { return []; }
  puedeAsignarMecanico()   { return false; }
  puedeReasignar()         { return false; }
  puedeActualizarEstado()  { return false; }
  puedeCerrarse()          { return false; }
  esFinal()                { return false; }
}

/**
 * RECIBIDO — orden recién creada, pendiente de iniciar.
 * Puede avanzar a "en reparacion".
 */
class EstadoRecibido extends OrdenState {
  getKey()         { return "recibido"; }
  getLabel()       { return "Recibido"; }
  getDescripcion() { return "Vehículo recibido, pendiente de iniciar reparación."; }
  getBadgeClass()  { return "or-badge--recibido"; }
  getTransicionesValidas() { return [new EstadoEnReparacion()]; }
  puedeAsignarMecanico()  { return true;  }
  puedeReasignar()        { return true;  }
  puedeActualizarEstado() { return true;  }
  puedeCerrarse()         { return false; }
  esFinal()               { return false; }
}

/**
 * EN REPARACION — trabajo en curso.
 * Puede avanzar a "listo".
 */
class EstadoEnReparacion extends OrdenState {
  getKey()         { return "en reparacion"; }
  getLabel()       { return "En reparación"; }
  getDescripcion() { return "Trabajo de reparación en curso."; }
  getBadgeClass()  { return "or-badge--reparacion"; }
  getTransicionesValidas() { return [new EstadoListo()]; }
  puedeAsignarMecanico()  { return false; }
  puedeReasignar()        { return true;  }
  puedeActualizarEstado() { return true;  }
  puedeCerrarse()         { return false; }
  esFinal()               { return false; }
}

/**
 * LISTO — reparación terminada, listo para entregar.
 * Es el ÚNICO estado desde el que se puede cerrar (entregar) — HU-23.
 */
class EstadoListo extends OrdenState {
  getKey()         { return "listo"; }
  getLabel()       { return "Listo"; }
  getDescripcion() { return "Reparación terminada, listo para entregar al cliente."; }
  getBadgeClass()  { return "or-badge--completado"; }
  // Desde listo solo se puede cerrar (entregar)
  getTransicionesValidas() { return []; }
  puedeAsignarMecanico()  { return false; }
  puedeReasignar()        { return false; }
  puedeActualizarEstado() { return false; }
  puedeCerrarse()         { return true;  } // HU-23: solo desde listo
  esFinal()               { return false; }
}

/**
 * ENTREGADO — orden cerrada. Estado terminal.
 * No admite ninguna modificación posterior — HU-23.
 */
class EstadoEntregado extends OrdenState {
  getKey()         { return "entregado"; }
  getLabel()       { return "Entregado"; }
  getDescripcion() { return "Vehículo entregado al cliente. Disponible para facturación."; }
  getBadgeClass()  { return "or-badge--cerrado"; }
  getTransicionesValidas() { return []; }
  puedeAsignarMecanico()  { return false; }
  puedeReasignar()        { return false; }
  puedeActualizarEstado() { return false; } // HU-23: impide modificaciones
  puedeCerrarse()         { return false; }
  esFinal()               { return true;  }
}

// ── OrdenContext ──────────────────────────────────────────────────────────

/**
 * OrdenContext — contexto del patrón State.
 * Recibe la clave string de la BD y delega al estado concreto.
 */
export class OrdenContext {
  constructor(estadoKey) {
    this._estado = OrdenContext._resolver(estadoKey);
  }

  static _resolver(key) {
    const mapa = {
      "recibido":      new EstadoRecibido(),
      "en reparacion": new EstadoEnReparacion(),
      "listo":         new EstadoListo(),
      "entregado":     new EstadoEntregado(),
    };
    return mapa[key] ?? new EstadoRecibido();
  }

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
 * @param {{ estado: string }} orden
 */
export function crearContextoOrden(orden) {
  return new OrdenContext(orden?.estado ?? "recibido");
}