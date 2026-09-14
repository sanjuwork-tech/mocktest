import { ownerConnection } from "./db-env.mjs";
const sql = ownerConnection();
try {
  await sql.begin(async (tx) => {
    await tx`delete from auth_rate_limits where reset_at<now()-interval '1 day'`;
    await tx`delete from sessions where expires_at<now()-interval '30 days'`;
  });
  console.log(
    "Expired authentication records cleaned. Audit history preserved.",
  );
} finally {
  await sql.end();
}
