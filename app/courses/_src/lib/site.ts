/**
 * Site-wide facts used by the legal/policy pages and footer.
 * Everything in [BRACKETS] is a placeholder you must fill in before launch.
 */
export const SITE_NAME = "College Courses";

/** Your legal name as an individual (sole proprietor, not a company). */
export const OWNER_NAME = "[YOUR FULL LEGAL NAME]";

/** The one contact address for everything: support, refunds, grievances. */
export const CONTACT_EMAIL = "[YOUR EMAIL]";

/** City/state whose courts handle disputes — keep same as owner's city. */
export const JURISDICTION = "[YOUR CITY], India";

/** Show a real date so users can see when the policies last changed. */
export const POLICY_LAST_UPDATED = "[DATE, e.g. 1 October 2026]";

/** Promise you can keep: how fast you answer emails. */
export const RESPONSE_TIME = "within 48 hours";

export const PLANS_SUMMARY = [
  { name: "30-day pass", price: "₹99", days: 30 },
  { name: "90-day pass", price: "₹199", days: 90 },
] as const;

/** Refund rule shown to users — keep in sync with what you actually honour. */
export const REFUND_WINDOW_HOURS = 48;
export const REFUND_MAX_LESSONS_OPENED = 2;
