import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Lessons() {
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [quizActive, setQuizActive] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizAnswered, setQuizAnswered] = useState([])

  const lessons = [
  {
    id: 1,
    title: "Budgeting 101",
    icon: "calculator",
    description: "Learn the basics of creating and managing a budget",
    content: `Budgeting is the foundation of financial health. A budget helps you track income and expenses and plan for your goals.

Key Steps:
1. Calculate your total monthly income
2. List your fixed and variable expenses
3. Set spending limits for each category
4. Identify areas to cut costs
5. Monitor spending regularly to stay on target
6. Adjust your budget as your situation changes
7. Set short-term and long-term goals
8. Use budgeting tools to simplify tracking`,
    qna: [
      { q: "Why is budgeting important?", a: "It helps you control spending, save money, reach goals, and avoid debt." },
      { q: "What's the 50/30/20 rule?", a: "50% to needs, 30% to wants, 20% to savings/debt repayment." },
      { q: "How often should you review your budget?", a: "Ideally every month or whenever your finances change." },
      { q: "What is a fixed expense?", a: "A recurring, predictable expense (e.g., rent, subscriptions)." },
      { q: "List one way to track spending.", a: "Use a spreadsheet, budgeting app, or keep receipts." },
      { q: "Name a common budgeting mistake.", a: "Forgetting irregular expenses or underestimating costs." },
      { q: "How can budgeting reduce financial stress?", a: "It gives you a plan and helps you avoid overspending." },
      { q: "How do goals fit into a budget?", a: "Budgets let you allocate money toward your financial goals." },
    ],
    quiz: [
      { q: "What should you do first when budgeting?", options: ["Set goals", "List expenses", "Calculate income", "Cut costs"], correct: 2 },
      { q: "What's a fixed expense?", options: ["Groceries", "Rent", "Entertainment", "Vacation"], correct: 1 },
      { q: "How often should you check your budget?", options: ["Annually", "Monthly", "Never", "Every five years"], correct: 1 },
    ],
  },
  {
    id: 2,
    title: "Saving Strategies",
    icon: "piggy-bank",
    description: "Discover practical ways to save money",
    content: `Saving strengthens your financial security and helps you reach your goals faster.

Top Strategies:
1. Build an emergency fund
2. Set up automatic transfers to savings
3. Use high-yield savings accounts
4. Cut unnecessary expenses
5. Shop with a list to avoid impulse purchases
6. Plan for big expenses in advance
7. Take advantage of discounts and cash-back
8. Set clear, measurable savings goals`,
    qna: [
      { q: "How much should an emergency fund cover?", a: "3–6 months of basic living expenses." },
      { q: "What is an automatic transfer?", a: "A scheduled move from checking to savings—it makes saving effortless." },
      { q: "How can you make saving easier?", a: "Set up scheduled transfers or use round-up saving apps." },
      { q: "What's the benefit of a high-yield savings account?", a: "It pays you more interest than standard accounts." },
      { q: "Why should you avoid impulse buys?", a: "They can derail your savings goals." },
      { q: "Give a tip to save on groceries.", a: "Shop with a list and avoid shopping hungry." },
      { q: "Why is setting a specific goal important?", a: "Clear goals keep you motivated and focused." },
      { q: "How can you cut monthly expenses?", a: "Cancel unused subscriptions; shop for new insurance rates." },
    ],
    quiz: [
      { q: "What's a good emergency fund amount?", options: ["1 month", "3–6 months", "12 months", "1 year"], correct: 1 },
      { q: "Why use automatic transfers?", options: ["Pay bills", "Save without thinking", "Spend more", "Buy stocks"], correct: 1 },
      { q: "Which saves you money?", options: ["Impulse buys", "Eating out daily", "Shopping with a list", "Late fees"], correct: 2 },
    ],
  },
  {
    id: 3,
    title: "Investing Basics",
    icon: "chart-line",
    description: "Understand the essentials of investing money",
    content: `Investing lets your money grow. It involves putting funds into assets like stocks or bonds.

Essentials:
1. Start investing early—time in the market matters
2. Understand your risk tolerance
3. Diversify your portfolio to reduce risk
4. Regularly review your investments
5. Avoid emotional decisions during market swings
6. Know the difference between stocks, bonds, and funds
7. Consider low-cost index funds or ETFs
8. Stay educated and avoid "get rich quick" promises`,
    qna: [
      { q: "What is diversification?", a: "Spreading investments to reduce risk." },
      { q: "Why is early investing important?", a: "Gives your money more time to compound and grow." },
      { q: "What’s a stock?", a: "Ownership in a company." },
      { q: "What's a bond?", a: "A loan to a company or government for fixed interest." },
      { q: "Name one way to reduce investing risk.", a: "Diversify across asset types and industries." },
      { q: "What should you NOT do during a downturn?", a: "Panic sell your investments." },
      { q: "What is an ETF?", a: "Exchange-traded fund; trades like a stock, holds a bundle of assets." },
      { q: "Why avoid 'get rich quick' schemes?", a: "They are usually high-risk or scams." },
    ],
    quiz: [
      { q: "What type of asset is a bond?", options: ["Equity", "Loan", "Commodity", "Real estate"], correct: 1 },
      { q: "How can you reduce investment risk?", options: ["Invest all in one stock", "Diversify", "Panic sell", "Ignore markets"], correct: 1 },
      { q: "What’s the benefit of starting young?", options: ["Compound growth", "Lower taxes", "Instant profit", "None"], correct: 0 },
    ],
  },
  {
    id: 4,
    title: "Credit & Loans",
    icon: "credit-card",
    description: "Master the smart use of credit and loans",
    content: `Credit, when used responsibly, allows you to borrow money for purchases, but requires discipline.

Topics:
1. How credit scores work
2. Types of credit (credit cards, loans, lines of credit)
3. The cost of borrowing—interest and fees
4. How to check your credit report
5. Tips for building strong credit
6. Risks of minimum payments
7. The danger of high-interest debt
8. Steps for managing and reducing debt`,
    qna: [
      { q: "What is a credit score?", a: "A number that represents your creditworthiness to lenders." },
      { q: "How can you raise your score?", a: "Pay bills on time, keep balances low, limit new loans." },
      { q: "What’s the risk of only paying minimums?", a: "High interest costs and growing debt." },
      { q: "How do lenders use credit reports?", a: "To assess your risk when you apply for loans." },
      { q: "What’s a secured vs unsecured loan?", a: "Secured is backed by collateral; unsecured isn’t." },
      { q: "How do late payments affect you?", a: "They lower your score and make loans costlier." },
      { q: "What’s a good credit utilization ratio?", a: "Keep it below 30% of your total available credit." },
      { q: "Name a way to reduce loan interest paid.", a: "Pay more than the minimum or refinance for lower rates." },
    ],
    quiz: [
      { q: "What helps build credit?", options: ["Maxing out cards", "Missing payments", "Paying on time", "Using payday loans"], correct: 2 },
      { q: "What is a secured loan?", options: ["Backed by assets", "No collateral", "Has higher fees", "Short term"], correct: 0 },
      { q: "What hurts your credit?", options: ["Early payments", "No credit usage", "High balances", "Low balances"], correct: 2 },
    ],
  },
  {
    id: 5,
    title: "Financial Planning",
    icon: "clipboard-list",
    description: "Plan for both short and long-term financial goals",
    content: `Financial planning gives you control over your future by organizing goals and strategies.

Topics:
1. Setting SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Planning for big purchases
3. Creating an emergency fund
4. Saving for retirement and education
5. Building an investment plan
6. Managing insurance needs
7. Estate and will planning basics
8. Tracking and revising your plan regularly`,
    qna: [
      { q: "What’s a SMART goal?", a: "A goal that’s Specific, Measurable, Achievable, Relevant, and Time-bound." },
      { q: "Why is insurance important?", a: "It protects against major financial risks and losses." },
      { q: "What is estate planning?", a: "Arranging the management and distribution of your assets after death." },
      { q: "Why track your plan regularly?", a: "Adjustments help you stay on course amid life changes." },
      { q: "How early should you start retirement savings?", a: "As early as possible to maximize compound growth." },
      { q: "How can you plan for a big purchase?", a: "Break the cost into monthly savings goals." },
      { q: "Why have an emergency fund?", a: "It keeps you afloat when unexpected expenses arise." },
      { q: "How do you handle multiple goals?", a: "Prioritize needs and balance savings across priorities." },
    ],
    quiz: [
      { q: "What’s the first step in planning?", options: ["Buy insurance", "Set goals", "Borrow money", "Invest in stocks"], correct: 1 },
      { q: "What’s estate planning?", options: ["Buying a house", "Setting bills", "Asset management after death", "Tracking spending"], correct: 2 },
      { q: "When should you start retirement savings?", options: ["Later", "After 40", "Now", "Never"], correct: 2 },
    ],
  },
  {
    id: 6,
    title: "Protecting Against Fraud",
    icon: "shield-alt",
    description: "Guard your finances from scams and fraud",
    content: `Fraud protection is increasingly crucial in the digital age—know how to stay safe.

Points:
1. Recognize suspicious emails and phishing scams
2. Use strong, unique passwords
3. Monitor bank and credit accounts weekly
4. Freeze credit when not applying for loans
5. Understand identity theft warning signs
6. Set up transaction alerts
7. Protect sensitive info—never share passwords or PINs
8. Report suspicious activity promptly`,
    qna: [
      { q: "What is phishing?", a: "Fraudulent emails/texts trying to steal your information." },
      { q: "Why use unique passwords?", a: "Prevents one hack from compromising all your accounts." },
      { q: "What are transaction alerts?", a: "Notifications about account activity, catching fraud early." },
      { q: "What's a warning sign of identity theft?", a: "Unrecognized charges or credit inquiries." },
      { q: "When should you freeze your credit?", a: "If you're not planning to apply for new credit soon." },
      { q: "How often review accounts for fraud?", a: "Check accounts at least weekly." },
      { q: "Name a tip for secure online banking.", a: "Use two-factor authentication and avoid public Wi-Fi." },
      { q: "What to do if you suspect fraud?", a: "Contact your bank immediately and file a report." },
    ],
    quiz: [
      { q: "How stop phishing attacks?", options: ["Click all links", "Ignore emails", "Verify sender", "Share passwords"], correct: 2 },
      { q: "Best password practice?", options: ["Reuse passwords", "Short simple passwords", "Unique & strong passwords", "Write on paper"], correct: 2 },
      { q: "Why check accounts?", options: ["To learn banking", "Catch fraud early", "No reason", "Spend more"], correct: 1 },
    ],
  },
];


  const handleQuizAnswer = (questionIndex, selectedIndex) => {
    const lesson = lessons[selectedLesson]
    const correct = lesson.quiz[questionIndex].correct

    setQuizAnswered((prev) => {
      const updated = [...prev]
      updated[questionIndex] = selectedIndex
      return updated
    })

    if (selectedIndex === correct) {
      setQuizScore((prev) => prev + 1)
    }
  }

  const resetQuiz = () => {
    setQuizActive(false)
    setQuizScore(0)
    setQuizAnswered([])
  }

  const handleLessonSelect = (index) => {
    setSelectedLesson(index)
    resetQuiz()
  }

  if (selectedLesson !== null) {
    const lesson = lessons[selectedLesson]

    if (quizActive) {
      return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Pressable onPress={() => setSelectedLesson(null)}>
                <Ionicons name="arrow-back" size={28} color="#111" />
              </Pressable>
              <Text style={styles.headerTitle}>Knowledge Check</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>
              {quizAnswered.length === lesson.quiz.length ? (
                <View style={styles.resultsContainer}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreText}>
                      {quizScore}/{lesson.quiz.length}
                    </Text>
                  </View>
                  <Text style={styles.resultsTitle}>Great Job!</Text>
                  <Text style={styles.resultsSubtitle}>
                    You scored {Math.round((quizScore / lesson.quiz.length) * 100)}%
                  </Text>
                  <Pressable style={styles.retakeButton} onPress={resetQuiz}>
                    <Text style={styles.retakeButtonText}>Retake Quiz</Text>
                  </Pressable>
                  <Pressable style={styles.returnButton} onPress={() => setSelectedLesson(null)}>
                    <Text style={styles.returnButtonText}>Back to Lesson</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text style={styles.quizProgress}>
                    Question {quizAnswered.length + 1} of {lesson.quiz.length}
                  </Text>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${((quizAnswered.length + 1) / lesson.quiz.length) * 100}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.quizQuestion}>{lesson.quiz[quizAnswered.length].q}</Text>

                  <View style={styles.optionsContainer}>
                    {lesson.quiz[quizAnswered.length].options.map((option, index) => (
                      <Pressable
                        key={index}
                        style={[
                          styles.optionButton,
                          quizAnswered[quizAnswered.length] === index && styles.optionButtonSelected,
                        ]}
                        onPress={() => handleQuizAnswer(quizAnswered.length, index)}
                      >
                        <Text style={styles.optionText} numberOfLines={3}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {quizAnswered.length < lesson.quiz.length && (
                    <Pressable
                      style={styles.nextButton}
                      onPress={() => {
                        if (quizAnswered.length + 1 < lesson.quiz.length) {
                          // Continue to next question
                        }
                      }}
                    >
                      <Text style={styles.nextButtonText}>
                        {quizAnswered.length + 1 === lesson.quiz.length ? "Finish" : "Next"}
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      )
    }

    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => setSelectedLesson(null)}>
              <Ionicons name="arrow-back" size={28} color="#111" />
            </Pressable>
            <Text style={styles.headerTitle}>{lesson.title}</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView contentContainerStyle={styles.lessonContent} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={["#7DCD8A", "#57B6A0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lessonHeader}
            >
              <FontAwesome5 name={lesson.icon} size={48} color="#ffffffff" />
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
            </LinearGradient>

            <View style={styles.contentCard}>
              <Text style={styles.sectionTitle}>Lesson</Text>
              <Text style={styles.lessonText}>{lesson.content}</Text>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.sectionTitle}>Q&A</Text>
              {lesson.qna.map((item, index) => (
                <View key={index} style={styles.qaItem}>
                  <Text style={styles.qaQuestion}>Q: {item.q}</Text>
                  <Text style={styles.qaAnswer}>A: {item.a}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.quizButton} onPress={() => setQuizActive(true)}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.quizButtonText}>Take Knowledge Check</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Financial Lessons</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Learn and grow your financial knowledge</Text>

          {lessons.map((lesson, index) => (
            <Pressable key={lesson.id} style={styles.lessonCard} onPress={() => handleLessonSelect(index)}>
              <LinearGradient
                colors={["#7DCD8A", "#57B6A0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardIcon}
              >
                <FontAwesome5 name={lesson.icon} size={44} color="#fff" />
              </LinearGradient>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{lesson.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>{lesson.description}</Text>
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPress={() => router.push("/home")}>
            <Ionicons name="home" size={22} color="#777" />
            <Text style={styles.tabLabel}>Home</Text>
          </Pressable>
          <View style={styles.tabItem}>
            <Ionicons name="book" size={22} color="#1f6bff" />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Learn</Text>
          </View>
          <View style={styles.tabItem}>
            <Ionicons name="sparkles" size={22} color="#777" />
            <Text style={styles.tabLabel}>AI Advisor</Text>
          </View>
          <View style={styles.tabItem}>
            <Ionicons name="flag" size={22} color="#777" />
            <Text style={styles.tabLabel}>Goals</Text>
          </View>
          <Pressable style={styles.tabItem} onPress={() => router.push("/profile")}>
            <Ionicons name="person" size={22} color="#777" />
            <Text style={styles.tabLabel}>Profile</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fb",
  },
  container: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 35,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 0,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#999",
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 75,
    paddingTop: 12,
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: "#e9ecf5",
    overflow: "hidden",
    minHeight: 80,
  },
  cardIcon: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 15,
    color: "#999",
    lineHeight: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecf5",
  },
  placeholder: {
    width: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  lessonContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 16,
  },
  lessonHeader: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  lessonTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 12,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e9ecf5",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  lessonText: {
    fontSize: 17,
    color: "#555",
    lineHeight: 26,
  },
  qaItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecf5",
  },
  qaQuestion: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
    lineHeight: 24,
  },
  qaAnswer: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  quizButton: {
    backgroundColor: "#1f6bff",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  quizButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  quizContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 16,
  },
  quizProgress: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e9ecf5",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1f6bff",
    borderRadius: 6,
  },
  quizQuestion: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 24,
    lineHeight: 30,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: "#e9ecf5",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 12,
    minHeight: 60,
  },
  optionButtonSelected: {
    borderColor: "#1f6bff",
    backgroundColor: "#f0f6ff",
  },
  optionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: "#1f6bff",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  resultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1f6bff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  retakeButton: {
    backgroundColor: "#1f6bff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
    width: "80%",
    alignItems: "center",
  },
  retakeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  returnButton: {
    borderWidth: 2,
    borderColor: "#1f6bff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "80%",
    alignItems: "center",
  },
  returnButtonText: {
    color: "#1f6bff",
    fontWeight: "700",
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  tabItem: {
    alignItems: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: "#777",
  },
  tabLabelActive: {
    color: "#1f6bff",
    fontWeight: "700",
  },
  bottomSpacer: {
    height: 0,
    backgroundColor: "transparent",
  },
})
