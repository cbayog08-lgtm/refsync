import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface WatchInterfaceProps {
  category: string; // "Prebenjamín", "Benjamín", "F11", etc.
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  periodDurationMinutes: number; // Ej: 20 min para Benjamín, 45 min para F11
  onOpenGoalModal: () => void;
  onOpenCardModal: () => void;
  onRecordVoiceIncident: () => void;
  onUndoLastAction: () => void;
}

export const WatchInterface: React.FC<WatchInterfaceProps> = ({
  category,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  periodDurationMinutes,
  onOpenGoalModal,
  onOpenCardModal,
  onRecordVoiceIncident,
  onUndoLastAction,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<1 | 2>(1);
  const targetSeconds = periodDurationMinutes * 60;

  // Temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= targetSeconds) {
            setIsRunning(false);
            Alert.alert("TIEMPO CUMPLIDO", `Final de la ${currentPeriod}ª parte reglamentaria.`);
            return targetSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, targetSeconds, currentPeriod]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUndo = () => {
    Alert.alert(
      "Confirmar Deshacer",
      "¿Deseas deshacer la última acción registrada?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, Deshacer", style: "destructive", onPress: onUndoLastAction }
      ]
    );
  };

  return (
    <View style={styles.watchContainer}>
      {/* Cabecera compacta: Categoría y Parte */}
      <View style={styles.header}>
        <Text style={styles.categoryText}>{category.toUpperCase()}</Text>
        <Text style={styles.periodText}>{currentPeriod}ª PARTE</Text>
      </View>

      {/* Marcador compacto */}
      <View style={styles.scoreRow}>
        <Text style={styles.teamName}>{homeTeam.slice(0, 3).toUpperCase()}</Text>
        <Text style={styles.scoreText}>{homeScore} - {awayScore}</Text>
        <Text style={styles.teamName}>{awayTeam.slice(0, 3).toUpperCase()}</Text>
      </View>

      {/* Cronómetro grande */}
      <TouchableOpacity 
        style={styles.timerBox} 
        onPress={() => setIsRunning(!isRunning)}
        activeOpacity={0.8}
      >
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <Text style={styles.timerStatus}>{isRunning ? 'PAUSAR' : 'INICIAR'}</Text>
      </TouchableOpacity>

      {/* Botones táctiles tácticos para reloj */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#00FF66' }]} onPress={onOpenGoalModal}>
          <Text style={styles.actionBtnTextDark}>⚽ GOL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFD700' }]} onPress={onOpenCardModal}>
          <Text style={styles.actionBtnTextDark}>🟨 TARJETA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF3B30' }]} onPress={onRecordVoiceIncident}>
          <Text style={styles.actionBtnTextLight}>🎙️ VOZ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#333333' }]} onPress={handleUndo}>
          <Text style={styles.actionBtnTextLight}>↩️ DESHACER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  watchContainer: { flex: 1, backgroundColor: '#000000', padding: 10, justifyContent: 'space-between', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5 },
  categoryText: { color: '#8E8E93', fontSize: 10, fontWeight: 'bold' },
  periodText: { color: '#00FF66', fontSize: 10, fontWeight: 'bold' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  scoreText: { color: '#00FF66', fontSize: 22, fontWeight: 'bold' },
  timerBox: { backgroundColor: '#1C1C1E', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#333' },
  timerText: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  timerStatus: { color: '#8E8E93', fontSize: 10, fontWeight: '700', marginTop: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', width: '100%' },
  actionBtn: { width: '48%', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionBtnTextDark: { color: '#000000', fontSize: 12, fontWeight: 'bold' },
  actionBtnTextLight: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }
});
