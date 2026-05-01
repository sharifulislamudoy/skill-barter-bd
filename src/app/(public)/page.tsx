import Hero from "@/components/hero";
import SkillsSection from "@/components/skills-section";
import UsersSection from "@/components/users-section";

export default function HomePage() {
    return (
        <div>
            <Hero />
            <SkillsSection />
            <UsersSection />            
        </div>
    );
}