import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Partner email — gets full Partner role with ability to switch views
const PARTNER_EMAILS = ["michael@modularequity.com"];

export type UserRole = "partner" | "investor";

function determineRole(email: string): UserRole {
  return PARTNER_EMAILS.includes(email.toLowerCase()) ? "partner" : "investor";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      id: "email-signup",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Full Name", type: "text" },
        firm: { label: "Firm Name", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const name = credentials?.name as string;
        const firm = credentials?.firm as string;
        if (!email || !name) return null;

        return {
          id: email,
          email,
          name,
          image: null,
          firm,
          role: determineRole(email),
        } as { id: string; email: string; name: string; image: null; firm?: string; role: UserRole };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { firm?: string; role?: UserRole; email?: string };
        token.firm = u.firm || "";
        token.role = u.role || determineRole(u.email || "");
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        firm: (token.firm as string) || "",
        role: (token.role as UserRole) || "investor",
      };
    },
  },
  session: { strategy: "jwt" },
});
