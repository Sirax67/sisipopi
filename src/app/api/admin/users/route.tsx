import { NextResponse } from "next/server";
import { db } from "@/src/server/db";

interface CreateUserBody {
  login: string;
  password: string;
  role: string;
}

interface UpdateUserBody {
  id: number;
  login?: string;
  role?: string;
  isBlocked?: boolean;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const idUserParam = searchParams.get("id_user");

    if (idUserParam !== null) {
      const idUser = Number(idUserParam);

      if (!Number.isInteger(idUser) || idUser <= 0) {
        return NextResponse.json(
          { error: "Некорректный параметр id_user. Ожидается целое число." },
          { status: 400 }
        );
      }

      const result = await db.query(
        "SELECT id, login, role, is_blocked, failed_attempts FROM users WHERE id = $1",
        [idUser]
      );

      return NextResponse.json(result.rows, { status: 200 }); // [] если не найден — тоже 200, по ТЗ
    }

    const result = await db.query(
      "SELECT id, login, role, is_blocked, failed_attempts FROM users ORDER BY id ASC"
    );
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    return NextResponse.json({ error: "Ошибка подключения к базе данных" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateUserBody;
    const { login, password, role } = body;

    if (!login || !password || !role) {
      return NextResponse.json(
        { error: "Поля «Логин», «Пароль» и «Роль» обязательны для заполнения." },
        { status: 400 }
      );
    }

    const existing = await db.query("SELECT id FROM users WHERE login = $1", [login]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: `Пользователь с логином "${login}" уже существует.` },
        { status: 409 }
      );
    }

    await db.query(
      "INSERT INTO users (login, password, role, is_blocked, failed_attempts) VALUES ($1, $2, $3, false, 0)",
      [login, password, role]
    );

    return NextResponse.json({ message: "Пользователь успешно добавлен." }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error);
    return NextResponse.json({ error: "Ошибка подключения к базе данных" }, { status: 500 });
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as UpdateUserBody;
    const { id, login, role, isBlocked } = body;

    if (!id) {
      return NextResponse.json({ error: "Не указан идентификатор пользователя." }, { status: 400 });
    }

    if (login) {
      const existing = await db.query(
        "SELECT id FROM users WHERE login = $1 AND id != $2",
        [login, id]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json(
          { error: `Логин "${login}" уже используется другим пользователем.` },
          { status: 409 }
        );
      }
      await db.query("UPDATE users SET login = $1 WHERE id = $2", [login, id]);
    }

    if (role) {
      await db.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
    }

    if (typeof isBlocked === "boolean") {
      if (isBlocked) {
        await db.query("UPDATE users SET is_blocked = true WHERE id = $1", [id]);
      } else {
        await db.query(
          "UPDATE users SET is_blocked = false, failed_attempts = 0 WHERE id = $1",
          [id]
        );
      }
    }

    return NextResponse.json({ message: "Данные пользователя обновлены." }, { status: 200 });
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
    return NextResponse.json({ error: "Ошибка подключения к базе данных" }, { status: 500 });
  }
}