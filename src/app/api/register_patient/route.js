
import dbconnect, { collectionNameObj } from "@/lib/dbconnect";
import { sendWelcomeEmail } from "@/lib/sendEmail";
import bcrypt from "bcrypt";
import toast from "react-hot-toast";

export async function POST(req) {
    try {
        const payload = await req.json();
        const userCollection = dbconnect(collectionNameObj.VD_Patient_Auth);

        const { email, password, name } = payload;
        if (!email || !password || !name) {
            return new Response(JSON.stringify({ error: "All fields required" }), {
                status: 400,
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify(toast.error("Invalid email format")), {
                status: 400,
            });

        }

        const user = await userCollection.findOne({ email });
        if (user) {
            return new Response(JSON.stringify(toast.dismiss("User already exists")), {
                status: 400,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const doc = {
            name,
            email,
            password: hashedPassword,
            role: "patient",
            createdAt: new Date()
        };
        const result = await userCollection.insertOne({
            ...payload, doc
        });

        await sendWelcomeEmail(email, name);

        return new Response(JSON.stringify({ success: true, id: result.insertedId.toString() }), {
            status: 201,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
