// import CredentialsProvider from "next-auth/providers/credentials"
// import GoogleProvider from "next-auth/providers/google";

// import NextAuth from "next-auth"

// import { loginUser } from "../../login_patient/route";
// import dbconnect, { collectionNameObj } from "@/lib/dbconnect";
// import { sendWelcomeEmail } from "@/lib/sendEmail";

// export const authOptions = {

//   providers: [
//     CredentialsProvider({

//       name: 'Credentials',

//       credentials: {
//         email: { label: "Email", type: "text", placeholder: "Enter Email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {


//         const user = await loginUser(credentials);


//         if (user) {
//           return user
//         }
//         // Return null if user data could not be retrieved
//         return null
//       }
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     })
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/login"
//   },
//   callbacks: {






//     // async signIn({ user, account, profile, email, credentials }) {
//     //   // console.log({user, account, profile, email, credentials})
//     //   if(account){
//     //     const{providerAccountId, provider}=account;
//     //     const{email: user_email, image, name}=user;
//     //     const VD_Patient_Auth = dbconnect(collectionNameObj.VD_Patient_Auth);
//     //     const isExister=await VD_Patient_Auth.findOne({providerAccountId})
//     //     if(!isExister){
//     //       const payload = {providerAccountId, provider, 
//     //         email:user_email, image, name};
//     //       await VD_Patient_Auth.insertOne(payload);
//     //     }
//     //   }
//     //   return true
//     // }



//     async signIn({ user, account, profile, email, credentials }) {
//       if (account) {
//         const { providerAccountId, provider } = account;
//         const { email: user_email, image, name } = user;
//         const VD_Patient_Auth = dbconnect(collectionNameObj.VD_Patient_Auth);

//         const existingUser = await VD_Patient_Auth.findOne({ providerAccountId });

//         if (!existingUser) {
//           // New user (first time login with Google)
//           const payload = {
//             providerAccountId,
//             provider,
//             email: user_email,
//             image,
//             name,
//             createdAt: new Date(),
//           };

//           await VD_Patient_Auth.insertOne(payload);

//           // 👇 Send Welcome Email only first time
//           try {
//             await sendWelcomeEmail(user_email, name || "User");
//           } catch (err) {
//             console.error("Error sending welcome email:", err);
//           }
//         }
//       }
//       return true;
//     }

//   }


// }

// const handler = NextAuth(authOptions)

// export { handler as GET, handler as POST }































import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { loginUser } from "../../login_doctor/route"; 

import { sendWelcomeEmail } from "@/lib/sendEmail";


import { cookies } from "next/headers";
import dbconnect, { collectionNameObj } from "@/lib/dbconnect";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await loginUser(credentials);
        if (user) return user;
        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },

  callbacks: {
 

    async signIn({ user, account, profile }) {
      try {
     
        if (account?.provider === "google") {
      
          const cookieStore = cookies();
          const roleCookie = cookieStore.get("vd_role")?.value;
       
          const providerAccountId = account.providerAccountId || null;
          const email = user?.email || null;
          const name = user?.name || "";
          const image = user?.image || "";

         
          const chooseCollection = (role) =>
            role === "doctor"
              ? dbconnect(collectionNameObj.VD_Doctor_Auth)
              : dbconnect(collectionNameObj.VD_Patient_Auth);

     
          let targetRole = null;
          if (roleCookie === "doctor" || roleCookie === "patient") {
            targetRole = roleCookie;
          }

    
          if (!targetRole) {

            if (providerAccountId) {
              const docCol = chooseCollection("doctor");
              const foundDoc = await docCol.findOne({ providerAccountId });
              if (foundDoc) targetRole = "doctor";
            }
            if (!targetRole && email) {
              const docCol = chooseCollection("doctor");
              const foundByEmail = await docCol.findOne({ email });
              if (foundByEmail) targetRole = "doctor";
            }

          
            if (!targetRole && providerAccountId) {
              const patCol = chooseCollection("patient");
              const foundPat = await patCol.findOne({ providerAccountId });
              if (foundPat) targetRole = "patient";
            }
            if (!targetRole && email) {
              const patCol = chooseCollection("patient");
              const foundByEmail = await patCol.findOne({ email });
              if (foundByEmail) targetRole = "patient";
            }
          }

      
          if (!targetRole) targetRole = "patient";

          const userCollection = chooseCollection(targetRole);

    
          const lookupQuery = providerAccountId ? { providerAccountId } : { email };

          const existing = await userCollection.findOne(lookupQuery);

          if (!existing) {
            const payload = {
              provider: "google",
              providerAccountId,
              email,
              name,
              image,
              role: targetRole,
              createdAt: new Date(),
            };
            await userCollection.insertOne(payload);
            try {
              await sendWelcomeEmail(email, name || "User");
            } catch (e) {
              console.error("Email send failed:", e);
            }
            console.log("Inserted user into", targetRole, "collection for", email);
          } else {
            await userCollection.updateOne(
              lookupQuery,
              { $set: { name: name || existing.name, image: image || existing.image, lastLoginAt: new Date() } }
            );
            console.log("Updated user in", targetRole, "collection for", email);
          }
        }
      } catch (err) {
        console.error("signIn callback error:", err);
  
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



