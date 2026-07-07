/**
 * PATRÓN STATE — estados reales del backend:
 * recibido → en reparacion → listo → entregado
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

class EstadoRecibido extends OrdenState {
  getKey()         { return "recibido"; }
  getLabel()       { return "Recibido"; }
  getDescripcion() { return "Vehículo recibido, pendiente de iniciar reparación."; }
  getBadgeClass()  { return "or-badge--recibido"; }
  getTransicionesValidas() { return [new EstadoEnReparacion()]; }
  puedeAsignarMecanico()  { return true; }
  puedeReasignar()        { return true; }
  puedeActualizarEstado() { return true; }
}

class EstadoEnReparacion extends OrdenState {
  getKey()         { return "en reparacion"; }
  getLabel()       { return "En reparación"; }
  getDescripcion() { return "Trabajo de reparación en curso."; }
  getBadgeClass()  { return "or-badge--reparacion"; }
  getTransicionesValidas() { return [new EstadoListo()]; }
  puedeReasignar()        { return true; }
  puedeActualizarEstado() { return true; }
}

class EstadoListo extends OrdenState {
  getKey()         { return "listo"; }
  getLabel()       { return "Listo"; }
  getDescripcion() { return "Reparación terminada, listo para entregar."; }
  getBadgeClass()  { return "or-badge--completado"; }
  getTransicionesValidas() { return []; }
  puedeCerrarse()  { return true; }
  puedeActualizarEstado() { return false; }
}

class EstadoEntregado extends OrdenState {
  getKey()         { return "entregado"; }
  getLabel()       { return "Entregado"; }
  getDescripcion() { return "Vehículo entregado. Disponible para facturación."; }
  getBadgeClass()  { return "or-badge--cerrado"; }
  esFinal()        { return true; }
}

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

export function crearContextoOrden(orden) {
  return new OrdenContext(orden?.estado ?? "recibido");
}