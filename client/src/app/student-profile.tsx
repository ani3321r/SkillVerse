import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AppLayout from "../components/app-layout";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Skill = {
  id: number; name: string; category: string; description: string;
  progress: number; score: number; level: string;
  assignments_completed: number; tests_completed: number;
};

type Student = {
  id: number; name: string; email: string; college: string;
  department: string; year: string; location: string; interest: string;
  github_url?: string | null; linkedin_url?: string | null;
  portfolio_url?: string | null; avatar_url?: string | null;
};

export default function StudentProfileScreen() {
  const { id }              = useLocalSearchParams();
  const { token, userId }   = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [skills,  setSkills]  = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await apiFetch(`/api/students/${id}`, token);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setStudent(data.student);
        setSkills(data.skills);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [id, token]);

  if (loading) {
    return (
      <AppLayout>
        <View style={s.loadBox}><ActivityIndicator size="large" color="#1456F0"/></View>
      </AppLayout>
    );
  }

  if (!student) {
    return <AppLayout><Text style={s.notFound}>Student not found.</Text></AppLayout>;
  }

  const isSelf = userId === student.id;

  return (
    <AppLayout>
      {/* Profile card */}
      <View style={s.profileCard}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{student.name.charAt(0).toUpperCase()}</Text></View>
        <Text style={s.name}>{student.name}</Text>
        <Text style={s.dept}>{student.department}</Text>
        <Text style={s.detail}>🎓 {student.college}</Text>
        <Text style={s.detail}>📍 {student.location}</Text>
        <Text style={s.detail}>📚 {student.year}</Text>
        {!isSelf && (
          <Pressable
            style={s.msgBtn}
            onPress={() => router.push({ pathname: "/chat", params: { userId: String(student.id), name: student.name } })}
          >
            <Text style={s.msgTxt}>💬 Message</Text>
          </Pressable>
        )}
      </View>

      {/* About */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>About</Text>
        <Text style={s.about}>Interested in {student.interest}.</Text>
      </View>

      {/* Skills */}
      <Text style={s.skillsHeading}>Skills</Text>

      {skills.length === 0 ? (
        <View style={s.emptyCard}><Text style={s.emptyTxt}>No skills added yet.</Text></View>
      ) : (
        skills.map(sk => (
          <View key={sk.id} style={s.skillCard}>
            <View style={s.skillHead}>
              <View>
                <Text style={s.skillName}>{sk.name}</Text>
                <Text style={s.skillCat}>{sk.category}</Text>
              </View>
              <View style={s.levelBadge}><Text style={s.levelTxt}>{sk.level}</Text></View>
            </View>
            <View style={s.progBar}>
              <View style={[s.progFill, { width: `${Math.min(Math.max(Number(sk.progress) || 0, 0), 100)}%` as any }]}/>
            </View>
            <Text style={s.progTxt}>{sk.progress}% progress · {sk.assignments_completed} assignments completed</Text>
          </View>
        ))
      )}
    </AppLayout>
  );
}

const s = StyleSheet.create({
  loadBox:      { paddingVertical: 60, alignItems: "center" },
  notFound:     { fontSize: 16, color: "#64748B", textAlign: "center", marginTop: 40 },
  profileCard:  { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E8ECF2", padding: 28, alignItems: "center", marginBottom: 18, maxWidth: 680, width: "100%", alignSelf: "center" },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EAF0FE", justifyContent: "center", alignItems: "center" },
  avatarTxt:    { fontSize: 32, fontWeight: "900", color: "#1456F0" },
  name:         { marginTop: 14, fontSize: 24, fontWeight: "900", color: "#0B1D3C" },
  dept:         { marginTop: 4, fontSize: 14, color: "#64748B" },
  detail:       { marginTop: 10, fontSize: 13, color: "#475569" },
  msgBtn:       { marginTop: 18, width: "100%", backgroundColor: "#1456F0", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  msgTxt:       { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  section:      { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E8ECF2", padding: 20, marginBottom: 18, maxWidth: 680, width: "100%", alignSelf: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0B1D3C" },
  about:        { marginTop: 8, fontSize: 14, color: "#64748B" },
  skillsHeading:{ fontSize: 20, fontWeight: "900", color: "#0B1D3C", marginBottom: 14 },
  skillCard:    { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E8ECF2", padding: 18, marginBottom: 12, maxWidth: 680, width: "100%", alignSelf: "center" },
  skillHead:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skillName:    { fontSize: 16, fontWeight: "800", color: "#0B1D3C" },
  skillCat:     { marginTop: 3, fontSize: 12, color: "#64748B" },
  levelBadge:   { backgroundColor: "#EAF0FE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  levelTxt:     { color: "#1456F0", fontSize: 11, fontWeight: "700" },
  progBar:      { height: 8, backgroundColor: "#E2E8F0", borderRadius: 8, overflow: "hidden", marginTop: 14 },
  progFill:     { height: "100%", backgroundColor: "#1456F0", borderRadius: 8 },
  progTxt:      { marginTop: 6, fontSize: 12, color: "#64748B" },
  emptyCard:    { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, borderWidth: 1, borderColor: "#E8ECF2" },
  emptyTxt:     { color: "#64748B", textAlign: "center" },
});
