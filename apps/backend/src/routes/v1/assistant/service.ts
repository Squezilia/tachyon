import google from '@backend/lib/ai';
import { InterceptPrismaError } from '@backend/lib/error';
import prisma from '@database';
import { generateText, Output } from 'ai';
import z from 'zod';

export async function generateTitle(id: string, prompt: string) {
  const res = await generateText({
    model: google('gemma-4-e2b-it'),
    system:
      "Your role is; Create a concise conversation title based on the user's prompt. Use the same language as the input and limit the title to a maximum of 10-12 words.",
    output: Output.object({
      schema: z.object({
        title: z.string(),
      }),
    }),
    prompt,
  });

  return await prisma.chat
    .update({
      where: {
        id,
      },
      data: {
        name: res.output.title,
      },
    })
    .catch(InterceptPrismaError);
}
