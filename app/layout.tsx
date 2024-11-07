"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isAuthPage = pathname === "/login";
        if (!isAuthenticated && !isAuthPage) {
            router.push("/login");
        } else if (isAuthenticated && isAuthPage) {
            router.push("/");
        }
    }, [isAuthenticated, pathname, router]);

    return <>{children}</>;
}
