"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Edit, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  login: string;
  role: string;
  is_blocked: boolean;
  failed_attempts: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [newLogin, setNewLogin] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("Пользователь");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editLogin, setEditLogin] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("Пользователь");

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = ещё проверяем 
  const router = useRouter();
  const fetchUsers = async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Не удалось загрузить список пользователей");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Ошибка при загрузке пользователей");
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");

    if (storedRole !== "Администратор") {
      toast.error("Доступ запрещён. Эта страница доступна только администратору.");
      router.push("/notes");
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user: User): Promise<void> => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isBlocked: !user.is_blocked }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          user.is_blocked ? "Пользователь разблокирован!" : "Пользователь заблокирован!"
        );
        fetchUsers();
      } else {
        toast.error(data.error ?? "Ошибка при изменении статуса пользователя");
      }
    } catch (error) {
      toast.error("Ошибка сервера. Попробуйте позже.");
    }
  };

  const handleAddUser = async (): Promise<void> => {
    if (!newLogin.trim() || !newPassword.trim()) {
      toast.error("Поля «Логин» и «Пароль» обязательны для заполнения.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: newLogin, password: newPassword, role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Пользователь успешно добавлен!");
        setIsAddDialogOpen(false);
        setNewLogin("");
        setNewPassword("");
        setNewRole("Пользователь");
        fetchUsers();
      } else {
        toast.error(data.error ?? "Ошибка при добавлении пользователя");
      }
    } catch (error) {
      toast.error("Ошибка сервера. Попробуйте позже.");
    }
  };

  const openEditDialog = (user: User): void => {
    setEditingUser(user);
    setEditLogin(user.login);
    setEditRole(user.role);
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingUser) return;

    if (!editLogin.trim()) {
      toast.error("Поле «Логин» обязательно для заполнения.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, login: editLogin, role: editRole }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Данные пользователя обновлены!");
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(data.error ?? "Ошибка при обновлении пользователя");
      }
    } catch (error) {
      toast.error("Ошибка сервера. Попробуйте позже.");
    }
  };
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#9D8EBD]">Проверка доступа...</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className="min-h-screen p-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <Link href="/notes" className="flex items-center text-lg text-white">
          <ChevronLeft className="size-8"/>
          Назад
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            <h1 className="font-semibold text-4xl bg-gradient-to-r from-[#EFE8FF] to-[#D8C5FF] bg-clip-text text-transparent">
              Панель администратора
            </h1>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger className="px-5 py-2 text-white bg-[#AA82F9] rounded-full hover:bg-[#8758e6] transition-colors">
              Добавить пользователя
            </DialogTrigger>
            <DialogContent className="bg-[#1A0B33] border border-[#74619C]/50 text-[#EFE8FF]">
              <DialogHeader>
                <DialogTitle className="text-[#EFE8FF]">Новый пользователь</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-login" className="text-[#9D8EBD]">
                    Логин
                  </Label>
                  <Input
                    id="new-login"
                    value={newLogin}
                    onChange={(e) => setNewLogin(e.target.value)}
                    placeholder="Введите логин"
                    className="bg-[#4A288E]/10 border-[#74619C]/70 text-[#EFE8FF] placeholder:text-[#7A6B99]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-password" className="text-[#9D8EBD]">
                    Пароль
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="bg-[#4A288E]/10 border-[#74619C]/70 text-[#EFE8FF] placeholder:text-[#7A6B99]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#9D8EBD]">Роль</Label>
                  <Select
                    value={newRole}
                    onValueChange={(value) => {
                      if (value) setNewRole(value);
                    }}
                  >
                    <SelectTrigger className="bg-[#4A288E]/10 border-[#74619C]/70 text-[#EFE8FF]">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A0B33] border-[#74619C]/50 text-[#EFE8FF]">
                      <SelectItem value="Пользователь">Пользователь</SelectItem>
                      <SelectItem value="Администратор">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddUser}
                  className="bg-[#AA82F9] text-white rounded-full hover:bg-[#8758e6] transition-colors"
                >
                  Добавить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white/5 rounded-xl border border-[#74619C]/50 p-4 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#74619C]/50 hover:bg-transparent">
                <TableHead className="p-4 text-[#AA82F9] font-semibold">ID</TableHead>
                <TableHead className="p-4 text-[#AA82F9] font-semibold">Логин</TableHead>
                <TableHead className="p-4 text-[#AA82F9] font-semibold">Роль</TableHead>
                <TableHead className="p-4 text-[#AA82F9] font-semibold">Статус</TableHead>
                <TableHead className="text-right p-4 text-[#AA82F9] font-semibold">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-[#9D8EBD]">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-[#74619C]/30 hover:bg-[#4A288E]/20 transition-colors"
                  >
                    <TableCell className="text-[#9D8EBD] p-4">{user.id}</TableCell>
                    <TableCell className="text-[#9D8EBD] p-4">{user.login}</TableCell>
                    <TableCell className="text-[#9D8EBD] p-4">{user.role}</TableCell>
                    <TableCell className="p-4">
                      {user.is_blocked ? (
                        <span className="text-red-400 font-bold">Заблокирован</span>
                      ) : (
                        <span className="text-green-400">Активен</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                          className="size-9 p-0 rounded-xl border-[#74619C]/50 bg-[#4A288E]/20 text-[#AA82F9] hover:bg-[#4A288E]/40 hover:text-white"
                        >
                          <Edit className="size-4" />
                        </Button>

                        <Button
                          onClick={() => handleToggleBlock(user)}
                          className="bg-[#AA82F9] text-white rounded-full hover:bg-[#8758e6] transition-colors"
                             
                        >
                          {user.is_blocked ? "Разблокировать" : "Заблокировать"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-[#1A0B33] border border-[#74619C]/50 text-[#EFE8FF]">
          <DialogHeader>
            <DialogTitle className="text-[#EFE8FF]">Редактирование пользователя</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-login" className="text-[#9D8EBD]">
                Логин
              </Label>
              <Input
                id="edit-login"
                value={editLogin}
                onChange={(e) => setEditLogin(e.target.value)}
                className="bg-[#4A288E]/10 border-[#74619C]/70 text-[#EFE8FF]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[#9D8EBD]">Роль</Label>
              <Select
                value={editRole}
                onValueChange={(value) => {
                  if (value) setEditRole(value);
                }}
>
                <SelectTrigger className="bg-[#4A288E]/10 border-[#74619C]/70 text-[#EFE8FF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A0B33] border-[#74619C]/50 text-[#EFE8FF]">
                  <SelectItem value="Пользователь">Пользователь</SelectItem>
                  <SelectItem value="Администратор">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#AA82F9] text-white rounded-full hover:bg-[#8758e6] transition-colors"
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}