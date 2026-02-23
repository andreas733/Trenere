import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (path === "/admin/login" || path.startsWith("/admin/auth/")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const identities = user.identities ?? [];
  const isAzure = identities.some((i) => i.provider === "azure");
  if (!isAzure) {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    if (!adminRow) {
      return NextResponse.redirect(
        new URL("/admin/login?error=unauthorized", request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/((?!login|auth).*)"],
};
