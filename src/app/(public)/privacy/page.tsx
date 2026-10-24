import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import "@/features/modules/modules.css";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="legal-page">
        <p className="eyebrow">Your information</p>
        <h1>Privacy starts with clarity.</h1>
        <p className="legal-intro">This notice explains the foundation’s intended data boundaries and the difference between demonstration and connected use.</p>
        <div className="legal-status"><strong>Foundation notice · policy draft.</strong> The operator’s identity, contact details, hosting region, retention periods, and request process must be finalized before an operational public release. This is not a finalized public privacy policy.</div>
        <section>
          <h2>Demonstration mode</h2>
          <p>The demonstration contains no supplied learner records, practice attempts, or scores. Theme preferences and profile preferences you explicitly save in the demonstration may be kept in this browser. They do not create a Supabase account or a real study record.</p>
          <p>Use the browser’s site-data controls to remove locally saved preferences. Do not enter sensitive personal information into a demonstration profile.</p>
        </section>
        <section>
          <h2>Connected accounts and profiles</h2>
          <p>When the owner configures connected mode, Supabase provides authentication and stores the profile fields you choose to save, such as display name, study goal, exam date, and target band. Google authentication is optional and requires a separately configured Google sign-in provider.</p>
          <p>Private enrollment limits access to authorized accounts. Profile access is controlled by ownership policies. Administrative access requires additional authorization and multi-factor authentication.</p>
        </section>
        <section>
          <h2>Essays, recordings, and AI</h2>
          <p>This foundation does not collect practice essays, handwriting uploads, or speaking recordings, and does not send work to an AI model. Those features are not available yet.</p>
          <p>The specification requires private storage and separate, explicit consent before any future reuse of a learner’s work for training. Training-data reuse is not enabled in this release.</p>
        </section>
        <section>
          <h2>Essential storage and security records</h2>
          <p>Connected sign-in uses authentication cookies to maintain a session. Browser storage can hold interface preferences. The foundation also prepares security-event records for account and administrative activity; these are separate from study results.</p>
          <p>The hosting and authentication providers may process technical request information when a connected site is deployed. The operator must document the selected providers and their applicable settings before public use.</p>
        </section>
        <section>
          <h2>Retention, export, and deletion</h2>
          <p>Operational retention periods, backup expiry, and a verified contact route are not yet defined. Automated account export and deletion are planned beyond this foundation. The operator must establish a request process and publish these details before collecting information from public users.</p>
          <p>For the current private release, contact the person who provided access regarding account information. A public support address has not been supplied.</p>
        </section>
        <section>
          <h2>Questions about this release</h2>
          <p>Read the <Link href="/faq">frequently asked questions</Link> for the current feature boundaries, or the <Link href="/terms">foundation terms notice</Link> for the intended use of this project.</p>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
