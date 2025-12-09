import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpic/init";
import { z } from "zod";
import { generateSlug } from "random-word-slugs"
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({
      id: z.string().min(1, { message: "ID is required" }),
    }))
  .query(async ({ input, ctx }) => {
    const existingProject = await prisma.project.findUnique({
      where: {
        id: input.id,
        userId: ctx.auth.userId,
      }
    });

    if (!existingProject) {
      throw new TRPCError({code: "NOT_FOUND", message: "Project not found"});
    }

    return existingProject;
  }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: ctx.auth.userId },
      update: {},
      create: { id: ctx.auth.userId },
    });

    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return projects;
  }),
  create: protectedProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Value is required" }). max(10000, { message: "Value is long" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Ensure user exists in database before creating project
      await prisma.user.upsert({
        where: { id: ctx.auth.userId },
        update: {},
        create: { id: ctx.auth.userId },
      });

      const createProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: generateSlug(2, {
            format: "kebab"
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            }
          }
        }
      })

      return createProject;
    }),
  
  // Secure download procedure - only allows users to download their own projects
  getProjectForDownload: protectedProcedure
    .input(z.object({
      projectId: z.string().min(1, { message: "Project ID is required" }),
      fragmentId: z.string().min(1, { message: "Fragment ID is required" }),
    }))
    .query(async ({ input, ctx }) => {
      // First verify the project belongs to the user
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId, // This ensures only the owner can access
        },
      });

      if (!project) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Project not found or you don't have permission to download it" 
        });
      }

      // Get the specific fragment with files
      const fragment = await prisma.fragment.findUnique({
        where: {
          id: input.fragmentId,
        },
        include: {
          message: {
            include: {
              project: true,
            },
          },
        },
      });

      if (!fragment || fragment.message.project.userId !== ctx.auth.userId) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Fragment not found or you don't have permission to download it" 
        });
      }

      return {
        project: project,
        fragment: fragment,
      };
    }),
});
