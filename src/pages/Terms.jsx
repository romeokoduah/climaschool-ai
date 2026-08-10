import LegalPage, { Section } from "../components/LegalPage.jsx";

export default function Terms() {
  return (
    <LegalPage eyebrow="terms" title="Terms of Use" updated="31 May 2026">
      <p>
        By using the ClimaSchool AI website and services you agree to these terms. ClimaSchool AI
        is operated by Eco-lution Consults, Ghana.
      </p>

      <Section heading="Health information — not a substitute for care">
        <p>
          Advisories, foods, hydration guidance and risk scores are general, seasonal guidance to
          support decision-making. They are <strong>not medical advice</strong> and do not replace
          diagnosis or treatment by a qualified health professional. In an emergency, seek care
          immediately at the nearest health facility.
        </p>
      </Section>

      <Section heading="Demonstration data">
        <p>
          Figures shown in the interactive demo and on the homepage (alert counts, message volumes,
          pilot reach and the Engine Room outputs) are <strong>illustrative</strong> and intended to
          demonstrate platform behaviour. They do not represent live operational data unless
          explicitly stated.
        </p>
      </Section>

      <Section heading="Acceptable use">
        <p>
          You agree not to misuse the service, attempt to disrupt it, or use it to distribute
          unlawful, harmful or misleading content.
        </p>
      </Section>

      <Section heading="Intellectual property &amp; licensing">
        <p>
          The software is released under the MIT licence. Advisory content is shared under
          Creative Commons Attribution 4.0 (CC-BY 4.0). Third-party imagery and fonts remain the
          property of their respective owners.
        </p>
      </Section>

      <Section heading="Limitation of liability">
        <p>
          The service is provided "as is", without warranties of any kind. To the fullest extent
          permitted by law, Eco-lution Consults is not liable for any loss arising from reliance
          on the service. Risk scores, demand forecasts and advisories are decision-support
          estimates, not clinical guarantees — human professional judgement governs all
          clinical and safeguarding decisions.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these terms:{" "}
          <a className="border-b-2 border-dashed border-heat text-heat" href="mailto:info@uniyia.org">
            info@uniyia.org
          </a>.
        </p>
      </Section>
    </LegalPage>
  );
}
