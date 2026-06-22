import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUser,
} from "../services/userService";

export default function useUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async (user) => {
    await createUser(user);
    loadUsers();
  };

  const editUser = async (id, user) => {
    await updateUser(id, user);
    loadUsers();
  };

  const removeUser = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  const changeStatus = async (id, activo) => {
    await toggleUser(id, activo);
    loadUsers();
  };

  return { users, addUser, editUser, removeUser, changeStatus };
}