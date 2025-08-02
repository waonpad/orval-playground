import { readStream } from "./fetcher";
import { get } from "./gen/clients/streamOrJSONAPI";

const main = async () => {
  const isStream = process.argv.includes("--stream");
  const res = await get({
    headers: isStream ? { accept: "application/x-ndjson" } : undefined,
  });

  if ("stream" in res) {
    // ストリームレスポンスの場合
    await readStream({
      response: res.stream,
      processChunk: (
        /**
         * const value: {
         *   id: number;
         *   value: string;
         * }
         *
         * (parameter) value: Get200Two
         */
        value,
      ) => {
        console.log("Received chunk:", value);
        return true; // 続行する場合はtrueを返す
      },
    });
  }

  if ("data" in res) {
    // 通常のJSONレスポンスの場合
    console.log(
      "Received JSON data:",
      /**
       * type items = {
       *   id: number;
       *   value: string;
       * }[]
       *
       * (property) items: Get200OneItemsItem[]
       */
      res.data.items,
    );
  }
};

main();
