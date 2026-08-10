import LegalPage, { Section } from "../components/LegalPage.jsx";

export default function Privacy() {
  return (
    <LegalPage eyebrow="privacy" title="Privacy Policy" updated="31 May 2026">
      <p>
        ClimaSchool AI is operated by Eco-lution Consults, Ghana. This policy explains what
        information we handle and why. Data minimisation is a core commitment: we collect
        only the data essential for risk assessment, we hold no biometric or personally
        identifiable child data, and risk assessments are made at school and community
        level — never by profiling an individual child.
      </p>

      <Section heading="Information we handle">
        <p>
          To operate the advisory service we may process: school and district registration
          details; parent or guardian contact numbers (for SMS/WhatsApp delivery); preferred
          language; and de-identified, aggregated climate and health indicators. We do not
          sell personal data.
        </p>
      </Section>

      <Section heading="How we use it">
        <p>
          Contact details are used solely to deliver advisories and operational alerts.
          Aggregated, de-identified indicators are used to classify seasonal risk and improve
          the advisory engine. We do not use personal data for advertising.
        </p>
      </Section>

      <Section heading="Children's data">
        <p>
          Advisories concern children's health but are addressed to adults — head teachers,
          guardians and community health workers. We do not knowingly collect personal data
          directly from children.
        </p>
      </Section>

      <Section heading="Sharing">
        <p>
          We share data only with delivery partners (e.g. SMS gateways) and authorised public
          health bodies acting on a lawful basis, and only to the extent required to deliver
          the service. Partners are bound by confidentiality obligations.
        </p>
      </Section>

      <Section heading="Your choices">
        <p>
          Recipients can opt out of messages at any time by replying STOP, or by contacting us.
          You may request access to, correction of, or deletion of your personal data.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions or requests:{" "}
          <a className="border-b-2 border-dashed border-heat text-heat" href="mailto:ecolutionghana@gmail.com">
            ecolutionghana@gmail.com
          </a>.
        </p>
      </Section>
    </LegalPage>
  );
}
