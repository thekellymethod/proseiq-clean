// Comprehensive legal reference: claims, terms, mistakes, things to avoid

export type TermEntry = {
  def: string;
  example?: string;
  mistake?: string;
  misperception?: string;
};

export type ClaimCategory = {
  category: string;
  claims: string[];
};

export type AvoidEntry = {
  caseType: string;
  avoid: string[];
};

export const LEGAL_TERMS: Record<string, TermEntry> = {
  tort: {
    def: "A civil wrong that causes harm or loss, for which the court may award damages. Excludes breach of contract.",
    example: "Negligence, defamation, assault, battery",
    mistake: "Confusing tort with criminal 'crime' — torts are civil, not criminal.",
    misperception: "Thinking all injuries are torts. Contract breaches are not torts.",
  },
  negligence: {
    def: "Failure to exercise the care a reasonable person would under the circumstances, resulting in foreseeable harm.",
    example: "Car accident, slip and fall, medical malpractice",
    mistake: "Claiming negligence without proving duty, breach, causation, and damages.",
    misperception: "Assuming an accident automatically means someone was negligent.",
  },
  "strict-liability": {
    def: "Legal responsibility for harm regardless of fault or intent. Applies to defective products, ultrahazardous activities.",
    example: "Defective product causing injury",
    misperception: "Thinking strict liability means you never need to prove anything.",
  },
  "breach-of-contract": {
    def: "Failure to perform a material term of a contract without legal excuse.",
    example: "Non-payment, late delivery, failure to deliver",
    mistake: "Claiming breach when the other party had a valid excuse (force majeure, impracticability).",
    misperception: "Believing any promise is legally enforceable; many verbal agreements are unenforceable.",
  },
  "statute-of-limitations": {
    def: "The time limit within which a lawsuit must be filed. Varies by claim type and jurisdiction.",
    example: "2 years for personal injury in Texas; 4 years for breach of contract",
    mistake: "Waiting too long to file — once expired, the claim is barred forever.",
    misperception: "Thinking the clock starts when you discover the harm; it often starts when the harm occurred.",
  },
  estoppel: {
    def: "A bar preventing a party from asserting a fact or claim that contradicts their prior words or conduct.",
    example: "Promissory estoppel, equitable estoppel, collateral estoppel",
    mistake: "Assuming estoppel applies whenever someone 'changed their story.'",
    misperception: "Thinking estoppel is easy to prove — it requires reasonable reliance and detriment.",
  },
  "res-judicata": {
    def: "A matter already judged; a claim or defense that was or could have been raised in a prior case cannot be relitigated.",
    example: "Losing a case, then filing again on the same facts",
    misperception: "Thinking you can refile after losing if you have 'new evidence.'",
  },
  "failure-to-mitigate": {
    def: "A plaintiff's duty to minimize their damages. Failure can reduce or bar recovery.",
    example: "Refusing medical treatment, not seeking alternative housing after eviction",
    mistake: "Ignoring opportunities to reduce harm and then claiming full damages.",
  },
  "comparative-negligence": {
    def: "Damages are reduced by the plaintiff's percentage of fault. In pure comparative jurisdictions, even 99% at fault can recover 1%.",
    example: "Plaintiff 30% at fault in car accident — recovers 70% of damages",
    misperception: "Thinking any fault bars recovery; most states allow partial recovery.",
  },
  "assumption-of-risk": {
    def: "Voluntarily encountering a known danger. Can bar or reduce recovery.",
    example: "Participating in a contact sport, signing a waiver",
    mistake: "Assuming all waivers are unenforceable; many are valid.",
  },
  "punitive-damages": {
    def: "Damages awarded to punish egregious conduct, beyond compensating the plaintiff.",
    example: "Malice, fraud, willful misconduct",
    mistake: "Expecting punitive damages in routine negligence cases.",
    misperception: "Thinking punitive damages are common; they are rare and often capped.",
  },
  "economic-damages": {
    def: "Quantifiable financial losses: medical bills, lost wages, property damage.",
    example: "Hospital bill, repair costs",
    misperception: "Believing you need receipts for everything; some damages can be estimated.",
  },
  "noneconomic-damages": {
    def: "Non-financial harm: pain and suffering, emotional distress, loss of consortium.",
    example: "Chronic pain, anxiety, loss of companionship",
    misperception: "Thinking these are automatically huge amounts; they vary widely.",
  },
  larceny: {
    def: "The unlawful taking and carrying away of another's property with intent to permanently deprive.",
    example: "Theft, shoplifting",
    misperception: "Confusing larceny with embezzlement (taking property you were entrusted with).",
  },
  embezzlement: {
    def: "Theft of property by someone who was entrusted with it (e.g., employee, fiduciary).",
    example: "Bookkeeper taking company funds",
  },
  conversion: {
    def: "Civil wrong of wrongfully taking or retaining another's property, interfering with their ownership.",
    example: "Selling someone else's car, refusing to return borrowed items",
    mistake: "Claiming conversion when you voluntarily gave the property.",
  },
  trespass: {
    def: "Unauthorized entry onto another's real property, or interference with personal property.",
    example: "Entering land without permission, touching someone's car",
    misperception: "Thinking trespass requires 'No Trespassing' signs.",
  },
  nuisance: {
    def: "Unreasonable interference with use and enjoyment of property (private) or public right (public).",
    example: "Noise, odors, flooding from neighbor",
    mistake: "Claiming nuisance for normal neighborhood activity.",
  },
  defamation: {
    def: "False statement of fact that harms another's reputation. Libel = written; slander = spoken.",
    example: "False accusation of misconduct, false review",
    mistake: "Claiming defamation for opinions, true statements, or privileged communications.",
    misperception: "Thinking any negative statement is defamation; truth is a complete defense.",
  },
  "intentional-infliction-of-emotional-distress": {
    def: "Extreme and outrageous conduct that intentionally or recklessly causes severe emotional distress.",
    example: "IIED — very high bar; ordinary rudeness does not qualify",
    mistake: "Claiming IIED for workplace stress or criticism.",
    misperception: "Thinking IIED is easy to prove; courts require extreme conduct.",
  },
  "invasion-of-privacy": {
    def: "Intrusion into seclusion, public disclosure of private facts, false light, misappropriation of likeness.",
    example: "Unauthorized surveillance, posting private photos",
  },
  "wrongful-termination": {
    def: "Termination in violation of law (discrimination, retaliation) or public policy. Most employment is at-will.",
    example: "Fired for whistleblowing, for race/gender",
    mistake: "Claiming wrongful termination because you were fired unfairly — at-will employers can fire for any non-discriminatory reason.",
    misperception: "Thinking you need a contract to have protection; anti-discrimination laws apply to all.",
  },
  "at-will-employment": {
    def: "Either party may terminate the employment relationship at any time, for any reason or no reason (unless illegal).",
    example: "Default rule in most U.S. states",
    misperception: "Believing you cannot be fired without cause.",
  },
  "discrimination": {
    def: "Adverse treatment based on protected characteristic: race, gender, age, religion, disability, national origin.",
    example: "Refusing to hire, demoting, firing based on protected status",
    mistake: "Failing to document or report discrimination promptly.",
  },
  harassment: {
    def: "Unwanted conduct based on protected status that creates hostile environment or results in tangible employment action.",
    example: "Sexual harassment, racial slurs",
    mistake: "Claiming harassment for isolated incidents; usually requires severe or pervasive conduct.",
  },
  "reasonable-accommodation": {
    def: "Modification for disabled employee to perform essential job functions, unless undue hardship on employer.",
    example: "Modified schedule, ergonomic equipment",
    misperception: "Thinking accommodation means the employer must do anything you ask.",
  },
  "fdcpa": {
    def: "Fair Debt Collection Practices Act — federal law limiting how debt collectors can contact and treat consumers.",
    example: "No calling at unreasonable hours, no false threats",
    mistake: "Believing FDCPA applies to original creditors; it applies to third-party collectors.",
  },
  "fcra": {
    def: "Fair Credit Reporting Act — federal law governing credit reporting accuracy and consumer rights.",
    example: "Disputing inaccurate credit report items",
    mistake: "Not disputing in writing; verbal disputes may not trigger obligations.",
  },
  "tila": {
    def: "Truth in Lending Act — requires disclosure of loan terms, APR, finance charges.",
    example: "Right to rescind certain loans within 3 days",
  },
  "udap": {
    def: "Unfair and Deceptive Acts and Practices — state and federal consumer protection laws.",
    example: "Deceptive advertising, bait-and-switch",
  },
  "arbitration-clause": {
    def: "Contract term requiring disputes to be resolved in arbitration, not court. Often enforceable.",
    example: "Many credit card and employment agreements",
    mistake: "Filing in court when arbitration is required — case may be dismissed.",
    misperception: "Thinking arbitration clauses are always unenforceable; most are upheld.",
  },
  "force-majeure": {
    def: "Contract clause excusing performance when events beyond control (natural disaster, war) make performance impossible.",
    example: "COVID-19, hurricane",
    misperception: "Thinking force majeure automatically applies; contract must include it.",
  },
  "specific-performance": {
    def: "Court order requiring a party to perform the contract (e.g., convey property) rather than pay damages.",
    example: "Real estate, unique goods",
    misperception: "Thinking you can always get specific performance; courts prefer damages for most contracts.",
  },
  "liquidated-damages": {
    def: "Contract term setting damages in advance. Valid if reasonable estimate of actual damages; invalid if penalty.",
    example: "Late fee in lease",
    misperception: "Thinking all liquidated damages clauses are enforceable.",
  },
  "frustration-of-purpose": {
    def: "Doctrine excusing performance when an unforeseen event undermines the contract's main purpose.",
    example: "Event venue contract when event is banned",
  },
  "parol-evidence": {
    def: "Rule that written contract is the final expression of agreement; oral statements before signing usually inadmissible to contradict.",
    mistake: "Relying on verbal promises not in the written contract.",
  },
  "best-interest-of-the-child": {
    def: "Standard used in custody determinations — court decides based on child's welfare, not parents' preferences.",
    example: "Custody, visitation",
    misperception: "Thinking mothers automatically get custody; courts use gender-neutral standard.",
  },
  "equitable-distribution": {
    def: "Division of marital property in divorce — not necessarily 50/50; based on fairness factors.",
    example: "Community property vs. equitable distribution states",
  },
  "spousal-support": {
    def: "Alimony — payment from one spouse to another after divorce. Amount and duration vary.",
    misperception: "Thinking alimony is automatic or permanent.",
  },
  "constructive-eviction": {
    def: "Landlord's failure to provide habitable premises, making tenant's continued occupancy unreasonable.",
    example: "No heat, severe leaks",
  },
  "warranty-of-habitability": {
    def: "Implied warranty that rental is fit for human habitation. Landlord must maintain.",
    example: "Working plumbing, heat, no vermin",
  },
  "adverse-possession": {
    def: "Acquiring title to land by openly occupying it for a statutory period (often 10–20 years).",
    example: "Using neighbor's land as own for decades",
    misperception: "Thinking squatting for a short time gives title.",
  },
  "easement": {
    def: "Right to use another's land for a specific purpose (e.g., driveway, utility).",
    example: "Access easement, utility easement",
  },
  "lis-pendens": {
    def: "Notice of pending litigation affecting real property — clouds title until case resolved.",
  },
  "pro-se": {
    def: "Representing yourself without a lawyer.",
    mistake: "Filing pro se without understanding procedure, deadlines, or evidence rules.",
  },
  "discovery": {
    def: "Pre-trial process of exchanging information: interrogatories, depositions, requests for documents.",
    mistake: "Failing to respond to discovery — can result in sanctions or default.",
  },
  "summary-judgment": {
    def: "Judgment without trial when no material facts are in dispute and one party is entitled to judgment as a matter of law.",
    misperception: "Thinking summary judgment means you never get a trial; it happens in many cases.",
  },
  "burden-of-proof": {
    def: "Obligation to prove a fact. Plaintiff usually has burden; preponderance of evidence in civil cases.",
    example: "More likely than not (51%)",
  },
  "affirmative-defense": {
    def: "Defense that, if proven, defeats liability even if plaintiff's allegations are true (e.g., statute of limitations, contributory negligence).",
    example: "Defendant must plead and prove",
  },
};

export const CLAIMS_BY_CATEGORY: ClaimCategory[] = [
  {
    category: "Contract",
    claims: [
      "Breach of contract",
      "Breach of implied covenant of good faith and fair dealing",
      "Anticipatory breach / repudiation",
      "Fraud in the inducement",
      "Fraud in the execution",
      "Unjust enrichment",
      "Quantum meruit",
      "Promissory estoppel",
      "Novation",
      "Rescission",
      "Reformation",
      "Specific performance",
    ],
  },
  {
    category: "Tort — Negligence",
    claims: [
      "Negligence",
      "Gross negligence",
      "Negligent misrepresentation",
      "Negligent infliction of emotional distress",
      "Professional malpractice",
      "Medical malpractice",
      "Legal malpractice",
      "Product liability (negligence theory)",
    ],
  },
  {
    category: "Tort — Intentional",
    claims: [
      "Assault",
      "Battery",
      "False imprisonment",
      "Intentional infliction of emotional distress",
      "Trespass to land",
      "Trespass to chattels",
      "Conversion",
      "Fraud / deceit",
    ],
  },
  {
    category: "Tort — Property & Economic",
    claims: [
      "Trespass",
      "Private nuisance",
      "Public nuisance",
      "Waste",
      "Conversion",
      "Interference with contractual relations",
      "Interference with prospective advantage",
      "Civil theft",
    ],
  },
  {
    category: "Tort — Reputation & Privacy",
    claims: [
      "Defamation (libel)",
      "Defamation (slander)",
      "Defamation per se",
      "Invasion of privacy — intrusion",
      "Invasion of privacy — public disclosure",
      "Invasion of privacy — false light",
      "Invasion of privacy — misappropriation",
    ],
  },
  {
    category: "Employment",
    claims: [
      "Wrongful termination",
      "Discrimination (race, gender, age, religion, disability, national origin)",
      "Harassment",
      "Retaliation",
      "Failure to accommodate disability",
      "Breach of employment contract",
      "Violation of wage and hour laws",
      "FMLA violation",
      "Whistleblower retaliation",
      "Constructive discharge",
      "Defamation in employment context",
    ],
  },
  {
    category: "Consumer Protection",
    claims: [
      "FDCPA violation",
      "FCRA violation",
      "TDCPA violation (Texas)",
      "Unfair and deceptive acts and practices",
      "Bait and switch",
      "Fraud",
      "Breach of warranty",
      "Lemon law violation",
      "Debt collection harassment",
      "Inaccurate credit reporting",
    ],
  },
  {
    category: "Property & Real Estate",
    claims: [
      "Breach of lease",
      "Constructive eviction",
      "Failure to repair",
      "Wrongful retention of security deposit",
      "Trespass",
      "Easement dispute",
      "Boundary dispute",
      "Title defect",
      "Fraud in real estate transaction",
      "Failure to disclose",
    ],
  },
  {
    category: "Family Law",
    claims: [
      "Divorce",
      "Child custody modification",
      "Child support modification",
      "Spousal support",
      "Contempt for non-compliance",
      "Enforcement of decree",
      "Paternity",
    ],
  },
  {
    category: "Product Liability",
    claims: [
      "Strict liability",
      "Design defect",
      "Manufacturing defect",
      "Failure to warn",
      "Breach of warranty",
    ],
  },
  {
    category: "Government & Civil Rights",
    claims: [
      "Section 1983 (civil rights)",
      "False arrest",
      "Excessive force",
      "Malicious prosecution",
      "First Amendment violation",
      "Equal protection violation",
      "Due process violation",
    ],
  },
  {
    category: "Insurance",
    claims: [
      "Breach of insurance contract",
      "Bad faith",
      "Unfair claims practice",
      "Failure to defend",
      "Failure to settle",
    ],
  },
  {
    category: "Business & Commercial",
    claims: [
      "Shareholder oppression",
      "Breach of fiduciary duty",
      "Fraud",
      "Unfair competition",
      "Trade secret misappropriation",
      "Tortious interference",
    ],
  },
  {
    category: "Outliers & Less Common",
    claims: [
      "Alienation of affections",
      "Criminal conversation",
      "Loss of consortium",
      "Wrongful death",
      "Survival action",
      "Inverse condemnation",
      "Legal malpractice",
      "Accounting malpractice",
      "Architectural malpractice",
      "Vicarious liability",
      "Premises liability",
      "Dram shop liability",
      "Negligent entrustment",
      "Attractive nuisance",
      "Res ipsa loquitur",
    ],
  },
];

export const AVOID_BY_CASE_TYPE: AvoidEntry[] = [
  {
    caseType: "Breach of contract",
    avoid: [
      "Claiming breach when you also breached (clean hands)",
      "Threatening criminal charges to pressure settlement",
      "Saying 'we had a verbal agreement' when a written contract exists and contradicts it",
      "Ignoring arbitration or mediation clauses",
      "Claiming 'they promised' without written evidence when contract says otherwise",
    ],
  },
  {
    caseType: "Negligence / personal injury",
    avoid: [
      "Admitting any fault at the scene or in writing",
      "Posting about the incident on social media",
      "Exaggerating or fabricating injuries",
      "Failing to seek medical treatment and then claiming serious injury",
      "Saying 'I'm fine' at the scene and later claiming significant harm",
      "Discussing settlement with the other party without your attorney",
    ],
  },
  {
    caseType: "Employment",
    avoid: [
      "Bad-mouthing the employer publicly before filing",
      "Resigning without documenting harassment/discrimination first",
      "Failing to report through company channels before suing",
      "Claiming wrongful termination when you were at-will and had no protected characteristic",
      "Mixing personal grievances with illegal conduct",
    ],
  },
  {
    caseType: "Consumer / debt collection",
    avoid: [
      "Paying a debt you're disputing without 'under protest' notation",
      "Admitting the debt is valid when disputing",
      "Ignoring debt collector communications entirely — respond in writing",
      "Threatening to report to credit bureaus without following dispute process",
    ],
  },
  {
    caseType: "Family law",
    avoid: [
      "Badmouthing the other parent in front of the child",
      "Withholding visitation to pressure settlement",
      "Hiding assets during divorce",
      "Making custody threats as leverage",
      "Documenting only your perspective — courts want balanced views",
    ],
  },
  {
    caseType: "Property / landlord-tenant",
    avoid: [
      "Withholding rent without proper notice and procedure",
      "Making 'repairs' yourself and deducting without following statute",
      "Abandoning property without proper notice",
      "Refusing to allow landlord access when required by law",
    ],
  },
  {
    caseType: "Defamation",
    avoid: [
      "Repeating the defamatory statement yourself",
      "Suing for opinion—'In my opinion they are dishonest' is not defamation",
      "Failing to retract or mitigate when given opportunity",
      "Making your own defamatory statements in response",
    ],
  },
  {
    caseType: "General",
    avoid: [
      "Discussing your case on social media",
      "Destroying or altering evidence",
      "Lying in discovery or under oath",
      "Missing court deadlines",
      "Assuming the other side will 'never find out' about something",
    ],
  },
];

export const COMMON_MISTAKES: Array<{ topic: string; mistake: string; correction: string }> = [
  { topic: "Statute of limitations", mistake: "Assuming you have years to file.", correction: "Many claims expire in 1–2 years. Consult an attorney immediately." },
  { topic: "Evidence", mistake: "Discarding texts, emails, or documents.", correction: "Preserve everything. Create backups. Do not delete." },
  { topic: "Admissions", mistake: "Saying 'sorry' or 'my fault' at an accident scene.", correction: "Even apologies can be used against you. Stick to facts, get medical help." },
  { topic: "Settlement", mistake: "Accepting a quick settlement before knowing full extent of injuries.", correction: "Wait until you reach maximum medical improvement." },
  { topic: "Contract", mistake: "Signing without reading, or relying on verbal promises.", correction: "Get it in writing. Parol evidence rule bars many verbal additions." },
  { topic: "Employment", mistake: "Quitting before documenting and reporting.", correction: "Constructive discharge requires you tried to address the problem." },
  { topic: "Small claims", mistake: "Thinking small claims court is simple.", correction: "You still need evidence, proper service, and to follow procedure." },
  { topic: "Pro se", mistake: "Representing yourself on complex matters.", correction: "Many cases require expert testimony, discovery, and legal strategy." },
];
