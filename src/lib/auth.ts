export function verifyAdminCredentials(username: string, password: string): boolean {
  const validUsername = "janek17";
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return false;
  }

  return username === validUsername && password === validPassword;
}
