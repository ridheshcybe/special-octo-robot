import PrepMeUpLandingPage from "../../prepmeup/(marketing)/page";
import TermsPage from "../../prepmeup/(legal)/terms/page";
import PrivacyPage from "../../prepmeup/(legal)/privacy/page";
import RefundsPage from "../../prepmeup/(legal)/refunds/page";
import PricingPolicyPage from "../../prepmeup/(legal)/pricing-policy/page";
import ContactPage from "../../prepmeup/(legal)/contact/page";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function CoursesCatchAllDirectPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const joined = slug.join("/");

  if (joined === "terms") return <TermsPage />;
  if (joined === "privacy") return <PrivacyPage />;
  if (joined === "refunds") return <RefundsPage />;
  if (joined === "pricing-policy") return <PricingPolicyPage />;
  if (joined === "contact") return <ContactPage />;

  return <PrepMeUpLandingPage />;
}
