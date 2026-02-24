import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Manglende miljøvariabler: NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY må være satt (sjekk Vercel → Settings → Environment Variables)"
    );
  }
  return { url, key };
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host") ?? "";

  // nytrener.skiensvk.no → redirect til registreringssiden
  if (host === "nytrener.skiensvk.no") {
    return NextResponse.redirect(
      new URL("https://trenere.skiensvk.no/registrer"),
      301
    );
  }

  // Min side: trener-login (email/password)
  if (path.startsWith("/min-side")) {
    if (path === "/min-side/login") {
      return NextResponse.next();
    }
    const { url, key } = getSupabaseEnv();
    let response = NextResponse.next({ request });
    const supabase = createServerClient(
      url,
      key,
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
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // Admin: Azure / admin_users
  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (path === "/admin/login" || path.startsWith("/admin/auth/")) {
    return NextResponse.next();
  }

  const { url, key } = getSupabaseEnv();
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    url,
    key,
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
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/admin",
    "/admin/((?!login|auth).*)",
    "/min-side",
    "/min-side/:path*",
  ],
};
