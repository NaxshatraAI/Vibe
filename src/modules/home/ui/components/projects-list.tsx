"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpic/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";

export const ProjectsList = () => {
  const trpc = useTRPC();
  const { user } = useUser();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

  if (!user) return null;

  return (
    <div
      className="
        w-full rounded-2xl p-8
        bg-black/70 backdrop-blur-2xl
        border border-white/15
        shadow-[0_0_20px_rgba(0,255,255,0.25),0_0_30px_rgba(168,85,247,0.25)]
        flex flex-col gap-y-8
      "
    >
      {/* ✅ HEADER */}
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
        {user?.firstName}&apos;s Vibes
      </h2>

      {/* ✅ GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {projects?.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-sm text-white/50">No projects found</p>
          </div>
        )}

        {projects?.map((project) => (
          <Button
            key={project.id}
            variant="outline"
            className="
              font-normal h-auto justify-start w-full text-start p-5
              bg-black/50 border-white/10
              hover:bg-black/80 hover:border-teal-400/40
              transition-all duration-300
            "
            asChild
          >
            <Link
              href={`/projects/${project.id}`}
              className="flex flex-col w-full"
            >
              <div className="flex items-center gap-x-4">
                <Image
                  src="/favicon.png"
                  alt="Vibe"
                  width={36}
                  height={36}
                  className="object-contain drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]"
                />
                <div className="flex flex-col overflow-hidden">
                  <h3 className="truncate font-medium text-white">
                    {project.name}
                  </h3>
                  <p className="text-sm text-white/50">
                    {formatDistanceToNow(project.updatedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};
