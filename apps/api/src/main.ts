import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

export function getRuntimeIdentity(): { name: "SDLCraft API" } {
  return { name: "SDLCraft API" };
}

@Module({})
class AppModule {}

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const port = Number(process.env.API_PORT ?? 3000);
  const host = process.env.API_HOST ?? "0.0.0.0";
  await app.listen(port, host);
}

if (import.meta.main) {
  await bootstrap();
}
