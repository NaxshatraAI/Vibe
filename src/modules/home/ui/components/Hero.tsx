import styles from "./HeroSection.module.css";
import { ProjectForm } from "./project-form";

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay}>
                <div className={styles.centerText}>
                    <h1 className={styles.heroTitle}>
                        A PORTAL TO EVERYTHING YOU WANT TO BUILD.
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Build production-ready websites
                    </p>

                    <div className={styles.promptWrapper}>
                        <ProjectForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
