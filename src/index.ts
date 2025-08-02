import express, { type Request, type Response } from "express";

const app = express();

app.get("/", async (req: Request, res: Response) => {
  const accept = req.header("accept");
  if (accept === "application/x-ndjson") {
    res.setHeader("content-type", "application/x-ndjson");
    // サンプル: 3つのオブジェクトをストリームで返す
    for (let i = 1; i <= 3; i++) {
      res.write(`${JSON.stringify({ id: i, value: `item${i}` })}\n`);
      await new Promise((r) => setTimeout(r, 200));
    }
    res.end();
  } else {
    // 通常のJSONレスポンス
    res.json({
      items: [
        { id: 1, value: "item1" },
        { id: 2, value: "item2" },
        { id: 3, value: "item3" },
      ],
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
