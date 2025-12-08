import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import { AuroraHero } from "@/modules/home/ui/components/aurora-hero";

const Page = () => {
  return (
    <AuroraHero>
      <ProjectForm />
      <ProjectsList />
    </AuroraHero>
  );
};

export default Page;
