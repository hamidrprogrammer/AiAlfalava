import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const { AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID, NEXTAUTH_SECRET } = process.env;

if (!AZURE_AD_CLIENT_ID || !AZURE_AD_CLIENT_SECRET || !AZURE_AD_TENANT_ID || !NEXTAUTH_SECRET) {
    throw new Error("The Azure AD environment variables are not set.");
}

const handler = NextAuth({
    providers: [
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            tenantId: process.env.AZURE_AD_TENANT_ID,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {

            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET, // Set a secret for NextAuth
});

export { handler as GET, handler as POST };
