import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../features/auth";
import { AuthScreen } from "../features/auth";
import {
  HomeScreen,
  CreateServerScreen,
  JoinServerScreen,
  ServerScreen,
} from "../features/servers";
import { CreateGameScreen, GameScreen } from "../features/games";

export type RootStackParamList = {
  Home: undefined;
  CreateServer: undefined;
  JoinServer: undefined;
  Server: { serverId: string; serverName: string };
  CreateGame: { serverId: string };
  Game: { gameId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0f172a" },
        }}>
        <Stack.Screen
          name='Home'
          component={HomeScreenWrapper}
        />
        <Stack.Screen
          name='CreateServer'
          component={CreateServerScreenWrapper}
        />
        <Stack.Screen
          name='JoinServer'
          component={JoinServerScreenWrapper}
        />
        <Stack.Screen
          name='Server'
          component={ServerScreenWrapper}
        />
        <Stack.Screen
          name='CreateGame'
          component={CreateGameScreenWrapper}
        />
        <Stack.Screen
          name='Game'
          component={GameScreenWrapper}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreenWrapper({
  navigation,
}: {
  navigation: { navigate: (a: string, b?: object) => void };
}) {
  return (
    <HomeScreen
      onCreateServer={() => navigation.navigate("CreateServer")}
      onJoinServer={() => navigation.navigate("JoinServer")}
      onOpenServer={(serverId, serverName) => {
        navigation.navigate("Server", { serverId, serverName });
      }}
    />
  );
}

function CreateServerScreenWrapper({
  navigation,
}: {
  navigation: { navigate: (a: string) => void; goBack: () => void };
}) {
  return (
    <CreateServerScreen
      onCreated={() => navigation.navigate("Home")}
      onBack={() => navigation.goBack()}
    />
  );
}

function JoinServerScreenWrapper({
  navigation,
}: {
  navigation: { navigate: (a: string) => void; goBack: () => void };
}) {
  return (
    <JoinServerScreen
      onJoined={() => navigation.navigate("Home")}
      onBack={() => navigation.goBack()}
    />
  );
}

function ServerScreenWrapper({
  navigation,
  route,
}: {
  navigation: { navigate: (a: string, b?: object) => void; goBack: () => void };
  route: { params: { serverId: string; serverName: string } };
}) {
  const { serverId, serverName } = route.params;
  return (
    <ServerScreen
      serverId={serverId}
      serverName={serverName}
      onCreateGame={() => navigation.navigate("CreateGame", { serverId })}
      onOpenGame={(gameId) => navigation.navigate("Game", { gameId })}
      onBack={() => navigation.goBack()}
    />
  );
}

function CreateGameScreenWrapper({
  navigation,
  route,
}: {
  navigation: { navigate: (a: string, b?: object) => void; goBack: () => void };
  route: { params: { serverId: string } };
}) {
  const { serverId } = route.params;
  return (
    <CreateGameScreen
      serverId={serverId}
      onCreated={() => navigation.goBack()}
      onBack={() => navigation.goBack()}
    />
  );
}

function GameScreenWrapper({
  navigation,
  route,
}: {
  navigation: { goBack: () => void };
  route: { params: { gameId: string } };
}) {
  const { gameId } = route.params;
  return (
    <GameScreen
      gameId={gameId}
      onBack={() => navigation.goBack()}
    />
  );
}
