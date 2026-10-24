import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import "@/features/modules/modules.css";

export const metadata: Metadata = { title: "Terms notice" };

export default function TermsPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="legal-page">
        <p className="eyebrow">Using the foundation</p>
        <h1>A shared understanding.</h1>
        <p className="legal-intro">Aster is an independent IELTS Academic preparation project currently at the foundation stage.</p>
        <div className="legal-status"><strong>Foundation notice · terms draft.</strong> Operator details, jurisdiction, support arrangements, and final terms must be reviewed and completed before public enrollment. This page does not represent finalized service terms.</div>
        <section>
          <h2>What this release provides</h2>
          <p>Phase 1 provides an application foundation and previews of planned learning areas. Practice engines, question banks, mock exams, AI models, and evaluated scores are not available. Preview screens are labeled and do not represent completed lessons or real student results.</p>
        </section>
        <section>
          <h2>Independent IELTS preparation</h2>
          <p>This project is not an official IELTS examination service and does not imply affiliation with the owners of IELTS. IELTS remains a trademark of its respective owners. Aster is temporary project branding.</p>
          <p>Future practice scores and AI feedback will be estimates for learning. They will not certify proficiency, replace an official test, or guarantee a particular result.</p>
        </section>
        <section>
          <h2>Private access</h2>
          <p>Connected use is intended for the authorized private release. Account creation or Google authentication alone does not provide permission to enter the private workspace. Keep your sign-in credentials private and use the account intended for you.</p>
        </section>
        <section>
          <h2>Content and responsible use</h2>
          <p>Only original or appropriately licensed learning materials should be published. Future uploads must respect the rights and privacy of others. Attempts to bypass access controls, disclose private work, or interfere with the service are outside the intended use of the platform.</p>
          <p>There is no content-upload feature in this foundation release.</p>
        </section>
        <section>
          <h2>Availability and future features</h2>
          <p>The private release has no payment or subscription functionality. Later features depend on approved content, configured services, available resources, and testing. Roadmap descriptions are plans, not promises of availability or measured performance.</p>
          <p>AI processing is intended to run through a separate local worker in a later phase. Continuous model availability and real-time voice capability have not been established.</p>
        </section>
        <section>
          <h2>Information and contact</h2>
          <p>The <Link href="/privacy">privacy notice</Link> explains current data boundaries and unresolved operational details. For access questions during the private release, contact the person who supplied your invitation. Public support contact details have not yet been supplied.</p>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
