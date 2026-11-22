"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, RotateCcw, UserRound } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [captchaPassed, setCaptchaPassed] = useState<boolean>(false);
  const [rotations, setRotations] = useState<number[]>([90, 180, 270, 90]); 
  
  const pieces: string[] = ["/images/piece1.png", "/images/piece2.png", "/images/piece3.png", "/images/piece4.png"];
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!captchaPassed) {
      toast.error("Пожалуйста, сначала порйдите капчу!");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password, rotations }),
      });

      const data = await res.json();
      
        if (res.ok) {
            toast.success(data.message);
            localStorage.setItem("userRole", data.role); // сохраняем роль для дальнейших проверок
            setTimeout(() => router.push("/notes"), 1000);
        } else {
        toast.error(data.error);
        }
    } catch (error) {
        toast.error("Ошибка сервера. Попробуйте позже.");
    }
  };

  const rotatePiece = (index: number): void => {
    const newRotations: number[] = [...rotations];
    newRotations[index] = newRotations[index] + 90; 
    setRotations(newRotations);

    if (newRotations.every((angle: number) => angle % 360 === 0)) {
      setCaptchaPassed(true);
    } else {
      setCaptchaPassed(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center ">
        <div className=" overflow-hidden flex items-stretch gap-5 rounded-4xl border border-[#74619C]/50 bg-[linear-gradient(110.17deg,rgba(36,1,87,0.8)_0.01%,rgba(63,40,102,0.05)_48.09%,rgba(36,1,87,0.5)_100.01%)]">
            <div className="border-r border-[#74619C]/50 relative object-cover object-center w-145 h-169">
                <Image
                className="object-center object-cover"
                    src="/images/moon.png"
                    alt="moon"
                    fill
                ></Image>
            </div> <div className="p-12 flex flex-col gap-6 ">
                <div className="flex flex-col gap-3">
                    <h1 className="font-semibold text-4xl bg-gradient-to-r from-[#EFE8FF] to-[#D8C5FF] bg-clip-text text-transparent">
                        Вход в систему
                    </h1>
                    <p className="text-[#9D8EBD] font-medium">
                        Войдите в свой аккаунт
                    </p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border border-[#74619C]/70 bg-[#4A288E]/10 rounded-full px-4 py-3 w-full focus-within:ring focus-within:ring-[#a97bfd]">
                        <UserRound className="size-6 text-[#AA82F9]" />
                        
                        <input 
                            type="text" 
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="Логин" 
                            className="bg-transparent text-[#9D8EBD] placeholder:text-[#7A6B99] outline-none border-none w-full"
                        />
                    </div>

                    <div className="flex items-center justify-between border border-[#74619C]/70 bg-[#4A288E]/10 rounded-full px-4 py-3 w-full focus-within:ring focus-within:ring-[#a97bfd]">
                        <div className="flex items-center gap-2">
                            <LockKeyhole className="size-6 text-[#AA82F9]" />
                            
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Пароль" 
                                className="bg-transparent text-[#9D8EBD] placeholder:text-[#7A6B99] outline-none border-none w-full"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="cursor-pointer text-[#AA82F9] hover:text-white transition-colors"
                                >
                                {showPassword ? <EyeOff className="size-6" /> : <Eye className="size-6" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center">
                        <p className="flex items-center gap-4 text-[#9D8EBD]">
                            Поверните фрагмент
                            <RotateCcw className="size-6 text-[#AA82F9]"/>
                        </p>
                        
                        <div 
                            className={`grid grid-cols-2  w-48 h-48 mx-auto border rounded-xl overflow-hidden ${
                                captchaPassed ? "border-green-500" : "border-red-400"
                            }`}
                        >
                            {rotations.map((angle: number, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => rotatePiece(index)}
                                    className="w-full  h-full border border-[#9D8EBD] cursor-pointer transition-transform duration-300 ease-in-out bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url(${pieces[index]})`,
                                        transform: `rotate(${angle}deg)`,
                                    }}
                                />
                            ))}
                        </div>
                        
                        {captchaPassed && (
                            <p className="text-green-600 text-sm">Капча пройдена!</p>
                        )}
                    </div>

                    <button type="submit" className="cursor-pointer bg-[#a682f9] text-white py-2 rounded-full hover:bg-[#8758e6] transition-colors">
                        Войти
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}