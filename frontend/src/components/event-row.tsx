import React from "react";
import { Text, View } from "react-native";
import { ArrowsLeftRight, Cardholder, SoccerBall } from "phosphor-react-native";

import { EventDto } from "@/src/api";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";
import { minuteLabel, teamName } from "@/src/utils/format";

type Props = {
  item: EventDto;
  homeColor?: string;
  awayColor?: string;
};

export function EventRow({ item, homeColor, awayColor }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  let icon = <SoccerBall size={20} color={colors.success} weight="fill" />;
  let title = "";
  let detailColor = colors.onSurface;

  if (item.type === "goal") {
    icon = <SoccerBall size={20} color={colors.success} weight="fill" />;
    title = `GOL · #${item.dorsal}`;
    detailColor = colors.success;
  } else if (item.type === "card") {
    const isRed = item.card_color === "red";
    icon = <Cardholder size={20} color={isRed ? colors.error : colors.warning} weight="fill" />;
    const dbl = item.reason === "double_yellow";
    title = isRed ? `ROJA${dbl ? " (2ª AM.)" : ""} · #${item.dorsal}` : `AMARILLA · #${item.dorsal}`;
    detailColor = isRed ? colors.error : colors.warning;
  } else {
    icon = <ArrowsLeftRight size={20} color={colors.info} weight="bold" />;
    title = `CAMBIO · #${item.dorsal_out}→#${item.dorsal_in}`;
    detailColor = colors.info;
  }

  const teamColor = item.team === "home" ? homeColor : awayColor;

  return (
    <View style={styles.row} testID={`event-row-${item.id}`}>
      <Text style={styles.minute}>{minuteLabel(item)}</Text>
      <View style={styles.icon}>{icon}</View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: detailColor }]} numberOfLines={1}>{title}</Text>
        <View style={styles.teamRow}>
          {teamColor ? <View style={[styles.dot, { backgroundColor: teamColor }]} /> : null}
          <Text style={styles.team}>{teamName(item.team)}</Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  minute: { fontFamily: fonts.display, fontSize: 22, color: colors.onSurface, width: 48 },
  icon: { width: 24, alignItems: "center" },
  body: { flex: 1 },
  title: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 0.3 },
  teamRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  team: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.muted },
}));
