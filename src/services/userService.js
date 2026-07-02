import api from "./api";

export const getUsers = async () => {
  try {
    const { data } = await api.get("/usuarios");
    return data.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

// - Obtener un usuario por ID
export const getUser = async (id) => {
  try {
    const { data } = await api.get(`/usuarios/${id}`);
    return data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const { data } = await api.post("/usuarios", userData);
    return data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const { data } = await api.put(`/usuarios/${id}`, userData);
    return data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const { data } = await api.delete(`/usuarios/${id}`);
    return data;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }


};

export const toggleUser = async (id, activo) => {
  try {
    const { data } = await api.patch(`/usuarios/${id}/estado`, { activo });
    return data;
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    throw error;
  }
};