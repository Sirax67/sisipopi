import { NextResponse } from "next/server";
import { db } from "@/src/server/db";

interface NoteRow {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  login: string; 
}


interface FormattedNote {
  id: string;
  title_user: string;
  content: string;
  formatted_date: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    const result = await db.query<NoteRow>(`
      SELECT 
        n.id, 
        n.title, 
        n.content, 
        n.created_at, 
        u.login 
      FROM notes n
      JOIN users u ON n.id_user = u.id
      ORDER BY n.created_at DESC
    `);


    if (result.rows.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const formattedNotes: FormattedNote[] = result.rows.map((note: NoteRow) => {
      const date = new Date(note.created_at);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;

      return {
        id: String(note.id).padStart(5, "0"),
        title_user: `${note.title} - ${note.login}`, 
        content: note.content,
        formatted_date: formattedDate,
      }
    });


    return NextResponse.json(formattedNotes, { status: 200 });

  } catch (error) {

    console.error("Ошибка при получении заметок:", error);
    return NextResponse.json(
      { error: "Ошибка подключения к базе данных" }, 
      { status: 500 }
    );
  }
}