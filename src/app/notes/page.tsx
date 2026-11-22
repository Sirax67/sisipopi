"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldUser } from "lucide-react";

interface Note {
  id: string;
  title_user: string;
  content: string;
  formatted_date: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) setUserRole(storedRole);
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/notes");
        if (!res.ok) throw new Error("Ошибка при загрузке заметок");
        const data: Note[] = await res.json();
        setNotes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  if (loading) return <p className="p-10 text-[#9D8EBD] text-center">Загрузка заметок...</p>;
  if (error) return <p className="p-10 text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen  p-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-4xl bg-gradient-to-r from-[#EFE8FF] to-[#D8C5FF] bg-clip-text text-transparent">
            Список заметок
          </h1>

          {userRole === "Администратор" && (
            <Button
              onClick={() => router.push("/admin")}
              className="bg-[#AA82F9] text-white rounded-full px-5 py-4 cursor-pointer hover:bg-[#8758e6] transition-colors"
            >
              <ShieldUser className="size-4 " />
              Админ-панель
            </Button>
          )}
        </div>

        <div className="bg-white/5 rounded-xl border border-[#74619C]/50 p-4 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#74619C]/50 hover:bg-transparent">
                <TableHead className="p-4 text-[#AA82F9] font-semibold">Код</TableHead>
                <TableHead className="p-4 text-[#AA82F9] font-semibold">Заголовок и автор</TableHead>
                <TableHead className="p-4 text-[#AA82F9] font-semibold">Содержание</TableHead>
                <TableHead className="text-right text-[#AA82F9] font-semibold">Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-[#9D8EBD]">
                    Заметок пока нет
                  </TableCell>
                </TableRow>
              ) : (
                notes.map((note) => (
                  <TableRow key={note.id} className="border-[#74619C]/30 hover:bg-[#4A288E]/20 transition-colors ">
                    <TableCell className="text-[#9D8EBD] p-4">{note.id}</TableCell>
                    <TableCell className="text-[#9D8EBD] p-4">{note.title_user}</TableCell>
                    <TableCell className="text-[#9D8EBD] max-w-100 truncate p-4">
                      {note.content}
                    </TableCell>
                    <TableCell className="text-[#9D8EBD] text-right">{note.formatted_date}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}