import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { exec } from "child_process";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const scriptPath = path.resolve(process.cwd(), "scripts/dexScanner.ts");

  exec(`npm run ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    return res.status(200).json({ output: stdout });
  });
}
