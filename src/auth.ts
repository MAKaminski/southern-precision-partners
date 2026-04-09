import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Simple in-memory investor registry (in production, use a database)
// Investors who sign up via email are stored here for the session
const registeredEmails = new Set<string>();

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
        email: { label: "Email", type: "email", placeholder: "investor@example.com" },
        name: { label: "Full Name", type: "text", placeholder: "Jane Smith" },
        firm: { label: "Firm Name", type: "text", placeholder: "Acme Capital" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const name = credentials?.name as string;
        const firm = credentials?.firm as string;

        if (!email || !name) return null;

        // Register the investor
        registeredEmails.add(email);

        return {
          id: email,
          email,
          name,
          image: null,
          firm,
        } as { id: string; email: string; name: string; image: null; firm?: string };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && "firm" in user) {
        token.firm = (user as { firm?: string }).firm;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.firm) {
        (session as { firm?: string }).firm = token.firm as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
