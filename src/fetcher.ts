type TypedResponse<T> = {
  json(): Promise<T>;
} & Response;

type WithStream<T> = T extends { stream: TypedResponse<unknown> } ? T : never;

type WithData<T> = T extends { data: unknown } ? T : never;

export const fetcher = async <
  T extends
    | { status: number; headers: Headers; data: unknown }
    | { status: number; headers: Headers; stream: TypedResponse<unknown> },
>(
  // ...argsのように書くとTanstack Query系の生成時にOrvalの生成が壊れる
  url: Parameters<typeof fetch>[0],
  options?: Parameters<typeof fetch>[1],
): Promise<WithData<T> | WithStream<T>> => {
  const res = await fetch(url, options);

  // ストリームレスポンスの専用処理
  if (res.headers.get("content-type") === "application/x-ndjson") {
    return {
      stream: res,
      status: res.status,
      headers: res.headers,
    } as WithStream<T>;
  }

  // 以後Orvalのデフォルト
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();

  const data = body ? JSON.parse(body) : {};

  return {
    data,
    status: res.status,
    headers: res.headers,
  } as WithData<T>;
};

/**
 * 参考: [Stream NDJSON | orval](https://orval.dev/guides/stream-ndjson)
 */
export const readStream = async <T extends object, HandlerErrorResult>({
  response,
  processChunk,
  onError,
}: {
  response: TypedResponse<T>;
  processChunk: (value: T) => undefined | boolean;
  onError?: (response?: Response) => HandlerErrorResult;
}): Promise<undefined | HandlerErrorResult> => {
  if (!response.ok && onError) {
    return Promise.resolve(onError(response));
  }

  if (!response.body) throw new Error("Response body is null");

  const reader = response.body.getReader();
  const matcher = /\n/;
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const loop: () => Promise<undefined> = async () => {
    const { done, value } = await reader.read();

    if (done) {
      if (buffer.length > 0) processChunk(JSON.parse(buffer) as T);

      return undefined;
    }

    const chunk = decoder.decode(value, { stream: true });

    buffer += chunk;

    const parts = buffer.split(matcher);

    buffer = parts.pop() ?? "";

    const validParts = parts.filter((p) => p);

    if (validParts.length !== 0) {
      for (const i of validParts) {
        const p = JSON.parse(i) as T;

        processChunk(p);
      }
    }

    return await loop();
  };

  try {
    return await loop();
  } finally {
    reader.releaseLock();
  }
};
