"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/store/auth.slice";
import { resetReduxStore } from "@/lib/resetReduxStore";
import { removeCookie } from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    removeCookie("access_token");
    removeCookie("user_kind");
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

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2.5 px-2 py-1.5 h-auto rounded-full hover:bg-gray-100/80 cursor-pointer select-none transition-colors"
        >
          <Avatar className="h-9 w-9 border border-gray-200">
            {user?.avatar_url && !imageError ? (
              <Image
                src={user.avatar_url}
                alt={user.name || "User Avatar"}
                width={36}
                height={36}
                className="h-full w-full object-cover rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <AvatarFallback className="bg-emerald-700 text-white font-semibold text-xs">
                {userInitial}
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

          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      {/* Clean, Minimalist & Modern Dropdown Menu */}
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 p-1.5 rounded-xl shadow-lg border border-gray-100 bg-white"
      >
        {isAuthenticated ? (
          <>
            {/* Header User Info Block */}
            <div className="px-2.5 py-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {user?.email || ""}
              </p>
            </div>

            <DropdownMenuSeparator className="my-1 bg-gray-100" />

            {/* Profile Link */}
            <DropdownMenuItem
              onClick={handleProfileClick}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors flex items-center gap-2.5"
            >
              <UserIcon className="h-4 w-4 text-gray-500 group-hover:text-emerald-700" />
              <span>My Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-gray-100" />

            {/* Logout Link */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50/70 transition-colors flex items-center gap-2.5"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={handleLogin}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
            >
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span>Log in</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleRegister}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50/70 flex items-center gap-2.5 mt-0.5"
            >
              <span>Create Account</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
