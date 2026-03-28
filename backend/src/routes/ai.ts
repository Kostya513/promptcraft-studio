import { Router, Request, Response } from "express";
import fetch from "node-fetch";

const router = Router();

const YANDEX_GPT_API_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

router.post("/generate", async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, iamToken, folderId, model = "yandexgpt-lite", temperature = 0.7, maxTokens = 2000 } = req.body;

    if (!prompt || !iamToken || !folderId) {
      res.status(400).json({ error: "prompt, iamToken и folderId обязательны" });
      return;
    }

    const response = await fetch(YANDEX_GPT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${iamToken}`,
        "x-folder-id": folderId,
      },
      body: JSON.stringify({
        modelUri: `gpt://${folderId}/${model}`,
        completionOptions: {
          stream: false,
          temperature,
          maxTokens,
        },
        messages: [
          {
            role: "system",
            text: "Ты профессиональный помощник для создания промтов. Отвечай кратко и по делу.",
          },
          {
            role: "user",
            text: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      res.status(response.status).json({ error: `YandexGPT API error: ${error}` });
      return;
    }

    const data = await response.json();

    res.json({
      text: data.result?.alternatives?.[0]?.message?.text || "",
      usage: {
        inputTokens: data.usage?.inputTokens || 0,
        outputTokens: data.usage?.outputTokens || 0,
      },
    });
  } catch (error: any) {
    console.error("AI generate error:", error.message);
    res.status(500).json({ error: "Ошибка генерации", details: error.message });
  }
});

router.post("/improve", async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalPrompt, iamToken, folderId } = req.body;

    if (!originalPrompt || !iamToken || !folderId) {
      res.status(400).json({ error: "originalPrompt, iamToken и folderId обязательны" });
      return;
    }

    const systemPrompt = `Улучши этот промт: "${originalPrompt}"`;

    const response = await fetch(YANDEX_GPT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${iamToken}`,
        "x-folder-id": folderId,
      },
      body: JSON.stringify({
        modelUri: `gpt://${folderId}/yandexgpt-lite`,
        completionOptions: {
          stream: false,
          temperature: 0.7,
          maxTokens: 2000,
        },
        messages: [
          { role: "system", text: "Ты эксперт по улучшению промтов." },
          { role: "user", text: systemPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      res.status(response.status).json({ error: `YandexGPT API error: ${error}` });
      return;
    }

    const data = await response.json();

    res.json({
      text: data.result?.alternatives?.[0]?.message?.text || "",
      usage: {
        inputTokens: data.usage?.inputTokens || 0,
        outputTokens: data.usage?.outputTokens || 0,
      },
    });
  } catch (error: any) {
    console.error("AI improve error:", error.message);
    res.status(500).json({ error: "Ошибка улучшения промта", details: error.message });
  }
});

router.get("/test", (_req: Request, res: Response): void => {
  res.json({ status: "ok", message: "AI endpoint готов к работе" });
});

export default router;