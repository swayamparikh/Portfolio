"use client";

import { LogOut, User } from "lucide-react";

import { signOut } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserMenu({ email }: { email: string }) {
  const initial = email.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm sm:inline">{email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <User className="size-4" />
          <span className="truncate">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => signOut()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
