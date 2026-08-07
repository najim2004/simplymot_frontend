"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/store/auth.slice";
import { resetReduxStore } from "@/lib/resetReduxStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [user?.avatar_url]);

  const handleLogout = () => {
    resetReduxStore();
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    dispatch(logout());
    router.push("/login/driver");
  };

  const handleLogin = () => {
    router.push("/login/driver");
  };

  const handleRegister = () => {
    router.push("/create-account/driver");
  };

  const handleProfileClick = () => {
    const role = user?.type ? user.type.toLowerCase() : "driver";
    const profileRoute =
      role === "admin"
        ? "/admin/profile"
        : role === "garage"
        ? "/garage/profile"
        : "/driver/profile";
    router.push(profileRoute);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 cursor-pointer select-none"
        >
          <Avatar className="h-10 w-10 border">
            {user?.avatar_url && !imageError ? (
              <Image
                src={user.avatar_url}
                alt={user.name || "User Avatar"}
                width={40}
                height={40}
                className="h-full w-full object-cover rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <AvatarFallback className="bg-[#006644] text-white">
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>

          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              {user?.name || (isAuthenticated ? "Account" : "Guest")}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {user?.type?.toLowerCase() || (isAuthenticated ? "User" : "Log in")}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {isAuthenticated ? (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleProfileClick}
              className="cursor-pointer"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={handleLogin}
              className="cursor-pointer"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Log in</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleRegister}
              className="cursor-pointer font-semibold text-[#006644]"
            >
              <span>Create account</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
