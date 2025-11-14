export function generateAdvice(question, userProfile, history = []) {
  const q = String(question || "").toLowerCase().trim();
  const sources = [];
  const add = (title, url) => sources.push({ title, url });

  // Canonical links (reputable)
  const links = {
    irs_tax: { title: "IRS · Tax Information", url: "https://www.irs.gov" },
    irs_withholding: { title: "IRS · Withholding Estimator", url: "https://www.irs.gov/individuals/tax-withholding-estimator" },
    cfpb_budget: { title: "CFPB · Budgeting and saving", url: "https://www.consumerfinance.gov/consumer-tools/budgeting/" },
    cfpb_50_30_20: { title: "CFPB · 50/30/20 rule", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-the-50-30-20-rule-en-2107/" },
    investor_basics: { title: "Investor.gov · Investing Basics", url: "https://www.investor.gov/introduction-investing/investing-basics" },
    investor_fees: { title: "Investor.gov · Fees and expenses", url: "https://www.investor.gov/introduction-investing/investing-basics/what-are-my-investment-options/fees-expenses" },
    investopedia_emergency: { title: "Investopedia · Emergency Fund", url: "https://www.investopedia.com/terms/e/emergency_fund.asp" },
    usa_gov_credit: { title: "USA.gov · Credit reports & scores", url: "https://www.usa.gov/credit-reports" },
    investor_etf: { title: "Investor.gov · ETFs", url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/exchange-traded-funds-etfs" },
    investor_mutual: { title: "Investor.gov · Mutual Funds", url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds" },
    irs_401k: { title: "IRS · 401(k) resource", url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits" },
    healthcare_hsa: { title: "HealthCare.gov · HSA overview", url: "https://www.healthcare.gov/glossary/health-savings-account-HSA/" },
    studentaid: { title: "StudentAid.gov · Repayment options", url: "https://studentaid.gov/manage-loans/repayment/plans" },
    usa_gov_mortgage: { title: "USA.gov · Mortgages", url: "https://www.usa.gov/mortgages" },
    irs_roth: { title: "IRS · Roth IRA", url: "https://www.irs.gov/retirement-plans/roth-iras" },
    sec_529: { title: "SEC · 529 Plans", url: "https://www.investor.gov/introduction-investing/investing-basics/education-savings/529-plans" },
    fdic: { title: "FDIC · Deposit Insurance", url: "https://www.fdic.gov/resources/deposit-insurance/" },
    finra_apr_apy: { title: "FINRA · APR vs. APY", url: "https://www.finra.org/investors/learn-to-invest/key-investing-concepts/apr-apy" },
    investor_compound: { title: "Investor.gov · Compound Interest", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" },
    cfpb_dti: { title: "CFPB · Debt‑to‑income ratio", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-en-1791/" },
    cfpb_credit_score: { title: "CFPB · Credit scores", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-credit-score-en-315/" },
    cfpb_fsa: { title: "Healthcare.gov · FSA overview", url: "https://www.healthcare.gov/have-job-based-coverage/flexible-spending-accounts/" },
    investor_cd: { title: "Investor.gov · Certificates of Deposit", url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/certificates-deposit-cds" },
    naic_consumer: { title: "NAIC · Insurance consumer resources", url: "https://content.naic.org/consumer.htm" },
    usa_insurance: { title: "USA.gov · Insurance", url: "https://www.usa.gov/insurance" },
    studentaid_save: { title: "StudentAid.gov · SAVE Plan", url: "https://studentaid.gov/announcements-events/save-plan" },
    treasurydirect_ibond: { title: "TreasuryDirect · Series I Bonds", url: "https://www.treasurydirect.gov/savings-bonds/i-bonds/" },
    fta_state_tax: { title: "State Tax Agencies (FTA directory)", url: "https://www.taxadmin.org/state-tax-agencies" },
  };

  const profileNote = userProfile
    ? `\nYour profile: balance $${(userProfile.currentBalance ?? 0).toLocaleString()}, income $${(userProfile.annualIncome ?? 0).toLocaleString()}.`
    : "";

  const emergencyMonths = 3; // conservative lower bound for demo
  const monthlyIncome = userProfile?.annualIncome ? userProfile.annualIncome / 12 : 0;
  const emergencyTarget = monthlyIncome * emergencyMonths;

  const topics = [
    {
      id: "taxes",
      triggers: /(tax|irs|withhold|refund|w-4|deduct|credit|filing)/,
      reply: () => {
        add(links.irs_tax.title, links.irs_tax.url);
        add(links.irs_withholding.title, links.irs_withholding.url);
        return (
          "For taxes, start with the basics and build good habits:\n\n" +
          "• Withholding: Use the IRS estimator to dial in W‑4 so you avoid big refunds or balances due. Review after major life changes (raise, marriage, side‑income).\n" +
          "• Filing status & credits: Your status (single/married/head of household) drives brackets and credits. Know eligibility for EITC, education credits, child credit, and savers credit.\n" +
          "• Deductions: If you don’t itemize, make sure you capture above‑the‑line deductions you qualify for (HSA, IRA contributions, student‑loan interest where applicable).\n" +
          "• Documentation: Keep W‑2s, 1099s, receipts, donation letters, medical, and education forms organized all year to prevent last‑minute scrambling.\n" +
          "• Tools: File electronically with reputable software or use a qualified preparer when your situation gets complex (business, rental, multi‑state).\n" +
          profileNote
        );
      },
    },
    {
      id: "budget_saving",
      triggers: /(save|savings|budget|spend|50\/?30\/?20|emergency|emergency fund)/,
      reply: () => {
        add(links.cfpb_budget.title, links.cfpb_budget.url);
        add(links.cfpb_50_30_20.title, links.cfpb_50_30_20.url);
        add(links.investopedia_emergency.title, links.investopedia_emergency.url);
        const needs = 50, wants = 30, save = 20;
        const target = emergencyTarget > 0 ? ` Your 3‑month emergency target is about $${Math.round(emergencyTarget).toLocaleString()}.` : "";
        return (
          `A practical starting plan is the 50/30/20 method: about ${needs}% needs, ${wants}% wants, and ${save}% to savings/debt.\n\n` +
          "• Build your emergency fund first (3–6 months of essential expenses). Keep it in a high‑yield savings for safety and liquidity.\n" +
          "• Automate: schedule transfers on payday so saving happens before spending. Small, consistent transfers beat sporadic big ones.\n" +
          "• Track: review 2–3 big categories (housing, food, transportation) for quick wins; cancel unused subscriptions and renegotiate recurring bills.\n" +
          "• Adjust: if income varies, use a base budget for essentials and a percentage‑based plan for extras.\n" +
          target +
          profileNote
        );
      },
    },
    {
      id: "investing",
      triggers: /(invest|broker|portfolio|etf|index|stocks|bonds|diversif|rebalanc)/,
      reply: () => {
        add(links.investor_basics.title, links.investor_basics.url);
        add(links.investor_fees.title, links.investor_fees.url);
        add(links.investor_etf.title, links.investor_etf.url);
        add(links.investor_mutual.title, links.investor_mutual.url);
        return (
          "For long‑term growth, keep investing simple and repeatable:\n\n" +
          "• Use broad, low‑cost index funds/ETFs for diversification; avoid chasing hot picks.\n" +
          "• Match risk to time horizon: more stocks for long‑term goals, more bonds/cash for near‑term needs.\n" +
          "• Keep fees tiny (expense ratios matter); minimize trading and taxes.\n" +
          "• Contribute on a schedule (e.g., monthly dollar‑cost averaging) and rebalance once or twice a year.\n" +
          "• Prioritize tax‑advantaged accounts first (401(k)/IRA/HSA when eligible).\n" +
          profileNote
        );
      },
    },
    {
      id: "credit_debt",
      triggers: /(credit|loan|debt|score|report|utilization|collections)/,
      reply: () => {
        add(links.usa_gov_credit.title, links.usa_gov_credit.url);
        add(links.cfpb_budget.title, links.cfpb_budget.url);
        return (
          "Healthy credit and debt payoff come from a few high‑impact moves:\n\n" +
          "• Payment history matters most—pay on time, every time (use autopay/reminders).\n" +
          "• Keep utilization low (<30% of limits; <10% is even better). Request limit increases without increasing balances.\n" +
          "• For payoff, pick a method you’ll finish: Snowball (quick wins) or Avalanche (lowest interest cost).\n" +
          "• Pull your credit reports and dispute errors; avoid unnecessary hard inquiries.\n" +
          "• If overwhelmed, consider nonprofit credit counseling.\n" +
          profileNote
        );
      },
    },
    {
      id: "roth",
      triggers: /(roth ?ira|roth)/,
      reply: () => {
        add(links.irs_roth.title, links.irs_roth.url);
        return (
          "A Roth IRA uses after‑tax contributions and offers tax‑free qualified withdrawals in retirement:\n\n" +
          "• Good fit if you expect higher future tax rates or value tax‑free income later.\n" +
          "• Check current‑year income and contribution limits; consider backdoor Roth strategies only if you understand the tax rules.\n" +
          "• Invest inside the Roth with diversified, low‑cost index funds or target‑date funds; the Roth is the account, not the investment.\n"
        );
      },
    },
    {
      id: "401k",
      triggers: /(401k|401\(k\)|employer match|retirement plan)/,
      reply: () => {
        add(links.irs_401k.title, links.irs_401k.url);
        return (
          "A 401(k) is a powerful retirement tool sponsored by your employer:\n\n" +
          "• Contribute at least enough to capture the full employer match—this is a guaranteed return.\n" +
          "• Work toward 10–15% of income between you and your employer over time.\n" +
          "• Investment options: a target‑date fund for simplicity, or a mix of broad US/international stock and bond index funds.\n" +
          "• Revisit contributions after raises and review beneficiaries annually.\n"
        );
      },
    },
    {
      id: "hsa",
      triggers: /(hsa|health savings account)/,
      reply: () => {
        add(links.healthcare_hsa.title, links.healthcare_hsa.url);
        return (
          "An HSA (available with a qualifying high‑deductible health plan) offers rare triple tax benefits:\n\n" +
          "• Contributions reduce taxable income; growth is tax‑free; qualified medical withdrawals are tax‑free.\n" +
          "• Great for long‑term medical savings: invest HSA funds once your emergency fund is set.\n" +
          "• Keep receipts for later reimbursement; after age 65, non‑medical withdrawals are taxed like a traditional IRA.\n"
        );
      },
    },
    {
      id: "student_loans",
      triggers: /(student loan|repay|ib|income[- ]?based|save plan)/,
      reply: () => {
        add(links.studentaid.title, links.studentaid.url);
        return (
          "For federal student loans, compare income‑driven repayment (IDR) vs standard plans:\n\n" +
          "• IDR ties payments to your income/family size and may offer forgiveness after a set period. Recertify annually and track qualifying months.\n" +
          "• If paying aggressively, target extra payments to the highest‑rate loans first after making minimums on all.\n" +
          "• Keep documentation of employment/service if you pursue PSLF.\n"
        );
      },
    },
    {
      id: "mortgage",
      triggers: /(mortgage|house|home loan|down payment)/,
      reply: () => {
        add(links.usa_gov_mortgage.title, links.usa_gov_mortgage.url);
        return (
          "Before taking a mortgage, reality‑check affordability and risk:\n\n" +
          "• 28/36 rule: housing ≤ ~28% of gross income; total debt ≤ ~36% (lenders may allow higher but risk rises).\n" +
          "• Save for down payment, closing costs, and a move‑in buffer; keep an emergency fund intact.\n" +
          "• Compare fixed‑rate terms and total cost of ownership (taxes, insurance, HOA, maintenance ~1–2% home value/yr).\n"
        );
      },
    },
    {
      id: "college_529",
      triggers: /(529|college savings)/,
      reply: () => {
        add(links.sec_529.title, links.sec_529.url);
        return (
          "529 plans are tax‑advantaged accounts for qualified education expenses:\n\n" +
          "• Growth and withdrawals for qualified uses are generally tax‑free.\n" +
          "• Many states offer tax deductions/credits for contributions—check your state plan.\n" +
          "• Choose age‑based or low‑cost index portfolios; keep fees low to maximize growth.\n"
        );
      },
    },
    {
      id: "apr_apy",
      triggers: /(apr|apy|interest rate.*(simple|compound)|compound interest)/,
      reply: () => {
        add(links.finra_apr_apy.title, links.finra_apr_apy.url);
        add(links.investor_compound.title, links.investor_compound.url);
        return (
          "APR is the yearly borrowing rate without compounding; APY includes compounding and is best for comparing savings yields.\n\n" +
          "• For loans, compare APR across lenders; for savings, compare APY.\n" +
          "• Compound interest grows on both principal and previously earned interest—growth accelerates with time and higher APY.\n" +
          "• Keep emergency funds in a high‑yield account; invest longer‑term money for higher expected returns with appropriate risk.\n"
        );
      },
    },
    {
      id: "cd_vs_savings",
      triggers: /(cd|certificate of deposit|money market|high[- ]yield savings)/,
      reply: () => {
        add(links.investor_cd.title, links.investor_cd.url);
        add(links.fdic.title, links.fdic.url);
        return (
          "Savings/MMAs are liquid and flexible but rates can change; CDs offer higher fixed rates in exchange for locking funds.\n\n" +
          "• Use savings for emergency funds and short‑term needs; consider CDs for time‑bound goals you won’t touch.\n" +
          "• Check early‑withdrawal penalties before buying CDs and ensure bank/credit union insurance (FDIC/NCUA).\n"
        );
      },
    },
    {
      id: "fsa_vs_hsa",
      triggers: /(fsa|flexible spending|hsa vs fsa)/,
      reply: () => {
        add(links.cfpb_fsa.title, links.cfpb_fsa.url);
        add(links.healthcare_hsa.title, links.healthcare_hsa.url);
        return (
          "HSA (with a qualifying HDHP) offers triple tax benefits and rolls over indefinitely; FSAs are generally use‑it‑or‑lose‑it by plan year (some allow small carryovers).\n\n" +
          "• Max an HSA if eligible; invest once your cash cushion is set. Use FSAs for predictable expenses like prescriptions or childcare (DCFSA).\n"
        );
      },
    },
    {
      id: "credit_score_ranges",
      triggers: /(credit score range|what is a good credit score|fico range)/,
      reply: () => {
        add(links.cfpb_credit_score.title, links.cfpb_credit_score.url);
        return (
          "Typical FICO ranges: Poor <580, Fair 580–669, Good 670–739, Very Good 740–799, Exceptional 800+.\n\n" +
          "• Improve by paying on time, lowering utilization (<30%, ideally <10%), keeping older accounts open, and limiting hard inquiries.\n" +
          "• Diversify with a mix of installment and revolving credit only as needed—don’t open accounts just for the mix.\n"
        );
      },
    },
    {
      id: "dti",
      triggers: /(dti|debt[- ]to[- ]income|debt to income)/,
      reply: () => {
        add(links.cfpb_dti.title, links.cfpb_dti.url);
        return (
          "Debt‑to‑Income (DTI) = monthly debt payments ÷ gross monthly income.\n\n" +
          "• Many lenders prefer DTI ≤ ~36%; mortgages sometimes allow higher with strong compensating factors.\n" +
          "• Lower DTI by paying down revolving balances, avoiding new debt, and increasing income.\n"
        );
      },
    },
    {
      id: "rent_vs_buy",
      triggers: /(rent vs buy|rent or buy)/,
      reply: () => {
        add(links.usa_gov_mortgage.title, links.usa_gov_mortgage.url);
        return (
          "Rent vs buy depends on time horizon, local markets, and total costs:\n\n" +
          "• Buying often favors horizons ≥5–7 years; otherwise, closing costs and market swings can overwhelm.\n" +
          "• Compare all‑in costs: property taxes, insurance, HOA, upkeep (~1–2% value/yr), and opportunity cost of down payment.\n" +
          "• Maintain emergency reserves regardless of choice.\n"
        );
      },
    },
    {
      id: "retirement_savings_rate",
      triggers: /(how much.*retire|how much should i save.*retirement|retirement savings rate)/,
      reply: () => {
        add(links.investor_basics.title, links.investor_basics.url);
        return (
          "A common rule of thumb is saving ~15% of gross income toward retirement (including employer match).\n\n" +
          "• If 15% is too high now, start smaller and step up 1–2% after each raise.\n" +
          "• Maximize employer match, then use IRAs/HSA (if eligible), then taxable investing.\n" +
          "• Use age‑appropriate stock/bond mixes or a target‑date fund; revisit annually.\n"
        );
      },
    },
    {
      id: "insurance_general",
      triggers: /(insurance|policy|premium|deductible|coverage|liability)/,
      reply: () => {
        add(links.naic_consumer.title, links.naic_consumer.url);
        add(links.usa_insurance.title, links.usa_insurance.url);
        return (
          "Insurance transfers financial risk from you to the insurer. Key concepts:\n\n" +
          "• Premium: what you pay; Deductible: what you pay before the insurer; Limits: max insurer payout.\n" +
          "• Insure catastrophic risks first (health, disability, life if dependents). Keep adequate liability limits on auto/home policies.\n" +
          "• Consider higher deductibles to reduce premiums—but only if you have cash reserves.\n"
        );
      },
    },
    {
      id: "life_insurance",
      triggers: /(life insurance|term life|whole life|permanent life)/,
      reply: () => {
        add(links.naic_consumer.title, links.naic_consumer.url);
        return (
          "Term life is typically the most cost‑effective way to protect dependents:\n\n" +
          "• Pick a term that covers your highest‑need years (e.g., until mortgage payoff or kids are independent).\n" +
          "• Coverage amount often targets income replacement + debts + education needs.\n" +
          "• Permanent/whole life includes a cash‑value component but is costlier and complex—many households start with term.\n"
        );
      },
    },
    {
      id: "auto_renters_home",
      triggers: /(auto insurance|car insurance|renters insurance|homeowners insurance|home insurance)/,
      reply: () => {
        add(links.naic_consumer.title, links.naic_consumer.url);
        add(links.fdic.title, links.fdic.url);
        return (
          "Protect your vehicle and home wisely:\n\n" +
          "• Auto: meet state minimums but consider higher liability; add comprehensive/collision based on car value and risk tolerance.\n" +
          "• Renters/Home: covers belongings and liability (home adds structure). Choose deductibles you can handle and inventory major items.\n" +
          "• Bundle policies, shop periodically, and ask about discounts to manage costs.\n"
        );
      },
    },
    {
      id: "budgeting_tools",
      triggers: /(zero[- ]based|envelope budget|budget app|spreadsheet budget|mint|ynab|everydollar)/,
      reply: () => {
        add(links.cfpb_budget.title, links.cfpb_budget.url);
        return (
          "Pick a budgeting style you’ll actually maintain:\n\n" +
          "• Zero‑based: give every dollar a job; great for control.\n" +
          "• Envelopes: set category caps and stick to them (cash or digital envelopes).\n" +
          "• 50/30/20: quick, low‑maintenance split for beginners.\n" +
          "• Tools: spreadsheets, bank category tracking, or apps (YNAB/EveryDollar). Automate bills and saving to reduce friction.\n"
        );
      },
    },
    {
      id: "student_loans_save",
      triggers: /(save plan|idr save|income[- ]driven save|income driven save)/,
      reply: () => {
        add(links.studentaid_save.title, links.studentaid_save.url);
        return (
          "The SAVE plan is an income‑driven repayment (IDR) option for federal loans:\n\n" +
          "• Payments are tied to income and family size; interest subsidies can prevent balances from growing.\n" +
          "• Forgiveness may be available after a set period of qualifying payments; recertify annually.\n" +
          "• Consider SAVE if cash flow is tight, or standard/accelerated payoff if you can eliminate loans quickly.\n"
        );
      },
    },
    {
      id: "i_bonds",
      triggers: /(i[- ]?bond|series i bond|ibond|inflation bond|treasurydirect)/,
      reply: () => {
        add(links.treasurydirect_ibond.title, links.treasurydirect_ibond.url);
        return (
          "Series I Bonds protect savings from inflation:\n\n" +
          "• Rate = fixed component + inflation component (resets twice yearly). Great for long‑term, inflation‑linked savings.\n" +
          "• Hold at least 12 months; redeeming before 5 years forfeits 3 months of interest.\n" +
          "• Annual electronic purchase limit is typically $10k per person (+$5k paper via tax refund).\n"
        );
      },
    },
    {
      id: "state_taxes",
      triggers: /(state tax|state income tax|california tax|new york tax|ny tax|ca tax|nj tax|tx tax|fl tax)/,
      reply: () => {
        add(links.fta_state_tax.title, links.fta_state_tax.url);
        add(links.irs_tax.title, links.irs_tax.url);
        return (
          "State taxes depend on your residency, local rules, and credits:\n\n" +
          "• Check your state revenue site for current brackets, credits, and filing requirements (especially if you moved states).\n" +
          "• Some states have no income tax but higher sales/property taxes; consider the full picture.\n" +
          "• Remote/hybrid work can create multi‑state issues—confirm where income is sourced and taxed.\n"
        );
      },
    },
  ];

  const match = topics.find(t => t.triggers.test(q));
  if (match) {
    return { answer: match.reply(), sources };
  }

  // Light context awareness: if user says "what about fees?" after investing chat.
  const lastAssistant = [...history].reverse().find(m => m.role === "assistant");
  if (/fee|expense ratio|cost/.test(q) && lastAssistant && /invest/i.test(lastAssistant.content)) {
    add(links.investor_fees.title, links.investor_fees.url);
    return {
      answer: "Mind fees: favor low expense ratios (many index funds/ETFs are 0.03–0.15%). High fees erode compounding over time. Prefer no‑load, low‑cost funds and avoid frequent trading.",
      sources,
    };
  }

  // Small glossary for “what is …” style questions
  const glossary = [
    { key: /(apr)/, text: "APR is the yearly borrowing rate not including compounding. Use it to compare loan costs.", cite: links.finra_apr_apy },
    { key: /(apy)/, text: "APY is the yearly yield including compounding—useful for comparing savings returns.", cite: links.finra_apr_apy },
    { key: /(cd|certificate of deposit)/, text: "A CD is a time‑deposit with a fixed term and rate; early withdrawals incur penalties.", cite: links.investor_cd },
    { key: /(etf)/, text: "An ETF is a basket of securities that trades intraday like a stock, often tracking an index.", cite: links.investor_etf },
    { key: /(mutual fund)/, text: "A mutual fund pools investor money to buy a portfolio of securities; priced once per day.", cite: links.investor_mutual },
    { key: /(roth ira)/, text: "A Roth IRA uses after‑tax contributions; qualified withdrawals are tax‑free in retirement.", cite: links.irs_roth },
    { key: /(401k|401\(k\))/, text: "A 401(k) is an employer retirement plan; contribute at least to get the full employer match.", cite: links.irs_401k },
    { key: /(hsa)/, text: "An HSA allows pre‑tax saving for medical costs (with HDHP) and rolls over indefinitely.", cite: links.healthcare_hsa },
    { key: /(529)/, text: "A 529 is a tax‑advantaged education savings plan; growth is tax‑free for qualified expenses.", cite: links.sec_529 },
    { key: /(emergency fund)/, text: "An emergency fund covers 3–6 months of essential expenses; keep it liquid and safe.", cite: links.investopedia_emergency },
  ];
  const gloss = glossary.find(g => g.key.test(q));
  if (gloss) {
    add(gloss.cite.title, gloss.cite.url);
    return { answer: gloss.text, sources };
  }

  // Fallback general guidance
  add(links.cfpb_budget.title, links.cfpb_budget.url);
  add(links.investor_basics.title, links.investor_basics.url);
  return {
    answer:
      "Here’s general guidance: clarify your goal and time horizon, list constraints (income, fixed bills, debt), create a simple budget, then automate savings toward your goal. If you share more specifics (income, major expenses, debts), I can tailor a step‑by‑step plan." +
      profileNote,
    sources,
  };
}


