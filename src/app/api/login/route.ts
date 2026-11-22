import { NextResponse } from "next/server";
import { db } from "@/src/server/db";

const MAX_FAILED_ATTEMPTS = 3;

interface LoginRequestBody {
  login?: string;
  password?: string;
  rotations?: number[];
}

interface UserRow {
  id: number;
  login: string;
  password: string;
  role: string;
  is_blocked: boolean;
  failed_attempts: number;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginRequestBody;
    const { login, password, rotations } = body;

    if (!login || !password) {
      return NextResponse.json(
        { error: "Поля «Логин» и «Пароль» обязательны для заполнения." },
        { status: 400 }
      );
    }

    if (!Array.isArray(rotations) || rotations.length === 0) {
      return NextResponse.json(
        { error: "Некорректные данные капчи." },
        { status: 400 }
      );
    }

    const userResult = await db.query<UserRow>(
      "SELECT * FROM users WHERE login = $1",
      [login]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Вы ввели неверный логин или пароль. Пожалуйста проверьте ещё раз введенные данные",
        },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    if (user.is_blocked) {
      return NextResponse.json(
        { error: "Вы заблокированы. Обратитесь к администратору" },
        { status: 403 }
      );
    }

    const registerFailedAttempt = async (): Promise<boolean> => {
      const attempts = user.failed_attempts + 1;
      const shouldBlock = attempts >= MAX_FAILED_ATTEMPTS;
      await db.query(
        "UPDATE users SET failed_attempts = $1, is_blocked = $2 WHERE id = $3",
        [attempts, shouldBlock, user.id]
      );
      return shouldBlock;
    };

    const isCaptchaValid = rotations.every((angle: number) => angle % 360 === 0);
    if (!isCaptchaValid) {
      const blocked = await registerFailedAttempt();
      if (blocked) {
        return NextResponse.json(
          { error: "Вы заблокированы. Обратитесь к администратору" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Капча собрана неверно. Попробуйте ещё раз." },
        { status: 400 }
      );
    }

    if (user.password !== password) {
      const blocked = await registerFailedAttempt();
      if (blocked) {
        return NextResponse.json(
          { error: "Вы заблокированы. Обратитесь к администратору" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        {
          error:
            "Вы ввели неверный логин или пароль. Пожалуйста проверьте ещё раз введенные данные",
        },
        { status: 401 }
      );
    }

    await db.query("UPDATE users SET failed_attempts = 0 WHERE id = $1", [user.id]);

    return NextResponse.json({ message: "Вы успешно авторизовались", role: user.role });
  } catch (error) {
    console.error("Ошибка API логина:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}