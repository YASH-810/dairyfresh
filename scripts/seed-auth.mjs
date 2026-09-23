// Creates/Updates demo logins in Firebase Auth + Firestore `users`.
// Usage: npm run seed:auth   (reads .env.local)
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const privateKey = rawKey ? rawKey.replace(/\\n/g, "\n").replace(/^"|"$/g, "") : undefined;

initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  }),
});

const PASSWORD = "Demo@1234"; // = DEMO_PASSWORD in seed-data.ts
const addr = { id: "addr1", line: "14, Sunrise Apartments", area: "Kothrud", city: "Pune", pincode: "411038", isDefault: true };
const users = [
  { uid: "u_customer", name: "Anaya Kulkarni", email: "customer@dairyfresh.test", phone: "9876543210", role: "CUSTOMER", addresses: [addr] },
  { uid: "u_admin", name: "Yash", email: "yash24beit@student.mes.ac.in", phone: "9876500001", role: "ADMIN", addresses: [] },
  { uid: "u_delivery", name: "Suresh Pawar", email: "delivery@dairyfresh.test", phone: "9876500002", role: "DELIVERY", addresses: [] },
  { uid: "u_b2b", name: "The Sweet Spot Café", email: "b2b@dairyfresh.test", phone: "9876500003", role: "B2B",
    addresses: [{ ...addr, id: "addr2", line: "Shop 4, FC Road", area: "Shivajinagar", pincode: "411005" }] },
];

const auth = getAuth();
const db = getFirestore();

for (const { uid, name, email, phone, role, addresses } of users) {
  let userUid = uid;
  try {
    const existing = await auth.getUserByEmail(email);
    userUid = existing.uid;
    await auth.updateUser(userUid, {
      password: PASSWORD,
      displayName: name,
    });
    console.log(`Updated existing auth user for ${email} (UID: ${userUid})`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      try {
        const created = await auth.createUser({
          uid,
          email,
          password: PASSWORD,
          displayName: name,
        });
        userUid = created.uid;
        console.log(`Created new auth user for ${email} (UID: ${userUid})`);
      } catch (createErr) {
        console.error(`Error creating user ${email}:`, createErr.message);
        continue;
      }
    } else {
      console.error(`Error fetching user ${email}:`, err.message);
      continue;
    }
  }

  await auth.setCustomUserClaims(userUid, { role });
  await db.collection("users").doc(userUid).set(
    { name, email, phone, role, addresses, walletBalance: 0, loyaltyPoints: 0 },
    { merge: true }
  );
  console.log(`✓ ${role.padEnd(8)} ${email} (Password: ${PASSWORD}, Role: ${role})`);
}
