import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronRight, Coins, Crown, Globe, Home, Megaphone, Menu, Moon, PieChart, PlayCircle, TrendingUp, Trophy } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import io from 'socket.io-client';

// ==================================================
// 🔴 PASTE YOUR RENDER SERVER URL HERE
const SERVER_URL = "https://cricbeat-server.onrender.com"; 
// ==================================================

// --- MOCK DATA (Backups) ---
const INITIAL_MATCH = {
    id: 'm1',
    title: "Waiting for Live Data...",
    teamA: { name: "TEAM A", score: 0, wickets: 0, overs: 0, ball: 0 },
    teamB: { name: "TEAM B", score: 0, wickets: 0, overs: 0, ball: 0 },
    battingTeam: 'A',
    commentary: "Connecting to server...",
    market: { back: "-", lay: "-" },
    session: { open: "-", current: "-" }
};

export default function App() {
  useKeepAwake(); // Keeps screen ON (Vital for Live Line)

  const [activeTab, setActiveTab] = useState('home');
  const [matches, setMatches] = useState({});
  const [activeMatchId, setActiveMatchId] = useState('m1');
  const [connected, setConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userCoins, setUserCoins] = useState(1000);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Connect to Server
  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'], // Force WebSocket for mobile stability
    });

    socket.on('connect', () => {
        setConnected(true);
        console.log("Connected to CricBeat Server");
    });

    socket.on('matchesUpdate', (data) => {
      setMatches(data);
    });

    socket.on('matchUpdate', (updatedMatch) => {
      setMatches(prev => ({ ...prev, [updatedMatch.id]: updatedMatch }));
    });

    socket.on('disconnect', () => setConnected(false));

    return () => socket.disconnect();
  }, []);

  // Determine Active Match Data
  const activeMatch = matches[activeMatchId] || Object.values(matches)[0] || INITIAL_MATCH;
  const battingTeam = activeMatch.battingTeam === 'A' ? activeMatch.teamA : activeMatch.teamB;
  const bowlingTeam = activeMatch.battingTeam === 'A' ? activeMatch.teamB : activeMatch.teamA;

  // --- SUB-COMPONENTS ---

  const LiveCard = () => (
      <LinearGradient colors={darkMode ? ['#312e81', '#1e1b4b'] : ['#4f46e5', '#3730a3']} style={styles.liveCard}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchTitle}>{activeMatch.title}</Text>
            <View style={styles.liveBadge}>
                <View style={[styles.dot, { backgroundColor: connected ? '#ef4444' : 'gray' }]} />
                <Text style={styles.liveText}>{connected ? 'LIVE' : 'CONNECTING...'}</Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <View>
                <Text style={styles.teamName}>{battingTeam.name}</Text>
                <Text style={styles.score}>{battingTeam.score}/{battingTeam.wickets}</Text>
                <Text style={styles.overs}>({battingTeam.overs}.{battingTeam.ball})</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.teamName}>{bowlingTeam.name}</Text>
                <Text style={styles.score}>{bowlingTeam.score}/{bowlingTeam.wickets}</Text>
                <Text style={styles.overs}>(0.0)</Text>
            </View>
          </View>

          <Text style={styles.commentary}>🎙 {activeMatch.commentary}</Text>
      </LinearGradient>
  );

  const MarketCard = () => (
      <View style={[styles.section, !darkMode && styles.lightSection]}>
          <Text style={[styles.sectionTitle, !darkMode && {color:'#333'}]}>
              <TrendingUp size={16} color="#4f46e5"/> Market Odds
          </Text>
          <View style={styles.oddsRow}>
            <Text style={[styles.oddsTeam, !darkMode && {color:'#333'}]}>{battingTeam.name}</Text>
            <View style={styles.backBox}><Text style={styles.backText}>{activeMatch.market?.back || '-'}</Text></View>
            <View style={styles.layBox}><Text style={styles.layText}>{activeMatch.market?.lay || '-'}</Text></View>
          </View>
      </View>
  );

  const FanPulseCard = () => (
    <View style={[styles.section, !darkMode && styles.lightSection]}>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
            <Text style={[styles.sectionTitle, !darkMode && {color:'#333'}]}><PieChart size={16} color="#4f46e5"/> Fan Pulse</Text>
            <Text style={{color:'gray', fontSize:10}}>Entry: 100 Coins</Text>
        </View>
        <Text style={{color: darkMode?'#ccc':'#666', fontSize:12, marginBottom:10}}>Who will win?</Text>
        <View style={{flexDirection:'row', gap:10}}>
            <TouchableOpacity style={styles.voteBtn} onPress={() => setUserCoins(prev => prev - 100)}>
                <Text style={styles.voteText}>{activeMatch.teamA.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.voteBtn} onPress={() => setUserCoins(prev => prev - 100)}>
                <Text style={styles.voteText}>{activeMatch.teamB.name}</Text>
            </TouchableOpacity>
        </View>
    </View>
  );

  const AdPlaceholder = () => (
    <View style={styles.adBox}>
       <Megaphone size={16} color="gray" />
       <Text style={styles.adText}>SPONSORED AD</Text>
    </View>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={[styles.container, !darkMode && {backgroundColor: '#f1f5f9'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#312e81" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Menu color="white" size={24} />
          <Text style={styles.logo}>CRIC<Text style={styles.logoAccent}>BEAT</Text></Text>
          <View style={{flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(0,0,0,0.2)', padding:5, borderRadius:15}}>
             <Coins size={14} color="#fbbf24" />
             <Text style={{color:'white', fontWeight:'bold', fontSize:12}}>{userCoins}</Text>
          </View>
        </View>
      </View>

      {/* BODY */}
      <ScrollView style={styles.content}>
        {activeTab === 'home' && (
            <>
                <LiveCard />
                <MarketCard />
                <FanPulseCard />
                <AdPlaceholder />
            </>
        )}
        
        {activeTab === 'fixtures' && (
            <View style={styles.centerContent}>
                <Calendar size={48} color="gray" />
                <Text style={styles.placeholderText}>Upcoming Matches</Text>
            </View>
        )}

        {activeTab === 'more' && (
            <View style={styles.moreContainer}>
                <View style={styles.premiumBanner}>
                    <Crown size={32} color="white" />
                    <View>
                        <Text style={styles.premiumTitle}>Go Premium</Text>
                        <Text style={{color:'#e0e7ff', fontSize:10}}>Fastest odds & No ads</Text>
                    </View>
                    <ChevronRight color="white" size={20} />
                </View>
                
                <TouchableOpacity style={styles.menuItem} onPress={() => setDarkMode(!darkMode)}>
                    <View style={{flexDirection:'row', gap:10, alignItems:'center'}}>
                        <Moon size={20} color="gray" />
                        <Text style={[styles.menuText, !darkMode && {color:'black'}]}>Dark Mode</Text>
                    </View>
                    <View style={[styles.toggle, darkMode && styles.toggleOn]} />
                </TouchableOpacity>

                <View style={styles.menuItem}>
                    <View style={{flexDirection:'row', gap:10, alignItems:'center'}}>
                        <Globe size={20} color="gray" />
                        <Text style={[styles.menuText, !darkMode && {color:'black'}]}>Language</Text>
                    </View>
                    <Text style={{color:'gray'}}>English</Text>
                </View>
            </View>
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.tabBar, !darkMode && {backgroundColor: 'white', borderTopColor:'#e2e8f0'}]}>
        <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.tab}>
           <Home color={activeTab === 'home' ? '#fbbf24' : 'gray'} size={24} />
           <Text style={[styles.tabText, activeTab === 'home' && styles.tabActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('shorts')} style={styles.tab}>
           <PlayCircle color={activeTab === 'shorts' ? '#fbbf24' : 'gray'} size={24} />
           <Text style={[styles.tabText, activeTab === 'shorts' && styles.tabActive]}>Shorts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('fixtures')} style={styles.tab}>
           <Calendar color={activeTab === 'fixtures' ? '#fbbf24' : 'gray'} size={24} />
           <Text style={[styles.tabText, activeTab === 'fixtures' && styles.tabActive]}>Fixtures</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('series')} style={styles.tab}>
           <Trophy color={activeTab === 'series' ? '#fbbf24' : 'gray'} size={24} />
           <Text style={[styles.tabText, activeTab === 'series' && styles.tabActive]}>Series</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('more')} style={styles.tab}>
           <MoreHorizontal color={activeTab === 'more' ? '#fbbf24' : 'gray'} size={24} />
           <Text style={[styles.tabText, activeTab === 'more' && styles.tabActive]}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { height: 60, backgroundColor: '#312e81', justifyContent: 'center', paddingHorizontal: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: 'white', fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  logoAccent: { color: '#fbbf24' },
  content: { flex: 1 },
  liveCard: { margin: 15, padding: 20, borderRadius: 16, elevation: 5 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  matchTitle: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { color: '#ef4444', fontWeight: 'bold', fontSize: 10 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  teamName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  score: { color: 'white', fontWeight: '900', fontSize: 32 },
  overs: { color: '#cbd5e1', fontSize: 14 },
  commentary: { color: '#fbbf24', fontSize: 12, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10 },
  section: { marginHorizontal: 15, marginBottom: 15, backgroundColor: '#1e293b', borderRadius: 12, padding: 15 },
  lightSection: { backgroundColor: 'white', elevation: 2 },
  sectionTitle: { color: 'white', fontWeight: 'bold', marginBottom: 10, fontSize: 14 },
  oddsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  oddsTeam: { color: 'white', fontWeight: 'bold', flex: 1 },
  backBox: { backgroundColor: '#93c5fd', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6, width: 60, alignItems: 'center' },
  backText: { color: '#1e3a8a', fontWeight: '900' },
  layBox: { backgroundColor: '#fca5a5', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6, width: 60, alignItems: 'center' },
  layText: { color: '#7f1d1d', fontWeight: '900' },
  voteBtn: { flex: 1, backgroundColor: '#334155', padding: 10, borderRadius: 8, alignItems: 'center' },
  voteText: { color: 'white', fontWeight: 'bold' },
  adBox: { height: 50, backgroundColor: '#334155', margin: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 },
  adText: { color: '#94a3b8', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', height: 60, backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155' },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: '#94a3b8', fontSize: 10, marginTop: 4, fontWeight: '500' },
  tabActive: { color: '#fbbf24' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: 'gray', marginTop: 10 },
  moreContainer: { padding: 15 },
  premiumBanner: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor: '#4f46e5', padding: 15, borderRadius: 12, marginBottom: 20 },
  premiumTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  menuItem: { flexDirection: 'row', justifyContent:'space-between', alignItems:'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  menuText: { color: 'white', fontSize: 16 },
  toggle: { width: 30, height: 15, backgroundColor: '#334155', borderRadius: 15 },
  toggleOn: { backgroundColor: '#4f46e5' }
});