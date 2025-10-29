import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Svg, G, Path, Circle } from 'react-native-svg';
import { categories as modalCategories } from './modal';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

function getCategoryColor(category) {
  switch (category.toLowerCase()) {
    case 'food':
      return '#49e4a8ff';
    case 'transport':
      return '#3c89fdff';
    case 'housing':
      return '#ff3c3cff';
    case 'entertainment':
      return '#6d34f3ff';
    case 'shopping':
      return '#fada71ff';
    case 'health':
      return '#f889f8ff';
    default:
      return '#c48220ff';
  }
}

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function Balance() {
  const params = useLocalSearchParams();
  const transactions = React.useMemo(() => {
    try { return JSON.parse(params.tx || '[]'); } catch { return []; }
  }, [params.tx]);
  const balance = parseFloat(params.balance || '0');
  const spent = parseFloat(params.spent || '0');

  const categoryTotals = React.useMemo(() => {
    const totals = {};
    for (const c of modalCategories) totals[c.label] = 0;
    for (const t of transactions) {
      if (typeof t.amount === 'number') {
        const key = t.category;
        totals[key] = (totals[key] || 0) + Math.max(0, t.amount);
      }
    }
    return totals;
  }, [transactions]);

  const totalAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  // Build arcs
  const size = 260; const r = 110; const strokeW = 36; const cx = size / 2; const cy = size / 2;
  let startAngle = 0;
  const arcs = [];
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt <= 0) return;
    let sweep = (amt / totalAmount) * 360;
    if (sweep >= 359.999) {
      // Full circle edge case: draw as two semi-circles so it renders
      const path1 = describeArc(cx, cy, r, startAngle, startAngle + 180);
      const path2 = describeArc(cx, cy, r, startAngle + 180, startAngle + 360);
      arcs.push({ cat, amt, path: path1, color: getCategoryColor(cat) });
      arcs.push({ cat, amt, path: path2, color: getCategoryColor(cat) });
      startAngle += 360;
    } else {
      const path = describeArc(cx, cy, r, startAngle, startAngle + sweep);
      arcs.push({ cat, amt, path, color: getCategoryColor(cat), start: startAngle, end: startAngle + sweep });
      startAngle += sweep;
    }
  });

  const [selected, setSelected] = React.useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.backRow}>
          <Pressable onPress={() => router.replace('/home')} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back-outline" size={22} color="#111" />
            <Text style={styles.backText}>Back to homepage</Text>
          </Pressable>
        </View>
        <Text style={styles.appTitle}>FinanceWise</Text>

        {/* Current Balance widget - same look as home */}
        <LinearGradient
          colors={["#6F8DF1", "#9F72DB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
          <View style={styles.balanceMetaRow}>
            <Text style={styles.balanceMeta}>Income: $X,XXX.XX</Text>
            <Text style={styles.balanceMeta}>Spent: ${spent.toFixed(2)}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionHeader}>All Expenses</Text>
        <View style={styles.chartWrap}>
          <Svg width={size} height={size}>
            <G>
              {arcs.map((a, i) => (
                <G key={i}>
                  <Path d={a.path} stroke={a.color} strokeWidth={strokeW} strokeLinecap="butt" fill="none" />
                  <Path d={a.path} stroke={a.color} strokeWidth={strokeW + 18} strokeOpacity={0} fill="none" onPress={() => setSelected(a.cat)} onPressIn={() => setSelected(a.cat)} />
                </G>
              ))}
              <Circle cx={cx} cy={cy} r={r - strokeW / 2} fill="#f7f8fb" />
            </G>
          </Svg>
        </View>
        {selected ? (
          <View style={styles.hintRow}>
            <View style={[styles.hintDot, { backgroundColor: getCategoryColor(selected) }]} />
            <Text style={styles.hintText}>{`${selected} $${categoryTotals[selected].toFixed(2)}`}</Text>
          </View>
        ) : (
          <Text style={styles.hint}>Tap to see details</Text>
        )}

        <View style={styles.legend}>
          {modalCategories.map((c) => (
            <View key={c.id} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: getCategoryColor(c.label) }]} />
              <Text style={styles.legendLabel}>{c.label}</Text>
              <Text style={styles.legendValue}>${(categoryTotals[c.label] || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation (same visual as home) */}
      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <Ionicons name="home" size={22} color="#1f6bff" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
        </View>
        <View style={styles.tabItem}>
          <Ionicons name="book" size={22} color="#777" />
          <Text style={styles.tabLabel}>Learn</Text>
        </View>
        <View style={styles.tabItem}>
          <Ionicons name="sparkles" size={22} color="#777" />
          <Text style={styles.tabLabel}>AI Advisor</Text>
        </View>
        <View style={styles.tabItem}>
          <Ionicons name="flag" size={22} color="#777" />
          <Text style={styles.tabLabel}>Goals</Text>
        </View>
        <View style={styles.tabItem}>
          <Ionicons name="person" size={22} color="#777" />
          <Text style={styles.tabLabel}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f8fb' },
  container: { padding: 16, alignItems: 'center' },
  appTitle: { fontSize: 35, fontWeight: '700', marginBottom: 8 },
  balanceCard: { borderRadius: 16, padding: 16, alignSelf: 'stretch', marginBottom: 12 },
  balanceLabel: { color: '#fff', fontSize: 28, fontWeight: '700' },
  balanceValue: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  balanceMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  balanceMeta: { color: '#eef2ff' },
  sectionHeader: { fontSize: 28, fontWeight: '800', marginBottom: 8, alignSelf: 'center', textAlign: 'center' },
  chartWrap: { backgroundColor: 'transparent', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 6 },
  hint: { marginTop: 8, color: '#6b7280', fontSize: 20 },
  hintRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintDot: { width: 12, height: 12, borderRadius: 6 },
  hintText: { fontSize: 20, color: '#111', fontWeight: '600' },
  legend: { marginTop: 12, alignSelf: 'stretch' },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendLabel: { flex: 1, marginLeft: 8, fontWeight: '600', color: '#111' },
  legendValue: { fontWeight: '700', color: '#111' },
  backRow: { alignSelf: 'stretch', marginBottom: 6 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#111', fontWeight: '600' },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 20,
    borderTopWidth: 3,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tabItem: { alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 11, color: '#777' },
  tabLabelActive: { color: '#1f6bff', fontWeight: '700' },
});


