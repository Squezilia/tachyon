import * as Prisma from "./generated/prisma/client.js";
import * as PrismaBox from "./generated/prismabox/barrel.js";

// Re-export Prismabox schemas as named exports (unchanged)
export * from "./generated/prismabox/barrel.js";

// Re-export Prisma model types under a namespace to avoid collisions
export * as PrismaModels from "./generated/prisma/models.js";

// Re-export Prisma runtime types
export * from "@prisma/client/runtime/library.js";

export { Prisma, PrismaBox };
export default {
	Prisma,
	PrismaBox,
};
